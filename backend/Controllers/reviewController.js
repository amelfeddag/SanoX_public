import supabase from '../config/supabaseClient.js';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';


const createReview = async (req, res) => {
    try {
        console.log('Creating review:', req.body);
        
        const { 
            doctorId, 
            appointmentId, 
            rating, 
            comment, 
            isAnonymous = false 
        } = req.body;

        const patientId = req.patient.id;

       
        if (!doctorId || !rating) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Doctor ID and rating are required'
            });
        }

        // Validate rating range
        if (rating < 1 || rating > 5) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Rating must be between 1 and 5'
            });
        }

      
        const { data: doctor, error: doctorError } = await supabase
            .from('doctors')
            .select('id, first_name, last_name, is_active')
            .eq('id', doctorId)
            .eq('is_active', true)
            .single();

        if (doctorError || !doctor) {
            return res.status(StatusCodes.NOT_FOUND).json({
                error: 'Doctor not found or inactive'
            });
        }

        // If appointmentId is provided, verify it exists and is completed
        let appointmentData = null;
        if (appointmentId) {
            const { data: appointment, error: appointmentError } = await supabase
                .from('appointments')
                .select('id, status, doctor_id, patient_id')
                .eq('id', appointmentId)
                .eq('patient_id', patientId)
                .eq('doctor_id', doctorId)
                .single();

            if (appointmentError || !appointment) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    error: 'Appointment not found or does not belong to you'
                });
            }

            if (appointment.status !== 'completed') {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    error: 'You can only review completed appointments'
                });
            }

            appointmentData = appointment;

            // Check if review already exists for this appointment
            const { data: existingReview, error: existingError } = await supabase
                .from('reviews')
                .select('id')
                .eq('appointment_id', appointmentId)
                .single();

            if (existingError && existingError.code !== 'PGRST116') {
                console.error('Error checking existing review:', existingError);
                throw existingError;
            }

            if (existingReview) {
                return res.status(StatusCodes.CONFLICT).json({
                    error: 'You have already reviewed this appointment'
                });
            }
        }

       
        const { data: completedAppointments, error: completedError } = await supabase
            .from('appointments')
            .select('id')
            .eq('patient_id', patientId)
            .eq('doctor_id', doctorId)
            .eq('status', 'completed')
            .limit(1);

        if (completedError) {
            console.error('Error checking completed appointments:', completedError);
            throw completedError;
        }

        if (!completedAppointments || completedAppointments.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'You can only review doctors you have had appointments with'
            });
        }

       
        const reviewId = uuidv4();
        const { data: newReview, error: reviewError } = await supabase
            .from('reviews')
            .insert([{
                id: reviewId,
                patient_id: patientId,
                doctor_id: doctorId,
                appointment_id: appointmentId || null,
                rating: parseInt(rating),
                comment: comment?.trim() || null,
                is_anonymous: Boolean(isAnonymous)
            }])
            .select(`
                id,
                rating,
                comment,
                is_anonymous,
                created_at,
                patients (
                    name
                )
            `)
            .single();

        if (reviewError) {
            console.error('Error creating review:', reviewError);
            throw reviewError;
        }

        console.log('Review created successfully:', reviewId);

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Review created successfully',
            review: {
                id: newReview.id,
                rating: newReview.rating,
                comment: newReview.comment,
                isAnonymous: newReview.is_anonymous,
                reviewerName: newReview.is_anonymous ? 'Patient Anonyme' : newReview.patients.name,
                createdAt: newReview.created_at,
                doctorName: `Dr. ${doctor.first_name} ${doctor.last_name}`
            }
        });

    } catch (error) {
        console.error('Error creating review:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to create review',
            details: error.message
        });
    }
};


