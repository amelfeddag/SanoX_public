// backend/Middleware/reviewValidation.js
import { body, param, query, validationResult } from 'express-validator';

// Validation middleware for creating reviews
const validateCreateReview = [
    body('doctorId')
        .notEmpty()
        .withMessage('Doctor ID is required')
        .isUUID()
        .withMessage('Invalid doctor ID format'),
    
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be an integer between 1 and 5'),
    
    body('comment')
        .optional()
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Comment must be between 10 and 1000 characters if provided'),
    
    body('isAnonymous')
        .optional()
        .isBoolean()
        .withMessage('isAnonymous must be a boolean'),
    
    body('appointmentId')
        .optional()
        .isUUID()
        .withMessage('Invalid appointment ID format')
];

// Validation middleware for updating reviews
const validateUpdateReview = [
    param('reviewId')
        .isUUID()
        .withMessage('Invalid review ID format'),
        
    body('rating')
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be an integer between 1 and 5'),
    
    body('comment')
        .optional()
        .trim()
        .custom((value) => {
            if (value === '') return true; // Allow empty string to remove comment
            if (value.length < 10 || value.length > 1000) {
                throw new Error('Comment must be between 10 and 1000 characters if provided');
            }
            return true;
        }),
    
    body('isAnonymous')
        .optional()
        .isBoolean()
        .withMessage('isAnonymous must be a boolean')
];

// Validation middleware for getting doctor reviews
const validateGetDoctorReviews = [
    param('doctorId')
        .isUUID()
        .withMessage('Invalid doctor ID format'),
        
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50'),
    
    query('rating_filter')
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating filter must be between 1 and 5'),
    
    query('sort_by')
        .optional()
        .isIn(['created_at', 'rating'])
        .withMessage('Sort by must be either created_at or rating'),
    
    query('sort_order')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Sort order must be either asc or desc')
];

// Validation middleware for pagination
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50')
];

// Validation middleware for review ID parameter
const validateReviewId = [
    param('reviewId')
        .isUUID()
        .withMessage('Invalid review ID format')
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const firstError = errors.array()[0];
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: firstError.msg,
            field: firstError.path
        });
    }
    next();
};

// Additional custom validation for business rules
const validateReviewBusinessRules = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;
        
        // If rating is 1 or 2, require a comment
        if ((rating === 1 || rating === 2) && (!comment || comment.trim().length < 10)) {
            return res.status(400).json({
                success: false,
                error: 'Low ratings (1-2 stars) require a detailed comment of at least 10 characters',
                field: 'comment'
            });
        }
        
        // Check for inappropriate content (basic filter)
        if (comment) {
            const inappropriateWords = [
                'merde', 'putain', 'connard', 'salaud', 'idiot', 
                // Add more words as needed
            ];
            
            const hasInappropriateContent = inappropriateWords.some(word => 
                comment.toLowerCase().includes(word.toLowerCase())
            );
            
            if (hasInappropriateContent) {
                return res.status(400).json({
                    success: false,
                    error: 'Review contains inappropriate language. Please keep reviews respectful.',
                    field: 'comment'
                });
            }
        }
        
        next();
    } catch (error) {
        console.error('Error in review business rules validation:', error);
        res.status(500).json({
            success: false,
            error: 'Validation error occurred'
        });
    }
};

// Sanitization middleware
const sanitizeReviewInput = (req, res, next) => {
    if (req.body.comment) {
        // Remove HTML tags and excessive whitespace
        req.body.comment = req.body.comment
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
            .trim();
    }
    
    // Ensure boolean values
    if (req.body.isAnonymous !== undefined) {
        req.body.isAnonymous = Boolean(req.body.isAnonymous);
    }
    
    // Ensure integer rating
    if (req.body.rating !== undefined) {
        req.body.rating = parseInt(req.body.rating, 10);
    }
    
    next();
};

export {
    validateCreateReview,
    validateUpdateReview,
    validateGetDoctorReviews,
    validatePagination,
    validateReviewId,
    handleValidationErrors,
    validateReviewBusinessRules,
    sanitizeReviewInput
};