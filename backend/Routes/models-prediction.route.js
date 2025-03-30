import express from 'express';
import { generateBusinessPlan, chatBot } from '../Controllers/models-predictions.controller.js';
import authenticateUser from '../Middleware/authMiddleware.js';

const router = express.Router();


router.post('/generate-business-plan', authenticateUser, generateBusinessPlan);
router.post('/chat-bot', chatBot);

export default router;
