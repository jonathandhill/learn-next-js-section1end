import { createClient } from '@supabase/supabase-js';
import modelsData from '../app/data/models.json';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: '.env' });

// Initialize Supabase client with your existing environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.log(
    'Make sure you have NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function migrateModelsToSupabase() {
  try {
    console.log('Starting migration of models to Supabase...');

    // Insert the models data
    console.log(`Inserting ${modelsData.length} models...`);

    const { data, error } = await supabase
      .from('models')
      .insert(modelsData)
      .select();

    if (error) {
      console.error('Error inserting models:', error);
      console.log(
        'Make sure you have created a "models" table in your Supabase database with the correct schema'
      );
      return;
    }

    console.log(
      `Successfully inserted ${data?.length || 0} models into Supabase!`
    );
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
migrateModelsToSupabase();
