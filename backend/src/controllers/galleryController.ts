import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { asyncHandler } from '../middleware/asyncHandler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/gallery');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'gallery-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept images only
  const allowedTypes = /jpeg|jpg|png|gif|webp|avif|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

export const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

// @desc    Get all gallery images
// @route   GET /api/gallery
// @access  Public
export const getAllGalleryImages = asyncHandler(async (req: Request, res: Response) => {
  const { published } = req.query;

  const where = published === 'true' ? { isPublished: true } : {};

  const images = await prisma.gallery.findMany({
    where,
    orderBy: [
      { order: 'asc' },
      { createdAt: 'desc' }
    ]
  });

  res.json({
    success: true,
    count: images.length,
    data: images
  });
});

// @desc    Get single gallery image
// @route   GET /api/gallery/:id
// @access  Public
export const getGalleryImage = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const image = await prisma.gallery.findUnique({
    where: { id: id as string }
  });

  if (!image) {
    res.status(404).json({
      success: false,
      message: 'Gallery image not found'
    });
    return;
  }

  res.json({
    success: true,
    data: image
  });
});

// @desc    Create gallery image
// @route   POST /api/gallery
// @access  Private/Admin
export const createGalleryImage = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, order, isPublished } = req.body;
  const file = req.file;

  if (!file) {
    res.status(400).json({
      success: false,
      message: 'Please upload an image'
    });
    return;
  }

  if (!title) {
    res.status(400).json({
      success: false,
      message: 'Please provide a title'
    });
    return;
  }

  // Create relative URL for the image
  const imageUrl = `/uploads/gallery/${file.filename}`;

  const image = await prisma.gallery.create({
    data: {
      title,
      description: description || null,
      imageUrl,
      imageKey: file.filename,
      order: order ? parseInt(order) : 0,
      isPublished: isPublished === 'true' || isPublished === true
    }
  });

  res.status(201).json({
    success: true,
    message: 'Gallery image created successfully',
    data: image
  });
});

// @desc    Update gallery image
// @route   PUT /api/gallery/:id
// @access  Private/Admin
export const updateGalleryImage = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, order, isPublished } = req.body;
  const file = req.file;

  const existingImage = await prisma.gallery.findUnique({
    where: { id: id as string }
  });

  if (!existingImage) {
    res.status(404).json({
      success: false,
      message: 'Gallery image not found'
    });
    return;
  }

  const updateData: any = {
    title: title || existingImage.title,
    description: description !== undefined ? description : existingImage.description,
    order: order !== undefined ? parseInt(order) : existingImage.order,
    isPublished: isPublished !== undefined ? (isPublished === 'true' || isPublished === true) : existingImage.isPublished
  };

  // If new file is uploaded, delete old file and update image URL
  if (file) {
    // Delete old file
    if (existingImage.imageKey) {
      const oldFilePath = path.join(__dirname, '../../uploads/gallery', existingImage.imageKey);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    updateData.imageUrl = `/uploads/gallery/${file.filename}`;
    updateData.imageKey = file.filename;
  }

  const updatedImage = await prisma.gallery.update({
    where: { id: id as string },
    data: updateData
  });

  res.json({
    success: true,
    message: 'Gallery image updated successfully',
    data: updatedImage
  });
});

// @desc    Delete gallery image
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
export const deleteGalleryImage = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const image = await prisma.gallery.findUnique({
    where: { id: id as string }
  });

  if (!image) {
    res.status(404).json({
      success: false,
      message: 'Gallery image not found'
    });
    return;
  }

  // Delete file from filesystem
  if (image.imageKey) {
    const filePath = path.join(__dirname, '../../uploads/gallery', image.imageKey);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  await prisma.gallery.delete({
    where: { id: id as string }
  });

  res.json({
    success: true,
    message: 'Gallery image deleted successfully'
  });
});

// @desc    Reorder gallery images
// @route   PUT /api/gallery/reorder
// @access  Private/Admin
export const reorderGalleryImages = asyncHandler(async (req: Request, res: Response) => {
  const { imageOrders } = req.body; // Array of { id, order }

  if (!Array.isArray(imageOrders)) {
    res.status(400).json({
      success: false,
      message: 'imageOrders must be an array'
    });
    return;
  }

  // Update all images in a transaction
  await prisma.$transaction(
    imageOrders.map(({ id, order }: { id: string; order: number }) =>
      prisma.gallery.update({
        where: { id },
        data: { order }
      })
    )
  );

  res.json({
    success: true,
    message: 'Gallery images reordered successfully'
  });
});
