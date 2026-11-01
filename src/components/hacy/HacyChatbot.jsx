import React, { useState, useEffect, useRef } from 'react';
import { hacyRagService } from '../../services/hacyRagEngine';
import { hacyModelService } from '../../services/hacyModelService';
import HacyAdminAssist from './HacyAdminAssist';
import HacyModelSettingsModal from './HacyModelSettingsModal';
import {
    Bot,
    User,
    Send,
    Mic,
    MicOff,
    Volume2,
    VolumeX,
    Sparkles,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    BookOpen,
    Mail,
    RefreshCw,
    ExternalLink,
    ChevronDown,
    ChevronUp,
    ArrowRight,
    Award,
    Activity,
    CreditCard,
    Calendar,
    Users,
    CloudSun,
    MapPin,
    Cpu,
    RotateCcw,
    Trophy,
    CheckSquare,
    Zap,
    Tag,
    Folder
} from 'lucide-react';

const STORAGE_CHAT_MESSAGES = 'hacy_chat_active_messages';

const DEFAULT_WELCOME_MESSAGE = {
    id: 'welcome',
    sender: 'bot',
    timestamp: new Date().toISOString(),
    content: {
        isFallback: false,
        content: `### 👋 Hi, I'm **HACY**!
I'm your **Hillingdon Athletic Club Intelligent Assistant**, connected directly to our verified **RAG Knowledge Base**.

I can answer questions regarding:
- 🏆 **Meet Management & Checklists** (Pre-meet, during-meet, post-meet checklists for YDL, Alder Valley, VETS League, dates, Stacey & Sons bibs, card reader results).
- ⚖️ **EA Age Group Changes & UKA Rules** (New 2026 U14/U16/U18 age groups, school year DOB mapping, implement weights, hurdle specs, distance limits).
- 🌤️ **Live Weather & Track Conditions** (Real-time Uxbridge station temperature, rain probability, wind, spike advice, cancellation policy).
- 📋 **Club Membership & Renewals** (Junior & Senior processes, England Athletics URNs, GoCardless direct debit, fee tiers).
- 🏃 **Athlete & Training Scores** (Arlington Drive 0.45m time trials, Junior EA PB awards, Southern Vets League results).
- 🏟️ **Training Schedules & Coaches** (Track sessions, age group academy times, coaches).
- ℹ️ **General Enquiries & Facilities** (Gatting Way parking, spike lengths, club kit, volunteering, nutrition, benchmarks).

*If I don't have a verified record to answer your query, I will guide you on the exact next steps and connect you with the appropriate club secretary or coaching contact.*`
    }
};

const SUGGESTED_QUERIES = [
    { label: "Meet Prep Checklist", query: "What is on the checklist of items we need to do before the meet for YDL, Alder Valley, and VETS?", icon: CheckSquare },
    { label: "Document & Result Archive", query: "Where can I find the official scoring templates, blank event cards, and historical meet results from previous years?", icon: Folder },
    { label: "Bibs & Stacey and Sons", query: "Who supplies our race bibs and how do we place an order?", icon: Tag },
    { label: "Meet Dates & Michael Illing", query: "What days of the week are YDL and VETS held, and who confirms the dates?", icon: Trophy },
    { label: "Card Reader Results Workflow", query: "How does the card reader record results during the meeting?", icon: Zap },
    { label: "New EA Age Groups (2026)", query: "What are the new England Athletics age groups and why did they change?", icon: BookOpen },
    { label: "UKA Shot & Hurdle Rules", query: "What weight shot put does an under 14 boy throw under UKA rules?", icon: ShieldCheck },
    { label: "Track Weather (Uxbridge)", query: "What is the live weather and track condition at Hillingdon Athletics Stadium?", icon: CloudSun },
    { label: "Bradley Stone PB Awards", query: "What are Bradley Stone's junior PB awards and high jump score?", icon: Award },
    { label: "Zoe Dobbs Arlington Trial", query: "What are Zoe Dobbs' Arlington Drive time trial scores?", icon: Activity },
    { label: "Stadium Parking & Address", query: "Where is Hillingdon Athletics Stadium and what are the parking rules?", icon: MapPin },
    { label: "Junior Membership Renewal", query: "How does the junior membership renewal process work?", icon: Users },
    { label: "GoCardless Direct Debit", query: "How do track fees and GoCardless direct debit payments work?", icon: CreditCard }
];

