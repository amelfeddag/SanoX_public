import supabase from './config/supabaseClient.js';

const testSupabaseConnection = async () => {
    try {
        console.log('Testing connection to Supabase...');

        // Simple query to fetch any existing users (or any other table)
        const { data, error } = await supabase.from('Users').select('*').limit(1);

        if (error) {
            console.error('❌ Error connecting to Supabase:', error);
        } else {
            console.log('✅ Successfully connected to Supabase! Sample data:', data);
        }
    } catch (err) {
        console.error('❌ Unexpected error:', err);
    }
};

// Run the function
testSupabaseConnection();
