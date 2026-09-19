'use client';

import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Trash2, 
  RefreshCw, 
  Cloud, 
  Lock, 
  ExternalLink,
  Cpu,
  Sparkles,
  Zap,
  Globe,
  Check,
  PlusCircle,
  Search,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { GeminiKeyStatus, GeminiModel, OpenSourceModel } from '@/lib/types';
import { ERPLayout } from '@/components/layout/ERPLayout';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'google' | 'openrouter'>('google');
  const [googleKeyInput, setGoogleKeyInput] = useState('');
  const [openrouterKeyInput, setOpenrouterKeyInput] = useState('');
  const [selectedOpenRouterModel, setSelectedOpenRouterModel] = useState('meta-llama/llama-3.3-70b-instruct');
  
  const [status, setStatus] = useState<GeminiKeyStatus | null>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [selectingModel, setSelectingModel] = useState(false);
  const [fetchingGeminiModels, setFetchingGeminiModels] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Search states for list view
  const [geminiSearch, setGeminiSearch] = useState('');
  const [openrouterSearch, setOpenrouterSearch] = useState('');

  // Custom Model Modal / Form state
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customModelId, setCustomModelId] = useState('');
  const [customModelDisplayName, setCustomModelDisplayName] = useState('');
  const [customIsFreeTier, setCustomIsFreeTier] = useState(true);
  const [addingModel, setAddingModel] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await apiClient.getKeyStatus();
      setStatus(res);
      if (res.provider) {
        setActiveTab(res.provider as 'google' | 'openrouter');
      }
      if (res.openrouter_model) {
        setSelectedOpenRouterModel(res.openrouter_model);
      }
    } catch (e) {
      console.error('Failed to fetch status:', e);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSaveGoogleKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleKeyInput.trim()) {
      setMessage({ text: 'Please enter a valid Google Gemini API key.', type: 'error' });
      return;
    }

    const currentModel = status?.gemini_model || 'gemini-2.5-flash';
    setSaving(true);
    setMessage({ text: `Validating key with Google AI Studio (${currentModel})...`, type: 'info' });

    try {
      const res = await apiClient.saveKey(googleKeyInput.trim(), 'google', currentModel);
      setStatus(res);
      setGoogleKeyInput('');
      setMessage({ 
        text: `Google Gemini API Key successfully verified and encrypted with AES-Fernet. Discovered ${res.available_gemini_models?.length || 0} supported models.`, 
        type: 'success' 
      });
    } catch (err: any) {
      setMessage({ text: `Google Key verification failed: ${err.message}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleFetchGeminiModelsFromGoogle = async () => {
    setFetchingGeminiModels(true);
    setMessage({ text: 'Querying Google Generative Language API v1beta/models for active models...', type: 'info' });

    try {
      const models = await apiClient.fetchGeminiModels(googleKeyInput.trim() || undefined);
      await fetchStatus();
      setMessage({ 
        text: `Successfully synced ${models.length} live models directly from Google AI Studio API. Free tier models are ready for extraction.`, 
        type: 'success' 
      });
    } catch (err: any) {
      setMessage({ text: `Failed to fetch models from Google: ${err.message}`, type: 'error' });
    } finally {
      setFetchingGeminiModels(false);
    }
  };

  const handleAddCustomModelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customModelId.trim()) {
      alert('Please provide a Model ID (e.g., gemini-2.5-flash-preview).');
      return;
    }

    setAddingModel(true);
    try {
      const res = await apiClient.addCustomModel({
        provider: 'google',
        model_id: customModelId.trim(),
        name: customModelDisplayName.trim() || customModelId.trim(),
        is_free_tier: customIsFreeTier,
        badge: customIsFreeTier ? 'Custom Free Model' : 'Custom Model'
      });
      setStatus(res);
      setShowCustomModal(false);
      setCustomModelId('');
      setCustomModelDisplayName('');
      setMessage({ text: `Custom model '${customModelId.trim()}' added and activated!`, type: 'success' });
    } catch (err: any) {
      alert(`Error adding model: ${err.message}`);
    } finally {
      setAddingModel(false);
    }
  };

  const handleSaveOpenRouterKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openrouterKeyInput.trim()) {
      setMessage({ text: 'Please enter a valid OpenRouter API key.', type: 'error' });
      return;
    }

    setSaving(true);
    setMessage({ text: `Validating OpenRouter key with ${selectedOpenRouterModel} pre-flight ping...`, type: 'info' });

    try {
      const res = await apiClient.saveKey(openrouterKeyInput.trim(), 'openrouter', selectedOpenRouterModel);
      setStatus(res);
      setOpenrouterKeyInput('');
      setMessage({ text: `OpenRouter API Key successfully verified and set to ${selectedOpenRouterModel}.`, type: 'success' });
    } catch (err: any) {
      setMessage({ text: `OpenRouter Key verification failed: ${err.message}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSelectModel = async (provider: 'google' | 'openrouter', modelId: string) => {
    setSelectingModel(true);
    try {
      const res = await apiClient.selectModel(provider, modelId);
      setStatus(res);
      if (provider === 'openrouter') {
        setSelectedOpenRouterModel(modelId);
      }
      setMessage({ text: `Active model switched to ${modelId} (${provider.toUpperCase()}).`, type: 'success' });
    } catch (err: any) {
      setMessage({ text: `Failed to switch model: ${err.message}`, type: 'error' });
    } finally {
      setSelectingModel(false);
    }
  };

  const handleTestPing = async () => {
    setTesting(true);
    try {
      const res = await apiClient.testPing();
      if (res.is_valid) {
        setMessage({ text: `Connection verified: ${res.message}`, type: 'success' });
      } else {
        setMessage({ text: `Connection error: ${res.message}`, type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: `Ping failed: ${err.message}`, type: 'error' });
    } finally {
      setTesting(false);
    }
  };

  const handleRemoveKey = async (provider: 'google' | 'openrouter' | 'all') => {
    if (!confirm(`Are you sure you want to remove the stored ${provider.toUpperCase()} API key?`)) return;

    try {
      await apiClient.removeKey(provider);
      await fetchStatus();
      setMessage({ text: `BYOK Key (${provider}) removed. System reverted to fallback simulation mode.`, type: 'info' });
    } catch (err: any) {
      setMessage({ text: `Remove failed: ${err.message}`, type: 'error' });
    }
  };

  const currentProvider = status?.provider || 'google';
  const activeGeminiModel = status?.gemini_model || (currentProvider === 'google' ? status?.model : 'gemini-2.5-flash');

  const filteredGeminiModels = (status?.available_gemini_models || []).filter((m: GeminiModel) =>
    m.name.toLowerCase().includes(geminiSearch.toLowerCase()) ||
    m.id.toLowerCase().includes(geminiSearch.toLowerCase()) ||
    (m.badge && m.badge.toLowerCase().includes(geminiSearch.toLowerCase()))
  );

  const filteredOpenRouterModels = (status?.available_open_source_models || []).filter((m: OpenSourceModel) =>
    m.name.toLowerCase().includes(openrouterSearch.toLowerCase()) ||
    m.id.toLowerCase().includes(openrouterSearch.toLowerCase()) ||
    (m.badge && m.badge.toLowerCase().includes(openrouterSearch.toLowerCase()))
  );

  return (
    <ERPLayout>
      <div className="space-y-8 max-w-5xl font-body">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider mb-1.5">
            <KeyRound className="w-4 h-4" />
            <span>Zero-Cost Bring-Your-Own-Key (BYOK) & Multi-Model Engine</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">BYOK Key Vault & AI Gateway</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl leading-relaxed">
            Configure your Google AI Studio Gemini API key (with 1,500 free daily requests across Gemini 2.5 Flash, 2.5 Flash-Lite, and 2.0) or connect OpenRouter AI to run open-source models. All keys are encrypted at rest with AES-Fernet.
          </p>
        </div>

        {/* Active Key Status Card */}
        <div className="bg-background rounded-3xl p-6 border border-border shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                status?.is_valid ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
              }`}>
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-sm font-bold text-foreground">Active Provider:</h3>
                  <span className="font-mono text-xs font-bold text-accent bg-accent/10 px-3 py-0.5 rounded-full border border-accent/20 uppercase tracking-wide">
                    {currentProvider}
                  </span>
                  <span className="font-mono text-xs font-bold text-foreground bg-secondary px-2.5 py-0.5 rounded-full border border-border">
                    {status?.mask || 'Not Configured'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active Model: <span className="text-foreground font-mono font-semibold">{status?.model || 'gemini-2.5-flash'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {status?.is_configured && (
                <>
                  <button
                    onClick={handleTestPing}
                    disabled={testing}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 border border-border text-xs font-semibold text-foreground transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    <span>Test Ping</span>
                  </button>
                  <button
                    onClick={() => handleRemoveKey(currentProvider as 'google' | 'openrouter')}
                    className="p-2 text-muted-foreground hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Remove Active Key"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-800'
                : message.type === 'error'
                ? 'bg-rose-500/10 border border-rose-500/20 text-rose-800'
                : 'bg-accent/10 border border-accent/20 text-accent'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}
        </div>

        {/* Provider Tabs */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <button
              onClick={() => setActiveTab('google')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'google'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Google Gemini (AI Studio)</span>
              {status?.google_configured && (
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('openrouter')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'openrouter'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Globe className="w-4 h-4 text-accent" />
              <span>OpenRouter AI Models</span>
              {status?.openrouter_configured && (
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              )}
            </button>
          </div>

          {/* TAB 1: Google Gemini */}
          {activeTab === 'google' && (
            <div className="space-y-6">
              {/* Key Registration */}
              <div className="bg-background rounded-3xl p-6 border border-border shadow-sm space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Register Google Gemini API Key</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Powers high-accuracy multimodal OCR with Google Gemini. Includes 1,500 free requests per day on Google AI Studio.
                    </p>
                  </div>
                  {currentProvider === 'google' && status?.is_configured && (
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Active Engine
                    </span>
                  )}
                </div>

                <form onSubmit={handleSaveGoogleKey} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Google AI Studio API Key (Starts with <code className="text-accent font-mono">AIzaSy...</code>)
                    </label>
                    <input
                      type="password"
                      placeholder="Paste your Gemini API key here..."
                      value={googleKeyInput}
                      onChange={(e) => setGoogleKeyInput(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-full px-5 py-2.5 text-xs text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:text-accent/80 flex items-center gap-1 font-semibold"
                    >
                      <span>Get Free Gemini API Key (1,500 req/day free)</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <div className="flex items-center gap-2">
                      {status?.google_configured && currentProvider !== 'google' && (
                        <button
                          type="button"
                          onClick={() => handleSelectModel('google', activeGeminiModel || 'gemini-2.5-flash')}
                          disabled={selectingModel}
                          className="px-5 py-2.5 rounded-full bg-secondary hover:bg-secondary/80 border border-border text-xs font-bold text-foreground cursor-pointer"
                        >
                          Switch to Google Gemini
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={saving || !googleKeyInput.trim()}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold shadow-sm transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>Verify &amp; Encrypt Gemini Key</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Gemini Models Catalog & Free Tier Options - COMPACT LIST VIEW */}
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="text-base font-display font-bold text-foreground flex items-center gap-2">
                      <span>Available Google Gemini Models</span>
                      <span className="text-xs font-normal text-muted-foreground">({filteredGeminiModels.length} models)</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Select your preferred Gemini model. Models marked with <strong className="text-emerald-700 font-semibold">Free Tier Eligible</strong> cost $0 on Google AI Studio.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input 
                        type="text"
                        placeholder="Search models..."
                        value={geminiSearch}
                        onChange={(e) => setGeminiSearch(e.target.value)}
                        className="pl-8 pr-3 py-1.5 bg-secondary border border-border rounded-full text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent w-44 md:w-56 font-body"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleFetchGeminiModelsFromGoogle}
                      disabled={fetchingGeminiModels}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 border border-border text-xs font-semibold text-foreground transition-all cursor-pointer disabled:opacity-50"
                      title="Fetch live active models list directly from Google AI API"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${fetchingGeminiModels ? 'animate-spin' : ''}`} />
                      <span>{fetchingGeminiModels ? 'Fetching...' : 'Fetch Live Models (API)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowCustomModal(true)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-accent/10 hover:bg-accent/20 border border-accent/30 text-xs font-semibold text-accent transition-all cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Add Custom Model ID</span>
                    </button>
                  </div>
                </div>

                {/* Free Tier Callout */}
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 flex items-start gap-3">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong className="font-semibold text-emerald-950">Free Tier Guidance (Google AI Studio):</strong> Google provides up to <strong>1,500 requests/day</strong> and 15 requests/minute for free on <strong>Gemini 2.5 Flash</strong>, <strong>Gemini 2.5 Flash-Lite</strong>, and <strong>Gemini 2.0 Flash</strong>. No credit card is required to extract invoices with these models.
                  </div>
                </div>

                {/* Models Clean List View */}
                <div className="bg-background rounded-3xl border border-border shadow-sm overflow-hidden divide-y divide-border">
                  {filteredGeminiModels.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted-foreground">
                      No models matching &ldquo;{geminiSearch}&rdquo;.
                    </div>
                  ) : (
                    filteredGeminiModels.map((model: GeminiModel) => {
                      const isSelected = currentProvider === 'google' && (status?.model === model.id || status?.gemini_model === model.id);
                      return (
                        <div
                          key={model.id}
                          className={`p-4 md:px-6 md:py-4 flex items-center justify-between gap-4 transition-colors cursor-pointer group ${
                            isSelected
                              ? 'bg-accent/5 hover:bg-accent/10'
                              : 'hover:bg-secondary/40'
                          }`}
                          onClick={() => handleSelectModel('google', model.id)}
                        >
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? 'border-2 border-accent bg-accent text-accent-foreground'
                                : 'border-2 border-border bg-background group-hover:border-accent/40'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-display font-bold text-sm text-foreground">{model.name}</span>
                                <code className="text-[11px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-md border border-border">{model.id}</code>
                                
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                                  model.id === 'gemini-2.5-flash'
                                    ? 'bg-amber-500/10 text-amber-700 border-amber-500/30'
                                    : 'bg-accent/10 text-accent border-accent/20'
                                }`}>
                                  {model.badge}
                                </span>

                                {model.is_free_tier && (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-emerald-600" /> Free Tier (1,500/day)
                                  </span>
                                )}

                                {model.is_vision && (
                                  <span className="text-[10px] font-semibold text-foreground/80 bg-secondary px-2 py-0.5 rounded-full border border-border flex items-center gap-1">
                                    <Zap className="w-3 h-3 text-amber-500" /> Vision
                                  </span>
                                )}
                              </div>

                              {model.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1 leading-relaxed">
                                  {model.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            <div className="text-right hidden sm:block">
                              <span className="text-xs font-mono font-medium text-foreground">{(model.context_length / 1000).toFixed(0)}k</span>
                              <span className="text-[10px] text-muted-foreground block">tokens ctx</span>
                            </div>

                            <button
                              type="button"
                              disabled={selectingModel}
                              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-accent text-accent-foreground shadow-sm'
                                  : 'bg-secondary text-foreground hover:bg-accent/20 hover:text-accent border border-border'
                              }`}
                            >
                              {isSelected ? 'Active Model' : 'Select'}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Custom Model Modal */}
              {showCustomModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-background rounded-3xl border border-border p-6 max-w-md w-full shadow-xl space-y-4 font-body">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-foreground font-display">Add Custom Google Gemini Model</h3>
                      <button 
                        onClick={() => setShowCustomModal(false)}
                        className="text-muted-foreground hover:text-foreground text-sm cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter any specific Gemini model version (e.g. experimental previews, fine-tuned models, or newly released models from Google AI Studio).
                    </p>

                    <form onSubmit={handleAddCustomModelSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">Model Identifier (ID)</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. gemini-2.5-flash-preview"
                          value={customModelId}
                          onChange={(e) => setCustomModelId(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-xl px-4 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-accent"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">Display Name (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Gemini 2.5 Flash Experimental"
                          value={customModelDisplayName}
                          onChange={(e) => setCustomModelDisplayName(e.target.value)}
                          className="w-full bg-secondary border border-border rounded-xl px-4 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isFreeCheck"
                          checked={customIsFreeTier}
                          onChange={(e) => setCustomIsFreeTier(e.target.checked)}
                          className="rounded border-border"
                        />
                        <label htmlFor="isFreeCheck" className="text-xs text-foreground font-medium cursor-pointer">
                          Eligible for Free Tier Quota in Google AI Studio
                        </label>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                        <button
                          type="button"
                          onClick={() => setShowCustomModal(false)}
                          className="px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 text-xs font-semibold text-foreground cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={addingModel}
                          className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
                        >
                          {addingModel && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          <span>Add &amp; Activate Model</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: OpenRouter AI Models */}
          {activeTab === 'openrouter' && (
            <div className="space-y-6">
              <div className="bg-background rounded-3xl p-6 border border-border shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Register OpenRouter API Key</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Access top open-source models (Llama 3.3 70B, Qwen 2.5 VL, DeepSeek V3/R1, Mistral) &amp; commercial LLMs via OpenRouter AI.
                    </p>
                  </div>
                  {currentProvider === 'openrouter' && status?.is_configured && (
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Active Engine
                    </span>
                  )}
                </div>

                <form onSubmit={handleSaveOpenRouterKey} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      OpenRouter API Key (Starts with <code className="text-accent font-mono">sk-or-v1-...</code>)
                    </label>
                    <input
                      type="password"
                      placeholder="Paste your OpenRouter API key here..."
                      value={openrouterKeyInput}
                      onChange={(e) => setOpenrouterKeyInput(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-full px-5 py-2.5 text-xs text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
                    <a
                      href="https://openrouter.ai/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:text-accent/80 flex items-center gap-1 font-semibold"
                    >
                      <span>Get OpenRouter API Key</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <div className="flex items-center gap-2">
                      {status?.openrouter_configured && currentProvider !== 'openrouter' && (
                        <button
                          type="button"
                          onClick={() => handleSelectModel('openrouter', selectedOpenRouterModel)}
                          disabled={selectingModel}
                          className="px-5 py-2.5 rounded-full bg-secondary hover:bg-secondary/80 border border-border text-xs font-bold text-foreground cursor-pointer"
                        >
                          Switch to OpenRouter
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={saving || !openrouterKeyInput.trim()}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold shadow-sm transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>Verify &amp; Encrypt OpenRouter Key</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* OpenRouter Model Catalog - COMPACT LIST VIEW */}
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="text-base font-display font-bold text-foreground">Select OpenRouter Model</h3>
                    <p className="text-xs text-muted-foreground">Choose your preferred open-source or vision LLM model for document extraction.</p>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input 
                      type="text"
                      placeholder="Search OpenRouter models..."
                      value={openrouterSearch}
                      onChange={(e) => setOpenrouterSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-secondary border border-border rounded-full text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent w-44 md:w-56 font-body"
                    />
                  </div>
                </div>

                <div className="bg-background rounded-3xl border border-border shadow-sm overflow-hidden divide-y divide-border">
                  {filteredOpenRouterModels.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted-foreground">
                      No models matching &ldquo;{openrouterSearch}&rdquo;.
                    </div>
                  ) : (
                    filteredOpenRouterModels.map((model: OpenSourceModel) => {
                      const isSelected = currentProvider === 'openrouter' && status?.model === model.id;
                      return (
                        <div
                          key={model.id}
                          className={`p-4 md:px-6 md:py-4 flex items-center justify-between gap-4 transition-colors cursor-pointer group ${
                            isSelected
                              ? 'bg-accent/5 hover:bg-accent/10'
                              : 'hover:bg-secondary/40'
                          }`}
                          onClick={() => handleSelectModel('openrouter', model.id)}
                        >
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? 'border-2 border-accent bg-accent text-accent-foreground'
                                : 'border-2 border-border bg-background group-hover:border-accent/40'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-display font-bold text-sm text-foreground">{model.name}</span>
                                <code className="text-[11px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-md border border-border">{model.id}</code>

                                <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20 px-2.5 py-0.5 rounded-full">
                                  {model.badge}
                                </span>

                                {model.is_vision && (
                                  <span className="text-[10px] font-semibold text-foreground/80 bg-secondary px-2 py-0.5 rounded-full border border-border flex items-center gap-1">
                                    <Zap className="w-3 h-3 text-amber-500" /> Vision Capable
                                  </span>
                                )}
                              </div>

                              <p className="text-[11px] text-muted-foreground mt-1">
                                Provider: <span className="font-semibold text-foreground">{model.provider}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            <div className="text-right hidden sm:block">
                              <span className="text-xs font-mono font-medium text-foreground">{(model.context_length / 1000).toFixed(0)}k</span>
                              <span className="text-[10px] text-muted-foreground block">tokens ctx</span>
                            </div>

                            <button
                              type="button"
                              disabled={selectingModel}
                              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-accent text-accent-foreground shadow-sm'
                                  : 'bg-secondary text-foreground hover:bg-accent/20 hover:text-accent border border-border'
                              }`}
                            >
                              {isSelected ? 'Active Model' : 'Select'}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Security & Infrastructure info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-background rounded-2xl p-5 border border-border shadow-sm space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>AES-Fernet Symmetric Key Security</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              API keys for both Google Gemini and OpenRouter are encrypted client/server side with AES-128 in CBC mode and HMAC SHA256 authentication before storage. Plaintext keys are never stored in databases.
            </p>
          </div>

          <div className="bg-background rounded-2xl p-5 border border-border shadow-sm space-y-1.5">
            <div className="flex items-center gap-2 text-accent font-semibold">
              <Cloud className="w-4 h-4" />
              <span>Universal Multi-Provider Architecture</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Switch seamlessly between Google AI Studio (Gemini 2.5 Flash, 2.0 Flash, 1.5 Flash) and OpenRouter (Llama 3.3 70B, Qwen 2.5 VL, DeepSeek, Mistral) with zero code changes or downtime.
            </p>
          </div>
        </div>
      </div>
    </ERPLayout>
  );
}
