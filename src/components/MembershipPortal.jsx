import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    CreditCard,
    User,
    Calendar,
    ChevronRight,
    ChevronDown,
    ShieldCheck,
    Bell,
    Search,
    Filter,
    CheckCircle2,
    Clock,
    XCircle,
    Users,
    MapPin,
    Timer,
    ExternalLink,
    Megaphone,
    ArrowUpRight,
    X,
    Trophy,
    TrendingUp,
    Award
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import PaymentPortal from './PaymentPortal';
import { athleteService } from '../services/athleteService';
import { coachService } from '../services/coachService';
import { attendanceService } from '../services/attendanceService';
import { checkConnection } from '../lib/supabase';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const Logo = () => (
    <img
        src="/logo.png"
        alt="HAC Logo"
        className="h-12 w-auto object-contain"
    />
);

// Constants
const WORKFLOWS = {
    juniors: ['Awaiting Trials', 'In DT Academy', 'Trial Passed', 'Membership Form Completed'],
    seniors: ['Invitation Process', 'Confirmation', 'Membership Form Completed']
};

const MOCK_COACHES = [
    { id: 'C1', name: "Sarah Speed", teamName: "Falcons" },
    { id: 'C2', name: "Mike Distance", teamName: "Thunderbirds" },
    { id: 'C3', name: "Pauline Senior", teamName: "Eagles" },
];

const MOCK_MEMBERS = [
    { id: 'm1', name: "Alice Johnson", type: "juniors", state: "Awaiting Trials", email: "alice@example.com", photo: "https://i.pravatar.cc/150?u=1", hacId: "HAC-9921", eaId: "EA-88219", paid: false, coach_id: 'C1' },
    { id: 'm2', name: "Bob Smith", type: "juniors", state: "Trial Passed", email: "bob@example.com", photo: "https://i.pravatar.cc/150?u=2", hacId: "HAC-9922", eaId: "EA-88220", paid: false, coach_id: 'C2' },
    { id: 'm3', name: "Charlie Brown", type: "juniors", state: "In DT Academy", email: "charlie@example.com", photo: "https://i.pravatar.cc/150?u=3", hacId: "HAC-9923", eaId: "EA-88221", paid: true, coach_id: 'C2' },
    { id: 'm4', name: "Diana Prince", type: "seniors", state: "Invitation Process", email: "diana@example.com", photo: "https://i.pravatar.cc/150?u=4", hacId: "HAC-1102", eaId: "EA-11002", paid: false, coach_id: 'C1' },
    { id: 'm5', name: "Evan Wright", type: "seniors", state: "Membership Form Completed", email: "evan@example.com", photo: "https://i.pravatar.cc/150?u=5", hacId: "HAC-1103", eaId: "EA-11003", paid: true, coach_id: 'C2' },
    { id: 'm6', name: "Fiona Gallagher", type: "juniors", state: "Membership Form Completed", email: "fiona@example.com", photo: "https://i.pravatar.cc/150?u=6", hacId: "HAC-9924", eaId: "EA-88222", paid: true, coach_id: 'C1' },
    { id: 'm7', name: "George Bailey", type: "seniors", state: "Confirmation", email: "george@example.com", photo: "https://i.pravatar.cc/150?u=7", hacId: "HAC-1104", eaId: "EA-11004", paid: false, coach_id: 'C3' },
];

const CLUB_NEWS = [
    { id: 1, title: "Annual Spring 5K Run", manager: "Sarah Speed", date: "April 15, 2026", attending: 45, link: "#", notes: "Volunteers needed for marshaling." },
    { id: 2, title: "Junior Track Meet", manager: "Mike Distance", date: "May 2, 2026", attending: 112, link: "#", notes: "Registration closes next week." },
    { id: 3, title: "Charity Gala Dinner", manager: "Pauline Senior", date: "June 20, 2026", attending: 80, link: "#", notes: "Black tie event." },
];

const TRAINING_SESSIONS = [
    { id: 1, athlete: "Deepak Junior", type: "Sprint", distance: "100m x 10", timing: "18:00 - 19:30", location: "Hillingdon Stadium", coach: "Sarah Speed" },
    { id: 2, athlete: "Pauline Senior", type: "Distance", distance: "10k Tempo", timing: "19:00 - 20:30", location: "Ruislip Lido", coach: "Mike Distance" },
    { id: 3, athlete: "Deepak Junior", type: "Relay", distance: "4x100m", timing: "10:00 - 11:30 (Sat)", location: "Hillingdon Stadium", coach: "Sarah Speed" },
    { id: 4, athlete: "Pauline Senior", type: "Recovery", distance: "5k Easy", timing: "09:00 - 10:00 (Sun)", location: "Uxbridge Common", coach: "Self-led" },
];

// Historical Performance Data (Inspired by Arlington Drive XLSX)
const VENUES = ['Hillingdon Stadium', 'Arlington Drive', 'Ruislip Lido', 'Uxbridge Common', 'Lee Valley Athletics Centre', 'Parliament Hill'];

