
import supabase from '../config/supabaseClient.js';
import { StatusCodes } from 'http-status-codes';


const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.id; // From auth middleware
        const { page = 1, limit = 20, unread_only = false } = req.query;

        console.log('Getting notifications for user:', userId);

        let query = supabase
            .from('notifications')
            .select(`
                id,
                title,
                message,
                type,
                is_read,
                created_at,
                related_appointment_id,
                appointments (
                    id,
                    appointment_date,
                    appointment_time,
                    status
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        // Filter for unread notifications only
        if (unread_only === 'true') {
            query = query.eq('is_read', false);
        }

        
        const from = (parseInt(page) - 1) * parseInt(limit);
        const to = from + parseInt(limit) - 1;
        query = query.range(from, to);

        const { data: notifications, error, count } = await query;

        if (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }

       
        const formattedNotifications = notifications.map(notification => ({
            id: notification.id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            isRead: notification.is_read,
            createdAt: notification.created_at,
            relatedAppointment: notification.appointments ? {
                id: notification.appointments.id,
                date: notification.appointments.appointment_date,
                time: notification.appointments.appointment_time,
                status: notification.appointments.status
            } : null
        }));

        
        const { count: unreadCount, error: countError } = await supabase
            .from('notifications')
            .select('id', { count: 'exact' })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (countError) {
            console.error('Error getting unread count:', countError);
        }

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Notifications retrieved successfully',
            notifications: formattedNotifications,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count || 0
            },
            unreadCount: unreadCount || 0
        });

    } catch (error) {
        console.error('Error getting notifications:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to retrieve notifications',
            details: error.message
        });
    }
};


const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.id;

        console.log('Marking notification as read:', notificationId);

        
        const { data: notification, error: fetchError } = await supabase
            .from('notifications')
            .select('id, is_read')
            .eq('id', notificationId)
            .eq('user_id', userId)
            .single();

        if (fetchError || !notification) {
            return res.status(StatusCodes.NOT_FOUND).json({
                error: 'Notification not found'
            });
        }

        if (notification.is_read) {
            return res.status(StatusCodes.OK).json({
                success: true,
                message: 'Notification already read'
            });
        }

       
        const { error: updateError } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);

        if (updateError) {
            console.error('Error marking notification as read:', updateError);
            throw updateError;
        }

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Notification marked as read'
        });

    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to mark notification as read',
            details: error.message
        });
    }
};


const markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        console.log('Marking all notifications as read for user:', userId);

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'All notifications marked as read'
        });

    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to mark all notifications as read',
            details: error.message
        });
    }
};


const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.id;

        console.log('Deleting notification:', notificationId);

        
        const { data: notification, error: fetchError } = await supabase
            .from('notifications')
            .select('id')
            .eq('id', notificationId)
            .eq('user_id', userId)
            .single();

        if (fetchError || !notification) {
            return res.status(StatusCodes.NOT_FOUND).json({
                error: 'Notification not found'
            });
        }

        
        const { error: deleteError } = await supabase
            .from('notifications')
            .delete()
            .eq('id', notificationId);

        if (deleteError) {
            console.error('Error deleting notification:', deleteError);
            throw deleteError;
        }

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Notification deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to delete notification',
            details: error.message
        });
    }
};


const getNotificationStats = async (req, res) => {
    try {
        const userId = req.user.id;

        
        const { count: totalCount, error: totalError } = await supabase
            .from('notifications')
            .select('id', { count: 'exact' })
            .eq('user_id', userId);

        if (totalError) {
            console.error('Error getting total notifications count:', totalError);
            throw totalError;
        }


        const { count: unreadCount, error: unreadError } = await supabase
            .from('notifications')
            .select('id', { count: 'exact' })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (unreadError) {
            console.error('Error getting unread notifications count:', unreadError);
            throw unreadError;
        }

        
        const { data: typeStats, error: typeError } = await supabase
            .from('notifications')
            .select('type')
            .eq('user_id', userId);

        if (typeError) {
            console.error('Error getting notification type stats:', typeError);
            throw typeError;
        }

        
        const typeCounts = typeStats.reduce((acc, notification) => {
            acc[notification.type] = (acc[notification.type] || 0) + 1;
            return acc;
        }, {});

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Notification statistics retrieved successfully',
            stats: {
                total: totalCount || 0,
                unread: unreadCount || 0,
                read: (totalCount || 0) - (unreadCount || 0),
                byType: typeCounts
            }
        });

    } catch (error) {
        console.error('Error getting notification stats:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to retrieve notification statistics',
            details: error.message
        });
    }
};


const createNotification = async ({ userId, title, message, type, relatedAppointmentId }) => {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .insert([{
                user_id: userId,
                title,
                message,
                type,
                related_appointment_id: relatedAppointmentId || null,
                is_read: false
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating notification:', error);
            throw error;
        }

        console.log('Notification created successfully:', data.id);
        return data;

    } catch (error) {
        console.error('Error in createNotification utility:', error);
        throw error;
    }
};

export {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getNotificationStats,
    createNotification
};