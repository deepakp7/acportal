import React, { useState, useEffect } from 'react';
import fallbackData from '../assets/vets_league_2026.json';
import { Activity, ArrowLeft, X } from 'lucide-react';

const PowerOf10Insights = ({ onClose }) => {
    const [database, setDatabase] = useState(null);
    const [selectedAthlete, setSelectedAthlete] = useState(null);
    const [genderFilter, setGenderFilter] = useState('All');
    const [ageFilter, setAgeFilter] = useState('All');

    useEffect(() => {
        setDatabase(fallbackData);
    }, []);

    const getPo10Summary = () => {
        if (!database || !database.po10_results) return [];
        const po10Athletes = {};
        
        database.po10_results.forEach(r => {
            if (genderFilter !== 'All' && r.gender !== genderFilter) return;
            if (ageFilter !== 'All' && r.age_category !== ageFilter) return;
            
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

    if (!database) {
        return (
            <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
                <div className="text-blue-400 animate-pulse text-xl font-bold tracking-widest">LOADING PO10...</div>
            </div>
        );
    }

    const po10Standings = getPo10Summary();

    return (
        <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans p-6 relative">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                            Power of 10 <span className="text-purple-500 italic">Insights</span>
                        </h1>
                        <p className="text-slate-400 font-medium">Club-wide Performance Analytics</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center gap-2 font-bold shadow-xl transition-all"
                    >
                        <ArrowLeft size={16} /> Back to Hub
                    </button>
                </div>

                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800/80 pb-4 gap-4">
                        <div className="flex items-center gap-2">
                            <Activity className="text-purple-400" />
                            <h3 className="text-lg font-bold text-white">Power of 10 Results</h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
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
                                {[...new Set(database.po10_results.map(r => r.age_category))].sort().map(age => (
                                    <option key={age} value={age}>{age}</option>
                                ))}
                            </select>

                            <div className="text-sm font-bold bg-slate-800/80 px-3 py-1.5 rounded-lg text-slate-300">
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
            </div>

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
        </div>
    );
};

export default PowerOf10Insights;