const PERFORMANCE_HISTORY = [
    { id: 1, athleteId: 1, athlete: "Alice Johnson", venue: "Arlington Drive", event: "0.45 mile", time: "3:13", date: "2026-02-03", isPB: false, coach: "Sarah Speed", sessionAvg: "3.22" },
    { id: 2, athleteId: 2, athlete: "Bob Smith", venue: "Arlington Drive", event: "0.45 mile", time: "2:53", date: "2026-02-03", isPB: true, coach: "Mike Distance", sessionAvg: "2.58" },
    { id: 3, athleteId: 3, athlete: "Charlie Brown", venue: "Arlington Drive", event: "0.45 mile", time: "3:01", date: "2026-02-03", isPB: false, coach: "Mike Distance", sessionAvg: "3.05" },
    { id: 4, athleteId: 1, athlete: "Alice Johnson", venue: "Hillingdon Stadium", event: "100m Sprint", time: "12.45s", date: "2026-01-15", isPB: true, coach: "Sarah Speed", sessionAvg: "12.60s" },
    { id: 5, athleteId: 3, athlete: "Charlie Brown", venue: "Ruislip Lido", event: "5K Run", time: "18:42", date: "2026-01-20", isPB: false, coach: "Mike Distance", sessionAvg: "19:10" },
    { id: 6, athleteId: 6, athlete: "Fiona Gallagher", venue: "Hillingdon Stadium", event: "400m", time: "58.92s", date: "2026-01-28", isPB: true, coach: "Sarah Speed", sessionAvg: "60.12s" },
    { id: 7, athleteId: 7, athlete: "George Bailey", venue: "Uxbridge Common", event: "5K Run", time: "19:55", date: "2026-01-05", isPB: true, coach: "Mike Distance", sessionAvg: "20:30" },
];

const ATTENDANCE_DATA = [
    {
        date: "2026-02-03", session: "Arlington Drive", records: [
            { athleteId: 1, status: "Present", result: "3.13" },
            { athleteId: 2, status: "Present", result: "2:53" },
            { athleteId: 3, status: "Present", result: "3:01" },
            { athleteId: 4, status: "Absent", result: "-" },
            { athleteId: 5, status: "Present", result: "2:44" },
            { athleteId: 6, status: "Present", result: "3:05" },
            { athleteId: 7, status: "Absent", result: "-" },
        ]
    },
    {
        date: "2026-01-28", session: "Speed Endurance", records: [
            { athleteId: 1, status: "Present", result: "12.45s" },
            { athleteId: 6, status: "Present", result: "58.92s" },
        ]
    }
];

const ClubNewsSection = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Megaphone size={20} className="text-blue-500" />
                Club Events & News
            </h3>
            <button className="text-sm text-emerald-600 font-medium hover:text-emerald-700">View All</button>
        </div>
        <div className="divide-y divide-slate-100">
            {CLUB_NEWS.map(news => (
                <div key={news.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-900">{news.title}</h4>
                        <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded">
                            {news.date}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 mb-3">
                        <p><span className="font-medium text-slate-400">Event Manager:</span> {news.manager}</p>
                        <p><span className="font-medium text-slate-400">Attending:</span> {news.attending} athletes</p>
                        <p className="col-span-1 md:col-span-2"><span className="font-medium text-slate-400">Notes:</span> {news.notes}</p>
                    </div>
                    <a href={news.link} className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700">
                        Event Details <ExternalLink size={14} />
                    </a>
                </div>
            ))}
        </div>
    </div>
);

