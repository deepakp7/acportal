import React, { useState } from 'react';
import HacyChatbot from './HacyChatbot';
import { Bot, X, MessageSquare, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HacyFloatingWidget() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Floating Trigger Button */}
            <div className="fixed bottom-6 right-6 z-50">
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className="group flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 text-white rounded-full shadow-2xl shadow-emerald-500/30 border border-white/20 hover:shadow-emerald-500/50 transition-all duration-300"
                        title="Chat with HACY (AI Assistant)"
                    >
                        <div className="relative">
                            <Bot size={24} className="group-hover:rotate-12 transition-transform duration-300" />
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping" />
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
                        </div>
                        <div className="text-left hidden sm:block">
                            <div className="text-xs font-black tracking-tight leading-none flex items-center gap-1">
                                HACY <Sparkles size={11} className="text-amber-300" />
                            </div>
                            <div className="text-[10px] text-emerald-100 font-medium">
                                Club RAG Assistant
                            </div>
                        </div>
                    </motion.button>
                )}
            </div>

            {/* Slide-over / Modal Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className="w-full max-w-4xl h-[90vh] bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col relative"
                        >
                            {/* Floating Close Button */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 z-40 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                                title="Close HACY"
                            >
                                <X size={18} />
                            </button>

                            <HacyChatbot embedded={true} onClose={() => setIsOpen(false)} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
