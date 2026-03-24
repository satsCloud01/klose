import { useState, useEffect, useCallback } from 'react';
import api from '../api';

const STATUS_OPTIONS = ['All', 'Hot', 'Warm', 'Cold', 'New'];
const SOURCE_OPTIONS = ['All', 'Instagram', 'Facebook', 'Google Ads', 'Referral', 'Walk-in', 'Website'];
const BHK_OPTIONS = ['All', '1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'];

function intentColor(score) {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 50) return 'bg-amber-400';
  return 'bg-red-400';
}

function avatarColor(name) {
  const colors = [
    'bg-[var(--color-navy-800)]',
    'bg-[var(--color-secondary)]',
    'bg-[var(--color-gold-deep)]',
    'bg-emerald-700',
    'bg-rose-700',
  ];
  const idx = (name || '').charCodeAt(0) % colors.length;
  return colors[idx];
}

function initials(name) {
  return (name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    source: '',
    search: '',
    bhk: '',
  });

  const activeChips = Object.entries(filters).filter(([, v]) => v && v !== 'All');

  const fetchLeads = useCallback(async (f) => {
    setLoading(true);
    try {
      const params = {};
      if (f.status && f.status !== 'All') params.status = f.status;
      if (f.source && f.source !== 'All') params.source = f.source;
      if (f.search) params.search = f.search;
      if (f.bhk && f.bhk !== 'All') params.bhk = f.bhk;
      const data = await api.getLeads(params);
      setLeads(Array.isArray(data) ? data : data.leads || []);
    } catch {
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads(filters);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function applyFilter(key, value) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    fetchLeads(next);
  }

  function removeChip(key) {
    applyFilter(key, '');
  }

  function clearAll() {
    const empty = { status: '', source: '', search: '', bhk: '' };
    setFilters(empty);
    fetchLeads(empty);
  }

  function handleSearch(e) {
    const val = e.target.value;
    setFilters((p) => ({ ...p, search: val }));
    // debounce-like: fetch after user stops typing
    clearTimeout(handleSearch._t);
    handleSearch._t = setTimeout(() => fetchLeads({ ...filters, search: val }), 400);
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="font-headline text-5xl text-[var(--color-navy-900)] leading-tight">
          Leads Management
        </h1>
        <p className="mt-2 text-[var(--color-on-surface-variant)] text-lg max-w-2xl">
          AI-driven intent scoring surfaces your hottest prospects so you never miss a high-value opportunity.
        </p>
      </div>

      {/* Search + Filter button */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center bg-[var(--color-surface-high)] rounded-full px-5 py-3 gap-3">
          <span className="material-symbols-outlined text-[var(--color-outline)]">search</span>
          <input
            type="text"
            placeholder="Search leads by name, phone, or location..."
            value={filters.search}
            onChange={handleSearch}
            className="flex-1 bg-transparent outline-none text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)]"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 bg-[var(--color-navy-900)] text-white px-5 py-3 rounded-full text-sm font-medium hover:bg-[var(--color-navy-800)] transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">tune</span>
          Filters
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="glass-card editorial-shadow rounded-2xl p-5 flex flex-wrap gap-4 items-end">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase tracking-wider">Status</label>
            <select
              value={filters.status || 'All'}
              onChange={(e) => applyFilter('status', e.target.value)}
              className="bg-[var(--color-surface-high)] rounded-lg px-3 py-2 text-sm outline-none"
            >
              {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase tracking-wider">Source</label>
            <select
              value={filters.source || 'All'}
              onChange={(e) => applyFilter('source', e.target.value)}
              className="bg-[var(--color-surface-high)] rounded-lg px-3 py-2 text-sm outline-none"
            >
              {SOURCE_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase tracking-wider">BHK</label>
            <select
              value={filters.bhk || 'All'}
              onChange={(e) => applyFilter('bhk', e.target.value)}
              className="bg-[var(--color-surface-high)] rounded-lg px-3 py-2 text-sm outline-none"
            >
              {BHK_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeChips.map(([key, value]) => (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 bg-[var(--color-navy-900)] text-white text-xs font-medium px-3 py-1.5 rounded-full"
            >
              <span className="capitalize">{key}: {value}</span>
              <button onClick={() => removeChip(key)} className="hover:text-[var(--color-gold)] transition-colors">
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </span>
          ))}
          <button
            onClick={clearAll}
            className="text-xs text-[var(--color-error)] font-medium hover:underline"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-3 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Leads grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {leads.map((lead) => {
            const score = lead.intent_score ?? lead.ai_score ?? 0;
            const isHot = score >= 80;
            return (
              <div
                key={lead.id}
                className="bg-white rounded-2xl editorial-shadow p-6 space-y-4 hover:shadow-lg transition-shadow group"
              >
                {/* Top row: avatar + name */}
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 ${avatarColor(lead.name)}`}
                  >
                    {initials(lead.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-headline text-2xl text-[var(--color-navy-900)] truncate">
                        {lead.name}
                      </h3>
                      {isHot && (
                        <span className="shrink-0 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-red-200">
                          Hot Lead
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-[var(--color-on-surface-variant)] mt-0.5">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      <span className="truncate">{lead.location || lead.city || 'Location N/A'}</span>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-outline)]">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </div>

                {/* Budget */}
                <div className="text-sm text-[var(--color-on-surface-variant)]">
                  <span className="font-medium text-[var(--color-on-surface)]">Budget: </span>
                  {lead.budget_min && lead.budget_max
                    ? `${lead.budget_min} - ${lead.budget_max}`
                    : lead.budget || 'Not specified'}
                </div>

                {/* AI Intent Score */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-on-surface-variant)]">AI Intent Score</span>
                    <span className="font-bold text-[var(--color-navy-900)]">{score}</span>
                  </div>
                  <div className="w-full h-2 bg-[var(--color-surface-high)] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${intentColor(score)}`}
                      style={{ width: `${Math.min(score, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button className="flex-1 flex items-center justify-center gap-2 bg-[var(--color-navy-900)] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[var(--color-navy-800)] transition-colors">
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    Quick WhatsApp
                  </button>
                </div>
              </div>
            );
          })}

          {/* Empty / New Opportunity card */}
          <div className="border-2 border-dashed border-[var(--color-outline-variant)] rounded-2xl flex flex-col items-center justify-center py-16 gap-3 text-[var(--color-outline)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold-deep)] transition-colors cursor-pointer group">
            <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform">
              person_add
            </span>
            <span className="font-medium text-sm">New Opportunity</span>
          </div>
        </div>
      )}

      {/* Empty state when no leads */}
      {!loading && leads.length === 0 && (
        <div className="text-center py-12 text-[var(--color-outline)]">
          <span className="material-symbols-outlined text-5xl mb-3 block">search_off</span>
          <p className="text-lg">No leads match your filters</p>
        </div>
      )}

      {/* FAB */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-[var(--color-gold)] text-[var(--color-gold-deep)] rounded-full editorial-shadow flex items-center justify-center hover:scale-105 transition-transform z-50">
        <span className="material-symbols-outlined text-[28px]">add</span>
      </button>
    </div>
  );
}