export default function HacyChatbot({ onClose, embedded = false }) {
    const [messages, setMessages] = useState(() => {
        try {
            const saved = sessionStorage.getItem(STORAGE_CHAT_MESSAGES);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {
            console.warn('Could not restore chat messages:', e);
        }
        return [DEFAULT_WELCOME_MESSAGE];
    });

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [adminMode, setAdminMode] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [ttsEnabled, setTtsEnabled] = useState(false);
    const [expandedSources, setExpandedSources] = useState({});
    const [isModelModalOpen, setIsModelModalOpen] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Save active chat messages to sessionStorage so refresh doesn't wipe conversation
    useEffect(() => {
        try {
            sessionStorage.setItem(STORAGE_CHAT_MESSAGES, JSON.stringify(messages));
        } catch (e) {
            console.warn('Could not persist chat messages:', e);
        }
    }, [messages]);

    const handleResetChat = () => {
        setMessages([DEFAULT_WELCOME_MESSAGE]);
        try {
            sessionStorage.removeItem(STORAGE_CHAT_MESSAGES);
        } catch (e) {
            console.warn('Could not clear chat messages:', e);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Speech-to-text setup using Web Speech API if supported
    const handleToggleSpeech = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Speech recognition is not supported in this browser.');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!isListening) {
            try {
                const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = false;
                recognition.lang = 'en-GB';

                recognition.onstart = () => setIsListening(true);
                recognition.onend = () => setIsListening(false);
                recognition.onerror = () => setIsListening(false);

                recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    setInput(transcript);
                    handleSend(transcript);
                };

                recognition.start();
            } catch (err) {
                console.error(err);
                setIsListening(false);
            }
        } else {
            setIsListening(false);
        }
    };

    // Text-to-speech speaker
    const speakText = (text) => {
        if (!ttsEnabled || !('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        // Strip markdown formatting for cleaner speech
        const plainText = text.replace(/[*#`_\[\]|]/g, ' ').replace(/\s+/g, ' ');
        const utterance = new SpeechSynthesisUtterance(plainText);
        utterance.lang = 'en-GB';
        window.speechSynthesis.speak(utterance);
    };

    const handleSend = async (customQuery = null) => {
        const queryText = (customQuery || input).trim();
        if (!queryText || isLoading) return;

        const userMsg = {
            id: 'msg_' + Date.now(),
            sender: 'user',
            text: queryText,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Process query through HACY RAG Engine
            const response = await hacyRagService.answerQuery(queryText);

            const botMsg = {
                id: response.id,
                sender: 'bot',
                timestamp: response.timestamp,
                confidence: response.confidence,
                sources: response.sources,
                content: response.message
            };

            setMessages(prev => [...prev, botMsg]);

            if (ttsEnabled) {
                if (response.message.isFallback) {
                    speakText("I was unable to find that record in the database. Please check our official contact emails.");
                } else {
                    speakText(response.message.content);
                }
            }
        } catch (error) {
            console.error('Error generating HACY answer:', error);
            const errorMsg = {
                id: 'err_' + Date.now(),
                sender: 'bot',
                timestamp: new Date().toISOString(),
                content: {
                    isFallback: true,
                    title: "HACY Advisory: Service Notice",
                    summary: "An error occurred while connecting to the RAG knowledge index.",
                    actionableSteps: [
                        "Please check your network connection and reload the portal.",
                        "If you need immediate assistance with membership or fees, please email our membership team."
                    ],
                    contactEmail: "membership@hillingdonac.co.uk",
                    contactDepartments: [
                        { name: "Membership Secretary", email: "membership@hillingdonac.co.uk", scope: "Membership & EA queries" }
                    ]
                }
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEscalateQuery = (queryText) => {
        hacyRagService.logQuery({
            id: 'esc_' + Date.now(),
            query: queryText,
            status: 'unanswered',
            confidence: 0,
            timestamp: new Date().toISOString(),
            sourcesCount: 0
        });
        alert(`Your query has been escalated to the Club Admin Assist queue. Martin S or the coaching team will review it.`);
    };

    const toggleSourceExpansion = (msgId) => {
        setExpandedSources(prev => ({
            ...prev,
            [msgId]: !prev[msgId]
        }));
    };

    // If Admin mode is toggled, switch view to Admin Supervision Hub
    if (adminMode) {
        return <HacyAdminAssist onBackToChat={() => setAdminMode(false)} />;
    }

    return (
        <div className={`flex flex-col bg-slate-950 text-slate-100 font-sans ${embedded ? 'h-full rounded-2xl border border-slate-800' : 'min-h-screen'}`}>
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-30 shadow-md">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                            <Bot size={24} />
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-950 rounded-full" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-extrabold text-white tracking-tight">HACY</h2>
                            <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full">
                                RAG Active
                            </span>
                        </div>
                        <p className="text-xs text-slate-400">
                            Hillingdon AC Intelligence • Membership & Scores
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Reset / New Chat */}
                    <button
                        onClick={handleResetChat}
                        className="p-2.5 rounded-xl border bg-slate-800 border-slate-700 text-slate-400 hover:text-white transition"
                        title="Start New Chat Session"
                    >
                        <RotateCcw size={16} />
                    </button>

                    {/* Text to speech toggle */}
                    <button
                        onClick={() => setTtsEnabled(!ttsEnabled)}
                        className={`p-2.5 rounded-xl border transition ${
                            ttsEnabled
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                        title={ttsEnabled ? "Disable Voice Audio" : "Enable Voice Audio"}
                    >
                        {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    </button>

                    {/* Plug In AI Model (SLM) Button */}
                    <button
                        onClick={() => setIsModelModalOpen(true)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
                            hacyModelService.isConfigured()
                                ? 'bg-purple-600/20 border-purple-500/50 text-purple-200 shadow-sm'
                                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                        }`}
                        title="Plug in Free Small Language Models (Groq, OpenRouter, Gemini, Ollama)"
                    >
                        <Cpu size={14} className={hacyModelService.isConfigured() ? "text-purple-400" : "text-slate-400"} />
                        <span className="hidden sm:inline">
                            {hacyModelService.isConfigured() ? `SLM: ${hacyModelService.getConfig().provider.toUpperCase()}` : "Plug In Model"}
                        </span>
                    </button>

                    {/* Admin Assist Button */}
                    <button
                        onClick={() => setAdminMode(true)}
                        className="px-3.5 py-2 bg-purple-600/20 border border-purple-500/40 hover:bg-purple-600/30 text-purple-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                        title="Open Human-in-the-Loop Admin Supervision"
                    >
                        <ShieldCheck size={14} /> Admin Assist
                    </button>

                    {/* Close if embedded or modal */}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition ml-1"
                        >
                            Close
                        </button>
                    )}
                </div>
            </div>

            {/* Suggested Prompt Chips Bar */}
            <div className="bg-slate-900/40 border-b border-slate-800/80 px-6 py-3 overflow-x-auto scrollbar-none flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 shrink-0 mr-1 flex items-center gap-1">
                    <Sparkles size={12} className="text-amber-400" /> Quick Queries:
                </span>
                {SUGGESTED_QUERIES.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={idx}
                            onClick={() => handleSend(item.query)}
                            disabled={isLoading}
                            className="px-3 py-1.5 bg-slate-800/80 hover:bg-emerald-500/20 hover:border-emerald-500/40 hover:text-emerald-300 text-slate-300 border border-slate-700/70 rounded-full text-xs font-semibold shrink-0 transition flex items-center gap-1.5"
                        >
                            <Icon size={12} className="text-emerald-400" />
                            {item.label}
                        </button>
                    );
                })}
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {messages.map((msg) => {
                    const isUser = msg.sender === 'user';
                    return (
                        <div
                            key={msg.id}
                            className={`flex gap-3 max-w-4xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
                        >
                            {!isUser && (
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-md">
                                    <Bot size={16} />
                                </div>
                            )}

                            <div className="space-y-2 max-w-2xl w-full">
                                {isUser ? (
                                    /* User Bubble */
                                    <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl rounded-tr-sm shadow-md font-medium text-sm leading-relaxed">
                                        {msg.text}
                                    </div>
                                ) : (
                                    /* Bot Bubble (RAG Verified or Fallback) */
                                    <div className="bg-slate-900 border border-slate-800/90 rounded-2xl rounded-tl-sm p-5 shadow-xl text-slate-200 text-sm">
                                        {msg.content?.isFallback ? (
                                            /* FALLBACK DIRECT MESSAGE COMPONENT */
                                            <div className="space-y-4">
                                                <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3">
                                                    <AlertCircle size={22} className="text-rose-400 shrink-0 mt-0.5" />
                                                    <div>
                                                        <h4 className="font-extrabold text-rose-300 text-base mb-1">
                                                            {msg.content.title}
                                                        </h4>
                                                        <p className="text-slate-300 text-xs leading-relaxed">
                                                            {msg.content.summary}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <h5 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                                                        What Needs To Be Done:
                                                    </h5>
                                                    <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                                                        {msg.content.actionableSteps?.map((step, sIdx) => (
                                                            <li key={sIdx} className="leading-relaxed">
                                                                {step}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Official Contact Cards */}
                                                <div className="space-y-2 pt-2 border-t border-slate-800">
                                                    <h5 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                                                        <Mail size={13} className="text-emerald-400" /> Official Club Contacts:
                                                    </h5>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {msg.content.contactDepartments?.map((dept, dIdx) => (
                                                            <a
                                                                key={dIdx}
                                                                href={`mailto:${dept.email}?subject=Inquiry from HAC Portal: ${encodeURIComponent(messages[messages.length - 2]?.text || 'Member Query')}`}
                                                                className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 hover:border-emerald-500/50 rounded-xl transition group block"
                                                            >
                                                                <div className="font-bold text-white text-xs group-hover:text-emerald-400 flex items-center justify-between">
                                                                    <span>{dept.name}</span>
                                                                    <ExternalLink size={12} className="text-slate-500 group-hover:text-emerald-400" />
                                                                </div>
                                                                <div className="text-emerald-400 font-mono text-[11px] mt-0.5">
                                                                    {dept.email}
                                                                </div>
                                                                <div className="text-[10px] text-slate-400 mt-1">
                                                                    {dept.scope}
                                                                </div>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Human Escalation Button */}
                                                <div className="pt-2 flex items-center justify-between">
                                                    <button
                                                        onClick={() => handleEscalateQuery(messages[messages.length - 2]?.text || 'General Query')}
                                                        className="px-4 py-2 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 font-bold text-xs rounded-xl flex items-center gap-2 transition"
                                                    >
                                                        <ShieldCheck size={14} /> Request Human Assistance (Admin Queue)
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* REGULAR VERIFIED RAG ANSWER */
                                            <div className="space-y-3 prose prose-invert max-w-none text-sm">
                                                <div
                                                    className="leading-relaxed"
                                                    dangerouslySetInnerHTML={{
                                                        __html: formatMarkdownToHtml(msg.content.content)
                                                    }}
                                                />

                                                {/* Verified Sources Toggle */}
                                                {msg.sources && msg.sources.length > 0 && (
                                                    <div className="pt-3 border-t border-slate-800/80">
                                                        <button
                                                            onClick={() => toggleSourceExpansion(msg.id)}
                                                            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition"
                                                        >
                                                            <BookOpen size={13} />
                                                            <span>Verified RAG Sources ({msg.sources.length})</span>
                                                            <span className="text-[10px] text-slate-500">
                                                                (Confidence: {Math.round((msg.confidence || 0) * 100)}%)
                                                            </span>
                                                            {expandedSources[msg.id] ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                                        </button>

                                                        {expandedSources[msg.id] && (
                                                            <div className="mt-2 space-y-2">
                                                                {msg.sources.map((src, sIdx) => (
                                                                    <div
                                                                        key={sIdx}
                                                                        className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300"
                                                                    >
                                                                        <div className="flex items-center justify-between font-bold text-emerald-300 text-[11px] mb-1">
                                                                            <span>{src.title}</span>
                                                                            <span className="text-slate-500 font-mono">{src.relevancePercent}% match</span>
                                                                        </div>
                                                                        <div className="text-[10px] text-slate-400">
                                                                            Source: {src.metadata?.source || src.type}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {isUser && (
                                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                                    <User size={16} />
                                </div>
                            )}
                        </div>
                    );
                })}

                {isLoading && (
                    <div className="flex gap-3 max-w-xl mr-auto">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-600 flex items-center justify-center text-white shrink-0 mt-1 animate-pulse">
                            <Bot size={16} />
                        </div>
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-2 text-xs text-slate-400">
                            <RefreshCw size={14} className="animate-spin text-emerald-400" />
                            <span>Retrieving verified data from RAG index...</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Form Bar */}
            <div className="p-4 bg-slate-900/90 border-t border-slate-800 backdrop-blur-md">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    className="max-w-4xl mx-auto flex items-center gap-2"
                >
                    <div className="relative flex-1">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask HACY about membership, athlete scores, training times, or PBs..."
                            disabled={isLoading}
                            className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl pl-4 pr-12 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-inner transition"
                        />
                        {/* Voice Dictation Button */}
                        <button
                            type="button"
                            onClick={handleToggleSpeech}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition ${
                                isListening
                                    ? 'bg-rose-500 text-white animate-pulse'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                            title={isListening ? "Listening... click to stop" : "Speak to HACY"}
                        >
                            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="py-3.5 px-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition"
                    >
                        <Send size={16} />
                        <span className="hidden sm:inline">Send</span>
                    </button>
                </form>
                <div className="max-w-4xl mx-auto mt-2 text-center">
                    <p className="text-[11px] text-slate-500">
                        Official Hillingdon AC RAG • Fallback email: <a href="mailto:membership@hillingdonac.co.uk" className="text-emerald-400 hover:underline">membership@hillingdonac.co.uk</a>
                    </p>
                </div>
            </div>

            {/* Free Small Language Model Configuration Modal */}
            <HacyModelSettingsModal
                isOpen={isModelModalOpen}
                onClose={() => setIsModelModalOpen(false)}
                onSaved={() => {}}
            />
        </div>
    );
}

/**
 * Basic markdown parser to HTML for tables, lists, bold text, code blocks
 */
function formatMarkdownToHtml(md) {
    if (!md) return '';

    let html = md;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-white mt-3 mb-1">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-white mt-4 mb-2">$1</h2>');

    // Bold & italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-emerald-300 font-bold">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="italic text-slate-300">$1</em>');

    // Code blocks & inline code
    html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono text-xs border border-slate-700">$1</code>');

    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<div class="p-3 bg-slate-800/60 border-l-4 border-emerald-500 rounded-r-xl text-xs text-slate-300 my-2">$1</div>');

    // Markdown tables
    html = html.replace(/(\|.+\|\n)+/g, (match) => {
        const lines = match.trim().split('\n');
        if (lines.length < 2) return match;

        let tableHtml = '<div class="overflow-x-auto my-3 rounded-xl border border-slate-700/70 shadow-inner"><table class="w-full text-left text-xs border-collapse">';

        // Header
        const headerCells = lines[0].split('|').filter(c => c.trim() !== '');
        tableHtml += '<thead class="bg-slate-800/90 text-slate-200 uppercase text-[10px] tracking-wider font-bold"><tr>';
        headerCells.forEach(cell => {
            tableHtml += `<th class="p-2.5 border-b border-slate-700">${cell.trim()}</th>`;
        });
        tableHtml += '</tr></thead><tbody>';

        // Skip divider row (lines[1]) and render data rows
        for (let i = 2; i < lines.length; i++) {
            const cells = lines[i].split('|').filter(c => c.trim() !== '');
            tableHtml += `<tr class="border-b border-slate-800/60 hover:bg-slate-800/40 transition">`;
            cells.forEach(cell => {
                tableHtml += `<td class="p-2.5 text-slate-300">${cell.trim()}</td>`;
            });
            tableHtml += '</tr>';
        }

        tableHtml += '</tbody></table></div>';
        return tableHtml;
    });

    // Unordered lists
    html = html.replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-slate-300">$1</li>');

    // Line breaks
    html = html.replace(/\n\n/g, '<br/>');

    return html;
}
