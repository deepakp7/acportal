import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Clock,
    Award,
    Target,
    Zap,
    Users,
    ArrowLeft,
    CheckCircle2,
    Shield,
    Sparkles,
    Info,
    ChevronRight,
    Scale,
    Activity,
    UserCheck,
    Send,
    HelpCircle,
    UserPlus,
    Flame,
    Building2,
    Plus,
    Trash2,
    Download,
    FileSpreadsheet,
    Calculator,
    Layers
} from 'lucide-react';

const AGE_CATEGORIES = [
    { id: 'u13g', label: 'Under 13 Girls (Ages 11–12)', group: 'Junior', spec: { shot: '2.72 kg', discus: '0.75 kg', jav: '400 g', hammer: '—' } },
    { id: 'u13b', label: 'Under 13 Boys (Ages 11–12)', group: 'Junior', spec: { shot: '3.00 kg', discus: '1.00 kg', jav: '400 g', hammer: '—' } },
    { id: 'u15g', label: 'Under 15 Girls (Ages 13–14)', group: 'Youth', spec: { shot: '3.00 kg', discus: '1.00 kg', jav: '500 g', hammer: '3.00 kg' } },
    { id: 'u15b', label: 'Under 15 Boys (Ages 13–14)', group: 'Youth', spec: { shot: '4.00 kg', discus: '1.25 kg', jav: '600 g', hammer: '4.00 kg' } },
    { id: 'u17w', label: 'Under 17 Women (Ages 15–16)', group: 'Junior', spec: { shot: '3.00 kg', discus: '1.00 kg', jav: '500 g', hammer: '3.00 kg' } },
    { id: 'u17m', label: 'Under 17 Men (Ages 15–16)', group: 'Junior', spec: { shot: '5.00 kg', discus: '1.50 kg', jav: '700 g', hammer: '5.00 kg' } },
    { id: 'u20w', label: 'Under 20 Women (Ages 17–19)', group: 'Junior', spec: { shot: '4.00 kg', discus: '1.00 kg', jav: '600 g', hammer: '4.00 kg' } },
    { id: 'u20m', label: 'Under 20 Men (Ages 17–19)', group: 'Junior', spec: { shot: '6.00 kg', discus: '1.75 kg', jav: '800 g', hammer: '6.00 kg' } },
    { id: 'senw', label: 'Senior Women (20–34)', group: 'Senior', spec: { shot: '4.00 kg', discus: '1.00 kg', jav: '600 g', hammer: '4.00 kg' } },
    { id: 'senm', label: 'Senior Men (20–34)', group: 'Senior', spec: { shot: '7.26 kg', discus: '2.00 kg', jav: '800 g', hammer: '7.26 kg' } },
    { id: 'v35w', label: 'Masters Women 35–49', group: 'Masters', spec: { shot: '4.00 kg', discus: '1.00 kg', jav: '600 g', hammer: '4.00 kg', weight: '9.08 kg' } },
    { id: 'v35m', label: 'Masters Men 35–49', group: 'Masters', spec: { shot: '7.26 kg', discus: '2.00 kg', jav: '800 g', hammer: '7.26 kg', weight: '15.88 kg' } },
    { id: 'v50w', label: 'Masters Women 50–59', group: 'Masters', spec: { shot: '3.00 kg', discus: '1.00 kg', jav: '500 g', hammer: '3.00 kg', weight: '7.26 kg' } },
    { id: 'v50m', label: 'Masters Men 50–59', group: 'Masters', spec: { shot: '6.00 kg', discus: '1.50 kg', jav: '700 g', hammer: '6.00 kg', weight: '11.34 kg' } },
    { id: 'v60w', label: 'Masters Women 60–74', group: 'Masters', spec: { shot: '3.00 kg', discus: '1.00 kg', jav: '400 g', hammer: '3.00 kg', weight: '5.45 kg' } },
    { id: 'v60m', label: 'Masters Men 60–69', group: 'Masters', spec: { shot: '5.00 kg', discus: '1.00 kg', jav: '600 g', hammer: '5.00 kg', weight: '9.08 kg' } },
    { id: 'v70m', label: 'Masters Men 70+', group: 'Masters', spec: { shot: '4.00 kg', discus: '1.00 kg', jav: '500 g', hammer: '4.00 kg', weight: '7.26 kg' } },
    { id: 'v80', label: 'Masters 80+ (Men/Women)', group: 'Masters', spec: { shot: '3.00 kg / 2.00 kg', discus: '1.00 kg / 0.75 kg', jav: '400 g', hammer: '3.00 kg / 2.00 kg', weight: '5.45 kg / 4.00 kg' } }
];

const AVAILABLE_EVENTS = [
    { id: 'shot', name: 'Shot Put', icon: '⚪', note: 'Classic circle event measuring explosive kinetic chain release.', minAge: 11, maxAge: 99 },
    { id: 'discus', name: 'Discus Throw', icon: '🥏', note: 'Graceful rotational mechanics and aerodynamic release.', minAge: 11, maxAge: 99 },
    { id: 'javelin', name: 'Javelin Throw', icon: '🗡️', note: 'Linear approach with maximum overhand whip.', minAge: 11, maxAge: 99 },
    { id: 'hammer', name: 'Hammer Throw', icon: '⛓️', note: 'High centrifugal rotational power inside safety cage (U15+).', minAge: 13, maxAge: 99 },
    { id: 'weight', name: 'Masters Heavy Weight Throw', icon: '🏋️', note: 'Premier strength showcase for Masters V35+ athletes.', minAge: 35, maxAge: 99 }
];

const calculateIndividualFee = (category, eventCount) => {
    if (eventCount === 0) return 0;
    const isJunior = category.startsWith('u');
    if (isJunior) {
        return 7 + (eventCount - 1) * 4;
    }
    return 9 + (eventCount - 1) * 5;
};

