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
    email TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('juniors', 'seniors')),
    state TEXT NOT NULL,
    hac_id TEXT UNIQUE,
    ea_id TEXT UNIQUE,
    photo_url TEXT,
    coach_id TEXT REFERENCES coaches(id) ON DELETE SET NULL,
    track_fees_paid BOOLEAN DEFAULT false,
    membership_paid BOOLEAN DEFAULT false,
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

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_coach_id ON attendance(coach_id);
CREATE INDEX IF NOT EXISTS idx_attendance_athlete_id ON attendance(athlete_id);

-- Enable Row Level Security (optional but recommended)
-- ...
