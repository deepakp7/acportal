/**
 * HACY Model Service
 * Provides pluggable support for Free Small Language Models (SLMs) and LLMs:
 * - Groq (Llama 3.2 1B/3B, Llama 3.1 8B - ultra-fast free tier)
 * - OpenRouter Free (:free tier models like Llama 3.2, Mistral, Qwen)
 * - Google Gemini (1.5 Flash / 2.0 Flash - free tier from AI Studio)
 * - Hugging Face Inference API (Free serverless tokens)
 * - Local Ollama (100% offline, zero keys)
 */

const STORAGE_KEY_CONFIG = 'hacy_slm_config';

export const SLM_PROVIDERS = {
    groq: {
        id: 'groq',
        name: 'Groq Cloud (Free Llama 3.2 SLM)',
        badge: 'Recommended • Ultra Fast',
        description: 'Ultra-fast LPU inference with completely free tier. Best for lightweight small language models.',
        keyUrl: 'https://console.groq.com/keys',
        keyPlaceholder: 'gsk_...',
        models: [
            { id: 'llama-3.2-3b-preview', name: 'Llama 3.2 (3B) - Best Small Model', default: true },
            { id: 'llama-3.2-1b-preview', name: 'Llama 3.2 (1B) - Micro Model' },
            { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 (8B Instant) - Highly Capable' }
        ]
    },
    openrouter: {
        id: 'openrouter',
        name: 'OpenRouter (Free Tier Models)',
        badge: 'Free Models Available',
        description: 'Unified gateway offering multiple open-weights small models completely free with a free key.',
        keyUrl: 'https://openrouter.ai/keys',
        keyPlaceholder: 'sk-or-v1-...',
        models: [
            { id: 'meta-llama/llama-3.2-3b-instruct:free', name: 'Llama 3.2 (3B Free)', default: true },
            { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 (8B Free)' },
            { id: 'qwen/qwen-2.5-7b-instruct:free', name: 'Qwen 2.5 (7B Free)' },
            { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral (7B Free)' }
        ]
    },
    gemini: {
        id: 'gemini',
        name: 'Google Gemini Flash (Free Tier)',
        badge: '1,500 Requests/Day Free',
        description: 'Google AI Studio generous free tier for Gemini Flash models.',
        keyUrl: 'https://aistudio.google.com/app/apikey',
        keyPlaceholder: 'AIzaSy...',
        models: [
            { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash - Fast & Balanced', default: true },
            { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash (Experimental)' }
        ]
    },
    ollama: {
        id: 'ollama',
        name: 'Local Ollama (Offline / No API Key)',
        badge: 'Local Machine',
        description: 'Run small models locally on your own computer with Ollama (e.g. llama3.2:3b).',
        keyUrl: 'https://ollama.com',
        keyPlaceholder: 'http://localhost:11434 (Endpoint)',
        isLocal: true,
        models: [
            { id: 'llama3.2:3b', name: 'llama3.2:3b (Local)', default: true },
            { id: 'llama3.2:1b', name: 'llama3.2:1b (Local)' },
            { id: 'phi3:mini', name: 'phi3:mini (Local)' }
        ]
    }
};

class HacyModelService {
    constructor() {
        this.config = this.loadConfig();
    }

    loadConfig() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Error reading SLM config', e);
        }

        // Default to Groq if env exists, or OpenRouter/Gemini
        const envGroq = import.meta.env?.VITE_GROQ_API_KEY || '';
        const envGemini = import.meta.env?.VITE_GEMINI_API_KEY || '';
        const envOpenRouter = import.meta.env?.VITE_OPENROUTER_API_KEY || '';

        if (envGroq) {
            return { provider: 'groq', model: 'llama-3.2-3b-preview', apiKey: envGroq, enabled: true };
        }
        if (envGemini) {
            return { provider: 'gemini', model: 'gemini-1.5-flash', apiKey: envGemini, enabled: true };
        }
        if (envOpenRouter) {
            return { provider: 'openrouter', model: 'meta-llama/llama-3.2-3b-instruct:free', apiKey: envOpenRouter, enabled: true };
        }

        return {
            provider: 'groq',
            model: 'llama-3.2-3b-preview',
            apiKey: '',
            endpoint: 'http://localhost:11434',
            enabled: false
        };
    }

    saveConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        try {
            localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(this.config));
        } catch (e) {
            console.error('Failed to save SLM config', e);
        }
    }

    getConfig() {
        return this.config;
    }

    isConfigured() {
        if (!this.config || !this.config.enabled) return false;
        if (this.config.provider === 'ollama') return true;
        return Boolean(this.config.apiKey && this.config.apiKey.trim().length > 3);
    }

    /**
     * Test connection to provider with current credentials
     */
    async testConnection(providerId, modelId, apiKey, endpoint = 'http://localhost:11434') {
        const testPrompt = "Respond with one short sentence: confirm you are online as HACY sports assistant.";
        const systemPrompt = "You are HACY, assistant for Hillingdon Athletic Club.";

        try {
            const result = await this.callModel(
                { provider: providerId, model: modelId, apiKey, endpoint },
                systemPrompt,
                testPrompt
            );
            return { success: true, message: result };
        } catch (error) {
            return { success: false, error: error.message || String(error) };
        }
    }

    /**
     * Generate completion using the active or supplied config
     */
    async generate(systemPrompt, userPrompt, customConfig = null) {
        const active = customConfig || this.config;
        if (!active || (!active.apiKey && active.provider !== 'ollama')) {
            throw new Error('No API key configured for ' + (active?.provider || 'provider'));
        }
        return await this.callModel(active, systemPrompt, userPrompt);
    }

    async callModel(cfg, systemPrompt, userPrompt) {
        const { provider, model, apiKey, endpoint } = cfg;

        // 1. GROQ CLOUD
        if (provider === 'groq') {
            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey.trim()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model || 'llama-3.2-3b-preview',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: 0.3,
                    max_tokens: 450
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData?.error?.message || `Groq API error (${res.status})`);
            }

            const data = await res.json();
            return data?.choices?.[0]?.message?.content || '';
        }

        // 2. OPENROUTER
        if (provider === 'openrouter') {
            const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey.trim()}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin || 'http://localhost:5173',
                    'X-Title': 'Hillingdon AC Portal'
                },
                body: JSON.stringify({
                    model: model || 'meta-llama/llama-3.2-3b-instruct:free',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: 0.3,
                    max_tokens: 450
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData?.error?.message || `OpenRouter API error (${res.status})`);
            }

            const data = await res.json();
            return data?.choices?.[0]?.message?.content || '';
        }

        // 3. GOOGLE GEMINI
        if (provider === 'gemini') {
            const modelName = model || 'gemini-1.5-flash';
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey.trim()}`;
            const fullPrompt = `${systemPrompt}\n\nUser Question:\n${userPrompt}`;

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: fullPrompt }] }],
                    generationConfig: { maxOutputTokens: 450, temperature: 0.3 }
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData?.error?.message || `Gemini API error (${res.status})`);
            }

            const data = await res.json();
            return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }

        // 4. LOCAL OLLAMA
        if (provider === 'ollama') {
            const base = (endpoint || 'http://localhost:11434').replace(/\/+$/, '');
            const res = await fetch(`${base}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: model || 'llama3.2:3b',
                    prompt: `${systemPrompt}\n\nUser: ${userPrompt}\n\nAssistant:`,
                    stream: false
                })
            });

            if (!res.ok) {
                throw new Error(`Ollama connection error (${res.status}). Make sure Ollama is running on ${base}`);
            }

            const data = await res.json();
            return data?.response || '';
        }

        throw new Error(`Unknown SLM provider: ${provider}`);
    }
}

export const hacyModelService = new HacyModelService();
