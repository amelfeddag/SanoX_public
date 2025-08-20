import express from 'express';
import chatbotRoutes from './chatbotRoutes.js';
import authRoutes from './auth.route.js'; // Import authentication routes
import doctorRoutes from './doctorRoutes.js'; // Import doctor routes;
import patientAppointmentRoutes from './patientAppointmentRoutes.js'; // Import appointment routes
import notificationRoutes from './notificationRoutes.js'; // Import notification routes
import doctorAppointmenttmentRoutes from './doctorAppointmentRoutes.js'; 
import reviewRoutes from './reviewRoutes.js'; // Import review routes
const router = express.Router();


// Authentication routes
router.use('/auth', authRoutes); 
//bot routes
router.use('/chatbot', chatbotRoutes);

// Doctor routes 
router.use('/doctor', doctorRoutes);
// Patient appointment routes
router.use('/appointments', patientAppointmentRoutes);
//notification routes
router.use('/notifications ', notificationRoutes);
// Doctor routes 
router.use('/doctor', doctorRoutes);
// Doctor appointment routes
router.use('/doctor/appointments', doctorAppointmenttmentRoutes);
// // Doctor review routes (for doctors to view their reviews)
// router.use('/doctor/reviews', doctorReviewRoutes);
// Review routes (for patients to create/manage reviews)
router.use('/reviews', reviewRoutes);




export default router;
