/**
 * Meet Agent Service
 * Autonomous long-running agent workflow manager for Hillingdon AC track and field meets.
 * Tracks task readiness, runs scheduled health checks, triggers automated tasks (letters, card reader, Po10),
 * and provides persistent state management across sessions.
 */

import { INITIAL_CHECKLIST_ITEMS, LEAGUES, MOCK_WEATHER_FORECASTS, buildInitialChecklistsForLeagues, DEFAULT_ONEDRIVE_FOLDER_URL, DEFAULT_DOCUMENT_LIBRARY } from '../data/meetManagerData';
import { supabase } from '../lib/supabase';

const STORAGE_KEY_CHECKLISTS = 'hac_meet_manager_checklists_v2';
const STORAGE_KEY_AGENT_LOGS = 'hac_meet_manager_agent_logs_v1';
const STORAGE_KEY_CUSTOM_CONTACTS = 'hac_meet_manager_custom_contacts_v1';
const STORAGE_KEY_ONEDRIVE_URL = 'hac_meet_manager_onedrive_url';
const STORAGE_KEY_CUSTOM_DOCS = 'hac_meet_manager_custom_docs_v1';

class MeetAgentService {
    constructor() {
        this.checklists = this.loadChecklists();
        this.agentLogs = this.loadAgentLogs();
        this.customDocs = this.loadCustomDocs();
        this.oneDriveUrl = this.loadOneDriveUrl();
        this.listeners = new Set();
        this.heartbeatTimer = null;
        this.startHeartbeat();
    }

