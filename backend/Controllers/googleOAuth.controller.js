import path from 'path';
import twilio from 'twilio';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import {pool} from '../DB/connect.js';
import { StatusCodes } from 'http-status-codes';
import passport from 'passport';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';


/*************************************************** Configurations *************************************************** */

dotenv.config();

// Twilio
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_API_KEY;
const client = twilio(accountSid, authToken);

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Google OAuth2.0
let userProfile;
passport.use(
   new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.AGRISISTANCE_REDIRECT_URI,
        },
        function (accessToken, refreshToken, profile, done) {
            userProfile = profile;
            return done(null, userProfile);
            
        }
    )
);



/******************************************* Helper Functions *********************************************************** */

async function login (req, res, eMail) {

    const [rows] = await pool.query('SELECT * FROM Users WHERE eMail = ?', [eMail]);
    const user_id = rows[0].user_id;

    // Set last login and remove deletion request if exists
    const action_id = uuidv4();
    const currentTimestamp = Date.now();
    const date = new Date(currentTimestamp);
    await pool.query('UPDATE Users SET last_login = ?, deletion_requested_at = ? WHERE user_id = ?', [date, null, user_id]);
    
    // Update History
    await pool.query('INSERT INTO history VALUES (?, ?, ?, ?)',[action_id, user_id, 'Log in Account Via Google OAuth', date]);
    
    // Send JWT, in most cases people who connect with Google are already verified so no need for 2FA 
    const token = jwt.sign({ user_id: user_id }, process.env.JWT_SECRET, { expiresIn: '10d' });

    return res.status(StatusCodes.OK).json({
        msg : "Logged in successfully !",
        token,
    });
    
}


/******************************************* Functions to authenticate user with Google *********************************************************** */

// Route to authenticate user with Google
const passportScope = passport.authenticate('google', { scope: ['profile', 'email'] });


// Redirect to error page if authentication fails
const passportFailureRedirect = passport.authenticate('google', { failureRedirect: '/api/auth/google/error' }); 


// Callback route after Google has authenticated the user
const callback = (req, res) => {
    res.redirect('/api/auth/google/Terms-auth');
};


// Route to accept terms
const termsAuth =  async (req, res) => {
    const [exists] = await pool.query('SELECT 1 FROM Users WHERE user_id = ? OR eMail = ?', [userProfile.id, userProfile.emails[0].value]);
    if (exists.length === 0) return res.redirect('/api/auth/google/success-auth');
    res.sendFile(path.join(__dirname, '../../Views/Accept-terms.html'));
};


// Success logging in via Google
const successAuth = async (req, res) => {
    
    try {
        
        const [rows] = await pool.query('SELECT * FROM Users WHERE user_id = ? OR eMail = ?', [userProfile.id, userProfile.emails[0].value]);

        // If user does not exist in DB
        if (rows.length === 0) {

            // Insert new user into DB
            await pool.query('INSERT INTO Users (user_id, firstName, lastName, eMail, profile_picture, isVerified) VALUES (?, ?, ?, ?, ?, ?)', 
                [userProfile.id, userProfile.name.givenName, userProfile.name.familyName, userProfile.emails[0].value, userProfile.photos[0].value, 'TRUE']);

            // Update History
            const action_id = uuidv4();
            const currentTimestamp = Date.now();
            const date = new Date(currentTimestamp);
            await pool.query('INSERT INTO history VALUES (?, ?, ?, ?)',[action_id, userProfile.id, 'Create Account Via Google OAuth', date]);

            return res.redirect(`/api/profile/complete-account/${userProfile.id}`);

        }

        // If user exists in DB
        return login(req, res, userProfile.emails[0].value);
    
    
    } catch (error) {
    
        console.error('Error during database operation:', error);
    
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error during database operation.' });
    
    }
    
};


// Error logging in via Google
const Error = (req, res) => res.status(StatusCodes.BAD_REQUEST).json({  message :'Error logging in via Google.' });


export {callback, termsAuth, successAuth, Error, passportScope, passportFailureRedirect};