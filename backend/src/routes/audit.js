import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import prisma from '../config/database.js';

const router = express.Router();

// Get audit logs (admin only)
router.get('/', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { entityType, entityId, limit = 100 } = req.query;

    const where = {};
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });

    res.json(logs);
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
