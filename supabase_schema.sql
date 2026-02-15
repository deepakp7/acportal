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

-- Enable Row Level Security (optional but recommended)
-- ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Public read" ON athletes FOR SELECT USING (true);
-- CREATE POLICY "Admin write" ON athletes FOR ALL USING (true); -- Replace with proper auth check
