import { useState, useEffect, useCallback } from 'react';
import api from '../api';

function fmtINR(n) {
  if (n == null) return '';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

const STATUS_OPTIONS = ['All', 'Hot', 'Warm', 'Cold', 'New'];
const SOURCE_OPTIONS = ['All', 'Instagram', 'Facebook', 'Google Ads', 'Referral', 'Walk-in', 'Website'];
const BHK_OPTIONS = ['All', '1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'];

const INPUT_CLASS = "w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)] text-sm focus:ring-2 focus:ring-[var(--color-gold)] focus:border-transparent";

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

function LeadFormModal({ lead, onClose, onSaved }) {
  const isEdit = !!lead;
  const [form, setForm] = useState({
    name: lead?.name || '',
    phone: lead?.phone || '',
    email: lead?.email || '',
    source: lead?.source || 'Instagram',
    budget_min: lead?.budget_min || '',
    budget_max: lead?.budget_max || '',
    preferred_bhk: lead?.preferred_bhk || lead?.bhk || '2 BHK',
    preferred_location: lead?.preferred_location || lead?.location || '',
    notes: lead?.notes || '',
  });
  const [saving, setSaving] = useState(false);

  function update(key, value) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function handleSubmit() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        budget_min: form.budget_min ? Number(form.budget_min) : null,
        budget_max: form.budget_max ? Number(form.budget_max) : null,
      };
      if (isEdit) {
        await api.updateLead(lead.id, payload);
      } else {
        await api.createLead(payload);
      }
      onSaved();
    } catch (err) {
      alert(err.message || 'Failed to save lead');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto editorial-shadow">
        <h3 className="font-headline text-2xl text-[var(--color-navy-900)] mb-6">
          {isEdit ? 'Edit Lead' : 'New Lead'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-1 block">Name *</label>
            <input className={INPUT_CLASS} value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Full name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-1 block">Phone</label>
              <input className={INPUT_CLASS} value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-1 block">Email</label>
              <input className={INPUT_CLASS} type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="email@example.com" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-1 block">Source</label>
            <select className={INPUT_CLASS} value={form.source} onChange={(e) => update('source', e.target.value)}>
              {SOURCE_OPTIONS.filter((s) => s !== 'All').map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-1 block">Budget Min</label>
              <input className={INPUT_CLASS} type="number" value={form.budget_min} onChange={(e) => update('budget_min', e.target.value)} placeholder="e.g. 5000000" />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-1 block">Budget Max</label>
              <input className={INPUT_CLASS} type="number" value={form.budget_max} onChange={(e) => update('budget_max', e.target.value)} placeholder="e.g. 10000000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-1 block">Preferred BHK</label>
              <select className={INPUT_CLASS} value={form.preferred_bhk} onChange={(e) => update('preferred_bhk', e.target.value)}>
                {BHK_OPTIONS.filter((b) => b !== 'All').map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-1 block">Preferred Location</label>
              <input className={INPUT_CLASS} value={form.preferred_location} onChange={(e) => update('preferred_location', e.target.value)} placeholder="e.g. Bandra West" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-1 block">Notes</label>
            <textarea className={INPUT_CLASS + " h-24 resize-none"} value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Any additional notes..." />
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-[var(--color-surface-high)] text-sm font-medium">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="flex-1 py-3 rounded-xl bg-[#152040] text-white text-sm font-medium disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
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
    clearTimeout(handleSearch._t);
    handleSearch._t = setTimeout(() => fetchLeads({ ...filters, search: val }), 400);
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      await api.deleteLead(id);
      fetchLeads(filters);
    } catch (err) {
      alert(err.message || 'Failed to delete lead');
    }
  }

  function handleEdit(lead) {
    setEditingLead(lead);
    setShowForm(true);
    setOpenMenuId(null);
  }

  function handleFormSaved() {
    setShowForm(false);
    setEditingLead(null);
    fetchLeads(filters);
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Lead Form Modal */}
      {showForm && (
        <LeadFormModal
          lead={editingLead}
          onClose={() => { setShowForm(false); setEditingLead(null); }}
          onSaved={handleFormSaved}
        />
      )}

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
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === lead.id ? null : lead.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-outline)]"
                    >
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                    {openMenuId === lead.id && (
                      <div className="absolute right-0 top-8 bg-white rounded-xl editorial-shadow py-1 z-20 min-w-[140px]">
                        <button
                          onClick={() => handleEdit(lead)}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--color-on-surface)] hover:bg-[var(--color-surface-high)] transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                          Edit
                        </button>
                        <button
                          onClick={() => { setOpenMenuId(null); handleDelete(lead.id); }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--color-error)] hover:bg-red-50 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Budget */}
                <div className="text-sm text-[var(--color-on-surface-variant)]">
                  <span className="font-medium text-[var(--color-on-surface)]">Budget: </span>
                  {lead.budget_min && lead.budget_max
                    ? `${fmtINR(lead.budget_min)} - ${fmtINR(lead.budget_max)}`
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
          <div
            onClick={() => { setEditingLead(null); setShowForm(true); }}
            className="border-2 border-dashed border-[var(--color-outline-variant)] rounded-2xl flex flex-col items-center justify-center py-16 gap-3 text-[var(--color-outline)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold-deep)] transition-colors cursor-pointer group"
          >
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
      <button
        onClick={() => { setEditingLead(null); setShowForm(true); }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-[var(--color-gold)] text-[var(--color-gold-deep)] rounded-full editorial-shadow flex items-center justify-center hover:scale-105 transition-transform z-50"
      >
        <span className="material-symbols-outlined text-[28px]">add</span>
      </button>
    </div>
  );
}
