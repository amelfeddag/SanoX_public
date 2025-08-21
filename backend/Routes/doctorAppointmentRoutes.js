
import express from 'express';
import {
    getDoctorAppointments,
    confirmAppointment,
    rejectAppointment,
    completeAppointment,
    getDoctorAvailability,
    updateDoctorAvailability
} from '../Controllers/doctorAppointmentController.js';

import { authenticateDoctor } from '../Middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Doctor Appointments
 *   description: Doctor-side appointment management
 */

/**
 * @swagger
 * /api/doctor/appointments:
 *   get:
 *     tags: [Doctor Appointments]
 *     summary: Get doctor's appointments
 *     description: Retrieves all appointments for the authenticated doctor
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, completed, cancelled]
 *         description: Filter by appointment status
 *       - in: query
 *         name: date
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by specific date
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
 *           default: 20
 *     responses:
 *       200:
 *         description: Doctor appointments retrieved successfully
 *       401:
 *         description: Doctor authentication required
 */

/**
 * @swagger
 * /api/doctor/appointments/{appointmentId}/confirm:
 *   patch:
 *     tags: [Doctor Appointments]
 *     summary: Confirm an appointment
 *     description: Confirms a pending appointment request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
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
 *               notes:
 *                 type: string
 *                 example: "Please arrive 15 minutes early"
 *     responses:
 *       200:
 *         description: Appointment confirmed successfully
 *       400:
 *         description: Can only confirm pending appointments
 *       404:
 *         description: Appointment not found
 *       401:
 *         description: Doctor authentication required
 */

/**
 * @swagger
 * /api/doctor/appointments/{appointmentId}/reject:
 *   patch:
 *     tags: [Doctor Appointments]
 *     summary: Reject/Cancel an appointment
 *     description: Rejects a pending appointment or cancels a confirmed one
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
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
 *               reason:
 *                 type: string
 *                 example: "Emergency surgery scheduled"
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 *       404:
 *         description: Appointment not found
 *       401:
 *         description: Doctor authentication required
 */

/**
 * @swagger
 * /api/doctor/appointments/{appointmentId}/complete:
 *   patch:
 *     tags: [Doctor Appointments]
 *     summary: Mark appointment as completed
 *     description: Marks a confirmed appointment as completed after consultation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
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
 *               notes:
 *                 type: string
 *                 example: "Patient diagnosed with mild hypertension"
 *               prescriptions:
 *                 type: string
 *                 example: "Prescribed medication for blood pressure control"
 *     responses:
 *       200:
 *         description: Appointment marked as completed
 *       400:
 *         description: Can only complete confirmed appointments
 *       404:
 *         description: Appointment not found
 *       401:
 *         description: Doctor authentication required
 */

/**
 * @swagger
 * /api/doctor/availability:
 *   get:
 *     tags: [Doctor Appointments]
 *     summary: Get doctor's availability schedule
 *     description: Retrieves the doctor's weekly availability schedule
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctor availability retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 availability:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       day_of_week:
 *                         type: integer
 *                         minimum: 0
 *                         maximum: 6
 *                         description: "0=Sunday, 1=Monday, ..., 6=Saturday"
 *                       dayName:
 *                         type: string
 *                         example: "Monday"
 *                       start_time:
 *                         type: string
 *                         format: time
 *                         example: "09:00"
 *                       end_time:
 *                         type: string
 *                         format: time
 *                         example: "17:00"
 *                       is_active:
 *                         type: boolean
 *       401:
 *         description: Doctor authentication required
 *   put:
 *     tags: [Doctor Appointments]
 *     summary: Update doctor's availability schedule
 *     description: Updates the doctor's weekly availability schedule
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               availability:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     day_of_week:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 6
 *                     start_time:
 *                       type: string
 *                       format: time
 *                     end_time:
 *                       type: string
 *                       format: time
 *                     is_active:
 *                       type: boolean
 *                       default: true
 *           example:
 *             availability:
 *               - day_of_week: 1
 *                 start_time: "09:00"
 *                 end_time: "17:00"
 *                 is_active: true
 *               - day_of_week: 2
 *                 start_time: "09:00"
 *                 end_time: "17:00"
 *                 is_active: true
 *     responses:
 *       200:
 *         description: Availability updated successfully
 *       400:
 *         description: Invalid availability data
 *       401:
 *         description: Doctor authentication required
 */


router.get('/', authenticateDoctor, getDoctorAppointments);
router.patch('/:appointmentId/confirm', authenticateDoctor, confirmAppointment);
router.patch('/:appointmentId/reject', authenticateDoctor, rejectAppointment);
router.patch('/:appointmentId/complete', authenticateDoctor, completeAppointment);
router.get('/availability', authenticateDoctor, getDoctorAvailability);
router.put('/availability', authenticateDoctor, updateDoctorAvailability);

export default router;