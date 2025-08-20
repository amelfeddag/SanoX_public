
import supabase from '../config/supabaseClient.js';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';


const getDoctorAvailableSlots = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { date, duration = 30 } = req.query; // duration in minutes

        console.log('Getting available slots for doctor:', { doctorId, date, duration });

        if (!date) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Date is required (format: YYYY-MM-DD)'
            });
        }

      
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Cannot book appointments for past dates'
            });
        }


        const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

        const { data: availability, error: availError } = await supabase
            .from('doctor_availability')
            .select('start_time, end_time')
            .eq('doctor_id', doctorId)
            .eq('day_of_week', dayOfWeek)
            .eq('is_active', true);

        if (availError) {
            console.error('Error fetching doctor availability:', availError);
            throw availError;
        }

        if (!availability || availability.length === 0) {
            return res.status(StatusCodes.OK).json({
                success: true,
                message: 'No availability found for this day',
                availableSlots: [],
                date
            });
        }

       //get existing doc appointments for the selected date
        const { data: existingAppointments, error: apptError } = await supabase
            .from('appointments')
            .select('appointment_time, duration_minutes')
            .eq('doctor_id', doctorId)
            .eq('appointment_date', date)
            .in('status', ['pending', 'confirmed']); 

        if (apptError) {
            console.error('Error fetching existing appointments:', apptError);
            throw apptError;
        }

       
        const availableSlots = [];
        const appointmentDuration = parseInt(duration);

        availability.forEach(slot => {
            const startTime = new Date(`2000-01-01T${slot.start_time}`);
            const endTime = new Date(`2000-01-01T${slot.end_time}`);
            
           //generate a slot 
            let currentSlot = new Date(startTime);
            
            while (currentSlot < endTime) {
                const slotEnd = new Date(currentSlot.getTime() + appointmentDuration * 60000);
                
                if (slotEnd <= endTime) {
                    const timeString = currentSlot.toTimeString().slice(0, 5); 
                    
                   //is there conflict
                    const isBooked = existingAppointments.some(appointment => {
                        const apptTime = new Date(`2000-01-01T${appointment.appointment_time}`);
                        const apptEnd = new Date(apptTime.getTime() + (appointment.duration_minutes || 30) * 60000);
                        
                        return (currentSlot < apptEnd && slotEnd > apptTime);
                    });
                    
                    if (!isBooked) {
                        availableSlots.push({
                            time: timeString,
                            available: true,
                            duration: appointmentDuration
                        });
                    }
                }
                
                currentSlot = new Date(currentSlot.getTime() + 30 * 60000);
            }
        });

        console.log(`Found ${availableSlots.length} available slots for ${date}`);

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Available slots retrieved successfully',
            date,
            doctorId,
            availableSlots,
            totalSlots: availableSlots.length
        });

    } catch (error) {
        console.error('Error getting available slots:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to get available slots',
            details: error.message
        });
    }
};


const bookAppointment = async (req, res) => {
    try {
        console.log('Booking appointment request:', req.body);
        
        const { 
            doctorId, 
            appointmentDate, 
            appointmentTime, 
            conversationId,
            urgencyLevel = 1,
            notes,
            duration = 30 
        } = req.body;

        const patientId = req.patient.id;

      
        if (!doctorId || !appointmentDate || !appointmentTime) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Doctor ID, appointment date, and time are required'
            });
        }

      
        const selectedDate = new Date(appointmentDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Cannot book appointments for past dates'
            });
        }

       
        const { data: doctor, error: doctorError } = await supabase
            .from('doctors')
            .select('id, first_name, last_name, is_active, user_id')
            .eq('id', doctorId)
            .eq('is_active', true)
            .single();

        if (doctorError || !doctor) {
            return res.status(StatusCodes.NOT_FOUND).json({
                error: 'Doctor not found or inactive'
            });
        }

       
        const { data: conflictingAppointments, error: conflictError } = await supabase
            .from('appointments')
            .select('id')
            .eq('doctor_id', doctorId)
            .eq('appointment_date', appointmentDate)
            .eq('appointment_time', appointmentTime)
            .in('status', ['pending', 'confirmed']);

        if (conflictError) {
            console.error('Error checking appointment conflicts:', conflictError);
            throw conflictError;
        }

        if (conflictingAppointments && conflictingAppointments.length > 0) {
            return res.status(StatusCodes.CONFLICT).json({
                error: 'This time slot is no longer available'
            });
        }

        
        const appointmentId = uuidv4();
        const { data: newAppointment, error: appointmentError } = await supabase
            .from('appointments')
            .insert([{
                id: appointmentId,
                patient_id: patientId,
                doctor_id: doctorId,
                conversation_id: conversationId || null,
                appointment_date: appointmentDate,
                appointment_time: appointmentTime,
                duration_minutes: parseInt(duration),
                urgency_level: parseInt(urgencyLevel),
                notes: notes || null,
                status: 'pending'
            }])
            .select(`
                id,
                appointment_date,
                appointment_time,
                duration_minutes,
                urgency_level,
                notes,
                status,
                created_at
            `)
            .single();

        if (appointmentError) {
            console.error('Error creating appointment:', appointmentError);
            throw appointmentError;
        }

        // send notification to doctor
        await createNotification({
            userId: doctor.user_id,
            title: 'Nouvelle demande de rendez-vous',
            message: `Vous avez reçu une nouvelle demande de rendez-vous pour le ${appointmentDate} à ${appointmentTime}`,
            type: 'appointment_request',
            relatedAppointmentId: appointmentId
        });

       
        await createNotification({
            userId: req.user.id, 
            title: 'Demande de rendez-vous envoyée',
            message: `Votre demande de rendez-vous avec Dr. ${doctor.first_name} ${doctor.last_name} a été envoyée. En attente de confirmation.`,
            type: 'appointment_request',
            relatedAppointmentId: appointmentId
        });

        console.log('Appointment booked successfully:', appointmentId);

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Appointment booked successfully',
            appointment: {
                id: newAppointment.id,
                doctorName: `Dr. ${doctor.first_name} ${doctor.last_name}`,
                appointmentDate: newAppointment.appointment_date,
                appointmentTime: newAppointment.appointment_time,
                duration: newAppointment.duration_minutes,
                status: newAppointment.status,
                urgencyLevel: newAppointment.urgency_level,
                notes: newAppointment.notes,
                createdAt: newAppointment.created_at
            }
        });

    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to book appointment',
            details: error.message
        });
    }
};


