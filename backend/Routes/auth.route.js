import express from 'express';
import { registerPatient, login, verifyUserEmail,  forgotPassword } from '../Controllers/auth.controller.js';
import { validateRequest ,validatePatientRegister , validateLogin, validateVerifyOTP, validateForgotPassword, validateResetPassword } from '../Middleware/validationMiddleware.js';

import authenticateUser from '../Middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and account management
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               msg: 'Logged in successfully!'
 *               token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 *       401:
 *         description: Invalid credentials or unverified email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   enum: ['Invalid email', 'Invalid password', 'Please verify your email']
 */


/**
 @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new patient
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientRegisterRequest'
 *     responses:
 *       201:
 *         description: Patient account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Patient account created successfully'
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                     userType:
 *                       type: string
 *                       example: 'patient'
 *                 patient:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     phone:
 *                       type: string
 *       400:
 *         description: Validation error or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'E-mail already exists'
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /api/auth/register/verify/{token}:
 *   get:
 *     summary: Verify user email
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email verification token
 *     responses:
 *       302:
 *         description: Redirects to success page after verification
 *       400:
 *         description: Invalid or expired token
 */


//router.post('/verify-otp', validateRequest(validateVerifyOTP), authenticateUser, verifyOTP );

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *             example:
 *               email: john.doe@example.com
 *     responses:
 *       200:
 *         description: Reset link sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Reset password link sent to your email'
 *       400:
 *         description: Invalid email
 */
/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   put:
 *     summary: Reset password
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 description: New strong password
 *             example:
 *               newPassword: 'NewSecurePass123!'
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post('/login' ,validateRequest(validateLogin), login);
router.post('/registerPatient' ,validateRequest(validatePatientRegister), registerPatient);
router.get('/register/verify/:token', verifyUserEmail);
router.post('/forgot-password', validateRequest(validateForgotPassword), forgotPassword);
// router.put('/reset-password/:token', validateRequest(validateResetPassword), resetPassword);

export default router;