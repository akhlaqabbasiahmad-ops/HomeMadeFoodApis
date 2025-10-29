-- Initialize HomeMadeFood Database
-- This script runs when the PostgreSQL container starts

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create initial admin user (optional)
-- This will be done through the API after migrations