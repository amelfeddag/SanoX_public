import express from 'express';
import { callback, termsAuth, successAuth, Error, passportScope, passportFailureRedirect } from '../Controllers/googleOAuth.controller.js';

const router = express.Router();


router.get('/', passportScope);

router.get('/callback', passportFailureRedirect, callback);

router.get('/Terms-auth', termsAuth);

router.get('/success', successAuth);

router.get('/success-auth', successAuth);

router.get('/error', Error);

export default router;