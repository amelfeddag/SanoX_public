import express from 'express';


import { getSpecialties , getNearbyDoctors  , getAllDoctors} from '../Controllers/doctorController.js';

const router = express.Router();


/**
 * @swagger
 * /api/doctors/specialties:
 *   get:
 *     tags: [Doctors]
 *     summary: Get all medical specialties
 *     description: Retrieves a list of all available medical specialties for doctor registration
 *     responses:
 *       200:
 *         description: Specialties retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Specialties fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Specialty'
 *             example:
 *               success: true
 *               message: "Specialties fetched successfully"
 *               data:
 *                 - id: "550e8400-e29b-41d4-a716-446655440000"
 *                   name: "Médecine Générale"
 *                   description: "Médecin généraliste pour consultations générales"
 *                 - id: "550e8400-e29b-41d4-a716-446655440001"
 *                   name: "Cardiologie"
 *                   description: "Spécialiste des maladies cardiovasculaires"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */


/**
 * @swagger
 * /api/doctors/nearby:
 *   get:
 *     tags: [Doctors]
 *     summary: Get nearby doctors
 *     description: Finds doctors near a specified location, optionally filtered by specialty
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *         description: Latitude of patient's location
 *         example: 36.7538
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *         description: Longitude of patient's location
 *         example: 3.0588
 *       - in: query
 *         name: radius
 *         required: false
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Search radius in kilometers
 *         example: 10
 *       - in: query
 *         name: specialty_id
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by specific specialty
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *         description: Maximum number of doctors to return
 *         example: 20
 *       - in: query
 *         name: verified_only
 *         required: false
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Return only verified doctors
 *         example: true
 *     responses:
 *       200:
 *         description: Nearby doctors found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Nearby doctors found"
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Doctor'
 *                       - type: object
 *                         properties:
 *                           distance:
 *                             type: number
 *                             description: Distance in kilometers
 *                             example: 2.5
 *                 total:
 *                   type: integer
 *                   description: Total number of doctors found
 *                   example: 15
 *             example:
 *               success: true
 *               message: "Nearby doctors found"
 *               data:
 *                 - id: "doctor-uuid-1"
 *                   name: "Dr. Ahmed Benali"
 *                   licenseNumber: "AL123456"
 *                   phone: "+213555123456"
 *                   address: "123 Rue de la Santé, Alger"
 *                   latitude: 36.7538
 *                   longitude: 3.0588
 *                   consultationFee: 3000
 *                   bio: "Experienced cardiologist..."
 *                   yearsExperience: 10
 *                   isVerified: true
 *                   isActive: true
 *                   specialty:
 *                     id: "specialty-uuid"
 *                     name: "Cardiologie"
 *                     description: "Spécialiste des maladies cardiovasculaires"
 *                   distance: 2.5
 *               total: 15
 *       400:
 *         description: Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Latitude and longitude are required"
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /api/doctors:
 *   get:
 *     tags: [Doctors]
 *     summary: Get all doctors
 *     description: Retrieves a paginated list of all doctors with optional filters
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of doctors per page
 *         example: 20
 *       - in: query
 *         name: specialty_id
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by specific specialty
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *       - in: query
 *         name: verified_only
 *         required: false
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Return only verified doctors
 *         example: true
 *       - in: query
 *         name: active_only
 *         required: false
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Return only active doctors
 *         example: true
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search by doctor name or license number
 *         example: "Ahmed"
 *       - in: query
 *         name: min_experience
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Minimum years of experience
 *         example: 5
 *       - in: query
 *         name: max_fee
 *         required: false
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Maximum consultation fee
 *         example: 5000
 *       - in: query
 *         name: sort_by
 *         required: false
 *         schema:
 *           type: string
 *           enum: [name, experience, fee, created_at]
 *           default: created_at
 *         description: Sort field
 *         example: "name"
 *       - in: query
 *         name: sort_order
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *         example: "asc"
 *     responses:
 *       200:
 *         description: Doctors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Doctors retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Doctor'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     totalDoctors:
 *                       type: integer
 *                       example: 98
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                     hasPrevPage:
 *                       type: boolean
 *                       example: false
 *             example:
 *               success: true
 *               message: "Doctors retrieved successfully"
 *               data:
 *                 - id: "doctor-uuid-1"
 *                   name: "Dr. Ahmed Benali"
 *                   licenseNumber: "AL123456"
 *                   phone: "+213555123456"
 *                   address: "123 Rue de la Santé, Alger"
 *                   latitude: 36.7538
 *                   longitude: 3.0588
 *                   consultationFee: 3000
 *                   bio: "Experienced cardiologist..."
 *                   yearsExperience: 10
 *                   isVerified: true
 *                   isActive: true
 *                   specialty:
 *                     id: "specialty-uuid"
 *                     name: "Cardiologie"
 *                     description: "Spécialiste des maladies cardiovasculaires"
 *               pagination:
 *                 currentPage: 1
 *                 totalPages: 5
 *                 totalDoctors: 98
 *                 limit: 20
 *                 hasNextPage: true
 *                 hasPrevPage: false
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid page number"
 *       500:
 *         description: Internal server error
 */
router.get('/', getAllDoctors);
router.get('/specialties', getSpecialties);
router.get('/nearby', getNearbyDoctors);

export default router;
