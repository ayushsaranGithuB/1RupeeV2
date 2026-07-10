-- Drop avatar_url column from users table
-- Avatar is now generated from user initials, no URL storage needed
ALTER TABLE users DROP COLUMN IF EXISTS avatar_url;
