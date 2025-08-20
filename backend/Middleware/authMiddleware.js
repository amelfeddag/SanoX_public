import jwt from 'jsonwebtoken';
import supabase from '../config/supabaseClient.js';
import UnauthenticatedError from '../Errors/UnauthenticatedError.js';

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthenticatedError('Authentication invalid');
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the user exists in the users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, user_type')
      .eq('id', payload.user_id)
      .single();

    if (userError || !user) {
      throw new UnauthenticatedError('Authentication invalid');
    }
    
    // Attach the user info to the request object
    req.user = { 
      id: payload.user_id,
      email: user.email,
      userType: user.user_type,
      patientId: payload.patient_id || null,
      doctorId: payload.doctor_id || null
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    throw new UnauthenticatedError('Authentication invalid');
  }
};

// Middleware specifically for patients
const authenticatePatient = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthenticatedError('Authentication invalid');
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the user exists and is a patient
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        user_type,
        patients (
          id,
          name
        )
      `)
      .eq('id', payload.user_id)
      .eq('user_type', 'patient')
      .single();

    if (userError || !userData || !userData.patients || userData.patients.length === 0) {
      throw new UnauthenticatedError('Patient authentication required');
    }
    
    // Attach the user and patient info to the request object
    req.user = { 
      id: userData.id,
      email: userData.email,
      userType: userData.user_type
    };
    
    req.patient = {
      id: userData.patients[0].id,
      name: userData.patients[0].name
    };

    next();
  } catch (error) {
    console.error('Patient authentication error:', error);
    throw new UnauthenticatedError('Patient authentication invalid');
  }
};

// Middleware specifically for doctors
const authenticateDoctor = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthenticatedError('Authentication invalid');
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the user exists and is a doctor
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        user_type,
        doctors (
          id,
          first_name,
          last_name,
          is_active,
          is_verified
        )
      `)
      .eq('id', payload.user_id)
      .eq('user_type', 'doctor')
      .single();

    if (userError || !userData || !userData.doctors || userData.doctors.length === 0) {
      throw new UnauthenticatedError('Doctor authentication required');
    }

    const doctor = userData.doctors[0];

    // Check if doctor is active
    if (!doctor.is_active) {
      throw new UnauthenticatedError('Doctor account is inactive');
    }
    
    // Attach the user and doctor info to the request object
    req.user = { 
      id: userData.id,
      email: userData.email,
      userType: userData.user_type
    };
    
    req.doctor = {
      id: doctor.id,
      firstName: doctor.first_name,
      lastName: doctor.last_name,
      isActive: doctor.is_active,
      isVerified: doctor.is_verified
    };

    next();
  } catch (error) {
    console.error('Doctor authentication error:', error);
    throw new UnauthenticatedError('Doctor authentication invalid');
  }
};

export default authenticateUser;
export { authenticatePatient, authenticateDoctor };