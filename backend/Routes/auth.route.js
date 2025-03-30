import express from 'express';
import { register, login, verifyUserEmail,  forgotPassword, resetPassword } from '../Controllers/auth.controller.js';
import { validateRequest ,validateRegister , validateLogin, validateVerifyOTP, validateForgotPassword, validateResetPassword } from '../Middleware/validationMiddleware.js';

import authenticateUser from '../Middleware/authMiddleware.js';

const router = express.Router();

router.post('/login' ,validateRequest(validateLogin), login);

router.post('/register' ,validateRequest(validateRegister), register);
router.get('/register/verify/:token', verifyUserEmail);

//router.post('/verify-otp', validateRequest(validateVerifyOTP), authenticateUser, verifyOTP );

router.post('/forgot-password', validateRequest(validateForgotPassword), forgotPassword);
router.put('/reset-password/:token', validateRequest(validateResetPassword), resetPassword);

export default router;