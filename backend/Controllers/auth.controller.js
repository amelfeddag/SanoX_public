import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../config/supabaseClient.js'; 
import sendEmail from './Utils/sendEmail.js';
import { StatusCodes } from 'http-status-codes';

dotenv.config();

//generate a random otp code
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
const otpStore = new Map(); //store them in a map during dev 

/******************************************************************************************************************************************************/

const registerPatient = async (req, res) => {
    try {
        console.log('Patient register request received:', req.body);

        const { 
            name, 
            email, 
            password, 
            phone, 
            dateOfBirth, 
            address, 
            emergencyContact, 
            medicalHistory 
        } = req.body;

        // if email already exists in users table
        console.log('Checking if email already exists:', email);
        const { data: existingUser, error: findError } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .single();

        if (findError && findError.code !== 'PGRST116') {
            // PGRST116 is "not found" which is what we want
            console.error('Error checking existing user:', findError);
            throw findError;
        }

        if (existingUser) {
            console.warn('E-mail already exists:', email);
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                error: 'E-mail already exists' 
            });
        }

        //hash psswd
        console.log('Hashing password for new patient');
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();
        const patientId = uuidv4();

     
        console.log('Creating user account:', { userId, email }); //account not verified
        const { data: newUser, error: userInsertError } = await supabase
            .from('users')
            .insert([
                {
                    id: userId,
                    email,
                    password_hash: hashedPassword,
                    user_type: 'patient'
                }
            ])
            .select()
            .single();

        if (userInsertError) {
            console.error('Error creating user:', userInsertError);
            throw userInsertError;
        }

        
        console.log('Creating patient profile:', { patientId, userId });
        const { data: newPatient, error: patientInsertError } = await supabase
            .from('patients')
            .insert([
                {
                    id: patientId,
                    user_id: userId,
                    name,
                    phone: phone || null,
                    date_of_birth: dateOfBirth || null,
                    address: address || null,
                    emergency_contact: emergencyContact || null,
                    medical_history: medicalHistory || null
                }
            ])
            .select()
            .single();

        if (patientInsertError) {
            console.error('Error creating patient profile:', patientInsertError);
            
            // delete the user if patient creation failed
            await supabase
                .from('users')
                .delete()
                .eq('id', userId);
                
            throw patientInsertError;
        }
         const otp = generateOTP();
        console.log('Generated OTP for patient:', otp);
        //store otp for 5 min
         otpStore.set(email, {
            otp,
            userId,
            patientId,
            expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
        });

         console.log('Sending verification email to:', email);
        try {
            await sendEmail(email, otp, 'OTPverify');
        } catch (emailError) {
            console.error('Error sending verification email:', emailError);
            // Don't fail registration if email sending fails
        }

        console.log('Patient registered successfully, awaiting verification:', { userId, patientId });
       
     res.status(StatusCodes.CREATED).json({ 
            message: 'Patient account created successfully. Please check your email for verification code.',
            userId,
            email: newUser.email,
            requiresVerification: true
        });

    } catch (error) {
        console.error('Error during patient registration:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            error: 'Internal Server Error',
            details: error.message 
        });
    }
};

// /***************************************************************************************************************************************************** */

 const verifyUserEmail = async (req, res) => {
     try {
        console.log('Verify email request received :', req.body);

       const { email, otp } = req.body;
       const storedData = otpStore.get(email);
       if (!storedData) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'No verification request found for this email'
            });
        }
        if (Date.now() > storedData.expiresAt) {
            otpStore.delete(email);
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Verification code has expired'
            });
        }
        if (storedData.otp !== otp) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Invalid verification code'
            });
        }
        // need to update is verified here 
        otpStore.delete(email);

        console.log('Email verified successfully for user:', storedData.userId);
       
        const token = jwt.sign(
            {
           user_id: storedData.userId, 
                patient_id: storedData.patientId,
                user_type: 'patient' 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        ); 

        //sending patient data as response
         const { data: userData, error: fetchError } = await supabase
            .from('users')
            .select(`
                id,
                email,
                user_type,
                patients (
                    id,
                    name,
                    phone,
                    date_of_birth,
                    address,
                    emergency_contact
                )
            `)
            .eq('id', storedData.userId)
            .single();

        if (fetchError || !userData) {
            throw new Error('Failed to fetch user data after verification');
        }

        const patient = userData.patients[0];

        res.status(StatusCodes.OK).json({
            message: 'Email verified successfully!',
            token,
            user: {
                id: userData.id,
                email: userData.email,
                userType: userData.user_type
            },
            patient: {
                id: patient.id,
                name: patient.name,
                phone: patient.phone,
                dateOfBirth: patient.date_of_birth,
                address: patient.address,
                emergencyContact: patient.emergency_contact
            }
        });

    } catch (error) {
        console.error('Error during email verification:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            error: 'Internal Server Error',
            details: error.message 
        });
    }
};

