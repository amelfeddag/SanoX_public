import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../config/supabaseClient.js'; 
import sendEmail from './Utils/sendEmail.js';
import { StatusCodes } from 'http-status-codes';
import { getSpecialties } from './doctorController.js'; 

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
                error: 'No verification request found for this email',
              
            });
        }
        console.log("rani hna")
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
        const { data: userData, error: userError } = await supabase
            .from('users')  // Fixed: lowercase table name
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
            
        if (userError || !userData) {  // Fixed: using userData instead of undefined variable
            console.warn('Invalid email or not a patient:', email);
            return res.status(StatusCodes.UNAUTHORIZED).json({ 
                error: 'Invalid email or password' 
            });
        }

        // Check if there is a pending verification 
        const pendingVerification = otpStore.get(email);
        if (pendingVerification) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                error: 'Please verify your email first',
                requiresVerification: true
            });
        }

        // Check password
        console.log('Checking password for:', email);
        const isCorrectPassword = await bcrypt.compare(password, userData.password_hash);
        if (!isCorrectPassword) {
            console.warn('Invalid password attempt for:', email);
            return res.status(StatusCodes.UNAUTHORIZED).json({ 
                error: 'Invalid email or password' 
            });
        }

        // Check if patient profile exists
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
/************************************************************************************************* */
const registerDoctor = async (req, res) => {
    try {
        console.log('Doctor registration request received:', req.body);

        const { 
            first_name,
            last_name,
            email, 
            password,
            specialty_id,
            license_number,
            phone, 
            address,
            latitude,        //geo corrdinates to use to get the doctors nearby
            longitude,       
            consultation_fee,
            bio,
            years_experience,
        } = req.body;

       
        if (!first_name || !last_name || !email || !password || !specialty_id || !license_number) {
            console.warn('missing required fields in doctor registration');
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                error: 'last_name,first_name, email, password, specialty, and license number are required' 
            });
        }

        //  email format  
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                error: 'Invalid email format' 
            });
        }

        //  password strength
        if (password.length < 8) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                error: 'Password must be at least 8 characters long' 
            });
        }

        // license format 
        const licenseRegex = /^[A-Z0-9]{6,15}$/; 
        if (!licenseRegex.test(license_number)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                error: 'Invalid license number format' 
            });
        }

        // Validate consultation fee if provided
        if (consultation_fee && (consultation_fee < 0 || consultation_fee > 100000)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                error: 'Consultation fee must be between 0 and 100,000' 
            });
        }

        // years of experience if provided
        if (years_experience && (years_experience < 0 || years_experience > 60)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                error: 'Years of experience must be between 0 and 60' 
            });
        }

        // validate coordinates if provided
        if (latitude && (latitude < -90 || latitude > 90)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                error: 'Latitude must be between -90 and 90' 
            });
        }
        if (longitude && (longitude < -180 || longitude > 180)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                error: 'Longitude must be between -180 and 180' 
            });
        }

        // check if email already exists in  table
        console.log('Checking if email already exists:', email);
        const { data: existingUser, error: findUserError } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .single();

        if (findUserError && findUserError.code !== 'PGRST116') {
            console.error('Error checking existing user:', findUserError);
            throw findUserError;
        }

        if (existingUser) {
            console.warn('Email already exists:', email);
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                error: 'Email already exists' 
            });
        }

        //ccheck if license number already exists
        console.log('Checking if license number already exists:', license_number);
        const { data: existingLicense, error: findLicenseError } = await supabase
            .from('doctors')
            .select('license_number')
            .eq('license_number', license_number)
            .single();

        if (findLicenseError && findLicenseError.code !== 'PGRST116') {
            console.error('Error checking existing license:', findLicenseError);
            throw findLicenseError;
        }

        if (existingLicense) {
            console.warn('License number already exists:', license_number);
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                error: 'License number already registered' 
            });
        }

    
        console.log('Hashing password for new doctor');
        const hashedPassword = await bcrypt.hash(password, 12); // Higher salt rounds for doctors
        const userId = uuidv4();
        const doctorId = uuidv4();

    // create account 
        console.log('Creating doctor user account:', { userId, email });
        const { data: newUser, error: userInsertError } = await supabase
            .from('users')
            .insert([
                {
                    id: userId,
                    email: email.toLowerCase(),
                    password_hash: hashedPassword,
                    user_type: 'doctor'
                }
            ])
            .select()
            .single();

        if (userInsertError) {
            console.error('Error creating doctor user:', userInsertError);
            throw userInsertError;
        }

        // Create doctor profile
        console.log('Creating doctor profile:', { doctorId, userId });
        const { data: newDoctor, error: doctorInsertError } = await supabase
            .from('doctors')
            .insert([
                {
                    id: doctorId,
                    user_id: userId,
                    first_name,
                    last_name,
                    specialty_id,
                    license_number,
                    phone: phone || null,
                    address: address || null,
                    latitude: latitude || null,
                    longitude: longitude || null,
                    consultation_fee: consultation_fee || null,
                    bio: bio || null,
                    years_experience: years_experience || null,
                    is_verified: false,  //admin ydirha aka us
                    is_active: true      // is directly active without verif
                }
            ])
            .select()
            .single();

        if (doctorInsertError) {
            console.error('Error creating doctor profile:', doctorInsertError);
            
           //delete user if creation failed
            await supabase
                .from('users')
                .delete()
                .eq('id', userId);
                
            throw doctorInsertError;
        }

    
        //jwt
        console.log('Generating JWT token for doctor:', userId);
        const token = jwt.sign(
            { 
                user_id: userId, 
                doctor_id: doctorId,
                user_type: 'doctor' 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        console.log('Fetching complete doctor data for response');
        const { data: doctorData, error: fetchError } = await supabase
            .from('doctors')
            .select(`
                id,
                first_name,
                last_name,
                license_number,
                phone,
                address,
                latitude,
                longitude,
                consultation_fee,
                bio,
                years_experience,
                is_verified,
                is_active,
                specialties (
                    id,
                    name,
                    description
                )
            `)
            .eq('id', doctorId)
            .single();

        if (fetchError) {
            console.error('Error fetching doctor data:', fetchError);
        }

        console.log('Doctor registered successfully:', { userId, doctorId });

        res.status(StatusCodes.CREATED).json({ 
            message: 'Doctor registered successfully!',
            token,
            user: {
                id: userId,
                email: newUser.email,
                userType: 'doctor'
            },
            doctor: {
                id: doctorId,
                first_name,
                last_name,
                license_number,
                phone,
                address,
                latitude,
                longitude,
                consultationFee: consultation_fee,
                bio,
                yearsExperience: years_experience,
                isVerified: false,
                isActive: true,
                specialty: doctorData?.specialties || { name: specialty_id.name }
            },
           
        });

    } catch (error) {
        console.error('Error during doctor registration:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            error: 'Internal Server Error',
            details: error.message 
        });
    }
};


