import express from 'express';

import 
{ registerPatient, login,
         forgotPassword ,
         verifyUserEmail , 
         resendVerificationCode ,
          resetPassword,
          doctorLogin, registerDoctor
} from '../Controllers/auth.controller.js';

import 
{ validateRequest 
        ,validatePatientRegister , 
        validateLogin, validateVerifyOTP, validateForgotPassword,
        validateResetPassword , validateEmailVerification ,
        validateResendVerification
}  from '../Middleware/validationMiddleware.js';




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

/**
 * @swagger
 * /api/auth/doctor-login:
 *   post:
 *     tags: [Authentication]
 *     summary: Doctor login
 *     description: Authenticates a doctor and returns JWT token with profile information
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DoctorLogin'
 *           example:
 *             email: "dr.ahmed@sanox.com"
 *             password: "securePassword123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Doctor logged in successfully!"
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
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
 *                       example: "doctor"
 *                 doctor:
 *                   $ref: '#/components/schemas/Doctor'
 *                 availability:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid email or password"
 *       403:
 *         description: Account inactive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Your account is currently inactive. Please contact support."
 */


/**
 * @swagger
 * /api/auth/register-doctor:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new doctor
 *     description: >
 *       Creates a new doctor account with profile information and returns a JWT token for immediate access.  
 *       **Note:** Specialties have randomly generated IDs. While testing, you can use:
 *       - `11631054-78ec-4a6c-8cfa-dbac2863a2ae` for **Médecine Générale**
 *       - `13e02009-f2ee-4a1c-923a-88c1067e2b54` for **Cardiologue**  
 *       Check more on the **Get Specialties** endpoint.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DoctorRegistration'
 *           example:
 *             first_name: "Dr. Ahmed ",
 *              last_name: "Benali",
 *             email: "dr.ahmed@sanox.com"
 *             password: "securePassword123"
 *             specialty_id: "550e8400-e29b-41d4-a716-446655440000"
 *             license_number: "AL123456"
 *             phone: "+213555123456"
 *             address: "123 Rue de la Santé, Alger, Algeria"
 *             latitude: 36.7538
 *             longitude: 3.0588
 *             consultation_fee: 3000
 *             bio: "Experienced cardiologist with 10 years of practice specializing in interventional cardiology"
 *             years_experience: 10
 *     responses:
 *       201:
 *         description: Doctor registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Doctor registered successfully!
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
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
 *                       example: doctor
 *                 doctor:
 *                   $ref: '#/components/schemas/Doctor'
 *                 availability:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       day_of_week:
 *                         type: integer
 *                         example: 1
 *                       start_time:
 *                         type: string
 *                         example: "09:00"
 *                       end_time:
 *                         type: string
 *                         example: "17:00"
 *                       is_active:
 *                         type: boolean
 *                         example: true
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Name, email, password, specialty, and license number are required
 *       409:
 *         description: Conflict - email or license already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Email already exists
 *       500:
 *         description: Internal server error
 */

router.post('/register-patient', validateRequest(validatePatientRegister), registerPatient);
router.post('/verify-email', validateRequest(validateEmailVerification), verifyUserEmail);
router.post('/resend-verification', validateRequest(validateResendVerification), resendVerificationCode);
router.post('/login', validateRequest(validateLogin), login);
router.post('/forgot-password', validateRequest(validateForgotPassword), forgotPassword);
router.put('/reset-password/:token', validateRequest(validateResetPassword), resetPassword);



router.post('/doctor-login', doctorLogin);
router.post('/register-doctor', registerDoctor);


export default router;