/***************************************************************************************************************************************************** */
 const forgotPassword = async (req, res) => {
     try {
         console.log('Forgot password request received:', req.body);

         const { email } = req.body;

        console.log('Checking if patient email exists:', email);
        const { data: user, error: findError } = await supabase
           .from('users')
            .select('id')
            .eq('email', email)
             .eq('user_type', 'patient')
            .single();

        if (findError || !user) {
            console.warn('Invalid email for password reset:', email);
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                error: 'Invalid email' 
             });
         }

       console.log('Generating reset token for patient:', user.id);
        const token = jwt.sign({ user_id: user.id }, process.env.JWT_SECRET, { expiresIn: '10m' });

         console.log('Sending password reset email to:', email);
         await sendEmail(email, token, 'resetPassword');

         res.status(StatusCodes.OK).json({ 
             message: 'Reset password link sent to your email' 
         });

    } catch (error) {
        console.error('Error during forgot password:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            error: 'Internal Server Error' 
         });
     }
};

/***************************************************************************************************************************************************** */
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
        const { error: updateError } = await supabase
            .from('users')
            .update({ 
                password_hash: hashedPassword,
                updated_at: new Date().toISOString()
            })
            .eq('id', user_id);

        if (updateError) {
            console.error('Error updating password:', updateError);
            throw updateError;
        }

        res.status(StatusCodes.OK).json({ 
            message: 'Password updated successfully' 
        });

    }catch (error) {
        console.error('Error during password reset:', error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                error: 'Invalid or expired token' 
            });
        }
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            error: 'Internal Server Error' 
        });
    }
};

/***************************************************************************************************************************************************** */
const login = async (req, res) => {
    try {
        console.log('Login request received:', req.body);
        console.log('Email:', req.body.email);
        console.log('Password:', req.body.password);


        const { email, password } = req.body;

        console.log('Fetching user from database:', email);
        const { data: users, error: userError } = await supabase
            .from('Users')
            .select(`
                id,
                email,
                password_hash,
                user_type,
                created_at,
                patients (
                    id,
                    name,
                    phone,
                    date_of_birth,
                    address,
                    emergency_contact
                )
                    `)
            .eq('email', email)
            .eq('user_type', 'patient')
            .single();
            

         if (userError || !userData) {
            console.warn('Invalid email or not a patient:', email);
            return res.status(StatusCodes.UNAUTHORIZED).json({ 
                error: 'Invalid email or password' 
            });
        }
        //check if there is a pending verification 
        const pendingVerification = otpStore.get(email);
        if (pendingVerification) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                error: 'Please verify your email first',
                requiresVerification: true
            });
        }
        // password
        console.log('Checking password for:', email);
        const isCorrectPassword = await bcrypt.compare(password, userData.password_hash);
        if (!isCorrectPassword) {
            console.warn('Invalid password attempt for:', email);
            return res.status(StatusCodes.UNAUTHORIZED).json({ 
                error: 'Invalid email or password' 
            });
        }
        //chck if patient profile exists
        if (!userData.patients || userData.patients.length === 0) {
            console.error('Patient profile not found for user:', userData.id);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
                error: 'Patient profile not found' 
            });
        }

        const patient = userData.patients[0];

       console.log('Patient logged in successfully:', userData.id);
       console.log('Generating JWT token for patient:', userData.id);
        const token = jwt.sign(
            { 
                user_id: userData.id, 
                patient_id: patient.id,
                user_type: 'patient' 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.status(StatusCodes.OK).json({ 
            message: 'Logged in successfully!', 
            token,
            user: {
                id: userData.id,
                email: userData.email,
                userType: userData.user_type
            },
            patient: {
                id: patient.id,
                name: patient.name,
                phone: patient.phone,
                dateOfBirth: patient.date_of_birth,
                address: patient.address,
                emergencyContact: patient.emergency_contact
            }
        });

    } catch (error) {
        console.error('Error during patient login:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            error: 'Internal Server Error',
            details: error.message 
        });
    }
};
const resendVerificationCode = async (req, res) => {
    try {
        console.log('Resend verification code request:', req.body);

        const { email } = req.body;

        // Check if there's a pending verification for this email
        const storedData = otpStore.get(email);
        
        if (!storedData) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'No pending verification found for this email'
            });
        }

        // Generate new OTP
        const newOtp = generateOTP();
        
        // Update stored data with new OTP and extended expiration
        otpStore.set(email, {
            ...storedData,
            otp: newOtp,
            expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
        });

        // Send new verification email
        try {
            await sendEmail(email, newOtp, 'OTPverify');
        } catch (emailError) {
            console.error('Error sending verification email:', emailError);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                error: 'Failed to send verification email'
            });
        }

        res.status(StatusCodes.OK).json({
            message: 'New verification code sent to your email'
        });

    } catch (error) {
        console.error('Error resending verification code:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            error: 'Internal Server Error',
            details: error.message 
        });
    }
};

export { registerPatient , login , verifyUserEmail, resetPassword , forgotPassword , resendVerificationCode };