const doctorLogin = async (req, res) => {
    try {
        console.log('Doctor login request received:', req.body);

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                error: 'Email and password are required' 
            });
        }

        // Fetch doctor user data
        console.log('Fetching doctor from database:', email);
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select(`
                id,
                email,
                password_hash,
                user_type,
                created_at,
                doctors (
                    id,
                    first_name,
                    last_name,
                    license_number,
                    phone,
                    address,
                    latitude,
                    longitude,
                    consultation_fee,
                    bio,
                    years_experience,
                    is_verified,
                    is_active,
                    specialties (
                        id,
                        name,
                        description
                    )
                )
            `)
            .eq('email', email.toLowerCase())
            .eq('user_type', 'doctor')
            .single();
            
        if (userError || !userData) {
            console.warn('Invalid email or not a doctor:', email);
            return res.status(StatusCodes.UNAUTHORIZED).json({ 
                error: 'Invalid email or password' 
            });
        }


        console.log('Checking password for doctor:', email);
        const isCorrectPassword = await bcrypt.compare(password, userData.password_hash);
        if (!isCorrectPassword) {
            console.warn('Invalid password attempt for doctor:', email);
            return res.status(StatusCodes.UNAUTHORIZED).json({ 
                error: 'Invalid email or password' 
            });
        }


        if (!userData.doctors || userData.doctors.length === 0) {
            console.error('Doctor profile not found for user:', userData.id);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
                error: 'Doctor profile not found' 
            });
        }

        const doctor = userData.doctors[0];

        if (!doctor.is_active) {
            console.warn('Inactive doctor account attempted login:', email);
            return res.status(StatusCodes.FORBIDDEN).json({ 
                error: 'Your account is currently inactive. Please contact support.' 
            });
        }

        console.log('Doctor logged in successfully:', userData.id);

        
        const token = jwt.sign(
            { 
                user_id: userData.id, 
                doctor_id: doctor.id,
                user_type: 'doctor' 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

    

        res.status(StatusCodes.OK).json({ 
            message: 'Doctor logged in successfully!', 
            token,
            user: {
                id: userData.id,
                email: userData.email,
                userType: userData.user_type
            },
            doctor: {
                id: doctor.id,
                first_name: doctor.first_name,
                last_name : doctor.last_name,
                licenseNumber: doctor.license_number,
                phone: doctor.phone,
                address: doctor.address,
                latitude: doctor.latitude,
                longitude: doctor.longitude,
                consultationFee: doctor.consultation_fee,
                bio: doctor.bio,
                yearsExperience: doctor.years_experience,
                isVerified: doctor.is_verified,
                isActive: doctor.is_active,
                specialty: doctor.specialties
            },
        });

    } catch (error) {
        console.error('Error during doctor login:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            error: 'Internal Server Error',
            details: error.message 
        });
    }
};


export { 

        registerPatient , 
        login , verifyUserEmail,
         resetPassword , forgotPassword , 
         resendVerificationCode , 
         registerDoctor,
         getSpecialties,
         doctorLogin

     };
