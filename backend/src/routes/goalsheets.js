import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import prisma from '../config/database.js';
import { validateWeightage } from '../utils/calculation.js';

const router = express.Router();

// Get all goal sheets (filtered by role)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let sheets;
    const { role, id } = req.user;

    if (role === 'ADMIN') {
      sheets = await prisma.goalSheet.findMany({
        include: {
          goals: {
            include: {
              achievements: true
            }
          },
          comments: {
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (role === 'MANAGER') {
      // Get manager's direct reports
      const employees = await prisma.user.findMany({
        where: { managerId: id },
        select: { id: true }
      });
      const employeeIds = employees.map(e => e.id);

      sheets = await prisma.goalSheet.findMany({
        where: { employeeId: { in: employeeIds } },
        include: {
          goals: {
            include: {
              achievements: true
            }
          },
          comments: {
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Employee - only their own sheets
      sheets = await prisma.goalSheet.findMany({
        where: { employeeId: id },
        include: {
          goals: {
            include: {
              achievements: true
            }
          },
          comments: {
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    res.json(sheets);
  } catch (error) {
    console.error('Get goal sheets error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get goal sheet by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const sheet = await prisma.goalSheet.findUnique({
      where: { id: req.params.id },
      include: {
        goals: {
          include: {
            achievements: true
          }
        },
        comments: {
          orderBy: { createdAt: 'desc' }
        },
        cycle: true
      }
    });

    if (!sheet) {
      return res.status(404).json({ error: 'Goal sheet not found' });
    }

    // Check access permissions
    const { role, id } = req.user;
    if (role === 'EMPLOYEE' && sheet.employeeId !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (role === 'MANAGER' && sheet.employeeId !== id) {
      // Check if this employee reports to the manager
      const employee = await prisma.user.findUnique({
        where: { id: sheet.employeeId }
      });
      if (employee.managerId !== id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    res.json(sheet);
  } catch (error) {
    console.error('Get goal sheet error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create goal sheet
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { cycleId } = req.body;
    const { id, name, department } = req.user;

    // Check if cycle exists
    const cycle = await prisma.goalCycle.findUnique({
      where: { id: cycleId }
    });

    if (!cycle) {
      return res.status(404).json({ error: 'Goal cycle not found' });
    }

    const sheet = await prisma.goalSheet.create({
      data: {
        employeeId: id,
        employeeName: name,
        department,
        cycleId,
        status: 'DRAFT'
      },
      include: {
        goals: true,
        comments: true
      }
    });

    res.status(201).json(sheet);
  } catch (error) {
    console.error('Create goal sheet error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit goal sheet
router.post('/:id/submit', authenticateToken, async (req, res) => {
  try {
    const sheet = await prisma.goalSheet.findUnique({
      where: { id: req.params.id },
      include: { goals: true }
    });

    if (!sheet) {
      return res.status(404).json({ error: 'Goal sheet not found' });
    }

    // Check ownership
    if (sheet.employeeId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate weightage
    const validation = validateWeightage(sheet.goals);
    if (!validation.valid) {
      return res.status(400).json({ error: 'Validation failed', details: validation.errors });
    }

    const updated = await prisma.goalSheet.update({
      where: { id: req.params.id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date()
      },
      include: {
        goals: {
          include: { achievements: true }
        }
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'goal_sheet',
        entityId: req.params.id,
        actorId: req.user.id,
        actorName: req.user.name,
        action: 'submit'
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Submit goal sheet error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve goal sheet (manager/admin)
router.post('/:id/approve', authenticateToken, authorizeRoles('MANAGER', 'ADMIN'), async (req, res) => {
  try {
    const sheet = await prisma.goalSheet.findUnique({
      where: { id: req.params.id }
    });

    if (!sheet) {
      return res.status(404).json({ error: 'Goal sheet not found' });
    }

    if (sheet.status !== 'SUBMITTED') {
      return res.status(400).json({ error: 'Goal sheet must be submitted first' });
    }

    const updated = await prisma.goalSheet.update({
      where: { id: req.params.id },
      data: {
        status: 'LOCKED',
        approvedAt: new Date(),
        approvedBy: req.user.name
      },
      include: {
        goals: {
          include: { achievements: true }
        }
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'goal_sheet',
        entityId: req.params.id,
        actorId: req.user.id,
        actorName: req.user.name,
        action: 'approve'
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: sheet.employeeId,
        type: 'approval',
        title: 'Goals Approved',
        message: `Your goal sheet has been approved by ${req.user.name}.`
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Approve goal sheet error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reject goal sheet (manager/admin)
router.post('/:id/reject', authenticateToken, authorizeRoles('MANAGER', 'ADMIN'), async (req, res) => {
  try {
    const { comment } = req.body;

    const sheet = await prisma.goalSheet.findUnique({
      where: { id: req.params.id }
    });

    if (!sheet) {
      return res.status(404).json({ error: 'Goal sheet not found' });
    }

    if (sheet.status !== 'SUBMITTED') {
      return res.status(400).json({ error: 'Goal sheet must be submitted first' });
    }

    const updated = await prisma.goalSheet.update({
      where: { id: req.params.id },
      data: {
        status: 'REJECTED'
      },
      include: {
        goals: {
          include: { achievements: true }
        }
      }
    });

    // Add comment
    await prisma.comment.create({
      data: {
        goalSheetId: req.params.id,
        authorId: req.user.id,
        authorName: req.user.name,
        content: comment
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'goal_sheet',
        entityId: req.params.id,
        actorId: req.user.id,
        actorName: req.user.name,
        action: 'reject'
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: sheet.employeeId,
        type: 'rejection',
        title: 'Goals Returned for Rework',
        message: `Your goal sheet has been returned for rework by ${req.user.name}.`
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Reject goal sheet error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Unlock goal sheet (admin only)
router.post('/:id/unlock', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const updated = await prisma.goalSheet.update({
      where: { id: req.params.id },
      data: {
        status: 'SUBMITTED'
      },
      include: {
        goals: {
          include: { achievements: true }
        }
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'goal_sheet',
        entityId: req.params.id,
        actorId: req.user.id,
        actorName: req.user.name,
        action: 'unlock'
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Unlock goal sheet error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
