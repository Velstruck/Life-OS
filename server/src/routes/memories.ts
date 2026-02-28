import express, { Response } from 'express';
import Memory from '../models/Memory.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { upload, cloudinary } from '../utils/cloudinary.js';

const router = express.Router();

// POST /api/memories – create a memory with optional images
router.post(
  '/',
  authenticateToken,
  upload.array('images', 6), // max 6 images per post
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { title, content, category } = req.body;

      if (!content) {
        res.status(400).json({ error: 'Content is required' });
        return;
      }

      // Multer-cloudinary puts uploaded file info on req.files
      const files = (req.files as Express.Multer.File[]) || [];
      const imageUrls = files.map((f: any) => f.path || f.secure_url || f.url);

      const memory = new Memory({
        userId,
        title: title || '',
        content,
        images: imageUrls,
        category: category || 'memory',
      });

      await memory.save();

      res.status(201).json({
        memory: {
          id: memory._id,
          userId: memory.userId,
          title: memory.title,
          content: memory.content,
          images: memory.images,
          category: memory.category,
          createdAt: memory.createdAt,
          updatedAt: memory.updatedAt,
        },
      });
    } catch (error) {
      console.error('Create memory error:', error);
      res.status(500).json({ error: 'Failed to create memory' });
    }
  }
);

// GET /api/memories – list all memories for the authenticated user, newest first
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [memories, total] = await Promise.all([
      Memory.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Memory.countDocuments({ userId }),
    ]);

    res.json({
      memories: memories.map((m) => ({
        id: m._id,
        userId: m.userId,
        title: m.title,
        content: m.content,
        images: m.images,
        category: m.category,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get memories error:', error);
    res.status(500).json({ error: 'Failed to fetch memories' });
  }
});

// DELETE /api/memories/:id
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const memory = await Memory.findOne({ _id: req.params.id, userId });

    if (!memory) {
      res.status(404).json({ error: 'Memory not found' });
      return;
    }

    // Remove images from Cloudinary
    for (const url of memory.images) {
      try {
        // Extract public_id from URL  e.g. life-os/memories/abc123
        const parts = url.split('/');
        const folderIdx = parts.indexOf('life-os');
        if (folderIdx !== -1) {
          const publicId = parts
            .slice(folderIdx)
            .join('/')
            .replace(/\.[^/.]+$/, ''); // strip extension
          await cloudinary.uploader.destroy(publicId);
        }
      } catch {
        // best-effort cleanup
      }
    }

    await memory.deleteOne();
    res.json({ message: 'Memory deleted' });
  } catch (error) {
    console.error('Delete memory error:', error);
    res.status(500).json({ error: 'Failed to delete memory' });
  }
});

export default router;
