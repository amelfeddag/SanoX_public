// backend/Routes/notificationRoutes.js
import express from 'express';
import {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getNotificationStats
} from '../Controllers/notificationController.js';

import authenticateUser from '../Middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notification management system
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         title:
 *           type: string
 *           example: "Rendez-vous confirmé"
 *         message:
 *           type: string
 *           example: "Votre rendez-vous du 25/12/2024 à 14:30 a été confirmé"
 *         type:
 *           type: string
 *           enum: [appointment_request, appointment_confirmed, appointment_cancelled, reminder, general]
 *           example: "appointment_confirmed"
 *         isRead:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *         relatedAppointment:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             date:
 *               type: string
 *               format: date
 *             time:
 *               type: string
 *               format: time
 *             status:
 *               type: string
 *     
 *     NotificationStats:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 25
 *         unread:
 *           type: integer
 *           example: 5
 *         read:
 *           type: integer
 *           example: 20
 *         byType:
 *           type: object
 *           properties:
 *             appointment_request:
 *               type: integer
 *               example: 8
 *             appointment_confirmed:
 *               type: integer
 *               example: 7
 *             appointment_cancelled:
 *               type: integer
 *               example: 2
 *             general:
 *               type: integer
 *               example: 8
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get user notifications
 *     description: Retrieves all notifications for the authenticated user with pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of notifications per page
 *         example: 20
 *       - in: query
 *         name: unread_only
 *         required: false
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Return only unread notifications
 *         example: true
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Notifications retrieved successfully"
 *                 notifications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                 unreadCount:
 *                   type: integer
 *                   example: 5
 *       401:
 *         description: Authentication required
 */

/**
 * @swagger
 * /api/notifications/{notificationId}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark notification as read
 *     description: Marks a specific notification as read
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Notification ID to mark as read
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Notification marked as read"
 *       404:
 *         description: Notification not found
 *       401:
 *         description: Authentication required
 */

/**
 * @swagger
 * /api/notifications/mark-all-read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 *     description: Marks all unread notifications as read for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "All notifications marked as read"
 *       401:
 *         description: Authentication required
 */

/**
 * @swagger
 * /api/notifications/{notificationId}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete notification
 *     description: Permanently deletes a notification
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Notification ID to delete
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Notification deleted successfully"
 *       404:
 *         description: Notification not found
 *       401:
 *         description: Authentication required
 */

/**
 * @swagger
 * /api/notifications/stats:
 *   get:
 *     tags: [Notifications]
 *     summary: Get notification statistics
 *     description: Retrieves notification statistics for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Notification statistics retrieved successfully"
 *                 stats:
 *                   $ref: '#/components/schemas/NotificationStats'
 *       401:
 *         description: Authentication required
 */

// Routes
router.get('/', authenticateUser, getUserNotifications);
router.patch('/:notificationId/read', authenticateUser, markNotificationAsRead);
router.patch('/mark-all-read', authenticateUser, markAllNotificationsAsRead);
router.delete('/:notificationId', authenticateUser, deleteNotification);
router.get('/stats', authenticateUser, getNotificationStats);

export default router;