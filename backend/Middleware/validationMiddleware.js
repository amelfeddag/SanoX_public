import { body, validationResult } from 'express-validator';

// Middleware for validating request data
const validateRequest = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    res.status(400).json({ error: errors.array()[0].msg });
  };
};

// const validateRegister = [
//   //body('eMail').isEmail().withMessage('Valid email is required').normalizeEmail(),
//   body('password')
//     .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
//     .matches(/[0-9]/).withMessage('Password must contain a number')
//     .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
//     .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
//     .matches(/[!@#$%^&*(),.?"':;{}|<>-_]/).withMessage('Password must contain a special character'),
//   body('firstName').notEmpty().withMessage('First name is required'),
//   body('lastName').notEmpty().withMessage('Last name is required'),
//   body('country').notEmpty().withMessage('Country is required'),
//   body('phoneNumber').matches(/^\+?[1-9]\d{1,14}$/).withMessage('Phone number must be in the correct international format'),
// ];
const validatePatientRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
    
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email must not exceed 255 characters'),
    
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
    
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
    
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth (YYYY-MM-DD)')
    .custom((value) => {
      if (value) {
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 0 || age > 150) {
          throw new Error('Please provide a valid date of birth');
        }
      }
      return true;
    }),
    
  body('address')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Address must not exceed 1000 characters'),
    
  body('emergencyContact')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Emergency contact must not exceed 255 characters'),
    
  body('medicalHistory')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Medical history must not exceed 2000 characters')
];

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

const validateVerifyOTP = [
  body('otp').isNumeric().withMessage('OTP must be a number')
];

const validateForgotPassword = [
  body('eMail').isEmail().withMessage('Valid email is required').normalizeEmail()
];

const validateResetPassword = [
  body('newPassword')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[0-9]/).withMessage('Password must contain a number')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[!@#$%^&*(),.?"':;{}|<>-_]/).withMessage('Password must contain a special character')
];

const validateUpdatePassword = [
  body('oldPassword').notEmpty().withMessage('Old password is required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[0-9]/).withMessage('Password must contain a number')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[!@#$%^&*(),.?"':;{}|<>-_]/).withMessage('Password must contain a special character')
];

const validateUpdateEmail = [
  body('eMail').isEmail().withMessage('Valid email is required').normalizeEmail()
];

const validateEditProfile = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('country').notEmpty().withMessage('Country is required'),
  body('phoneNumber').matches(/^\+?[1-9]\d{1,14}$/).withMessage('Phone number must be in the correct international format'),
];

const validateCompleteAccount = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('country').notEmpty().withMessage('Country is required'),
  body('role').isIn(['Owner', 'Worker']).withMessage('Role must be either owner or worker'),
  //body('phoneNumber').matches(/^\+?[1-9]\d{1,14}$/).withMessage('Phone number must be in the correct international format'),
];

const validateUnable2FA = [
  body('phoneNumber').matches(/^\+?[1-9]\d{1,14}$/).withMessage('Phone number must be in the correct international format')
];

const validateUploadPFP = [
  body('profile_picture').notEmpty().withMessage('Profile picture is required')
    .matches(/^data:image\/(jpeg|png|gif|bmp|webp);base64,[A-Za-z0-9+/=]+$/).withMessage('Invalid profile picture format')
];

const validateUpdateSubscriptionType = [
  body('subscription_type').isIn(['Premium', 'Basic']).withMessage('Subscription type must be either Premium or Basic'),
  body('payment_method_id').matches(/^pm_[a-zA-Z0-9_]+$/).withMessage('Invalid payment method ID format')
];

export {
  validateRequest,
  validatePatientRegister,
  validateLogin,
  validateVerifyOTP,
  validateForgotPassword,
  validateResetPassword,
  validateUpdatePassword,
  validateUpdateEmail,
  validateEditProfile,
  validateCompleteAccount,
  validateUnable2FA,
  validateUploadPFP,
  validateUpdateSubscriptionType
};
