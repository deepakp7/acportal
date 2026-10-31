/**
 * Meet Manager Data & Configuration
 * Supports Youth Development League (YDL), Alder Valley League, and Southern Vets League.
 * Includes full checklists (Before, During, After), Key Contacts, Timetables, and Host Venue Specs.
 */

export const LEAGUES = [
    {
        id: 'ydl',
        name: 'Youth Development League (YDL)',
        shortName: 'YDL',
        category: 'Junior Track & Field (U13, U15, U17, U20)',
        websiteUrl: 'https://www.ukydl.org.uk',
        dayPreference: 'Sunday',
        coordinator: 'Michael Illing to confirm',
        annualFeeRequired: true,
        annualFeeStatus: 'Paid for Season',
        color: 'emerald',
        badge: 'Premier Junior League',
        hostedByHac: true,
        hostFixtureDate: '2027-05-16', // Sunday
        hostVenue: 'Hillingdon Athletics Stadium, Gatting Way, Uxbridge UB8 1ES'
    },
    {
        id: 'alder_valley',
        name: 'Alder Valley League',
        shortName: 'Alder Valley',
        category: 'Development Track & Field (Boys & Girls)',
        websiteUrl: 'https://bmhac.co.uk/alder-valley-league/',
        dayPreference: 'Sunday',
        coordinator: 'Michael Illing to confirm',
        annualFeeRequired: true,
        annualFeeStatus: 'Paid for Season',
        color: 'blue',
        badge: 'Grassroots Development',
        hostedByHac: true,
        hostFixtureDate: '2027-06-20', // Sunday
        hostVenue: 'Hillingdon Athletics Stadium, Gatting Way, Uxbridge UB8 1ES'
    },
    {
        id: 'vets',
        name: 'Southern Veterans Track & Field League',
        shortName: 'VETS League',
        category: 'Masters Track & Field (M35+, W35+, M50, W50, M60, W60)',
        websiteUrl: 'http://www.scvac.org.uk',
        dayPreference: 'Monday',
        coordinator: 'Michael Illing (Confirmed - Monday Fixture)',
        annualFeeRequired: true,
        annualFeeStatus: 'Paid for Season',
        color: 'indigo',
        badge: 'Masters League',
        hostedByHac: true,
        hostFixtureDate: '2027-06-07', // Monday Evening
        hostVenue: 'Hillingdon Athletics Stadium, Gatting Way, Uxbridge UB8 1ES'
    }
];

