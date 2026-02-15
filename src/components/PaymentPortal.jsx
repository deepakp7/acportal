import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle2, ShieldCheck, ArrowRight, Zap, Info } from 'lucide-react';
import { gocardlessService } from '../services/gocardlessService';

export default function PaymentPortal({ athleteData, onComplete }) {
    const [status, setStatus] = useState('idle'); // idle, loading, redirecting, success
    const [error, setError] = useState(null);

    const handleSetupDirectDebit = async () => {
        setStatus('loading');
        try {
            const flow = await gocardlessService.createRedirectFlow(athleteData);
            setStatus('redirecting');
            // In a real app, you'd redirect: window.location.href = flow.redirect_url;
            console.log('Redirecting to:', flow.redirect_url);

            // Simulating a successful return from redirect
            setTimeout(async () => {
                const result = await gocardlessService.completeRedirectFlow(flow.id);
                if (result.status === 'success') {
                    setStatus('success');
                    if (onComplete) onComplete(result.mandate_id);
                }
            }, 2000);
        } catch (err) {
            setError('Failed to initiate payment setup. Please try again.');
            setStatus('idle');
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-6 border border-emerald-500/20">
                            <Zap size={14} /> Secure Billing
                        </div>
                        <h2 className="text-3xl font-black tracking-tight mb-2">Setup Direct Debit</h2>
                        <p className="text-slate-400 font-medium">Powering Hillingdon AC payments via GoCardless Sandbox</p>
                    </div>
                </div>

                <div className="p-8">
                    {status === 'success' ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-10"
                        >
                            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Setup Complete!</h3>
                            <p className="text-slate-500 mb-8 font-medium">Your Direct Debit mandate has been successfully created.</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
                            >
                                Return to Dashboard
                            </button>
                        </motion.div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Athlete</p>
                                    <p className="font-bold text-slate-900">{athleteData.name}</p>
                                    <p className="text-xs text-slate-500">{athleteData.email}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Billing Method</p>
                                    <p className="font-bold text-slate-900">Direct Debit</p>
                                    <p className="text-xs text-slate-500">GoCardless Sandbox</p>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
                                <Info className="text-blue-500 shrink-0" size={20} />
                                <div className="text-sm text-blue-700 leading-relaxed font-medium">
                                    Direct Debit is the most secure way to pay. You are protected by the <strong>Direct Debit Guarantee</strong>.
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600 font-bold text-center">
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleSetupDirectDebit}
                                disabled={status !== 'idle'}
                                className={cn(
                                    "w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all",
                                    status === 'idle' ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                )}
                            >
                                {status === 'idle' ? (
                                    <>Setup Now <ArrowRight size={18} /></>
                                ) : (
                                    <>Connecting... <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Zap size={18} /></motion.div></>
                                )}
                            </button>

                            <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest pt-4">
                                <ShieldCheck size={14} /> Encrypted & Secure Sandbox Environment
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function cn(...inputs) {
    return inputs.filter(Boolean).join(' ');
}
