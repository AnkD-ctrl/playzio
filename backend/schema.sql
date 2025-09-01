-- Playzio PostgreSQL Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    prenom VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    friends TEXT[] DEFAULT '{}',
    friend_requests TEXT[] DEFAULT '{}',
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_prenom ON users(prenom);
CREATE INDEX IF NOT EXISTS idx_slots_date ON slots(date);
CREATE INDEX IF NOT EXISTS idx_slots_type ON slots USING GIN ((type::jsonb)) WHERE type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_groups_creator ON groups(creator);
CREATE INDEX IF NOT EXISTS idx_groups_members ON groups USING GIN (members);
CREATE INDEX IF NOT EXISTS idx_friend_requests_users ON friend_requests(from_user, to_user);
