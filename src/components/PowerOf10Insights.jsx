import React, { useState, useEffect } from 'react';
import fallbackData from '../assets/vets_league_2026.json';
import juniorPBsData from '../assets/junior_pbs_2026.json';
import { Activity, ArrowLeft, X, Award, Download, Search, Printer, Calendar, MapPin, Trophy, Sparkles, Filter, CheckCircle2, FileSpreadsheet, Star, ShoppingCart, Info, Layers, Check } from 'lucide-react';

const PowerOf10Insights = ({ onClose }) => {
    const [database, setDatabase] = useState(null);
    const [activeTab, setActiveTab] = useState('presentation'); // 'presentation' or 'rankings'
    const [selectedAthlete, setSelectedAthlete] = useState(null);
    const [certificateAthlete, setCertificateAthlete] = useState(null);
    const [selectedDisciplineIdx, setSelectedDisciplineIdx] = useState(null); // null = all, number = single discipline index
    const [showProcurementModal, setShowProcurementModal] = useState(false);
    
    // Rankings tab filters
    const [genderFilter, setGenderFilter] = useState('All');
    const [ageFilter, setAgeFilter] = useState('All');
    const [eventFilter, setEventFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Presentation tab filters
    const [juniorCatFilter, setJuniorCatFilter] = useState('All');
    const [juniorGenderFilter, setJuniorGenderFilter] = useState('All');
    const [juniorLevelFilter, setJuniorLevelFilter] = useState('All');
    const [juniorSearchQuery, setJuniorSearchQuery] = useState('');

    useEffect(() => {
        setDatabase(fallbackData);
    }, []);

    const getPo10Summary = () => {
        if (!database || !database.po10_results) return [];
        const po10Athletes = {};
        
        database.po10_results.forEach(r => {
            if (genderFilter !== 'All' && r.gender !== genderFilter) return;
            if (ageFilter !== 'All' && r.age_category !== ageFilter) return;
            if (eventFilter !== 'All' && r.event !== eventFilter) return;
            if (searchQuery && !r.athlete_name.toLowerCase().includes(searchQuery.toLowerCase())) return;
            
            if (!po10Athletes[r.athlete_name]) {
                po10Athletes[r.athlete_name] = {
                    name: r.athlete_name,
                    gender: r.gender,
                    age: r.age_category,
                    performances: 0,
                    best_events: new Set(),
                    results: []
                };
            }
            po10Athletes[r.athlete_name].performances += 1;
            po10Athletes[r.athlete_name].best_events.add(r.event);
            po10Athletes[r.athlete_name].results.push(r);
        });

        return Object.values(po10Athletes).sort((a, b) => b.performances - a.performances);
    };

    const getFilteredJuniors = () => {
        if (!juniorPBsData || !juniorPBsData.athletes) return [];
        return juniorPBsData.athletes.filter(a => {
            if (juniorCatFilter !== 'All' && a.age_group !== juniorCatFilter) return false;
            if (juniorGenderFilter !== 'All' && a.gender !== juniorGenderFilter) return false;
            if (juniorLevelFilter !== 'All') {
                if (juniorLevelFilter === 'L9' && a.highest_level !== 9) return false;
                if (juniorLevelFilter === 'L8' && a.highest_level !== 8) return false;
                if (juniorLevelFilter === 'L7' && a.highest_level !== 7) return false;
                if (juniorLevelFilter === 'L6' && a.highest_level !== 6) return false;
                if (juniorLevelFilter === 'L5' && a.highest_level !== 5) return false;
                if (juniorLevelFilter === 'L4' && a.highest_level !== 4) return false;
                if (juniorLevelFilter === 'L1-3' && (a.highest_level < 1 || a.highest_level > 3)) return false;
                if (juniorLevelFilter === 'Club PB' && a.highest_level !== 0) return false;
            }
            if (juniorSearchQuery && !a.name.toLowerCase().includes(juniorSearchQuery.toLowerCase())) return false;
            return true;
        });
    };

    // Dynamic stats computation
    const athletesList = juniorPBsData?.athletes || [];
    const totalQualifying = juniorPBsData?.total_athletes || athletesList.length || 115;
    const totalPbs = juniorPBsData?.total_pbs || 238;
    const totalEaCerts = juniorPBsData?.total_ea_certificates || 201;
    const totalClubPbs = juniorPBsData?.total_club_pb_certificates || 37;

    const l9Count = juniorPBsData?.level_summary?.['Level 9'] || 13;
    const l78Count = (juniorPBsData?.level_summary?.['Level 7'] || 0) + (juniorPBsData?.level_summary?.['Level 8'] || 0);
    const l46Count = (juniorPBsData?.level_summary?.['Level 4'] || 0) + (juniorPBsData?.level_summary?.['Level 5'] || 0) + (juniorPBsData?.level_summary?.['Level 6'] || 0);
    const l13Count = (juniorPBsData?.level_summary?.['Level 1'] || 0) + (juniorPBsData?.level_summary?.['Level 2'] || 0) + (juniorPBsData?.level_summary?.['Level 3'] || 0);

    const athletesL9 = athletesList.filter(a => a.highest_level === 9).length;
    const athletesL8 = athletesList.filter(a => a.highest_level === 8).length;
    const athletesL7 = athletesList.filter(a => a.highest_level === 7).length;
    const athletesL6 = athletesList.filter(a => a.highest_level === 6).length;
    const athletesL5 = athletesList.filter(a => a.highest_level === 5).length;
    const athletesL4 = athletesList.filter(a => a.highest_level === 4).length;
    const athletesL13 = athletesList.filter(a => a.highest_level >= 1 && a.highest_level <= 3).length;
    const athletesClubPb = athletesList.filter(a => a.highest_level === 0).length;

    const countU14 = athletesList.filter(a => a.age_group === 'U14').length;
    const countU16 = athletesList.filter(a => a.age_group === 'U16').length;
    const countU18 = athletesList.filter(a => a.age_group === 'U18').length;
    const countU20 = athletesList.filter(a => a.age_group === 'U20').length;

    const downloadJuniorCSV = () => {
        if (!juniorPBsData || !juniorPBsData.athletes) return;
        const rows = [
            ['Athlete Name', 'Age Category', 'Gender', 'Event', 'PB Performance', 'EA Award Level', 'Certificate Title', 'Standard Beaten', 'Next Target', 'Date Achieved', 'Venue', 'Rank / Position']
        ];
        juniorPBsData.athletes.forEach(a => {
            Object.values(a.events).forEach(ev => {
                rows.push([
                    `"${a.name}"`,
                    `"${a.age_group}"`,
                    `"${a.gender}"`,
                    `"${ev.event}"`,
                    `"${ev.performance}"`,
                    `"${ev.level_str || ('Level ' + ev.level)}"`,
                    `"${ev.cert_title || 'EA PB Certificate'}"`,
                    `"${ev.standard_achieved || '-'}"`,
                    `"${ev.next_target || '-'}"`,
                    `"${ev.date}"`,
                    `"${ev.venue}"`,
                    `"${ev.position || '-'}"`
                ]);
            });
        });
        const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "HAC_Junior_EA_PB_Certificates_2026.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const getLevelBadge = (level) => {
        if (level === 9) {
            return {
                bg: "bg-amber-400 text-slate-950 font-black border border-amber-300 shadow-md",
                text: "Level 9 🏆",
                desc: "Highest National Grade Standard"
            };
        }
        if (level >= 7) {
            return {
                bg: "bg-purple-500/20 text-purple-300 font-black border border-purple-400/40",
                text: `Level ${level} ⭐`,
                desc: "County / Regional Standard"
            };
        }
        if (level >= 4) {
            return {
                bg: "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/30",
                text: `Level ${level}`,
                desc: "Development Standard"
            };
        }
        if (level >= 1) {
            return {
                bg: "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30",
                text: `Level ${level}`,
                desc: "Club Standard"
            };
        }
        return {
            bg: "bg-slate-800 text-slate-400 font-bold border border-slate-700",
            text: "Club PB",
            desc: "Personal Best Recognition"
        };
    };

    if (!database) {
        return (
            <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
                <div className="text-purple-400 animate-pulse text-xl font-bold tracking-widest">LOADING PO10...</div>
            </div>
        );
    }

    const po10Standings = getPo10Summary();
    const filteredJuniors = getFilteredJuniors();

    return (
        <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans p-6 relative">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[15%] right-[10%] w-[35%] h-[35%] bg-purple-600/10 rounded-full blur-[140px]"></div>
                <div className="absolute bottom-[20%] left-[5%] w-[30%] h-[30%] bg-amber-500/10 rounded-full blur-[140px]"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-black tracking-tight text-white">
                                Power of 10 <span className="text-purple-400 italic">Insights</span>
                            </h1>
                            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-sm">
                                <Sparkles size={12} /> 2026 Fresh Extract
                            </span>
                        </div>
                        <p className="text-slate-400 font-medium mt-1">Official Hillingdon AC Rankings & Junior EA PB Certificates</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center gap-2 font-bold shadow-xl transition-all"
                        >
                            <ArrowLeft size={16} /> Back to Hub
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-slate-800 mb-6 gap-2">
                    <button
                        onClick={() => setActiveTab('presentation')}
                        className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 transition-all border-b-2 ${
                            activeTab === 'presentation'
                                ? 'border-amber-400 text-amber-400 bg-amber-400/5 rounded-t-xl'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <Award size={18} />
                        Junior Presentation Night (EA PB Certificates)
                        <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-full font-mono">
                            {juniorPBsData?.total_athletes || 108} Athletes
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('rankings')}
                        className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 transition-all border-b-2 ${
                            activeTab === 'rankings'
                                ? 'border-purple-400 text-purple-400 bg-purple-400/5 rounded-t-xl'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <Activity size={18} />
                        Full Club Rankings & Events
                        <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-0.5 rounded-full font-mono">
                            {database?.po10_results?.length || 389} Records
                        </span>
                    </button>
                </div>

                {/* TAB 1: JUNIOR PRESENTATION NIGHT */}
                {activeTab === 'presentation' && (
                    <div className="space-y-6">
                        {/* Summary Banner Card */}
                        <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 border border-amber-500/30 rounded-2xl p-6 backdrop-blur-md">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                                <div>
                                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wider mb-1">
                                        <Trophy size={18} /> England Athletics PB Award Standards (March 2026)
                                    </div>
                                    <h2 className="text-2xl font-black text-white">
                                        Junior Presentation Night 2026
                                    </h2>
                                    <p className="text-slate-300 text-sm mt-1 max-w-3xl">
                                        Each athlete's PB achieved during <strong className="text-amber-300">01.04.2026 – 30.09.2026</strong> has been graded against official England Athletics criteria (<strong className="text-amber-300">Level 1 to Level 9</strong>). Download the complete multi-tab spreadsheet to see all individual and overall certificates.
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        onClick={() => setShowProcurementModal(true)}
                                        className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl flex items-center gap-2 font-black shadow-lg transition-all hover:scale-105"
                                    >
                                        <ShoppingCart size={18} /> EA Certificate Order Guide ({totalEaCerts})
                                    </button>
                                    <a
                                        href="/HAC_Junior_EA_PB_Certificates_2026.xlsx"
                                        download="HAC_Junior_EA_PB_Certificates_2026.xlsx"
                                        className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl flex items-center gap-2 font-black shadow-lg transition-all hover:scale-105"
                                    >
                                        <FileSpreadsheet size={18} /> Download Excel Sheet (.xlsx)
                                    </a>
                                    <button
                                        onClick={downloadJuniorCSV}
                                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl flex items-center gap-2 font-black shadow-lg transition-all hover:scale-105"
                                    >
                                        <Download size={18} /> Download CSV
                                    </button>
                                </div>
                            </div>

                            {/* Stat Counters & Level Breakdown */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-white/10">
                                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Qualifying Juniors</p>
                                    <p className="text-2xl font-black text-white mt-0.5">{totalQualifying}</p>
                                    <p className="text-[10px] text-amber-400/80 mt-0.5">U14, U16, U18, U20</p>
                                </div>
                                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Total Event PBs</p>
                                    <p className="text-2xl font-black text-amber-400 mt-0.5">{totalPbs}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Across All Disciplines</p>
                                </div>
                                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-amber-500/40">
                                    <p className="text-[11px] font-semibold text-amber-300 uppercase">Level 9 Awards</p>
                                    <p className="text-2xl font-black text-amber-300 mt-0.5">{l9Count} PBs</p>
                                    <p className="text-[10px] text-amber-400/70 mt-0.5">{athletesL9} Athletes 🏆</p>
                                </div>
                                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-purple-500/30">
                                    <p className="text-[11px] font-semibold text-purple-300 uppercase">Level 7–8 Awards</p>
                                    <p className="text-2xl font-black text-purple-300 mt-0.5">{l78Count} PBs</p>
                                    <p className="text-[10px] text-purple-400/70 mt-0.5">{athletesL7 + athletesL8} Athletes ⭐</p>
                                </div>
                                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-cyan-500/30">
                                    <p className="text-[11px] font-semibold text-cyan-300 uppercase">Level 4–6 Awards</p>
                                    <p className="text-2xl font-black text-cyan-300 mt-0.5">{l46Count} PBs</p>
                                    <p className="text-[10px] text-cyan-400/70 mt-0.5">{athletesL4 + athletesL5 + athletesL6} Athletes</p>
                                </div>
                                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-emerald-500/30">
                                    <p className="text-[11px] font-semibold text-emerald-300 uppercase">Level 1–3 Awards</p>
                                    <p className="text-2xl font-black text-emerald-300 mt-0.5">{l13Count} PBs</p>
                                    <p className="text-[10px] text-emerald-400/70 mt-0.5">{athletesL13} Athletes</p>
                                </div>
                            </div>
                        </div>

                        {/* Search & Filter Bar */}
                        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                            <div className="relative flex-grow max-w-md">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search junior athlete by name..."
                                    value={juniorSearchQuery}
                                    onChange={(e) => setJuniorSearchQuery(e.target.value)}
                                    className="w-full bg-slate-800 text-white rounded-xl pl-10 pr-4 py-2 text-sm border border-slate-700 outline-none focus:border-amber-400 transition-colors placeholder:text-slate-500"
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-slate-400">Award Level:</span>
                                    <select
                                        value={juniorLevelFilter}
                                        onChange={(e) => setJuniorLevelFilter(e.target.value)}
                                        className="bg-slate-800 text-white rounded-xl px-3 py-2 text-sm border border-slate-700 outline-none focus:border-amber-400 transition-colors cursor-pointer"
                                    >
                                        <option value="All">All Levels</option>
                                        <option value="L9">Level 9 ({athletesL9} athletes)</option>
                                        <option value="L8">Level 8 ({athletesL8} athletes)</option>
                                        <option value="L7">Level 7 ({athletesL7} athletes)</option>
                                        <option value="L6">Level 6 ({athletesL6} athletes)</option>
                                        <option value="L5">Level 5 ({athletesL5} athletes)</option>
                                        <option value="L4">Level 4 ({athletesL4} athletes)</option>
                                        <option value="L1-3">Level 1–3 ({athletesL13} athletes)</option>
                                        <option value="Club PB">Club PB ({athletesClubPb} athletes)</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-slate-400">Category:</span>
                                    <select
                                        value={juniorCatFilter}
                                        onChange={(e) => setJuniorCatFilter(e.target.value)}
                                        className="bg-slate-800 text-white rounded-xl px-3 py-2 text-sm border border-slate-700 outline-none focus:border-amber-400 transition-colors"
                                    >
                                        <option value="All">All Ages (U14-U20)</option>
                                        <option value="U14">U14 ({countU14} athletes)</option>
                                        <option value="U16">U16 ({countU16} athletes)</option>
                                        <option value="U18">U18 ({countU18} athletes)</option>
                                        <option value="U20">U20 ({countU20} athletes)</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-slate-400">Gender:</span>
                                    <select
                                        value={juniorGenderFilter}
                                        onChange={(e) => setJuniorGenderFilter(e.target.value)}
                                        className="bg-slate-800 text-white rounded-xl px-3 py-2 text-sm border border-slate-700 outline-none focus:border-amber-400 transition-colors"
                                    >
                                        <option value="All">All Genders</option>
                                        <option value="Boys/Men">Boys / Men</option>
                                        <option value="Girls/Women">Girls / Women</option>
                                    </select>
                                </div>

                                <span className="text-xs font-bold bg-slate-800 text-amber-400 px-3 py-2 rounded-xl border border-slate-700 ml-auto">
                                    Showing {filteredJuniors.length} of {totalQualifying} Athletes
                                </span>
                            </div>
                        </div>

                        {/* Athlete Certificate Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredJuniors.map((ath, idx) => {
                                const eventList = Object.values(ath.events);
                                const highestBadge = getLevelBadge(ath.highest_level);
                                return (
                                    <div
                                        key={idx}
                                        className="bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 shadow-lg transition-all flex flex-col justify-between group"
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors">
                                                        {ath.name}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                                                            {ath.age_group}
                                                        </span>
                                                        <span className="text-xs text-slate-400 font-medium">
                                                            {ath.gender}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Highest Certificate Badge */}
                                                <div className="flex flex-col items-end">
                                                    <span className={`text-xs px-2.5 py-1 rounded-lg ${highestBadge.bg}`}>
                                                        {highestBadge.text}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 mt-0.5">Top Certificate</span>
                                                </div>
                                            </div>

                                            {/* PBs achieved and levels */}
                                            <div className="space-y-2 mt-4 pt-3 border-t border-slate-800/80">
                                                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                                                    <span>Event ({eventList.length})</span>
                                                    <span>PB & EA Award Level</span>
                                                </div>
                                                {eventList.map((ev, eIdx) => {
                                                    const evBadge = getLevelBadge(ev.level);
                                                    return (
                                                        <div
                                                            key={eIdx}
                                                            className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-950/40 border border-slate-800/60"
                                                        >
                                                            <div>
                                                                <span className="font-bold text-slate-200 block">{ev.event}</span>
                                                                <span className="text-[10px] text-slate-500">{ev.date} • {ev.venue}</span>
                                                            </div>
                                                            <div className="text-right flex items-center gap-2">
                                                                <div>
                                                                    <span className="font-mono font-bold text-amber-400 block">{ev.performance}</span>
                                                                    {ev.standard_achieved && ev.standard_achieved !== '-' && (
                                                                        <span className="text-[9px] text-slate-500 block">Std: {ev.standard_achieved}</span>
                                                                    )}
                                                                </div>
                                                                <span className={`text-[10px] px-2 py-0.5 rounded-md ${evBadge.bg}`}>
                                                                    {ev.level_str || ('Level ' + ev.level)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {ath.name === 'Bradley Stone' && (
                                                <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                                                    <span className="font-bold">⭐ Combined Events Exception:</span> Pentathlon scored Level 9 total (2800+ pts).
                                                </div>
                                            )}
                                            {ath.name === 'Sydney Taylor' && (
                                                <div className="mt-3 p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-[11px] text-purple-300">
                                                    <span className="font-bold">✨ Sprints Treble:</span> 100m, 200m & 300m all at Level 9!
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                                            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                                                <CheckCircle2 size={13} /> {eventList.length} Certificate{eventList.length > 1 ? 's' : ''} to Award
                                            </span>
                                            <button
                                                onClick={() => {
                                                    setCertificateAthlete(ath);
                                                    setSelectedDisciplineIdx(null);
                                                }}
                                                className="text-amber-400 hover:underline font-bold flex items-center gap-1"
                                            >
                                                <Printer size={13} /> Preview Certificates ({eventList.length})
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* TAB 2: FULL PO10 RANKINGS */}
                {activeTab === 'rankings' && (
                    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 space-y-6">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-slate-800/80 pb-4 gap-4">
                            <div className="flex items-center gap-2">
                                <Activity className="text-purple-400" />
                                <h3 className="text-lg font-bold text-white whitespace-nowrap">Club Rankings 2026</h3>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                <input 
                                    type="text"
                                    placeholder="Search by name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-slate-800 text-white rounded-lg px-3 py-1.5 text-sm border border-slate-700 outline-none focus:border-purple-500 transition-colors flex-grow lg:flex-grow-0 lg:w-48 placeholder:text-slate-500"
                                />
                                
                                <select 
                                    value={genderFilter} 
                                    onChange={(e) => setGenderFilter(e.target.value)}
                                    className="bg-slate-800 text-white rounded-lg px-3 py-1.5 text-sm border border-slate-700 outline-none focus:border-purple-500 transition-colors cursor-pointer"
                                >
                                    <option value="All">All Genders</option>
                                    <option value="Men">Men</option>
                                    <option value="Women">Women</option>
                                </select>
                                
                                <select 
                                    value={ageFilter} 
                                    onChange={(e) => setAgeFilter(e.target.value)}
                                    className="bg-slate-800 text-white rounded-lg px-3 py-1.5 text-sm border border-slate-700 outline-none focus:border-purple-500 transition-colors cursor-pointer"
                                >
                                    <option value="All">All Ages</option>
                                    {[...new Set((database?.po10_results || []).map(r => r.age_category))].sort().map(age => (
                                        <option key={age} value={age}>{age}</option>
                                    ))}
                                </select>

                                <select 
                                    value={eventFilter} 
                                    onChange={(e) => setEventFilter(e.target.value)}
                                    className="bg-slate-800 text-white rounded-lg px-3 py-1.5 text-sm border border-slate-700 outline-none focus:border-purple-500 transition-colors cursor-pointer"
                                >
                                    <option value="All">All Events</option>
                                    {[...new Set((database?.po10_results || []).map(r => r.event))].sort().map(evt => (
                                        <option key={evt} value={evt}>{evt}</option>
                                    ))}
                                </select>

                                <div className="text-sm font-bold bg-slate-800/80 px-3 py-1.5 rounded-lg text-slate-300 ml-auto lg:ml-0">
                                    {po10Standings.length} Athletes
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Object.entries(po10Standings.reduce((acc, a) => {
                                acc[a.age] = acc[a.age] || [];
                                acc[a.age].push(a);
                                return acc;
                            }, {})).sort(([a], [b]) => a.localeCompare(b)).map(([ageGroup, athletes]) => (
                                <div key={ageGroup} className="bg-slate-950/50 border border-purple-800/50 rounded-xl p-4 shadow-lg hover:border-purple-600/50 transition-colors">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-lg font-black text-purple-400">{ageGroup}</h4>
                                        <span className="text-xs font-bold text-slate-500">{athletes.length} athletes</span>
                                    </div>
                                    <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {athletes.sort((a, b) => b.performances - a.performances).map((a, i) => (
                                            <li 
                                                key={i} 
                                                onClick={() => setSelectedAthlete(a)}
                                                className="flex flex-col text-sm border-b border-slate-800/50 pb-2 last:border-0 hover:bg-slate-900/50 p-2 rounded-lg transition-colors cursor-pointer group"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-200 font-bold group-hover:text-purple-400 transition-colors">{a.name}</span>
                                                    <span className="font-mono text-purple-400/80 text-xs text-right font-bold bg-purple-900/20 px-2 py-0.5 rounded">
                                                        {a.performances} perf{a.performances !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1 truncate">
                                                    {Array.from(a.best_events).slice(0, 3).join(', ')}{a.best_events.size > 3 ? '...' : ''}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ATHLETE DRILLDOWN MODAL */}
            {selectedAthlete && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={() => setSelectedAthlete(null)}>
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                            <div>
                                <h2 className="text-2xl font-black text-white">{selectedAthlete.name}</h2>
                                <p className="text-purple-400 font-bold tracking-wide mt-1">{selectedAthlete.age} • {selectedAthlete.gender}</p>
                            </div>
                            <button onClick={() => setSelectedAthlete(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="text-slate-500 border-b border-slate-800">
                                        <th className="pb-3 font-semibold uppercase tracking-wider text-xs">Event</th>
                                        <th className="pb-3 font-semibold uppercase tracking-wider text-xs">Performance</th>
                                        <th className="pb-3 font-semibold uppercase tracking-wider text-xs">Position</th>
                                        <th className="pb-3 font-semibold uppercase tracking-wider text-xs">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {selectedAthlete.results.map((res, idx) => (
                                        <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                                            <td className="py-3 font-medium text-slate-300">{res.event}</td>
                                            <td className="py-3 font-mono text-purple-400 font-bold">{res.performance}</td>
                                            <td className="py-3 text-slate-400">{res.position === 0 ? '-' : res.position}</td>
                                            <td className="py-3 text-slate-500">{res.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* PRINTABLE EA PB CERTIFICATE MODAL */}
            {certificateAthlete && (() => {
                const eventList = Object.values(certificateAthlete.events || {});
                const activeEv = selectedDisciplineIdx !== null ? eventList[selectedDisciplineIdx] : null;
                const activeBadge = activeEv ? getLevelBadge(activeEv.level) : getLevelBadge(certificateAthlete.highest_level);

                return (
                    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[300] flex items-center justify-center p-4 overflow-y-auto" onClick={() => setCertificateAthlete(null)}>
                        <div className="bg-slate-900 border border-amber-500/50 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-8" onClick={e => e.stopPropagation()}>
                            {/* Discipline Tab Selector */}
                            <div className="bg-slate-950 p-3 border-b border-slate-800 flex items-center gap-2 overflow-x-auto custom-scrollbar">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-2 flex items-center gap-1">
                                    <Layers size={13} /> Disciplines:
                                </span>
                                <button
                                    onClick={() => setSelectedDisciplineIdx(null)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                                        selectedDisciplineIdx === null
                                            ? 'bg-amber-400 text-slate-950 shadow-md'
                                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                    }`}
                                >
                                    ⭐ All Disciplines ({eventList.length})
                                </button>
                                {eventList.map((ev, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedDisciplineIdx(idx)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                                            selectedDisciplineIdx === idx
                                                ? 'bg-amber-400 text-slate-950 shadow-md'
                                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                        }`}
                                    >
                                        <span>{ev.event}</span>
                                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${selectedDisciplineIdx === idx ? 'bg-slate-950 text-amber-300' : 'bg-slate-900 text-slate-400'}`}>
                                            {ev.level_str || ('L' + ev.level)}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Certificate Body */}
                            <div className="p-8 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-center relative border-8 border-double border-amber-500/30 m-4 rounded-2xl shadow-inner">
                                <button
                                    onClick={() => setCertificateAthlete(null)}
                                    className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800"
                                >
                                    <X size={18} />
                                </button>

                                <div className="flex justify-center mb-3">
                                    <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-lg">
                                        <Trophy size={36} />
                                    </div>
                                </div>

                                <p className="text-amber-400 uppercase tracking-widest text-xs font-bold">Hillingdon Athletic Club</p>
                                <h2 className="text-2xl font-black text-white mt-1">ENGLAND ATHLETICS PB AWARD</h2>
                                <p className="text-slate-400 text-xs italic mt-0.5">Junior Presentation Night 2026 • Affiliated England Athletics</p>

                                {certificateAthlete.name === 'Bradley Stone' && (
                                    <div className="my-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 max-w-lg mx-auto">
                                        ⭐ <strong>Combined Events Exception:</strong> Bradley Stone competes in Pentathlon scoring Level 9 total (2800+ pts). Individual discipline certificates are also awarded below.
                                    </div>
                                )}

                                <div className="my-5 py-4 border-y border-amber-500/20">
                                    <p className="text-slate-400 text-xs uppercase tracking-wider">This official certificate is proudly awarded to</p>
                                    <h3 className="text-3xl font-black text-amber-300 mt-1">{certificateAthlete.name}</h3>
                                    <p className="text-slate-300 font-bold text-sm mt-0.5">Category: {certificateAthlete.age_group} ({certificateAthlete.gender})</p>
                                </div>

                                {/* View 1: Single Discipline Certificate View */}
                                {activeEv ? (
                                    <div className="space-y-4 my-4 max-w-lg mx-auto">
                                        <div className="p-4 rounded-2xl bg-slate-900/90 border-2 border-amber-500/40 shadow-xl">
                                            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Discipline / Event Awarded</p>
                                            <h4 className="text-2xl font-black text-white mt-1">{activeEv.event}</h4>
                                            
                                            <div className="my-4 flex items-center justify-center gap-4">
                                                <div className="text-center px-4 py-2 bg-slate-950 rounded-xl border border-slate-800">
                                                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Personal Best</p>
                                                    <p className="text-2xl font-black font-mono text-amber-400">{activeEv.performance}</p>
                                                </div>
                                                <div className="text-center px-4 py-2 bg-slate-950 rounded-xl border border-slate-800">
                                                    <p className="text-[10px] text-slate-400 uppercase font-semibold">EA Award Standard</p>
                                                    <p className={`text-base font-black px-3 py-1 rounded-lg mt-0.5 ${activeBadge.bg}`}>
                                                        {activeEv.level_str || ('Level ' + activeEv.level)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-xs text-slate-400 space-y-1 border-t border-slate-800 pt-3">
                                                {activeEv.standard_achieved && activeEv.standard_achieved !== '-' && (
                                                    <p><strong className="text-slate-300">Standard Beaten:</strong> {activeEv.standard_achieved}</p>
                                                )}
                                                <p><strong className="text-slate-300">Achieved:</strong> {activeEv.date} at {activeEv.venue}</p>
                                                <p className="text-[11px] text-amber-400/90 pt-1">
                                                    📝 <strong className="text-amber-300">Ready to write up:</strong> Purchase official EA {activeEv.level_str || ('Level ' + activeEv.level)} certificate blanks & fill in this performance.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* View 2: All Disciplines Summary */
                                    <div>
                                        <p className="text-slate-400 text-xs mb-3 font-semibold">
                                            All {eventList.length} Disciplines & Official Standards Achieved:
                                        </p>
                                        <div className="space-y-2.5 max-h-56 overflow-y-auto px-2 custom-scrollbar">
                                            {eventList.map((ev, i) => {
                                                const evBadge = getLevelBadge(ev.level);
                                                return (
                                                    <div 
                                                        key={i} 
                                                        onClick={() => setSelectedDisciplineIdx(i)}
                                                        className="flex justify-between items-center text-xs py-2 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all"
                                                    >
                                                        <div className="text-left">
                                                            <span className="font-bold text-white text-sm block flex items-center gap-1.5">
                                                                {ev.event}
                                                                <span className="text-[10px] text-amber-400 font-normal">→ view individual cert</span>
                                                            </span>
                                                            <span className="text-[10px] text-slate-500">{ev.date} • {ev.venue}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="flex items-center gap-2 justify-end">
                                                                <span className="font-mono text-amber-400 font-black text-base">{ev.performance}</span>
                                                                <span className={`text-[10px] px-2 py-0.5 rounded-md ${evBadge.bg}`}>
                                                                    {ev.level_str || ('Level ' + ev.level)}
                                                                </span>
                                                            </div>
                                                            {ev.standard_achieved && ev.standard_achieved !== '-' && (
                                                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                                                    Beat standard: {ev.standard_achieved}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500">
                                    <span>Presented: Junior Presentation Night 2026</span>
                                    <span>England Athletics Affiliated Club</span>
                                </div>
                            </div>

                            {/* Action Bar */}
                            <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-between items-center">
                                <span className="text-xs text-slate-400">
                                    {activeEv ? `Certificate for ${activeEv.event}` : `All ${eventList.length} Certificates`} ready to write up or print.
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => window.print()}
                                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm flex items-center gap-2"
                                    >
                                        <Printer size={16} /> Print {activeEv ? activeEv.event : 'Certificates'}
                                    </button>
                                    <button
                                        onClick={() => setCertificateAthlete(null)}
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* EA CERTIFICATES PROCUREMENT & WRITING-UP GUIDE MODAL */}
            {showProcurementModal && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[300] flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowProcurementModal(false)}>
                    <div className="bg-slate-900 border border-purple-500/50 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-950">
                            <div>
                                <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                                    <ShoppingCart size={16} /> Certificate Procurement & Writing Guide
                                </div>
                                <h2 className="text-2xl font-black text-white mt-1">
                                    England Athletics PB Certificates Order Sheet 2026
                                </h2>
                                <p className="text-slate-400 text-sm mt-0.5">
                                    Purchase blank EA certificates online & write them up per discipline for junior presentation night.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowProcurementModal(false)}
                                className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                            {/* Summary Box */}
                            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30">
                                <h3 className="text-base font-bold text-purple-300 flex items-center gap-2">
                                    <Info size={18} /> How PB Certificates Work
                                </h3>
                                <ul className="text-xs text-slate-300 mt-2 space-y-1.5 list-disc list-inside">
                                    <li><strong className="text-white">One Certificate Per Discipline:</strong> Each athlete receives an EA certificate for <em>each discipline</em> they competed in (e.g. Sprints, Throws, Jumps, Endurance).</li>
                                    <li><strong className="text-white">Bradley Stone Exception:</strong> Bradley competes in Pentathlon / Combined Events, scoring a <strong>Level 9 total</strong> (2800+ pts) across his events.</li>
                                    <li><strong className="text-white">Sydney Taylor 300m:</strong> Includes her standout 300m performance (39.84s, Level 9) alongside 100m and 200m.</li>
                                    <li><strong className="text-white">Purchase & Write Up:</strong> The club purchases official blank EA certificate packs from England Athletics and volunteers write up the name, discipline, performance, and standard.</li>
                                </ul>
                            </div>

                            {/* Purchase Count Table */}
                            <div>
                                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                                    Official EA Blank Certificates Required to Purchase: <span className="text-amber-400 font-black">{totalEaCerts} Total</span>
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                    {[9, 8, 7, 6, 5, 4, 3, 2, 1].map(lvl => {
                                        const count = juniorPBsData?.level_summary?.[`Level ${lvl}`] || 0;
                                        const badge = getLevelBadge(lvl);
                                        return (
                                            <div key={lvl} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                                                <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${badge.bg}`}>
                                                    Level {lvl}
                                                </span>
                                                <p className="text-2xl font-black text-white mt-1.5">{count}</p>
                                                <p className="text-[10px] text-slate-400 uppercase font-semibold">Certificates to buy</p>
                                            </div>
                                        );
                                    })}
                                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                                        <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-slate-800 text-slate-400">
                                            Club PB
                                        </span>
                                        <p className="text-2xl font-black text-slate-300 mt-1.5">{totalClubPbs}</p>
                                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Club recognition</p>
                                    </div>
                                </div>
                            </div>

                            {/* Instruction Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                                    <h5 className="font-bold text-white text-sm">📥 Master Writing-Up Spreadsheet</h5>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Sheet 3 of the downloaded Excel workbook has the complete roster sorted by level and discipline for volunteers to write up certificates.
                                    </p>
                                    <a
                                        href="/HAC_Junior_EA_PB_Certificates_2026.xlsx"
                                        download="HAC_Junior_EA_PB_Certificates_2026.xlsx"
                                        className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
                                    >
                                        <FileSpreadsheet size={14} /> Download Excel Roster (Sheet 3)
                                    </a>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                                    <h5 className="font-bold text-white text-sm">🛒 England Athletics Blank Certificates</h5>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Order packs of EA blank certificates directly from the England Athletics club shop, available for all junior award levels.
                                    </p>
                                    <span className="mt-3 inline-block text-xs text-amber-400 font-bold">
                                        201 Official EA Blanks + 37 Club PB Blanks
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-2">
                            <button
                                onClick={() => setShowProcurementModal(false)}
                                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PowerOf10Insights;
