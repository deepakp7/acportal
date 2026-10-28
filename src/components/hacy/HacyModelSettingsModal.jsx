import React, { useState } from 'react';
import { hacyModelService, SLM_PROVIDERS } from '../../services/hacyModelService';
import {
    Cpu,
    CheckCircle2,
    AlertCircle,
    ExternalLink,
    Zap,
    X,
    Server,
    Sparkles,
    ShieldCheck,
    RefreshCw
} from 'lucide-react';

export default function HacyModelSettingsModal({ isOpen, onClose, onSaved }) {
    const [config, setConfig] = useState(hacyModelService.getConfig());
    const [testStatus, setTestStatus] = useState(null); // { loading, success, message, error }
    const [saveMessage, setSaveMessage] = useState('');

    if (!isOpen) return null;

    const currentProvider = SLM_PROVIDERS[config.provider] || SLM_PROVIDERS.groq;

    const handleProviderChange = (providerId) => {
        const prov = SLM_PROVIDERS[providerId];
        const defaultModel = prov.models.find(m => m.default)?.id || prov.models[0]?.id;
        setConfig(prev => ({
            ...prev,
            provider: providerId,
            model: defaultModel
        }));
        setTestStatus(null);
    };

    const handleTest = async () => {
        setTestStatus({ loading: true });
        const res = await hacyModelService.testConnection(
            config.provider,
            config.model,
            config.apiKey,
            config.endpoint
        );
        if (res.success) {
            setTestStatus({ success: true, message: res.message });
        } else {
            setTestStatus({ success: false, error: res.error });
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        hacyModelService.saveConfig(config);
        setSaveMessage('Model configuration saved successfully!');
        if (onSaved) onSaved(config);
        setTimeout(() => {
            setSaveMessage('');
            onClose();
        }, 1200);
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl relative overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
                >
                    <X size={18} />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
                        <Cpu size={24} />
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                            <Sparkles size={11} /> Free Small Language Models (SLMs)
                        </div>
                        <h2 className="text-xl font-extrabold text-white">Plug In an AI Model</h2>
                    </div>
                </div>

                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                    Connect an ultra-fast, free Small Language Model (SLM) to power HACY. Groq and OpenRouter provide completely free API keys with no credit card required.
                </p>

                <form onSubmit={handleSave} className="space-y-5">
                    {/* Enable/Disable Toggle */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl">
                        <div>
                            <span className="text-xs font-bold text-white block">Enable SLM Reasoning</span>
                            <span className="text-[11px] text-slate-400">
                                When enabled, the model synthesizes club RAG data and answers general questions.
                            </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={config.enabled}
                                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                    </div>

                    {/* Provider Selection */}
                    <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                            Select Free Model Provider:
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {Object.values(SLM_PROVIDERS).map(prov => {
                                const isSelected = config.provider === prov.id;
                                return (
                                    <button
                                        type="button"
                                        key={prov.id}
                                        onClick={() => handleProviderChange(prov.id)}
                                        className={`p-3 rounded-2xl border text-left transition-all ${
                                            isSelected
                                                ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-600/20'
                                                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                                        }`}
                                    >
                                        <div className="font-bold text-xs">{prov.name.split(' ')[0]}</div>
                                        <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{prov.badge}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Provider Info Banner */}
                    <div className="p-3 bg-purple-950/30 border border-purple-800/40 rounded-xl text-xs text-purple-200 flex items-start justify-between gap-3">
                        <div>
                            <span className="font-bold text-purple-300">{currentProvider.name}</span>
                            <p className="text-[11px] text-slate-300 mt-0.5">{currentProvider.description}</p>
                        </div>
                        {currentProvider.keyUrl && (
                            <a
                                href={currentProvider.keyUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 transition"
                            >
                                Get Free Key <ExternalLink size={10} />
                            </a>
                        )}
                    </div>

                    {/* Model Dropdown */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Model Selection:
                        </label>
                        <select
                            value={config.model}
                            onChange={(e) => setConfig({ ...config, model: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                        >
                            {currentProvider.models.map(m => (
                                <option key={m.id} value={m.id}>
                                    {m.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* API Key or Endpoint */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                            {currentProvider.isLocal ? 'Ollama Server Endpoint:' : 'API Key:'}
                        </label>
                        {currentProvider.isLocal ? (
                            <input
                                type="text"
                                value={config.endpoint || 'http://localhost:11434'}
                                onChange={(e) => setConfig({ ...config, endpoint: e.target.value })}
                                placeholder="http://localhost:11434"
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                            />
                        ) : (
                            <input
                                type="password"
                                value={config.apiKey || ''}
                                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                                placeholder={currentProvider.keyPlaceholder}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                            />
                        )}
                    </div>

                    {/* Test Connection Output */}
                    {testStatus && (
                        <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                            testStatus.loading
                                ? 'bg-slate-800 border-slate-700 text-slate-300'
                                : testStatus.success
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        }`}>
                            {testStatus.loading && <RefreshCw size={14} className="animate-spin text-purple-400 shrink-0 mt-0.5" />}
                            {testStatus.success && <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />}
                            {testStatus.error && <AlertCircle size={14} className="text-rose-400 shrink-0 mt-0.5" />}
                            <div>
                                {testStatus.loading && <span>Testing connection to {currentProvider.name}...</span>}
                                {testStatus.success && (
                                    <span><strong>Connection Successful!</strong> Response: "{testStatus.message}"</span>
                                )}
                                {testStatus.error && (
                                    <span><strong>Connection Failed:</strong> {testStatus.error}</span>
                                )}
                            </div>
                        </div>
                    )}

                    {saveMessage && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
                            <CheckCircle2 size={14} /> {saveMessage}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleTest}
                            disabled={testStatus?.loading || (!config.apiKey && !currentProvider.isLocal)}
                            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                        >
                            <Zap size={14} /> Test Connection
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition"
                        >
                            <ShieldCheck size={14} /> Save & Apply Model
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
