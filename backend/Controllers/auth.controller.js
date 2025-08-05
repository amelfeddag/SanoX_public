import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../config/supabaseClient.js'; // Supabase client
import sendEmail from './Utils/sendEmail.js';
import { StatusCodes } from 'http-status-codes';

dotenv.config();

/***************************************************************************************************************************************************** */
const register = async (req, res) => {
    try {
        console.log('Register request received:', req.body);

        const { firstName, lastName, country, phoneNumber, email, password } = req.body;

        // Check if email already exists
        console.log('Checking if email already exists:', email);
        const { data: existingUser, error: findError } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .single();

        if (findError) {
            console.error('Error checking existing user:', findError);
        }

        if (existingUser) {
            console.warn('E-mail already exists:', email);
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'E-mail already exists' });
        }

        // Hash password
        console.log('Hashing password for new user');
        const hashedPassword = await bcrypt.hash(password, 10);
        const user_id = uuidv4();

        // Insert user into Supabase
        console.log('Inserting new user into database:', { user_id, email });
        const { error: insertError } = await supabase
            .from('users')
            .insert([
                {
                    user_id,
                    firstname: firstName,  // Fixing field names
                    lastname: lastName,
                    country,
                    phonenumber: phoneNumber,  // Fixing phone number
                    email,
                    password: hashedPassword,
                    isverified: false,
                    role: 'DOCTOR'
                }
            ]);

        if (insertError) {
            console.error('Error inserting user:', insertError);
            throw insertError;
        }

        // Generate verification token
        console.log('Generating verification token for user:', user_id);
        const token = jwt.sign({ user_id }, process.env.JWT_SECRET, { expiresIn: '10m' });

        // Send verification email
        console.log('Sending verification email to:', email);
        await sendEmail(email, token, 'confirmation');

        // Log history
        console.log('Logging account creation for user:', user_id);
        await supabase
            .from('history')
            .insert([{ action_id: uuidv4(), user_id, action: 'Create Account' }]);

        res.status(StatusCodes.CREATED).json({ message: 'User created successfully, please verify your email.' });

    } catch (error) {
        console.error('Error during registration:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};


/***************************************************************************************************************************************************** */

// ✅ **Login User**
// const login = async(req , res) =>{
//     console.log('rani nmchi');
// }
const login = async (req, res) => {
    try {
        console.log('Login request received:', req.body);
        console.log('Email:', req.body.email);
        console.log('Password:', req.body.password);


        const { email, password } = req.body;

        console.log('Fetching user from database:', email);
        const { data: users, error: userError } = await supabase
            .from('Users')
            .select('*')
            .eq('email', email);a

        if (userError) {
            console.error('Error fetching user:', userError);
        }

        if (!users || users.length === 0) {
            console.warn('Invalid email attempt:', email);
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid email' });
        }

        const user = users[0];

        // Check password
        console.log('Checking password for user:', email);
        const isCorrectPassword = await bcrypt.compare(password, user.password);
        if (!isCorrectPassword) {
            console.warn('Invalid password attempt for user:', email);
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid password' });
        }

        // Check email verification
        if (!user.isVerified) {
            console.warn('Unverified email login attempt:', email);
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Please verify your email' });
        }

        // Update last login time
        console.log('Updating last login time for user:', user.user_id);
        await supabase
            .from('Users')
            .update({ last_login: new Date() })
            .eq('user_id', user.user_id);

        // Log history
        console.log('Logging login action for user:', user.user_id);
        await supabase
            .from('History')
            .insert([{ action_id: uuidv4(), user_id: user.user_id, action: 'Log in Account' }]);

        // Generate JWT
        console.log('Generating JWT token for user:', user.user_id);
        const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '10d' });

        res.status(StatusCodes.OK).json({ msg: 'Logged in successfully!', token });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};

/***************************************************************************************************************************************************** */

// ✅ **Verify User Email**
const verifyUserEmail = async (req, res) => {
    try {
        console.log('Verify email request received with token:', req.params.token);

        const token = req.params.token;
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user_id = payload.user_id;

        console.log('Updating verification status for user:', user_id);
        await supabase
            .from('Users')
            .update({ isVerified: true })
            .eq('user_id', user_id);

        console.log('Logging email verification for user:', user_id);
        await supabase
            .from('History')
            .insert([{ action_id: uuidv4(), user_id, action: 'Verify E-mail' }]);

        return res.redirect('https://yourfrontend.com/auth/email-verified-successfully');

    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(400).json({ error: 'Invalid or expired token' });
    }
};

/***************************************************************************************************************************************************** */

// ✅ **Forgot Password**
const forgotPassword = async (req, res) => {
    try {
        console.log('Forgot password request received:', req.body);

        const { email } = req.body;

        console.log('Checking if email exists:', email);
        const { data: users } = await supabase
            .from('Users')
            .select('user_id')
            .eq('email', email);

        if (!users || users.length === 0) {
            console.warn('Invalid email for password reset:', email);
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid email' });
        }

        const user_id = users[0].user_id;

        console.log('Generating reset token for user:', user_id);
        const token = jwt.sign({ user_id }, process.env.JWT_SECRET, { expiresIn: '10m' });

        console.log('Sending password reset email to:', email);
        await sendEmail(email, token, 'resetPassword');

        res.status(StatusCodes.OK).json({ message: 'Reset password link sent to your email' });

    } catch (error) {
        console.error('Error during forgot password:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};

/***************************************************************************************************************************************************** */

// ✅ **Reset Password**
const resetPassword = async (req, res) => {
    try {
        console.log('Reset password request received with token:', req.params.token);

        const token = req.params.token;
        const { newPassword } = req.body;

        console.log('Verifying token');
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user_id = payload.user_id;

        console.log('Hashing new password');
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        console.log('Updating password for user:', user_id);
        await supabase
            .from('Users')
            .update({ password: hashedPassword })
            .eq('user_id', user_id);

        console.log('Logging password reset action for user:', user_id);
        await supabase
            .from('History')
            .insert([{ action_id: uuidv4(), user_id, action: 'Reset Password' }]);

        res.status(StatusCodes.OK).json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error('Error during password reset:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};

/***************************************************************************************************************************************************** */

export { register, login, verifyUserEmail, forgotPassword, resetPassword };
