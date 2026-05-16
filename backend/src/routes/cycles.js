import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import prisma from '../config/database.js';

const router = express.Router();

// Get all cycles
router.get('/', authenticateToken, async (req, res) => {
  try {
    const cycles = await prisma.goalCycle.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json(cycles);
  } catch (error) {
    console.error('Get cycles error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get active cycle
router.get('/active', authenticateToken, async (req, res) => {
  try {
    const cycle = await prisma.goalCycle.findFirst({
      where: { isActive: true }
    });

    if (!cycle) {
      return res.status(404).json({ error: 'No active cycle found' });
    }

    res.json(cycle);
  } catch (error) {
    console.error('Get active cycle error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create cycle (admin only)
router.post('/', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { name, phase, startDate, endDate, submissionDeadline } = req.body;

    const cycle = await prisma.goalCycle.create({
      data: {
        name,
        phase,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        submissionDeadline: new Date(submissionDeadline)
      }
    });

    res.status(201).json(cycle);
  } catch (error) {
    console.error('Create cycle error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update cycle (admin only)
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { name, phase, startDate, endDate, submissionDeadline, isActive } = req.body;

    const cycle = await prisma.goalCycle.update({
      where: { id: req.params.id },
      data: {
        name,
        phase,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        submissionDeadline: submissionDeadline ? new Date(submissionDeadline) : undefined,
        isActive
      }
    });

    res.json(cycle);
  } catch (error) {
    console.error('Update cycle error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
