import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    CreditCard,
    User,
    Calendar,
    ChevronRight,
    ChevronDown,
    ShieldCheck,
    Home,
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
    Award,
    StickyNote,
    Mail,
    Phone,
    Save,
    Plus,
    Trash2,
    Heart,
    MessageCircle,
    Share2,
    Image as ImageIcon,
    FileText
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import PaymentPortal from './PaymentPortal';
import MembershipForm from './MembershipForm';
import { athleteService } from '../services/athleteService';
import { coachService } from '../services/coachService';
import { attendanceService } from '../services/attendanceService';
import { meetService } from '../services/meetService';
import { socialService } from '../services/socialService';
import { authService } from '../services/authService';
import { websiteService } from '../services/websiteService';
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

const MeetRegistration = ({ athleteId }) => {
    const [meets, setMeets] = useState([]);
    const [registrations, setRegistrations] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMeets = async () => {
            try {
                const data = await meetService.getAllMeets();
                setMeets(data);
            } catch (err) {
                console.error('Failed to load meets:', err);
            } finally {
                setLoading(false);
            }
        };
        loadMeets();
    }, []);

    const handleEventToggle = async (meetId, event) => {
        const currentEvents = registrations[meetId] || [];
        const newEvents = currentEvents.includes(event)
            ? currentEvents.filter(e => e !== event)
            : [...currentEvents, event];

        try {
            await meetService.registerForMeet(athleteId, meetId, newEvents);
            setRegistrations({ ...registrations, [meetId]: newEvents });
            alert('Selection updated!');
        } catch (err) {
            console.error('Failed to update registration:', err);
        }
    };

    if (loading) return <div className="p-6 text-center text-xs font-bold text-slate-400">Loading Meets...</div>;

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
                <Trophy size={24} className="text-amber-500" />
                Upcoming Athletics Meets
            </h3>
            <div className="grid grid-cols-1 gap-4">
                {meets.map(meet => (
                    <div key={meet.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="text-lg font-bold text-slate-900">{meet.name}</h4>
                                <p className="text-sm text-slate-500">{meet.date} · {meet.location}</p>
                            </div>
                            <span className="bg-amber-100 text-amber-700 text-[10px] font-black uppercase px-2 py-1 rounded">Interest Registration</span>
                        </div>
                        <p className="text-xs text-slate-600 mb-4">{meet.description}</p>
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Events</p>
                            <div className="flex flex-wrap gap-2">
                                {(meet.events || []).map(event => (
                                    <button
                                        key={event}
                                        onClick={() => handleEventToggle(meet.id, event)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                                            (registrations[meet.id] || []).includes(event)
                                                ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200"
                                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                        )}
                                    >
                                        {event}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MeetReports = () => {
    const [meets, setMeets] = useState([]);
    const [selectedMeet, setSelectedMeet] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMeets = async () => {
            try {
                const data = await meetService.getAllMeets();
                setMeets(data);
                if (data.length > 0) setSelectedMeet(data[0]);
            } catch (err) {
                console.error('Failed to load meets:', err);
            } finally {
                setLoading(false);
            }
        };
        loadMeets();
    }, []);

    useEffect(() => {
        if (!selectedMeet) return;
        const loadRegistrations = async () => {
            try {
                const data = await meetService.getMeetRegistrations(selectedMeet.id);
                setRegistrations(data);
            } catch (err) {
                console.error('Failed to load registrations:', err);
            }
        };
        loadRegistrations();
    }, [selectedMeet]);

    if (loading) return <div className="p-6 text-center text-xs font-bold text-slate-400">Loading Report...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-xl font-bold text-slate-900">Meet Registration Reports</h2>
                <select
                    value={selectedMeet?.id}
                    onChange={(e) => setSelectedMeet(meets.find(m => m.id === e.target.value))}
                    className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-emerald-500"
                >
                    {meets.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                    <div className="text-xs font-black text-slate-500 uppercase tracking-widest">Athlete Interest List</div>
                    <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Total: {registrations.length}</div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Athlete</th>
                                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Type</th>
                                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Events</th>
                                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Registration Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {registrations.map(reg => (
                                <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-bold text-slate-900">{reg.athlete?.name}</p>
                                            <p className="text-xs text-slate-500">{reg.athlete?.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-1.5 py-0.5 rounded text-[9px] font-black uppercase",
                                            reg.athlete?.type === 'juniors' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                                        )}>
                                            {reg.athlete?.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {(reg.events || []).map(ev => (
                                                <span key={ev} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[9px] font-bold">{ev}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium text-slate-500">
                                        {new Date(reg.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {registrations.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-medium italic">
                                        No interest registrations yet for this meet.
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

const SocialPost = ({ post, onLike, onComment, currentMemberId }) => {
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img
                        src={post.author?.photo_url || `https://i.pravatar.cc/150?u=${post.author_id}`}
                        className="w-10 h-10 rounded-full border border-slate-100"
                        alt=""
                    />
                    <div>
                        <p className="font-bold text-slate-900">{post.author?.name || 'HAC Admin'}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {new Date(post.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {post.title && <h4 className="text-lg font-black text-slate-900 mb-2">{post.title}</h4>}
                <p className="text-slate-600 text-sm leading-relaxed mb-4">{post.content}</p>

                {post.media_url && post.media_type === 'image' && (
                    <img src={post.media_url} className="w-full rounded-xl mb-4 object-cover max-h-96" alt="" />
                )}

                {post.media_type === 'document' && (
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                                <FileText size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">{post.title || 'Document'}</p>
                                <p className="text-[10px] text-slate-400 font-bold">PDF / 2.4 MB</p>
                            </div>
                        </div>
                        <button className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">Download</button>
                    </div>
                )}
            </div>

            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center gap-6">
                <button
                    onClick={() => onLike(post.id)}
                    className="flex items-center gap-2 text-slate-500 hover:text-rose-500 transition-colors"
                >
                    <Heart size={18} />
                    <span className="text-xs font-bold">{post.likeCount}</span>
                </button>
                <button
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors"
                >
                    <MessageCircle size={18} />
                    <span className="text-xs font-bold">{post.commentCount}</span>
                </button>
                <button className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 transition-colors">
                    <Share2 size={18} />
                </button>
            </div>

            {showComments && (
                <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
                    <div className="space-y-3">
                        {(post.comments || []).map(comment => (
                            <div key={comment.id} className="flex gap-3">
                                <img src={comment.athlete?.photo_url || `https://i.pravatar.cc/150?u=${comment.athlete_id}`} className="w-8 h-8 rounded-full" alt="" />
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex-1">
                                    <p className="text-[10px] font-black text-slate-900 mb-1">{comment.athlete?.name}</p>
                                    <p className="text-xs text-slate-600 font-medium">{comment.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    onComment(post.id, newComment);
                                    setNewComment('');
                                }
                            }}
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-emerald-500"
                        />
                        <button
                            onClick={() => {
                                onComment(post.id, newComment);
                                setNewComment('');
                            }}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
                        >
                            Post
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const ClubSocial = ({ currentMemberId }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPostCreator, setShowPostCreator] = useState(false);
    const [content, setContent] = useState('');

    const loadPosts = async () => {
        try {
            const data = await socialService.getPosts();
            setPosts(data);
        } catch (err) {
            console.error('Failed to load posts:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, []);

    const handleLike = async (postId) => {
        try {
            await socialService.toggleLike(postId, currentMemberId);
            loadPosts(); // Reload to get fresh counts
        } catch (err) {
            console.error('Like failed:', err);
        }
    };

    const handleComment = async (postId, text) => {
        if (!text.trim()) return;
        try {
            await socialService.addComment(postId, currentMemberId, text);
            loadPosts();
        } catch (err) {
            console.error('Comment failed:', err);
        }
    };

    const handleCreatePost = async () => {
        if (!content.trim()) return;
        try {
            await socialService.createPost(content);
            setContent('');
            setShowPostCreator(false);
            loadPosts();
        } catch (err) {
            console.error('Create post failed:', err);
        }
    };

    if (loading) return <div className="p-12 text-center text-xs font-bold text-slate-400">Loading Feed...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                <div className="flex items-center gap-4">
                    <img src={`https://i.pravatar.cc/150?u=${currentMemberId}`} className="w-10 h-10 rounded-full" alt="" />
                    <button
                        onClick={() => setShowPostCreator(true)}
                        className="flex-1 bg-slate-50 text-slate-400 text-sm font-bold h-10 rounded-xl px-4 text-left border border-slate-100 hover:bg-slate-100 transition-colors"
                    >
                        Share an update, photo, or result...
                    </button>
                </div>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-50">
                    <button className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors text-xs font-bold">
                        <ImageIcon size={16} /> Photo
                    </button>
                    <button className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors text-xs font-bold">
                        <FileText size={16} /> Document
                    </button>
                </div>
            </div>

            {showPostCreator && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-black text-slate-900">Create Post</h3>
                            <button onClick={() => setShowPostCreator(false)}><X size={24} className="text-slate-400 hover:text-slate-600" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="What's happening at the club?"
                                className="w-full h-40 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium outline-none focus:border-emerald-500 resize-none"
                            />
                            <div className="flex justify-end">
                                <button
                                    onClick={handleCreatePost}
                                    className="bg-emerald-600 text-white px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-emerald-200"
                                >
                                    Share Post
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {posts.map(post => (
                    <SocialPost
                        key={post.id}
                        post={post}
                        currentMemberId={currentMemberId}
                        onLike={handleLike}
                        onComment={handleComment}
                    />
                ))}
            </div>
        </div>
    );
};

const MemberDashboard = ({ currentView, userRole, athletes = [], coaches = [], onUpdateAthlete }) => {
    const [selectedAthleteProfile, setSelectedAthleteProfile] = useState(null);
    const [filterType, setFilterType] = useState('All');
    const [filterState, setFilterState] = useState('All');
    const [showCoachDropdown, setShowCoachDropdown] = useState(null);
    const [showStateDropdown, setShowStateDropdown] = useState(null);

    const handleAddMember = () => {
        setSelectedAthleteProfile({
            name: '',
            email: '',
            type: 'juniors',
            state: 'Waitlist',
            parent_contacts: [],
            notes: '',
            dob: '',
            ea_id: '',
            isNew: true
        });
    };

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
    if (currentView === 'performances') return <PerformanceHistory userType={userRole} athletes={athletes} coaches={coaches} />;
    if (currentView === 'attendance') return <AttendanceManager userType={userRole} athletes={athletes} coaches={coaches} />;
    if (currentView === 'meets') return <MeetReports />;

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
                    <button
                        onClick={handleAddMember}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-1.5 rounded-xl border border-emerald-500 shadow-sm hover:bg-emerald-700 transition-all font-bold text-xs"
                    >
                        <Plus size={14} /> Add Member
                    </button>
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
                                        <button
                                            onClick={() => setSelectedAthleteProfile(m)}
                                            className="ml-4 text-blue-600 font-bold text-xs uppercase hover:underline"
                                        >
                                            Profile
                                        </button>
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

            {selectedAthleteProfile && (
                <AthleteProfileModal
                    athlete={selectedAthleteProfile}
                    coaches={coaches}
                    onClose={() => setSelectedAthleteProfile(null)}
                    onUpdate={(id, updates) => {
                        onUpdateAthlete(id, updates);
                        setSelectedAthleteProfile(prev => ({ ...prev, ...updates }));
                    }}
                />
            )}
        </div>
    );
};

const AthleteProfileModal = ({ athlete, onClose, onUpdate, coaches }) => {
    const [editData, setEditData] = useState({
        ...athlete,
        parent_contacts: athlete.parent_contacts || [],
        notes: athlete.notes || '',
        dob: athlete.dob || '',
        ea_id: athlete.ea_id || athlete.eaId || ''
    });
    const [saving, setSaving] = useState(false);
    const [tab, setTab] = useState('general'); // 'general', 'contacts', 'fees'
    const [payments, setPayments] = useState([]);

    React.useEffect(() => {
        const loadPayments = async () => {
            if (!athlete.id || athlete.isNew) return;
            try {
                const data = await athleteService.getTrackPayments(athlete.id);
                setPayments(data || []);
            } catch (err) {
                console.error('Failed to load track payments:', err);
            }
        };
        loadPayments();
    }, [athlete.id, athlete.isNew]);

    const handleSave = async () => {
        // Prevent saving mock data
        if (athlete.id && String(athlete.id).startsWith('m') && !athlete.isNew) {
            alert('Notice: Changes to mock members cannot be saved to the database. Please ensure you are connected to Supabase and working with real records.');
            return;
        }

        if (!editData.name || !editData.email) {
            alert('Name and Email are required.');
            return;
        }

        setSaving(true);
        try {
            const data = {
                name: editData.name,
                email: editData.email,
                type: editData.type,
                state: editData.state,
                dob: editData.dob || null,
                ea_id: editData.ea_id || null,
                notes: editData.notes,
                parent_contacts: editData.parent_contacts || [],
                coach_id: editData.coach_id || null
            };

            let savedResult;
            if (athlete.isNew) {
                savedResult = await athleteService.create(data);
                alert('Member created successfully!');
            } else {
                savedResult = await athleteService.update(athlete.id, data);
                alert('Profile updated successfully!');
            }

            onUpdate(savedResult.id, savedResult);
            if (athlete.isNew) onClose();
        } catch (err) {
            console.error('Failed to save athlete:', err);
            alert(`Failed to save: ${err.message || 'Check connection'}`);
        } finally {
            setSaving(false);
        }
    };

    const handleAddContact = () => {
        setEditData({
            ...editData,
            parent_contacts: [...editData.parent_contacts, { name: '', email: '', phone: '', relation: '' }]
        });
    };

    const handleUpdateContact = (idx, field, val) => {
        const newContacts = [...editData.parent_contacts];
        newContacts[idx] = { ...newContacts[idx], [field]: val };
        setEditData({ ...editData, parent_contacts: newContacts });
    };

    const handleRemoveContact = (idx) => {
        const newContacts = editData.parent_contacts.filter((_, i) => i !== idx);
        setEditData({ ...editData, parent_contacts: newContacts });
    };

    const handleTogglePayment = async (month, year) => {
        const existing = payments.find(p => p.month === month && p.year === year);
        const newPaid = existing ? !existing.paid : true;
        try {
            await athleteService.updateTrackPayment(athlete.id, month, year, newPaid);
            const updated = await athleteService.getTrackPayments(athlete.id);
            setPayments(updated);
        } catch (err) {
            console.error('Failed to update payment:', err);
        }
    };

    const months = [
        { id: 1, name: 'Jan' }, { id: 2, name: 'Feb' }, { id: 3, name: 'Mar' },
        { id: 4, name: 'Apr' }, { id: 5, name: 'May' }, { id: 6, name: 'Jun' },
        { id: 7, name: 'Jul' }, { id: 8, name: 'Aug' }, { id: 9, name: 'Sep' },
        { id: 10, name: 'Oct' }, { id: 11, name: 'Nov' }, { id: 12, name: 'Dec' }
    ];
    const currentYear = new Date().getFullYear();

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <img src={athlete.photo_url || athlete.photo || `https://i.pravatar.cc/150?u=${athlete.id}`} className="w-12 h-12 rounded-full border-2 border-emerald-500" alt="" />
                        <div>
                            <h2 className="text-xl font-black tracking-tight">{athlete.isNew ? 'New Member' : athlete.name}</h2>
                            {!athlete.isNew && (
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{athlete.type} · {athlete.state}</p>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex border-b border-slate-100 shrink-0">
                    <button onClick={() => setTab('general')} className={cn("px-6 py-4 text-sm font-bold border-b-2 transition-colors", tab === 'general' ? "border-emerald-500 text-emerald-600" : "border-transparent text-slate-400 hover:text-slate-600")}>General Info</button>
                    {athlete.type === 'juniors' && (
                        <button onClick={() => setTab('contacts')} className={cn("px-6 py-4 text-sm font-bold border-b-2 transition-colors", tab === 'contacts' ? "border-emerald-500 text-emerald-600" : "border-transparent text-slate-400 hover:text-slate-600")}>Parent Contacts</button>
                    )}
                    <button onClick={() => setTab('fees')} className={cn("px-6 py-4 text-sm font-bold border-b-2 transition-colors", tab === 'fees' ? "border-emerald-500 text-emerald-600" : "border-transparent text-slate-400 hover:text-slate-600")}>Track Fees</button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    {tab === 'general' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Full Name</label>
                                    <input type="text" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-emerald-500 transition-colors" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Email Address</label>
                                    <input type="email" value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-emerald-500 transition-colors" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">DOB</label>
                                        <input type="date" value={editData.dob} onChange={e => setEditData({ ...editData, dob: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-emerald-500 transition-colors" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">EA Number</label>
                                        <input type="text" value={editData.ea_id} onChange={e => setEditData({ ...editData, ea_id: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-emerald-500 transition-colors" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Type</label>
                                        <select value={editData.type} onChange={e => setEditData({ ...editData, type: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-emerald-500 transition-colors">
                                            <option value="juniors">Juniors</option>
                                            <option value="seniors">Seniors</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Status</label>
                                        <select value={editData.state} onChange={e => setEditData({ ...editData, state: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-emerald-500 transition-colors">
                                            {(WORKFLOWS[editData.type] || []).map(st => (
                                                <option key={st} value={st}>{st}</option>
                                            ))}
                                            {!WORKFLOWS[editData.type] && <option value="Waitlist">Waitlist</option>}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Assigned Coach</label>
                                    <select value={editData.coach_id} onChange={e => setEditData({ ...editData, coach_id: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-emerald-500 transition-colors">
                                        <option value="">Unassigned</option>
                                        {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1 flex items-center gap-2">
                                        <StickyNote size={12} /> Notes / Medical Information
                                    </label>
                                    <textarea
                                        value={editData.notes}
                                        onChange={e => setEditData({ ...editData, notes: e.target.value })}
                                        rows={8}
                                        placeholder="Add any free-text notes, medical conditions, or special requirements..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-emerald-500 transition-colors resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'contacts' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-slate-900">Parent / Guardian Contacts</h3>
                                <button onClick={handleAddContact} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700">
                                    <Plus size={14} /> Add Contact
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {editData.parent_contacts.map((contact, idx) => (
                                    <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                                        <button onClick={() => handleRemoveContact(idx)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                            <Trash2 size={16} />
                                        </button>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Name</label>
                                                    <input type="text" value={contact.name} onChange={e => handleUpdateContact(idx, 'name', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-emerald-500" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Relation</label>
                                                    <input type="text" value={contact.relation} onChange={e => handleUpdateContact(idx, 'relation', e.target.value)} placeholder="e.g. Mother" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-emerald-500" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Email</label>
                                                <div className="relative">
                                                    <Mail size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input type="email" value={contact.email} onChange={e => handleUpdateContact(idx, 'email', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs font-bold outline-none focus:border-emerald-500" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Phone</label>
                                                <div className="relative">
                                                    <Phone size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input type="tel" value={contact.phone} onChange={e => handleUpdateContact(idx, 'phone', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs font-bold outline-none focus:border-emerald-500" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {editData.parent_contacts.length === 0 && (
                                    <div className="col-span-full py-12 text-center text-slate-400 font-medium italic border-2 border-dashed border-slate-100 rounded-3xl">
                                        No rescue contacts listed. Add parents or guardians for emergency contact.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {tab === 'fees' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-slate-900">Track Fee History ({currentYear})</h3>
                                <div className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Monthly Reconciliation</div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {months.map(m => {
                                    const payment = payments.find(p => p.month === m.id && p.year === currentYear);
                                    const isPaid = payment?.paid;
                                    return (
                                        <button
                                            key={m.id}
                                            onClick={() => handleTogglePayment(m.id, currentYear)}
                                            className={cn(
                                                "p-4 rounded-2xl border-2 transition-all text-center",
                                                isPaid
                                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                                    : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                                            )}
                                        >
                                            <div className="text-[10px] font-black uppercase tracking-widest mb-1">{m.name}</div>
                                            <div className="flex justify-center">
                                                {isPaid ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                                            </div>
                                            <div className="text-[9px] font-bold mt-2 uppercase">{isPaid ? 'Paid' : 'Due'}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                    <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-emerald-600 text-white px-8 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? 'Saving...' : <><Save size={18} /> Save Profile</>}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const PublicHero = ({ onEnterPortal }) => (
    <div className="relative h-[85vh] w-full overflow-hidden">
        <img
            src="https://images.unsplash.com/photo-1530541930197-ff16ac911884?q=80&w=2070&auto=format&fit=crop"
            className="absolute inset-0 w-full h-full object-cover"
            alt="HAC Athletes"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/90 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-center">
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="max-w-2xl text-white"
            >
                <h1 className="text-7xl font-black tracking-tighter mb-4 leading-none">
                    HILLINGDON <br />
                    <span className="text-white/80">ATHLETIC CLUB</span>
                </h1>
                <p className="text-xl font-medium mb-8 text-white/90 leading-relaxed shadow-sm">
                    TRAIN. COMPETE. SUCCEED. Join London's most inclusive athletics community with roots tracing back to 1877.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={() => onNavigate('register')}
                        className="bg-white text-red-600 px-8 py-4 rounded-xl font-black uppercase tracking-wider shadow-xl hover:scale-105 transition-transform"
                    >
                        Join Our Club
                    </button>
                    <button
                        onClick={onEnterPortal}
                        className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-black uppercase tracking-wider hover:bg-white/10 transition-colors"
                    >
                        Member Login
                    </button>
                </div>
            </motion.div>
        </div>
    </div>
);

const TrainingSchedule = () => {
    const [group, setGroup] = useState('Adults');
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                // For demo, if DB is empty we use mock
                const data = await websiteService.getTrainingSessions(group);
                setSessions(data.length > 0 ? data : [
                    { day: 'Mon', session_type: 'Intervals', time: '18:30-20:00', venue: 'Ruislip' },
                    { day: 'Wed', session_type: 'Track', time: '18:30-20:00', venue: 'Uxbridge' }
                ]);
            } catch (err) {
                setSessions([]);
            }
        };
        load();
    }, [group]);

    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-2">TRAINING SCHEDULES</h2>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Join us for a session</p>
                    </div>
                    <div className="flex bg-slate-100 p-1.5 rounded-xl">
                        {['Adults', 'Juniors'].map(t => (
                            <button
                                key={t}
                                onClick={() => setGroup(t)}
                                className={cn(
                                    "px-6 py-2 rounded-lg font-black text-xs uppercase tracking-widest transition-all",
                                    group === t ? "bg-red-600 text-white shadow-lg" : "text-slate-500"
                                )}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Day</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Session Type</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Time</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Venue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {sessions.map((s, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-900">{s.day}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">{s.session_type}</span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 font-medium">{s.time}</td>
                                    <td className="px-6 py-4 text-slate-900 font-bold">{s.venue}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};

const PublicNewsGrid = () => (
    <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-12 uppercase italic">Latest Race Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { title: "Middlesex Track Champs Success", date: "Feb 2026", img: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2070" },
                    { title: "Summer 10K Series - Race 2", date: "Jan 2026", img: "https://images.unsplash.com/photo-1452626012306-97297611f0f6?q=80&w=2072" },
                    { title: "Junior National Championships", date: "Dec 2025", img: "https://images.unsplash.com/photo-1461896704690-4f488e79154b?q=80&w=2070" }
                ].map((news, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -10 }}
                        className="group cursor-pointer"
                    >
                        <div className="relative h-64 rounded-3xl overflow-hidden mb-6 shadow-lg">
                            <img src={news.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                            <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{idx + 1}</div>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-red-600 transition-colors uppercase">{news.title}</h3>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{news.date}</span>
                            <span className="text-xs font-black text-red-600 uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">Read More <ChevronRight size={14} /></span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
);

const FixturesList = () => {
    const [fixtures, setFixtures] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await websiteService.getFixtures();
                setFixtures(data.length > 0 ? data : [
                    { name: 'Middlesex County Champs', date: '2026-05-15', location: 'Lee Valley', category: 'Track & Field' },
                    { name: 'London 10K', date: '2026-07-10', location: 'Central London', category: 'Road' }
                ]);
            } catch (err) {
                setFixtures([]);
            }
        };
        load();
    }, []);

    return (
        <section className="py-24 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-5xl font-black mb-12 tracking-tighter italic text-slate-900">UPCOMING FIXTURES</h2>
                <div className="grid grid-cols-1 gap-4">
                    {fixtures.map((f, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-red-600 transition-colors group">
                            <div className="flex items-center gap-6">
                                <div className="text-center min-w-[80px]">
                                    <p className="text-2xl font-black text-red-600 leading-none">{new Date(f.date).getDate()}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{new Date(f.date).toLocaleString('default', { month: 'short' })}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{f.name}</h3>
                                    <p className="text-sm text-slate-500 font-medium">{f.location}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                                    {f.category}
                                </span>
                                <button className="p-2 rounded-full border border-slate-200 text-slate-400 group-hover:text-red-600 group-hover:border-red-600 transition-all">
                                    <ExternalLink size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const PublicHome = ({ onEnterPortal, onNavigate }) => (
    <div className="bg-slate-50 min-h-screen pt-20">
        <PublicHero onEnterPortal={onEnterPortal} />
        <TrainingSchedule />
        <PublicNewsGrid />
        <section className="py-24 bg-red-600 text-white">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <h2 className="text-5xl font-black mb-8 tracking-tighter italic">READY TO JOIN THE TEAM?</h2>
                <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto font-medium">
                    Experience London's premier athletics club. We offer a 4-week free trial for all new members - come run with us!
                </p>
                <div className="flex justify-center gap-6">
                    <button
                        onClick={() => onNavigate('register')}
                        className="bg-white text-red-600 px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-red-900/40 hover:scale-105 transition-transform"
                    >
                        Start Your Trial
                    </button>
                    <button
                        onClick={() => onNavigate('fixtures')}
                        className="bg-transparent border-2 border-white px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-colors"
                    >
                        View Fixtures
                    </button>
                </div>
            </div>
        </section>
        <footer className="bg-slate-950 py-20 text-white">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
                <div className="col-span-1 md:col-span-2">
                    <h2 className="text-3xl font-black tracking-tighter mb-6 uppercase italic">HILLINGDON<span className="text-red-600">AC</span></h2>
                    <p className="text-slate-400 font-medium leading-relaxed max-w-sm">
                        Providing track, field, road and cross-country competition for all ages and abilities since 1877. Inclusive, welcoming, and historic.
                    </p>
                </div>
                <div>
                    <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-red-500">Navigation</h4>
                    <ul className="space-y-4 text-sm font-bold text-slate-300">
                        <li className="hover:text-white cursor-pointer transition-colors" onClick={() => onNavigate('home')}>Home</li>
                        <li className="hover:text-white cursor-pointer transition-colors" onClick={() => onNavigate('training')}>Training Schedules</li>
                        <li className="hover:text-white cursor-pointer transition-colors" onClick={() => onNavigate('fixtures')}>Club Fixtures</li>
                        <li className="hover:text-white cursor-pointer transition-colors">Records</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-red-500">Contact</h4>
                    <p className="text-sm font-bold text-slate-300">Hillingdon Athletics Club</p>
                    <p className="text-sm text-slate-500 font-medium">Uxbridge & Ruislip, London</p>
                </div>
            </div>
        </footer>
    </div>
);

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = await authService.signIn(email, password);
            onLogin(data);
        } catch (err) {
            setError(err.message || 'Invalid login credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px] animate-pulse delay-75" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="inline-block p-4 bg-emerald-500/10 rounded-2xl mb-4">
                        <ShieldCheck size={40} className="text-emerald-400" />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight uppercase italic mb-2">HAC<span className="text-emerald-500">Portal</span></h1>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Secure Access Control</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Club Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@example.com"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white font-medium outline-none focus:border-emerald-500 transition-colors"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Secret Code</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white font-medium outline-none focus:border-emerald-500 transition-colors"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center">
                            {error}
                        </div>
                    )}

                    <button
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl text-sm uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/40 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Authenticating...' : 'Enter Portal'}
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-white/5 text-center">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                        Authorized Hillingdon Athletic Club<br />Personnel & Members Only
                    </p>
                </div>
            </motion.div>
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

const UserProfile = ({ userType, onManagePayments, athletes = [], coaches = [], currentView }) => {
    const athlete = athletes[0] || {};
    const steps = athlete.type === 'seniors' ? WORKFLOWS.seniors : WORKFLOWS.juniors;
    // Sync current step with the actual athlete state
    const currentStepIndex = steps.indexOf(athlete.state) !== -1 ? steps.indexOf(athlete.state) : 0;

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Membership Progress</h3>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded uppercase tracking-widest">{athlete.state}</span>
                </div>
                <WorkflowStepper steps={steps} currentStep={currentStepIndex} />

                {userType === 'management' && (
                    <div className="flex justify-end gap-2 mt-4">
                        <button className="text-sm font-bold text-slate-400">Force Update</button>
                        <button className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold">Advance State</button>
                    </div>
                )}
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

                {currentView === 'dashboard' && (
                    <div className="mt-8">
                        <MeetRegistration athleteId={athletes[0]?.id} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default function MembershipPortal() {
    const [viewMode, setViewMode] = useState('public'); // 'public' or 'portal'
    const [publicView, setPublicView] = useState('home'); // 'home', 'training', 'fixtures'
    const [session, setSession] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [currentView, setCurrentView] = useState('dashboard');
    const [showPaymentSetup, setShowPaymentSetup] = useState(false);
    const [dbStatus, setDbStatus] = useState({ checked: false, connected: false, error: null });
    const [athletes, setAthletes] = useState([]);
    const [coaches, setCoaches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAnalyticsDropdown, setShowAnalyticsDropdown] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            // For Demo: Auto-login if we want a total bypass
            // setSession({ user: { email: 'admin@hac.com' } });
            // setUserRole('management');

            try {
                const activeSession = await authService.getSession();
                if (activeSession) {
                    setSession(activeSession);
                    // In real app, user role would come from app_metadata or profiles table
                    // Mocking based on email for the demo
                    const email = activeSession.user.email;
                    setUserRole(email.includes('admin') ? 'management' : 'juniors');
                }
            } catch (err) {
                console.error('Auth check failed:', err);
            }
        };
        checkAuth();
    }, []);

    const fetchData = async () => {
        const isDemo = session?.user?.email?.includes('@hac.com');
        setLoading(true);

        try {
            let athleteData = null;
            let coachData = null;

            if (!isDemo) {
                if (userRole === 'management') {
                    athleteData = await athleteService.getAll();
                } else {
                    const all = await athleteService.getAll();
                    athleteData = all.filter(a => a.email === session.user.email);
                }
                coachData = await coachService.getAll();
            }

            const finalCoaches = coachData && coachData.length > 0 ? coachData : MOCK_COACHES;
            setCoaches(finalCoaches);

            if (athleteData && athleteData.length > 0) {
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
            console.warn('Fetch failed, using mock data:', err);
            setAthletes(MOCK_MEMBERS.map(m => ({ ...m, trackFeesPaid: m.paid })));
            setCoaches(MOCK_COACHES);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const verifyConnection = async () => {
            const isDemo = session?.user?.email?.includes('@hac.com');

            if (isDemo) {
                setDbStatus({ checked: true, connected: true, error: null });
                await fetchData();
                return;
            }

            const status = await checkConnection();
            setDbStatus({ checked: true, ...status });

            if (session) {
                await fetchData();
            } else {
                setLoading(false);
            }
        };
        verifyConnection();
    }, [session, userRole]);

    const handleUpdateAthleteLocal = (id, updates) => {
        setAthletes(prev => {
            const exists = prev.some(a => String(a.id) === String(id));
            if (exists) {
                return prev.map(a => String(a.id) === String(id) ? { ...a, ...updates } : a);
            } else {
                return [...prev, { id, ...updates }];
            }
        });
    };

    const handleLogout = async () => {
        await authService.signOut();
        setSession(null);
        setUserRole(null);
        setViewMode('public');
    };

    const handleBackToWebsite = () => {
        setViewMode('public');
        setPublicView('home');
    };

    if (viewMode === 'public') {
        return (
            <div>
                <nav className="fixed top-0 w-full z-[100] bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
                    <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-black tracking-tighter uppercase italic text-slate-900 leading-none">HILLINGDON<span className="text-red-600">AC</span></h1>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <button
                                onClick={() => setPublicView('home')}
                                className={cn("text-sm font-black uppercase tracking-widest transition-colors", publicView === 'home' ? "text-red-600" : "text-slate-500 hover:text-red-600")}
                            >
                                Home
                            </button>
                            <button
                                onClick={() => setPublicView('training')}
                                className={cn("text-sm font-black uppercase tracking-widest transition-colors", publicView === 'training' ? "text-red-600" : "text-slate-500 hover:text-red-600")}
                            >
                                Training
                            </button>
                            <button
                                onClick={() => setPublicView('fixtures')}
                                className={cn("text-sm font-black uppercase tracking-widest transition-colors", publicView === 'fixtures' ? "text-red-600" : "text-slate-500 hover:text-red-600")}
                            >
                                Fixtures
                            </button>
                            {session && (
                                <button
                                    onClick={() => setViewMode('portal')}
                                    className="bg-red-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-900/20 transition-all"
                                >
                                    Go to Dashboard
                                </button>
                            )}
                        </div>
                    </div>
                </nav>

                {publicView === 'home' && <PublicHome onEnterPortal={() => {
                    // AUTOMATED BYPASS: Set admin session immediately
                    const mockSession = { user: { email: 'admin@hac.com' } };
                    setSession(mockSession);
                    setUserRole('management');
                    setPublicView('portal');
                }} onNavigate={setPublicView} />}
                {publicView === 'training' && <div className="pt-20"><TrainingSchedule /></div>}
                {publicView === 'fixtures' && <div className="pt-20"><FixturesList /></div>}
                {publicView === 'register' && <div className="pt-20"><MembershipForm /></div>}
                {publicView === 'portal' && (
                    <div className="pt-20">
                        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-12 text-center">
                            <div className="max-w-md w-full space-y-8">
                                <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-slate-100">
                                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <ShieldCheck size={40} className="text-emerald-500" />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 mb-2">Welcome, Administrator!</h2>
                                    <p className="text-slate-500 font-medium mb-8">Demo Mode: Fully Authenticated.</p>
                                    <button
                                        onClick={() => setViewMode('portal')}
                                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all active:scale-95"
                                    >
                                        Open Member Dashboard
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="mt-6 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-red-600 transition-colors"
                                    >
                                        Reset Session
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {publicView !== 'home' && (
                    <footer className="bg-slate-950 py-12 text-white border-t border-white/5">
                        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-left">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">© 2026 Hillingdon Athletic Club</p>
                            <div className="flex gap-6">
                                <button onClick={() => setPublicView('home')} className="text-slate-400 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">Home</button>
                                <button onClick={() => setViewMode('portal')} className="text-slate-400 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">Portal</button>
                            </div>
                        </div>
                    </footer>
                )}
            </div>
        );
    }

    if (!session) {
        return <Login onLogin={(data) => {
            setSession(data.session);
            const email = data.session.user.email;
            setUserRole(email.includes('admin') ? 'management' : 'juniors');
            setViewMode('portal');
        }} />;
    }

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
                            <button onClick={() => setCurrentView('community')} className={cn("px-3 py-1.5 rounded text-sm font-bold", currentView === 'community' ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400 hover:text-white")}>Community</button>
                            <button onClick={() => setCurrentView('news')} className={cn("px-3 py-1.5 rounded text-sm font-bold", currentView === 'news' ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400 hover:text-white")}>News</button>
                            <button onClick={() => setCurrentView('training')} className={cn("px-3 py-1.5 rounded text-sm font-bold", currentView === 'training' ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400 hover:text-white")}>Training</button>
                            {userRole === 'management' && (
                                <>
                                    <button onClick={() => setCurrentView('attendance')} className={cn("px-3 py-1.5 rounded text-sm font-bold", currentView === 'attendance' ? "bg-blue-500/20 text-blue-400" : "text-slate-400 hover:text-white")}>Attendance</button>
                                    <button onClick={() => setCurrentView('community')} className={cn("px-3 py-1.5 rounded text-sm font-bold", currentView === 'community' ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400 hover:text-white")}>Community</button>
                                    <button onClick={() => setCurrentView('meets')} className={cn("px-3 py-1.5 rounded text-sm font-bold", currentView === 'meets' ? "bg-amber-500/20 text-amber-400" : "text-slate-400 hover:text-white")}>Meet Reports</button>
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
                        <div className="text-[10px] font-bold uppercase p-1.5 bg-slate-800 rounded border border-slate-700 tracking-widest">{userRole} View</div>
                        <button
                            onClick={handleBackToWebsite}
                            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                        >
                            <Home size={14} /> Website
                        </button>
                        <button onClick={handleLogout} className="p-1.5 hover:bg-white/10 rounded transition-colors text-slate-400 hover:text-white">
                            <X size={16} />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {loading ? (
                    <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing with Club Database...</div>
                ) : userRole === 'management' ? (
                    <MemberDashboard currentView={currentView} userRole={userRole} athletes={athletes} coaches={coaches} onUpdateAthlete={handleUpdateAthleteLocal} />
                ) : (
                    currentView === 'dashboard' ? <UserProfile userType={userRole} onManagePayments={() => setShowPaymentSetup(true)} athletes={athletes} coaches={coaches} currentView={currentView} /> :
                        currentView === 'community' ? <ClubSocial currentMemberId={athletes[0]?.id} /> :
                            currentView === 'news' ? <ClubNewsSection /> :
                                <TrainingManager />
                )}
            </main>
        </div>
    );
}
