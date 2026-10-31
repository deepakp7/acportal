-- ==============================================================================
-- HACY AI Assistant: Persistent Supabase Schema
-- Stores custom knowledge notes, admin-verified answers, and query audit logs.
-- ==============================================================================

-- 1. HACY Custom Knowledge Notes & Verified Admin Answers
CREATE TABLE IF NOT EXISTS hacy_knowledge_notes (
    id TEXT PRIMARY KEY DEFAULT ('custom_' || floor(extract(epoch from now()) * 1000)::text),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'admin_note',
    author TEXT DEFAULT 'Admin',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for searching categories and dates
CREATE INDEX IF NOT EXISTS idx_hacy_notes_category ON hacy_knowledge_notes(category);
CREATE INDEX IF NOT EXISTS idx_hacy_notes_created_at ON hacy_knowledge_notes(created_at DESC);

-- 2. HACY Query Audit Logs & Escalations
CREATE TABLE IF NOT EXISTS hacy_query_logs (
    id TEXT PRIMARY KEY,
    query TEXT NOT NULL,
    status TEXT DEFAULT 'unanswered', -- 'answered', 'unanswered', 'resolved_by_admin'
    confidence NUMERIC DEFAULT 0,
    sources_count INTEGER DEFAULT 0,
    admin_response TEXT,
    resolved_by TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for filtering status and ordering by date
CREATE INDEX IF NOT EXISTS idx_hacy_logs_status ON hacy_query_logs(status);
CREATE INDEX IF NOT EXISTS idx_hacy_logs_created_at ON hacy_query_logs(created_at DESC);

-- ==============================================================================
-- Row Level Security (RLS) & Policies
-- ==============================================================================
ALTER TABLE hacy_knowledge_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE hacy_query_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read & write operations for knowledge notes
CREATE POLICY "Allow public read hacy_knowledge_notes" 
    ON hacy_knowledge_notes FOR SELECT USING (true);

CREATE POLICY "Allow public insert hacy_knowledge_notes" 
    ON hacy_knowledge_notes FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update hacy_knowledge_notes" 
    ON hacy_knowledge_notes FOR UPDATE USING (true);

CREATE POLICY "Allow public delete hacy_knowledge_notes" 
    ON hacy_knowledge_notes FOR DELETE USING (true);

-- Allow public read & write operations for query logs
CREATE POLICY "Allow public read hacy_query_logs" 
    ON hacy_query_logs FOR SELECT USING (true);

CREATE POLICY "Allow public insert hacy_query_logs" 
    ON hacy_query_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update hacy_query_logs" 
    ON hacy_query_logs FOR UPDATE USING (true);

CREATE POLICY "Allow public delete hacy_query_logs" 
    ON hacy_query_logs FOR DELETE USING (true);

-- ==============================================================================
-- Initial Seed: Sample Club Announcements
-- ==============================================================================
INSERT INTO hacy_knowledge_notes (id, title, content, category, author) VALUES
('custom_seed_parking', 'Gatting Way Car Park Policy 2026', 'All athletes and visitors must pay for parking via PayByPhone or station ticket machines. Free parking is not permitted and council enforcement patrols regularly.', 'Facilities', 'Admin Desk'),
('custom_seed_spikes', 'Track Spikes Regulations', 'Maximum spike length allowed on Hillingdon Athletics Stadium synthetic track is 6mm pyramid or Christmas tree spikes. Needle spikes or spikes longer than 6mm are strictly prohibited.', 'Safety & Equipment', 'Coaching Desk')
ON CONFLICT (id) DO NOTHING;

