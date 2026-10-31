import rawKbData from '../data/hacyKnowledgeData.json';
import { hacyModelService } from './hacyModelService';
import { supabase } from '../lib/supabase';

// Local storage keys for persistent admin assist & custom knowledge
const STORAGE_CUSTOM_NOTES = 'hacy_custom_knowledge_notes';
const STORAGE_QUERY_LOGS = 'hacy_query_audit_logs';

/**
 * Normalize and stem a word to root form
 */
function stem(word) {
    if (!word) return '';
    return word.toLowerCase()
        .replace(/(ing|tion|tions|ed|es|s|al|ment|er|ers)$/, '');
}

/**
 * Tokenize and normalize text for vector-like keyword matching
 */
function tokenize(text) {
    if (!text) return [];
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(t => t.length > 1);
}

/**
 * Calculate term frequency overlap with stemming
 */
function scoreOverlap(queryTokens, docTokens) {
    if (!queryTokens.length || !docTokens.length) return 0;
    const qStemmed = new Set(queryTokens.map(stem).filter(t => t.length > 2));
    const dStemmed = new Set(docTokens.map(stem).filter(t => t.length > 2));
    let intersection = 0;
    for (const t of qStemmed) {
        if (dStemmed.has(t)) intersection++;
    }
    const union = new Set([...qStemmed, ...dStemmed]).size;
    return union === 0 ? 0 : intersection / union;
}

/**
 * Fetch live real-time weather from Open-Meteo for Uxbridge / Hillingdon Athletics Stadium
 * Coordinates: 51.544 N, -0.476 W
 */
async function fetchUxbridgeWeather() {
    try {
        const url = 'https://api.open-meteo.com/v1/forecast?latitude=51.544&longitude=-0.476&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Europe%2FLondon';
        const res = await fetch(url);
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.warn('Weather fetch warning:', e);
        return null;
    }
}

function getWeatherDescription(code) {
    if (code === 0) return { label: 'Clear Sky ☀️', trackAdvice: 'Ideal dry conditions for sprints, field events, and distance training!' };
    if ([1, 2].includes(code)) return { label: 'Partly Cloudy ⛅', trackAdvice: 'Great training conditions. Standard 6mm spikes recommended.' };
    if (code === 3) return { label: 'Overcast ☁️', trackAdvice: 'Good running conditions. Bring light warm-up layers.' };
    if ([45, 48].includes(code)) return { label: 'Foggy 🌫️', trackAdvice: 'Visibility reduced. Take care during warm-ups on outer lanes.' };
    if ([51, 53, 55].includes(code)) return { label: 'Light Drizzle 🌦️', trackAdvice: 'Track is damp. Sessions go ahead! Wear water-resistant outer layers.' };
    if ([61, 63, 65, 80, 81, 82].includes(code)) return { label: 'Rain / Showers 🌧️', trackAdvice: 'Track will be wet. Training remains on! Use 6mm pyramid spikes for extra grip.' };
    if ([71, 73, 75, 85, 86].includes(code)) return { label: 'Snow / Sleet ❄️', trackAdvice: 'Cold conditions. Check with coaches if the track is frozen or slippery.' };
    if ([95, 96, 99].includes(code)) return { label: 'Thunderstorm ⛈️', trackAdvice: 'Caution: Training paused during active lightning.' };
    return { label: 'Outdoor Conditions', trackAdvice: 'Standard track sessions scheduled.' };
}

function isWeatherQuery(query) {
    const q = query.toLowerCase();
    const weatherWords = ['weather', 'forecast', 'rain', 'raining', 'temperature', 'wind', 'cold', 'sunny', 'umbrella', 'storm', 'track condition', 'how warm', 'how cold', 'is it wet'];
    return weatherWords.some(w => q.includes(w));
}

export class HacyRagEngine {
    constructor() {
        this.baseData = rawKbData;
        // Synchronously load from local storage cache so RAG is immediately ready
        this.customNotes = this.loadLocalCustomNotes();
        this.queryLogs = this.loadLocalQueryLogs();
        this.documents = [];
        this.isSupabaseConnected = false;
        this.rebuildIndex();

        // Asynchronously synchronize with Supabase in the background
        this.syncFromSupabase();
    }

    getGeminiApiKey() {
        try {
            return localStorage.getItem(STORAGE_GEMINI_API_KEY) || import.meta.env.VITE_GEMINI_API_KEY || '';
        } catch {
            return '';
        }
    }

    setGeminiApiKey(key) {
        try {
            if (key) {
                localStorage.setItem(STORAGE_GEMINI_API_KEY, key.trim());
            } else {
                localStorage.removeItem(STORAGE_GEMINI_API_KEY);
            }
        } catch (e) {
            console.error('Failed to set Gemini API key', e);
        }
    }

