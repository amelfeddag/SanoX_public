import express from 'express';
import { registerPatient, login, forgotPassword ,verifyUserEmail , resendVerificationCode , resetPassword} from '../Controllers/auth.controller.js';
import { validateRequest 
        ,validatePatientRegister , 
        validateLogin, validateVerifyOTP, validateForgotPassword,
        validateResetPassword , validateEmailVerification ,
        validateResendVerification} 
        from '../Middleware/validationMiddleware.js';


const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and account management for patients
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PatientRegisterRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 255
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *         password:
 *           type: string
 *           minLength: 8
 *           example: "SecurePass123!"
 *         phone:
 *           type: string
 *           example: "+1234567890"
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           example: "1990-01-01"
 *         address:
 *           type: string
 *           example: "123 Main St, City, Country"
 *         emergencyContact:
 *           type: string
 *           example: "Jane Doe - +1234567891"
 *         medicalHistory:
 *           type: string
 *           example: "No significant medical history"
 *     
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *
 *     EmailVerificationRequest:
 *       type: object
 *       required:
 *         - email
 *         - otp
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         otp:
 *           type: string
 *           minLength: 6
 *           maxLength: 6
 *           example: "123456"
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         token:
 *           type: string
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             email:
 *               type: string
 *             userType:
 *               type: string
 *         patient:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             name:
 *               type: string
 *             phone:
 *               type: string
 *             dateOfBirth:
 *               type: string
 *               format: date
 *             address:
 *               type: string
 *             emergencyContact:
 *               type: string
 */

/**
 * @swagger
 * /api/auth/register-patient:
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
 *         description: Patient account created successfully, verification email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Patient account created successfully. Please check your email for verification code.'
 *                 userId:
 *                   type: string
 *                   format: uuid
 *                 email:
 *                   type: string
 *                 requiresVerification:
 *                   type: boolean
 *                   example: true
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
 */

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify email with OTP code
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailVerificationRequest'
 *     responses:
 *       200:
 *         description: Email verified successfully, user logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   enum: 
 *                     - 'No verification request found for this email'
 *                     - 'Verification code has expired'
 *                     - 'Invalid verification code'
 */

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Resend verification code
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
 *     responses:
 *       200:
 *         description: New verification code sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'New verification code sent to your email'
 *       400:
 *         description: No pending verification found
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login patient
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
 *       401:
 *         description: Invalid credentials or unverified email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   enum: 
 *                     - 'Invalid email or password'
 *                     - 'Please verify your email first'
 *                 requiresVerification:
 *                   type: boolean
 *                   example: true
 */

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
 *                 example: "john.doe@example.com"
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Invalid email'
 */

/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   put:
 *     summary: Reset password using token
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token from email
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
 *                 example: 'NewSecurePass123!'
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Password updated successfully'
 *       400:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Invalid or expired token'
 */

router.post('/register-patient', validateRequest(validatePatientRegister), registerPatient);
router.post('/verify-email', validateRequest(validateEmailVerification), verifyUserEmail);
router.post('/resend-verification', validateRequest(validateResendVerification), resendVerificationCode);
router.post('/login', validateRequest(validateLogin), login);
router.post('/forgot-password', validateRequest(validateForgotPassword), forgotPassword);
router.put('/reset-password/:token', validateRequest(validateResetPassword), resetPassword);

export default router;