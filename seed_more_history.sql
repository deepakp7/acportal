-- Additional Historical Data for Hillingdon AC
-- Focus: Multiple dates for the same athletes at 'Arlington Drive'

-- These records will appear in the 'Analytics' tab when filtering by 'Arlington Drive'
-- or by these specific dates.

INSERT INTO attendance (athlete_id, coach_id, date, status, result, session_name)
SELECT a.id, a.coach_id, '2026-01-20'::DATE, 'Present', '3:15', 'Arlington Drive' FROM athletes a WHERE a.name = 'Alice Johnson'
UNION ALL
SELECT a.id, a.coach_id, '2026-01-13'::DATE, 'Present', '3:18', 'Arlington Drive' FROM athletes a WHERE a.name = 'Alice Johnson'
UNION ALL
SELECT a.id, a.coach_id, '2026-01-06'::DATE, 'Present', '3:22', 'Arlington Drive' FROM athletes a WHERE a.name = 'Alice Johnson'
UNION ALL
SELECT a.id, a.coach_id, '2026-01-20'::DATE, 'Present', '2:55', 'Arlington Drive' FROM athletes a WHERE a.name = 'Bob Smith'
UNION ALL
SELECT a.id, a.coach_id, '2026-01-13'::DATE, 'Present', '2:58', 'Arlington Drive' FROM athletes a WHERE a.name = 'Bob Smith'
UNION ALL
SELECT a.id, a.coach_id, '2026-01-06'::DATE, 'Present', '3:02', 'Arlington Drive' FROM athletes a WHERE a.name = 'Bob Smith'
ON CONFLICT (athlete_id, date) DO UPDATE 
SET result = EXCLUDED.result, session_name = EXCLUDED.session_name;
