import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import prisma from '../config/database.js';

const router = express.Router();

// Get all escalations
router.get('/', authenticateToken, authorizeRoles('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const escalations = await prisma.escalation.findMany({
      where: { resolved: false },
      orderBy: { createdAt: 'desc' }
    });

    res.json(escalations);
  } catch (error) {
    console.error('Get escalations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Resolve escalation
router.put('/:id/resolve', authenticateToken, authorizeRoles('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const escalation = await prisma.escalation.update({
      where: { id: req.params.id },
      data: { resolved: true }
    });

    res.json(escalation);
  } catch (error) {
    console.error('Resolve escalation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