const TrainingDetail = ({ session, onBack }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                <ChevronRight size={20} className="rotate-180" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Timer size={20} className="text-amber-500" />
                Session Details
            </h3>
        </div>
        <div className="p-8">
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{session.distance}</h1>
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-medium">
                            <Clock size={14} />
                            {session.timing}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-medium">
                            <Users size={14} />
                            {session.type} Group
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Coach</p>
                    <p className="text-lg font-medium text-slate-900">{session.coach}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <MapPin size={18} className="text-slate-400" />
                        Location
                    </h4>
                    <p className="text-lg text-slate-700 mb-1">{session.location}</p>
                    <p className="text-sm text-slate-500">Meet at the main entrance 10 mins prior.</p>
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <User size={18} className="text-slate-400" />
                        Attendees
                    </h4>
                    <div className="flex -space-x-3 overflow-hidden p-1">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                                {String.fromCharCode(64 + i)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const TrainingManager = () => {
    const [selectedSession, setSelectedSession] = useState(null);

    if (selectedSession) {
        return <TrainingDetail session={selectedSession} onBack={() => setSelectedSession(null)} />;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Timer size={20} className="text-amber-500" />
                    Training Schedule
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 font-semibold text-slate-900">Session Type</th>
                            <th className="px-6 py-3 font-semibold text-slate-900">Distance/Sets</th>
                            <th className="px-6 py-3 font-semibold text-slate-900">Location</th>
                            <th className="px-6 py-3 font-semibold text-slate-900">Coach</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {TRAINING_SESSIONS.map(session => (
                            <tr key={session.id} onClick={() => setSelectedSession(session)} className="hover:bg-slate-50 cursor-pointer group transition-colors">
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium group-hover:bg-amber-100 group-hover:text-amber-700 transition-colors">
                                        <Clock size={12} />
                                        {session.type} ({session.timing})
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-600 font-medium group-hover:text-slate-900">{session.distance}</td>
                                <td className="px-6 py-4 text-slate-600 flex items-center gap-1">
                                    <MapPin size={14} className="text-slate-400" />
                                    {session.location}
                                </td>
                                <td className="px-6 py-4 text-slate-600">{session.coach}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
// Helper to parse time strings (e.g., "3:13", "12.45s") into seconds for comparison
const parseTimeToSeconds = (timeStr) => {
    if (!timeStr || timeStr === '-') return Infinity;
    // Strict check: If it contains any letters, it's a note, not a timing
    if (/[a-zA-Z]/.test(timeStr)) return Infinity;

    const cleanTime = String(timeStr).replace(/[^\d:.]/g, '');
    if (cleanTime.includes(':')) {
        const parts = cleanTime.split(':');
        if (parts.length === 2) return (parseInt(parts[0]) * 60) + parseFloat(parts[1]);
        if (parts.length === 3) return (parseInt(parts[0]) * 3600) + (parseInt(parts[1]) * 60) + parseFloat(parts[2]);
    }
    return parseFloat(cleanTime) || Infinity;
};

const PerformanceHistory = ({ userType, athleteId = null, athletes = [], coaches = [] }) => {
    const [filterVenue, setFilterVenue] = useState('All');
    const [filterDate, setFilterDate] = useState('All');
    const [performances, setPerformances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdminEdit, setIsAdminEdit] = useState(false);

    React.useEffect(() => {
        const loadPerformances = async () => {
            setLoading(true);
            try {
                const data = await attendanceService.getPerformances({
                    date: filterDate,
                    venue: filterVenue,
                    athleteId
                });

                // Filter: Only keep results that are valid timings
                const timingData = (data || []).filter(p => parseTimeToSeconds(p.result) !== Infinity);
                setPerformances(timingData);
            } catch (err) {
                console.error('Failed to load performances:', err);
            } finally {
                setLoading(false);
            }
        };
        loadPerformances();
    }, [filterDate, filterVenue, athleteId]);

    // Matrix Transformation Logic (Only used when filterDate === 'All')
    const uniqueDates = Array.from(new Set(performances.map(p => p.date))).sort((a, b) => new Date(b) - new Date(a));

    const athleteRows = performances.reduce((acc, p) => {
        const aId = String(p.athlete_id);
        const seconds = parseTimeToSeconds(p.result);

        // In matrix view, we only want columns that have actual timings to avoid clutter
        if (seconds === Infinity && filterDate === 'All') return acc;

        if (!acc[aId]) {
            const athlete = athletes.find(a => String(a.id) === aId);
            acc[aId] = {
                id: aId,
                name: athlete?.name || 'Unknown',
                photo: athlete?.photo_url,
                results: {},
                bestTime: Infinity
            };
        }
        acc[aId].results[p.date] = p.result;
        if (seconds < acc[aId].bestTime) acc[aId].bestTime = seconds;
        return acc;
    }, {});

    const sortedAthletes = Object.values(athleteRows).sort((a, b) => a.bestTime - b.bestTime);
    const isListView = filterDate !== 'All';

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Trophy size={20} className="text-amber-500" />
                    {athleteId ? "My Performance History" : "Club Performance History"}
                </h2>
                {userType === 'management' && (
                    <button
                        onClick={() => setIsAdminEdit(!isAdminEdit)}
                        className="text-xs font-bold px-3 py-1 rounded bg-slate-900 text-white hover:bg-slate-700"
                    >
                        {isAdminEdit ? "Finish Editing" : "Manage History"}
                    </button>
                )}
            </div>

            <div className="flex flex-wrap gap-2 items-center bg-white rounded-xl p-3 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg">
                    <Calendar size={14} className="text-slate-400" />
                    <input
                        type="date"
                        value={filterDate === 'All' ? '' : filterDate}
                        onChange={e => setFilterDate(e.target.value || 'All')}
                        className="text-xs bg-transparent font-bold outline-none"
                    />
                    {filterDate !== 'All' && (
                        <button onClick={() => setFilterDate('All')} className="text-[10px] text-slate-400 hover:text-slate-600 font-bold ml-1">Clear</button>
                    )}
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg">
                    <MapPin size={14} className="text-slate-400" />
                    <select value={filterVenue} onChange={e => setFilterVenue(e.target.value)} className="text-xs bg-transparent font-bold outline-none">
                        <option value="All">All Venues</option>
                        {VENUES.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
                {loading ? (
                    <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Analytics...</div>
                ) : isListView ? (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Athlete</th>
                                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Venue / Session</th>
                                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Result / Note</th>
                                {isAdminEdit && <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {performances.sort((a, b) => parseTimeToSeconds(a.result) - parseTimeToSeconds(b.result)).map((p, idx) => {
                                const athlete = athletes.find(a => String(a.id) === String(p.athlete_id));
                                const coach = coaches.find(c => String(c.id) === String(p.coach_id));
                                return (
                                    <tr key={p.id} className={cn("hover:bg-slate-50 transition-colors", idx === 0 && performances.length > 1 && "bg-amber-50/30")}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {idx === 0 && performances.length > 1 && <Trophy size={14} className="text-amber-500" />}
                                                <img src={athlete?.photo_url || `https://i.pravatar.cc/150?u=${p.athlete_id}`} className="w-6 h-6 rounded-full" />
                                                <span className="font-bold text-slate-900">{athlete?.name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-700">{p.session_name}</div>
                                            <div className="text-xs text-slate-400 flex items-center gap-1">
                                                {coach?.name && <><User size={10} /> {coach.name}</>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2 py-1 rounded-lg font-black text-xs",
                                                parseTimeToSeconds(p.result) !== Infinity ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-600"
                                            )}>
                                                {p.result}
                                            </span>
                                        </td>
                                        {isAdminEdit && (
                                            <td className="px-6 py-4">
                                                <button className="text-blue-600 hover:underline font-bold text-xs uppercase">Edit</button>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px] border-r sticky left-0 bg-slate-50 z-10 w-48">Athlete</th>
                                {uniqueDates.map(date => {
                                    // Skip columns that consist entirely of non-timing notes if looking at "All"
                                    const hasTimings = sortedAthletes.some(a => parseTimeToSeconds(a.results[date]) !== Infinity);
                                    if (!hasTimings && filterDate === 'All') return null;
                                    return (
                                        <th key={date} className="px-4 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px] text-center min-w-[100px]">
                                            {new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {sortedAthletes.map((athlete, idx) => (
                                <tr key={athlete.id} className={cn("hover:bg-slate-50 transition-colors", idx === 0 && sortedAthletes.length > 1 && "bg-amber-50/30")}>
                                    <td className="px-6 py-4 border-r sticky left-0 bg-white z-10">
                                        <div className="flex items-center gap-3">
                                            {idx === 0 && sortedAthletes.length > 1 && <Trophy size={14} className="text-amber-500 shrink-0" />}
                                            <div className="relative">
                                                <img src={athlete.photo || `https://i.pravatar.cc/150?u=${athlete.id}`} className="w-8 h-8 rounded-full border border-slate-100" />
                                                {idx === 0 && sortedAthletes.length > 1 && (
                                                    <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[8px] px-1 rounded-full font-black">1st</span>
                                                )}
                                            </div>
                                            <span className="font-bold text-slate-900 whitespace-nowrap">{athlete.name}</span>
                                        </div>
                                    </td>
                                    {uniqueDates.map(date => {
                                        const hasTimings = sortedAthletes.some(a => parseTimeToSeconds(a.results[date]) !== Infinity);
                                        if (!hasTimings && filterDate === 'All') return null;

                                        const result = athlete.results[date];
                                        const isBest = result && parseTimeToSeconds(result) === athlete.bestTime && athlete.bestTime !== Infinity;
                                        return (
                                            <td key={date} className="px-4 py-4 text-center">
                                                {result ? (
                                                    <span className={cn(
                                                        "px-2 py-1 rounded text-xs font-black tracking-tight",
                                                        isBest ? "bg-emerald-500 text-white shadow-sm" : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                                    )}>
                                                        {result}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-200">-</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {!loading && (isListView ? performances : sortedAthletes).length === 0 && (
                    <div className="px-6 py-12 text-center text-slate-400 italic">No performance records found for the selected filters.</div>
                )}
            </div>

            {!isListView && (
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-emerald-500 rounded" /> Fastest Time
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-amber-50 rounded" /> Overall Leader
                    </div>
                </div>
            )}
            {isAdminEdit && (
                <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-sm hover:border-blue-500 hover:text-blue-500 transition-all">
                    + Add New Record
                </button>
            )}
        </div>
    );
};

const AttendanceManager = ({ userType, athleteId = null, athletes = [], coaches = [] }) => {
    const [selectedCoachId, setSelectedCoachId] = useState('All');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceRows, setAttendanceRows] = useState([]);
    const [saving, setSaving] = useState(false);

    React.useEffect(() => {
        const loadAttendance = async () => {
            if (athletes.length === 0) return;
            try {
                const data = await attendanceService.getForDateRange(selectedDate, selectedDate, selectedCoachId);
                setAttendanceRows(data || []);
            } catch (err) {
                console.error('Failed to load attendance rows:', err);
            }
        };
        loadAttendance();
    }, [selectedDate, selectedCoachId, athletes]);

    // Filter athletes relevant to the selected coach
    const visibleAthletes = athletes.filter(a => {
        if (athleteId) return String(a.id) === String(athleteId);
        const aCoachId = a.coach_id || a.coachId;
        return selectedCoachId === 'All' || String(aCoachId) === String(selectedCoachId);
    });

    const handleStatusChange = (aId, status) => {
        const existing = attendanceRows.find(r => String(r.athlete_id) === String(aId));
        if (existing) {
            setAttendanceRows(attendanceRows.map(r => String(r.athlete_id) === String(aId) ? { ...r, status } : r));
        } else {
            setAttendanceRows([...attendanceRows, { athlete_id: aId, status, date: selectedDate, coach_id: selectedCoachId === 'All' ? null : selectedCoachId }]);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Filter only records that have a status set
            const recordsToSave = attendanceRows
                .filter(r => r.date === selectedDate && r.status)
                .map(r => ({
                    athlete_id: r.athlete_id,
                    coach_id: r.coach_id || (athletes.find(a => String(a.id) === String(r.athlete_id))?.coach_id),
                    date: selectedDate,
                    status: r.status,
                    result: r.result || '',
                    session_name: r.session_name || 'Training Session'
                }));

            if (recordsToSave.length === 0) {
                alert('No changes to save.');
                setSaving(false);
                return;
            }

            await attendanceService.recordAttendance(recordsToSave);
            alert('Attendance saved successfully!');
        } catch (err) {
            console.error('Save failed:', err);
            alert('Failed to save attendance.');
        } finally {
            setSaving(false);
        }
    };


    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Calendar size={20} className="text-blue-500" />
                    {athleteId ? "My Attendance" : "Coach Calendar & Attendance"}
                </h2>
                <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                        <Calendar size={16} className="text-slate-400" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="text-xs font-bold outline-none bg-transparent"
                        />
                    </div>
                    {!athleteId && (
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                            <Users size={16} className="text-slate-400" />
                            <select
                                value={selectedCoachId}
                                onChange={(e) => setSelectedCoachId(e.target.value)}
                                className="text-xs font-bold outline-none bg-transparent"
                            >
                                <option value="All">All Coaches</option>
                                {coaches.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} ({c.team_name || c.teamName})</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <div>
                        <h3 className="font-black text-slate-900 tracking-tight">
                            {selectedCoachId === 'All' ? 'Club-wide Session' : `${coaches.find(c => String(c.id) === String(selectedCoachId))?.team_name || 'Team'} Session`}
                        </h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{selectedDate}</p>
                    </div>
                    {!athleteId && (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Attendance'}
                        </button>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3 font-bold text-slate-400 uppercase text-[10px]">Athlete</th>
                                <th className="px-6 py-3 font-bold text-slate-400 uppercase text-[10px]">Status</th>
                                <th className="px-6 py-3 font-bold text-slate-400 uppercase text-[10px]">Result/Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {visibleAthletes.map(athlete => {
                                const record = attendanceRows.find(r => String(r.athlete_id) === String(athlete.id));
                                return (
                                    <tr key={athlete.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={athlete.photo_url || athlete.photo || `https://i.pravatar.cc/150?u=${athlete.id}`} className="w-8 h-8 rounded-full border border-slate-100" />
                                                <span className="font-bold text-slate-900">{athlete.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {athleteId ? (
                                                <span className={cn(
                                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase",
                                                    record?.status === 'Present' ? "bg-emerald-100 text-emerald-700" :
                                                        record?.status === 'Absent' ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-400"
                                                )}>
                                                    {record?.status || 'No Record'}
                                                </span>
                                            ) : (
                                                <div className="flex gap-2">
                                                    {['Present', 'Absent', 'Late'].map(s => (
                                                        <button
                                                            key={s}
                                                            onClick={() => handleStatusChange(athlete.id, s)}
                                                            className={cn(
                                                                "px-2 py-1 rounded text-[10px] font-black uppercase transition-all",
                                                                record?.status === s ?
                                                                    (s === 'Present' ? "bg-emerald-500 text-white" : s === 'Absent' ? "bg-red-500 text-white" : "bg-amber-500 text-white") :
                                                                    "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                                            )}
                                                        >
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="text"
                                                placeholder="Result/Note..."
                                                value={record?.result || ''}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    const aId = athlete.id;
                                                    const existing = attendanceRows.find(r => String(r.athlete_id) === String(aId));
                                                    if (existing) {
                                                        setAttendanceRows(attendanceRows.map(r => String(r.athlete_id) === String(aId) ? { ...r, result: val } : r));
                                                    } else {
                                                        setAttendanceRows([...attendanceRows, { athlete_id: aId, result: val, date: selectedDate, coach_id: selectedCoachId === 'All' ? null : selectedCoachId }]);
                                                    }
                                                }}
                                                disabled={!!athleteId}
                                                className="bg-transparent text-xs font-bold text-slate-700 outline-none w-full border-b border-transparent focus:border-slate-200"
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                            {visibleAthletes.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="px-6 py-8 text-center text-slate-400 text-sm font-medium italic">
                                        No athletes found for this group.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const MemberDashboard = ({ currentView, athletes = [], coaches = [], onUpdateAthlete }) => {
    const [filterState, setFilterState] = useState('All');
    const [filterType, setFilterType] = useState('All');
    const [showStateDropdown, setShowStateDropdown] = useState(null);
    const [showCoachDropdown, setShowCoachDropdown] = useState(null);

    const filteredMembers = athletes
        .filter(m => filterState === 'All' || m.state === filterState)
        .filter(m => filterType === 'All' || m.type === filterType);

    const handleStateChange = async (id, newState) => {
        try {
            await athleteService.update(id, { state: newState });
            if (onUpdateAthlete) onUpdateAthlete(id, { state: newState });
        } catch (err) {
            console.warn('DB Update failed:', err);
        }
        setShowStateDropdown(null);
    };

    const handleCoachChange = async (id, newCoachId) => {
        try {
            await athleteService.update(id, { coach_id: newCoachId });
            if (onUpdateAthlete) {
                const selectedCoach = coaches.find(c => String(c.id) === String(newCoachId));
                onUpdateAthlete(id, {
                    coach_id: newCoachId,
                    coach: selectedCoach
                });
            }
        } catch (err) {
            console.warn('Coach DB update failed:', err);
        }
        setShowCoachDropdown(null);
    };

    const toggleTrackFees = async (id) => {
        const member = athletes.find(m => m.id === id);
        const newValue = !member.track_fees_paid && !member.trackFeesPaid;
        try {
            await athleteService.update(id, { track_fees_paid: newValue });
            if (onUpdateAthlete) onUpdateAthlete(id, { trackFeesPaid: newValue, track_fees_paid: newValue });
        } catch (err) {
            console.warn('Track fees DB update failed:', err);
        }
    };

    if (currentView === 'news') return <ClubNewsSection />;
    if (currentView === 'training') return <TrainingManager />;
    if (currentView === 'performances') return <PerformanceHistory userType="management" athletes={athletes} coaches={coaches} />;
    if (currentView === 'attendance') return <AttendanceManager userType="management" athletes={athletes} coaches={coaches} />;

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-xl font-bold text-slate-900">Member Management</h2>
                <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                        <Filter size={14} className="text-slate-400" />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="text-xs font-bold outline-none bg-transparent"
                        >
                            <option value="All">All Types</option>
                            <option value="juniors">Juniors Only</option>
                            <option value="seniors">Seniors Only</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                        <Clock size={14} className="text-slate-400" />
                        <select
                            value={filterState}
                            onChange={(e) => setFilterState(e.target.value)}
                            className="text-xs font-bold outline-none bg-transparent"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Awaiting Trials">Waitlist (Awaiting Trials)</option>
                            <option value="Trial Passed">Trial Passed</option>
                            <option value="Membership Form Completed">Fully Registered</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Member</th>
                                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Coach / Team</th>
                                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Status</th>
                                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Track Fees</th>
                                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredMembers.map(m => (
                                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={m.photo} className="w-10 h-10 rounded-full border border-slate-100" alt="" />
                                            <div>
                                                <p className="font-bold text-slate-900">{m.name}</p>
                                                <p className="text-xs text-slate-500">{m.email}</p>
                                                <span className={cn(
                                                    "inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase",
                                                    m.type === 'juniors' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                                                )}>
                                                    {m.type}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 relative">
                                        <button
                                            onClick={() => setShowCoachDropdown(showCoachDropdown === m.id ? null : m.id)}
                                            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-600 transition-colors"
                                        >
                                            {coaches.find(c => c.id === m.coach_id || c.id === m.coachId)?.name || 'Unassigned'}
                                            <ChevronDown size={14} />
                                        </button>
                                        {showCoachDropdown === m.id && (
                                            <div className="absolute left-6 mt-1 w-48 bg-white shadow-xl border rounded-xl z-50 overflow-hidden">
                                                {coaches.map(c => (
                                                    <button
                                                        key={c.id}
                                                        onClick={() => handleCoachChange(m.id, c.id)}
                                                        className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 font-medium"
                                                    >
                                                        {c.name} ({c.team_name || c.teamName})
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-full text-[10px] font-black uppercase",
                                            m.state === 'Membership Form Completed' ? "bg-emerald-100 text-emerald-700" :
                                                m.state === 'Awaiting Trials' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                                        )}>
                                            {m.state}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => toggleTrackFees(m.id)}
                                            className={cn(
                                                "p-1.5 rounded-lg border transition-all",
                                                m.trackFeesPaid ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-slate-50 border-slate-200 text-slate-400"
                                            )}
                                            title={m.trackFeesPaid ? "Fees Paid" : "Fees Outstanding"}
                                        >
                                            <CreditCard size={16} />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 relative">
                                        <button
                                            onClick={() => setShowStateDropdown(showStateDropdown === m.id ? null : m.id)}
                                            className="text-emerald-600 font-bold text-xs uppercase hover:underline flex items-center gap-1"
                                        >
                                            Update <ChevronRight size={14} />
                                        </button>
                                        {showStateDropdown === m.id && (
                                            <div className="absolute right-6 mt-1 w-56 bg-white shadow-xl border rounded-xl z-50 overflow-hidden">
                                                <div className="px-4 py-2 bg-slate-50 border-b text-[10px] font-bold text-slate-400 uppercase">Change Status</div>
                                                {(WORKFLOWS[m.type] || []).map(st => (
                                                    <button
                                                        key={st}
                                                        onClick={() => handleStateChange(m.id, st)}
                                                        className="w-full text-left px-4 py-2 text-xs hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                                                    >
                                                        {st}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Waitlist Specific Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
                    <div>
                        <h4 className="text-amber-800 font-bold text-sm">Waitlisted Athletes</h4>
                        <p className="text-amber-600 text-xs">Awaiting trial session allocation</p>
                    </div>
                    <div className="text-2xl font-black text-amber-500">
                        {athletes.filter(m => m.state === 'Awaiting Trials').length}
                    </div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                    <div>
                        <h4 className="text-emerald-800 font-bold text-sm">Track Fees Collection</h4>
                        <p className="text-emerald-600 text-xs">Total athletes with paid fees</p>
                    </div>
                    <div className="text-2xl font-black text-emerald-500">
                        {athletes.filter(m => m.trackFeesPaid || m.track_fees_paid).length} / {athletes.length}
                    </div>
                </div>
            </div>
        </div>
    );
};

const WorkflowStepper = ({ steps, currentStep }) => (
    <div className="w-full py-6 flex items-center justify-between">
        {steps.map((s, idx) => (
            <div key={s} className="flex flex-col items-center gap-2">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2", idx <= currentStep ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-200 text-slate-400")}>
                    {idx < currentStep ? '✓' : idx + 1}
                </div>
                <span className="text-[10px] text-slate-500 font-medium">{s}</span>
            </div>
        ))}
    </div>
);

const UserProfile = ({ userType, onManagePayments, athletes = [], coaches = [] }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const steps = userType === 'juniors' ? WORKFLOWS.juniors : WORKFLOWS.seniors;

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold mb-4">Membership Progress</h3>
                <WorkflowStepper steps={steps} currentStep={currentStep} />
                <div className="flex justify-end gap-2 mt-4">
                    <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} className="text-sm font-bold text-slate-400">Back</button>
                    <button onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))} className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold">Advance</button>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <TrendingUp size={24} className="text-emerald-500" />
                    Athlete Insights
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <AttendanceManager userType="athlete" athleteId={athletes[0]?.id && String(athletes[0].id).length > 5 ? athletes[0].id : null} athletes={athletes} coaches={coaches} />
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                            <h3 className="font-bold flex items-center gap-2 mb-4">
                                <Timer size={18} className="text-amber-500" /> Next Session
                            </h3>
                            <div className="p-4 bg-slate-50 rounded-xl border">
                                <p className="font-bold">Sprint Training (Falcons)</p>
                                <p className="text-sm text-slate-500">Hillingdon Stadium · Today, 18:00</p>
                            </div>
                        </div>
                        <div className="bg-slate-900 rounded-2xl p-6 shadow-sm text-white">
                            <h3 className="font-bold mb-2">Billing Status</h3>
                            <p className="text-slate-400 text-sm mb-4">Active Subscription · Monthly</p>
                            <button
                                onClick={onManagePayments}
                                className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest"
                            >
                                Manage Payments
                            </button>
                        </div>
                    </div>
                    <div>
                        <PerformanceHistory userType="athlete" athleteId={athletes[0]?.id && String(athletes[0].id).length > 5 ? athletes[0].id : null} athletes={athletes} coaches={coaches} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function MembershipPortal({ userType = 'juniors' }) {
    const [currentView, setCurrentView] = useState('dashboard');
    const [showPaymentSetup, setShowPaymentSetup] = useState(false);
    const [dbStatus, setDbStatus] = useState({ checked: false, connected: false, error: null });
    const [athletes, setAthletes] = useState([]);
    const [coaches, setCoaches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAnalyticsDropdown, setShowAnalyticsDropdown] = useState(false);

    const fetchData = async () => {
        try {
            const [athleteData, coachData] = await Promise.all([
                athleteService.getAll(),
                coachService.getAll()
            ]);

            const finalCoaches = coachData && coachData.length > 0 ? coachData : MOCK_COACHES;
            setCoaches(finalCoaches);

            if (athleteData && athleteData.length > 0) {
                // Manual Hydration: Attach coach object to athlete
                const hydratedAthletes = athleteData.map(a => {
                    const coach = finalCoaches.find(c => String(c.id) === String(a.coach_id));
                    return {
                        ...a,
                        coach,
                        trackFeesPaid: a.track_fees_paid
                    };
                });
                setAthletes(hydratedAthletes);
            } else {
                setAthletes(MOCK_MEMBERS.map(m => ({ ...m, trackFeesPaid: m.paid })));
            }
        } catch (err) {
            console.error('Failed to fetch from Supabase:', err);
            setAthletes(MOCK_MEMBERS.map(m => ({ ...m, trackFeesPaid: m.paid })));
            setCoaches(MOCK_COACHES);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        const verifyConnection = async () => {
            const status = await checkConnection();
            setDbStatus({ checked: true, ...status });
            if (status.connected) await fetchData();
        };
        verifyConnection();
    }, []);

    const handleUpdateAthleteLocal = (id, updates) => {
        setAthletes(prev => prev.map(a => String(a.id) === String(id) ? { ...a, ...updates } : a));
    };

    if (showPaymentSetup) {
        return (
            <div className="min-h-screen bg-slate-50 p-6">
                <button
                    onClick={() => setShowPaymentSetup(false)}
                    className="mb-6 px-4 py-2 bg-slate-900 text-white rounded-xl flex items-center gap-2 text-sm font-bold shadow-xl hover:bg-slate-800"
                >
                    <ChevronRight size={16} className="rotate-180" /> Back to Portal
                </button>
                <PaymentPortal
                    athleteData={{ name: 'Deepak Junior', email: 'deepak@example.com' }}
                    onComplete={(mandateId) => {
                        console.log('Setup finished with mandate:', mandateId);
                        // In real app, update athlete metadata in Supabase
                    }}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="bg-[#0f172a] text-white p-3 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="font-black text-xl tracking-tighter italic">HAC<span className="text-emerald-500">Portal</span></div>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentView('dashboard')} className={cn("px-3 py-1.5 rounded text-sm font-bold", currentView === 'dashboard' ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400 hover:text-white")}>Dashboard</button>
                            <button onClick={() => setCurrentView('news')} className={cn("px-3 py-1.5 rounded text-sm font-bold", currentView === 'news' ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400 hover:text-white")}>News</button>
                            <button onClick={() => setCurrentView('training')} className={cn("px-3 py-1.5 rounded text-sm font-bold", currentView === 'training' ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400 hover:text-white")}>Training</button>
                            {userType === 'management' && (
                                <>
                                    <button onClick={() => setCurrentView('attendance')} className={cn("px-3 py-1.5 rounded text-sm font-bold", currentView === 'attendance' ? "bg-blue-500/20 text-blue-400" : "text-slate-400 hover:text-white")}>Attendance</button>
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowAnalyticsDropdown(!showAnalyticsDropdown)}
                                            className={cn("flex items-center gap-1 px-3 py-1.5 rounded text-sm font-bold", currentView === 'performances' ? "bg-amber-500/20 text-amber-400" : "text-slate-400 hover:text-white")}
                                        >
                                            Analytics <ChevronDown size={14} />
                                        </button>
                                        {showAnalyticsDropdown && (
                                            <div className="absolute left-0 mt-2 w-48 bg-[#1e293b] border border-slate-700 rounded-xl shadow-2xl z-[100] overflow-hidden">
                                                <button
                                                    onClick={() => {
                                                        setCurrentView('performances');
                                                        setShowAnalyticsDropdown(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors"
                                                >
                                                    Club Performance History
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {dbStatus.checked && (
                            <div className={cn(
                                "flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider border",
                                dbStatus.connected
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-red-500/10 text-red-400 border-red-500/20"
                            )}>
                                <div className={cn("w-1.5 h-1.5 rounded-full", dbStatus.connected ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
                                {dbStatus.connected ? "DB Connected" : "DB Offline"}
                            </div>
                        )}
                        <div className="text-[10px] font-bold uppercase p-1.5 bg-slate-800 rounded border border-slate-700 tracking-widest">{userType} View</div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {loading ? (
                    <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing with Club Database...</div>
                ) : userType === 'management' ? (
                    <MemberDashboard currentView={currentView} athletes={athletes} coaches={coaches} onUpdateAthlete={handleUpdateAthleteLocal} />
                ) : (
                    currentView === 'dashboard' ? <UserProfile userType={userType} onManagePayments={() => setShowPaymentSetup(true)} athletes={athletes} coaches={coaches} /> :
                        currentView === 'news' ? <ClubNewsSection /> :
                            <TrainingManager />
                )}
            </main>
        </div>
    );
}