export const INITIAL_CHECKLIST_ITEMS = [
    // ----------------------------------------------------
    // STAGE 1: BEFORE THE MEETING (19 Core Items)
    // ----------------------------------------------------
    {
        id: 'chk-pre-01',
        stage: 'before',
        task: 'Finalize Meet Dates (First Priority)',
        description: 'Ensure dates finalized for all 3 meets. Ask for a Sunday for YDL and Alder Valley; for VETS it is a Monday anyway. Michael Illing to confirm.',
        category: 'Scheduling & Governance',
        leagues: ['ydl', 'alder_valley', 'vets'],
        owner: 'Michael Illing / Meeting Secretary',
        critical: true,
        defaultStatus: 'completed',
        dueOffset: '12 weeks before',
        automationSupported: true,
        agentNote: 'Agent confirmed Sunday slots submitted for YDL and Alder Valley. Monday evening locked for VETS.'
    },
    {
        id: 'chk-pre-02',
        stage: 'before',
        task: 'League Affiliation & Annual Signup Fee',
        description: 'Signup to the league and pay the required annual participation fee for YDL, Alder Valley, and VETS.',
        category: 'Finance & Affiliation',
        leagues: ['ydl', 'alder_valley', 'vets'],
        owner: 'Club Treasurer / Martin S',
        critical: true,
        defaultStatus: 'completed',
        dueOffset: '10 weeks before',
        automationSupported: false,
        agentNote: 'Annual league subscriptions cleared through club account.'
    },
    {
        id: 'chk-pre-03',
        stage: 'before',
        task: 'Send Letter to All Club Managers (2 Weeks Before)',
        description: 'Send formal match invitation letter to all visiting club managers 2 weeks before the event with timetable, parking guidance (paid parking at Gatting Way), and officials allocations.',
        category: 'Club Communications',
        leagues: ['ydl', 'alder_valley', 'vets'],
        owner: 'Meet Manager',
        critical: true,
        defaultStatus: 'in_progress',
        dueOffset: '14 days before',
        automationSupported: true,
        agentNote: 'Agent ready to auto-draft formal notice letter pre-filled with timetables and rules.'
    },
    {
        id: 'chk-pre-04',
        stage: 'before',
        task: 'Book Stadium & Track Facilities',
        description: 'Confirm booking of Hillingdon Athletics Stadium (Gatting Way), 8-lane track, jumps pits, throwing cages, steeplechase, and clubhouse facilities.',
        category: 'Venue & Facilities',
        leagues: ['ydl', 'alder_valley', 'vets'],
        owner: 'Facilities Officer',
        critical: true,
        defaultStatus: 'completed',
        dueOffset: '8 weeks before',
        automationSupported: false,
        agentNote: 'Booking confirmed with Hillingdon Sports and Leisure Complex management.'
    },
    {
        id: 'chk-pre-05',
        stage: 'before',
        task: 'Book Photo Finish Team & Timing Gear',
        description: 'Book licensed electronic photo finish equipment and qualified timing operator team for accurate sprint and distance timing.',
        category: 'Technical Officials',
        leagues: ['ydl', 'alder_valley', 'vets'],
        owner: 'Technical Director',
        critical: true,
        defaultStatus: 'in_progress',
        dueOffset: '6 weeks before',
        automationSupported: true,
        agentNote: 'Photo finish operator contract sent; awaiting final staffing roster.'
    },
    {
        id: 'chk-pre-06',
        stage: 'before',
        task: 'Book First Aid Cover',
        description: 'Secure certified first aid medical cover (St John Ambulance or qualified independent event paramedics) on-site throughout the fixture.',
        category: 'Health & Safety',
        leagues: ['ydl', 'alder_valley', 'vets'],
        owner: 'Welfare Officer',
        critical: true,
        defaultStatus: 'completed',
        dueOffset: '6 weeks before',
        automationSupported: false,
        agentNote: 'First Aid crew confirmed with emergency response kit.'
    },
    {
        id: 'chk-pre-07',
        stage: 'before',
        task: 'Book Starters and Starter Assistants',
        description: 'Book UKA licensed Chief Starter and Starter Assistants (Marksmen) with gun ammunition / electronic start acoustic devices.',
        category: 'Technical Officials',
        leagues: ['ydl', 'alder_valley', 'vets'],
        owner: 'Officials Coordinator',
        critical: true,
        defaultStatus: 'in_progress',
        dueOffset: '4 weeks before',
        automationSupported: false,
        agentNote: 'Chief starter booked; 2 starter assistants required from visiting clubs.'
    },
    {
        id: 'chk-pre-08',
        stage: 'before',
        task: 'Book EDM (Electronic Distance Measurement)',
        description: 'Book Electronic Distance Measurement (EDM) equipment and operator for field throws (hammer, discus, javelin) and long jumps.',
        category: 'Technical Officials',
        leagues: ['ydl', 'alder_valley', 'vets'],
        owner: 'Field Referee',
        critical: false,
        defaultStatus: 'in_progress',
        dueOffset: '4 weeks before',
        automationSupported: false,
        agentNote: 'EDM unit reserved; prism reflectors and tripod checked.'
    },
    {
        id: 'chk-pre-09',
        stage: 'before',
        task: 'Book BIBS Order with Stacey and Sons',
        description: 'Book and order team athlete bibs and cloth race numbers by placing official order with Stacey and Sons in advance.',
        category: 'Equipment & Supplies',
        leagues: ['ydl', 'alder_valley', 'vets'],
        owner: 'Kit & Equipment Manager',
        critical: true,
        defaultStatus: 'in_progress',
        dueOffset: '4 weeks before',
        automationSupported: true,
        agentNote: 'Order template drafted for Stacey and Sons bib printing run.'
    },
    {
        id: 'chk-pre-10',
        stage: 'before',
        task: 'Print Event Cards (Keep 2 Copies)',
        description: 'Print event cards for track and field officials. Ensure 2 complete copies are kept at the control table.',
        category: 'Administration',
        leagues: ['ydl', 'alder_valley', 'vets'],
        owner: 'Meeting Secretary',
        critical: true,
        defaultStatus: 'not_started',
        dueOffset: '3 days before',
        automationSupported: true,
        agentNote: 'Dual copy card templates generated and ready to queue to printer.'
    },
    {
        id: 'chk-pre-11',
        stage: 'before',
        task: 'Publish Order of Events and Timings Timetable',
        description: 'Finalize and publish the official order of events, race timings, and field timetable to all clubs and website.',
        category: 'Scheduling & Governance',
        leagues: ['ydl', 'alder_valley', 'vets'],
        owner: 'Meet Manager',
        critical: true,
        defaultStatus: 'completed',
        dueOffset: '7 days before',
        automationSupported: true,
        agentNote: 'Schedule timetable synchronized with league regulations.'
    },
    {
        id: 'chk-pre-12',
        stage: 'before',
        task: 'Fetch Record Results Sheet from League Websites',
        description: 'Download official electronic scoring spreadsheet templates and declaration forms from respective websites: YDL (ukydl.org.uk), Alder Valley (bmhac.co.uk/alder-valley-league), and VETS (scvac.org.uk).',
        category: 'Administration',
        leagues: ['ydl', 'alder_valley', 'vets'],
        owner: 'Results Coordinator',
        critical: true,
        defaultStatus: 'completed',
        dueOffset: '5 days before',
        automationSupported: true,
        leagueWebsites: {
            ydl: 'https://www.ukydl.org.uk',
            alder_valley: 'https://bmhac.co.uk/alder-valley-league/',
            vets: 'http://www.scvac.org.uk'
        },
        agentNote: 'Official templates connected: YDL (ukydl.org.uk), Alder Valley (bmhac.co.uk), and SCVAC (scvac.org.uk).'
    },
    {
        id: 'chk-pre-13',
        stage: 'before',
        task: 'Get Ink for Printer',
        description: 'Verify black and color ink cartridges in the clubhouse results printer; procure replacement backup cartridges.',
        category: 'Supplies',
        leagues: ['ydl', 'alder_valley', 'vets'],
        owner: 'Administration Officer',
        critical: false,
        defaultStatus: 'in_progress',
        dueOffset: '4 days before',
        automationSupported: false,
        agentNote: 'Black toner at 85%; high-yield cyan/magenta spare cartridges stored in cabinet.'
    },
    {
        id: 'chk-pre-14',
        stage: 'before',
        task: 'Get Paper and Cards for Printer',
        description: 'Stock up on reams of standard A4 paper, heavy-stock card for field cards, clipboards, and weatherproof marker pens.',
        category: 'Supplies',
        leagues: ['ydl', 'alder_valley', 'vets'],
        owner: 'Administration Officer',
        critical: false,
        defaultStatus: 'completed',
        dueOffset: '4 days before',
        automationSupported: false,
        agentNote: '5 reams A4 paper and 200 cardstock sheets verified on-site.'
    },
    {
        id: 'chk-pre-15',
        stage: 'before',
        task: 'Arrange Food & Refreshments for Officials',
        description: 'Arrange lunch, sandwiches, hot drinks (tea/coffee), fruit, and water for volunteer track and field officials.',
        category: 'Hospitality',
        leagues: ['ydl', 'alder_valley', 'vets'],
        owner: 'Hospitality Lead',
        critical: true,
        defaultStatus: 'in_progress',
        dueOffset: '3 days before',
        automationSupported: false,
        agentNote: 'Catering order prepared for clubhouse hospitality room.'
    },
    {
        id: 'chk-pre-16',
        stage: 'before',
        task: 'Print Official and Non-Scoring Sheets',
        description: 'Print all scoring declaration sheets and non-scoring athlete sheets for reception check-in.',
        category: 'Administration',
        leagues: ['ydl', 'alder_valley', 'vets'],
        owner: 'Meeting Secretary',
        critical: true,
        defaultStatus: 'not_started',
        dueOffset: '2 days before',
        automationSupported: true,
        agentNote: 'Forms prepared; waiting for preliminary declarations cutoff.'
    },
    {
        id: 'chk-pre-17',
        stage: 'before',
        task: 'Confirm Car Parking Situation',
        description: 'Confirm Gatting Way car park operations. Note: Paid parking applies via machines/PayByPhone; remind all visiting clubs to avoid PCNs.',
        category: 'Logistics',
        leagues: ['ydl', 'alder_valley', 'vets'],
        owner: 'Logistics Coordinator',
        critical: true,
        defaultStatus: 'completed',
        dueOffset: '5 days before',
        automationSupported: true,
        agentNote: 'Parking advisory notice included in visiting team managers brief.'
    },
    {
        id: 'chk-pre-18',
        stage: 'before',
        task: 'Visit Venue to Confirm Equipment Availability',
        description: 'Physical inspection of hurdles, high jump uprights/mats, throws cages, steeplechase water jump, starter podium, and public address speaker system.',
        category: 'Venue & Facilities',
        leagues: ['ydl', 'alder_valley', 'vets'],
        owner: 'Technical Director',
        critical: true,
        defaultStatus: 'in_progress',
        dueOffset: '2 days before',
        automationSupported: false,
        agentNote: 'Walkthrough scheduled 48h prior to competition.'
    },
    {
        id: 'chk-pre-19',
        stage: 'before',
        task: 'Prepare Bar Code / QR Code for Results',
        description: 'Generate live barcode / QR code posters for display around the stadium so athletes, parents, and coaches can scan to view live/provisional results.',
        category: 'Digital & Live Scoring',
        leagues: ['ydl', 'alder_valley', 'vets'],
        owner: 'Digital Results Lead',
        critical: true,
        defaultStatus: 'completed',
        dueOffset: '1 day before',
        automationSupported: true,
        agentNote: 'QR code generated linking directly to the live match spreadsheet.'
    },

    // ----------------------------------------------------
    // STAGE 2: DURING THE MEETING (7 Core Items)
    // ----------------------------------------------------
    {
        id: 'chk-dur-01',
        stage: 'during',
        task: 'Arrival for the Meeting & Early Setup',
        description: 'Meet manager and core logistics team arrive early (at least 90 minutes prior to first event) to unlock, set up tables, and power systems.',
        category: 'Operations',
        leagues: ['ydl', 'alder_valley', 'vets'],
        owner: 'Meet Manager & Operations Team',
        critical: true,
        defaultStatus: 'not_started',
        dueOffset: 'Meet Day - 08:30 / 17:00',
        automationSupported: false,
        agentNote: 'Early access gate code confirmed with stadium management.'
    },
    {
        id: 'chk-dur-02',
        stage: 'during',
        task: 'Signing Sheets for Officials at Reception',
        description: 'Set out UKA attendance signing sheets at reception desk to record licensed officials for accreditation and travel expenses.',
        category: 'Reception & Check-in',
        leagues: ['ydl', 'alder_valley', 'vets'],
        owner: 'Reception Desk Lead',
        critical: true,
        defaultStatus: 'not_started',
        dueOffset: 'Meet Day - 09:00',
        automationSupported: false,
        agentNote: 'Sign-in registers laid out with UKA official license badges.'
    },
    {
        id: 'chk-dur-03',
        stage: 'during',
        task: 'Signing Sheets for Non-Scoring Officials at Reception',
        description: 'Set out registration and duty allocation sheets for volunteer non-scoring parent helpers, rakers, and timekeeper assistants.',
        category: 'Reception & Check-in',
        leagues: ['ydl', 'alder_valley', 'vets'],
        owner: 'Reception Desk Lead',
        critical: false,
        defaultStatus: 'not_started',
        dueOffset: 'Meet Day - 09:00',
        automationSupported: false,
        agentNote: 'Volunteer sign-up clipboards placed next to entrance.'
    },
    {
        id: 'chk-dur-04',
        stage: 'during',
        task: 'Bibs at Reception for Distribution',
        description: 'Lay out sorted team bib packages and safety pins at the front desk for team managers to collect on arrival.',
        category: 'Reception & Check-in',
        leagues: ['ydl', 'alder_valley', 'vets'],
        owner: 'Reception Desk Lead',
        critical: true,
        defaultStatus: 'not_started',
        dueOffset: 'Meet Day - 09:15',
        automationSupported: false,
        agentNote: 'Stacey & Sons bib packages organized alphabetically by club name.'
    },
    {
        id: 'chk-dur-05',
        stage: 'during',
        task: 'Welcome Officials & Morning Briefing',
        description: 'Host pre-event briefing meeting with referees, timekeepers, track judges, and field leads. Distribute radios and timetable.',
        category: 'Hospitality & Officials',
        leagues: ['ydl', 'alder_valley', 'vets'],
        owner: 'Meet Manager & Track Referee',
        critical: true,
        defaultStatus: 'not_started',
        dueOffset: 'Meet Day - 30m before start',
        automationSupported: false,
        agentNote: 'Briefing notes and radio channels assigned.'
    },
    {
        id: 'chk-dur-06',
        stage: 'during',
        task: 'Food Placed at the Right Location',
        description: 'Ensure food, hot beverages, and refreshments are set up in the designated officials hospitality room / clubhouse prior to lunch break.',
        category: 'Hospitality',
        leagues: ['ydl', 'alder_valley', 'vets'],
        owner: 'Hospitality Lead',
        critical: false,
        defaultStatus: 'not_started',
        dueOffset: 'Meet Day - 11:30',
        automationSupported: false,
        agentNote: 'Hospitality area sanitized and coffee urns preheated.'
    },
    {
        id: 'chk-dur-07',
        stage: 'during',
        task: 'Automatic Results Ingest via Card Reader (Step in Process)',
        description: 'Marked step: Card reader scans physical event cards and automatically publishes results into an Excel scoring spreadsheet instead of manual keyboard typing.',
        category: 'Digital & Live Scoring',
        leagues: ['ydl', 'alder_valley', 'vets'],
        owner: 'Results Processing Team',
        critical: true,
        defaultStatus: 'not_started',
        dueOffset: 'Throughout Meet',
        automationSupported: true,
        agentNote: 'Card reader scanner agent online: OCR / barcode batch parsing enabled directly into official league Excel workbook.'
    },

    // ----------------------------------------------------
    // STAGE 3: AFTER THE MEETING (2 Core Items)
    // ----------------------------------------------------
    {
        id: 'chk-post-01',
        stage: 'after',
        task: 'Send PDF of Results to All Club Managers',
        description: 'Verify final match standings, generate consolidated results PDF, and email to all participating club managers within 24 hours.',
        category: 'Post-Meet Distribution',
        leagues: ['ydl', 'alder_valley', 'vets'],
        owner: 'Results Secretary',
        critical: true,
        defaultStatus: 'not_started',
        dueOffset: 'Same Evening / +24h',
        automationSupported: true,
        agentNote: 'Agent can package verified results and distribution email list.'
    },
    {
        id: 'chk-post-02',
        stage: 'after',
        task: 'Send Results to Power of 10',
        description: 'Format official match results according to UKA / Athletics Data standards and submit to Power of 10 for national rankings.',
        category: 'Post-Meet Distribution',
        leagues: ['ydl', 'alder_valley', 'vets'],
        owner: 'Results Secretary',
        critical: true,
        defaultStatus: 'not_started',
        dueOffset: 'Within 48h of Meet',
        automationSupported: true,
        agentNote: 'Agent exports compliant Power of 10 text/CSV export format.'
    }
];

