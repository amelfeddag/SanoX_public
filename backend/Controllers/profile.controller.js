
import path from 'path';
import Stripe from 'stripe';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import {pool} from '../DB/connect.js';
import sendEmail from './Utils/sendEmail.js';
import { v2 as cloudinary } from 'cloudinary';
import { StatusCodes } from 'http-status-codes';
import { extractPublicId, deleteImageFromCloudinary } from './Utils/cloudinaryDelete.js';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config();

// Cloudinary 
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/************************************************************************************************************************** */

const getProfile = async (req, res) => {
    const user_id = req.user.id;

    try {
        const [rows] = await pool.query(
            'SELECT user_id, firstName, lastName, country, phoneNumber, eMail, profile_picture, subscription_type FROM Users WHERE user_id = ?',
            [user_id]
        );
        const user = rows[0];

        return res.status(StatusCodes.OK).json(user);
    } catch (error) {
        console.error('Error during profile retrieval:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};


/************************************************************************************************************************** */


const editProfile = async (req, res) => {
    
    const user_id = req.user.id;
    const { firstName, lastName, country, phoneNumber } = req.body;

    try {

        // Update user profile
        const sql = 'UPDATE Users SET firstName = ?, lastName = ?, country = ?, phoneNumber = ? WHERE user_id = ?';
        await pool.query(sql, [firstName, lastName, country, phoneNumber, user_id]);

        // Update history
        const action_id = uuidv4();
        const currentTimestamp = Date.now();
        const date = new Date(currentTimestamp);
        await pool.query('INSERT INTO history VALUES (?, ?, ?, ?)',[action_id, user_id, 'Edit Account', date]);
    

        return res.status(StatusCodes.OK).json({ message: 'Profile updated successfully' });

    } catch (error) {
        console.error('Error during profile update:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};

/************************************************************************************************************************** */

const deleteProfile = async (req, res) => {

    const user_id = req.user.id;
    const currentTimestamp = Date.now();
    const date = new Date(currentTimestamp);

    try{
        // Update deletion request time
        await pool.query('UPDATE Users SET deletion_requested_at = ? WHERE user_id = ?', [date , user_id]);
        
        // Send email to the user
        const [email] = await pool.query('SELECT eMail FROM Users WHERE user_id = ?' , [user_id]);
        await sendEmail(email[0].eMail , '', 'deletion');    

        // Update History
        const action_id = uuidv4();
        await pool.query('INSERT INTO history VALUES (?, ?, ?, ?)',[action_id, user_id, 'Request Account Deletion', date]);
        
        res.status(StatusCodes.ACCEPTED).json({ message: 'Account deletion request recieved successfully please check you E-mail' });


    }catch(e){
        console.log('Error : ', e)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }

};

/************************************************************************************************************************** */

const updatePassword = async (req, res) => {
    const user_id = req.user.id;
    const { oldPassword, newPassword } = req.body;

    try {

        // Get the user's password
        const [rows] = await pool.query('SELECT password FROM Users WHERE user_id = ?', [user_id]);
        const user = rows[0];

        // Check if the old password is correct
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid password' });
        }

        // Hash the new password and update the user's password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE Users SET password = ? WHERE user_id = ?', [hashedPassword, user_id]);

        // Update history
        const action_id = uuidv4();
        const currentTimestamp = Date.now();
        const date = new Date(currentTimestamp);
        await pool.query('INSERT INTO history VALUES (?, ?, ?, ?)',[action_id, user_id, 'Update Account', date]);

        return res.status(StatusCodes.OK).json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error('Error during password update:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
}


/************************************************************************************************************************** */

const updateEmail = async (req, res) => {
    const user_id = req.user.id;
    const {eMail} = req.body;

    // Check if the email is already in use
    const [rows] = await pool.query('SELECT 1 FROM Users WHERE eMail = ?', [eMail]);
    if (rows.length > 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Email already in use' });
    }

    // Send a verification E-mail
    const token = jwt.sign({ user_id, eMail }, process.env.JWT_SECRET, { expiresIn: '10m' });
    await sendEmail(eMail, token, 'updateVerification');
    
    res.status(StatusCodes.OK).json({ message: 'Verification email sent' });
}

/************************************************************************************************************************** */

const verifyUpdateEmail = async (req, res) => {
    const token = req.params.token;
    
    try {
        // Verify the JWT and extract the payload
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const { user_id, eMail } = payload;

        // Update the user's email
        await pool.query('UPDATE Users SET eMail = ? WHERE user_id = ?', [eMail, user_id]);

        // Update history
        const action_id = uuidv4();
        const currentTimestamp = Date.now();
        const date = new Date(currentTimestamp);
        await pool.query('INSERT INTO history VALUES (?, ?, ?, ?)',[action_id, user_id, 'Update Email', date]);

        return res.redirect('https://agrisistatnce.netlify.app/dashboard/profile/email-updated-successfully');
        // res.status(StatusCodes.OK).json({ message: 'Email updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid or expired token' });
    }
};


/************************************************************************************************************************** */


const completeAccount = async (req, res) => {
    
    const user_id = req.params.user_id;
    const { firstName, lastName, country, role } = req.body;

    // Update the user's profile
    await pool.query('UPDATE Users SET firstName = ?, lastName = ?, country = ?, role = ? WHERE user_id = ?', [firstName, lastName, country, role, user_id]);

    // Create a token, in most cases people who connect with Google are already verified so no need to send verification email to them
    const token = jwt.sign({ user_id }, process.env.JWT_SECRET, { expiresIn: '10d' });
        
    // update history
    const action_id = uuidv4();
    const currentTimestamp = Date.now();
    const date = new Date(currentTimestamp);
    await pool.query('INSERT INTO history VALUES (?, ?, ?, ?)',[action_id, user_id, 'Create Account', date]);

    res.status(StatusCodes.CREATED).json({ 
        message: 'User created successfully',
        token 

    });

};

/************************************************************************************************************************** */

const unable2FA = async (req, res) => {

    const user_id = req.user.id;
    const { phoneNumber } = req.body;

    try{
        // Update the user's phone number and enable 2FA
        await pool.query('UPDATE Users SET phoneNumber = ? , is_2fa_enabled = ? WHERE user_id = ?', [phoneNumber,'TRUE', user_id]);

        // Update history
        const action_id = uuidv4();
        const currentTimestamp = Date.now();
        const date = new Date(currentTimestamp);
        await pool.query('INSERT INTO history VALUES (?, ?, ?, ?)',[action_id, user_id, 'Unable 2FA', date]);

        return res.status(StatusCodes.OK).json({ message: '2FA enabled successfully' });
    }catch (error) {
        console.error('Error during 2FA enable:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
     
};

/************************************************************************************************************************** */

const UploadPFP = async (req, res) => {
    const user_id = req.user.id;
    const profile_picture = req.body.profile_picture;

    // Check if the profile picture is provided
    if (!profile_picture) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Please provide a profile picture' });
    }

    try {

        // Check if the user already has a profile picture and delete it
        const [userRows] = await pool.query('SELECT profile_picture FROM Users WHERE user_id = ?', [user_id]);
        const defaultPFP = 'https://res.cloudinary.com/dmbnrpayf/image/upload/v1723469480/Agrisistance/Users-Profile-Pictures/nmkjq8wxoacfe2yyzo6n.jpg';


        // TODO: i may remove the default value and make this if not null


        if (userRows[0].profile_picture !== defaultPFP) {
            const publicId = extractPublicId(userRows[0].profile_picture);
            if (publicId) {
                await deleteImageFromCloudinary(publicId, 'Users-Profile-Pictures');
            }
        }

        // Upload the new profile picture
        const uploadResult = await cloudinary.uploader.upload(profile_picture, { folder: 'Agrisistance/Users-Profile-Pictures' });
        await pool.query('UPDATE Users SET profile_picture = ? WHERE user_id = ?', [uploadResult.secure_url, user_id]);

        // Update history
        const action_id = uuidv4();
        const currentTimestamp = Date.now();
        const date = new Date(currentTimestamp);
        await pool.query('INSERT INTO history VALUES (?, ?, ?, ?)',[action_id, user_id, 'Upload Profile Picture', date]);

        res.status(StatusCodes.OK).json({ message: 'Profile picture uploaded successfully' });
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};

/************************************************************************************************************************** */

const UpdateSubscription = async (req, res) => {

    // Get the subscription_type , payment_method_id and user_id 
    const { subscription_type, payment_method_id } = req.body;
    const user_id = req.user.id;

    // Define the prices for the subscription types
    const prices = {
        Basic: 0, // $0.00
        Premium: 1000, // $10.00
    };
    const amount = prices[subscription_type];
    
    try {

        // Create a payment intent
        /*
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            payment_method: payment_method_id,
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never'
            },
            return_url: 'https://example.com/return',
            confirm: true,
        });

        */

        // Update the subscription type in the database
        await pool.query(`UPDATE Users SET subscription_type = ? WHERE user_id = ?`, [subscription_type, user_id]);
        
        // Update history
        const action_id = uuidv4();
        const currentTimestamp = Date.now();
        const date = new Date(currentTimestamp);
        await pool.query('INSERT INTO history VALUES (?, ?, ?, ?)',[action_id, user_id, 'Update Subscription', date]);

        // Send the response
        res.status(StatusCodes.OK).json({ message: 'Subscription updated successfully'/*, paymentIntent*/ });
        
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};

export { getProfile, editProfile, deleteProfile, updatePassword, updateEmail, verifyUpdateEmail, completeAccount, unable2FA, UploadPFP, UpdateSubscription };