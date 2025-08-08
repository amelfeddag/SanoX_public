import express from 'express';
import chatbotRoutes from './chatbotRoutes.js';
import authRoutes from './auth.route.js'; // Import authentication routes
import doctorRoutes from './doctorRoutes.js'; // Import doctor routes;

const router = express.Router();

router.use('/chatbot', chatbotRoutes);

router.use('/doctors', doctorRoutes); 


router.use('/auth', authRoutes); 
export default router;