export const KEY_CONTACTS = [
    {
        id: 'con-01',
        name: 'Hillingdon Athletics Stadium (Gatting Way)',
        category: 'Stadium Contact',
        role: 'Venue Management & Booking Office',
        contactPerson: 'Stadium Operations Team',
        phone: '01895 250777',
        email: 'stadium.bookings@fusion-lifestyle.com',
        location: 'Gatting Way, Uxbridge UB8 1ES',
        notes: 'Paid parking managed by council/leisure complex. Contact 48h prior to arrange gate keys, floodlights, and clubhouse access.'
    },
    {
        id: 'con-02',
        name: 'Precision Timing & Photo Finish UK',
        category: 'Photo Finish',
        role: 'Chief Photo Finish Director',
        contactPerson: 'David Roberts (Senior Timing Operator)',
        phone: '07890 123456',
        email: 'photofinish@precisiontiming.co.uk',
        location: 'Timing Box / Track Finish Tower',
        notes: 'Requires dual power feed at finish line and ethernet cable to announcer and results room.'
    },
    {
        id: 'con-03',
        name: 'St John Ambulance / Event First Aid',
        category: 'First Aid',
        role: 'Lead Paramedic & First Aid Coordinator',
        contactPerson: 'Duty Event Medical Officer',
        phone: '0303 003 0101',
        email: 'hillingdon.events@sja.org.uk',
        location: 'Trackside First Aid Room (Clubhouse Ground Floor)',
        notes: 'Cover confirmed for all home fixtures. Defibrillator (AED) located in stadium clubhouse foyer.'
    },
    {
        id: 'con-04',
        name: 'UKA Starters & Marksman Panel',
        category: 'Starters & Starter Assistants',
        role: 'Chief Starter (UKA Level 3)',
        contactPerson: 'John H (Chief Starter) & Alan P (Marksman)',
        phone: '07712 987654',
        email: 'starters.middlesex@uka-officials.org',
        location: 'Start Line / 100m & 200m Stems',
        notes: 'Supplies starter gun, hearing protectors, and acoustic trigger for photo finish.'
    },
    {
        id: 'con-05',
        name: 'EDM Electronic Distance Measurement Unit',
        category: 'EDM (Electronic Distance)',
        role: 'EDM Lead Official & Equipment Specialist',
        contactPerson: 'Peter K (Field Technical Officer)',
        phone: '07944 556677',
        email: 'edm.measurement@athleticsengland.org',
        location: 'Throws Cage / Long Jump Pit',
        notes: 'Used for long throws and horizontal jumps. Calibrated prism laser with digital readout.'
    },
    {
        id: 'con-06',
        name: 'Stacey and Sons (Official Bib Suppliers)',
        category: 'BIBS Supplier',
        role: 'Athletics Race Numbers & Bibs Order Desk',
        contactPerson: 'Sales & Customer Services',
        phone: '01992 583123',
        email: 'orders@staceyandsons.co.uk',
        location: 'Stacey & Sons Ltd, Commercial Print Centre',
        notes: 'Standard supplier for club bibs, cloth letters, and pin packs. Order at least 4 weeks before season starts.'
    },
    {
        id: 'con-07',
        name: 'Hillingdon AC Officials Roster',
        category: 'Officials',
        role: 'Club Officials Coordinator & Track/Field Referees',
        contactPerson: 'Officials Secretary (Martin S & Track Referees)',
        phone: '07811 223344',
        email: 'officials@hillingdonac.co.uk',
        location: 'Clubhouse Control Room',
        notes: 'Coordinates volunteer timekeepers, line judges, rakers, and wind gauge operators.'
    },
    {
        id: 'con-08',
        name: 'Michael Illing',
        category: 'Meeting Managers & Team Captains',
        role: 'VETS Team Captain & Fixture Coordinator',
        contactPerson: 'Michael Illing',
        phone: '07700 900123',
        email: 'michael.illing@hillingdonac.co.uk',
        location: 'Hillingdon AC',
        notes: 'Lead contact to confirm meet dates (Sunday for YDL/Alder Valley, Monday for VETS) and overall league operations.'
    },
    {
        id: 'con-09',
        name: 'Junior Team Managers (YDL & Alder Valley)',
        category: 'Meeting Managers & Team Captains',
        role: 'Junior Track & Field Coordinators',
        contactPerson: 'Sarah Speed & Team Management Panel',
        phone: '07700 900456',
        email: 'juniors@hillingdonac.co.uk',
        location: 'HAC Junior Section',
        notes: 'Manages team selection, athlete declarations, and parent volunteer rosters for YDL and Alder Valley.'
    },
    {
        id: 'con-10',
        name: 'Visiting Club Managers Directory',
        category: 'Meeting Managers & Team Captains',
        role: 'Visiting Team Contacts (BA, ESM, Herne Hill, TVH, Metros, etc.)',
        contactPerson: 'League Secretary Liaison',
        phone: '07700 900789',
        email: 'league.managers@southernathletics.org.uk',
        location: 'Regional Clubs',
        notes: 'Recipient group for the 2-week notice letter, timetables, and post-meet PDF results.'
    },
    {
        id: 'con-11',
        name: 'Youth Development League (YDL Official)',
        category: 'Meeting Managers & Team Captains',
        role: 'UK YDL League Administration & Scrutiny',
        contactPerson: 'YDL League Secretary',
        phone: '0121 445 1234',
        email: 'admin@ukydl.org.uk',
        website: 'https://www.ukydl.org.uk',
        location: 'ukydl.org.uk',
        notes: 'Official UK Youth Development League portal for timetable rules, score sheets, results submission, and national finals.'
    },
    {
        id: 'con-12',
        name: 'Alder Valley League (Official BMHAC Host)',
        category: 'Meeting Managers & Team Captains',
        role: 'Alder Valley League Administration & Scoring',
        contactPerson: 'Alder Valley Committee',
        phone: '01256 321987',
        email: 'aldervalley@bmhac.co.uk',
        website: 'https://bmhac.co.uk/alder-valley-league/',
        location: 'bmhac.co.uk/alder-valley-league',
        notes: 'Official Alder Valley League website for match timetables, age categories, rules, and host club rotas.'
    },
    {
        id: 'con-13',
        name: 'Southern Counties Veterans AC (SCVAC)',
        category: 'Meeting Managers & Team Captains',
        role: 'VETS League Administration & Masters Scoring',
        contactPerson: 'SCVAC League Secretary',
        phone: '0208 654 3210',
        email: 'vets@scvac.org.uk',
        website: 'http://www.scvac.org.uk',
        location: 'scvac.org.uk',
        notes: 'Official SCVAC Southern Veterans Track & Field League home for Western Division fixtures, Monday timetable, and league standings.'
    }
];

