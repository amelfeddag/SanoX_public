// import { createClient } from '@supabase/supabase-js';
// import dotenv from 'dotenv';

// dotenv.config();

// const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);

// export default supabase;

const supabase = {
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
  }),
  auth: {
    signInWithPassword: () => Promise.resolve({ data: null, error: null }),
    signUp: () => Promise.resolve({ data: null, error: null }),
    getSession: () => Promise.resolve({ data: null, error: null }),
  },
};

export default supabase;
