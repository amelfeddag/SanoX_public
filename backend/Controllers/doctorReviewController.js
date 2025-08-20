import supabase from '../config/supabaseClient.js';
import { StatusCodes } from 'http-status-codes';


const getMyReviews = async (req, res) => {
    try {
        const doctorId = req.doctor?.id;
        const { 
            page = 1, 
            limit = 10, 
            rating_filter,
            sort_by = 'created_at',
            sort_order = 'desc',
            date_from,
            date_to
        } = req.query;

        console.log('Getting reviews for doctor:', doctorId);

        if (!doctorId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                error: 'Doctor authentication required'
            });
        }

        // Build query
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
                ),
                appointments (
                    id,
                    appointment_date,
                    appointment_time
                )
            `, { count: 'exact' })
            .eq('doctor_id', doctorId);

        // Apply filters
        if (rating_filter && rating_filter >= 1 && rating_filter <= 5) {
            query = query.eq('rating', parseInt(rating_filter));
        }

        if (date_from) {
            query = query.gte('created_at', new Date(date_from).toISOString());
        }

        if (date_to) {
            query = query.lte('created_at', new Date(date_to).toISOString());
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
            console.error('Error fetching doctor reviews:', reviewsError);
            throw reviewsError;
        }

        // Get review statistics
        const { data: allReviews, error: statsError } = await supabase
            .from('reviews')
            .select('rating, created_at')
            .eq('doctor_id', doctorId);

        if (statsError) {
            console.error('Error fetching review stats:', statsError);
        }

        // Calculate statistics
        let reviewStats = {
            totalReviews: 0,
            averageRating: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            recentTrend: { // Last 30 days vs previous 30 days
                current: 0,
                previous: 0,
                change: 0
            }
        };

        if (allReviews && allReviews.length > 0) {
            reviewStats.totalReviews = allReviews.length;
            const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
            reviewStats.averageRating = Math.round((totalRating / allReviews.length) * 10) / 10;
            
            // Rating distribution
            allReviews.forEach(review => {
                reviewStats.ratingDistribution[review.rating]++;
            });

            // Recent trend analysis
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

            const currentPeriodReviews = allReviews.filter(review => 
                new Date(review.created_at) >= thirtyDaysAgo
            );
            const previousPeriodReviews = allReviews.filter(review => {
                const reviewDate = new Date(review.created_at);
                return reviewDate >= sixtyDaysAgo && reviewDate < thirtyDaysAgo;
            });

            reviewStats.recentTrend.current = currentPeriodReviews.length;
            reviewStats.recentTrend.previous = previousPeriodReviews.length;
            
            if (reviewStats.recentTrend.previous > 0) {
                reviewStats.recentTrend.change = Math.round(
                    ((reviewStats.recentTrend.current - reviewStats.recentTrend.previous) / 
                     reviewStats.recentTrend.previous) * 100
                );
            } else {
                reviewStats.recentTrend.change = reviewStats.recentTrend.current > 0 ? 100 : 0;
            }
        }

        // Format response data
        const formattedReviews = reviews?.map(review => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            isAnonymous: review.is_anonymous,
            createdAt: review.created_at,
            patientName: review.is_anonymous ? 'Anonymous' : review.patients?.name,
            appointment: review.appointments ? {
                id: review.appointments.id,
                date: review.appointments.appointment_date,
                time: review.appointments.appointment_time
            } : null
        })) || [];

        // Calculate pagination info
        const totalPages = Math.ceil(count / parseInt(limit));
        const hasNextPage = parseInt(page) < totalPages;
        const hasPreviousPage = parseInt(page) > 1;

        return res.status(StatusCodes.OK).json({
            success: true,
            data: {
                reviews: formattedReviews,
                statistics: reviewStats,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems: count,
                    itemsPerPage: parseInt(limit),
                    hasNextPage,
                    hasPreviousPage
                },
                filters: {
                    ratingFilter: rating_filter,
                    sortBy: sort_by,
                    sortOrder: sort_order,
                    dateFrom: date_from,
                    dateTo: date_to
                }
            }
        });

    } catch (error) {
        console.error('Error in getMyReviews:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: 'Failed to fetch reviews',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

/**
 * Get review summary statistics for dashboard
 */
const getReviewsSummary = async (req, res) => {
    try {
        const doctorId = req.doctor?.id;

        if (!doctorId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                error: 'Doctor authentication required'
            });
        }

        const { data: reviews, error } = await supabase
            .from('reviews')
            .select('rating, created_at')
            .eq('doctor_id', doctorId);

        if (error) {
            console.error('Error fetching review summary:', error);
            throw error;
        }

        const summary = {
            totalReviews: reviews?.length || 0,
            averageRating: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            monthlyTrend: []
        };

        if (reviews && reviews.length > 0) {
            // Calculate average rating
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            summary.averageRating = Math.round((totalRating / reviews.length) * 10) / 10;

            // Rating distribution
            reviews.forEach(review => {
                summary.ratingDistribution[review.rating]++;
            });

            // Monthly trend for last 6 months
            const now = new Date();
            for (let i = 5; i >= 0; i--) {
                const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
                
                const monthlyReviews = reviews.filter(review => {
                    const reviewDate = new Date(review.created_at);
                    return reviewDate >= monthStart && reviewDate <= monthEnd;
                });

                summary.monthlyTrend.push({
                    month: monthStart.toISOString().slice(0, 7), // YYYY-MM format
                    count: monthlyReviews.length,
                    averageRating: monthlyReviews.length > 0 ? 
                        Math.round((monthlyReviews.reduce((sum, r) => sum + r.rating, 0) / monthlyReviews.length) * 10) / 10 : 0
                });
            }
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            data: summary
        });

    } catch (error) {
        console.error('Error in getReviewsSummary:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: 'Failed to fetch review summary'
        });
    }
};

/**
 * Respond to a review (optional feature)
 */
const respondToReview = async (req, res) => {
    try {
        const doctorId = req.doctor?.id;
        const { reviewId } = req.params;
        const { response } = req.body;

        if (!doctorId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                error: 'Doctor authentication required'
            });
        }

        if (!response || response.trim().length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Response text is required'
            });
        }

        if (response.length > 1000) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Response must be less than 1000 characters'
            });
        }

        // Verify the review belongs to this doctor
        const { data: review, error: reviewError } = await supabase
            .from('reviews')
            .select('id, doctor_id')
            .eq('id', reviewId)
            .eq('doctor_id', doctorId)
            .single();

        if (reviewError || !review) {
            return res.status(StatusCodes.NOT_FOUND).json({
                error: 'Review not found'
            });
        }

        // Update the review with doctor's response
        const { data: updatedReview, error: updateError } = await supabase
            .from('reviews')
            .update({
                doctor_response: response,
                response_date: new Date().toISOString()
            })
            .eq('id', reviewId)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating review response:', updateError);
            throw updateError;
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Response added successfully',
            data: updatedReview
        });

    } catch (error) {
        console.error('Error in respondToReview:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: 'Failed to add response'
        });
    }
};

export {
    getMyReviews,
    getReviewsSummary,
    respondToReview
};