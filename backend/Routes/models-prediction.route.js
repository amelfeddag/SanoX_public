import express from 'express';
import { generateBusinessPlan, chatBot } from '../Controllers/models-predictions.controller.js';
import authenticateUser from '../Middleware/authMiddleware.js';

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: AI/ML Services
 *   description: AI-powered health analysis and chatbot services
 */

/**
 * @swagger
 * /api/models/chat-bot:
 *   post:
 *     summary: Chat with AI health assistant
 *     tags: [AI/ML Services]
 *     description: Send a message to the AI health assistant for medical advice and information
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: User's health-related question or message
 *             example:
 *               message: "What are the symptoms of diabetes?"
 *     responses:
 *       200:
 *         description: AI response received
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   description: AI assistant's response
 *             example:
 *               result: "Common symptoms of diabetes include frequent urination, excessive thirst, unexplained weight loss..."
 *       500:
 *         description: Error communicating with AI service
 */

/**
 * @swagger
 * /api/models/generate-business-plan:
 *   post:
 *     summary: Generate health analysis plan
 *     tags: [AI/ML Services]
 *     security:
 *       - bearerAuth: []
 *     description: Generate a comprehensive health analysis and care plan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient_id
 *             properties:
 *               patient_id:
 *                 type: string
 *                 format: uuid
 *                 description: Patient ID for analysis
 *             example:
 *               patient_id: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Health analysis generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 analysis:
 *                   type: object
 *                   description: Generated health analysis and recommendations
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Error generating analysis
 */

router.post('/generate-business-plan', authenticateUser, generateBusinessPlan);
router.post('/chat-bot', chatBot);

export default router;
