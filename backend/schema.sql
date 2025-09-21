-- Playzio PostgreSQL Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    prenom VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    friends TEXT[] DEFAULT '{}',
    friend_requests TEXT[] DEFAULT '{}',
    is_founder BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT DEFAULT '',
    creator VARCHAR(100) NOT NULL REFERENCES users(prenom),
    members TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Slots table
CREATE TABLE IF NOT EXISTS slots (
    id VARCHAR(50) PRIMARY KEY,
    date VARCHAR(20) NOT NULL,
    heure_debut VARCHAR(10),
    heure_fin VARCHAR(10),
    type TEXT, -- Can be JSON array for multiple activities
    custom_activity VARCHAR(100), -- For custom activity names when type is "Autre"
    description TEXT DEFAULT '',
    created_by VARCHAR(100) REFERENCES users(prenom),
    visible_to_groups TEXT[] DEFAULT '{}',
    participants TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Friend requests table
CREATE TABLE IF NOT EXISTS friend_requests (
    id VARCHAR(50) PRIMARY KEY,
    from_user VARCHAR(100) NOT NULL REFERENCES users(prenom),
    to_user VARCHAR(100) NOT NULL REFERENCES users(prenom),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table for slot discussions
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    slot_id VARCHAR(50) REFERENCES slots(id) ON DELETE CASCADE,
    user_prenom VARCHAR(100) REFERENCES users(prenom) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migration: Add is_founder column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'is_founder') THEN
        ALTER TABLE users ADD COLUMN is_founder BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Migration: Add custom_activity column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'slots' AND column_name = 'custom_activity') THEN
        ALTER TABLE slots ADD COLUMN custom_activity VARCHAR(100);
    END IF;
END $$;

-- Migration: Add visible_to_all column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'slots' AND column_name = 'visible_to_all') THEN
        ALTER TABLE slots ADD COLUMN visible_to_all BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Migration: Add visible_to_friends column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'slots' AND column_name = 'visible_to_friends') THEN
        ALTER TABLE slots ADD COLUMN visible_to_friends BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Migration: Add email column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'email') THEN
        ALTER TABLE users ADD COLUMN email VARCHAR(255);
    END IF;
END $$;

-- Migration: Add lieu column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'slots' AND column_name = 'lieu') THEN
        ALTER TABLE slots ADD COLUMN lieu VARCHAR(255) DEFAULT '';
    END IF;
END $$;

-- Migration: Add max_participants column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'slots' AND column_name = 'max_participants') THEN
        ALTER TABLE slots ADD COLUMN max_participants INTEGER DEFAULT NULL;
    END IF;
END $$;

-- Migration: Ensure email column allows NULL values
DO $$ 
BEGIN
    -- Check if email column exists and modify it to allow NULL
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'email') THEN
        -- Alter the column to explicitly allow NULL
        ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
    END IF;
END $$;

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id VARCHAR(50) PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(user_email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires ON password_reset_tokens(expires_at);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_prenom ON users(prenom);
CREATE INDEX IF NOT EXISTS idx_slots_date ON slots(date);
CREATE INDEX IF NOT EXISTS idx_slots_type ON slots USING GIN ((type::jsonb)) WHERE type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_slots_custom_activity ON slots(custom_activity);
CREATE INDEX IF NOT EXISTS idx_groups_creator ON groups(creator);
CREATE INDEX IF NOT EXISTS idx_groups_members ON groups USING GIN (members);
CREATE INDEX IF NOT EXISTS idx_friend_requests_users ON friend_requests(from_user, to_user);
CREATE INDEX IF NOT EXISTS idx_messages_slot_id ON messages(slot_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
