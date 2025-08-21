// backend/Routes/reviewRoutes.js
import express from 'express';
import {
    createReview,
    getDoctorReviews,
    getPatientReviews,
    updateReview,
    deleteReview,
    getReviewableAppointments
} from '../Controllers/reviewController.js';

import { authenticatePatient } from '../Middleware/authMiddleware.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Validation middleware for reviews
const validateReview = [
    body('doctorId')
        .notEmpty()
        .withMessage('Doctor ID is required')
        .isUUID()
        .withMessage('Invalid doctor ID format'),
    
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be an integer between 1 and 5'),
    
    body('comment')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Comment must not exceed 1000 characters'),
    
    body('isAnonymous')
        .optional()
        .isBoolean()
        .withMessage('isAnonymous must be a boolean'),
    
    body('appointmentId')
        .optional()
        .isUUID()
        .withMessage('Invalid appointment ID format')
];

const validateReviewUpdate = [
    body('rating')
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be an integer between 1 and 5'),
    
    body('comment')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Comment must not exceed 1000 characters'),
    
    body('isAnonymous')
        .optional()
        .isBoolean()
        .withMessage('isAnonymous must be a boolean')
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
 *   name: Reviews
 *   description: Doctor review and rating system
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ReviewCreate:
 *       type: object
 *       required:
 *         - doctorId
 *         - rating
 *       properties:
 *         doctorId:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         appointmentId:
 *           type: string
 *           format: uuid
 *           description: "Optional - ID of the appointment being reviewed"
 *           example: "550e8400-e29b-41d4-a716-446655440001"
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           example: 5
 *         comment:
 *           type: string
 *           maxLength: 1000
 *           example: "Dr. Benali was very professional and helpful. Highly recommended!"
 *         isAnonymous:
 *           type: boolean
 *           default: false
 *           example: false
 *     
 *     Review:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         comment:
 *           type: string
 *           nullable: true
 *         isAnonymous:
 *           type: boolean
 *         reviewerName:
 *           type: string
 *           example: "Ahmed M."
 *         createdAt:
 *           type: string
 *           format: date-time
 *         timeAgo:
 *           type: string
 *           example: "Il y a 2 jours"
 *     
 *     ReviewStats:
 *       type: object
 *       properties:
 *         totalReviews:
 *           type: integer
 *           example: 25
 *         averageRating:
 *           type: number
 *           example: 4.3
 *         ratingDistribution:
 *           type: object
 *           properties:
 *             "1":
 *               type: integer
 *               example: 1
 *             "2":
 *               type: integer
 *               example: 2
 *             "3":
 *               type: integer
 *               example: 3
 *             "4":
 *               type: integer
 *               example: 8
 *             "5":
 *               type: integer
 *               example: 11
 *     
 *     ReviewableAppointment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         date:
 *           type: string
 *           format: date
 *         time:
 *           type: string
 *           format: time
 *         doctor:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             name:
 *               type: string
 *               example: "Dr. Ahmed Benali"
 *             specialty:
 *               type: string
 *               example: "Dermatologie"
 */

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Create a new review
 *     description: Creates a review for a doctor after a completed appointment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewCreate'
 *           example:
 *             doctorId: "550e8400-e29b-41d4-a716-446655440000"
 *             appointmentId: "550e8400-e29b-41d4-a716-446655440001"
 *             rating: 5
 *             comment: "Excellent doctor, very professional and caring"
 *             isAnonymous: false
 *     responses:
 *       201:
 *         description: Review created successfully
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
 *                   example: "Review created successfully"
 *                 review:
 *                   $ref: '#/components/schemas/Review'
 *       400:
 *         description: Invalid input or cannot review this doctor/appointment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   enum:
 *                     - "Doctor ID and rating are required"
 *                     - "Rating must be between 1 and 5"
 *                     - "You can only review completed appointments"
 *                     - "You can only review doctors you have had appointments with"
 *       409:
 *         description: Review already exists for this appointment
 *       404:
 *         description: Doctor or appointment not found
 *       401:
 *         description: Authentication required
 */

/**
 * @swagger
 * /api/reviews/doctor/{doctorId}:
 *   get:
 *     tags: [Reviews]
 *     summary: Get reviews for a specific doctor
 *     description: Retrieves all reviews for a doctor with statistics and pagination
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Doctor's unique identifier
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of reviews per page
 *       - in: query
 *         name: rating_filter
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Filter by specific rating
 *       - in: query
 *         name: sort_by
 *         required: false
 *         schema:
 *           type: string
 *           enum: [created_at, rating]
 *           default: created_at
 *       - in: query
 *         name: sort_order
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Doctor reviews retrieved successfully
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
 *                   example: "Doctor reviews retrieved successfully"
 *                 doctorName:
 *                   type: string
 *                   example: "Dr. Ahmed Benali"
 *                 reviews:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Review'
 *                 statistics:
 *                   $ref: '#/components/schemas/ReviewStats'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       404:
 *         description: Doctor not found
 */

/**
 * @swagger
 * /api/reviews/my-reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: Get patient's reviews
 *     description: Retrieves all reviews written by the authenticated patient
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Patient reviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 reviews:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Review'
 *                       - type: object
 *                         properties:
 *                           doctor:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               specialty:
 *                                 type: string
 *                           appointmentDate:
 *                             type: string
 *                             format: date
 *       401:
 *         description: Authentication required
 */

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   patch:
 *     tags: [Reviews]
 *     summary: Update a review
 *     description: Updates a review written by the authenticated patient
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
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *                 maxLength: 1000
 *               isAnonymous:
 *                 type: boolean
 *           example:
 *             rating: 4
 *             comment: "Updated review - good experience overall"
 *             isAnonymous: false
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Review not found or doesn't belong to patient
 *       401:
 *         description: Authentication required
 *   delete:
 *     tags: [Reviews]
 *     summary: Delete a review
 *     description: Deletes a review written by the authenticated patient
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       404:
 *         description: Review not found or doesn't belong to patient
 *       401:
 *         description: Authentication required
 */

/**
 * @swagger
 * /api/reviews/reviewable-appointments:
 *   get:
 *     tags: [Reviews]
 *     summary: Get appointments eligible for review
 *     description: Retrieves completed appointments that haven't been reviewed yet
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reviewable appointments retrieved successfully
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
 *                   example: "Reviewable appointments retrieved successfully"
 *                 appointments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ReviewableAppointment'
 *                 count:
 *                   type: integer
 *                   example: 3
 *       401:
 *         description: Authentication required
 */

// Routes
router.post('/', validateReview, handleValidationErrors, authenticatePatient, createReview);
router.get('/doctor/:doctorId', getDoctorReviews);
router.get('/my-reviews', authenticatePatient, getPatientReviews);
router.patch('/:reviewId', validateReviewUpdate, handleValidationErrors, authenticatePatient, updateReview);
router.delete('/:reviewId', authenticatePatient, deleteReview);
router.get('/reviewable-appointments', authenticatePatient, getReviewableAppointments);

export default router;