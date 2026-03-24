import { useState, useEffect } from 'react';
import api from '../api';

const STORAGE_KEY = 'klose_api_key';

export default function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem(STORAGE_KEY) || '';
    setApiKey(existing);
    setHasKey(!!existing);
  }, []);

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, apiKey);
    setHasKey(!!apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleClear() {
    localStorage.removeItem(STORAGE_KEY);
    setApiKey('');
    setHasKey(false);
    setSaved(false);
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">

        {/* Header */}
        <h1 className="font-headline text-4xl text-[#000828]">Settings</h1>

        {/* API Key Section */}
        <div className="bg-white rounded-2xl editorial-shadow p-8 space-y-5">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl text-[#e3c285]">key</span>
            <h2 className="font-headline text-2xl text-[#000828]">AI Configuration</h2>
          </div>
          <p className="text-sm text-[#000828]/60">
            Bring your own key (BYOK). Your AI API key is stored locally in your browser and never sent to our servers.
          </p>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-[#000828]/70">AI API Key</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => { setApiKey(e.target.value); setSaved(false); }}
                  placeholder="sk-ant-..."
                  className="w-full px-4 py-3 rounded-xl border border-[#000828]/10 bg-[#f7f9fc] text-sm text-[#000828] placeholder:text-[#000828]/30 focus:outline-none focus:ring-2 focus:ring-[#e3c285]/50 focus:border-[#e3c285]"
                />
              </div>
              <button
                onClick={handleSave}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#e3c285] to-amber-400 text-[#000828] font-semibold text-sm hover:brightness-110 transition"
              >
                Save
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-3 rounded-xl border border-[#000828]/10 text-sm text-[#000828]/60 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
              >
                Clear
              </button>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${hasKey ? 'bg-emerald-500' : 'bg-red-400'}`} />
              <span className="text-xs text-[#000828]/50">
                {hasKey ? 'API key configured' : 'No API key set'}
              </span>
              {saved && (
                <span className="text-xs text-emerald-600 font-medium ml-2">Saved</span>
              )}
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-2xl editorial-shadow p-8 space-y-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl text-[#000828]/40">info</span>
            <h2 className="font-headline text-2xl text-[#000828]">About</h2>
          </div>
          <div className="space-y-3 text-sm text-[#000828]/60">
            <div className="flex justify-between py-2 border-b border-[#000828]/5">
              <span>Application</span>
              <span className="font-semibold text-[#000828]">Klose CRM</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#000828]/5">
              <span>Version</span>
              <span className="font-mono text-[#000828]">v1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#000828]/5">
              <span>Frontend</span>
              <span className="text-[#000828]">React 18 + Vite + Tailwind CSS</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#000828]/5">
              <span>Backend</span>
              <span className="text-[#000828]">FastAPI + Python 3.12 + SQLite</span>
            </div>
            <div className="flex justify-between py-2">
              <span>AI Engine</span>
              <span className="text-[#000828]">AI Engine (BYOK)</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