const getDoctorReviews = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { 
            page = 1, 
            limit = 10, 
            rating_filter,
            sort_by = 'created_at',
            sort_order = 'desc'
        } = req.query;

        console.log('Getting reviews for doctor:', doctorId);

        // Validate doctor exists
        const { data: doctor, error: doctorError } = await supabase
            .from('doctors')
            .select('id, first_name, last_name')
            .eq('id', doctorId)
            .single();

        if (doctorError || !doctor) {
            return res.status(StatusCodes.NOT_FOUND).json({
                error: 'Doctor not found'
            });
        }

        
        let query = supabase
            .from('reviews')
            .select(`
                id,
                rating,
                comment,
                is_anonymous,
                created_at,
                patients (
                    name
                )
            `, { count: 'exact' })
            .eq('doctor_id', doctorId);

        
        if (rating_filter && rating_filter >= 1 && rating_filter <= 5) {
            query = query.eq('rating', parseInt(rating_filter));
        }

        // Apply sorting
        const validSortFields = ['created_at', 'rating'];
        const validSortOrders = ['asc', 'desc'];
        
        if (validSortFields.includes(sort_by) && validSortOrders.includes(sort_order)) {
            query = query.order(sort_by, { ascending: sort_order === 'asc' });
        } else {
            query = query.order('created_at', { ascending: false });
        }

        // Apply pagination
        const from = (parseInt(page) - 1) * parseInt(limit);
        const to = from + parseInt(limit) - 1;
        query = query.range(from, to);

        const { data: reviews, error: reviewsError, count } = await query;

        if (reviewsError) {
            console.error('Error fetching reviews:', reviewsError);
            throw reviewsError;
        }

        
        const { data: stats, error: statsError } = await supabase
            .from('reviews')
            .select('rating')
            .eq('doctor_id', doctorId);

        if (statsError) {
            console.error('Error fetching review stats:', statsError);
        }

        
        let reviewStats = {
            totalReviews: 0,
            averageRating: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };

        if (stats && stats.length > 0) {
            reviewStats.totalReviews = stats.length;
            const totalRating = stats.reduce((sum, review) => sum + review.rating, 0);
            reviewStats.averageRating = Math.round((totalRating / stats.length) * 10) / 10;
            
            stats.forEach(review => {
                reviewStats.ratingDistribution[review.rating]++;
            });
        }

        
        const formattedReviews = reviews.map(review => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            isAnonymous: review.is_anonymous,
            reviewerName: review.is_anonymous ? 'Patient Anonyme' : review.patients?.name || 'Patient',
            createdAt: review.created_at,
            timeAgo: getTimeAgo(new Date(review.created_at))
        }));

        console.log(`Found ${count} reviews for doctor ${doctorId}`);

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Doctor reviews retrieved successfully',
            doctorName: `Dr. ${doctor.first_name} ${doctor.last_name}`,
            reviews: formattedReviews,
            statistics: reviewStats,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count || 0,
                totalPages: Math.ceil((count || 0) / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Error getting doctor reviews:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to retrieve reviews',
            details: error.message
        });
    }
};


const getPatientReviews = async (req, res) => {
    try {
        const patientId = req.patient.id;
        const { page = 1, limit = 10 } = req.query;

        console.log('Getting reviews by patient:', patientId);

        let query = supabase
            .from('reviews')
            .select(`
                id,
                rating,
                comment,
                is_anonymous,
                created_at,
                doctors (
                    id,
                    first_name,
                    last_name,
                    specialties (
                        name
                    )
                ),
                appointments (
                    id,
                    appointment_date
                )
            `, { count: 'exact' })
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false });

        // Apply pagination
        const from = (parseInt(page) - 1) * parseInt(limit);
        const to = from + parseInt(limit) - 1;
        query = query.range(from, to);

        const { data: reviews, error, count } = await query;

        if (error) {
            console.error('Error fetching patient reviews:', error);
            throw error;
        }


        const formattedReviews = reviews.map(review => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            isAnonymous: review.is_anonymous,
            createdAt: review.created_at,
            doctor: {
                id: review.doctors.id,
                name: `Dr. ${review.doctors.first_name} ${review.doctors.last_name}`,
                specialty: review.doctors.specialties?.name || 'N/A'
            },
            appointmentDate: review.appointments?.appointment_date || null,
            timeAgo: getTimeAgo(new Date(review.created_at))
        }));

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Patient reviews retrieved successfully',
            reviews: formattedReviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count || 0,
                totalPages: Math.ceil((count || 0) / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Error getting patient reviews:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to retrieve patient reviews',
            details: error.message
        });
    }
};

