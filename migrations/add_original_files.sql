-- Add columns for original file storage
ALTER TABLE drawings 
ADD COLUMN IF NOT EXISTS original_file_path VARCHAR(500),
ADD COLUMN IF NOT EXISTS original_file_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS original_file_size INTEGER;

-- Update existing records to have original file info (for backward compatibility)
UPDATE drawings 
SET 
    original_file_path = file_path,
    original_file_name = file_name,
    original_file_size = file_size
WHERE original_file_path IS NULL;
