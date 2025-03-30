import supabase from '../config/supabaseClient.js';

// @desc Get all doctors with location
// @route GET /api/doctors
// @access Public
export const getDoctors = async (req, res) => {
    try {
        console.log("Fetching doctors from the database...");
        
        const { data: doctors, error } = await supabase
            .from('doctors')
            .select('doctor_id, first_name, last_name, specialty, latitude, longitude');

        if (error) {
            console.error("Error fetching doctors:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        res.status(200).json(doctors);
    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