const HacLiGoThrows = ({ onClose, onJoinClub }) => {
    const [activeTab, setActiveTab] = useState('entry'); // 'entry', 'group_entry', 'philosophy', 'matrix', 'schedule'

    // Individual Form State
    const [formData, setFormData] = useState({
        athleteName: '',
        dob: '',
        gender: 'Male',
        category: 'u15b',
        email: '',
        phone: '',
        emergencyContact: '',
        isAffiliated: false,
        clubName: '',
        eaUrn: '',
        wantsMembership: true,
        selectedEvents: {
            shot: true
        },
        eventDistances: {
            shot: ''
        },
        firstTimeBaseDistance: {
            shot: true
        },
        ownImplement: false,
        guardianName: '',
        guardianPhone: '',
        parentConsent: false,
        photoConsent: true
    });

    const [submittedData, setSubmittedData] = useState(null);

    // Group Entry State (For Visiting & Local Clubs)
    const [clubInfo, setClubInfo] = useState({
        clubName: 'Hillingdon AC',
        coordinatorName: '',
        coordinatorEmail: '',
        coordinatorPhone: '',
        paymentMethod: 'bacs' // 'bacs', 'card', 'desk'
    });

    const [groupRoster, setGroupRoster] = useState([
        {
            id: 1,
            athleteName: 'Oliver Thompson',
            category: 'u15b',
            gender: 'Male',
            eaUrn: 'URN-48912',
            events: { shot: true, discus: true },
            distances: { shot: '11.45', discus: '28.20' },
            isBaseDistance: { shot: false, discus: false }
        },
        {
            id: 2,
            athleteName: 'Maya Sharma',
            category: 'u13g',
            gender: 'Female',
            eaUrn: 'URN-52918',
            events: { shot: true, javelin: true },
            distances: { shot: '8.40', javelin: '18.50' },
            isBaseDistance: { shot: false, javelin: false }
        },
        {
            id: 3,
            athleteName: 'David Miller',
            category: 'v50m',
            gender: 'Male',
            eaUrn: 'URN-10294',
            events: { shot: true, javelin: true },
            distances: { shot: '12.80', javelin: '34.50' },
            isBaseDistance: { shot: false, javelin: false }
        }
    ]);

    const [groupSubmittedData, setGroupSubmittedData] = useState(null);

    const activeCatSpec = AGE_CATEGORIES.find(c => c.id === formData.category) || AGE_CATEGORIES[0];
    const isUnder18 = formData.category.startsWith('u13') || formData.category.startsWith('u15') || formData.category.startsWith('u17');

    // Individual Fees Calculation
    const selectedEventKeys = Object.keys(formData.selectedEvents).filter(k => formData.selectedEvents[k]);
    const individualFee = calculateIndividualFee(formData.category, selectedEventKeys.length);

    // Group Consolidated Calculation
    const groupStats = groupRoster.reduce((acc, athlete) => {
        const eventsChosen = Object.keys(athlete.events || {}).filter(k => athlete.events[k]);
        const athleteFee = calculateIndividualFee(athlete.category, eventsChosen.length);
        
        let athleteDistancesCount = 0;
        let baseDistanceCount = 0;

        eventsChosen.forEach(evt => {
            const dist = athlete.distances?.[evt];
            const isBase = athlete.isBaseDistance?.[evt];
            if (isBase || !dist) {
                baseDistanceCount++;
            } else {
                athleteDistancesCount++;
            }
        });

        return {
            totalAthletes: acc.totalAthletes + 1,
            totalEntries: acc.totalEntries + eventsChosen.length,
            totalFee: acc.totalFee + athleteFee,
            distanceSeededCount: acc.distanceSeededCount + athleteDistancesCount,
            baseDistanceCount: acc.baseDistanceCount + baseDistanceCount
        };
    }, { totalAthletes: 0, totalEntries: 0, totalFee: 0, distanceSeededCount: 0, baseDistanceCount: 0 });

    const toggleEvent = (eventId) => {
        setFormData(prev => {
            const nextEvents = { ...prev.selectedEvents, [eventId]: !prev.selectedEvents[eventId] };
            const nextDistances = { ...prev.eventDistances };
            const nextFirstTime = { ...prev.firstTimeBaseDistance };

            if (!nextEvents[eventId]) {
                delete nextDistances[eventId];
                delete nextFirstTime[eventId];
            } else {
                nextDistances[eventId] = nextDistances[eventId] || '';
                nextFirstTime[eventId] = true;
            }

            return {
                ...prev,
                selectedEvents: nextEvents,
                eventDistances: nextDistances,
                firstTimeBaseDistance: nextFirstTime
            };
        });
    };

    const handleCategoryChange = (catId) => {
        setFormData(prev => ({
            ...prev,
            category: catId
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const refNumber = `LIGO-27-${Math.floor(1000 + Math.random() * 9000)}`;
        setSubmittedData({
            ...formData,
            refNumber,
            totalFee: individualFee,
            categoryLabel: activeCatSpec.label,
            selectedEventList: selectedEventKeys
        });
    };

    // Group Entry Management
    const addRosterAthlete = () => {
        const newId = Date.now();
        setGroupRoster(prev => [
            ...prev,
            {
                id: newId,
                athleteName: '',
                category: 'u15b',
                gender: 'Male',
                eaUrn: '',
                events: { shot: true },
                distances: { shot: '' },
                isBaseDistance: { shot: true }
            }
        ]);
    };

    const removeRosterAthlete = (id) => {
        setGroupRoster(prev => prev.filter(a => a.id !== id));
    };

    const updateRosterAthlete = (id, field, value) => {
        setGroupRoster(prev => prev.map(a => {
            if (a.id !== id) return a;
            return { ...a, [field]: value };
        }));
    };

    const toggleRosterEvent = (athleteId, eventId) => {
        setGroupRoster(prev => prev.map(a => {
            if (a.id !== athleteId) return a;
            const currentVal = !!a.events?.[eventId];
            const updatedEvents = { ...a.events, [eventId]: !currentVal };
            const updatedDistances = { ...a.distances };
            const updatedBase = { ...a.isBaseDistance };

            if (currentVal) {
                delete updatedDistances[eventId];
                delete updatedBase[eventId];
            } else {
                updatedDistances[eventId] = '';
                updatedBase[eventId] = true;
            }

            return {
                ...a,
                events: updatedEvents,
                distances: updatedDistances,
                isBaseDistance: updatedBase
            };
        }));
    };

    const updateRosterDistance = (athleteId, eventId, distanceValue) => {
        setGroupRoster(prev => prev.map(a => {
            if (a.id !== athleteId) return a;
            return {
                ...a,
                distances: { ...a.distances, [eventId]: distanceValue },
                isBaseDistance: { ...a.isBaseDistance, [eventId]: !distanceValue }
            };
        }));
    };

    const toggleRosterBaseDistance = (athleteId, eventId, isBase) => {
        setGroupRoster(prev => prev.map(a => {
            if (a.id !== athleteId) return a;
            return {
                ...a,
                isBaseDistance: { ...a.isBaseDistance, [eventId]: isBase }
            };
        }));
    };

    const handleGroupSubmit = (e) => {
        e.preventDefault();
        const clubRef = `LIGO-CLUB-${clubInfo.clubName.replace(/\s+/g, '').slice(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
        setGroupSubmittedData({
            ...clubInfo,
            clubRef,
            stats: groupStats,
            roster: groupRoster
        });
    };

    const exportGroupCSV = () => {
        let csv = 'Athlete Name,Category,Gender,EA URN,Event,Seed Distance (m),Need Base Distance,Athlete Event Fee\n';
        groupRoster.forEach(a => {
            const evts = Object.keys(a.events || {}).filter(k => a.events[k]);
            const fee = calculateIndividualFee(a.category, evts.length);
            evts.forEach(evt => {
                const dist = a.distances?.[evt] || 'N/A';
                const isBase = a.isBaseDistance?.[evt] ? 'Yes' : 'No';
                csv += `"${a.athleteName}","${a.category}","${a.gender}","${a.eaUrn || 'Unaffiliated'}","${evt}","${dist}","${isBase}","£${fee}"\n`;
            });
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${clubInfo.clubName || 'Club'}_HAC_LiGo_Entries.csv`;
        link.click();
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 selection:bg-amber-500 selection:text-black">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl transition-colors flex items-center gap-2 text-sm font-semibold cursor-pointer"
                        >
                            <ArrowLeft size={18} /> Hub
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-black text-black text-xl shadow-lg shadow-amber-500/20">
                                🚀
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl font-black tracking-tight text-white uppercase italic">
                                        HAC <span className="text-amber-400">LiGo</span> 2027
                                    </h1>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                        "Let It Go"
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400">Midsummer Throws Open & Base Distance Festival (Under 12+ to Masters)</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
                            <Calendar size={14} className="text-amber-400" />
                            <span className="font-semibold text-white">Thursday, 17 June 2027</span>
                        </div>
                        {onJoinClub && (
                            <button
                                onClick={onJoinClub}
                                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                            >
                                <UserPlus size={14} /> Join HAC
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Banner */}
            <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border-b border-white/5 py-12 px-6">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-24 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]"></div>
                    <div className="absolute -bottom-24 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px]"></div>
                </div>

                <div className="max-w-6xl mx-auto relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">
                        <Flame size={14} /> Annual Flagship Throws Meeting
                    </div>

                    <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-4 leading-tight">
                        Release Your Power. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-200 italic">
                            Measure Your Base Distance.
                        </span>
                    </h2>

                    <p className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto mb-8 font-normal leading-relaxed">
                        Inspired by the inclusivity of <span className="text-amber-400 font-semibold">Parkrun</span>, <strong>HAC LiGo</strong> is North West London's premier community & competitive throws meet. From Under-13 youth competitors to veteran masters, every athlete sets their benchmark in a supportive, high-energy environment.
                    </p>

                    {/* Quick Stat Highlights */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <Calendar className="text-amber-400 mx-auto mb-1" size={20} />
                            <div className="text-sm font-black text-white">Thursday 17 June</div>
                            <div className="text-xs text-slate-400">Sunset at 21:22 BST</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <Target className="text-emerald-400 mx-auto mb-1" size={20} />
                            <div className="text-sm font-black text-white">5 Field Events</div>
                            <div className="text-xs text-slate-400">Shot, Discus, Jav, Hammer, Weight</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <Sparkles className="text-orange-400 mx-auto mb-1" size={20} />
                            <div className="text-sm font-black text-white">Under 12+ to Masters</div>
                            <div className="text-xs text-slate-400">UKA U13 to V80+</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <Building2 className="text-indigo-400 mx-auto mb-1" size={20} />
                            <div className="text-sm font-black text-white">Club Group Entries</div>
                            <div className="text-xs text-slate-400">Consolidated Billing & Seeding</div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl max-w-2xl mx-auto">
                        <button
                            onClick={() => setActiveTab('entry')}
                            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                activeTab === 'entry' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Send size={15} /> Individual Entry
                        </button>
                        <button
                            onClick={() => setActiveTab('group_entry')}
                            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                activeTab === 'group_entry' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Building2 size={15} /> Club Group Entry
                            {groupRoster.length > 0 && (
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                                    activeTab === 'group_entry' ? 'bg-black text-amber-400' : 'bg-amber-500/20 text-amber-300'
                                }`}>
                                    {groupRoster.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('philosophy')}
                            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                activeTab === 'philosophy' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Sparkles size={15} /> The LiGo Ethos
                        </button>
                        <button
                            onClick={() => setActiveTab('matrix')}
                            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                activeTab === 'matrix' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Scale size={15} /> Implement Matrix
                        </button>
                        <button
                            onClick={() => setActiveTab('schedule')}
                            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                activeTab === 'schedule' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Clock size={15} /> Timetable
                        </button>
                    </div>
                </div>
            </section>

            {/* Main Content Area */}
            <main className="max-w-6xl mx-auto px-6 py-10">
                <AnimatePresence mode="wait">
                    {/* TAB 1: INDIVIDUAL ENTRY FORM */}
                    {activeTab === 'entry' && (
                        <motion.div
                            key="entry"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.2 }}
                        >
                            {submittedData ? (
                                <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-8 max-w-2xl mx-auto text-center shadow-2xl relative overflow-hidden">
                                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mx-auto mb-4 border border-emerald-500/40">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase rounded-full border border-emerald-500/20">
                                        Entry Confirmed
                                    </span>
                                    <h3 className="text-2xl font-black text-white mt-3 mb-1">
                                        You're In for HAC LiGo 2027!
                                    </h3>
                                    <p className="text-slate-400 text-sm mb-6">
                                        Confirmation reference: <strong className="text-white font-mono">{submittedData.refNumber}</strong>
                                    </p>

                                    <div className="bg-slate-950/60 rounded-2xl p-5 border border-white/5 text-left mb-6 space-y-2 text-sm">
                                        <div className="flex justify-between border-b border-white/5 pb-2">
                                            <span className="text-slate-400">Athlete:</span>
                                            <span className="font-semibold text-white">{submittedData.athleteName}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-white/5 pb-2">
                                            <span className="text-slate-400">Category:</span>
                                            <span className="font-semibold text-amber-400">{submittedData.categoryLabel}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-white/5 pb-2">
                                            <span className="text-slate-400">Events Registered:</span>
                                            <span className="font-semibold text-white uppercase">{submittedData.selectedEventList.join(', ')}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-white/5 pb-2">
                                            <span className="text-slate-400">Affiliation Status:</span>
                                            <span className="font-semibold text-emerald-400">
                                                {submittedData.isAffiliated ? `${submittedData.clubName} (URN: ${submittedData.eaUrn})` : 'Unaffiliated / Beginner'}
                                            </span>
                                        </div>
                                        {submittedData.wantsMembership && (
                                            <div className="flex justify-between pt-1 text-xs text-amber-300">
                                                <span>HAC Membership Request:</span>
                                                <span>✓ Welcome pack will be emailed</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between pt-2 border-t border-white/10 text-base font-bold">
                                            <span className="text-slate-300">Total Entry Fee:</span>
                                            <span className="text-emerald-400">£{submittedData.totalFee}.00</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                        <button
                                            onClick={() => setSubmittedData(null)}
                                            className="w-full sm:w-auto px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition-all cursor-pointer"
                                        >
                                            Submit Another Entry
                                        </button>
                                        {onJoinClub && (
                                            <button
                                                onClick={onJoinClub}
                                                className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                                            >
                                                Complete HAC Membership Now
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {/* Section 1: Athlete Details */}
                                    <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl">
                                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                                            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                                                1
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">Athlete Details</h3>
                                                <p className="text-xs text-slate-400">Events open for athletes Under 12+ (U13 to Masters).</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                                                    Full Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.athleteName}
                                                    onChange={e => setFormData({ ...formData, athleteName: e.target.value })}
                                                    placeholder="e.g. Liam Patel"
                                                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                                                    Date of Birth *
                                                </label>
                                                <input
                                                    type="date"
                                                    required
                                                    value={formData.dob}
                                                    onChange={e => setFormData({ ...formData, dob: e.target.value })}
                                                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                                                    Age Category (U13+) *
                                                </label>
                                                <select
                                                    value={formData.category}
                                                    onChange={e => handleCategoryChange(e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                                                >
                                                    {AGE_CATEGORIES.map(cat => (
                                                        <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">
                                                            {cat.label} ({cat.group})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                                                    Gender *
                                                </label>
                                                <select
                                                    value={formData.gender}
                                                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                                                >
                                                    <option value="Male" className="bg-slate-900 text-white">Male</option>
                                                    <option value="Female" className="bg-slate-900 text-white">Female</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                                                    Email Address *
                                                </label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                    placeholder="athlete@example.com"
                                                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                                                    Contact Mobile *
                                                </label>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={formData.phone}
                                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                    placeholder="07123 456789"
                                                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Club Affiliation & HAC Membership Welcome */}
                                    <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl">
                                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                                                2
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">Club Affiliation & Open Pathways</h3>
                                                <p className="text-xs text-slate-400">No club? You are 100% welcome to compete!</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <label className={`flex-1 flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                                                    !formData.isAffiliated ? 'bg-blue-500/10 border-blue-500/40 text-white' : 'bg-slate-950/60 border-white/5 text-slate-400 hover:border-white/20'
                                                }`}>
                                                    <input
                                                        type="radio"
                                                        name="affiliation"
                                                        checked={!formData.isAffiliated}
                                                        onChange={() => setFormData({ ...formData, isAffiliated: false, clubName: '', eaUrn: '' })}
                                                        className="mt-1"
                                                    />
                                                    <div>
                                                        <div className="text-sm font-bold text-white flex items-center gap-1.5">
                                                            <UserCheck size={16} className="text-blue-400" />
                                                            Unaffiliated / First-Timer
                                                        </div>
                                                        <div className="text-xs text-slate-400 mt-1">
                                                            I do not hold an active UK Athletics / EA license. I want to test myself and establish my official base distance!
                                                        </div>
                                                    </div>
                                                </label>

                                                <label className={`flex-1 flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                                                    formData.isAffiliated ? 'bg-amber-500/10 border-amber-500/40 text-white' : 'bg-slate-950/60 border-white/5 text-slate-400 hover:border-white/20'
                                                }`}>
                                                    <input
                                                        type="radio"
                                                        name="affiliation"
                                                        checked={formData.isAffiliated}
                                                        onChange={() => setFormData({ ...formData, isAffiliated: true })}
                                                        className="mt-1"
                                                    />
                                                    <div>
                                                        <div className="text-sm font-bold text-white flex items-center gap-1.5">
                                                            <Shield size={16} className="text-amber-400" />
                                                            Club Affiliated
                                                        </div>
                                                        <div className="text-xs text-slate-400 mt-1">
                                                            I am a licensed member of Hillingdon AC or another UKA affiliated athletics club.
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>

                                            {formData.isAffiliated && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                                    <div>
                                                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                                                            Club Name *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            required={formData.isAffiliated}
                                                            value={formData.clubName}
                                                            onChange={e => setFormData({ ...formData, clubName: e.target.value })}
                                                            placeholder="e.g. Hillingdon AC"
                                                            className="w-full px-4 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                                                            England Athletics URN
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.eaUrn}
                                                            onChange={e => setFormData({ ...formData, eaUrn: e.target.value })}
                                                            placeholder="7-digit URN (if known)"
                                                            className="w-full px-4 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* HAC Membership Registration Hook */}
                                            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-teal-500/10 border border-emerald-500/30 flex items-start gap-3 mt-3">
                                                <input
                                                    type="checkbox"
                                                    id="wantsMembership"
                                                    checked={formData.wantsMembership}
                                                    onChange={e => setFormData({ ...formData, wantsMembership: e.target.checked })}
                                                    className="mt-1 h-4 w-4 rounded border-emerald-500 text-emerald-500 focus:ring-emerald-400"
                                                />
                                                <label htmlFor="wantsMembership" className="cursor-pointer">
                                                    <span className="text-sm font-bold text-emerald-300 block">
                                                        Interested in joining Hillingdon AC?
                                                    </span>
                                                    <span className="text-xs text-slate-300 block mt-0.5 leading-relaxed">
                                                        Tick this box and our membership team will send you details on club training sessions, coaching squads, and discounted membership for new joiners.
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 3: Event Selection & Base Distance */}
                                    <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl">
                                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-sm">
                                                    3
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white">Select Events & Benchmarks</h3>
                                                    <p className="text-xs text-slate-400">
                                                        Category implement: <span className="text-amber-400 font-semibold">{activeCatSpec.label}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold block">Entry Fee</span>
                                                <span className="text-xl font-black text-amber-400">£{individualFee}.00</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {AVAILABLE_EVENTS.map(evt => {
                                                const isSelected = !!formData.selectedEvents[evt.id];
                                                const specKey = evt.id === 'javelin' ? 'jav' : evt.id;
                                                const implementWeight = activeCatSpec.spec[specKey];
                                                const isAllowedForCat = implementWeight && implementWeight !== '—';

                                                if (!isAllowedForCat) {
                                                    return null;
                                                }

                                                return (
                                                    <div
                                                        key={evt.id}
                                                        className={`p-4 rounded-2xl border transition-all ${
                                                            isSelected
                                                                ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                                                                : 'bg-slate-950/40 border-white/5 hover:border-white/15'
                                                        }`}
                                                    >
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex items-start gap-3">
                                                                <input
                                                                    type="checkbox"
                                                                    id={`evt-${evt.id}`}
                                                                    checked={isSelected}
                                                                    onChange={() => toggleEvent(evt.id)}
                                                                    className="mt-1.5 h-4 w-4 rounded border-amber-400 text-amber-500 focus:ring-amber-400"
                                                                />
                                                                <div>
                                                                    <label htmlFor={`evt-${evt.id}`} className="text-sm font-bold text-white flex items-center gap-2 cursor-pointer">
                                                                        <span>{evt.icon}</span> {evt.name}
                                                                        {implementWeight && (
                                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-amber-300 border border-white/10">
                                                                                Weight: {implementWeight}
                                                                            </span>
                                                                        )}
                                                                    </label>
                                                                    <p className="text-xs text-slate-400 mt-0.5">{evt.note}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Seeding & Base Distance Sub-Row */}
                                                        {isSelected && (
                                                            <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                                                <div className="flex items-center gap-2">
                                                                    <label className="text-slate-300 font-semibold">
                                                                        Estimated PB / Target:
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="e.g. 11.50m"
                                                                        value={formData.eventDistances[evt.id] || ''}
                                                                        onChange={e => {
                                                                            const val = e.target.value;
                                                                            setFormData(prev => ({
                                                                                ...prev,
                                                                                eventDistances: { ...prev.eventDistances, [evt.id]: val },
                                                                                firstTimeBaseDistance: { ...prev.firstTimeBaseDistance, [evt.id]: !val }
                                                                            }));
                                                                        }}
                                                                        className="w-28 px-3 py-1.5 bg-slate-900 border border-white/20 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                                                                    />
                                                                </div>
                                                                <label className="flex items-center gap-2 text-amber-300/90 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={formData.firstTimeBaseDistance[evt.id] ?? true}
                                                                        onChange={e => {
                                                                            const checked = e.target.checked;
                                                                            setFormData(prev => ({
                                                                                ...prev,
                                                                                firstTimeBaseDistance: { ...prev.firstTimeBaseDistance, [evt.id]: checked }
                                                                            }));
                                                                        }}
                                                                        className="rounded border-amber-400 text-amber-500"
                                                                    />
                                                                    <span>I am a first-timer — please set my official Base Distance!</span>
                                                                </label>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Implement Declaration */}
                                        <div className="mt-6 pt-5 border-t border-white/10">
                                            <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                                Implement Usage
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-3 text-xs">
                                                <label className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 flex-1 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="implementType"
                                                        checked={!formData.ownImplement}
                                                        onChange={() => setFormData({ ...formData, ownImplement: false })}
                                                    />
                                                    <span>Use Hillingdon AC competition implements (Complimentary & Certified)</span>
                                                </label>
                                                <label className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 flex-1 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="implementType"
                                                        checked={formData.ownImplement}
                                                        onChange={() => setFormData({ ...formData, ownImplement: true })}
                                                    />
                                                    <span>Bringing own personal implement (Submit for scrutineering by 17:30)</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 4: Parental Consent & Safeguarding (For Juniors < 18) */}
                                    {isUnder18 && (
                                        <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl">
                                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                                                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                                                    4
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white">Parent / Guardian Consent</h3>
                                                    <p className="text-xs text-slate-400">Required for all athletes under 18 years of age.</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                                                        Parent / Guardian Full Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required={isUnder18}
                                                        value={formData.guardianName}
                                                        onChange={e => setFormData({ ...formData, guardianName: e.target.value })}
                                                        placeholder="e.g. Priya Patel"
                                                        className="w-full px-4 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                                                        Emergency Mobile Number *
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        required={isUnder18}
                                                        value={formData.guardianPhone}
                                                        onChange={e => setFormData({ ...formData, guardianPhone: e.target.value })}
                                                        placeholder="07987 654321"
                                                        className="w-full px-4 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3 pt-2 text-xs">
                                                <label className="flex items-start gap-2.5 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        required={isUnder18}
                                                        checked={formData.parentConsent}
                                                        onChange={e => setFormData({ ...formData, parentConsent: e.target.checked })}
                                                        className="mt-0.5 rounded border-purple-400 text-purple-500"
                                                    />
                                                    <span className="text-slate-300">
                                                        I confirm I am the parent/legal guardian and give permission for the named athlete to compete in the HAC LiGo Throws Open.
                                                    </span>
                                                </label>
                                                <label className="flex items-start gap-2.5 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.photoConsent}
                                                        onChange={e => setFormData({ ...formData, photoConsent: e.target.checked })}
                                                        className="mt-0.5 rounded border-purple-400 text-purple-500"
                                                    />
                                                    <span className="text-slate-300">
                                                        I consent to event photographs being taken for Hillingdon AC race reports and social channels. (Untick if you prefer no photos).
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    {/* Submit Action Bar */}
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-900 border border-amber-500/30 rounded-3xl shadow-xl">
                                        <div>
                                            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">
                                                Total Due at Check-in
                                            </span>
                                            <span className="text-2xl font-black text-amber-400">
                                                £{individualFee}.00
                                            </span>
                                            <span className="text-xs text-slate-400 ml-2">
                                                ({selectedEventKeys.length} event{selectedEventKeys.length === 1 ? '' : 's'} selected)
                                            </span>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={selectedEventKeys.length === 0}
                                            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-2xl shadow-lg shadow-amber-500/25 transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                                        >
                                            <Send size={18} /> Confirm Entry for HAC LiGo 2027
                                        </button>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    )}

                    {/* TAB 2: CLUB GROUP ENTRY FORM */}
                    {activeTab === 'group_entry' && (
                        <motion.div
                            key="group_entry"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-8"
                        >
                            {groupSubmittedData ? (
                                <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-8 max-w-3xl mx-auto shadow-2xl relative">
                                    <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 mx-auto mb-4 border border-amber-500/40">
                                        <Building2 size={32} />
                                    </div>
                                    <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-bold uppercase rounded-full border border-amber-500/20 block w-fit mx-auto mb-2">
                                        Club Roster Registered
                                    </span>
                                    <h3 className="text-2xl font-black text-white text-center mb-1">
                                        {groupSubmittedData.clubName} Team Entries Confirmed!
                                    </h3>
                                    <p className="text-slate-400 text-sm text-center mb-6">
                                        Club Booking ID: <strong className="text-amber-400 font-mono">{groupSubmittedData.clubRef}</strong>
                                    </p>

                                    {/* Consolidated Financial Summary Card */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-4 rounded-2xl border border-white/5 mb-6 text-center">
                                        <div>
                                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Athletes</span>
                                            <div className="text-lg font-black text-white">{groupSubmittedData.stats.totalAthletes}</div>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Event Entries</span>
                                            <div className="text-lg font-black text-white">{groupSubmittedData.stats.totalEntries}</div>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Distance Seeded</span>
                                            <div className="text-lg font-black text-blue-400">{groupSubmittedData.stats.distanceSeededCount}</div>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Consolidated Fee</span>
                                            <div className="text-lg font-black text-emerald-400">£{groupSubmittedData.stats.totalFee}.00</div>
                                        </div>
                                    </div>

                                    {/* Athletes Table Preview */}
                                    <div className="overflow-x-auto max-h-72 divide-y divide-white/5 bg-slate-950/50 rounded-2xl border border-white/5 text-xs mb-6">
                                        <table className="w-full text-left">
                                            <thead className="bg-white/5 text-slate-400 uppercase text-[10px] sticky top-0">
                                                <tr>
                                                    <th className="p-3">Athlete</th>
                                                    <th className="p-3">Category</th>
                                                    <th className="p-3">Events & Distances</th>
                                                    <th className="p-3 text-right">Fee</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {groupSubmittedData.roster.map(a => {
                                                    const evts = Object.keys(a.events || {}).filter(k => a.events[k]);
                                                    const fee = calculateIndividualFee(a.category, evts.length);
                                                    return (
                                                        <tr key={a.id} className="hover:bg-white/5">
                                                            <td className="p-3 font-bold text-white">{a.athleteName || 'Unnamed'}</td>
                                                            <td className="p-3 text-amber-300 font-mono">{a.category.toUpperCase()}</td>
                                                            <td className="p-3 text-slate-300">
                                                                {evts.map(e => `${e.toUpperCase()} (${a.isBaseDistance?.[e] ? 'Base' : `${a.distances?.[e]}m`})`).join(', ')}
                                                            </td>
                                                            <td className="p-3 text-right font-black text-emerald-400">£{fee}.00</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                        <button
                                            onClick={exportGroupCSV}
                                            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/20"
                                        >
                                            <Download size={14} /> Download Club Roster CSV
                                        </button>
                                        <button
                                            onClick={() => setGroupSubmittedData(null)}
                                            className="w-full sm:w-auto px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs cursor-pointer"
                                        >
                                            Modify / Add More Entries
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleGroupSubmit} className="space-y-8">
                                    {/* Club Information Card */}
                                    <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl">
                                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                                                    <Building2 size={16} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white">Club Coordinator Details</h3>
                                                    <p className="text-xs text-slate-400">Team manager or coach submitting multi-athlete entries.</p>
                                                </div>
                                            </div>
                                            <span className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                                Consolidated Club Billing
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                                                    Club Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={clubInfo.clubName}
                                                    onChange={e => setClubInfo({ ...clubInfo, clubName: e.target.value })}
                                                    placeholder="e.g. Harrow AC"
                                                    className="w-full px-4 py-2 bg-slate-950/80 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                                                    Team Coordinator Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={clubInfo.coordinatorName}
                                                    onChange={e => setClubInfo({ ...clubInfo, coordinatorName: e.target.value })}
                                                    placeholder="e.g. Coach Steve"
                                                    className="w-full px-4 py-2 bg-slate-950/80 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                                                    Coordinator Email *
                                                </label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={clubInfo.coordinatorEmail}
                                                    onChange={e => setClubInfo({ ...clubInfo, coordinatorEmail: e.target.value })}
                                                    placeholder="coordinator@club.co.uk"
                                                    className="w-full px-4 py-2 bg-slate-950/80 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                                                    Payment Method *
                                                </label>
                                                <select
                                                    value={clubInfo.paymentMethod}
                                                    onChange={e => setClubInfo({ ...clubInfo, paymentMethod: e.target.value })}
                                                    className="w-full px-4 py-2 bg-slate-950/80 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                                                >
                                                    <option value="bacs" className="bg-slate-900">Club BACS Invoice</option>
                                                    <option value="card" className="bg-slate-900">Card on Arrival</option>
                                                    <option value="online" className="bg-slate-900">Online Card / Stripe</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Consolidated Sticky KPI Bar */}
                                    <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-indigo-500/15 border border-amber-500/30 rounded-3xl p-5 backdrop-blur-xl shadow-xl flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex flex-wrap items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <Users size={18} className="text-amber-400" />
                                                <span className="text-xs text-slate-300 font-semibold">
                                                    Athletes: <strong className="text-white text-sm">{groupStats.totalAthletes}</strong>
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Target size={18} className="text-blue-400" />
                                                <span className="text-xs text-slate-300 font-semibold">
                                                    Total Events: <strong className="text-white text-sm">{groupStats.totalEntries}</strong>
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Activity size={18} className="text-emerald-400" />
                                                <span className="text-xs text-slate-300 font-semibold">
                                                    Distance Seeded: <strong className="text-white text-sm">{groupStats.distanceSeededCount}</strong>
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Sparkles size={18} className="text-yellow-400" />
                                                <span className="text-xs text-slate-300 font-semibold">
                                                    Base Benchmarks: <strong className="text-white text-sm">{groupStats.baseDistanceCount}</strong>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                                                    Club Consolidated Total
                                                </span>
                                                <span className="text-2xl font-black text-emerald-400">
                                                    £{groupStats.totalFee}.00
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={addRosterAthlete}
                                                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                                            >
                                                <Plus size={15} /> Add Athlete
                                            </button>
                                        </div>
                                    </div>

                                    {/* Athletes Roster List */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-2">
                                            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                                <Layers size={16} className="text-amber-400" />
                                                Club Athletes Roster & Event Distance Seeding ({groupRoster.length})
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={exportGroupCSV}
                                                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                                            >
                                                <FileSpreadsheet size={14} className="text-emerald-400" /> Export CSV Draft
                                            </button>
                                        </div>

                                        {groupRoster.map((athlete, idx) => {
                                            const athleteEvents = Object.keys(athlete.events || {}).filter(k => athlete.events[k]);
                                            const athleteFee = calculateIndividualFee(athlete.category, athleteEvents.length);
                                            const catSpec = AGE_CATEGORIES.find(c => c.id === athlete.category) || AGE_CATEGORIES[0];

                                            return (
                                                <div
                                                    key={athlete.id}
                                                    className="bg-slate-900/90 border border-white/10 rounded-3xl p-5 sm:p-6 backdrop-blur-xl transition-all hover:border-white/20 shadow-md"
                                                >
                                                    {/* Header: Athlete Name, Category & Actions */}
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                                                        <div className="flex items-center gap-3">
                                                            <span className="w-6 h-6 rounded-full bg-white/10 text-amber-400 text-xs font-black flex items-center justify-center">
                                                                {idx + 1}
                                                            </span>
                                                            <div className="flex-1 min-w-[200px]">
                                                                <input
                                                                    type="text"
                                                                    required
                                                                    placeholder="Athlete Full Name *"
                                                                    value={athlete.athleteName}
                                                                    onChange={e => updateRosterAthlete(athlete.id, 'athleteName', e.target.value)}
                                                                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white font-bold focus:outline-none focus:border-amber-400"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-2 text-xs">
                                                            <select
                                                                value={athlete.category}
                                                                onChange={e => updateRosterAthlete(athlete.id, 'category', e.target.value)}
                                                                className="bg-slate-950/80 border border-white/10 rounded-xl px-3 py-1.5 text-white font-medium focus:outline-none focus:border-amber-400"
                                                            >
                                                                {AGE_CATEGORIES.map(cat => (
                                                                    <option key={cat.id} value={cat.id} className="bg-slate-900">
                                                                        {cat.label}
                                                                    </option>
                                                                ))}
                                                            </select>

                                                            <select
                                                                value={athlete.gender}
                                                                onChange={e => updateRosterAthlete(athlete.id, 'gender', e.target.value)}
                                                                className="bg-slate-950/80 border border-white/10 rounded-xl px-2.5 py-1.5 text-white font-medium focus:outline-none focus:border-amber-400"
                                                            >
                                                                <option value="Male" className="bg-slate-900">M</option>
                                                                <option value="Female" className="bg-slate-900">F</option>
                                                            </select>

                                                            <input
                                                                type="text"
                                                                placeholder="EA URN (optional)"
                                                                value={athlete.eaUrn}
                                                                onChange={e => updateRosterAthlete(athlete.id, 'eaUrn', e.target.value)}
                                                                className="w-28 bg-slate-950/80 border border-white/10 rounded-xl px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-amber-400"
                                                            />

                                                            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold rounded-xl">
                                                                £{athleteFee}.00
                                                            </div>

                                                            {groupRoster.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeRosterAthlete(athlete.id)}
                                                                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors cursor-pointer rounded-lg hover:bg-white/5"
                                                                    title="Remove athlete"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Event Toggles & Distance Benchmarks */}
                                                    <div className="pt-4">
                                                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                                                            <span>Select Events & Enter Distance for Seeding:</span>
                                                            <span className="text-amber-400 font-normal">
                                                                Implement: {catSpec.label}
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                                            {AVAILABLE_EVENTS.map(evt => {
                                                                const specKey = evt.id === 'javelin' ? 'jav' : evt.id;
                                                                const implementWeight = catSpec.spec[specKey];
                                                                const isAllowed = implementWeight && implementWeight !== '—';

                                                                if (!isAllowed) return null;

                                                                const isChecked = !!athlete.events?.[evt.id];
                                                                const distanceVal = athlete.distances?.[evt.id] || '';
                                                                const isBase = athlete.isBaseDistance?.[evt.id] ?? false;

                                                                return (
                                                                    <div
                                                                        key={evt.id}
                                                                        className={`p-3 rounded-2xl border transition-all text-xs ${
                                                                            isChecked
                                                                                ? 'bg-amber-500/10 border-amber-500/30'
                                                                                : 'bg-slate-950/40 border-white/5 opacity-70'
                                                                        }`}
                                                                    >
                                                                        <label className="flex items-center justify-between cursor-pointer mb-2">
                                                                            <div className="flex items-center gap-2">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={isChecked}
                                                                                    onChange={() => toggleRosterEvent(athlete.id, evt.id)}
                                                                                    className="rounded border-amber-400 text-amber-500"
                                                                                />
                                                                                <span className="font-bold text-white flex items-center gap-1">
                                                                                    {evt.icon} {evt.name}
                                                                                </span>
                                                                            </div>
                                                                            {implementWeight && (
                                                                                <span className="text-[10px] text-amber-300 font-mono">
                                                                                    {implementWeight}
                                                                                </span>
                                                                            )}
                                                                        </label>

                                                                        {isChecked && (
                                                                            <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                                                                                <input
                                                                                    type="text"
                                                                                    placeholder="Distance (m)"
                                                                                    value={distanceVal}
                                                                                    onChange={e => updateRosterDistance(athlete.id, evt.id, e.target.value)}
                                                                                    className="w-20 px-2 py-1 bg-slate-900 border border-white/10 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                                                                                />
                                                                                <label className="flex items-center gap-1.5 text-[10px] text-slate-400 cursor-pointer">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={isBase}
                                                                                        onChange={e => toggleRosterBaseDistance(athlete.id, evt.id, e.target.checked)}
                                                                                        className="rounded border-white/20 text-amber-500"
                                                                                    />
                                                                                    <span>Base mark</span>
                                                                                </label>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Consolidated Bottom Submit Bar */}
                                    <div className="p-6 bg-slate-900 border border-amber-500/30 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="text-left">
                                            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">
                                                {clubInfo.clubName || 'Club'} Consolidated Invoice
                                            </span>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-3xl font-black text-emerald-400">
                                                    £{groupStats.totalFee}.00
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    for {groupStats.totalAthletes} athletes ({groupStats.totalEntries} event entries)
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                            <button
                                                type="button"
                                                onClick={addRosterAthlete}
                                                className="flex-1 sm:flex-none px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                            >
                                                <Plus size={16} /> Add Athlete
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={groupRoster.length === 0}
                                                className="flex-1 sm:flex-none px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-2xl shadow-lg shadow-amber-500/25 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                            >
                                                <Send size={16} /> Submit Group Entries
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    )}

                    {/* TAB 3: PHILOSOPHY & WRITE-UP */}
                    {activeTab === 'philosophy' && (
                        <motion.div
                            key="philosophy"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            className="space-y-8"
                        >
                            <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                                <div className="max-w-3xl">
                                    <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
                                        The HAC LiGo Ethos
                                    </span>
                                    <h3 className="text-3xl font-black text-white mt-1 mb-4">
                                        "Let It Go" — Why Everyone Benefits From Throws
                                    </h3>
                                    <p className="text-slate-300 leading-relaxed mb-6">
                                        In modern athletics, track events and road runs often grab the spotlight. But the foundation of true functional athleticism lies in <strong>throwing</strong>. When an athlete prepares to throw, they recruit nearly every muscle in their body in a single, coordinated kinetic explosion.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                                            <Activity size={24} />
                                        </div>
                                        <h4 className="text-base font-bold text-white mb-2">Rotational Core Strength</h4>
                                        <p className="text-xs text-slate-400 leading-relaxed">
                                            Most daily movement is forward and back. Throws introduce powerful transverse and rotational torque across the obliques, hips, and deep spinal stabilizers.
                                        </p>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                                            <Scale size={24} />
                                        </div>
                                        <h4 className="text-base font-bold text-white mb-2">Dynamic Balance & Posture</h4>
                                        <p className="text-xs text-slate-400 leading-relaxed">
                                            Executing a discus turn or holding a solid javelin block requires acute proprioception and balance. This neuromuscular training prevents falls and preserves joint mobility as we age.
                                        </p>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                                            <Zap size={24} />
                                        </div>
                                        <h4 className="text-base font-bold text-white mb-2">Rate of Force Development</h4>
                                        <p className="text-xs text-slate-400 leading-relaxed">
                                            Throws condition fast-twitch muscle fibers, elastic recoil, and bone density through high-impact ground reaction forces that endurance running alone does not stimulate.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30">
                                    <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                        <Target className="text-amber-400" size={20} />
                                        The "Parkrun for Throws" Concept
                                    </h4>
                                    <p className="text-sm text-slate-300 leading-relaxed mb-4">
                                        Parkrun revolutionized distance running by removing the barrier of elitism. Whether you run 15 minutes or walk 55 minutes, you have a registered benchmark and a welcoming community.
                                    </p>
                                    <p className="text-sm text-slate-300 leading-relaxed">
                                        <strong>HAC LiGo adopts this exact model for field events:</strong> every competitor sets their official <em>Base Distance</em>. We group flights by distance rather than intimidating rankings, ensuring beginners throw alongside peers in a pressure-free environment.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* TAB 4: IMPLEMENT WEIGHT MATRIX */}
                    {activeTab === 'matrix' && (
                        <motion.div
                            key="matrix"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl overflow-hidden"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h3 className="text-xl font-black text-white">Official Implement Weight Specifications</h3>
                                    <p className="text-xs text-slate-400">Compliant with UK Athletics (UKA) & World Masters Athletics rules (Under 12+ / U13 to Masters).</p>
                                </div>
                                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-xl border border-amber-500/30 w-fit">
                                    2027 Competition Weights
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
                                            <th className="py-3 px-4">Category</th>
                                            <th className="py-3 px-4">Shot Put</th>
                                            <th className="py-3 px-4">Discus</th>
                                            <th className="py-3 px-4">Javelin</th>
                                            <th className="py-3 px-4">Hammer</th>
                                            <th className="py-3 px-4">Masters Heavy Weight</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {AGE_CATEGORIES.map(cat => (
                                            <tr key={cat.id} className="hover:bg-white/5 transition-colors">
                                                <td className="py-3 px-4 font-bold text-white">
                                                    {cat.label}
                                                </td>
                                                <td className="py-3 px-4 text-slate-300 font-mono">{cat.spec.shot || '—'}</td>
                                                <td className="py-3 px-4 text-slate-300 font-mono">{cat.spec.discus || '—'}</td>
                                                <td className="py-3 px-4 text-slate-300 font-mono">{cat.spec.jav || '—'}</td>
                                                <td className="py-3 px-4 text-slate-300 font-mono">{cat.spec.hammer || '—'}</td>
                                                <td className="py-3 px-4 text-amber-400 font-semibold font-mono">
                                                    {cat.spec.weight || '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {/* TAB 5: SCHEDULE & TIMETABLE */}
                    {activeTab === 'schedule' && (
                        <motion.div
                            key="schedule"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            className="space-y-6"
                        >
                            <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                                    <div>
                                        <h3 className="text-xl font-black text-white">Thursday Evening Flight Schedule</h3>
                                        <p className="text-xs text-slate-400">Timings optimized for safety, twilight visibility, and smooth flight transitions.</p>
                                    </div>
                                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                                        <Clock size={14} /> Sunset: 21:22 BST
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4">
                                        <div className="w-16 text-center shrink-0">
                                            <span className="text-xs font-bold text-amber-400 block">16:30</span>
                                            <span className="text-[10px] text-slate-400 uppercase">Check-in</span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white">Registration & Implement Weigh-in Opens</h4>
                                            <p className="text-xs text-slate-400 mt-0.5">Pick up competition bibs and submit personal implements for scrutineering.</p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4">
                                        <div className="w-16 text-center shrink-0">
                                            <span className="text-xs font-bold text-amber-400 block">17:30</span>
                                            <span className="text-[10px] text-slate-400 uppercase">Flight 1</span>
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-bold text-white">Flight 1: Youth & Masters Opening</h4>
                                            <ul className="text-xs text-slate-400 list-disc list-inside space-y-0.5">
                                                <li><strong>Circle 1:</strong> Shot Put (U13 & U15 Juniors)</li>
                                                <li><strong>Cage A:</strong> Hammer Throw (U15, U17, Masters Pool)</li>
                                                <li><strong>Javelin Runway:</strong> Senior & Masters Javelin</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4">
                                        <div className="w-16 text-center shrink-0">
                                            <span className="text-xs font-bold text-amber-400 block">19:00</span>
                                            <span className="text-[10px] text-slate-400 uppercase">Flight 2</span>
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-bold text-white">Flight 2: Discus & Seeded Evening Throws</h4>
                                            <ul className="text-xs text-slate-400 list-disc list-inside space-y-0.5">
                                                <li><strong>Cage A:</strong> Discus (Seeded pools based on estimated distance)</li>
                                                <li><strong>Circle 1:</strong> Shot Put (Seniors & Masters)</li>
                                                <li><strong>Javelin Runway:</strong> U13–U17 Junior Javelin</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4">
                                        <div className="w-16 text-center shrink-0">
                                            <span className="text-xs font-bold text-amber-400 block">20:30</span>
                                            <span className="text-[10px] text-slate-400 uppercase">Twilight</span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white">Masters Heavy Weight Throw & Showcase</h4>
                                            <p className="text-xs text-slate-400 mt-0.5">High-energy twilight competition in the main cage under summer evening skies.</p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-4">
                                        <div className="w-16 text-center shrink-0">
                                            <span className="text-xs font-bold text-emerald-400 block">21:15</span>
                                            <span className="text-[10px] text-emerald-300 uppercase">Social</span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white">Presentation, PB Distances & HAC Club Social</h4>
                                            <p className="text-xs text-slate-300 mt-0.5">
                                                Base Distance certificates awarded at the clubhouse. Membership registration desk open for all non-affiliated athletes!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default HacLiGoThrows;
