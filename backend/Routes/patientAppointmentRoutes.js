import express from 'express';
import {
    getDoctorAvailableSlots,
    bookAppointment,
    getPatientAppointments,
    cancelAppointment
} from '../Controllers/appointmentController.js';

import {
    getDoctorAppointments,
    confirmAppointment,
    rejectAppointment,
    completeAppointment,
    getDoctorAvailability,
    updateDoctorAvailability
} from '../Controllers/doctorAppointmentController.js';

import { authenticatePatient } from '../Middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Appointment booking and management system
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AppointmentBooking:
 *       type: object
 *       required:
 *         - doctorId
 *         - appointmentDate
 *         - appointmentTime
 *       properties:
 *         doctorId:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         appointmentDate:
 *           type: string
 *           format: date
 *           example: "2024-12-25"
 *         appointmentTime:
 *           type: string
 *           format: time
 *           example: "14:30"
 *         conversationId:
 *           type: string
 *           format: uuid
 *           description: "ID of the chat conversation that led to this appointment"
 *         urgencyLevel:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           default: 1
 *           example: 3
 *         notes:
 *           type: string
 *           example: "Patient has severe headaches"
 *         duration:
 *           type: integer
 *           default: 30
 *           example: 30
 *           description: "Appointment duration in minutes"
 *     
 *     AppointmentResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         doctorName:
 *           type: string
 *           example: "Dr. Ahmed Benali"
 *         appointmentDate:
 *           type: string
 *           format: date
 *         appointmentTime:
 *           type: string
 *           format: time
 *         duration:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [pending, confirmed, completed, cancelled]
 *         urgencyLevel:
 *           type: integer
 *         notes:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     TimeSlot:
 *       type: object
 *       properties:
 *         time:
 *           type: string
 *           format: time
 *           example: "09:00"
 *         available:
 *           type: boolean
 *           example: true
 *         duration:
 *           type: integer
 *           example: 30
 */

/**
 * @swagger
 * /api/appointments/doctor/{doctorId}/available-slots:
 *   get:
 *     tags: [Appointments]
 *     summary: Get available time slots for a doctor
 *     description: Retrieves all available appointment slots for a specific doctor on a given date
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Doctor's unique identifier
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to check availability (YYYY-MM-DD)
 *         example: "2024-12-25"
 *       - in: query
 *         name: duration
 *         required: false
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Appointment duration in minutes
 *         example: 30
 *     responses:
 *       200:
 *         description: Available slots retrieved successfully
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
 *                   example: "Available slots retrieved successfully"
 *                 date:
 *                   type: string
 *                   format: date
 *                 doctorId:
 *                   type: string
 *                   format: uuid
 *                 availableSlots:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TimeSlot'
 *                 totalSlots:
 *                   type: integer
 *       400:
 *         description: Invalid date or parameters
 *       401:
 *         description: Authentication required
 */

/**
 * @swagger
 * /api/appointments/book:
 *   post:
 *     tags: [Appointments]
 *     summary: Book an appointment
 *     description: Books a new appointment with a doctor
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentBooking'
 *     responses:
 *       201:
 *         description: Appointment booked successfully
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
 *                   example: "Appointment booked successfully"
 *                 appointment:
 *                   $ref: '#/components/schemas/AppointmentResponse'
 *       400:
 *         description: Invalid booking data
 *       409:
 *         description: Time slot no longer available
 *       401:
 *         description: Authentication required
 */

/**
 * @swagger
 * /api/appointments/my-appointments:
 *   get:
 *     tags: [Appointments]
 *     summary: Get patient's appointments
 *     description: Retrieves all appointments for the authenticated patient
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
 *         description: Number of appointments per page
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 appointments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AppointmentResponse'
 *                 pagination:
 *                   type: object
 *       401:
 *         description: Authentication required
 */

/**
 * @swagger
 * /api/appointments/{appointmentId}/cancel:
 *   patch:
 *     tags: [Appointments]
 *     summary: Cancel an appointment
 *     description: Cancels an existing appointment (patient side)
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
 *                 example: "Emergency came up"
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 *       400:
 *         description: Cannot cancel this appointment
 *       404:
 *         description: Appointment not found
 *       401:
 *         description: Authentication required
 */

// Patient routes (require patient authentication)
router.get('/:doctorId/available-slots', authenticatePatient, getDoctorAvailableSlots);
router.post('/book', authenticatePatient, bookAppointment);
router.get('/my-appointments', authenticatePatient, getPatientAppointments);
router.patch('/:appointmentId/cancel', authenticatePatient, cancelAppointment);

export default router;