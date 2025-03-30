import express from 'express';
import { getDoctors } from '../Controllers/doctorController.js';

const router = express.Router();

// Route to get doctors' locations
router.get('/', getDoctors);

export default router;
