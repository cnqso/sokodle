-- Sokoban Game Database Setup Script
-- This script recreates the database structure and populates it with default daily levels

-- Create the database (uncomment and modify if needed)
-- CREATE DATABASE IF NOT EXISTS sokoban_db;
-- USE sokoban_db;

-- ========================================
-- TABLE CREATION
-- ========================================

-- Daily levels table
CREATE TABLE IF NOT EXISTS daily_levels (
    daily_id INT PRIMARY KEY AUTO_INCREMENT,
    layout TEXT NOT NULL,
    date_of_level DATE NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily level attempts table
CREATE TABLE IF NOT EXISTS daily_level_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    daily_id INT NOT NULL,
    moves INT NOT NULL,
    time_ms INT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (daily_id) REFERENCES daily_levels(daily_id)
);

-- User submitted levels table
CREATE TABLE IF NOT EXISTS user_submitted_levels (
    user_level_id INT PRIMARY KEY AUTO_INCREMENT,
    user_name VARCHAR(255) NOT NULL,
    layout TEXT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User submitted level attempts table
CREATE TABLE IF NOT EXISTS user_submitted_level_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_level_id INT NOT NULL,
    moves INT NOT NULL,
    time_ms INT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_level_id) REFERENCES user_submitted_levels(user_level_id)
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Indexes for daily levels
CREATE INDEX IF NOT EXISTS idx_daily_levels_date ON daily_levels(date_of_level);
CREATE INDEX IF NOT EXISTS idx_daily_attempts_daily_id ON daily_level_attempts(daily_id);
CREATE INDEX IF NOT EXISTS idx_daily_attempts_ip ON daily_level_attempts(ip_address);

-- Indexes for user levels
CREATE INDEX IF NOT EXISTS idx_user_levels_uploaded_at ON user_submitted_levels(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_user_attempts_level_id ON user_submitted_level_attempts(user_level_id);
CREATE INDEX IF NOT EXISTS idx_user_attempts_ip ON user_submitted_level_attempts(ip_address);

-- ========================================
-- SAMPLE DAILY LEVELS
-- ========================================

-- Insert today's daily level (basic level from maps.ts)
INSERT INTO daily_levels (layout, date_of_level) VALUES
('[[1,1,1,1,1,1,1],[1,3,0,4,3,0,1],[1,1,2,2,1,0,1],[1,0,0,0,0,0,1],[1,1,1,1,1,1,1]]', CURDATE())
ON DUPLICATE KEY UPDATE layout = VALUES(layout);

-- Insert tomorrow's daily level (wikipedia level from maps.ts)
INSERT INTO daily_levels (layout, date_of_level) VALUES
('[[1,1,1,1,1,1,1,1],[1,1,1,0,0,0,1,1],[1,3,4,2,0,0,1,1],[1,1,1,0,2,3,1,1],[1,3,1,1,2,0,1,1],[1,0,1,0,3,0,1,1],[1,2,3,2,2,2,0,1],[1,0,0,0,3,0,0,1],[1,1,1,1,1,1,1,1]]', DATE_ADD(CURDATE(), INTERVAL 1 DAY))
ON DUPLICATE KEY UPDATE layout = VALUES(layout);

-- Insert a few more simple daily levels for the coming days
INSERT INTO daily_levels (layout, date_of_level) VALUES
-- Day 3: Simple 3x3 level
('[[1,1,1],[1,4,1],[1,3,1],[1,2,1],[1,1,1]]', DATE_ADD(CURDATE(), INTERVAL 2 DAY))
ON DUPLICATE KEY UPDATE layout = VALUES(layout);

-- Day 4: Simple level with multiple boxes
INSERT INTO daily_levels (layout, date_of_level) VALUES
('[[1,1,1,1,1],[1,4,0,3,1],[1,0,2,0,1],[1,3,0,4,1],[1,1,1,1,1]]', DATE_ADD(CURDATE(), INTERVAL 3 DAY))
ON DUPLICATE KEY UPDATE layout = VALUES(layout);

-- Day 5: Basic level with wall obstacles
INSERT INTO daily_levels (layout, date_of_level) VALUES
('[[1,1,1,1,1,1],[1,4,1,3,0,1],[1,0,1,2,0,1],[1,3,1,0,4,1],[1,0,0,0,0,1],[1,1,1,1,1,1]]', DATE_ADD(CURDATE(), INTERVAL 4 DAY))
ON DUPLICATE KEY UPDATE layout = VALUES(layout);

-- Day 6: Another simple level
INSERT INTO daily_levels (layout, date_of_level) VALUES
('[[1,1,1,1],[1,4,0,1],[1,2,3,1],[1,0,0,1],[1,1,1,1]]', DATE_ADD(CURDATE(), INTERVAL 5 DAY))
ON DUPLICATE KEY UPDATE layout = VALUES(layout);

-- Day 7: Weekend level - slightly more challenging
INSERT INTO daily_levels (layout, date_of_level) VALUES
('[[1,1,1,1,1,1,1],[1,4,0,1,0,3,1],[1,0,2,2,2,0,1],[1,3,0,1,0,4,1],[1,1,1,1,1,1,1]]', DATE_ADD(CURDATE(), INTERVAL 6 DAY))
ON DUPLICATE KEY UPDATE layout = VALUES(layout);

-- Day 8: Continue with simple levels
INSERT INTO daily_levels (layout, date_of_level) VALUES
('[[1,1,1,1,1],[1,4,1,3,1],[1,0,2,0,1],[1,3,1,4,1],[1,1,1,1,1]]', DATE_ADD(CURDATE(), INTERVAL 7 DAY))
ON DUPLICATE KEY UPDATE layout = VALUES(layout);

-- Day 9: Simple corner level
INSERT INTO daily_levels (layout, date_of_level) VALUES
('[[1,1,1,1],[1,4,0,1],[1,0,2,1],[1,3,0,1],[1,1,1,1]]', DATE_ADD(CURDATE(), INTERVAL 8 DAY))
ON DUPLICATE KEY UPDATE layout = VALUES(layout);

-- Day 10: Basic level with open space
INSERT INTO daily_levels (layout, date_of_level) VALUES
('[[1,1,1,1,1],[1,4,0,3,1],[1,0,2,0,1],[1,0,0,0,1],[1,1,1,1,1]]', DATE_ADD(CURDATE(), INTERVAL 9 DAY))
ON DUPLICATE KEY UPDATE layout = VALUES(layout);

-- ========================================
-- LEGEND FOR LEVEL LAYOUT VALUES:
-- ========================================
-- 0 = Empty space
-- 1 = Wall
-- 2 = Target/goal
-- 3 = Box
-- 4 = Player

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check that tables were created successfully
-- SELECT 'Tables created successfully!' as status;

-- Check daily levels
-- SELECT COUNT(*) as daily_levels_count FROM daily_levels;

-- Check that today's level exists
-- SELECT * FROM daily_levels WHERE date_of_level = CURDATE();

-- View all daily levels
-- SELECT daily_id, date_of_level, LEFT(layout, 50) as layout_preview FROM daily_levels ORDER BY date_of_level;
