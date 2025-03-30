import express from 'express';
import { getProfile, editProfile, deleteProfile, updatePassword, updateEmail, verifyUpdateEmail, completeAccount, unable2FA, UploadPFP, UpdateSubscription } from '../Controllers/profile.controller.js';
import authenticateUser from '../Middleware/authMiddleware.js';
import { validateRequest, validateEditProfile, validateCompleteAccount,validateUnable2FA, validateUpdateEmail, validateUploadPFP,validateUpdatePassword, validateUpdateSubscriptionType } from '../Middleware/validationMiddleware.js';

const router = express.Router();

router.get('/get-profile', authenticateUser, getProfile);
router.put('/edit-profile', validateRequest(validateEditProfile), authenticateUser, editProfile);
router.delete('/delete-profile', authenticateUser, deleteProfile);

router.put('/update-password', validateRequest(validateUpdatePassword), authenticateUser, updatePassword);

router.put('/update-email', validateRequest(validateUpdateEmail), authenticateUser, updateEmail);
router.get('/update-email/verify/:token', verifyUpdateEmail);

router.post('/complete-account/:user_id', validateRequest(validateCompleteAccount), completeAccount);

router.put("/unable-2fa", validateRequest(validateUnable2FA), authenticateUser, unable2FA);

router.put('/upload-pfp', validateRequest(validateUploadPFP), authenticateUser, UploadPFP);

router.put('/update-subscription', validateRequest(validateUpdateSubscriptionType), authenticateUser, UpdateSubscription);


export default router;