const getPatientAppointments = async (req, res) => {
    try {
        const patientId = req.patient.id;
        const { status, page = 1, limit = 10 } = req.query;

        console.log('Getting appointments for patient:', patientId);

        let query = supabase
            .from('appointments')
            .select(`
                id,
                appointment_date,
                appointment_time,
                duration_minutes,
                status,
                urgency_level,
                notes,
                created_at,
                doctors (
                    id,
                    first_name,
                    last_name,
                    phone,
                    specialties (
                        name
                    )
                )
            `)
            .eq('patient_id', patientId)
            .order('appointment_date', { ascending: false })
            .order('appointment_time', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

       
        const from = (parseInt(page) - 1) * parseInt(limit);
        const to = from + parseInt(limit) - 1;
        query = query.range(from, to);

        const { data: appointments, error, count } = await query;

        if (error) {
            console.error('Error fetching patient appointments:', error);
            throw error;
        }

       
        const formattedAppointments = appointments.map(appointment => ({
            id: appointment.id,
            date: appointment.appointment_date,
            time: appointment.appointment_time,
            duration: appointment.duration_minutes,
            status: appointment.status,
            urgencyLevel: appointment.urgency_level,
            notes: appointment.notes,
            createdAt: appointment.created_at,
            doctor: {
                id: appointment.doctors.id,
                name: `Dr. ${appointment.doctors.first_name} ${appointment.doctors.last_name}`,
                phone: appointment.doctors.phone,
                specialty: appointment.doctors.specialties?.name || 'N/A'
            }
        }));

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Appointments retrieved successfully',
            appointments: formattedAppointments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count || 0
            }
        });

    } catch (error) {
        console.error('Error getting patient appointments:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to retrieve appointments',
            details: error.message
        });
    }
};

//patients side
const cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const patientId = req.patient.id;
        const { reason } = req.body;

        console.log('Canceling appointment:', appointmentId);

        
        const { data: appointment, error: fetchError } = await supabase
            .from('appointments')
            .select(`
                id,
                status,
                appointment_date,
                appointment_time,
                doctors (
                    first_name,
                    last_name,
                    user_id
                )
            `)
            .eq('id', appointmentId)
            .eq('patient_id', patientId)
            .single();

        if (fetchError || !appointment) {
            return res.status(StatusCodes.NOT_FOUND).json({
                error: 'Appointment not found'
            });
        }

        if (!['pending', 'confirmed'].includes(appointment.status)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Cannot cancel this appointment'
            });
        }

        
        const { error: updateError } = await supabase
            .from('appointments')
            .update({
                status: 'cancelled',
                notes: reason ? `Cancelled by patient: ${reason}` : 'Cancelled by patient',
                updated_at: new Date().toISOString()
            })
            .eq('id', appointmentId);

        if (updateError) {
            console.error('Error cancelling appointment:', updateError);
            throw updateError;
        }

        
        await createNotification({
            userId: appointment.doctors.user_id,
            title: 'Rendez-vous annulé',
            message: `Le patient a annulé son rendez-vous du ${appointment.appointment_date} à ${appointment.appointment_time}`,
            type: 'appointment_cancelled',
            relatedAppointmentId: appointmentId
        });

        console.log('Appointment cancelled successfully:', appointmentId);

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Appointment cancelled successfully'
        });

    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to cancel appointment',
            details: error.message
        });
    }
};


const createNotification = async ({ userId, title, message, type, relatedAppointmentId }) => {
    try {
        await supabase
            .from('notifications')
            .insert([{
                user_id: userId,
                title,
                message,
                type,
                related_appointment_id: relatedAppointmentId || null,
                is_read: false
            }]);
        
        console.log('Notification created for user:', userId);
    } catch (error) {
        console.error('Error creating notification:', error);
        // Don't throw error - notifications are not critical for appointment booking
    }
};

export {
    getDoctorAvailableSlots,
    bookAppointment,
    getPatientAppointments,
    cancelAppointment
};