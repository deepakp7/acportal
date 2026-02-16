import React, { useState } from 'react';
import MembershipPortal from './components/MembershipPortal';
import MembershipForm from './components/MembershipForm';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserPlus,
    LayoutDashboard,
    ShieldCheck,
    ArrowRight,
    Zap,
    Users,
    ChevronRight,
    Star
} from 'lucide-react';

const LandingPage = ({ onSelect }) => {
    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col justify-center items-center p-6 font-sans">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl w-full text-center relative z-10"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-widest mb-8">
                    <Zap size={14} /> The Future of Membership
                </div>

                <img
                    src="/logo.png"
                    alt="HAC Logo"
                    className="h-24 w-auto mx-auto mb-10 object-contain drop-shadow-2xl"
                />

                <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[0.9]">
                    Hillingdon AC <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500 italic">
                        Digital Experience
                    </span>
                </h1>

                <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium">
                    A frictionless, paperless application process and an integrated athlete dashboard for the premier athletic club in North West London.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <button
                        onClick={() => onSelect('register')}
                        className="group flex flex-col items-center p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-emerald-500 hover:border-emerald-400 transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_40px_rgba(16,185,129,0.2)]"
                    >
                        <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 text-emerald-400 group-hover:bg-white/20 group-hover:text-white transition-colors">
                            <UserPlus size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-white">Join the Club</h3>
                        <p className="text-sm text-slate-500 group-hover:text-emerald-50/70">Integrated membership application form.</p>
                        <ArrowRight className="mt-6 text-emerald-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all group-hover:text-white" />
                    </button>

                    <button
                        onClick={() => onSelect('member')}
                        className="group flex flex-col items-center p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-blue-600 hover:border-blue-400 transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_40px_rgba(37,99,235,0.2)]"
                    >
                        <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 text-blue-400 group-hover:bg-white/20 group-hover:text-white transition-colors">
                            <LayoutDashboard size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-white">Member Portal</h3>
                        <p className="text-sm text-slate-500 group-hover:text-blue-50/70">Dashboard for current & new athletes.</p>
                        <ArrowRight className="mt-6 text-blue-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all group-hover:text-white" />
                    </button>

                    <button
                        onClick={() => onSelect('admin')}
                        className="group flex flex-col items-center p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-slate-700 hover:border-slate-500 transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
                    >
                        <div className="w-16 h-16 bg-slate-500/20 rounded-2xl flex items-center justify-center mb-6 text-slate-400 group-hover:bg-white/20 group-hover:text-white transition-colors">
                            <ShieldCheck size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-white">Admin Management</h3>
                        <p className="text-sm text-slate-500 group-hover:text-slate-50/70">End-to-end workflow management.</p>
                        <ArrowRight className="mt-6 text-slate-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all group-hover:text-white" />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-8 pt-8 border-t border-white/5 opacity-50">
                    <div className="flex items-center gap-2">
                        <Star className="text-emerald-400" size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">Paperless</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="text-emerald-400" size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">Integrated</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap className="text-emerald-400" size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">Real-time</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const App = () => {
    const [view, setView] = useState('landing');

    const handleBackToLanding = () => setView('landing');

    return (
        <div className="font-sans">
            {view === 'landing' && <LandingPage onSelect={setView} />}

            {view === 'register' && (
                <div className="relative">
                    <button
                        onClick={handleBackToLanding}
                        className="absolute top-6 left-6 z-[100] px-4 py-2 bg-slate-900 text-white rounded-xl flex items-center gap-2 text-sm font-bold shadow-xl hover:bg-slate-800"
                    >
                        <ArrowRight className="rotate-180" size={16} /> Close Form
                    </button>
                    <MembershipForm />
                </div>
            )}

            {view === 'member' && (
                <div className="relative">
                    <button
                        onClick={handleBackToLanding}
                        className="absolute bottom-6 right-6 z-[100] px-4 py-2 bg-slate-900 text-white rounded-xl flex items-center gap-2 text-sm font-bold shadow-xl hover:bg-slate-800"
                    >
                        <ArrowRight className="rotate-180" size={16} /> Back to Hub
                    </button>
                    <MembershipPortal userType="juniors" />
                </div>
            )}

            {view === 'admin' && (
                <div className="relative">
                    <button
                        onClick={handleBackToLanding}
                        className="absolute bottom-6 right-6 z-[100] px-4 py-2 bg-emerald-600 text-white rounded-xl flex items-center gap-2 text-sm font-bold shadow-xl hover:bg-emerald-700"
                    >
                        <ArrowRight className="rotate-180" size={16} /> Back to Hub
                    </button>
                    <MembershipPortal userType="management" />
                </div>
            )}
        </div>
    );
};

export default App;
