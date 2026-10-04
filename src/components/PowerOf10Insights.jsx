import React, { useState, useEffect } from 'react';
import fallbackData from '../assets/vets_league_2026.json';
import juniorPBsData from '../assets/junior_pbs_2026.json';
import { Activity, ArrowLeft, X, Award, Download, Search, Printer, Calendar, MapPin, Trophy, Sparkles, Filter, CheckCircle2 } from 'lucide-react';

const PowerOf10Insights = ({ onClose }) => {
    const [database, setDatabase] = useState(null);
    const [activeTab, setActiveTab] = useState('presentation'); // 'presentation' or 'rankings'
    const [selectedAthlete, setSelectedAthlete] = useState(null);
    const [certificateAthlete, setCertificateAthlete] = useState(null);
    
    // Rankings tab filters
    const [genderFilter, setGenderFilter] = useState('All');
    const [ageFilter, setAgeFilter] = useState('All');
    const [eventFilter, setEventFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Presentation tab filters
    const [juniorCatFilter, setJuniorCatFilter] = useState('All');
    const [juniorGenderFilter, setJuniorGenderFilter] = useState('All');
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
            if (juniorSearchQuery && !a.name.toLowerCase().includes(juniorSearchQuery.toLowerCase())) return false;
            return true;
        });
    };

    const downloadJuniorCSV = () => {
        if (!juniorPBsData || !juniorPBsData.athletes) return;
        const rows = [
            ['Athlete Name', 'Age Category', 'Gender', 'Event', 'PB / Best Performance', 'Date Achieved', 'Venue', 'Rank / Position']
        ];
        juniorPBsData.athletes.forEach(a => {
            Object.values(a.events).forEach(ev => {
                rows.push([
                    `"${a.name}"`,
                    `"${a.age_group}"`,
                    `"${a.gender}"`,
                    `"${ev.event}"`,
                    `"${ev.performance}"`,
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
        link.setAttribute("download", "HAC_Junior_Presentation_PBs_2026.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
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
                        <p className="text-slate-400 font-medium mt-1">Official Hillingdon AC Rankings & Season Records</p>
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
                                        <Trophy size={18} /> England Athletics PB Certificate Awards
                                    </div>
                                    <h2 className="text-2xl font-black text-white">
                                        Junior Presentation Night 2026
                                    </h2>
                                    <p className="text-slate-300 text-sm mt-1">
                                        Tracking Personal Bests (PBs) across all competitive events during the 2026 Track & Field season (<strong className="text-amber-300">01.04.2026 – 30.09.2026</strong>) for <strong className="text-amber-300">U14, U16, U18, and U20</strong> athletes.
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        onClick={downloadJuniorCSV}
                                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl flex items-center gap-2 font-black shadow-lg transition-all hover:scale-105"
                                    >
                                        <Download size={18} /> Download Certificates CSV
                                    </button>
                                </div>
                            </div>

                            {/* Stat Counters */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
                                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                                    <p className="text-xs font-semibold text-slate-400 uppercase">Qualifying Juniors</p>
                                    <p className="text-2xl font-black text-white mt-1">{juniorPBsData?.total_athletes || 108}</p>
                                    <p className="text-[11px] text-amber-400/80 mt-0.5">U14, U16, U18, U20</p>
                                </div>
                                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                                    <p className="text-xs font-semibold text-slate-400 uppercase">Total Event PBs</p>
                                    <p className="text-2xl font-black text-amber-400 mt-1">{juniorPBsData?.total_pbs || 221}</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Track & Field achievements</p>
                                </div>
                                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                                    <p className="text-xs font-semibold text-slate-400 uppercase">Boys / Men</p>
                                    <p className="text-2xl font-black text-blue-400 mt-1">
                                        {juniorPBsData?.athletes?.filter(a => a.gender === 'Boys/Men').length || 51}
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">117 event PBs</p>
                                </div>
                                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                                    <p className="text-xs font-semibold text-slate-400 uppercase">Girls / Women</p>
                                    <p className="text-2xl font-black text-rose-400 mt-1">
                                        {juniorPBsData?.athletes?.filter(a => a.gender === 'Girls/Women').length || 57}
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">104 event PBs</p>
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
                                    <span className="text-xs font-semibold text-slate-400">Category:</span>
                                    <select
                                        value={juniorCatFilter}
                                        onChange={(e) => setJuniorCatFilter(e.target.value)}
                                        className="bg-slate-800 text-white rounded-xl px-3 py-2 text-sm border border-slate-700 outline-none focus:border-amber-400 transition-colors"
                                    >
                                        <option value="All">All Age Groups (U14-U20)</option>
                                        <option value="U14">U14 (35 athletes)</option>
                                        <option value="U16">U16 (43 athletes)</option>
                                        <option value="U18">U18 (28 athletes)</option>
                                        <option value="U20">U20 (2 athletes)</option>
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
                                    Showing {filteredJuniors.length} of {juniorPBsData?.total_athletes || 108} Athletes
                                </span>
                            </div>
                        </div>

                        {/* Athlete Certificate Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredJuniors.map((ath, idx) => {
                                const eventList = Object.values(ath.events);
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
                                                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                                            {ath.age_group}
                                                        </span>
                                                        <span className="text-xs text-slate-400 font-medium">
                                                            {ath.gender}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setCertificateAthlete(ath)}
                                                    className="p-2 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 rounded-xl transition-all"
                                                    title="Preview Certificate"
                                                >
                                                    <Printer size={16} />
                                                </button>
                                            </div>

                                            {/* PBs achieved */}
                                            <div className="space-y-2 mt-4 pt-3 border-t border-slate-800/80">
                                                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                                                    <span>Event ({eventList.length})</span>
                                                    <span>PB / Date Achieved</span>
                                                </div>
                                                {eventList.map((ev, eIdx) => (
                                                    <div
                                                        key={eIdx}
                                                        className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60"
                                                    >
                                                        <span className="font-bold text-slate-200">{ev.event}</span>
                                                        <div className="text-right">
                                                            <span className="font-mono font-bold text-amber-400">{ev.performance}</span>
                                                            <span className="text-[10px] text-slate-500 block">{ev.date} • {ev.venue}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                                            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                                                <CheckCircle2 size={13} /> EA Certificate Ready
                                            </span>
                                            <button
                                                onClick={() => setCertificateAthlete(ath)}
                                                className="text-amber-400 hover:underline font-bold"
                                            >
                                                View Certificate &rarr;
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* TAB 2: FULL PO10 RANKINGS (EXISTING CLUB VIEW) */}
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
            {certificateAthlete && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[300] flex items-center justify-center p-4" onClick={() => setCertificateAthlete(null)}>
                    <div className="bg-slate-900 border border-amber-500/50 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        {/* Certificate Preview Card */}
                        <div className="p-8 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-center relative border-8 border-double border-amber-500/30 m-4 rounded-2xl">
                            <button
                                onClick={() => setCertificateAthlete(null)}
                                className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800"
                            >
                                <X size={18} />
                            </button>

                            <div className="flex justify-center mb-3">
                                <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-lg">
                                    <Award size={36} />
                                </div>
                            </div>

                            <p className="text-amber-400 uppercase tracking-widest text-xs font-bold">Hillingdon Athletic Club</p>
                            <h2 className="text-2xl font-black text-white mt-1">PERSONAL BEST CERTIFICATE</h2>
                            <p className="text-slate-400 text-xs italic mt-0.5">England Athletics Junior Season 2026</p>

                            <div className="my-6 py-4 border-y border-amber-500/20">
                                <p className="text-slate-400 text-xs uppercase tracking-wider">This is proudly awarded to</p>
                                <h3 className="text-3xl font-black text-amber-300 mt-1">{certificateAthlete.name}</h3>
                                <p className="text-slate-300 font-bold text-sm mt-0.5">Category: {certificateAthlete.age_group} ({certificateAthlete.gender})</p>
                            </div>

                            <p className="text-slate-400 text-xs mb-3">In recognition of outstanding performance and personal bests achieved:</p>

                            <div className="space-y-2 max-h-48 overflow-y-auto px-2">
                                {Object.values(certificateAthlete.events).map((ev, i) => (
                                    <div key={i} className="flex justify-between items-center text-xs py-2 px-4 rounded-xl bg-slate-900 border border-slate-800">
                                        <span className="font-bold text-white text-sm">{ev.event}</span>
                                        <div className="text-right">
                                            <span className="font-mono text-amber-400 font-black text-base">{ev.performance}</span>
                                            <span className="text-[10px] text-slate-500 block">{ev.date} • {ev.venue}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-800 text-[11px] text-slate-500">
                                <span>Presented: Junior Presentation Night 2026</span>
                                <span>England Athletics Club Record</span>
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-between items-center">
                            <span className="text-xs text-slate-400">Ready to print or issue to athlete.</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => window.print()}
                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm flex items-center gap-2"
                                >
                                    <Printer size={16} /> Print Certificate
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
            )}
        </div>
    );
};

export default PowerOf10Insights;
