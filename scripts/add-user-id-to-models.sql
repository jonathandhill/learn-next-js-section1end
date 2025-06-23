-- Add user_id column to models table
-- This script adds a foreign key relationship to the auth.users table

-- Add the user_id column (nullable initially for existing data)
ALTER TABLE models ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add an index for better query performance
CREATE INDEX idx_models_user_id ON models(user_id);

-- Optional: Add a comment to document the relationship
COMMENT ON COLUMN models.user_id IS 'Foreign key reference to auth.users(id) - identifies the user who created this model'; 