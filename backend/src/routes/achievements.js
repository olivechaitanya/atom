import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import prisma from '../config/database.js';

const router = express.Router();

// Update achievement
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { goalId, quarter, actualValue, status, notes } = req.body;

    const achievement = await prisma.achievement.findUnique({
      where: {
        goalId_quarter: {
          goalId,
          quarter
        }
      },
      include: {
        goal: {
          include: {
            sheet: true
          }
        }
      }
    });

    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    // Check if locked
    if (achievement.isLocked && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Achievement is locked' });
    }

    // Check ownership (employee can only update their own achievements)
    if (req.user.role === 'EMPLOYEE' && achievement.goal.sheet.employeeId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updated = await prisma.achievement.update({
      where: {
        goalId_quarter: {
          goalId,
          quarter
        }
      },
      data: {
        actualValue: actualValue ? parseFloat(actualValue) : null,
        status,
        notes,
        submittedAt: new Date()
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'achievement',
        entityId: achievement.id,
        actorId: req.user.id,
        actorName: req.user.name,
        action: 'update',
        fieldName: 'actualValue',
        oldValue: String(achievement.actualValue || ''),
        newValue: String(actualValue || '')
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Update achievement error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
