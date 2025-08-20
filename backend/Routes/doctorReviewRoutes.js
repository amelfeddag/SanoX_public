import express from 'express';
import {
    getMyReviews,
    getReviewsSummary,
    respondToReview
} from '../Controllers/doctorReviewController.js';
import { authenticateDoctor } from '../Middleware/authMiddleware.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Validation middleware for doctor response
const validateDoctorResponse = [
    body('response')
        .notEmpty()
        .withMessage('Response is required')
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Response must not exceed 1000 characters')
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()[0].msg
        });
    }
    next();
};

/**
 * @swagger
 * tags:
 *   name: Doctor Reviews
 *   description: Doctor review management endpoints
 */

/**
 * @swagger
 * /api/doctor/reviews:
 *   get:
 *     tags: [Doctor Reviews]
 *     summary: Get reviews for authenticated doctor
 *     description: Retrieves all reviews for the authenticated doctor with filtering and statistics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: rating_filter
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [created_at, rating]
 *           default: created_at
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *       401:
 *         description: Doctor authentication required
 */

/**
 * @swagger
 * /api/doctor/reviews/summary:
 *   get:
 *     tags: [Doctor Reviews]
 *     summary: Get review summary for dashboard
 *     description: Retrieves review statistics and trends for the authenticated doctor
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Review summary retrieved successfully
 *       401:
 *         description: Doctor authentication required
 */

/**
 * @swagger
 * /api/doctor/reviews/{reviewId}/respond:
 *   post:
 *     tags: [Doctor Reviews]
 *     summary: Respond to a review
 *     description: Allows doctor to respond to a patient review
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - response
 *             properties:
 *               response:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "Thank you for your feedback. I'm glad I could help with your treatment."
 *     responses:
 *       200:
 *         description: Response added successfully
 *       400:
 *         description: Invalid response data
 *       404:
 *         description: Review not found
 *       401:
 *         description: Doctor authentication required
 */

// Routes
router.get('/', authenticateDoctor, getMyReviews);
router.get('/summary', authenticateDoctor, getReviewsSummary);
router.post('/:reviewId/respond', validateDoctorResponse, handleValidationErrors, authenticateDoctor, respondToReview);

export default router;