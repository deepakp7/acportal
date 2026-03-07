-- Coaches table
CREATE TABLE IF NOT EXISTS coaches (
    id TEXT PRIMARY KEY, -- Using TEXT to match your C1, C2 IDs or UUID
    name TEXT NOT NULL,
    team_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert initial coaches
INSERT INTO coaches (id, name, team_name) VALUES
('C1', 'Sarah Speed', 'Falcons'),
('C2', 'Mike Distance', 'Thunderbirds'),
('C3', 'Pauline Senior', 'Eagles')
ON CONFLICT (id) DO NOTHING;

-- Athletes table schema for Hillingdon AC Portal
CREATE TABLE IF NOT EXISTS athletes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('juniors', 'seniors')),
    state TEXT NOT NULL,
    hac_id TEXT UNIQUE,
    ea_id TEXT UNIQUE,
    photo_url TEXT,
    coach_id TEXT REFERENCES coaches(id) ON DELETE SET NULL,
    track_fees_paid BOOLEAN DEFAULT false,
    membership_paid BOOLEAN DEFAULT false,
    dob DATE,
    notes TEXT,
    parent_contacts JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_athletes_email ON athletes(email);
CREATE INDEX IF NOT EXISTS idx_athletes_state ON athletes(state);
CREATE INDEX IF NOT EXISTS idx_athletes_type ON athletes(type);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
    coach_id TEXT REFERENCES coaches(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Present', 'Absent', 'Late')),
    result TEXT, -- Optional: trial result, notes, etc.
    session_name TEXT DEFAULT 'Training Session',
    UNIQUE(athlete_id, date) -- Prevent duplicate attendance for same athlete on same day
);

-- Track Payments table for monthly tracking
CREATE TABLE IF NOT EXISTS track_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    paid BOOLEAN DEFAULT true,
    amount DECIMAL(10,2),
    notes TEXT,
    UNIQUE(athlete_id, month, year)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_coach_id ON attendance(coach_id);
CREATE INDEX IF NOT EXISTS idx_attendance_athlete_id ON attendance(athlete_id);
CREATE INDEX IF NOT EXISTS idx_track_payments_athlete_id ON track_payments(athlete_id);

-- Meets table
CREATE TABLE IF NOT EXISTS meets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    name TEXT NOT NULL,
    date DATE NOT NULL,
    location TEXT,
    description TEXT,
    events JSONB DEFAULT '[]'::jsonb -- List of available events for this meet
);

-- Meet Registrations
CREATE TABLE IF NOT EXISTS meet_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
    meet_id UUID REFERENCES meets(id) ON DELETE CASCADE,
    events JSONB DEFAULT '[]'::jsonb, -- Events the athlete is interested in
    notes TEXT,
    UNIQUE(athlete_id, meet_id)
);

-- Indexes for Meet Registrations
CREATE INDEX IF NOT EXISTS idx_meet_registrations_meet_id ON meet_registrations(meet_id);
CREATE INDEX IF NOT EXISTS idx_meet_registrations_athlete_id ON meet_registrations(athlete_id);

-- Insert initial sample meet
INSERT INTO meets (name, date, location, description, events) VALUES
('Middlesex County Championships', '2026-05-15', 'Lee Valley Athletics Centre', 'Annual county championships for all age groups.', '["100m", "200m", "400m", "800m", "1500m", "Long Jump", "High Jump", "Shot Put"]')
ON CONFLICT DO NOTHING;

-- Social Media Feature
CREATE TABLE IF NOT EXISTS club_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    author_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_url TEXT,
    media_type TEXT CHECK (media_type IN ('image', 'document')),
    title TEXT -- For documents or special announcements
);

CREATE TABLE IF NOT EXISTS club_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    post_id UUID REFERENCES club_posts(id) ON DELETE CASCADE,
    athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
    UNIQUE(post_id, athlete_id)
);

CREATE TABLE IF NOT EXISTS club_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    post_id UUID REFERENCES club_posts(id) ON DELETE CASCADE,
    athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
    content TEXT NOT NULL
);

-- Indexes for Social
CREATE INDEX IF NOT EXISTS idx_club_posts_author ON club_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_club_likes_post ON club_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_club_comments_post ON club_comments(post_id);

-- Sample Social Post
INSERT INTO club_posts (content, title, media_type) VALUES
('Excited to see everyone at the Middlesex County Championships this May! Check out the registration details in the portal.', 'Upcoming Championships', 'image')
ON CONFLICT DO NOTHING;
