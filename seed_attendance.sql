-- Seed file to populate attendance history for Hillingdon AC
-- Run this in your Supabase SQL Editor

-- 1. Ensure Coaches exist
INSERT INTO coaches (id, name, team_name) 
VALUES 
('C1', 'Sarah Speed', 'Falcons'),
('C2', 'Mike Distance', 'Thunderbirds'),
('C3', 'Pauline Senior', 'Eagles')
ON CONFLICT (id) DO UPDATE SET team_name = EXCLUDED.team_name;

-- 2. Ensure Athletes exist and are assigned to coaches
INSERT INTO athletes (name, email, type, state, coach_id)
SELECT 'Alice Johnson', 'alice@example.com', 'juniors', 'In DT Academy', id FROM coaches WHERE name = 'Sarah Speed'
UNION ALL
SELECT 'Bob Smith', 'bob@example.com', 'juniors', 'Trial Passed', id FROM coaches WHERE name = 'Mike Distance'
UNION ALL
SELECT 'Charlie Brown', 'charlie@example.com', 'juniors', 'In DT Academy', id FROM coaches WHERE name = 'Mike Distance'
UNION ALL
SELECT 'Diana Prince', 'diana@example.com', 'seniors', 'Membership Form Completed', id FROM coaches WHERE name = 'Sarah Speed'
UNION ALL
SELECT 'Evan Wright', 'evan@example.com', 'seniors', 'Confirmation', id FROM coaches WHERE name = 'Mike Distance'
UNION ALL
SELECT 'Fiona Gallagher', 'fiona@example.com', 'juniors', 'Fully Registered', id FROM coaches WHERE name = 'Sarah Speed'
UNION ALL
SELECT 'George Bailey', 'george@example.com', 'seniors', 'Confirmation', id FROM coaches WHERE name = 'Pauline Senior'
ON CONFLICT (email) DO UPDATE SET coach_id = EXCLUDED.coach_id, state = EXCLUDED.state;

-- 3. Populate Attendance for the last 3 Tuesdays (Traditional training nights)
-- Feb 10, 2026
INSERT INTO attendance (athlete_id, coach_id, date, status, result, session_name)
SELECT a.id, a.coach_id, '2026-02-10'::DATE, 'Present', 'Solid session', 'Arlington Drive' FROM athletes a
WHERE a.name IN ('Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Fiona Gallagher')
UNION ALL
SELECT a.id, a.coach_id, '2026-02-10'::DATE, 'Absent', '-', 'Arlington Drive' FROM athletes a
WHERE a.name IN ('Diana Prince', 'Evan Wright', 'George Bailey')
ON CONFLICT (athlete_id, date) DO NOTHING;

-- Feb 3, 2026
INSERT INTO attendance (athlete_id, coach_id, date, status, result, session_name)
SELECT a.id, a.coach_id, '2026-02-03'::DATE, 'Present', 'PB on 100m', 'Speed Endurance' FROM athletes a
WHERE a.name IN ('Alice Johnson', 'Diana Prince', 'Fiona Gallagher')
UNION ALL
SELECT a.id, a.coach_id, '2026-02-03'::DATE, 'Present', '2:53 for 0.45m', 'Speed Endurance' FROM athletes a
WHERE a.name IN ('Bob Smith', 'Charlie Brown')
UNION ALL
SELECT a.id, a.coach_id, '2026-02-03'::DATE, 'Late', 'Arrived 15m late', 'Speed Endurance' FROM athletes a
WHERE a.name IN ('Evan Wright')
ON CONFLICT (athlete_id, date) DO NOTHING;

-- Jan 27, 2026
INSERT INTO attendance (athlete_id, coach_id, date, status, result, session_name)
SELECT a.id, a.coach_id, '2026-01-27'::DATE, 'Present', 'Warm up drills', 'Technical Session' FROM athletes a
WHERE a.name IN ('Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Evan Wright', 'Fiona Gallagher', 'George Bailey')
ON CONFLICT (athlete_id, date) DO NOTHING;
