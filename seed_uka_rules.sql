-- Seed UKA Rules into hacy_knowledge_notes
INSERT INTO hacy_knowledge_notes (id, title, content, category, author) VALUES (
  'ea_age_group_overview',
  'England Athletics Age Group Changes (Effective 1 April 2026)',
  'England Athletics & UKA Age Group Changes (Effective 1 April 2026):
From 1 April 2026, the junior competition age categories under UK Athletics (UKA) rules changed from ''odd'' age groups (U13, U15, U17) to ''even'' age groups:
- U10: Primary School Years 3 and 4 (Multi-event run/jump/throw formats, e.g. funetics multi-challenge; sits outside formal competition rules)
- U12: Primary School Years 5 and 6 (Multi-event focus on fundamental movement skills)
- U14: Secondary School Years 7 and 8 (Aged 12 or 13 on 31st August)
- U16: Secondary School Years 9 and 10 (Aged 14 or 15 on 31st August)
- U18: Secondary School Years 11 and 12 (Aged 16 or 17 on 31st August)
- U20: School Year 13+ (Aged 18 or 19 on 31st August, and under 20 on 31st December of the calendar year)
- Senior: Aged 20 or over on 31st December in the calendar year of competition (or 31st August for Road/Cross Country)
- Masters: Aged 35 or over on the day of competition.

Why were the age groups changed?
1. Tackle Teenage Drop-Off: A major cause of young athletes dropping out was clashes between athletics and academic school exams (GCSEs in Year 11, A-Levels in Year 13). Under the new structure, athletes are at the top of their age groups in non-exam years (Year 10 and Year 12), significantly reducing stress!
2. Simplified Year-Round Pathway: Aligns the competition year across Cross Country, Road, and Track & Field from 1 October to 30 September under consistent age groups.
3. Gradual Progression: Provides age-appropriate implements, hurdle heights, and competition formats.',
  'UKA Rules & Regulations',
  'UK Athletics Official'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  category = EXCLUDED.category,
  updated_at = now();

INSERT INTO hacy_knowledge_notes (id, title, content, category, author) VALUES (
  'ea_age_dob_mapping',
  'Age Group Cut-Off Dates & School Year Mapping Table',
  'England Athletics Date of Birth & School Year Mapping:
Operative Cut-off Date: For England and Wales, age group eligibility is strictly determined by the athlete''s age on 31st August at the end of the Competition Year (not their school class).

| Date of Birth Range | Competition Age Group | Typical School Year |
| :--- | :--- | :--- |
| Sept 2017 - Aug 2018 | **Under 10 (U10)** | Year 4 |
| Sept 2016 - Aug 2017 | **Under 12 (U12)** | Year 5 |
| Sept 2015 - Aug 2016 | **Under 12 (U12)** | Year 6 |
| Sept 2014 - Aug 2015 | **Under 14 (U14)** | Year 7 |
| Sept 2013 - Aug 2014 | **Under 14 (U14)** | Year 8 |
| Sept 2012 - Aug 2013 | **Under 16 (U16)** | Year 9 |
| Sept 2011 - Aug 2012 | **Under 16 (U16)** | Year 10 |
| Sept 2010 - Aug 2011 | **Under 18 (U18)** | Year 11 |
| Sept 2009 - Aug 2010 | **Under 18 (U18)** | Year 12 |
| Sept 2008 - Aug 2009 | **Under 20 (U20)** | Year 13 |
| Jan 2007 - Dec 2008 | **Under 20 (U20)** | Year 14 |

*Note for Scotland & Northern Ireland: In Northern Ireland the qualifying cut-off is 31st December at the end of the year of competition. In Scotland it is 31st December after the competition year end.
*Schools Athletics Note: English Schools Athletic Association (ESAA) operates separate schools championships with independent age categories.',
  'UKA Rules & Regulations',
  'UK Athletics Official'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  category = EXCLUDED.category,
  updated_at = now();

INSERT INTO hacy_knowledge_notes (id, title, content, category, author) VALUES (
  'uka_rule_t3_s2_track_field_limits',
  'UKA Rule TR3 S2: Track & Field Event Limits (U14, U16, U18, U20)',
  'UKA Rule TR3 S2: Event Limits and Distance Restrictions for Young Athletes:

**Under 14 Boys & Girls:**
- Maximum Events: Maximum of 4 events on one day of an athletics meeting; if 4 are contested, ONE MUST BE A RELAY.
- Walking Events: Maximum of 3 running/walking events in one day (including any relay).
- Maximum Track Distance: Cannot exceed **1 mile (1609m)**. May contest **1200m Steeplechase**.
- Banned Events: **Strictly NO 300m or 400m races!**
- **Strictly NO Triple Jump!** (Triple jump is prohibited for U14 athletes to prevent growth plate stress).
- Middle Distance Limit: Cannot run in more than ONE race between 600m and 1 mile on the same day.

**Under 16 Boys & Girls:**
- Maximum Events: Maximum of 4 events on one day (maximum 3 individual events + 1 relay).
- Combined Events: If competing in a Combined Event, NO other events on the same day.
- Maximum Track Distance: Cannot exceed **3000m**.
- Steeplechase: Permitted over **1500m Steeplechase** (hurdle height 0.762m). Athletes turning 16 in the calendar year may contest 2000m steeplechase against U18s.
- Sprint Restrictions: National leagues and HCAF championships provide **300m races** for U16s. 400m may be provided at competition provider discretion.
- Middle Distance Limit: Cannot run in more than ONE race between 600m and 3000m on the same day.

**Under 18 Men & Women:**
- Maximum Events: Maximum of 4 events on one day (maximum 3 individual + 1 relay).
- Maximum Track Distance: Cannot exceed **5000m** (including Open Graded events).

**Under 20 Men & Women:**
- Maximum Events: Maximum of 5 events on one day.
- Maximum Track Distance: Up to and including **10,000m**.',
  'UKA Rules & Regulations',
  'UK Athletics Official'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  category = EXCLUDED.category,
  updated_at = now();

INSERT INTO hacy_knowledge_notes (id, title, content, category, author) VALUES (
  'uka_rule_tr22_hurdles',
  'UKA Rule TR22 S1: Hurdle Heights & Specifications (U14, U16, U18)',
  'UKA Rule TR22 S1: Official UKA Hurdle Specifications:

| Category | Distance | Hurdle Height | To 1st Hurdle | Between Hurdles | To Finish | No. of Hurdles | Marking Colour |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **U14 Boys** | 80m | **0.762m (2''6")** | 12.0m | 8.0m | 12.0m | 8 | Black |
| **U14 Boys** | 200m | **0.762m (2''6")** | 20.0m | 35.0m | 40.0m | 5 | Green |
| **U14 Girls** | 75m | **0.685m (2''3")** | 11.5m | 7.5m | 11.0m | 8 | Orange |
| **U14 Girls** | 200m | **0.685m (2''3")** | 20.0m | 35.0m | 40.0m | 5 | Green |
| **U16 Boys** | 100m | **0.838m (2''9")** | 13.0m | 8.5m | 10.5m | 10 | Yellow |
| **U16 Boys** | 300m | **0.762m (2''6")** | 50.0m | 35.0m | 40.0m | 7 | Green |
| **U16 Girls** | 80m | **0.762m (2''6")** | 12.0m | 8.0m | 12.0m | 8 | Black |
| **U16 Girls** | 300m | **0.762m (2''6")** | 50.0m | 35.0m | 40.0m | 7 | Green |
| **U18 Men** | 110m | **0.914m (3''0")** | 13.72m | 9.14m | 14.02m | 10 | Blue |
| **U18 Women** | 100m | **0.762m (2''6")** | 13.0m | 8.5m | 10.5m | 10 | Yellow |

*U12 Hurdle Guidelines (HCAF): Boys 75m (.685m, Orange), Girls 70m (.685m, Pink). Toppling weight for all U14 and U16 hurdles is 2.7kg.',
  'UKA Rules & Regulations',
  'UK Athletics Official'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  category = EXCLUDED.category,
  updated_at = now();

INSERT INTO hacy_knowledge_notes (id, title, content, category, author) VALUES (
  'uka_rule_throws_implements',
  'UKA Rule TR33-TR38: Throwing Implement Weights (Shot, Discus, Javelin, Hammer)',
  'UKA Official Throwing Implement Weights Table (2026-2028 UKA Rules):

### Shot Put (Rule TR33 S1)
- **U14 Boys**: 3.00kg (85-110mm) | **U14 Girls**: 2.72kg (85-110mm)
- **U16 Boys**: 4.00kg (95-110mm) | **U16 Girls**: 3.00kg (85-110mm)
- **U18 Men**: 5.00kg | **U18 Women**: 3.00kg
- **U20 Men**: 6.00kg | **U20 Women**: 4.00kg
- **Senior Men**: 7.26kg | **Senior Women**: 4.00kg

### Discus Throw (Rule TR34 S1)
- **U14 Boys**: 1.00kg | **U14 Girls**: 0.75kg
- **U16 Boys**: 1.25kg | **U16 Girls**: 1.00kg
- **U18 Men**: 1.50kg | **U18 Women**: 1.00kg
- **Senior Men**: 2.00kg | **Senior Women**: 1.00kg

### Javelin Throw (Rule TR38 S1)
- **U14 Boys**: 500g | **U14 Girls**: 400g
- **U16 Boys**: 600g | **U16 Girls**: 500g
- **U18 Men**: 700g | **U18 Women**: 500g
- **Senior Men**: 800g | **Senior Women**: 600g

### Hammer Throw (Rule TR36 S1)
- **U14 Boys**: 3.00kg | **U14 Girls**: 2.00kg
- **U16 Boys**: 4.00kg | **U16 Girls**: 3.00kg
- **U18 Men**: 5.00kg | **U18 Women**: 3.00kg
- **Senior Men**: 7.26kg | **Senior Women**: 4.00kg

*HCAF U12 Parameters: Shot 2.0kg-2.72kg; Discus 0.75kg; Javelin 400g; Hammer 2.0kg.',
  'UKA Rules & Regulations',
  'UK Athletics Official'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  category = EXCLUDED.category,
  updated_at = now();

INSERT INTO hacy_knowledge_notes (id, title, content, category, author) VALUES (
  'uka_rule_endurance_cross_country_road',
  'UKA Rule TR3 S3 & S4: Cross Country & Road Running Maximum Distances',
  'UKA Rule TR3 S3 & TR3 S4: Recommended & Maximum Distances for Endurance Disciplines:

**Cross Country Recommended Distances:**
- **U14 Boys & Girls**: 4,000 metres
- **U16 Boys & Girls**: 5,000 metres
- **U18 Men & Women**: 8,000 metres
- **U20 Men & Women**: 10,000 metres
- **Senior / Masters**: Unlimited

**Road Running (Age-Specific Races):**
- **U14**: Maximum 6,000 metres (6km)
- **U16**: Maximum 8,000 metres (8km)
- **U18**: Maximum 12,000 - 14,000 metres (12-14km)
- **U20**: Maximum 22,000 metres (22km, Half Marathon)
- **Senior / Masters**: Unlimited (Marathon, Ultra)

**Race Walking Maximum Distances:**
- **U14**: 3,000 metres
- **U16**: 5,000 metres
- **U18**: 15,000 metres
- **U20**: 20,000 metres
- **Senior**: Unlimited

*Under 12 Guidance: For athletes under 12, the maximum recommended distance is 3,000m with a focus strictly on participation rather than competition.',
  'UKA Rules & Regulations',
  'UK Athletics Official'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  category = EXCLUDED.category,
  updated_at = now();

INSERT INTO hacy_knowledge_notes (id, title, content, category, author) VALUES (
  'uka_simultaneous_entries_rule4',
  'UKA Rule TR4 & TR25: Simultaneous Event Entries & Track/Field Clashes',
  'UKA Technical Rule TR4.3: Competing in Simultaneous Track and Field Events:
- If an athlete is entered in both a Track Event and a Field Event, or in more than one Field Event taking place simultaneously:
  - The appropriate Field Referee may allow the athlete to take their trial in a different order from the official start list, for one round of trials at a time.
  - In High Jump and Pole Vault, the bar continues to rise and will not be lowered for an athlete returning from another event. If the athlete is not present when the bar is raised to a new height, they are deemed to have passed that height.
  - An athlete cannot take more than one trial in any single round of a Field Event before other competitors complete that round.
- Rule TR4.4 (Failure to Participate): If an athlete confirms participation (or is declared on the team sheet) but fails to participate without a valid medical reason, they can be excluded from all further events at that meeting.',
  'UKA Rules & Regulations',
  'UK Athletics Official'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  category = EXCLUDED.category,
  updated_at = now();