    loadLocalCustomNotes() {
        try {
            const saved = localStorage.getItem(STORAGE_CUSTOM_NOTES);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    }

    saveLocalCustomNotes(notes) {
        try {
            localStorage.setItem(STORAGE_CUSTOM_NOTES, JSON.stringify(notes));
        } catch (e) {
            console.error('Failed to save local custom notes cache', e);
        }
    }

    loadLocalQueryLogs() {
        try {
            const saved = localStorage.getItem(STORAGE_QUERY_LOGS);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    }

    saveLocalQueryLogs(logs) {
        try {
            localStorage.setItem(STORAGE_QUERY_LOGS, JSON.stringify(logs.slice(0, 100)));
        } catch (e) {
            console.error('Failed to save local query logs cache', e);
        }
    }

    /**
     * Background synchronization with Supabase
     */
    async syncFromSupabase() {
        try {
            await Promise.all([
                this.loadCustomNotes(),
                this.loadQueryLogs()
            ]);
            this.isSupabaseConnected = true;
        } catch (err) {
            console.warn('Supabase sync skipped/failed, using local storage cache:', err.message || err);
            this.isSupabaseConnected = false;
        }
    }

    /**
     * Load custom knowledge notes from Supabase with localStorage fallback
     */
    async loadCustomNotes() {
        try {
            const { data, error } = await supabase
                .from('hacy_knowledge_notes')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data && Array.isArray(data)) {
                const mapped = data.map(item => ({
                    id: item.id,
                    title: item.title,
                    content: item.content,
                    category: item.category || 'admin_note',
                    author: item.author || 'Admin',
                    createdAt: item.created_at || new Date().toISOString()
                }));
                this.customNotes = mapped;
                this.saveLocalCustomNotes(mapped);
                this.rebuildIndex();
                this.isSupabaseConnected = true;
                return mapped;
            }
        } catch (e) {
            console.warn('Using local custom notes cache (Supabase offline or unreachable):', e.message || e);
            this.isSupabaseConnected = false;
        }
        return this.customNotes;
    }

    /**
     * Add custom note with Supabase persistence and optimistic local update
     */
    async addCustomNote(title, content, category = 'admin_note', author = 'Admin') {
        const newNote = {
            id: 'custom_' + Date.now(),
            title,
            content,
            category,
            author,
            createdAt: new Date().toISOString()
        };

        // Optimistic local update
        this.customNotes = [newNote, ...this.customNotes];
        this.saveLocalCustomNotes(this.customNotes);
        this.rebuildIndex();

        // Persist to Supabase
        try {
            const { error } = await supabase
                .from('hacy_knowledge_notes')
                .upsert({
                    id: newNote.id,
                    title: newNote.title,
                    content: newNote.content,
                    category: newNote.category,
                    author: newNote.author,
                    created_at: newNote.createdAt
                });
            if (error) throw error;
            this.isSupabaseConnected = true;
        } catch (err) {
            console.warn('Could not persist custom note to Supabase (saved to local cache):', err.message || err);
            this.isSupabaseConnected = false;
        }

        return newNote;
    }

    /**
     * Delete custom note with Supabase persistence and optimistic local update
     */
    async deleteCustomNote(id) {
        // Optimistic local update
        this.customNotes = this.customNotes.filter(n => n.id !== id);
        this.saveLocalCustomNotes(this.customNotes);
        this.rebuildIndex();

        // Delete from Supabase
        try {
            const { error } = await supabase
                .from('hacy_knowledge_notes')
                .delete()
                .eq('id', id);
            if (error) throw error;
            this.isSupabaseConnected = true;
        } catch (err) {
            console.warn('Could not delete note in Supabase (removed from local cache):', err.message || err);
            this.isSupabaseConnected = false;
        }
    }

    /**
     * Load query audit logs from Supabase with localStorage fallback
     */
    async loadQueryLogs() {
        try {
            const { data, error } = await supabase
                .from('hacy_query_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;

            if (data && Array.isArray(data)) {
                const mapped = data.map(item => ({
                    id: item.id,
                    query: item.query,
                    status: item.status,
                    confidence: Number(item.confidence || 0),
                    sourcesCount: item.sources_count || 0,
                    adminResponse: item.admin_response,
                    resolvedBy: item.resolved_by,
                    resolvedAt: item.resolved_at,
                    timestamp: item.created_at || new Date().toISOString()
                }));
                this.queryLogs = mapped;
                this.saveLocalQueryLogs(mapped);
                this.isSupabaseConnected = true;
                return mapped;
            }
        } catch (e) {
            console.warn('Using local query logs cache (Supabase offline or unreachable):', e.message || e);
            this.isSupabaseConnected = false;
        }
        return this.queryLogs;
    }

    /**
     * Log a query to Supabase & local storage
     */
    async logQuery(entry) {
        const fullEntry = {
            id: entry.id || ('q_' + Date.now()),
            query: entry.query,
            status: entry.status || 'unanswered',
            confidence: entry.confidence || 0,
            sourcesCount: entry.sourcesCount || 0,
            adminResponse: entry.adminResponse || null,
            resolvedBy: entry.resolvedBy || null,
            resolvedAt: entry.resolvedAt || null,
            timestamp: entry.timestamp || new Date().toISOString()
        };

        // Optimistic local update
        this.queryLogs = [fullEntry, ...this.queryLogs.filter(l => l.id !== fullEntry.id)].slice(0, 100);
        this.saveLocalQueryLogs(this.queryLogs);

        // Persist to Supabase
        try {
            const { error } = await supabase
                .from('hacy_query_logs')
                .upsert({
                    id: fullEntry.id,
                    query: fullEntry.query,
                    status: fullEntry.status,
                    confidence: fullEntry.confidence,
                    sources_count: fullEntry.sourcesCount,
                    admin_response: fullEntry.adminResponse,
                    resolved_by: fullEntry.resolvedBy,
                    resolved_at: fullEntry.resolvedAt,
                    created_at: fullEntry.timestamp
                });
            if (error) throw error;
            this.isSupabaseConnected = true;
        } catch (err) {
            console.warn('Could not persist query log to Supabase (cached locally):', err.message || err);
            this.isSupabaseConnected = false;
        }
    }

    /**
     * Update query resolution (Admin Assist)
     */
    async updateQueryResolution(id, assistResponse, resolvedBy = 'Admin') {
        const resolvedAt = new Date().toISOString();

        // Optimistic local update
        this.queryLogs = this.queryLogs.map(l => {
            if (l.id === id) {
                return {
                    ...l,
                    status: 'resolved_by_admin',
                    adminResponse: assistResponse,
                    resolvedBy,
                    resolvedAt
                };
            }
            return l;
        });
        this.saveLocalQueryLogs(this.queryLogs);

        // Update in Supabase
        try {
            const { error } = await supabase
                .from('hacy_query_logs')
                .update({
                    status: 'resolved_by_admin',
                    admin_response: assistResponse,
                    resolved_by: resolvedBy,
                    resolved_at: resolvedAt
                })
                .eq('id', id);
            if (error) throw error;
            this.isSupabaseConnected = true;
        } catch (err) {
            console.warn('Could not update query log in Supabase (updated locally):', err.message || err);
            this.isSupabaseConnected = false;
        }
    }

    /**
     * Rebuild the RAG index across all data sources
     */
    rebuildIndex() {
        const docs = [];

        // 1. Membership FAQs, Policy, and EA/UKA Rules & Regulations
        if (this.baseData.membership_faq) {
            this.baseData.membership_faq.forEach(faq => {
                const isRules = faq.category === 'rules_and_regulations';
                docs.push({
                    id: faq.id,
                    type: isRules ? 'rules_and_regulations' : 'membership',
                    title: faq.title,
                    content: faq.content,
                    keywords: faq.keywords || [],
                    tags: faq.tags || [],
                    tokens: tokenize(`${faq.title} ${faq.content} ${(faq.keywords || []).join(' ')}`),
                    metadata: {
                        source: isRules ? 'England Athletics & UK Athletics Rules for Competition 2026-2028' : 'Club Membership Policy & AGM 2026',
                        category: isRules ? 'Rules & Regulations' : 'Membership'
                    }
                });
            });
        }

        // 2. Arlington Drive Training Scores
        if (this.baseData.arlington_time_trials) {
            this.baseData.arlington_time_trials.forEach(athlete => {
                const sessionsSummary = athlete.sessions
                    .map(s => `${s.date}: ${s.laps} laps, avg ${s.avg_time}`)
                    .join('; ');
                const content = `Athlete: ${athlete.name}. 0.45-mile Arlington Drive Training Time Trial History. Best Date: ${athlete.best_date || 'N/A'}. Best Laps: ${athlete.best_laps || 'N/A'}. Best Session Average: ${athlete.best_avg_time || 'N/A'} mins. Total recorded sessions: ${athlete.total_sessions}. Recent sessions: ${sessionsSummary}`;
                docs.push({
                    id: `arlington_${athlete.name.replace(/[^a-zA-Z0-9]/g, '_')}`,
                    type: 'training_scores',
                    title: `${athlete.name} - Arlington Drive Training Scores`,
                    content,
                    athleteName: athlete.name,
                    tokens: tokenize(`${athlete.name} arlington drive training score laps time trial ${athlete.best_date} ${athlete.best_avg_time}`),
                    metadata: {
                        source: 'Arlington Drive 0.45m Time Trials Database',
                        category: 'Training Scores',
                        raw: athlete
                    }
                });
            });
        }

        // 3. Junior PB Awards
        if (this.baseData.junior_pbs_summary && this.baseData.junior_pbs_summary.athletes) {
            this.baseData.junior_pbs_summary.athletes.forEach(athlete => {
                const eventDetails = Object.values(athlete.events || {})
                    .map(ev => `${ev.event}: ${ev.performance} (${ev.date} at ${ev.venue}, Pos: ${ev.position}, Award: ${ev.cert_title || ev.level_str}, Target: ${ev.next_target})`)
                    .join('; ');

                const content = `Junior Athlete: ${athlete.name}. Age Group: ${athlete.age_group || 'N/A'}, Gender: ${athlete.gender || 'N/A'}. Highest Award: ${athlete.highest_level_str || 'N/A'} in ${athlete.highest_event || 'N/A'} (Best Performance: ${athlete.highest_perf || 'N/A'}). Event Breakdown: ${eventDetails}`;
                
                docs.push({
                    id: `junior_pb_${athlete.name.replace(/[^a-zA-Z0-9]/g, '_')}`,
                    type: 'athlete_pbs',
                    title: `${athlete.name} - Junior EA PB Awards & Scores`,
                    content,
                    athleteName: athlete.name,
                    tokens: tokenize(`${athlete.name} junior pb award ${athlete.age_group} ${athlete.highest_event} ${athlete.highest_perf} ${athlete.highest_level_str} england athletics`),
                    metadata: {
                        source: 'England Athletics PB Awards 2026 Presentation',
                        category: 'Athlete Scores',
                        raw: athlete
                    }
                });
            });
        }

        // 4. Vets League Summary & Top Results
        if (this.baseData.vets_league_summary && this.baseData.vets_league_summary.hac_results_sample) {
            const vetsByAthlete = {};
            this.baseData.vets_league_summary.hac_results_sample.forEach(r => {
                const name = r.athlete_clean || r.athlete_raw;
                if (!name) return;
                if (!vetsByAthlete[name]) vetsByAthlete[name] = [];
                vetsByAthlete[name].push(r);
            });

            Object.entries(vetsByAthlete).forEach(([name, results]) => {
                const resText = results
                    .map(r => `Meet ${r.meet_id} (${r.event_name || r.event_code}): Perf ${r.perf}, Pos ${r.position}, Pts ${r.points_scored} (${r.age_clean || ''})`)
                    .join('; ');
                const content = `Vets League Results for ${name} (Hillingdon AC): ${resText}`;
                docs.push({
                    id: `vets_${name.replace(/[^a-zA-Z0-9]/g, '_')}`,
                    type: 'vets_league',
                    title: `${name} - Vets League Performances`,
                    content,
                    athleteName: name,
                    tokens: tokenize(`${name} vets league veteran performance meet points score ${resText}`),
                    metadata: {
                        source: 'Southern Vets League 2026 Results',
                        category: 'Athlete Scores',
                        raw: results
                    }
                });
            });

            const meetsText = (this.baseData.vets_league_summary.meets || [])
                .map(m => `Meet ${m.id}: ${m.name} at ${m.venue} (${m.date})`)
                .join(', ');
            docs.push({
                id: 'vets_league_overview',
                type: 'vets_overview',
                title: 'Southern Vets Track & Field League 2026 Overview',
                content: `Hillingdon AC competes in the Southern Vets League. Meets: ${meetsText}. Participating clubs: British Airways (BA), Ealing Southall & Middlesex (ESM), Herne Hill Harriers (HHH), Hillingdon AC, Metros, Ealing Eagles, Serpentine, Thames Valley Harriers (TVH). Scoring is divided into Masters age categories: M35, M50, M60, W35, W50, W60.`,
                tokens: tokenize('vets league fixtures dates venues battersea hillingdon tooting perivale masters standings points'),
                metadata: {
                    source: 'Southern Vets League 2026 Fixtures & Rules',
                    category: 'Competition Scores'
                }
            });
        }

        // 5. Training Sessions Timetable
        docs.push({
            id: 'training_sessions_official',
            type: 'training_sessions',
            title: 'Hillingdon AC Official Training Sessions & Venues',
            content: `Official Training Sessions at Hillingdon Athletics Stadium (Gatting Way, Uxbridge UB8 1ES):
- Monday 18:30-20:00: Adult Road & Distance Intervals (Coach: Mike Distance, Thunderbirds)
- Tuesday 18:00-19:30: Junior Academy Track & Field Training (Coach: Sarah Speed, Falcons)
- Wednesday 18:30-20:00: Senior Sprints, Middle Distance & Throws Training
- Thursday 18:00-19:30: Junior Development Training (U11/U13/U15)
- Thursday 18:30-20:00: Senior Track Intervals & Masters Training (Pauline Senior, Eagles)
- Saturday Mornings: Long runs & cross country preparation (Black Park, Ruislip Woods, or Stadium track).`,
            tokens: tokenize('training schedule sessions times coach sarah speed mike distance pauline senior days monday tuesday wednesday thursday uxbridge stadium'),
            metadata: {
                source: 'Club Coaching & Training Schedule 2026',
                category: 'Training Timetable'
            }
        });

        // 6. GENERAL ENQUIRIES: Stadium Location & Parking
        docs.push({
            id: 'stadium_parking_facilities',
            type: 'general_enquiry',
            title: 'Hillingdon Athletics Stadium: Location, Parking & Facilities',
            content: `Hillingdon Athletics Stadium Location & Parking:
- Address: Gatting Way, Uxbridge, Middlesex, UB8 1ES (next to the Hillingdon Sports and Leisure Complex).
- Parking Information: Please note that there is NO free parking at Gatting Way. The car park is a paid parking facility managed by the council/leisure centre. All athletes, parents, and visitors must pay for parking via the on-site ticket machines or designated parking mobile app (e.g. PayByPhone) to avoid receiving a penalty charge notice (PCN).
- Facilities: 8-lane floodlit synthetic 400m track, jumps pits, throws cage, spectator seating, changing rooms, showers, and clubhouse meeting room.
- Accessibility: Fully wheelchair accessible with designated disabled parking bays (standard parking tariffs or blue badge rules apply).`,
            keywords: ['parking', 'where', 'address', 'location', 'venue', 'how to get to', 'postcode', 'car park', 'facilities', 'showers', 'changing rooms', 'pay', 'paid parking', 'free', 'cost', 'charge'],
            tokens: tokenize('stadium parking no free parking paid pay charges ticket gatting way uxbridge car park address location postcode ub8 1es facilities'),
            metadata: {
                source: 'Hillingdon Athletics Stadium Guide',
                category: 'General Club Info'
            }
        });

        // 7. GENERAL ENQUIRIES: Spikes & Footwear Rules
        docs.push({
            id: 'spikes_and_equipment',
            type: 'general_enquiry',
            title: 'Track Spikes, Footwear & Equipment Rules',
            content: `Track Spikes & Footwear Regulations:
- Maximum Spike Length: 6mm pyramid or Christmas tree spikes are permitted on the track surface.
- Needle spikes and spikes longer than 6mm are strictly banned on synthetic running lanes to preserve the track.
- High Jump & Javelin: Up to 9mm spikes are allowed on the javelin runway and high jump fan.
- What to bring: Running spikes or trainers, personal water bottle, layered clothing (warm-up top and bottoms), and a waterproof jacket.`,
            keywords: ['spikes', 'shoes', 'footwear', 'trainers', 'what to wear', 'equipment', '6mm', 'spike length', 'pyramid spikes'],
            tokens: tokenize('spikes shoes footwear trainers 6mm pyramid length equipment what to wear synthetic track'),
            metadata: {
                source: 'Track Safety & Equipment Rules',
                category: 'General Club Info'
            }
        });

        // 8. GENERAL ENQUIRIES: Weather & Session Cancellation Policy
        docs.push({
            id: 'weather_cancellation_policy',
            type: 'general_enquiry',
            title: 'Weather Policy & Session Cancellations',
            content: `Hillingdon AC Training Weather Policy:
- Training Goes Ahead in the Rain: Track sessions always take place in wet, windy, or cold weather! Athletics is an all-weather outdoor sport.
- What should athletes wear? Wear breathable thermal base layers, water-resistant running jackets, and gloves/hats during cold months.
- When are sessions cancelled? Only in extreme conditions: dangerous active lightning/thunderstorms, or heavy snow/thick ice covering the track that presents a slip hazard.
- Cancellation Notices: In the rare event of severe weather, coaches send alerts via team messaging and notices are posted on club social media.`,
            keywords: ['cancel', 'cancellation', 'cancelled', 'rain', 'raining', 'snow', 'ice', 'bad weather', 'is training on', 'will it go ahead', 'cold'],
            tokens: tokenize('weather cancel cancellation rain raining snow ice bad weather cold storm lightning training go ahead'),
            metadata: {
                source: 'Club Training Weather Guidelines',
                category: 'General Club Info'
            }
        });

        // 9. GENERAL ENQUIRIES: Official Club Kit & Colors
        docs.push({
            id: 'club_kit_and_colors',
            type: 'general_enquiry',
            title: 'Official Club Kit, Colours & Vest',
            content: `Hillingdon AC Official Colours & Kit:
- Club Colours: White vest with red and blue horizontal chest bands.
- Competition Requirement: Official club vests MUST be worn by all athletes competing for Hillingdon AC in league matches (Southern Vets League, Southern Athletics League, Alder Valley, Chiltern Cross Country) and county championships.
- Purchasing Kit: Club vests, warm-up hoodies, and training t-shirts are available through the club kit shop online or at the clubhouse on race nights.`,
            keywords: ['kit', 'vest', 'colors', 'colours', 'uniform', 'jersey', 'singlet', 'buy kit', 'shop'],
            tokens: tokenize('club kit vest colors colours white red blue chest bands uniform singlet buy kit shop'),
            metadata: {
                source: 'Hillingdon AC Club Standards',
                category: 'General Club Info'
            }
        });

        // 10. GENERAL ENQUIRIES: Volunteering & Officiating
        docs.push({
            id: 'volunteering_and_coaching',
            type: 'general_enquiry',
            title: 'Volunteering, Officiating & Coaching at Hillingdon AC',
            content: `Volunteering Opportunities at Hillingdon AC:
- Hillingdon AC is run by dedicated volunteers. We welcome parents and members to get involved!
- Key Roles: Track Judges, Timekeepers, Field Event Marshals, Starter Assistants, Refreshment/Tea Bar team, and Team Managers.
- Subsidized Training: The club funds and subsidizes official England Athletics Coaching Assistant and Track & Field Officiating courses for members who volunteer.
- To volunteer or ask questions, email secretary@hillingdonac.co.uk or membership@hillingdonac.co.uk.`,
            keywords: ['volunteer', 'volunteering', 'help', 'officiating', 'official', 'timekeeper', 'coach', 'course', 'marshaling'],
            tokens: tokenize('volunteering volunteer help officiating official timekeeper coach marshaling qualifications England Athletics'),
            metadata: {
                source: 'Volunteer & Official Development',
                category: 'General Club Info'
            }
        });

        // 11. GENERAL ENQUIRIES: Athlete Nutrition & Hydration
        docs.push({
            id: 'athlete_nutrition_hydration',
            type: 'general_enquiry',
            title: 'Athlete Sports Nutrition & Hydration Guidelines',
            content: `Athlete Nutrition & Hydration for Track & Distance Runners:
- Pre-Training (2-3 hours before): High-carbohydrate, moderate-protein meal that digests easily (porridge, banana, wholemeal toast with peanut butter, or pasta).
- Hydration: Drink 400-500ml water 1-2 hours before training. Bring a water bottle to the track.
- Post-Session Recovery (within 45 mins): A 3:1 or 4:1 carbohydrate-to-protein snack to accelerate muscle recovery (chocolate milk, protein shake with banana, or chicken/egg sandwich).`,
            keywords: ['nutrition', 'food', 'diet', 'hydration', 'drink', 'water', 'recovery', 'eat', 'before training', 'after training'],
            tokens: tokenize('nutrition food diet hydration drink water recovery protein carbohydrates meal eat before training after'),
            metadata: {
                source: 'Athletics Nutrition Guide',
                category: 'General Health & Fitness'
            }
        });

        // 12. GENERAL ENQUIRIES: World Athletics Records
        docs.push({
            id: 'athletics_world_records',
            type: 'general_enquiry',
            title: 'World Athletics Benchmark Records & Trivia',
            content: `World Athletics Benchmark Records:
- Men's 100m: 9.58s (Usain Bolt, Jamaica, 2009 Berlin)
- Women's 100m: 10.49s (Florence Griffith-Joyner, USA, 1988)
- Men's 200m: 19.19s (Usain Bolt, 2009)
- Men's 800m: 1:40.91 (David Rudisha, Kenya, London 2012)
- Men's Marathon: 2:00:35 (Kelvin Kiptum, Kenya, Chicago 2023)
- Women's Marathon: 2:09:56 (Ruth Chepngetich, Kenya, Chicago 2024)
- Men's High Jump: 2.45m (Javier Sotomayor, Cuba)
- Long Jump: 8.95m (Mike Powell, USA, 1991)
- For Hillingdon AC specific records, check Club Records in the Member Portal!`,
            keywords: ['record', 'world record', 'usain bolt', 'fastest', 'marathon record', '100m record', 'trivia', 'olympic'],
            tokens: tokenize('record world record usain bolt marathon 100m 200m 800m high jump benchmarks trivia'),
            metadata: {
                source: 'World Athletics Benchmark Records',
                category: 'Athletics Knowledge'
            }
        });

        // 13. MEET MANAGEMENT & OPERATIONS (YDL, Alder Valley, VETS League)
        docs.push({
            id: 'meet_management_checklists_full',
            type: 'meet_management',
            title: 'Meet Manager: Pre-Meet, During-Meet & Post-Meet Checklists',
            content: `Hillingdon AC Meet Manager Operations & Complete Checklists for YDL, Alder Valley, and VETS League:

1. CHECKLIST BEFORE THE MEET:
- Priority Task 1: Dates finalized for all 3 meets. Ask for a Sunday for YDL and Alder Valley, and for VETS it is a Monday anyway. Michael Illing to confirm.
- Priority Task 2: Signup to the league (Annual registration/affiliation fee to pay every year).
- Send formal notice letter to all visiting club managers 2 weeks before the event with timetables and parking instructions.
- Book stadium (Hillingdon Athletics Stadium, Gatting Way).
- Book Photo finish equipment and licensed timing operators.
- Book first aid medical cover (St John Ambulance / qualified paramedics).
- Book starters and starter assistants (UKA licensed Chief Starter & Marksman).
- Book EDM (Electronic Distance Measurement) for field throws and jumps.
- Book BIBS by placing an order with Stacey and Sons in advance.
- Print event cards for track and field officials and keep 2 copies at the desk.
- Publish order of events and timings timetable.
- Fetch the record results sheet from the respective league websites:
  * YDL Website: https://www.ukydl.org.uk
  * Alder Valley League Website: https://bmhac.co.uk/alder-valley-league/
  * VETS League (SCVAC) Website: http://www.scvac.org.uk
- Get ink for clubhouse results printer.
- Get paper and cardstock for printer.
- Arrange food, hot beverages, and refreshments for volunteer officials.
- Print official scoring and non-scoring sheets.
- Confirm car parking situation: Paid parking applies at Gatting Way via PayByPhone/machines. Advise all clubs to avoid PCNs.
- Visit venue to confirm equipment availability (hurdles, high jump mats, cages, blocks, steeplechase).
- Prepare a bar code / QR code for live results trackside.

2. CHECKLIST DURING THE MEETING:
- Arrival for the meeting (early setup at least 90m before start).
- Signing sheets for officials in reception (for UKA licensing and travel allowances).
- Signing sheets for non-scoring officials at reception.
- Bibs at reception (distribution of club envelopes from Stacey and Sons).
- Welcome officials with technical briefing and radio assignment.
- Food placed at the right location in clubhouse hospitality room.
- RECORDING RESULTS VIA CARD READER (Essential Step): Card reader scans physical cards and automatically publishes results on an Excel sheet instead of manual typing.

3. CHECKLIST AFTER THE MEETING:
- Send PDF of results to all club managers within 24 hours.
- Send results to Power of 10 (Athletics Data) for official national athlete ranking updates.`,
            keywords: ['meet manager', 'checklist', 'before meet', 'during meeting', 'after meeting', 'ydl', 'alder valley', 'vets', 'stacey and sons', 'michael illing', 'card reader', 'power of 10', 'photo finish', 'first aid', 'starters', 'edm', 'bibs', 'bar code', 'qr code', 'parking', 'printer ink', 'paper', 'food for officials'],
            tokens: tokenize('meet manager checklist before meet during meeting after ydl alder valley vets stacey and sons michael illing card reader excel power of 10 photo finish first aid starters edm bibs bar code qr parking ink paper food officials'),
            metadata: {
                source: 'HAC Meet Management Operations Manual',
                category: 'Meet Management'
            }
        });

        docs.push({
            id: 'meet_management_contacts_and_dates',
            type: 'meet_management',
            title: 'Meet Manager: Key Contacts, League Dates & Scheduling',
            content: `Meet Management Key Contacts & Schedule Rules for Hillingdon AC:

1. MEET DATES & SCHEDULING RULE:
- YDL (Youth Development League): Ask for a Sunday.
- Alder Valley League: Ask for a Sunday.
- VETS League (Southern Veterans): Always held on a Monday evening (18:30 start).
- Confirmation: Michael Illing to confirm dates for all 3 meets.
- League Affiliation: Annual league registration fee must be paid every year.

2. KEY CONTACTS DIRECTORY:
- Stadium Contact: Hillingdon Athletics Stadium, Gatting Way, Uxbridge UB8 1ES (Tel: 01895 250777). Paid parking applies!
- Photo Finish: Precision Timing & Photo Finish UK (photofinish@precisiontiming.co.uk).
- First Aid: St John Ambulance Event Medical Cover (Tel: 0303 003 0101).
- Starters & Starter Assistants: UKA Level 3 Chief Starter & Marksman Panel.
- EDM: Electronic Distance Measurement Specialist (EDM Throws & Jumps Unit).
- BIBS Supplier: Stacey and Sons (orders@staceyandsons.co.uk, 01992 583123) - Official race numbers and bibs.
- Officials: HAC Officials Secretary (officials@hillingdonac.co.uk).
- Meeting Managers & Team Captains: Michael Illing (VETS Captain & Meet Coordinator), Sarah Speed (Juniors/YDL), plus Visiting Club Managers (BA, ESM, Herne Hill, TVH, Metros, etc.).

3. OFFICIAL LEAGUE WEBSITES:
- YDL (Youth Development League): https://www.ukydl.org.uk (Download official scoring sheets, timetable rules, and declarations)
- Alder Valley League: https://bmhac.co.uk/alder-valley-league/ (Match rotas, declarations, age groups, and match results)
- VETS League (Southern Counties Veterans AC): http://www.scvac.org.uk (Western Division fixtures, Monday timetable, and league standings)`,
            keywords: ['key contacts', 'stacey and sons', 'michael illing', 'photo finish', 'first aid', 'starters', 'edm', 'stadium contact', 'bibs supplier', 'officials', 'sunday', 'monday', 'dates', 'ydl dates', 'vets dates', 'ukydl', 'ukydl.org.uk', 'bmhac', 'scvac', 'scvac.org.uk', 'websites', 'urls', 'league websites'],
            tokens: tokenize('key contacts stacey and sons michael illing photo finish first aid starters edm stadium bibs officials sunday monday dates ydl vets alder valley ukydl bmhac scvac websites official portal'),
            metadata: {
                source: 'HAC Meet Management Contacts & Directory',
                category: 'Meet Management'
            }
        });

        docs.push({
            id: 'meet_management_card_reader_and_po10',
            type: 'meet_management',
            title: 'Card Reader Results Workflow & Power of 10 Submission',
            content: `Automated Results Recording & Submission Workflow:
- Card Reader Technology: At the meet, we use a digital card reader that reads physical event cards and automatically publishes results directly into an Excel scoring spreadsheet instead of volunteers manually typing them in. This is marked as a critical step in the meet process.
- Live Public Results Barcode: A trackside QR code / barcode is generated and posted around the stadium so athletes, coaches, and parents can scan with their smartphones to view live/provisional results in real time.
- Power of 10 Submission: Immediately after the meet, verified results are exported in the official UKA / Athletics Data format and submitted directly to Power of 10 for national rankings, alongside emailing PDF results to all visiting club managers.
- Long-Running Autonomous Agents: Dedicated background agents (YDL Prep Agent, Alder Valley Agent, VETS Agent) track task states (not_started, in_progress, completed, blocked), check deadlines, run automated audits, and monitor expected weather at Hillingdon Athletics Stadium.`,
            keywords: ['card reader', 'automatic results', 'excel', 'typing results', 'barcode', 'qr code', 'power of 10', 'po10', 'results pdf', 'long running agents', 'weather'],
            tokens: tokenize('card reader automatic results excel typing barcode qr power of 10 po10 submission long running agents weather uxbridge'),
            metadata: {
                source: 'Digital Meet Scoring & Power of 10 Architecture',
                category: 'Meet Management'
            }
        });

        // 14. Admin Custom Notes & Overrides (Overrides base knowledge if matching ID exists)
        this.customNotes.forEach(note => {
            const docObj = {
                id: note.id,
                type: 'custom_note',
                title: note.title,
                content: note.content,
                tokens: tokenize(`${note.title} ${note.content} ${note.category}`),
                metadata: {
                    source: note.category === 'UKA Rules & Regulations' ? 'UKA Rules for Competition 2026-2028' : 'HACY Admin Assist Verified Note',
                    category: note.category || 'Admin Update',
                    raw: note
                }
            };
            const existingIndex = docs.findIndex(d => d.id === note.id);
            if (existingIndex >= 0) {
                docs[existingIndex] = docObj;
            } else {
                docs.push(docObj);
            }
        });

        this.documents = docs;
    }

    /**
     * Retrieve relevant documents using hybrid token matching + entity boosting
     */
    retrieve(query, topK = 4) {
        const queryLower = query.toLowerCase();
        const queryTokens = tokenize(query);

        if (!queryTokens.length) {
            return { documents: [], confidence: 0, matchedEntities: [] };
        }

        const scoredDocs = [];
        const matchedEntities = [];

        for (const doc of this.documents) {
            let score = 0;

            // Direct athlete name match boost (massive signal)
            if (doc.athleteName) {
                const normName = doc.athleteName.toLowerCase();
                const nameParts = normName.replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
                let nameMatched = false;

                if (queryLower.includes(normName)) {
                    score += 4.5;
                    nameMatched = true;
                } else {
                    const matchedParts = nameParts.filter(part => part.length > 2 && queryLower.includes(part));
                    if (matchedParts.length >= 2) {
                        score += 3.8;
                        nameMatched = true;
                    } else if (matchedParts.length === 1 && nameParts.length <= 2) {
                        score += 1.8;
                        nameMatched = true;
                    }
                }

                if (nameMatched && !matchedEntities.includes(doc.athleteName)) {
                    matchedEntities.push(doc.athleteName);
                }
            }

            // Keyword / Tag match boost
            if (doc.keywords) {
                for (const kw of doc.keywords) {
                    const kwLower = kw.toLowerCase();
                    const kwStem = stem(kwLower);
                    if (queryLower.includes(kwLower) || (kwStem.length >= 3 && queryTokens.some(t => stem(t) === kwStem))) {
                        score += 1.8;
                    }
                }
            }

            // Overlap score with document tokens
            const overlap = scoreOverlap(queryTokens, doc.tokens);
            score += overlap * 3.2;

            // Title bonus
            const titleTokens = tokenize(doc.title);
            const titleOverlap = scoreOverlap(queryTokens, titleTokens);
            score += titleOverlap * 2.2;

            if (score > 0.05) {
                scoredDocs.push({
                    doc,
                    score,
                    relevancePercent: Math.min(100, Math.round(score * 25))
                });
            }
        }

        scoredDocs.sort((a, b) => b.score - a.score);

        const topMatches = scoredDocs.slice(0, topK);
        const topScore = topMatches.length > 0 ? topMatches[0].score : 0;
        
        const confidence = Math.min(1.0, topScore / 3.0);

        return {
            documents: topMatches.map(m => ({
                id: m.doc.id,
                title: m.doc.title,
                type: m.doc.type,
                content: m.doc.content,
                athleteName: m.doc.athleteName,
                metadata: m.doc.metadata,
                score: m.score,
                relevancePercent: m.relevancePercent
            })),
            confidence,
            matchedEntities
        };
    }

    /**
     * Synthesize answer from retrieved chunks, live weather API, or invoke direct fallback message
     */
    async answerQuery(query) {
        const queryId = 'q_' + Date.now();

        // 1. LIVE WEATHER INQUIRY INTERCEPT
        if (isWeatherQuery(query)) {
            const weatherData = await fetchUxbridgeWeather();
            if (weatherData && weatherData.current) {
                const cur = weatherData.current;
                const daily = weatherData.daily || {};
                const weatherInfo = getWeatherDescription(cur.weather_code);

                const temp = cur.temperature_2m;
                const wind = cur.wind_speed_10m;
                const humidity = cur.relative_humidity_2m;
                const precip = cur.precipitation;
                const rainProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : 0;

                const weatherMarkdown = `### 🌤️ Live Weather at **Hillingdon Athletics Stadium** (Uxbridge)

**Current Track Conditions:**
- **Condition**: \`${weatherInfo.label}\`
- **Temperature**: **${temp}°C** (Today's range: ${daily.temperature_2m_min ? daily.temperature_2m_min[0] : temp}°C - ${daily.temperature_2m_max ? daily.temperature_2m_max[0] : temp}°C)
- **Wind Speed**: **${wind} km/h** (~${Math.round(wind * 0.621371)} mph)
- **Humidity**: ${humidity}% | **Precipitation**: ${precip} mm (Rain probability: **${rainProb}%**)

#### 👟 Track & Training Advice:
- **${weatherInfo.trackAdvice}**
- **Footwear**: Maximum 6mm pyramid spikes recommended on the synthetic track.
- **Club Weather Policy**: Training goes ahead in rain and cold! Sessions are only cancelled in dangerous lightning or heavy snow/ice.`;

                const weatherResponse = {
                    id: queryId,
                    query,
                    answered: true,
                    confidence: 0.98,
                    sources: [
                        {
                            id: 'live_weather_open_meteo',
                            title: 'Open-Meteo Live Weather API (Uxbridge Station 51.544°N, 0.476°W)',
                            type: 'live_api',
                            content: `Real-time weather station metrics for Hillingdon Athletics Stadium, Gatting Way, Uxbridge.`,
                            relevancePercent: 99,
                            metadata: { source: 'Live Open-Meteo Weather Service', category: 'Live Track Weather' }
                        },
                        {
                            id: 'weather_cancellation_policy',
                            title: 'Weather Policy & Session Cancellations',
                            type: 'general_enquiry',
                            content: 'Training goes ahead in rain and cold; only dangerous storms/ice cause cancellations.',
                            relevancePercent: 95,
                            metadata: { source: 'Club Training Weather Guidelines', category: 'General Club Info' }
                        }
                    ],
                    message: {
                        isFallback: false,
                        content: weatherMarkdown,
                        primaryCategory: 'Live Weather & Track Conditions'
                    },
                    contactEmails: this.baseData.contacts,
                    timestamp: new Date().toISOString()
                };

                this.logQuery({
                    id: queryId,
                    query,
                    status: 'answered',
                    confidence: 0.98,
                    timestamp: weatherResponse.timestamp,
                    sourcesCount: 2
                });

                return weatherResponse;
            }
        }

        // 2. STANDARD RAG RETRIEVAL
        const retrieval = this.retrieve(query, 4);
        const { documents, confidence, matchedEntities } = retrieval;

        const MIN_CONFIDENCE = 0.28;

        if (confidence >= MIN_CONFIDENCE && documents.length > 0) {
            let generatedAnswer = this.synthesizeAnswer(query, documents, matchedEntities);

            // If an SLM is plugged in & enabled (e.g. Groq Llama 3.2, OpenRouter, Gemini), enrich synthesis
            if (hacyModelService.isConfigured()) {
                try {
                    const cfg = hacyModelService.getConfig();
                    const contextText = documents.map(d => `[${d.title}]:\n${d.content}`).join('\n\n');
                    const systemPrompt = `You are HACY, the official AI athletic assistant for Hillingdon Athletic Club (Uxbridge, London).
Use the verified club records below to answer the user inquiry accurately and helpfully.
Use markdown tables or clear bullet points where helpful. Stick strictly to the factual numbers and rules provided. Keep tone positive and sporty.`;
                    const userPrompt = `Verified Club Knowledge:\n${contextText}\n\nUser Question:\n${query}`;

                    const slmText = await hacyModelService.generate(systemPrompt, userPrompt);
                    if (slmText && slmText.trim().length > 15) {
                        generatedAnswer = {
                            isFallback: false,
                            content: slmText.trim(),
                            primaryCategory: `${documents[0]?.metadata?.category || 'Club Records'} • ${cfg.provider.toUpperCase()} (${cfg.model})`
                        };
                    }
                } catch (slmErr) {
                    console.warn('SLM RAG synthesis failed, using local template synthesis:', slmErr);
                }
            }

            const responseObj = {
                id: queryId,
                query,
                answered: true,
                confidence,
                sources: documents,
                message: generatedAnswer,
                contactEmails: this.baseData.contacts,
                timestamp: new Date().toISOString()
            };

            this.logQuery({
                id: queryId,
                query,
                status: 'answered',
                confidence,
                timestamp: responseObj.timestamp,
                sourcesCount: documents.length
            });

            return responseObj;
        }

        // 3. OPEN-DOMAIN SLM INQUIRY (if Small Language Model is configured)
        if (hacyModelService.isConfigured()) {
            try {
                const cfg = hacyModelService.getConfig();
                const systemPrompt = `You are HACY, the intelligent assistant for Hillingdon Athletic Club (North West London). 
Answer the following general athletics or general enquiry helpfully, concisely (under 180 words), and politely.
If the question is about individual account billing, private club records, or personal data, politely suggest emailing membership@hillingdonac.co.uk.`;
                const slmAnswer = await hacyModelService.generate(systemPrompt, query);
                if (slmAnswer && slmAnswer.trim().length > 5) {
                    const aiResponse = {
                        id: queryId,
                        query,
                        answered: true,
                        confidence: 0.88,
                        sources: [
                            {
                                id: 'slm_general_inference',
                                title: `SLM Engine: ${cfg.provider.toUpperCase()} (${cfg.model})`,
                                type: 'slm_inference',
                                content: `Generated using active ${cfg.provider} Small Language Model endpoint.`,
                                relevancePercent: 92,
                                metadata: { source: `${cfg.provider.toUpperCase()} API`, category: 'AI General Inquiry' }
                            }
                        ],
                        message: {
                            isFallback: false,
                            content: `### 💡 HACY AI Response\n\n${slmAnswer.trim()}\n\n> *Note: For official club membership changes or session trial bookings, please speak to the stadium coaching desk or email \`${this.baseData.contacts.membership}\`.*`,
                            primaryCategory: `General Inquiry (${cfg.model})`
                        },
                        contactEmails: this.baseData.contacts,
                        timestamp: new Date().toISOString()
                    };

                    this.logQuery({
                        id: queryId,
                        query,
                        status: 'answered',
                        confidence: 0.88,
                        timestamp: aiResponse.timestamp,
                        sourcesCount: 1
                    });

                    return aiResponse;
                }
            } catch (err) {
                console.warn('SLM open-domain inference failed, proceeding to direct message fallback:', err);
            }
        }

        // 4. UNABLE TO ANSWER - Trigger strict Direct Message Fallback
        const fallbackResponse = {
            id: queryId,
            query,
            answered: false,
            confidence,
            sources: documents,
            message: this.generateUnanswerableDirectMessage(query),
            contactEmails: this.baseData.contacts,
            timestamp: new Date().toISOString()
        };

        this.logQuery({
            id: queryId,
            query,
            status: 'unanswered',
            confidence,
            timestamp: fallbackResponse.timestamp,
            sourcesCount: documents.length
        });

        return fallbackResponse;
    }

    /**
     * Call Google Gemini API for general inquiries if key configured
     */
    async callGeminiApi(query, apiKey) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const prompt = `You are HACY, the helpful and friendly AI assistant for Hillingdon Athletic Club (North West London). 
Answer the following general enquiry accurately, helpfully, and concisely with an athletic/sports-friendly tone. Keep the answer under 180 words.
User inquiry: "${query}"`;

        const body = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 300, temperature: 0.4 }
        };

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!res.ok) return null;
        const data = await res.json();
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
    }

    /**
     * Fallback Direct Message when Hacy is not able to answer
     */
    generateUnanswerableDirectMessage(query) {
        const c = this.baseData.contacts || {};
        return {
            isFallback: true,
            title: "HACY Direct Advisory: Information Not Found",
            summary: `I searched the Hillingdon AC RAG knowledge base for "${query}", but I couldn't find a sufficiently verified record in our current membership, training scores, or competition database.`,
            actionableSteps: [
                "Verify Spelling: Ensure athlete names (e.g. 'Bradley Stone', 'Zoe Dobbs') or specific event codes are spelled as registered on Power of 10 or club records.",
                "Membership & Fee Inquiries: For direct debit status, EA registration numbers, or renewal errors, please provide your HAC ID or full name to the Membership Secretary.",
                "Training & Trials: If you are an athlete or parent looking for junior trials, academy spaces, or training attendance, speak directly with the coaching desk at Hillingdon Athletics Stadium on training evenings.",
                "Submit Escalation: You can click the 'Request Human Assistance' button below so our club administrator or coaching team can review your query and get back to you directly."
            ],
            contactEmail: c.membership || "membership@hillingdonac.co.uk",
            contactDepartments: [
                { name: "Membership Secretary", email: c.membership || "membership@hillingdonac.co.uk", scope: "Renewals, fees, EA affiliations & Direct Debit" },
                { name: "Junior Academy & Trials", email: c.juniors || "juniors@hillingdonac.co.uk", scope: "Junior trials, academy waiting list, PB certificates" },
                { name: "General Club Desk", email: c.general || "info@hillingdonac.co.uk", scope: "Stadium access, competitions, fixtures & coaching" }
            ]
        };
    }

    /**
     * Synthesize clean, structured response using verified RAG documents
     */
    synthesizeAnswer(query, docs, matchedEntities = []) {
        const primaryDoc = docs[0];
        // Only treat as athlete score inquiry if an athlete entity was specifically matched or primary doc is an athlete doc
        const athleteDoc = (matchedEntities && matchedEntities.length > 0)
            ? docs.find(d => matchedEntities.includes(d.athleteName))
            : (primaryDoc?.athleteName ? primaryDoc : null);

        let answerMarkdown = "";

        // Scenario 1: Specific Athlete Score Inquiry (Arlington, Junior PB, or Vets)
        if (athleteDoc && athleteDoc.metadata?.raw) {
            const athleteName = athleteDoc.athleteName;
            answerMarkdown += `### 🏃 Records & Scores for **${athleteName}**\n\n`;

            // Junior PB Awards
            const pbDoc = docs.find(d => d.type === 'athlete_pbs');
            if (pbDoc && pbDoc.metadata?.raw) {
                const pb = pbDoc.metadata.raw;
                answerMarkdown += `**EA Junior PB Award Standard:**\n`;
                answerMarkdown += `- **Highest Level Award**: \`${pb.highest_level_str || 'Level achieved'}\` in **${(pb.highest_event || '').replace(/_/g, ' ')}** with a mark of **${pb.highest_perf}**\n`;
                answerMarkdown += `- **Age Group / Category**: ${pb.age_group} (${pb.gender})\n\n`;

                if (pb.events && Object.keys(pb.events).length > 0) {
                    answerMarkdown += `| Event | Performance | Venue / Date | Position | Award Standard | Next Target |\n`;
                    answerMarkdown += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
                    Object.values(pb.events).forEach(ev => {
                        answerMarkdown += `| **${ev.event.replace(/_/g, ' ')}** | \`${ev.performance}\` | ${ev.venue} (${ev.date}) | ${ev.position} | ${ev.cert_title || ev.level_str} | ${ev.next_target} |\n`;
                    });
                    answerMarkdown += `\n`;
                }
            }

            // Arlington Drive Scores
            const arlDoc = docs.find(d => d.type === 'training_scores');
            if (arlDoc && arlDoc.metadata?.raw) {
                const arl = arlDoc.metadata.raw;
                answerMarkdown += `**Arlington Drive (0.45m) Time Trial Scores:**\n`;
                answerMarkdown += `- **Session Best Average**: \`${arl.best_avg_time} min/lap\` on *${arl.best_date || 'Historical'}* (${arl.best_laps} laps)\n`;
                answerMarkdown += `- **Total Sessions Recorded**: ${arl.total_sessions} sessions\n\n`;

                if (arl.sessions && arl.sessions.length > 0) {
                    answerMarkdown += `**Recent Arlington Sessions:**\n`;
                    answerMarkdown += `| Date | Reps/Laps | Average Lap Time |\n`;
                    answerMarkdown += `| :--- | :--- | :--- |\n`;
                    arl.sessions.slice(0, 5).forEach(s => {
                        answerMarkdown += `| ${s.date} | ${s.laps} | ${s.avg_time} mins |\n`;
                    });
                    answerMarkdown += `\n`;
                }
            }

            // Vets League Scores
            const vetsDoc = docs.find(d => d.type === 'vets_league');
            if (vetsDoc && vetsDoc.metadata?.raw) {
                const results = vetsDoc.metadata.raw;
                answerMarkdown += `**Southern Vets League Performances:**\n`;
                answerMarkdown += `| Meet | Event | Category | Result | Pos | Points |\n`;
                answerMarkdown += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
                results.slice(0, 5).forEach(r => {
                    answerMarkdown += `| Meet ${r.meet_id} | ${r.event_name || r.event_code} | ${r.age_clean} | \`${r.perf}\` | ${r.position} | **${r.points_scored} pts** |\n`;
                });
                answerMarkdown += `\n`;
            }
        }
        // Scenario 2: Rules & Regulations (EA Age Groups & UKA Competition Rules)
        else if (primaryDoc.type === 'rules_and_regulations') {
            answerMarkdown += `### ⚖️ ${primaryDoc.title}\n\n`;
            answerMarkdown += `${primaryDoc.content}\n\n`;
            answerMarkdown += `> **UKA & EA Compliance:** Verified against UK Athletics (UKA) Rules for Competition 2026–2028 & England Athletics Age Group Guidance. For team selection, competition entries, or rule clarifications, check with your HAC Team Manager or contact \`${this.baseData.contacts.general}\`.\n\n`;
        }
        // Scenario 2b: Meet Management & Meeting Operations
        else if (primaryDoc.type === 'meet_management') {
            answerMarkdown += `### 🏆 ${primaryDoc.title}\n\n`;
            answerMarkdown += `${primaryDoc.content}\n\n`;
            answerMarkdown += `> **Meet Operations Tip:** Open the **Meet Manager** tile on the dashboard to view interactive checklists, live weather forecasts for Uxbridge, autonomous agent task audits, and the automatic card reader results ingest stream!\n\n`;
        }
        // Scenario 3: General Enquiries (Parking, Spikes, Kit, Nutrition, Records)
        else if (primaryDoc.type === 'general_enquiry') {
            answerMarkdown += `### 🏟️ ${primaryDoc.title}\n\n`;
            answerMarkdown += `${primaryDoc.content}\n\n`;
        }
        // Scenario 3: Membership Process or FAQs
        else if (primaryDoc.type === 'membership') {
            answerMarkdown += `### 📋 ${primaryDoc.title}\n\n`;
            answerMarkdown += `${primaryDoc.content}\n\n`;
            answerMarkdown += `> **Important Note:** If you need specific account changes or individual reconciliation, contact Martin S (Membership Secretary) at \`${this.baseData.contacts.membership}\`.\n\n`;
        }
        // Scenario 4: Training Sessions & Schedule
        else if (primaryDoc.type === 'training_sessions') {
            answerMarkdown += `### 🏟️ Training Sessions & Timetable\n\n`;
            answerMarkdown += `${primaryDoc.content}\n\n`;
        }
        // Scenario 5: Admin Custom Notes
        else if (primaryDoc.type === 'custom_note') {
            answerMarkdown += `### 📌 Verified Admin Note: ${primaryDoc.title}\n\n`;
            answerMarkdown += `${primaryDoc.content}\n\n`;
        }
        // Scenario 6: General Synthesis
        else {
            answerMarkdown += `### ℹ️ ${primaryDoc.title}\n\n`;
            answerMarkdown += `${primaryDoc.content}\n\n`;
        }

        return {
            isFallback: false,
            content: answerMarkdown.trim(),
            primaryCategory: primaryDoc.metadata?.category || 'HAC Knowledge'
        };
    }
}

export const hacyRagService = new HacyRagEngine();
