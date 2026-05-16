import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import prisma from '../config/database.js';

const router = express.Router();

// Add goal to sheet
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { sheetId, thrustArea, title, description, uomType, targetValue, targetDate, weightage, isShared, isReadonly, parentGoalId } = req.body;

    const goal = await prisma.goal.create({
      data: {
        sheetId,
        thrustArea,
        title,
        description,
        uomType,
        targetValue: targetValue ? parseFloat(targetValue) : null,
        targetDate: targetDate ? new Date(targetDate) : null,
        weightage: parseInt(weightage),
        isShared: isShared || false,
        isReadonly: isReadonly || false,
        parentGoalId
      },
      include: {
        achievements: true
      }
    });

    // Create achievements for all quarters
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    for (const quarter of quarters) {
      await prisma.achievement.create({
        data: {
          goalId: goal.id,
          quarter,
          status: 'NOT_STARTED'
        }
      });
    }

    // Fetch goal with achievements
    const goalWithAchievements = await prisma.goal.findUnique({
      where: { id: goal.id },
      include: { achievements: true }
    });

    res.status(201).json(goalWithAchievements);
  } catch (error) {
    console.error('Add goal error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update goal
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { thrustArea, title, description, uomType, targetValue, targetDate, weightage } = req.body;

    const existing = await prisma.goal.findUnique({
      where: { id: req.params.id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Check if sheet is locked
    const sheet = await prisma.goalSheet.findUnique({
      where: { id: existing.sheetId }
    });

    if (sheet.status === 'LOCKED' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Goal sheet is locked' });
    }

    const updated = await prisma.goal.update({
      where: { id: req.params.id },
      data: {
        thrustArea,
        title,
        description,
        uomType,
        targetValue: targetValue ? parseFloat(targetValue) : null,
        targetDate: targetDate ? new Date(targetDate) : null,
        weightage: weightage ? parseInt(weightage) : undefined
      },
      include: {
        achievements: true
      }
    });

    // Create audit log for changes
    const changes = [];
    if (existing.thrustArea !== thrustArea) changes.push({ field: 'thrustArea', old: existing.thrustArea, new: thrustArea });
    if (existing.title !== title) changes.push({ field: 'title', old: existing.title, new: title });
    if (existing.targetValue !== targetValue) changes.push({ field: 'targetValue', old: existing.targetValue, new: targetValue });
    if (existing.weightage !== weightage) changes.push({ field: 'weightage', old: existing.weightage, new: weightage });

    for (const change of changes) {
      await prisma.auditLog.create({
        data: {
          entityType: 'goal',
          entityId: req.params.id,
          actorId: req.user.id,
          actorName: req.user.name,
          action: 'update',
          fieldName: change.field,
          oldValue: String(change.old),
          newValue: String(change.new)
        }
      });
    }

    res.json(updated);
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete goal
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const goal = await prisma.goal.findUnique({
      where: { id: req.params.id }
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Check if sheet is locked
    const sheet = await prisma.goalSheet.findUnique({
      where: { id: goal.sheetId }
    });

    if (sheet.status === 'LOCKED' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Goal sheet is locked' });
    }

    await prisma.goal.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
