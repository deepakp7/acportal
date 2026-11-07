import React, { useState } from 'react';
import { X, Info, GitCommit, Calendar, CheckCircle2, Trophy, Bot, Award, Flame, Shield, HelpCircle, Sparkles } from 'lucide-react';
import { APP_VERSION, COMMIT_HASH, BUILD_DATE, CHANGELOG } from '../config/version';

const HelpAboutModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('changelog'); // 'changelog', 'modules', 'about'

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[300] flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-8" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-950">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md">
                            <Trophy size={26} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-black text-white">Hillingdon AC Digital Portal</h2>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    v{APP_VERSION}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                                <span>Build Reference: <strong className="font-mono text-slate-300">{COMMIT_HASH}</strong></span>
                                <span>•</span>
                                <span>Updated: {BUILD_DATE}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Sub-Navigation Tabs */}
                <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 pt-3 gap-2">
                    <button
                        onClick={() => setActiveTab('changelog')}
                        className={`pb-2.5 px-3 font-bold text-xs flex items-center gap-1.5 transition-all border-b-2 ${
                            activeTab === 'changelog'
                                ? 'border-emerald-400 text-emerald-400 bg-emerald-400/5 rounded-t-lg'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <GitCommit size={14} /> Version Changelog
                    </button>
                    <button
                        onClick={() => setActiveTab('modules')}
                        className={`pb-2.5 px-3 font-bold text-xs flex items-center gap-1.5 transition-all border-b-2 ${
                            activeTab === 'modules'
                                ? 'border-emerald-400 text-emerald-400 bg-emerald-400/5 rounded-t-lg'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <Sparkles size={14} /> Modules & System Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('about')}
                        className={`pb-2.5 px-3 font-bold text-xs flex items-center gap-1.5 transition-all border-b-2 ${
                            activeTab === 'about'
                                ? 'border-emerald-400 text-emerald-400 bg-emerald-400/5 rounded-t-lg'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <Info size={14} /> About & Help
                    </button>
                </div>

                {/* Tab 1: Changelog */}
                {activeTab === 'changelog' && (
                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Detailed Release History ({CHANGELOG.length} Recent Updates)
                            </span>
                            <span className="text-[11px] font-mono text-emerald-400">
                                Current Active: {COMMIT_HASH}
                            </span>
                        </div>

                        <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                            {CHANGELOG.map((item, idx) => (
                                <div key={idx} className="relative group">
                                    <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900 group-hover:scale-125 transition-transform" />
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                                                {item.hash}
                                            </span>
                                            <span className="text-xs font-bold text-slate-400">
                                                {item.date}
                                            </span>
                                        </div>
                                        {idx === 0 && (
                                            <span className="text-[10px] uppercase font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                                                Latest Build
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-200 font-medium mt-1 leading-relaxed">
                                        {item.subject}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tab 2: Modules Overview */}
                {activeTab === 'modules' && (
                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar text-xs">
                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                            <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                                <Trophy size={16} /> Power of 10 Insights & Junior EA PB Certificates
                            </h4>
                            <p className="text-slate-400 mt-1">
                                Grades junior track & field personal bests against official England Athletics (March 2026) standards (Levels 1–9). Includes multi-discipline tracking, 201 EA certificate blanks procurement guide, printable certificates, and full 3-sheet downloadable Excel workbook.
                            </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                            <h4 className="font-bold text-cyan-300 text-sm flex items-center gap-2">
                                <Award size={16} /> Meet Manager (YDL, Alder Valley, VETS)
                            </h4>
                            <p className="text-slate-400 mt-1">
                                Complete competition operations hub with autonomous long-running status agents, independent per-meet preparation checklists, master OneDrive documents hub, and live match day weather forecasts.
                            </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                            <h4 className="font-bold text-emerald-300 text-sm flex items-center gap-2">
                                <Bot size={16} /> HACY AI Assistance (RAG Engine)
                            </h4>
                            <p className="text-slate-400 mt-1">
                                Intelligent assistant powered by official UK Athletics rules for competition, England Athletics age category structures, and Arlington time trial performance insights.
                            </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                            <h4 className="font-bold text-purple-300 text-sm flex items-center gap-2">
                                <Shield size={16} /> Paperless Membership & Admin Portal
                            </h4>
                            <p className="text-slate-400 mt-1">
                                Integrated digital joining process, payment processing, membership directory extracts, and management workflows for Hillingdon Athletic Club.
                            </p>
                        </div>
                    </div>
                )}

                {/* Tab 3: About & Help */}
                {activeTab === 'about' && (
                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar text-xs text-slate-300">
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                            <h4 className="font-bold text-white text-sm">Hillingdon Athletic Club</h4>
                            <p className="text-slate-400 leading-relaxed">
                                Hillingdon Athletics Stadium, Gatting Way, Uxbridge, Middlesex, UB8 1ES.
                                Affiliated to England Athletics, South of England AA, and Middlesex County AA.
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                            <h5 className="font-bold text-white">System Information & Support:</h5>
                            <ul className="space-y-1.5 text-slate-400">
                                <li>• Application Version: <strong className="text-white">v{APP_VERSION}</strong></li>
                                <li>• Active Git Build: <strong className="font-mono text-emerald-400">{COMMIT_HASH}</strong></li>
                                <li>• Production Build Date: <strong className="text-white">{BUILD_DATE}</strong></li>
                                <li>• Offline Mode: Enabled with PWA caching</li>
                            </ul>
                        </div>

                        <p className="text-[11px] text-slate-500 italic text-center pt-2">
                            For technical questions or results additions, consult club administrators via the Meet Manager or Admin portal.
                        </p>
                    </div>
                )}

                {/* Footer */}
                <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-xs text-slate-500">
                        Hillingdon Athletic Club • Internal Portal Build
                    </span>
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HelpAboutModal;
