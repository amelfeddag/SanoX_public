import supabase from '../config/supabaseClient.js';
import { StatusCodes } from 'http-status-codes';


const getDoctorAppointments = async (req, res) => {
    try {
        const doctorId = req.doctor?.id; 
        const { status, date, page = 1, limit = 20 } = req.query;

        console.log('Getting appointments for doctor:', doctorId);

        if (!doctorId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                error: 'Doctor authentication required'
            });
        }

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
                patients (
                    id,
                    name,
                    phone,
                    date_of_birth
                )
            `)
            .eq('doctor_id', doctorId)
            .order('appointment_date', { ascending: true })
            .order('appointment_time', { ascending: true });

       
        if (status) {
            query = query.eq('status', status);
        }

        if (date) {
            query = query.eq('appointment_date', date);
        }

       
        const from = (parseInt(page) - 1) * parseInt(limit);
        const to = from + parseInt(limit) - 1;
        query = query.range(from, to);

        const { data: appointments, error, count } = await query;

        if (error) {
            console.error('Error fetching doctor appointments:', error);
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
            patient: {
                id: appointment.patients.id,
                name: appointment.patients.name,
                phone: appointment.patients.phone,
                dateOfBirth: appointment.patients.date_of_birth,
                age: appointment.patients.date_of_birth ? 
                    new Date().getFullYear() - new Date(appointment.patients.date_of_birth).getFullYear() : null
            }
        }));

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Doctor appointments retrieved successfully',
            appointments: formattedAppointments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count || 0
            }
        });

    } catch (error) {
        console.error('Error getting doctor appointments:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to retrieve appointments',
            details: error.message
        });
    }
};


const confirmAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const doctorId = req.doctor?.id;
        const { notes } = req.body;

        console.log('Confirming appointment:', appointmentId, 'by doctor:', doctorId);

        if (!doctorId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                error: 'Doctor authentication required'
            });
        }

       
        const { data: appointment, error: fetchError } = await supabase
            .from('appointments')
            .select(`
                id,
                status,
                appointment_date,
                appointment_time,
                patient_id,
                patients (
                    name,
                    users (
                        id
                    )
                )
            `)
            .eq('id', appointmentId)
            .eq('doctor_id', doctorId)
            .single();

        if (fetchError || !appointment) {
            return res.status(StatusCodes.NOT_FOUND).json({
                error: 'Appointment not found'
            });
        }

        if (appointment.status !== 'pending') {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Can only confirm pending appointments'
            });
        }

      
        const { error: updateError } = await supabase
            .from('appointments')
            .update({
                status: 'confirmed',
                notes: notes ? `Doctor notes: ${notes}` : null,
                updated_at: new Date().toISOString()
            })
            .eq('id', appointmentId);

        if (updateError) {
            console.error('Error confirming appointment:', updateError);
            throw updateError;
        }

    
        await createNotification({
            userId: appointment.patients.users.id,
            title: 'Rendez-vous confirmé',
            message: `Votre rendez-vous du ${appointment.appointment_date} à ${appointment.appointment_time} a été confirmé par votre médecin`,
            type: 'appointment_confirmed',
            relatedAppointmentId: appointmentId
        });

        console.log('Appointment confirmed successfully:', appointmentId);

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Appointment confirmed successfully'
        });

    } catch (error) {
        console.error('Error confirming appointment:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to confirm appointment',
            details: error.message
        });
    }
};


const rejectAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const doctorId = req.doctor?.id;
        const { reason } = req.body;

        console.log('Rejecting appointment:', appointmentId, 'by doctor:', doctorId);

        if (!doctorId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                error: 'Doctor authentication required'
            });
        }

       
        const { data: appointment, error: fetchError } = await supabase
            .from('appointments')
            .select(`
                id,
                status,
                appointment_date,
                appointment_time,
                patients (
                    name,
                    users (
                        id
                    )
                )
            `)
            .eq('id', appointmentId)
            .eq('doctor_id', doctorId)
            .single();

        if (fetchError || !appointment) {
            return res.status(StatusCodes.NOT_FOUND).json({
                error: 'Appointment not found'
            });
        }

        if (!['pending', 'confirmed'].includes(appointment.status)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Cannot reject this appointment'
            });
        }

       
        const { error: updateError } = await supabase
            .from('appointments')
            .update({
                status: 'cancelled',
                notes: reason ? `Cancelled by doctor: ${reason}` : 'Cancelled by doctor',
                updated_at: new Date().toISOString()
            })
            .eq('id', appointmentId);

        if (updateError) {
            console.error('Error rejecting appointment:', updateError);
            throw updateError;
        }

       
        await createNotification({
            userId: appointment.patients.users.id,
            title: 'Rendez-vous annulé',
            message: `Votre rendez-vous du ${appointment.appointment_date} à ${appointment.appointment_time} a été annulé par votre médecin${reason ? `. Raison: ${reason}` : ''}`,
            type: 'appointment_cancelled',
            relatedAppointmentId: appointmentId
        });

        console.log('Appointment rejected successfully:', appointmentId);

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Appointment cancelled successfully'
        });

    } catch (error) {
        console.error('Error rejecting appointment:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to cancel appointment',
            details: error.message
        });
    }
};


const completeAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const doctorId = req.doctor?.id;
        const { notes, prescriptions } = req.body;

        console.log('Completing appointment:', appointmentId);

        if (!doctorId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                error: 'Doctor authentication required'
            });
        }

        // Verify appointment belongs to doctor and is confirmed
        const { data: appointment, error: fetchError } = await supabase
            .from('appointments')
            .select(`
                id,
                status,
                appointment_date,
                appointment_time,
                patients (
                    name,
                    users (
                        id
                    )
                )
            `)
            .eq('id', appointmentId)
            .eq('doctor_id', doctorId)
            .single();

        if (fetchError || !appointment) {
            return res.status(StatusCodes.NOT_FOUND).json({
                error: 'Appointment not found'
            });
        }

        if (appointment.status !== 'confirmed') {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Can only complete confirmed appointments'
            });
        }

       
        const completionNotes = [];
        if (notes) completionNotes.push(`Consultation notes: ${notes}`);
        if (prescriptions) completionNotes.push(`Prescriptions: ${prescriptions}`);

        const { error: updateError } = await supabase
            .from('appointments')
            .update({
                status: 'completed',
                notes: completionNotes.length > 0 ? completionNotes.join('; ') : 'Consultation completed',
                updated_at: new Date().toISOString()
            })
            .eq('id', appointmentId);

        if (updateError) {
            console.error('Error completing appointment:', updateError);
            throw updateError;
        }

       
        await createNotification({
            userId: appointment.patients.users.id,
            title: 'Consultation terminée',
            message: `Votre consultation du ${appointment.appointment_date} à ${appointment.appointment_time} est terminée. Consultez vos documents médicaux pour plus de détails.`,
            type: 'general',
            relatedAppointmentId: appointmentId
        });

        console.log('Appointment completed successfully:', appointmentId);

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Appointment marked as completed successfully'
        });

    } catch (error) {
        console.error('Error completing appointment:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to complete appointment',
            details: error.message
        });
    }
};


const getDoctorAvailability = async (req, res) => {
    try {
        const doctorId = req.doctor?.id;

        if (!doctorId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                error: 'Doctor authentication required'
            });
        }

        const { data: availability, error } = await supabase
            .from('doctor_availability')
            .select('*')
            .eq('doctor_id', doctorId)
            .order('day_of_week');

        if (error) {
            console.error('Error fetching doctor availability:', error);
            throw error;
        }

        // Format days of week
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const formattedAvailability = availability.map(slot => ({
            ...slot,
            dayName: daysOfWeek[slot.day_of_week]
        }));

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Doctor availability retrieved successfully',
            availability: formattedAvailability
        });

    } catch (error) {
        console.error('Error getting doctor availability:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to retrieve availability',
            details: error.message
        });
    }
};


const updateDoctorAvailability = async (req, res) => {
    try {
        const doctorId = req.doctor?.id;
        const { availability } = req.body; 

        if (!doctorId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                error: 'Doctor authentication required'
            });
        }

        if (!Array.isArray(availability)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Availability must be an array'
            });
        }

        // Delete existing availability
        const { error: deleteError } = await supabase
            .from('doctor_availability')
            .delete()
            .eq('doctor_id', doctorId);

        if (deleteError) {
            console.error('Error deleting existing availability:', deleteError);
            throw deleteError;
        }

      
        if (availability.length > 0) {
            const availabilityData = availability.map(slot => ({
                doctor_id: doctorId,
                day_of_week: slot.day_of_week,
                start_time: slot.start_time,
                end_time: slot.end_time,
                is_active: slot.is_active !== false 
            }));

            const { error: insertError } = await supabase
                .from('doctor_availability')
                .insert(availabilityData);

            if (insertError) {
                console.error('Error inserting new availability:', insertError);
                throw insertError;
            }
        }

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Doctor availability updated successfully'
        });

    } catch (error) {
        console.error('Error updating doctor availability:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to update availability',
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
      
    }
};

export {
    getDoctorAppointments,
    confirmAppointment,
    rejectAppointment,
    completeAppointment,
    getDoctorAvailability,
    updateDoctorAvailability
};