//update a review (only by the patient who wrote it)
const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment, isAnonymous } = req.body;
        const patientId = req.patient.id;

        console.log('Updating review:', reviewId);

        //verify review belgons to patient
        const { data: review, error: fetchError } = await supabase
            .from('reviews')
            .select('id, rating, comment, is_anonymous')
            .eq('id', reviewId)
            .eq('patient_id', patientId)
            .single();

        if (fetchError || !review) {
            return res.status(StatusCodes.NOT_FOUND).json({
                error: 'Review not found or does not belong to you'
            });
        }

      
        if (rating && (rating < 1 || rating > 5)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Rating must be between 1 and 5'
            });
        }

      
        const updateData = {
            updated_at: new Date().toISOString()
        };

        if (rating !== undefined) updateData.rating = parseInt(rating);
        if (comment !== undefined) updateData.comment = comment?.trim() || null;
        if (isAnonymous !== undefined) updateData.is_anonymous = Boolean(isAnonymous);

      
        const { data: updatedReview, error: updateError } = await supabase
            .from('reviews')
            .update(updateData)
            .eq('id', reviewId)
            .select(`
                id,
                rating,
                comment,
                is_anonymous,
                created_at,
                updated_at
            `)
            .single();

        if (updateError) {
            console.error('Error updating review:', updateError);
            throw updateError;
        }

        console.log('Review updated successfully:', reviewId);

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Review updated successfully',
            review: {
                id: updatedReview.id,
                rating: updatedReview.rating,
                comment: updatedReview.comment,
                isAnonymous: updatedReview.is_anonymous,
                createdAt: updatedReview.created_at,
                updatedAt: updatedReview.updated_at
            }
        });

    } catch (error) {
        console.error('Error updating review:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to update review',
            details: error.message
        });
    }
};

//only by the patient who wrote it
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const patientId = req.patient.id;

        console.log('Deleting review:', reviewId);

        
        const { data: review, error: fetchError } = await supabase
            .from('reviews')
            .select('id')
            .eq('id', reviewId)
            .eq('patient_id', patientId)
            .single();

        if (fetchError || !review) {
            return res.status(StatusCodes.NOT_FOUND).json({
                error: 'Review not found or does not belong to you'
            });
        }

       
        const { error: deleteError } = await supabase
            .from('reviews')
            .delete()
            .eq('id', reviewId);

        if (deleteError) {
            console.error('Error deleting review:', deleteError);
            throw deleteError;
        }

        console.log('Review deleted successfully:', reviewId);

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Review deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to delete review',
            details: error.message
        });
    }
};


const getReviewableAppointments = async (req, res) => {
    try {
        const patientId = req.patient.id;

        console.log('Getting reviewable appointments for patient:', patientId);

        // Get completed appointments that don't have reviews yet
        const { data: appointments, error } = await supabase
            .from('appointments')
            .select(`
                id,
                appointment_date,
                appointment_time,
                doctors (
                    id,
                    first_name,
                    last_name,
                    specialties (
                        name
                    )
                ),
                reviews (
                    id
                )
            `)
            .eq('patient_id', patientId)
            .eq('status', 'completed')
            .order('appointment_date', { ascending: false });

        if (error) {
            console.error('Error fetching reviewable appointments:', error);
            throw error;
        }

       
        const reviewableAppointments = appointments
            .filter(appointment => !appointment.reviews || appointment.reviews.length === 0)
            .map(appointment => ({
                id: appointment.id,
                date: appointment.appointment_date,
                time: appointment.appointment_time,
                doctor: {
                    id: appointment.doctors.id,
                    name: `Dr. ${appointment.doctors.first_name} ${appointment.doctors.last_name}`,
                    specialty: appointment.doctors.specialties?.name || 'N/A'
                }
            }));

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Reviewable appointments retrieved successfully',
            appointments: reviewableAppointments,
            count: reviewableAppointments.length
        });

    } catch (error) {
        console.error('Error getting reviewable appointments:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to retrieve reviewable appointments',
            details: error.message
        });
    }
};

// Helper function to calculate time ago
const getTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} minutes`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} heures`;
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} jours`;
    
    return date.toLocaleDateString('fr-FR');
};

export {
    createReview,
    getDoctorReviews,
    getPatientReviews,
    updateReview,
    deleteReview,
    getReviewableAppointments
};