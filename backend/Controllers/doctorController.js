import first from 'ee-first';
import supabase from '../config/supabaseClient.js';
import { StatusCodes } from 'http-status-codes';





const getAllDoctors = async (req, res) => {
    try {
        console.log('Get all doctors request received:', req.query);

        const { 
            page = 1,
            limit = 20,
            specialty_id,
            active_only = true,
            search,
            min_experience,
            max_fee,
            sort_by = 'created_at',
            sort_order = 'desc'
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        if (pageNum < 1) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                error: 'Page number must be greater than 0' 
            });
        }

        if (limitNum < 1 || limitNum > 100) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                error: 'Limit must be between 1 and 100' 
            });
        }

       
        const validSortFields = ['name', 'years_experience', 'consultation_fee', 'created_at'];
        const validSortOrders = ['asc', 'desc'];

        if (!validSortFields.includes(sort_by)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                error: 'Invalid sort field. Use: name, years_experience, consultation_fee, or created_at' 
            });
        }

        if (!validSortOrders.includes(sort_order)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                error: 'Invalid sort order. Use: asc or desc' 
            });
        }

        console.log('Building doctors query with filters:', {
            page: pageNum,
            limit: limitNum,
            specialty_id,
            active_only,
            search,
            sort_by,
            sort_order
        });

        let query = supabase
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
                created_at,
                specialties (
                    id,
                    name,
                    description
                )
            `, { count: 'exact' }); 

        if (active_only === 'true') {
            query = query.eq('is_active', true);
        }

        if (specialty_id) {
            query = query.eq('specialty_id', specialty_id);
        }

        if (search && search.trim().length >= 2) {
            // Search in name and license number using ilike (case-insensitive)
            query = query.or(`name.ilike.%${search}%,license_number.ilike.%${search}%`);
        }

        if (min_experience) {
            const minExp = parseInt(min_experience);
            if (minExp >= 0) {
                query = query.gte('years_experience', minExp);
            }
        }

        if (max_fee) {
            const maxFee = parseFloat(max_fee);
            if (maxFee >= 0) {
                query = query.lte('consultation_fee', maxFee);
            }
        }

        // Apply sorting
        const ascending = sort_order === 'asc';
        
        switch (sort_by) {
            case 'name':
                query = query.order('name', { ascending });
                break;
            case 'years_experience':
                query = query.order('years_experience', { ascending, nullsFirst: false });
                break;
            case 'consultation_fee':
                query = query.order('consultation_fee', { ascending, nullsFirst: false });
                break;
            default:
                query = query.order('created_at', { ascending });
        }

        
        const from = (pageNum - 1) * limitNum;
        const to = from + limitNum - 1;
        query = query.range(from, to);

        const { data: doctors, error, count } = await query;

        if (error) {
            console.error('Error fetching doctors:', error);
            throw error;
        }

        //pagination info
        const totalDoctors = count || 0;
        const totalPages = Math.ceil(totalDoctors / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;

        // response 
        const formattedDoctors = doctors.map(doctor => ({
            id: doctor.id,
            first_name:doctor.first_name,
            last_name: doctor.last_name,
            licenseNumber: doctor.license_number,
            phone: doctor.phone,
            address: doctor.address,
            latitude: doctor.latitude,
            longitude: doctor.longitude,
            consultationFee: doctor.consultation_fee,
            bio: doctor.bio,
            yearsExperience: doctor.years_experience,
            isActive: doctor.is_active,
            createdAt: doctor.created_at,
            specialty: doctor.specialties
        }));

        console.log(`Found ${totalDoctors} doctors, returning page ${pageNum}/${totalPages}`);

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Doctors retrieved successfully',
            data: formattedDoctors,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalDoctors,
                limit: limitNum,
                hasNextPage,
                hasPrevPage
            },
            filters: {
                specialty_id: specialty_id || null,
                active_only: active_only === 'true',
                search: search || null,
                min_experience: min_experience ? parseInt(min_experience) : null,
                max_fee: max_fee ? parseFloat(max_fee) : null,
                sort_by,
                sort_order
            }
        });

    } catch (error) {
        console.error('Error fetching all doctors:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            error: 'Internal Server Error',
            details: error.message 
        });
    }
};


const getSpecialties = async (req, res) => {
    try {
        console.log('Fetching all specialties');
        
        const { data: specialties, error } = await supabase
            .from('specialties')
            .select('id, name, description')
            .order('name');

        if (error) {
            console.error('Error fetching specialties:', error);
            throw error;
        }

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Specialties fetched successfully',
            data: specialties
        });

    } catch (error) {
        console.error('Error in getSpecialties:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            error: 'Internal Server Error',
            details: error.message 
        });
    }
};


const getNearbyDoctors = async (req, res) => {
    try {
        console.log('Nearby doctors request received:', req.query);

        const { 
            latitude, 
            longitude, 
            radius = 10,          // Default 10km radius
            specialty_id,       //avoir ça mel front somehow?
            limit = 20,           // Default limit 20 doctors
            verified_only = false // Default show all doctors
        } = req.query;

        
        if (!latitude || !longitude) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                error: 'Latitude and longitude are required' 
            });
        }

       
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        const searchRadius = parseFloat(radius);
        const searchLimit = parseInt(limit);

        if (lat < -90 || lat > 90) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                error: 'Latitude must be between -90 and 90' 
            });
        }

        if (lng < -180 || lng > 180) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                error: 'Longitude must be between -180 and 180' 
            });
        }

        if (searchRadius < 1 || searchRadius > 100) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                error: 'Radius must be between 1 and 100 kilometers' 
            });
        }

        if (searchLimit < 1 || searchLimit > 50) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                error: 'Limit must be between 1 and 50' 
            });
        }

        console.log('Searching for doctors near:', { lat, lng, radius: searchRadius });

        let query = supabase
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
            .eq('is_active', true)
            .not('latitude', 'is', null)
            .not('longitude', 'is', null);

        if (specialty_id) {
            query = query.eq('specialty_id', specialty_id);
        }


        const { data: doctors, error } = await query;

        if (error) {
            console.error('Error fetching doctors:', error);
            throw error;
        }

        if (!doctors || doctors.length === 0) {
            return res.status(StatusCodes.OK).json({
                success: true,
                message: 'No doctors found in the specified area',
                data: [],
                total: 0
            });
        }

       
        const doctorsWithDistance = doctors
            .map(doctor => {
                if (!doctor.latitude || !doctor.longitude) return null;

                // Haversine formula to calculate distance
                const R = 6371; // Earth's radius in kilometers
                const dLat = (doctor.latitude - lat) * Math.PI / 180;
                const dLng = (doctor.longitude - lng) * Math.PI / 180;
                const a = 
                    Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(lat * Math.PI / 180) * Math.cos(doctor.latitude * Math.PI / 180) * 
                    Math.sin(dLng/2) * Math.sin(dLng/2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                const distance = R * c; 
                return {
                    id: doctor.id,
                    first_name: doctor.first_name,
                    last_name: doctor.last_name,
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
                    specialty: doctor.specialties,
                    distance: Math.round(distance * 10) / 10 // Round to 1 decimal place
                };
            })
            .filter(doctor => doctor && doctor.distance <= searchRadius) // Filter by radius
            .sort((a, b) => a.distance - b.distance) // Sort by distance
            .slice(0, searchLimit); 

        console.log(`Found ${doctorsWithDistance.length} doctors within ${searchRadius}km`);

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Nearby doctors found',
            data: doctorsWithDistance,
            total: doctorsWithDistance.length,
            searchParams: {
                latitude: lat,
                longitude: lng,
                radius: searchRadius,
                specialty_id: specialty_id || null
            }
        });

    } catch (error) {
        console.error('Error finding nearby doctors:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            error: 'Internal Server Error',
            details: error.message 
        });
    }
};

export  {
    getAllDoctors,
    getSpecialties,
    getNearbyDoctors,
}
