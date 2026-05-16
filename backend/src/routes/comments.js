import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import prisma from '../config/database.js';

const router = express.Router();

// Add comment to goal sheet
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { goalSheetId, goalId, content } = req.body;

    const comment = await prisma.comment.create({
      data: {
        goalSheetId,
        goalId,
        authorId: req.user.id,
        authorName: req.user.name,
        content
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