export const TIMETABLES = [
    {
        leagueId: 'ydl',
        leagueName: 'Youth Development League (YDL)',
        division: 'Lower & Upper Age Groups (U13, U15, U17, U20)',
        typicalScheduleDay: 'Sunday',
        hacSupportRole: 'Host & Competing Club (Match 1 Hosted at Hillingdon Athletics Stadium)',
        hostingDetails: {
            isHost: true,
            venue: 'Hillingdon Athletics Stadium, Gatting Way, Uxbridge UB8 1ES',
            date: '2027-05-16', // Sunday
            gatesOpen: '09:00',
            firstEvent: '10:30',
            lastEvent: '17:00',
            weatherCoords: { lat: 51.5362, lon: -0.4798, city: 'Uxbridge (Hillingdon Stadium)' }
        },
        trackEvents: [
            { time: '10:30', event: '70m / 75m Hurdles', ageGroup: 'U13 / U15 Girls & Boys', notes: 'Electronic timing' },
            { time: '11:15', event: '800m', ageGroup: 'U13 / U15 / U17', notes: 'Timed finals' },
            { time: '12:00', event: '100m Sprints', ageGroup: 'All Age Groups', notes: 'Strings A & B' },
            { time: '13:00', event: '300m / 400m', ageGroup: 'U15 & U17 / U20', notes: 'Lane draws' },
            { time: '14:00', event: '1500m', ageGroup: 'U13 / U15 / U17', notes: 'Fast heat first' },
            { time: '15:15', event: '200m Sprints', ageGroup: 'All Age Groups', notes: 'A & B races' },
            { time: '16:15', event: '4x100m Relays', ageGroup: 'All Age Groups', notes: 'Baton exchange boxes' },
            { time: '16:45', event: '4x300m / 4x400m Relays', ageGroup: 'U15 / U17 / U20', notes: 'Final track event' }
        ],
        fieldEvents: [
            { time: '10:30', event: 'Hammer Throw & High Jump', ageGroup: 'U15 / U17 / U20', notes: 'EDM measurement for throws' },
            { time: '11:30', event: 'Long Jump & Shot Put', ageGroup: 'U13 / U15', notes: 'Pit 1 & Throws Circle' },
            { time: '13:00', event: 'Discus & Javelin', ageGroup: 'U15 / U17', notes: 'Cage & Grass runway' },
            { time: '14:30', event: 'Triple Jump & Pole Vault', ageGroup: 'U17 / U20', notes: 'Pit 2 & Bed' }
        ]
    },
    {
        leagueId: 'alder_valley',
        leagueName: 'Alder Valley League',
        division: 'Junior Boys & Girls Developmental League',
        typicalScheduleDay: 'Sunday',
        hacSupportRole: 'Host & Competing Club (Hosted at Hillingdon Athletics Stadium)',
        hostingDetails: {
            isHost: true,
            venue: 'Hillingdon Athletics Stadium, Gatting Way, Uxbridge UB8 1ES',
            date: '2027-06-20', // Sunday
            gatesOpen: '09:30',
            firstEvent: '11:00',
            lastEvent: '16:30',
            weatherCoords: { lat: 51.5362, lon: -0.4798, city: 'Uxbridge (Hillingdon Stadium)' }
        },
        trackEvents: [
            { time: '11:00', event: 'Hurdles (Various Heights)', ageGroup: 'U13 / U15 / U17', notes: 'Flight checks' },
            { time: '11:45', event: '800m Heats/Finals', ageGroup: 'Boys & Girls', notes: 'Water station available' },
            { time: '12:45', event: '75m & 100m Sprints', ageGroup: 'U13 / U15 / U17', notes: 'Multi-club heats' },
            { time: '13:45', event: '600m / 1500m Distance', ageGroup: 'Development age groups', notes: 'Pacers not permitted' },
            { time: '14:45', event: '150m / 200m', ageGroup: 'U13 / U15', notes: 'Sprint curve' },
            { time: '15:45', event: '4x100m Club Relays', ageGroup: 'All age groups', notes: 'Scores count double' }
        ],
        fieldEvents: [
            { time: '11:00', event: 'High Jump (Pool A) & Shot Put', ageGroup: 'Boys & Girls U13/U15', notes: 'Card reader recording' },
            { time: '12:30', event: 'Long Jump & Javelin', ageGroup: 'Boys & Girls U15/U17', notes: '2 practice trials + 3 attempts' },
            { time: '14:00', event: 'Discus & High Jump (Pool B)', ageGroup: 'U15 / U17', notes: 'Safety net check prior' }
        ]
    },
    {
        leagueId: 'vets',
        leagueName: 'Southern Veterans Track & Field League',
        division: 'Masters Division (M35, M50, M60, W35, W50, W60)',
        typicalScheduleDay: 'Monday (Evening Fixture)',
        hacSupportRole: 'Host Club for Meet 2 & Competing in All Meets (Battersea, Hillingdon, Tooting, Perivale)',
        hostingDetails: {
            isHost: true,
            venue: 'Hillingdon Athletics Stadium, Gatting Way, Uxbridge UB8 1ES',
            date: '2027-06-07', // Monday Evening
            gatesOpen: '17:30',
            firstEvent: '18:30',
            lastEvent: '21:15',
            weatherCoords: { lat: 51.5362, lon: -0.4798, city: 'Uxbridge (Hillingdon Stadium)' }
        },
        trackEvents: [
            { time: '18:30', event: '100m Sprints (W35, W50, W60, M35, M50, M60)', ageGroup: 'Masters Categories', notes: 'Photo finish timing' },
            { time: '19:15', event: '800m / 1500m Masters', ageGroup: 'M35-M60 & W35-W60', notes: 'Rolling heats' },
            { time: '19:55', event: '200m / 400m', ageGroup: 'All Masters Divisions', notes: 'Age category staggered' },
            { time: '20:30', event: '3000m / 5000m Track Distance', ageGroup: 'Combined Masters', notes: 'Lap scorers assigned' },
            { time: '21:00', event: '4x100m / Medley Relay', ageGroup: 'Club Masters Squads', notes: 'Final event under floodlights' }
        ],
        fieldEvents: [
            { time: '18:30', event: 'Shot Put & Long Jump', ageGroup: 'Men & Women Masters', notes: 'Card reader result ingest' },
            { time: '19:30', event: 'High Jump & Javelin', ageGroup: 'Men & Women Masters', notes: 'Floodlit throwing area' },
            { time: '20:15', event: 'Hammer / Discus', ageGroup: 'M35-M60 & W35-W60', notes: 'Cage certified' }
        ]
    }
];

export const MOCK_WEATHER_FORECASTS = {
    '2027-05-16': {
        temp: 19,
        condition: 'Partly Cloudy & Pleasant',
        wind: '8 mph SW (Ideal sprint tailwind)',
        rainChance: '10%',
        trackCondition: 'Dry & Fast Synthetic Track',
        uvIndex: 'Moderate (4)',
        advice: 'Excellent conditions for personal bests. Keep athletes hydrated.'
    },
    '2027-06-07': {
        temp: 21,
        condition: 'Clear Evening Skies',
        wind: '5 mph NW (Calm conditions)',
        rainChance: '5%',
        trackCondition: 'Warm & Dry Surface under Floodlights',
        uvIndex: 'Low (evening)',
        advice: 'Optimal distance and sprint conditions. Stadium floodlights operational from 20:00.'
    },
    '2027-06-20': {
        temp: 23,
        condition: 'Warm & Sunny',
        wind: '10 mph W',
        rainChance: '15%',
        trackCondition: 'Dry & Fast',
        uvIndex: 'High (6)',
        advice: 'Warm weather protocol: Ensure clubhouse water refill stations and sunscreen at reception.'
    }
};

