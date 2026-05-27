import express from 'express';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notificationController';

const router = express.Router();

// Get all notifications for a user
router.get('/user/:userId', getUserNotifications);

// Mark notification as read
router.patch('/:id/read', markAsRead);

// Mark all notifications as read for a user
router.patch('/user/:userId/read-all', markAllAsRead);

// Delete a notification
router.delete('/:id', deleteNotification);

export default router;
