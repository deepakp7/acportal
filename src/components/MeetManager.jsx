import React, { useState, useEffect } from 'react';
import {
    Calendar,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Shield,
    Users,
    Phone,
    Mail,
    MapPin,
    CloudRain,
    Wind,
    Sun,
    FileText,
    Download,
    QrCode,
    RefreshCw,
    Bot,
    Search,
    Plus,
    ExternalLink,
    Printer,
    Sparkles,
    CheckSquare,
    Play,
    Zap,
    Trophy,
    ChevronRight,
    ArrowLeft,
    Car,
    Utensils,
    Crosshair,
    Tag,
    Copy,
    Check
} from 'lucide-react';
import { LEAGUES, KEY_CONTACTS, TIMETABLES, MOCK_WEATHER_FORECASTS } from '../data/meetManagerData';
import { meetAgentService } from '../services/meetAgentService';

export default function MeetManager({ onClose }) {
    const [selectedLeague, setSelectedLeague] = useState('all');
    const [activeTab, setActiveTab] = useState('checklist'); // 'checklist' | 'timetable' | 'contacts' | 'card_reader' | 'agent_logs'
    const [stageFilter, setStageFilter] = useState('all'); // 'all' | 'before' | 'during' | 'after'
    const [checklist, setChecklist] = useState([]);
    const [agentLogs, setAgentLogs] = useState([]);
    const [searchContact, setSearchContact] = useState('');
    const [contactCategoryFilter, setContactCategoryFilter] = useState('all');
    const [customContacts, setCustomContacts] = useState([]);
    const [showContactModal, setShowContactModal] = useState(false);
    const [newContact, setNewContact] = useState({
        name: '',
        category: 'Officials',
        role: '',
        contactPerson: '',
        phone: '',
        email: '',
        location: '',
        notes: ''
    });

    // Modals & Tools
    const [showNoticeModal, setShowNoticeModal] = useState(false);
    const [noticeLetterText, setNoticeLetterText] = useState('');
    const [showPo10Modal, setShowPo10Modal] = useState(false);
    const [po10Text, setPo10Text] = useState('');
    const [showAuditModal, setShowAuditModal] = useState(false);
    const [auditReport, setAuditReport] = useState([]);
    const [copiedNotice, setCopiedNotice] = useState(false);
    const [cardReaderBatch, setCardReaderBatch] = useState(null);
    const [weatherData, setWeatherData] = useState(MOCK_WEATHER_FORECASTS);
    const [loadingWeather, setLoadingWeather] = useState(false);

    // Subscribe to meet agent service
    useEffect(() => {
        const syncState = () => {
            setChecklist(meetAgentService.getChecklist(stageFilter, selectedLeague));
            setAgentLogs([...meetAgentService.agentLogs]);
        };

        syncState();
        const unsubscribe = meetAgentService.subscribe(syncState);
        return () => unsubscribe();
    }, [stageFilter, selectedLeague]);

    // Load custom contacts
    useEffect(() => {
        try {
            const saved = localStorage.getItem('hac_meet_manager_custom_contacts_v1');
            if (saved) setCustomContacts(JSON.parse(saved));
        } catch (e) {
            console.warn(e);
        }
    }, []);

    const saveCustomContacts = (contacts) => {
        setCustomContacts(contacts);
        try {
            localStorage.setItem('hac_meet_manager_custom_contacts_v1', JSON.stringify(contacts));
        } catch (e) {
            console.error(e);
        }
    };

    const handleStatusChange = (taskId, newStatus) => {
        meetAgentService.updateTaskStatus(taskId, newStatus);
        setChecklist(meetAgentService.getChecklist(stageFilter, selectedLeague));
    };

    const handleRunAudit = () => {
        const report = meetAgentService.runFullAudit(selectedLeague);
        setAuditReport(report);
        setShowAuditModal(true);
    };

    const handleGenerateLetter = (leagueId) => {
        const letter = meetAgentService.generateNoticeLetter(leagueId || 'ydl');
        setNoticeLetterText(letter);
        setShowNoticeModal(true);
        setCopiedNotice(false);
    };

    const handleGeneratePo10 = (leagueId) => {
        const text = meetAgentService.generatePowerOf10Export(leagueId || 'vets');
        setPo10Text(text);
        setShowPo10Modal(true);
    };

    const handleSimulateCardReader = () => {
        const batch = meetAgentService.simulateCardReaderIngest(selectedLeague === 'all' ? 'ydl' : selectedLeague);
        setCardReaderBatch(batch);
        setActiveTab('card_reader');
    };

    const handleRefreshWeather = async (dateStr) => {
        setLoadingWeather(true);
        const forecast = await meetAgentService.getWeatherForecast(dateStr);
        setWeatherData(prev => ({
            ...prev,
            [dateStr]: forecast
        }));
        setLoadingWeather(false);
    };

    const handleAddContact = (e) => {
        e.preventDefault();
        if (!newContact.name) return;
        const contactObj = {
            ...newContact,
            id: 'custom_con_' + Date.now()
        };
        const updated = [contactObj, ...customContacts];
        saveCustomContacts(updated);
        setShowContactModal(false);
        setNewContact({
            name: '',
            category: 'Officials',
            role: '',
            contactPerson: '',
            phone: '',
            email: '',
            location: '',
            notes: ''
        });
        meetAgentService.logAgentActivity('contacts_agent', 'Contacts Manager', `Added new contact: ${contactObj.name} (${contactObj.category})`, 'success');
    };

    // Combined contacts
    const allContacts = [...customContacts, ...KEY_CONTACTS];
    const filteredContacts = allContacts.filter(c => {
        const matchCategory = contactCategoryFilter === 'all' || c.category === contactCategoryFilter;
        const q = searchContact.toLowerCase();
        const matchSearch = !q ||
            c.name.toLowerCase().includes(q) ||
            (c.contactPerson && c.contactPerson.toLowerCase().includes(q)) ||
            (c.role && c.role.toLowerCase().includes(q)) ||
            (c.category && c.category.toLowerCase().includes(q)) ||
            (c.notes && c.notes.toLowerCase().includes(q));
        return matchCategory && matchSearch;
    });

    const contactCategories = [
        'all',
        'Stadium Contact',
        'Photo Finish',
        'First Aid',
        'Starters & Starter Assistants',
        'EDM (Electronic Distance)',
        'BIBS Supplier',
        'Officials',
        'Meeting Managers & Team Captains'
    ];

    // Compute stats for current view
    const currentLeagueStats = selectedLeague === 'all'
        ? {
            total: checklist.length,
            completed: checklist.filter(i => i.defaultStatus === 'completed').length,
            inProgress: checklist.filter(i => i.defaultStatus === 'in_progress').length,
            notStarted: checklist.filter(i => i.defaultStatus === 'not_started').length,
            blocked: checklist.filter(i => i.defaultStatus === 'blocked').length
        }
        : meetAgentService.getLeagueStats(selectedLeague);

    const completionRate = currentLeagueStats.total > 0
        ? Math.round((currentLeagueStats.completed / currentLeagueStats.total) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl flex items-center gap-2 text-xs font-bold transition border border-slate-700/60 shadow"
                    >
                        <ArrowLeft size={14} /> Back to Hub
                    </button>
                    <div className="h-5 w-px bg-slate-800 hidden sm:block"></div>
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
                            <Trophy size={18} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                                    Meet Manager
                                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                        Autonomous Ops
                                    </span>
                                </h1>
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium hidden md:block">
                                YDL • Alder Valley • Southern Vets League Coordination & Execution Engine
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={handleRunAudit}
                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                    >
                        <Bot size={14} className="text-emerald-400 animate-pulse" />
                        Run Agent Audit
                    </button>

                    <button
                        onClick={() => handleGenerateLetter(selectedLeague === 'all' ? 'ydl' : selectedLeague)}
                        className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                    >
                        <Mail size={14} className="text-blue-400" />
                        Auto-Draft Letter (2 Wks)
                    </button>

                    <button
                        onClick={handleSimulateCardReader}
                        className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                    >
                        <Zap size={14} className="text-purple-400" />
                        Card Reader Ingest
                    </button>

                    <button
                        onClick={() => handleGeneratePo10(selectedLeague === 'all' ? 'vets' : selectedLeague)}
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                    >
                        <Download size={14} className="text-rose-400" />
                        Power of 10 Export
                    </button>
                </div>
            </header>

            {/* Autonomous Agent Banner / Heartbeat */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900 border-b border-slate-800/80 px-4 lg:px-8 py-2.5 flex flex-wrap items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-3">
                    <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="font-semibold text-slate-300">
                        Autonomous Meet Agents: <span className="text-emerald-400 font-bold">3 Active</span> (YDL Prep, Alder Valley, VETS League)
                    </span>
                    <span className="hidden md:inline-block text-slate-500">•</span>
                    <span className="hidden md:inline-block text-slate-400">
                        Latest check: <span className="text-slate-300 font-mono">{agentLogs[0]?.message.substring(0, 75)}...</span>
                    </span>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>{currentLeagueStats.completed} Done</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span>{currentLeagueStats.inProgress} In Progress</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                        <span>{currentLeagueStats.notStarted} Pending</span>
                    </div>
                    <div className="text-emerald-400 font-bold font-mono">
                        {completionRate}% Readiness
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
                {/* League Selector Pills & Agent Health Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* All Leagues Card */}
                    <button
                        onClick={() => setSelectedLeague('all')}
                        className={`text-left p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden ${selectedLeague === 'all'
                            ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Master Overview</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">All Meets</span>
                        </div>
                        <h3 className="text-lg font-black text-white">All 3 Leagues</h3>
                        <p className="text-xs text-slate-400 mt-1">Unified view of YDL, Alder Valley & VETS</p>
                        <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-800">
                            <span className="text-slate-400">Total Tasks</span>
                            <span className="font-bold text-emerald-400">{checklist.length}</span>
                        </div>
                    </button>

                    {/* YDL Card */}
                    {LEAGUES.map(league => {
                        const stats = meetAgentService.getLeagueStats(league.id);
                        const isSelected = selectedLeague === league.id;
                        return (
                            <button
                                key={league.id}
                                onClick={() => setSelectedLeague(league.id)}
                                className={`text-left p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden ${isSelected
                                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                                        {league.dayPreference}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        {stats.statusText}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-black text-white">{league.shortName}</h3>
                                    {league.websiteUrl && (
                                        <a
                                            href={league.websiteUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono hover:underline px-2 py-0.5 bg-slate-800 rounded-md border border-slate-700"
                                            title={`Open official ${league.shortName} website`}
                                        >
                                            <ExternalLink size={10} />
                                            <span>Portal</span>
                                        </a>
                                    )}
                                </div>
                                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{league.coordinator}</p>

                                <div className="mt-3 space-y-1.5 pt-2.5 border-t border-slate-800">
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-slate-400">Agent Readiness</span>
                                        <span className="font-bold text-emerald-400">{stats.percentage}%</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${stats.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Primary Navigation Tabs */}
                <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto max-w-full">
                        <button
                            onClick={() => setActiveTab('checklist')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${activeTab === 'checklist'
                                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                                }`}
                        >
                            <CheckSquare size={14} />
                            Checklists & Agent Workflow
                        </button>

                        <button
                            onClick={() => setActiveTab('timetable')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${activeTab === 'timetable'
                                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                                }`}
                        >
                            <Calendar size={14} />
                            Timetables & Weather Forecast
                        </button>

                        <button
                            onClick={() => setActiveTab('contacts')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${activeTab === 'contacts'
                                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                                }`}
                        >
                            <Users size={14} />
                            Key Contacts Directory ({allContacts.length})
                        </button>

                        <button
                            onClick={() => setActiveTab('card_reader')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${activeTab === 'card_reader'
                                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                                }`}
                        >
                            <Zap size={14} />
                            Card Reader & Results Hub
                        </button>

                        <button
                            onClick={() => setActiveTab('agent_logs')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${activeTab === 'agent_logs'
                                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                                }`}
                        >
                            <Bot size={14} />
                            Agent Audit Logs
                        </button>
                    </div>

                    {/* Reset State Button */}
                    <button
                        onClick={() => {
                            if (window.confirm('Reset all checklist items to club default state?')) {
                                meetAgentService.resetChecklistToDefault();
                                setChecklist(meetAgentService.getChecklist(stageFilter, selectedLeague));
                            }
                        }}
                        className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition"
                    >
                        <RefreshCw size={12} /> Reset Template
                    </button>
                </div>

                {/* ========================================================================= */}
                {/* TAB 1: CHECKLISTS & WORKFLOW */}
                {/* ========================================================================= */}
                {activeTab === 'checklist' && (
                    <div className="space-y-6">
                        {/* Sub-Filters for Stages */}
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400">Meeting Stage:</span>
                                {[
                                    { id: 'all', label: 'All Stages' },
                                    { id: 'before', label: '1. Before the Meet (19 Tasks)' },
                                    { id: 'during', label: '2. During the Meeting (7 Tasks)' },
                                    { id: 'after', label: '3. After the Meeting (2 Tasks)' }
                                ].map(st => (
                                    <button
                                        key={st.id}
                                        onClick={() => setStageFilter(st.id)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${stageFilter === st.id
                                            ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                                            : 'bg-slate-900/70 text-slate-400 hover:text-white border border-slate-800'
                                            }`}
                                    >
                                        {st.label}
                                    </button>
                                ))}
                            </div>

                            <div className="text-xs text-slate-400">
                                Showing <span className="text-white font-bold">{checklist.length}</span> items
                            </div>
                        </div>

                        {/* Critical Alert Banner if Date Confirmation or Bibs Pending */}
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex items-start gap-3">
                            <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={18} />
                            <div className="text-xs space-y-1">
                                <div className="font-bold text-amber-300">
                                    Priority Agent Directives for Hillingdon AC Meets:
                                </div>
                                <p className="text-slate-300 leading-relaxed">
                                    <strong>First Priority:</strong> Dates finalized for all 3 meets. Ask for a <strong>Sunday</strong> for YDL and Alder Valley, and for VETS it is a <strong>Monday</strong> anyway. <em>Michael Illing to confirm.</em>
                                    <br />
                                    <strong>Supplies & Technical:</strong> Bibs must be ordered in advance with <strong>Stacey and Sons</strong>. Card reader will automatically publish results to Excel instead of typing. Send results to <strong>Power of 10</strong> post-meet.
                                </p>
                            </div>
                        </div>

                        {/* Checklist Items Grid */}
                        <div className="space-y-3">
                            {checklist.map((item, idx) => {
                                const isCompleted = item.defaultStatus === 'completed';
                                const isInProgress = item.defaultStatus === 'in_progress';
                                const isBlocked = item.defaultStatus === 'blocked';

                                return (
                                    <div
                                        key={item.id}
                                        className={`p-4 rounded-2xl border transition-all duration-200 ${isCompleted
                                            ? 'bg-slate-900/40 border-slate-800/80 opacity-80 hover:opacity-100'
                                            : isBlocked
                                                ? 'bg-rose-950/20 border-rose-500/40'
                                                : isInProgress
                                                    ? 'bg-slate-900 border-blue-500/40 shadow-sm'
                                                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                                            }`}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                            {/* Left Column: Number, Title, Description */}
                                            <div className="flex items-start gap-3 flex-1">
                                                <button
                                                    onClick={() => handleStatusChange(item.id, isCompleted ? 'not_started' : 'completed')}
                                                    className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition shrink-0 ${isCompleted
                                                        ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                                                        : 'border-slate-700 hover:border-emerald-500 text-transparent'
                                                        }`}
                                                    title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
                                                >
                                                    <Check size={14} strokeWidth={3} />
                                                </button>

                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-xs font-mono text-slate-500 font-bold">
                                                            #{idx + 1}
                                                        </span>
                                                        <h4 className={`text-sm font-bold ${isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                                                            {item.task}
                                                        </h4>
                                                        {item.critical && (
                                                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                                                Critical
                                                            </span>
                                                        )}
                                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-slate-800 text-slate-400 border border-slate-700/60">
                                                            {item.category}
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-wider bg-slate-800/80 text-emerald-400">
                                                            {item.stage} meet
                                                        </span>
                                                    </div>

                                                    <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                                                        {item.description}
                                                    </p>

                                                    {item.leagueWebsites && (
                                                        <div className="flex items-center gap-2 flex-wrap pt-1.5">
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Official Portals:</span>
                                                            <a
                                                                href={item.leagueWebsites.ydl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="px-2 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 transition"
                                                            >
                                                                <ExternalLink size={10} /> YDL (ukydl.org.uk)
                                                            </a>
                                                            <a
                                                                href={item.leagueWebsites.alder_valley}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="px-2 py-0.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold flex items-center gap-1 transition"
                                                            >
                                                                <ExternalLink size={10} /> Alder Valley (bmhac.co.uk)
                                                            </a>
                                                            <a
                                                                href={item.leagueWebsites.vets}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="px-2 py-0.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold flex items-center gap-1 transition"
                                                            >
                                                                <ExternalLink size={10} /> SCVAC VETS (scvac.org.uk)
                                                            </a>
                                                        </div>
                                                    )}

                                                    {item.agentNote && (
                                                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400/90 font-mono pt-1">
                                                            <Bot size={12} className="shrink-0" />
                                                            <span>Agent update: {item.agentNote}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right Column: Status Selector & Due Date */}
                                            <div className="flex items-center gap-3 self-end md:self-center shrink-0 pt-2 md:pt-0">
                                                <div className="text-right hidden sm:block">
                                                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Responsible</div>
                                                    <div className="text-xs text-slate-300 font-medium">{item.owner}</div>
                                                </div>

                                                <select
                                                    value={item.defaultStatus}
                                                    onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${isCompleted
                                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                                        : isInProgress
                                                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                                            : isBlocked
                                                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                                                : 'bg-slate-800 text-slate-300 border-slate-700'
                                                        }`}
                                                >
                                                    <option value="not_started">Not Started</option>
                                                    <option value="in_progress">In Progress</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="blocked">Blocked / Pending</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 2: TIMETABLES & WEATHER FORECAST */}
                {/* ========================================================================= */}
                {activeTab === 'timetable' && (
                    <div className="space-y-8">
                        <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <Calendar className="text-emerald-400" size={18} />
                                    League Timetables & Expected Weather
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    Official schedules for Youth Development League, Alder Valley League, and Southern Vets League.
                                    <span className="text-emerald-400 font-semibold ml-1">
                                        Fixtures hosted by Hillingdon Athletic Club are highlighted below with expected weather.
                                    </span>
                                </p>
                            </div>
                        </div>

                        {TIMETABLES.map(tt => {
                            const weather = weatherData[tt.hostingDetails.date] || MOCK_WEATHER_FORECASTS['2027-05-16'];

                            return (
                                <div
                                    key={tt.leagueId}
                                    className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl"
                                >
                                    {/* Timetable Header */}
                                    <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-lg font-black text-white">{tt.leagueName}</h3>
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                                    Typical Day: {tt.typicalScheduleDay}
                                                </span>
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                                    {tt.division}
                                                </span>
                                                <a
                                                    href={tt.leagueId === 'ydl' ? 'https://www.ukydl.org.uk' : tt.leagueId === 'alder_valley' ? 'https://bmhac.co.uk/alder-valley-league/' : 'http://www.scvac.org.uk'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-emerald-500/40 flex items-center gap-1 transition"
                                                >
                                                    <ExternalLink size={10} /> Official Website
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold pt-0.5">
                                                <Shield size={14} />
                                                <span>HAC Role: {tt.hacSupportRole}</span>
                                            </div>
                                        </div>

                                        {/* Hosting Details Badge */}
                                        <div className="bg-slate-800/90 border border-slate-700/80 p-3 rounded-2xl flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                                                <MapPin size={20} />
                                            </div>
                                            <div className="text-xs">
                                                <div className="font-bold text-white">Host Venue: Hillingdon Athletics Stadium</div>
                                                <div className="text-slate-400 text-[11px]">
                                                    Date: <span className="text-emerald-400 font-semibold">{tt.hostingDetails.date} ({tt.typicalScheduleDay})</span> • Gates: {tt.hostingDetails.gatesOpen} • Action: {tt.hostingDetails.firstEvent}-{tt.hostingDetails.lastEvent}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Weather Forecast Card for this Hosted Meet */}
                                    <div className="p-4 bg-gradient-to-r from-blue-950/30 via-slate-900 to-emerald-950/20 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shadow-inner">
                                                <Sun size={26} className="animate-spin-slow" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                                                        Expected Weather for Host Match ({tt.hostingDetails.date})
                                                    </span>
                                                    <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded-full font-mono">
                                                        Uxbridge UB8 1ES
                                                    </span>
                                                </div>
                                                <div className="text-sm font-bold text-white flex items-center gap-3 mt-0.5">
                                                    <span>{weather.temp}°C</span>
                                                    <span>•</span>
                                                    <span className="text-emerald-400">{weather.condition}</span>
                                                    <span>•</span>
                                                    <span className="text-slate-400 font-normal text-xs flex items-center gap-1">
                                                        <Wind size={12} /> {weather.wind}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="text-slate-400 font-normal text-xs flex items-center gap-1">
                                                        <CloudRain size={12} /> Rain: {weather.rainChance}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-slate-400 mt-1">
                                                    <strong>Track Condition:</strong> {weather.trackCondition} — {weather.advice}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleRefreshWeather(tt.hostingDetails.date)}
                                            disabled={loadingWeather}
                                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-slate-700"
                                        >
                                            <RefreshCw size={12} className={loadingWeather ? 'animate-spin' : ''} />
                                            Live Forecast Check
                                        </button>
                                    </div>

                                    {/* Events Timetable: Track & Field Side by Side */}
                                    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Track Events */}
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                                                <Clock size={14} /> Track Order of Events
                                            </h4>
                                            <div className="space-y-2">
                                                {tt.trackEvents.map((ev, i) => (
                                                    <div
                                                        key={i}
                                                        className="p-3 rounded-xl bg-slate-850/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-xs"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                                                {ev.time}
                                                            </span>
                                                            <div>
                                                                <div className="font-bold text-white">{ev.event}</div>
                                                                <div className="text-[11px] text-slate-400">{ev.ageGroup}</div>
                                                            </div>
                                                        </div>
                                                        <span className="text-[11px] text-slate-500 italic">{ev.notes}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Field Events */}
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-2">
                                                <Crosshair size={14} /> Field Events Order
                                            </h4>
                                            <div className="space-y-2">
                                                {tt.fieldEvents.map((ev, i) => (
                                                    <div
                                                        key={i}
                                                        className="p-3 rounded-xl bg-slate-850/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-xs"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                                                                {ev.time}
                                                            </span>
                                                            <div>
                                                                <div className="font-bold text-white">{ev.event}</div>
                                                                <div className="text-[11px] text-slate-400">{ev.ageGroup}</div>
                                                            </div>
                                                        </div>
                                                        <span className="text-[11px] text-slate-500 italic">{ev.notes}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 3: KEY CONTACTS DIRECTORY */}
                {/* ========================================================================= */}
                {activeTab === 'contacts' && (
                    <div className="space-y-6">
                        {/* Header & Controls */}
                        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search contacts by name, role, email, phone..."
                                    value={searchContact}
                                    onChange={(e) => setSearchContact(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <button
                                onClick={() => setShowContactModal(true)}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-2xl text-xs font-bold flex items-center gap-2 transition shadow-md shadow-emerald-500/20"
                            >
                                <Plus size={16} /> Add Key Contact
                            </button>
                        </div>

                        {/* Category Pills */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                            {contactCategories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setContactCategoryFilter(cat)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${contactCategoryFilter === cat
                                        ? 'bg-emerald-500 text-slate-950'
                                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                                        }`}
                                >
                                    {cat === 'all' ? 'All Contacts' : cat}
                                </button>
                            ))}
                        </div>

                        {/* Contacts Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredContacts.map(con => (
                                <div
                                    key={con.id}
                                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl space-y-4 flex flex-col justify-between transition-all"
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-800 text-emerald-400 border border-slate-700">
                                                {con.category}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white">{con.name}</h4>
                                            <p className="text-xs text-slate-400">{con.role}</p>
                                            {con.contactPerson && (
                                                <p className="text-xs text-slate-300 font-medium mt-1">
                                                    Lead: {con.contactPerson}
                                                </p>
                                            )}
                                        </div>
                                        {con.notes && (
                                            <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                                                {con.notes}
                                            </p>
                                        )}
                                    </div>

                                    {/* Contact Actions */}
                                    <div className="pt-3 border-t border-slate-800/80 space-y-2">
                                        {con.phone && (
                                            <a
                                                href={`tel:${con.phone}`}
                                                className="flex items-center gap-2 text-xs text-slate-300 hover:text-emerald-400 transition"
                                            >
                                                <Phone size={13} className="text-emerald-500 shrink-0" />
                                                <span>{con.phone}</span>
                                            </a>
                                        )}
                                        {con.email && (
                                            <a
                                                href={`mailto:${con.email}`}
                                                className="flex items-center gap-2 text-xs text-slate-300 hover:text-blue-400 transition truncate"
                                            >
                                                <Mail size={13} className="text-blue-500 shrink-0" />
                                                <span className="truncate">{con.email}</span>
                                            </a>
                                        )}
                                        {con.website && (
                                            <a
                                                href={con.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 transition truncate font-mono"
                                            >
                                                <ExternalLink size={13} className="text-emerald-500 shrink-0" />
                                                <span className="truncate">{con.website.replace('https://', '').replace('http://', '')}</span>
                                            </a>
                                        )}
                                        {con.location && (
                                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                                <MapPin size={13} className="shrink-0" />
                                                <span>{con.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 4: CARD READER & RESULTS HUB */}
                {/* ========================================================================= */}
                {activeTab === 'card_reader' && (
                    <div className="space-y-6">
                        {/* Explanatory Banner */}
                        <div className="p-6 bg-gradient-to-r from-purple-950/40 via-slate-900 to-blue-950/40 border border-purple-500/30 rounded-3xl space-y-3">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                                    <Zap size={18} className="text-purple-400" />
                                    <span>Automated Card Reader Results Workflow (No Manual Typing)</span>
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                    Official Step in Meeting Process
                                </span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
                                Rather than volunteers hand-typing handwritten slips into a computer, our card reader device scans physical track & field cards directly at the finish line / control desk. Results are instantly published to an Excel spreadsheet, verified, linked to a trackside QR code, and formatted for direct Power of 10 submission.
                            </p>
                            <div className="pt-2 flex items-center gap-3 flex-wrap">
                                <button
                                    onClick={handleSimulateCardReader}
                                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 transition"
                                >
                                    <Play size={14} /> Scan Next Card Batch
                                </button>
                                <button
                                    onClick={() => handleGeneratePo10('vets')}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-2 border border-slate-700 transition"
                                >
                                    <Download size={14} /> Export to Power of 10
                                </button>
                            </div>
                        </div>

                        {/* Card Reader Live Ingest Table */}
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <FileText size={16} className="text-emerald-400" />
                                    Card Reader Ingest Stream (Live Excel Mapping)
                                </h3>
                                <span className="text-xs font-mono text-emerald-400 font-bold">
                                    Status: Connected & Ready
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-950/40">
                                            <th className="p-3">Card ID</th>
                                            <th className="p-3">Event</th>
                                            <th className="p-3">Athlete</th>
                                            <th className="p-3">Club</th>
                                            <th className="p-3">Bib</th>
                                            <th className="p-3">Perf</th>
                                            <th className="p-3">Pos</th>
                                            <th className="p-3">Points</th>
                                            <th className="p-3">Wind</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60 font-mono">
                                        {(cardReaderBatch ? cardReaderBatch.records : [
                                            { id: 'CR-101', event: '100m A', athlete: 'Marcus Vance', club: 'Hillingdon AC', bib: 'H14', perf: '11.42s', pos: 1, points: 9, wind: '+0.8' },
                                            { id: 'CR-102', event: '100m A', athlete: 'Tyler Smith', club: 'Thames Valley Harriers', bib: 'T08', perf: '11.68s', pos: 2, points: 7, wind: '+0.8' },
                                            { id: 'CR-103', event: '100m A', athlete: 'Liam Clarke', club: 'Herne Hill Harriers', bib: 'H22', perf: '11.95s', pos: 3, points: 6, wind: '+0.8' },
                                            { id: 'CR-104', event: '800m A', athlete: 'Chloe Jenkins', club: 'Hillingdon AC', bib: 'H05', perf: '2:14.30', pos: 1, points: 9, wind: 'N/A' },
                                            { id: 'CR-105', event: '800m A', athlete: 'Emily Watson', club: 'Ealing Southall & Middx', bib: 'E12', perf: '2:16.80', pos: 2, points: 7, wind: 'N/A' },
                                            { id: 'CR-106', event: 'Shot Put', athlete: 'David Miller', club: 'Hillingdon AC', bib: 'H31', perf: '12.45m', pos: 1, points: 9, wind: 'N/A' },
                                            { id: 'CR-107', event: 'Shot Put', athlete: 'George Davies', club: 'British Airways', bib: 'B04', perf: '11.20m', pos: 2, points: 7, wind: 'N/A' }
                                        ]).map((row, idx) => (
                                            <tr key={idx} className="hover:bg-slate-850/60 transition">
                                                <td className="p-3 text-purple-400 font-bold">{row.id}</td>
                                                <td className="p-3 text-white font-sans font-semibold">{row.event}</td>
                                                <td className="p-3 text-emerald-300 font-sans font-bold">{row.athlete}</td>
                                                <td className="p-3 text-slate-400 font-sans">{row.club}</td>
                                                <td className="p-3 text-amber-400">{row.bib}</td>
                                                <td className="p-3 text-white font-bold">{row.perf}</td>
                                                <td className="p-3 text-slate-300">#{row.pos}</td>
                                                <td className="p-3 text-emerald-400 font-bold">+{row.points} pts</td>
                                                <td className="p-3 text-slate-500">{row.wind}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Barcode & QR Code Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
                                <div className="flex items-center gap-2 text-white font-bold text-sm">
                                    <QrCode className="text-emerald-400" size={18} />
                                    <span>Trackside Barcode / QR Code for Live Results</span>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Print this QR code on posters around the clubhouse, grandstand, and reception so athletes and parents can scan to view instant live scores without crowding the results office.
                                </p>
                                <div className="p-6 bg-white rounded-2xl flex flex-col items-center justify-center text-slate-950 space-y-2 shadow-inner">
                                    {/* Generated Visual Barcode & QR Simulator */}
                                    <div className="w-36 h-36 border-4 border-slate-950 p-2 flex flex-col items-center justify-center bg-white">
                                        <div className="grid grid-cols-6 gap-1 w-full h-full p-1 bg-slate-100">
                                            {Array.from({ length: 36 }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`rounded-xs ${i % 2 === 0 || i % 5 === 0 ? 'bg-slate-950' : 'bg-transparent'}`}
                                                ></div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-mono font-bold tracking-widest uppercase">
                                        SCAN FOR LIVE HAC RESULTS
                                    </div>
                                    <div className="text-[9px] text-slate-500">
                                        hillingdonac.co.uk/live-results
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 flex flex-col justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                                        <Printer className="text-blue-400" size={18} />
                                        <span>Print Event Cards & Checklists</span>
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        Rule reminder: Print official track and field event cards and <strong>keep 2 copies</strong> at the control desk. Check that clubhouse printer ink and cardstock are fully stocked.
                                    </p>
                                </div>

                                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400">Clubhouse Printer Ink:</span>
                                        <span className="text-emerald-400 font-bold font-mono">85% Toner (Good)</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400">Cardstock & A4 Paper:</span>
                                        <span className="text-emerald-400 font-bold font-mono">5 Reams Checked</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400">Card Dual Copies:</span>
                                        <span className="text-blue-400 font-bold font-mono">Generated & Stored</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => window.print()}
                                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition"
                                >
                                    <Printer size={14} /> Print Event Cards (2 Copies)
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 5: AGENT AUDIT LOGS */}
                {/* ========================================================================= */}
                {activeTab === 'agent_logs' && (
                    <div className="space-y-4">
                        <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Bot size={18} className="text-emerald-400" />
                                    Autonomous Agent Live Audit Log
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Real-time activity trail and automated decisions made by YDL, Alder Valley, and VETS background agents.
                                </p>
                            </div>

                            <button
                                onClick={handleRunAudit}
                                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                            >
                                <Play size={12} /> Trigger Instant Audit Cycle
                            </button>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden divide-y divide-slate-800/60 font-mono text-xs">
                            {agentLogs.map((log) => {
                                const isSuccess = log.type === 'success';
                                const isWarning = log.type === 'warning';
                                const isError = log.type === 'error';

                                return (
                                    <div key={log.id} className="p-3.5 flex items-start gap-3 hover:bg-slate-850/40 transition">
                                        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${isSuccess ? 'bg-emerald-500' : isWarning ? 'bg-amber-400' : isError ? 'bg-rose-500' : 'bg-blue-400'
                                            }`}></span>
                                        <div className="flex-1 space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white">{log.agentName}</span>
                                                <span className="text-[10px] text-slate-500">
                                                    {new Date(log.timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <p className={`text-xs ${isSuccess ? 'text-emerald-300' : isWarning ? 'text-amber-300' : isError ? 'text-rose-300' : 'text-slate-300'
                                                }`}>
                                                {log.message}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>

            {/* ========================================================================= */}
            {/* MODALS */}
            {/* ========================================================================= */}

            {/* Modal 1: 2-Week Notice Letter */}
            {showNoticeModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Mail size={16} className="text-blue-400" />
                                Official 2-Week Notice Letter to Club Managers
                            </h3>
                            <button
                                onClick={() => setShowNoticeModal(false)}
                                className="text-slate-400 hover:text-white text-xs font-bold"
                            >
                                Close
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {noticeLetterText}
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(noticeLetterText);
                                    setCopiedNotice(true);
                                    setTimeout(() => setCopiedNotice(false), 2000);
                                }}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
                            >
                                {copiedNotice ? <Check size={14} /> : <Copy size={14} />}
                                {copiedNotice ? 'Copied to Clipboard!' : 'Copy Letter Text'}
                            </button>
                            <button
                                onClick={() => setShowNoticeModal(false)}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal 2: Power of 10 Submission File */}
            {showPo10Modal && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Download size={16} className="text-rose-400" />
                                Power of 10 Official Results Submission Format
                            </h3>
                            <button
                                onClick={() => setShowPo10Modal(false)}
                                className="text-slate-400 hover:text-white text-xs font-bold"
                            >
                                Close
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed">
                            {po10Text}
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            <button
                                onClick={() => {
                                    const blob = new Blob([po10Text], { type: 'text/plain' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `HAC_Meet_Results_PowerOf10.txt`;
                                    a.click();
                                }}
                                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
                            >
                                <Download size={14} /> Download Submission File (.txt)
                            </button>
                            <button
                                onClick={() => setShowPo10Modal(false)}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal 3: Agent Audit Report */}
            {showAuditModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Bot size={18} className="text-emerald-400" />
                                Autonomous Agent Audit Report
                            </h3>
                            <button
                                onClick={() => setShowAuditModal(false)}
                                className="text-slate-400 hover:text-white text-xs font-bold"
                            >
                                Close
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-4">
                            {auditReport.map((rep) => (
                                <div key={rep.leagueId} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-white text-sm">{rep.leagueName}</h4>
                                        <span className="text-emerald-400 font-mono font-bold text-xs">{rep.readiness}% Ready</span>
                                    </div>
                                    <p className="text-xs text-slate-400">
                                        Day preference: <strong>{rep.dayPreference}</strong> • Coordinator: <em>{rep.coordinator}</em>
                                    </p>
                                    <div className="text-xs text-slate-300">
                                        <strong>Hosting Status:</strong> {rep.hostStatus}
                                    </div>
                                    {rep.criticalPendingCount > 0 ? (
                                        <div className="text-xs text-amber-300 pt-1">
                                            <strong>Critical Tasks Requiring Action ({rep.criticalPendingCount}):</strong>
                                            <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-300 text-[11px]">
                                                {rep.criticalItems.map((ci, idx) => (
                                                    <li key={idx}>{ci}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-emerald-400 font-semibold pt-1">
                                            ✓ All critical items satisfied or on schedule!
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="pt-2 flex justify-end">
                            <button
                                onClick={() => setShowAuditModal(false)}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs"
                            >
                                Acknowledge Audit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal 4: Add Key Contact */}
            {showContactModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] flex flex-col shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Plus size={16} className="text-emerald-400" />
                                Add Key Contact
                            </h3>
                            <button
                                onClick={() => setShowContactModal(false)}
                                className="text-slate-400 hover:text-white text-xs font-bold"
                            >
                                Close
                            </button>
                        </div>

                        <form onSubmit={handleAddContact} className="space-y-3 overflow-y-auto">
                            <div>
                                <label className="text-[11px] font-bold text-slate-400 uppercase">Organization / Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Stacey and Sons / Uxbridge First Aid"
                                    value={newContact.name}
                                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-400 uppercase">Category</label>
                                    <select
                                        value={newContact.category}
                                        onChange={(e) => setNewContact({ ...newContact, category: e.target.value })}
                                        className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                    >
                                        <option value="Stadium Contact">Stadium Contact</option>
                                        <option value="Photo Finish">Photo Finish</option>
                                        <option value="First Aid">First Aid</option>
                                        <option value="Starters & Starter Assistants">Starters & Starter Assistants</option>
                                        <option value="EDM (Electronic Distance)">EDM (Electronic Distance)</option>
                                        <option value="BIBS Supplier">BIBS Supplier</option>
                                        <option value="Officials">Officials</option>
                                        <option value="Meeting Managers & Team Captains">Meeting Managers & Team Captains</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-400 uppercase">Role</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Chief Starter / Supplier"
                                        value={newContact.role}
                                        onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                                        className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-400 uppercase">Lead Person</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. John Doe"
                                        value={newContact.contactPerson}
                                        onChange={(e) => setNewContact({ ...newContact, contactPerson: e.target.value })}
                                        className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-400 uppercase">Phone Number</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 07700 900123"
                                        value={newContact.phone}
                                        onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                                        className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[11px] font-bold text-slate-400 uppercase">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="contact@supplier.com"
                                    value={newContact.email}
                                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-bold text-slate-400 uppercase">Notes & Guidance</label>
                                <textarea
                                    rows={2}
                                    placeholder="Special requirements, pricing, booking lead time..."
                                    value={newContact.notes}
                                    onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowContactModal(false)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-bold"
                                >
                                    Save Contact
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

