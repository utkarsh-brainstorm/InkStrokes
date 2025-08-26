-- Drawing Tracker Database Schema
-- Modern, modular structure for robust data management

-- Create database (run this separately)
-- CREATE DATABASE drawing_tracker;

-- Use the database
-- \c drawing_tracker;

-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (for future authentication if needed)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Main drawings table - core data structure
CREATE TABLE drawings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    description TEXT,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    width INTEGER,
    height INTEGER,
    submission_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Favorites table - separate storage for best artworks
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    drawing_id UUID REFERENCES drawings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    display_order INTEGER DEFAULT 0,
    UNIQUE(drawing_id, user_id)
);

-- Activity calendar cache table for performance
CREATE TABLE daily_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    submission_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, activity_date)
);

-- Tags table for future categorization
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(7) DEFAULT '#6366f1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Drawing tags junction table
CREATE TABLE drawing_tags (
    drawing_id UUID REFERENCES drawings(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (drawing_id, tag_id)
);

-- Indexes for performance optimization
CREATE INDEX idx_drawings_user_date ON drawings(user_id, submission_date DESC);
CREATE INDEX idx_drawings_created_at ON drawings(created_at DESC);
CREATE INDEX idx_favorites_user ON favorites(user_id, added_at DESC);
CREATE INDEX idx_daily_activity_user_date ON daily_activity(user_id, activity_date);
CREATE INDEX idx_drawings_deleted ON drawings(is_deleted, user_id);

-- Function to update daily activity count
CREATE OR REPLACE FUNCTION update_daily_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Only count non-deleted drawings
        IF NEW.is_deleted = false THEN
            INSERT INTO daily_activity (user_id, activity_date, submission_count)
            VALUES (NEW.user_id, NEW.submission_date, 1)
            ON CONFLICT (user_id, activity_date)
            DO UPDATE SET 
                submission_count = daily_activity.submission_count + 1,
                updated_at = CURRENT_TIMESTAMP;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrease count when actually deleting
        UPDATE daily_activity 
        SET submission_count = GREATEST(submission_count - 1, 0),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = OLD.user_id AND activity_date = OLD.submission_date;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle soft delete (is_deleted flag change)
        IF OLD.is_deleted = false AND NEW.is_deleted = true THEN
            -- Decrease count when marking as deleted
            UPDATE daily_activity 
            SET submission_count = GREATEST(submission_count - 1, 0),
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = NEW.user_id AND activity_date = NEW.submission_date;
        ELSIF OLD.is_deleted = true AND NEW.is_deleted = false THEN
            -- Increase count when restoring
            INSERT INTO daily_activity (user_id, activity_date, submission_count)
            VALUES (NEW.user_id, NEW.submission_date, 1)
            ON CONFLICT (user_id, activity_date)
            DO UPDATE SET 
                submission_count = daily_activity.submission_count + 1,
                updated_at = CURRENT_TIMESTAMP;
        END IF;
        
        -- Handle date changes
        IF OLD.submission_date != NEW.submission_date AND NEW.is_deleted = false THEN
            -- Decrease count for old date
            UPDATE daily_activity 
            SET submission_count = GREATEST(submission_count - 1, 0),
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = OLD.user_id AND activity_date = OLD.submission_date;
            
            -- Increase count for new date
            INSERT INTO daily_activity (user_id, activity_date, submission_count)
            VALUES (NEW.user_id, NEW.submission_date, 1)
            ON CONFLICT (user_id, activity_date)
            DO UPDATE SET 
                submission_count = daily_activity.submission_count + 1,
                updated_at = CURRENT_TIMESTAMP;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic activity tracking
CREATE TRIGGER trigger_update_daily_activity
    AFTER INSERT OR UPDATE OR DELETE ON drawings
    FOR EACH ROW EXECUTE FUNCTION update_daily_activity();

-- Function to get activity calendar data
CREATE OR REPLACE FUNCTION get_activity_calendar(p_user_id UUID, p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE))
RETURNS TABLE(
    activity_date DATE,
    submission_count INTEGER,
    intensity_level INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        da.activity_date,
        da.submission_count,
        CASE 
            WHEN da.submission_count = 0 THEN 0
            WHEN da.submission_count = 1 THEN 1
            WHEN da.submission_count = 2 THEN 2
            WHEN da.submission_count >= 3 THEN 3
            ELSE 0
        END as intensity_level
    FROM daily_activity da
    WHERE da.user_id = p_user_id 
    AND EXTRACT(YEAR FROM da.activity_date) = p_year
    ORDER BY da.activity_date;
END;
$$ LANGUAGE plpgsql;

-- Insert default user for single-user setup
INSERT INTO users (username, email, password_hash) 
VALUES ('artist', 'artist@example.com', '$2b$10$dummy.hash.for.development') 
ON CONFLICT (username) DO NOTHING;

-- Insert some default tags
INSERT INTO tags (name, color) VALUES 
    ('Sketch', '#8B5CF6'),
    ('Digital', '#06B6D4'),
    ('Traditional', '#F59E0B'),
    ('Portrait', '#EF4444'),
    ('Landscape', '#10B981'),
    ('Abstract', '#F97316')
ON CONFLICT (name) DO NOTHING;
