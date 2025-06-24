import type { Model } from '@/app/types';
import { createClient } from '@/lib/supabase/server';

export async function getAllModels(): Promise<Model[]> {
  // This is where you'd write code to fetch the list
  // of models from a database. We're mocking that with
  // our JSON array of data in models.json for now.
  const supabase = await createClient();
  const { data, error } = await supabase.from('models').select('*');
  if (error) {
    throw new Error('Failed to fetch models');
  }
  return data;
}

//When a user visits a specific 3D model detail page
export async function getModelById(id: string | number): Promise<Model> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('models')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned (model not found)
      throw new Error(`Model with id ${id} not found`);
    }
    throw new Error(`Failed to fetch model: ${error.message}`); //
  }
  // This is a fallback for when the model is not found in the database
  if (!data) {
    throw new Error(`Model with id ${id} not found`);
  }

  return data;
}

// Get models created by a specific user
export async function getModelsByUserId(userId: string): Promise<Model[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('models')
    .select('*')
    .eq('user_id', userId)
    .order('dateAdded', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch user's models: ${error.message}`);
  }

  return data || [];
}

// Create a new model for a user
export async function createModel(
  modelData: Omit<Model, 'id'>,
  userId: string
): Promise<Model> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('models')
    .insert([{ ...modelData, user_id: userId }])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create model: ${error.message}`);
  }

  return data;
}
