import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { INITIAL_EMPLOYEES } from './src/constants.js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function sync() {
  console.log("Starting sync with Supabase...");

  // We only want to update the ones that are in our initial list or have department changes
  // To be safe and thorough, we'll upsert all INITIAL_EMPLOYEES
  // This will update roles, departments, etc. for existing IDs
  
  const { data, error } = await supabase
    .from('employees')
    .upsert(INITIAL_EMPLOYEES);

  if (error) {
    console.error("Error syncing with Supabase:", error.message);
    if (error.message.includes("is not permitted")) {
      console.error("NOTE: The ANON_KEY does not have permission to update. You may need to disable RLS for the 'employees' table or use a Service Role Key.");
    }
  } else {
    console.log("Sync successful! All employee data updated in Supabase.");
  }
}

sync();