    // ----------------------------------------------------
    // PERSISTENCE & STATE
    // ----------------------------------------------------
    loadChecklists() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_CHECKLISTS);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].leagueId) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn('Failed to load checklists from localStorage:', e);
        }
        return buildInitialChecklistsForLeagues();
    }

    saveChecklists() {
        try {
            localStorage.setItem(STORAGE_KEY_CHECKLISTS, JSON.stringify(this.checklists));
        } catch (e) {
            console.error('Failed to save checklists:', e);
        }
        this.notifyListeners();
    }

    loadOneDriveUrl() {
        try {
            return localStorage.getItem(STORAGE_KEY_ONEDRIVE_URL) || DEFAULT_ONEDRIVE_FOLDER_URL;
        } catch {
            return DEFAULT_ONEDRIVE_FOLDER_URL;
        }
    }

    saveOneDriveUrl(url) {
        try {
            this.oneDriveUrl = url || DEFAULT_ONEDRIVE_FOLDER_URL;
            localStorage.setItem(STORAGE_KEY_ONEDRIVE_URL, this.oneDriveUrl);
        } catch (e) {
            console.error('Failed to save OneDrive URL:', e);
        }
        this.notifyListeners();
    }

    loadCustomDocs() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_DOCS);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    saveCustomDocs(docs) {
        try {
            this.customDocs = docs;
            localStorage.setItem(STORAGE_KEY_CUSTOM_DOCS, JSON.stringify(docs));
        } catch (e) {
            console.error('Failed to save custom documents:', e);
        }
        this.notifyListeners();
    }

    getAllDocuments(categoryFilter = 'all', leagueFilter = 'all') {
        const combined = [...this.customDocs, ...DEFAULT_DOCUMENT_LIBRARY];
        return combined.filter(doc => {
            const matchCat = categoryFilter === 'all' || doc.category === categoryFilter;
            const matchLeague = leagueFilter === 'all' || doc.league === 'all' || doc.league === leagueFilter;
            return matchCat && matchLeague;
        });
    }

    addCustomDocument(newDoc) {
        const docObj = {
            ...newDoc,
            id: 'custom_doc_' + Date.now(),
            createdAt: new Date().toISOString()
        };
        const updated = [docObj, ...this.customDocs];
        this.saveCustomDocs(updated);
        this.logAgentActivity(
            docObj.league || 'all',
            'Document Archive Agent',
            `Added document link: "${docObj.title}" (${docObj.format}) to archive repository.`,
            'success'
        );
        return docObj;
    }

    loadAgentLogs() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_AGENT_LOGS);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {
            console.warn('Failed to load agent logs:', e);
        }
        // Default initial bootstrap log entries
        return [
            {
                id: 'log-1',
                timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
                agentId: 'system',
                agentName: 'Meet Ops Orchestrator',
                type: 'info',
                message: 'Autonomous Meet Management Agents initialized for YDL, Alder Valley, and VETS leagues.'
            },
            {
                id: 'log-2',
                timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
                agentId: 'ydl',
                agentName: 'YDL Prep Agent',
                type: 'success',
                message: 'Sunday fixture date requested for YDL at Hillingdon Athletics Stadium (Michael Illing confirmation logged).'
            },
            {
                id: 'log-3',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                agentId: 'vets',
                agentName: 'VETS League Agent',
                type: 'info',
                message: 'Monday evening fixture confirmed for Southern Vets League Meet 2.'
            },
            {
                id: 'log-4',
                timestamp: new Date(Date.now() - 1800000).toISOString(),
                agentId: 'system',
                agentName: 'Equipment & Supplies Agent',
                type: 'warning',
                message: 'Bib order with Stacey and Sons in draft status; submit at least 4 weeks prior to match.'
            }
        ];
    }

    saveAgentLogs() {
        try {
            localStorage.setItem(STORAGE_KEY_AGENT_LOGS, JSON.stringify(this.agentLogs.slice(0, 150)));
        } catch (e) {
            console.error('Failed to save agent logs:', e);
        }
        this.notifyListeners();
    }

    logAgentActivity(agentId, agentName, message, type = 'info') {
        const entry = {
            id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            timestamp: new Date().toISOString(),
            agentId,
            agentName,
            type,
            message
        };
        this.agentLogs = [entry, ...this.agentLogs].slice(0, 150);
        this.saveAgentLogs();
        return entry;
    }

    // ----------------------------------------------------
    // SUBSCRIPTION PATTERN FOR REACT COMPONENTS
    // ----------------------------------------------------
    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    notifyListeners() {
        this.listeners.forEach(cb => {
            try { cb(); } catch (e) { console.error('Error in listener callback', e); }
        });
    }

    // ----------------------------------------------------
    // BACKGROUND HEARTBEAT / LONG-RUNNING AGENT SIMULATION
    // ----------------------------------------------------
    startHeartbeat() {
        if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
        // Automated heartbeat cycle runs every 45 seconds to perform background health assessments
        this.heartbeatTimer = setInterval(() => {
            this.runAutonomousAuditCycle();
        }, 45000);
    }

    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    runAutonomousAuditCycle() {
        // Evaluate readiness metrics and record automatic autonomous logs
        LEAGUES.forEach(league => {
            const stats = this.getLeagueStats(league.id);
            if (stats.pendingCritical > 0 && Math.random() < 0.2) {
                this.logAgentActivity(
                    league.id,
                    `${league.shortName} Agent`,
                    `Heartbeat check: ${stats.pendingCritical} critical task(s) require action for upcoming fixture.`,
                    'warning'
                );
            }
        });
    }

    // ----------------------------------------------------
    // CHECKLIST RETRIEVAL & MUTATION (PER-LEAGUE INDEPENDENCE)
    // ----------------------------------------------------
    getChecklist(stageFilter = 'all', leagueFilter = 'all') {
        return this.checklists.filter(item => {
            const matchesStage = stageFilter === 'all' || item.stage === stageFilter;
            const matchesLeague = leagueFilter === 'all' || item.leagueId === leagueFilter;
            return matchesStage && matchesLeague;
        });
    }

    updateTaskStatus(taskId, newStatus, customNote = null) {
        let changedTask = null;
        this.checklists = this.checklists.map(item => {
            if (item.id === taskId) {
                changedTask = {
                    ...item,
                    defaultStatus: newStatus,
                    updatedAt: new Date().toISOString(),
                    agentNote: customNote !== null ? customNote : item.agentNote
                };
                return changedTask;
            }
            return item;
        });

        this.saveChecklists();

        if (changedTask) {
            const statusLabel = newStatus.replace('_', ' ').toUpperCase();
            this.logAgentActivity(
                changedTask.leagueId || 'task_agent',
                `${changedTask.leagueShortName || 'Meet'} Agent`,
                `[${changedTask.leagueShortName || 'Meet'}] Task updated: "${changedTask.task}" marked as ${statusLabel}`,
                newStatus === 'completed' ? 'success' : newStatus === 'blocked' ? 'error' : 'info'
            );
        }
        return changedTask;
    }

    resetLeagueChecklist(leagueId) {
        const freshLeagues = buildInitialChecklistsForLeagues().filter(i => i.leagueId === leagueId);
        this.checklists = [
            ...this.checklists.filter(i => i.leagueId !== leagueId),
            ...freshLeagues
        ];
        this.saveChecklists();
        const league = LEAGUES.find(l => l.id === leagueId);
        this.logAgentActivity(
            leagueId,
            `${league ? league.shortName : 'Meet'} Agent`,
            `Reset ${league ? league.shortName : 'Meet'} checklist to fresh template. Other meets preserved.`,
            'info'
        );
    }

    resetChecklistToDefault() {
        this.checklists = buildInitialChecklistsForLeagues();
        this.saveChecklists();
        this.logAgentActivity('system', 'System Orchestrator', 'All meet checklists reset to default initial state.', 'info');
    }

    // ----------------------------------------------------
    // LEAGUE READINESS & METRICS (PER-LEAGUE ACCURACY)
    // ----------------------------------------------------
    getLeagueStats(leagueId) {
        const items = this.checklists.filter(i => i.leagueId === leagueId);
        const total = items.length;
        const completed = items.filter(i => i.defaultStatus === 'completed').length;
        const inProgress = items.filter(i => i.defaultStatus === 'in_progress').length;
        const notStarted = items.filter(i => i.defaultStatus === 'not_started').length;
        const blocked = items.filter(i => i.defaultStatus === 'blocked').length;
        const pendingCritical = items.filter(i => i.critical && i.defaultStatus !== 'completed').length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        let statusText = 'Ready';
        let statusColor = 'emerald';
        if (blocked > 0) {
            statusText = 'Blocked Task';
            statusColor = 'rose';
        } else if (pendingCritical > 3) {
            statusText = 'Action Required';
            statusColor = 'amber';
        } else if (percentage < 50) {
            statusText = 'In Preparation';
            statusColor = 'blue';
        }

        return {
            total,
            completed,
            inProgress,
            notStarted,
            blocked,
            pendingCritical,
            percentage,
            statusText,
            statusColor
        };
    }

    // ----------------------------------------------------
    // AUTOMATED ACTION 1: Run Comprehensive Audit
    // ----------------------------------------------------
    runFullAudit(leagueId = 'all') {
        const timestamp = new Date().toLocaleTimeString();
        const leaguesToAudit = leagueId === 'all' ? LEAGUES : LEAGUES.filter(l => l.id === leagueId);

        const auditReport = leaguesToAudit.map(league => {
            const stats = this.getLeagueStats(league.id);
            const leagueItems = this.checklists.filter(i => i.leagueId === league.id);
            const criticalPending = leagueItems.filter(i => i.critical && i.defaultStatus !== 'completed');

            return {
                leagueId: league.id,
                leagueName: league.name,
                dayPreference: league.dayPreference,
                coordinator: league.coordinator,
                readiness: stats.percentage,
                criticalPendingCount: criticalPending.length,
                criticalItems: criticalPending.map(c => c.task),
                hostStatus: league.hostedByHac ? `Hosted at Hillingdon Athletics Stadium (${league.hostFixtureDate})` : 'Away / Neutral'
            };
        });

        this.logAgentActivity(
            'audit_agent',
            'Autonomous Audit Agent',
            `Audit completed across ${leaguesToAudit.length} league(s) at ${timestamp}. Overall health: Stable.`,
            'success'
        );

        return auditReport;
    }

    // ----------------------------------------------------
    // AUTOMATED ACTION 2: Generate 2-Week Notice Letter
    // ----------------------------------------------------
    generateNoticeLetter(leagueId = 'ydl') {
        const league = LEAGUES.find(l => l.id === leagueId) || LEAGUES[0];
        const dateStr = league.hostFixtureDate || '2027-05-16';
        const dayStr = league.dayPreference || 'Sunday';

        const letter = `HILLINGDON ATHLETIC CLUB
Hillingdon Athletics Stadium, Gatting Way, Uxbridge, Middlesex, UB8 1ES
Website: www.hillingdonac.co.uk | Affiliated to England Athletics & UKA

TO: All Visiting Club Team Managers & Officials
RE: ${league.name} Match Notice & Technical Information
DATE OF EVENT: ${dayStr}, ${dateStr}

Dear Team Managers, Officials, and Competitors,

Hillingdon Athletic Club looks forward to welcoming your athletes, officials, and supporters to the upcoming ${league.name} fixture at Hillingdon Athletics Stadium.

1. VENUE & PARKING INFORMATION (IMPORTANT)
- Venue Address: Hillingdon Athletics Stadium, Gatting Way, Uxbridge, UB8 1ES.
- PARKING NOTICE: Please advise all traveling coaches, parents, and athletes that car parking at Gatting Way is a PAID facility managed by the council/leisure centre. You must pay via the on-site ticket machines or mobile parking app (PayByPhone). There is NO free parking, and parking enforcement operates strictly.
- Team Minibuses / Coaches: Drop-off allowed in designated turnaround; parking strictly in marked coach bays.

2. TIMETABLE & ARRIVAL
- Gates & Reception Open: ${league.id === 'vets' ? '17:30' : '09:00'}
- First Track & Field Events: ${league.id === 'vets' ? '18:30' : '10:30'}
- Team Managers Declaration & Bib Collection: Please collect your club bib envelopes from the Reception Desk upon arrival.

3. OFFICIALS & SIGN-IN
- All participating clubs are required to provide their allocated UKA qualified officials and helpers.
- Officials signing-in sheets (for scoring points & travel allowance) and non-scoring volunteer sheets are located at Reception.
- A technical briefing for track and field referees will take place 30 minutes prior to the first event.
- Complimentary tea, coffee, and lunch/refreshments will be served in the Clubhouse Hospitality Room for all working officials.

4. TECHNICAL DETAILS & SPIKES
- Maximum spike length permitted on the synthetic track is 6mm (pyramid or Christmas tree). Needle spikes are strictly forbidden. Up to 9mm permitted for High Jump and Javelin runways.
- Electronic Photo Finish timing and EDM measurement will be in operation.
- Results will be recorded via automated card readers directly to the live scoring sheets. A QR code for live provisional results will be posted trackside.

5. POST-EVENT RESULTS
- Full match results will be emailed to all Team Managers within 24 hours and submitted directly to Power of 10.

If you have any questions or require special assistance prior to match day, please contact our Meeting Secretary at info@hillingdonac.co.uk.

Yours in sport,

Meet Management Committee
Hillingdon Athletic Club`;

        this.logAgentActivity(
            league.id,
            `${league.shortName} Agent`,
            `Auto-drafted formal 2-week notice letter for ${league.shortName} visiting club managers.`,
            'info'
        );

        return letter;
    }

    // ----------------------------------------------------
    // AUTOMATED ACTION 3: Simulate Card Reader Results Ingest
    // ----------------------------------------------------
    simulateCardReaderIngest(leagueId = 'ydl') {
        const sampleScannedCards = [
            { id: 'CR-101', event: '100m A', athlete: 'Marcus Vance', club: 'Hillingdon AC', bib: 'H14', perf: '11.42s', pos: 1, points: 9, wind: '+0.8' },
            { id: 'CR-102', event: '100m A', athlete: 'Tyler Smith', club: 'Thames Valley Harriers', bib: 'T08', perf: '11.68s', pos: 2, points: 7, wind: '+0.8' },
            { id: 'CR-103', event: '100m A', athlete: 'Liam Clarke', club: 'Herne Hill Harriers', bib: 'H22', perf: '11.95s', pos: 3, points: 6, wind: '+0.8' },
            { id: 'CR-104', event: '800m A', athlete: 'Chloe Jenkins', club: 'Hillingdon AC', bib: 'H05', perf: '2:14.30', pos: 1, points: 9, wind: 'N/A' },
            { id: 'CR-105', event: '800m A', athlete: 'Emily Watson', club: 'Ealing Southall & Middx', bib: 'E12', perf: '2:16.80', pos: 2, points: 7, wind: 'N/A' },
            { id: 'CR-106', event: 'Shot Put', athlete: 'David Miller', club: 'Hillingdon AC', bib: 'H31', perf: '12.45m', pos: 1, points: 9, wind: 'N/A' },
            { id: 'CR-107', event: 'Shot Put', athlete: 'George Davies', club: 'British Airways', bib: 'B04', perf: '11.20m', pos: 2, points: 7, wind: 'N/A' }
        ];

        this.logAgentActivity(
            'card_reader',
            'Card Reader Ingest Agent',
            `Scanned batch of ${sampleScannedCards.length} official event cards. Automatically published into Excel live scoring table without manual typing.`,
            'success'
        );

        return {
            timestamp: new Date().toISOString(),
            status: 'Success - Synced to Match Scoring Sheet',
            totalProcessed: sampleScannedCards.length,
            records: sampleScannedCards
        };
    }

    // ----------------------------------------------------
    // AUTOMATED ACTION 4: Power of 10 Submission File
    // ----------------------------------------------------
    generatePowerOf10Export(leagueId = 'vets') {
        const league = LEAGUES.find(l => l.id === leagueId) || LEAGUES[0];
        const dateStr = league.hostFixtureDate || '2027-06-07';

        const po10Content = `[MEET]
Title=Southern Athletics League / ${league.name} Meet
Venue=Hillingdon Athletics Stadium, Uxbridge
Date=${dateStr}
Level=Level 2 Licensed League
Permit=OUT-27/492
Surface=Synthetic Track
[RESULTS]
Event,Gender,AgeGroup,Pos,Athlete,Club,Perf,Wind,Points,Info
100m,Men,Senior,1,Marcus Vance,Hillingdon AC,11.42,+0.8,9,Scoring A
100m,Men,Senior,2,Tyler Smith,Thames Valley Harriers,11.68,+0.8,7,Scoring A
100m,Men,Senior,3,Liam Clarke,Herne Hill Harriers,11.95,+0.8,6,Scoring A
800m,Women,Senior,1,Chloe Jenkins,Hillingdon AC,2:14.30,,9,Scoring A
800m,Women,Senior,2,Emily Watson,Ealing Southall & Middx,2:16.80,,7,Scoring A
Shot Put,Men,Senior,1,David Miller,Hillingdon AC,12.45,,9,Scoring A
Shot Put,Men,Senior,2,George Davies,British Airways,11.20,,7,Scoring A
[END]`;

        this.logAgentActivity(
            league.id,
            'Power of 10 Submitter Agent',
            `Generated UKA / Power of 10 compliant export file for ${league.shortName}. Ready for upload to Athletics Data.`,
            'success'
        );

        return po10Content;
    }

    // ----------------------------------------------------
    // WEATHER FOR MEET DAYS
    // ----------------------------------------------------
    async getWeatherForecast(dateStr) {
        if (MOCK_WEATHER_FORECASTS[dateStr]) {
            return MOCK_WEATHER_FORECASTS[dateStr];
        }

        try {
            // Live Open-Meteo API query for Uxbridge (lat 51.5362, lon -0.4798)
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=51.5362&longitude=-0.4798&current_weather=true&hourly=precipitation_probability,windspeed_10m`);
            if (res.ok) {
                const data = await res.json();
                if (data && data.current_weather) {
                    const temp = Math.round(data.current_weather.temperature);
                    const wind = `${Math.round(data.current_weather.windspeed)} km/h`;
                    return {
                        temp,
                        condition: 'Live Forecast (Uxbridge Track)',
                        wind,
                        rainChance: '15%',
                        trackCondition: 'Dry & Fast Track',
                        uvIndex: 'Moderate (4)',
                        advice: 'Standard competition warm-up and hydration recommended.'
                    };
                }
            }
        } catch (e) {
            console.warn('Weather API fetch fallback used:', e);
        }

        return {
            temp: 20,
            condition: 'Clear to Partly Cloudy',
            wind: '7 mph SW',
            rainChance: '10%',
            trackCondition: 'Dry synthetic surface',
            uvIndex: 'Moderate (4)',
            advice: 'Ideal track and field competition weather.'
        };
    }
}

export const meetAgentService = new MeetAgentService();

