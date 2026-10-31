import React, { useState, useEffect } from 'react';
import { hacyRagService } from '../../services/hacyRagEngine';
import { 
    ShieldCheck, 
    MessageSquare, 
    PlusCircle, 
    Trash2, 
    CheckCircle2, 
    AlertCircle, 
    Search, 
    BookOpen, 
    ArrowRight, 
    Sparkles,
    UserCheck,
    Clock,
    Send,
    Database,
    RefreshCw
} from 'lucide-react';

export default function HacyAdminAssist({ onBackToChat }) {
    const [activeTab, setActiveTab] = useState('queries'); // 'queries', 'knowledge', 'playground'
    const [queryLogs, setQueryLogs] = useState([]);
    const [customNotes, setCustomNotes] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'unanswered', 'resolved_by_admin', 'answered'
    
    // Assisting a query state
    const [selectedQuery, setSelectedQuery] = useState(null);
    const [assistText, setAssistText] = useState('');
    const [saveToKb, setSaveToKb] = useState(true);

    // New note form state
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newCategory, setNewCategory] = useState('Membership Policy');

    // Playground state
    const [testQuery, setTestQuery] = useState('');
    const [testResult, setTestResult] = useState(null);
    const [geminiKey, setGeminiKey] = useState(hacyRagService.getGeminiApiKey());
    const [keySavedMessage, setKeySavedMessage] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);

    const refreshData = async () => {
        setIsSyncing(true);
        try {
            const [logs, notes] = await Promise.all([
                hacyRagService.loadQueryLogs(),
                hacyRagService.loadCustomNotes()
            ]);
            setQueryLogs(logs || []);
            setCustomNotes(notes || []);
            setGeminiKey(hacyRagService.getGeminiApiKey());
        } catch (e) {
            console.warn('Refresh data notice:', e);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSaveGeminiKey = (e) => {
        e.preventDefault();
        hacyRagService.setGeminiApiKey(geminiKey);
        setKeySavedMessage('Gemini API key saved! HACY will now use it for open-ended general inquiries.');
        setTimeout(() => setKeySavedMessage(''), 4000);
    };

    useEffect(() => {
        refreshData();
    }, []);

    const handleSelectQueryForAssist = (q) => {
        setSelectedQuery(q);
        setAssistText(q.adminResponse || '');
    };

    const handleSubmitAssist = async (e) => {
        e.preventDefault();
        if (!selectedQuery || !assistText.trim()) return;

        await hacyRagService.updateQueryResolution(selectedQuery.id, assistText.trim(), 'Club Admin');
        
        if (saveToKb) {
            await hacyRagService.addCustomNote(
                `Query Resolution: ${selectedQuery.query}`,
                assistText.trim(),
                'Admin Assisted FAQ'
            );
        }

        setSelectedQuery(null);
        setAssistText('');
        await refreshData();
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!newTitle.trim() || !newContent.trim()) return;

        await hacyRagService.addCustomNote(newTitle.trim(), newContent.trim(), newCategory);
        setNewTitle('');
        setNewContent('');
        await refreshData();
    };

    const handleDeleteNote = async (id) => {
        await hacyRagService.deleteCustomNote(id);
        await refreshData();
    };

    const handleRunTest = async (e) => {
        e.preventDefault();
        if (!testQuery.trim()) return;
        const res = await hacyRagService.answerQuery(testQuery);
        setTestResult(res);
    };

    const filteredLogs = queryLogs.filter(q => {
        if (filterStatus === 'all') return true;
        if (filterStatus === 'unanswered') return q.status === 'unanswered';
        if (filterStatus === 'resolved_by_admin') return q.status === 'resolved_by_admin';
        if (filterStatus === 'answered') return q.status === 'answered';
        return true;
    });

    return (
        <div className="bg-slate-900 text-slate-100 min-h-screen p-6 md:p-10 font-sans">
            {/* Top Header */}
            <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">
                        <ShieldCheck size={14} /> Human-In-The-Loop Supervisor
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        HACY Admin Assist Hub
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Supervise live queries, assist with unanswerable questions, and enrich HACY's RAG knowledge base.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={refreshData}
                        disabled={isSyncing}
                        className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition ${
                            hacyRagService.isSupabaseConnected
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                        title="Synchronize with Supabase Cloud Database"
                    >
                        <Database size={15} className={hacyRagService.isSupabaseConnected ? "text-emerald-400" : "text-amber-400"} />
                        <span>{hacyRagService.isSupabaseConnected ? "Supabase Synced" : "Local / Cloud Sync"}</span>
                        <RefreshCw size={13} className={isSyncing ? "animate-spin text-purple-400" : "text-slate-400"} />
                    </button>

                    <button
                        onClick={onBackToChat}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm font-semibold flex items-center gap-2 transition"
                    >
                        <MessageSquare size={16} /> Back to HACY Chat
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="max-w-6xl mx-auto mb-8 flex gap-2 border-b border-slate-800/80 pb-2">
                <button
                    onClick={() => setActiveTab('queries')}
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                        activeTab === 'queries'
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                >
                    <UserCheck size={16} /> Query Assistance & Escalations
                    {queryLogs.filter(q => q.status === 'unanswered').length > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-rose-500 text-white rounded-full font-extrabold animate-pulse">
                            {queryLogs.filter(q => q.status === 'unanswered').length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('knowledge')}
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                        activeTab === 'knowledge'
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                >
                    <BookOpen size={16} /> Custom RAG Notes ({customNotes.length})
                </button>
                <button
                    onClick={() => setActiveTab('playground')}
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                        activeTab === 'playground'
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                >
                    <Sparkles size={16} /> RAG Diagnostic Playground
                </button>
            </div>

            <div className="max-w-6xl mx-auto">
                {/* TAB 1: Query Supervision & Assistance */}
                {activeTab === 'queries' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left column: List of queries */}
                        <div className="lg:col-span-7 space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
                                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                                    Filter Queries:
                                </span>
                                <div className="flex items-center gap-2">
                                    {[
                                        { id: 'all', label: 'All' },
                                        { id: 'unanswered', label: 'Escalated / Pending' },
                                        { id: 'resolved_by_admin', label: 'Admin Assisted' },
                                        { id: 'answered', label: 'Auto Answered' }
                                    ].map(btn => (
                                        <button
                                            key={btn.id}
                                            onClick={() => setFilterStatus(btn.id)}
                                            className={`px-3 py-1 text-xs rounded-lg font-semibold transition ${
                                                filterStatus === btn.id
                                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                            }`}
                                        >
                                            {btn.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {filteredLogs.length === 0 ? (
                                <div className="p-12 text-center bg-slate-800/20 rounded-2xl border border-slate-800/60">
                                    <MessageSquare size={36} className="mx-auto text-slate-600 mb-3" />
                                    <h3 className="text-slate-300 font-bold">No queries found</h3>
                                    <p className="text-slate-500 text-sm mt-1">
                                        Queries asked by members and athletes will appear here in real time.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredLogs.map(log => {
                                        const isSelected = selectedQuery?.id === log.id;
                                        return (
                                            <div
                                                key={log.id}
                                                onClick={() => handleSelectQueryForAssist(log)}
                                                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-purple-900/30 border-purple-500/60 shadow-lg shadow-purple-950/40'
                                                        : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-3 mb-2">
                                                    <span className="font-bold text-white text-base">
                                                        "{log.query}"
                                                    </span>
                                                    {log.status === 'unanswered' ? (
                                                        <span className="px-2.5 py-1 text-xs rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold flex items-center gap-1 shrink-0">
                                                            <AlertCircle size={12} /> Needs Assist
                                                        </span>
                                                    ) : log.status === 'resolved_by_admin' ? (
                                                        <span className="px-2.5 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold flex items-center gap-1 shrink-0">
                                                            <UserCheck size={12} /> Admin Assisted
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1 shrink-0">
                                                            <CheckCircle2 size={12} /> Verified RAG
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-4 text-xs text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} /> {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span>Confidence: {Math.round(log.confidence * 100)}%</span>
                                                    <span>Sources: {log.sourcesCount || 0}</span>
                                                </div>

                                                {log.adminResponse && (
                                                    <div className="mt-3 p-2.5 bg-purple-950/40 border border-purple-800/40 rounded-xl text-xs text-purple-200">
                                                        <strong className="text-purple-300">Admin Response:</strong> {log.adminResponse}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Right column: Action panel to assist */}
                        <div className="lg:col-span-5">
                            {selectedQuery ? (
                                <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-3xl sticky top-6 backdrop-blur-md shadow-2xl">
                                    <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">
                                        <UserCheck size={14} /> Respond to Member
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">
                                        Assist with Query
                                    </h3>
                                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-700/80 text-sm text-slate-200 mb-4">
                                        <span className="text-xs text-slate-400 block mb-1">Inquiry:</span>
                                        <strong>{selectedQuery.query}</strong>
                                    </div>

                                    <form onSubmit={handleSubmitAssist} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                                                Your Admin / Coaching Response:
                                            </label>
                                            <textarea
                                                rows={5}
                                                value={assistText}
                                                onChange={(e) => setAssistText(e.target.value)}
                                                placeholder="Provide the verified answer or instructions for this athlete/member..."
                                                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                                                required
                                            />
                                        </div>

                                        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={saveToKb}
                                                onChange={(e) => setSaveToKb(e.target.checked)}
                                                className="rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-purple-500"
                                            />
                                            Save this answer to HACY's RAG Knowledge Base so it auto-answers next time
                                        </label>

                                        <div className="flex items-center gap-3 pt-2">
                                            <button
                                                type="submit"
                                                className="flex-1 py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition"
                                            >
                                                <Send size={15} /> Submit Response
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedQuery(null)}
                                                className="py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-xl transition"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div className="bg-slate-800/30 border border-slate-800/80 p-8 rounded-3xl text-center">
                                    <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <ArrowRight size={20} />
                                    </div>
                                    <h4 className="font-bold text-white mb-1">Select a Query to Assist</h4>
                                    <p className="text-slate-400 text-xs">
                                        Click on any query from the list on the left to write an admin answer or convert it into permanent club knowledge.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 2: Custom Knowledge Base Notes */}
                {activeTab === 'knowledge' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Add note form */}
                        <div className="lg:col-span-5 bg-slate-800/70 border border-slate-700/80 p-6 rounded-3xl">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <PlusCircle size={18} className="text-purple-400" /> Add Custom Club Note
                            </h3>
                            <form onSubmit={handleAddNote} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        Title / Subject:
                                    </label>
                                    <input
                                        type="text"
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        placeholder="e.g. Summer Track Training Changes or AGM Date"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        Category:
                                    </label>
                                    <select
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
                                    >
                                        <option value="Membership Policy">Membership Policy</option>
                                        <option value="Training Schedule">Training Schedule</option>
                                        <option value="Competition & Leagues">Competition & Leagues</option>
                                        <option value="Club Announcement">Club Announcement</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        Content / Facts for HACY:
                                    </label>
                                    <textarea
                                        rows={6}
                                        value={newContent}
                                        onChange={(e) => setNewContent(e.target.value)}
                                        placeholder="Enter the official policy or info that HACY should use to answer member queries..."
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition"
                                >
                                    <PlusCircle size={16} /> Save to RAG Knowledge Base
                                </button>
                            </form>
                        </div>

                        {/* List of custom notes */}
                        <div className="lg:col-span-7 space-y-4">
                            <h3 className="text-lg font-bold text-white flex items-center justify-between">
                                <span>Verified Custom Knowledge Chunks</span>
                                <span className="text-xs text-slate-400 font-normal">
                                    {customNotes.length} custom items active
                                </span>
                            </h3>

                            {customNotes.length === 0 ? (
                                <div className="p-12 text-center bg-slate-800/20 rounded-2xl border border-slate-800/60">
                                    <BookOpen size={36} className="mx-auto text-slate-600 mb-3" />
                                    <h4 className="text-slate-300 font-bold">No Custom Notes Added Yet</h4>
                                    <p className="text-slate-500 text-sm mt-1">
                                        Use the form on the left to add club rules, special schedule changes, or fee notices.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {customNotes.map(note => (
                                        <div
                                            key={note.id}
                                            className="p-5 bg-slate-800/50 border border-slate-700/70 rounded-2xl relative group hover:border-slate-600 transition"
                                        >
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div>
                                                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-500/20 text-purple-300 uppercase tracking-wider mb-1 inline-block">
                                                        {note.category}
                                                    </span>
                                                    <h4 className="font-bold text-white text-base">
                                                        {note.title}
                                                    </h4>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteNote(note.id)}
                                                    className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition"
                                                    title="Delete Note"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                                {note.content}
                                            </p>
                                            <div className="mt-3 pt-3 border-t border-slate-700/40 text-[11px] text-slate-500">
                                                Added: {new Date(note.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 3: Diagnostic Playground */}
                {activeTab === 'playground' && (
                    <div className="bg-slate-800/50 border border-slate-700/80 p-6 md:p-8 rounded-3xl">
                        <div className="max-w-2xl mb-6">
                            <h3 className="text-xl font-bold text-white mb-2">
                                RAG Retrieval Diagnostic Playground
                            </h3>
                            <p className="text-slate-400 text-sm">
                                Test any query in real time to inspect the underlying vector/keyword similarity, live weather intercept, extracted entities, and synthesized output.
                            </p>
                        </div>

                        {/* Optional Gemini API Key Box for Open-Domain Queries */}
                        <div className="mb-6 p-4 bg-slate-900/90 border border-purple-500/30 rounded-2xl">
                            <div className="flex items-center justify-between gap-2 mb-2">
                                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                                    <Sparkles size={13} className="text-amber-400" /> Optional: Connect Google Gemini API for Open-Ended Enquiries
                                </span>
                                {keySavedMessage && (
                                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                                        <CheckCircle2 size={12} /> {keySavedMessage}
                                    </span>
                                )}
                            </div>
                            <form onSubmit={handleSaveGeminiKey} className="flex gap-2">
                                <input
                                    type="password"
                                    value={geminiKey}
                                    onChange={(e) => setGeminiKey(e.target.value)}
                                    placeholder="Enter Gemini API Key (e.g. AIzaSy...)"
                                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shrink-0"
                                >
                                    Save Key
                                </button>
                            </form>
                            <p className="text-[11px] text-slate-400 mt-2">
                                Weather, club info, membership rules, and athlete scores work 100% locally with zero keys. Adding a Gemini key lets HACY answer open-ended general knowledge questions beyond club data.
                            </p>
                        </div>

                        <form onSubmit={handleRunTest} className="flex gap-3 mb-6">
                            <input
                                type="text"
                                value={testQuery}
                                onChange={(e) => setTestQuery(e.target.value)}
                                placeholder="Type a test query (e.g. 'What is Bradley Stone's high jump score?' or 'How do I renew junior membership?')"
                                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                            />
                            <button
                                type="submit"
                                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl flex items-center gap-2 transition"
                            >
                                <Search size={16} /> Test RAG
                            </button>
                        </form>

                        {testResult && (
                            <div className="space-y-6 pt-4 border-t border-slate-700">
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-2">
                                        <span className="text-xs text-slate-400 font-semibold">Status:</span>
                                        {testResult.answered ? (
                                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                                <CheckCircle2 size={13} /> Verified Answer
                                            </span>
                                        ) : (
                                            <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                                                <AlertCircle size={13} /> Fallback Triggered
                                            </span>
                                        )}
                                    </div>
                                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-2">
                                        <span className="text-xs text-slate-400 font-semibold">Confidence Score:</span>
                                        <span className="text-xs font-bold text-purple-300">
                                            {Math.round(testResult.confidence * 100)}%
                                        </span>
                                    </div>
                                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-2">
                                        <span className="text-xs text-slate-400 font-semibold">Sources Matched:</span>
                                        <span className="text-xs font-bold text-white">
                                            {testResult.sources.length} chunks
                                        </span>
                                    </div>
                                </div>

                                {/* Retrieved Sources Chunks */}
                                <div>
                                    <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3">
                                        Retrieved RAG Chunks:
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {testResult.sources.map((s, idx) => (
                                            <div key={idx} className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
                                                <div className="flex items-center justify-between font-bold text-purple-300 mb-1">
                                                    <span>{s.title}</span>
                                                    <span className="text-slate-500 font-mono">{s.relevancePercent}%</span>
                                                </div>
                                                <div className="text-slate-400 font-mono text-[11px] mb-2">
                                                    Source: {s.metadata?.source || s.type}
                                                </div>
                                                <p className="text-slate-300 line-clamp-3">
                                                    {s.content}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
