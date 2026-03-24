import { useState, useEffect, useCallback } from 'react';
import api from '../api';

function fmtINR(n) {
  if (n == null) return '';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

const TYPE_OPTIONS = ['All', 'Apartment', 'Villa', 'Penthouse', 'Plot', 'Townhouse'];
const PRICE_OPTIONS = ['All', 'Under 50L', '50L - 1Cr', '1Cr - 2Cr', '2Cr - 5Cr', '5Cr+'];
const STATUS_OPTIONS = ['All', 'Ready to Move', 'Under Construction', 'Pre-Launch', 'Sold Out'];
const CONSTRUCTION_STATUS_OPTIONS = ['Not Started', 'Foundation', 'Structure', 'Finishing', 'Completed'];
const BHK_OPTIONS = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'];

const INPUT_CLASS = "w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)] text-sm focus:ring-2 focus:ring-[var(--color-gold)] focus:border-transparent";

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=750&fit=crop',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=750&fit=crop',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=750&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=750&fit=crop',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=750&fit=crop',
  'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=600&h=750&fit=crop',
];

function statusBadgeColor(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('ready')) return 'bg-emerald-500 text-white';
  if (s.includes('construction')) return 'bg-amber-500 text-white';
  if (s.includes('pre')) return 'bg-[var(--color-secondary)] text-white';
  if (s.includes('sold')) return 'bg-[var(--color-error)] text-white';
  return 'bg-[var(--color-surface-high)] text-[var(--color-on-surface)]';
}

function PropertyFormModal({ property, onClose, onSaved }) {
  const isEdit = !!property;
  const [form, setForm] = useState({
    name: property?.name || '',
    developer: property?.developer || '',
    location: property?.location || property?.address || '',
    type: property?.type || 'Apartment',
    bhk: property?.bhk || '2 BHK',
    price_min: property?.price_min || '',
    price_max: property?.price_max || '',
    carpet_area: property?.carpet_area || property?.area || '',
    rera_number: property?.rera_number || '',
    status: property?.status || 'Under Construction',
    construction_status: property?.construction_status || 'Structure',
    description: property?.description || '',
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
        price_min: form.price_min ? Number(form.price_min) : null,
        price_max: form.price_max ? Number(form.price_max) : null,
      };
      if (isEdit) {
        await api.updateProperty(property.id, payload);
      } else {
        await api.createProperty(payload);
      }
      onSaved();
    } catch (err) {
      alert(err.message || 'Failed to save property');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto editorial-shadow">
        <h3 className="font-headline text-2xl text-[var(--color-navy-900)] mb-6">
          {isEdit ? 'Edit Property' : 'New Property'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-1 block">Name *</label>
            <input className={INPUT_CLASS} value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Property name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-1 block">Developer</label>
              <input className={INPUT_CLASS} value={form.developer} onChange={(e) => update('developer', e.target.value)} placeholder="Developer name" />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-1 block">Location</label>
              <input className={INPUT_CLASS} value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="e.g. Bandra West" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-1 block">Type</label>
              <select className={INPUT_CLASS} value={form.type} onChange={(e) => update('type', e.target.value)}>
                {TYPE_OPTIONS.filter((t) => t !== 'All').map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-1 block">BHK</label>
              <select className={INPUT_CLASS} value={form.bhk} onChange={(e) => update('bhk', e.target.value)}>
                {BHK_OPTIONS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-1 block">Price Min</label>
              <input className={INPUT_CLASS} type="number" value={form.price_min} onChange={(e) => update('price_min', e.target.value)} placeholder="e.g. 5000000" />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-1 block">Price Max</label>
              <input className={INPUT_CLASS} type="number" value={form.price_max} onChange={(e) => update('price_max', e.target.value)} placeholder="e.g. 10000000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-1 block">Carpet Area</label>
              <input className={INPUT_CLASS} value={form.carpet_area} onChange={(e) => update('carpet_area', e.target.value)} placeholder="e.g. 1200 sq ft" />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-1 block">RERA Number</label>
              <input className={INPUT_CLASS} value={form.rera_number} onChange={(e) => update('rera_number', e.target.value)} placeholder="e.g. P51900028732" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-1 block">Status</label>
              <select className={INPUT_CLASS} value={form.status} onChange={(e) => update('status', e.target.value)}>
                {STATUS_OPTIONS.filter((s) => s !== 'All').map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-1 block">Construction</label>
              <select className={INPUT_CLASS} value={form.construction_status} onChange={(e) => update('construction_status', e.target.value)}>
                {CONSTRUCTION_STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-1 block">Description</label>
            <textarea className={INPUT_CLASS + " h-24 resize-none"} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Property description..." />
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

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [compareIds, setCompareIds] = useState(new Set());
  const [compareData, setCompareData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    price_range: '',
    status: '',
    search: '',
  });

  const fetchProperties = useCallback(async (f) => {
    setLoading(true);
    try {
      const params = {};
      if (f.type && f.type !== 'All') params.type = f.type;
      if (f.price_range && f.price_range !== 'All') params.price_range = f.price_range;
      if (f.status && f.status !== 'All') params.status = f.status;
      if (f.search) params.search = f.search;
      const data = await api.getProperties(params);
      setProperties(Array.isArray(data) ? data : data.properties || []);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties(filters);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function applyFilter(key, value) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    fetchProperties(next);
  }

  function handleSearch(e) {
    const val = e.target.value;
    setFilters((p) => ({ ...p, search: val }));
    clearTimeout(handleSearch._t);
    handleSearch._t = setTimeout(() => fetchProperties({ ...filters, search: val }), 400);
  }

  function toggleCompare(id) {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function imageFor(prop, idx) {
    return prop.image || prop.image_url || prop.thumbnail || PLACEHOLDER_IMAGES[idx % PLACEHOLDER_IMAGES.length];
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    try {
      await api.deleteProperty(id);
      fetchProperties(filters);
    } catch (err) {
      alert(err.message || 'Failed to delete property');
    }
  }

  function handleEdit(prop) {
    setEditingProperty(prop);
    setShowForm(true);
  }

  function handleFormSaved() {
    setShowForm(false);
    setEditingProperty(null);
    fetchProperties(filters);
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Property Form Modal */}
      {showForm && (
        <PropertyFormModal
          property={editingProperty}
          onClose={() => { setShowForm(false); setEditingProperty(null); }}
          onSaved={handleFormSaved}
        />
      )}

      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-gold)] mb-2">
          Curated Collection
        </p>
        <h1 className="font-headline text-5xl md:text-7xl text-[var(--color-navy-900)] leading-[1.05]">
          Property Inventory
        </h1>
        <p className="mt-3 text-[var(--color-on-surface-variant)] text-lg max-w-2xl">
          Handpicked luxury residences with RERA verification, virtual tours, and AI-powered matching to your client preferences.
        </p>
      </div>

      {/* View toggle + New Listing */}
      <div className="flex items-center justify-between">
        <div className="flex items-center bg-[var(--color-surface-high)] rounded-full p-1 gap-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-white text-[var(--color-navy-900)] editorial-shadow'
                : 'text-[var(--color-outline)]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">grid_view</span>
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-[var(--color-navy-900)] editorial-shadow'
                : 'text-[var(--color-outline)]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">view_list</span>
            List
          </button>
        </div>
        <button
          onClick={() => { setEditingProperty(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-[var(--color-navy-900)] text-white px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-[var(--color-navy-800)] transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Listing
        </button>
      </div>

      {/* Sticky filters strip */}
      <div className="sticky top-0 z-30 glass-card editorial-shadow rounded-2xl px-5 py-4 flex flex-wrap items-center gap-4">
        <div className="space-y-0.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Type</label>
          <select
            value={filters.type || 'All'}
            onChange={(e) => applyFilter('type', e.target.value)}
            className="block bg-[var(--color-surface-high)] rounded-lg px-3 py-2 text-sm outline-none"
          >
            {TYPE_OPTIONS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-0.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Price Range</label>
          <select
            value={filters.price_range || 'All'}
            onChange={(e) => applyFilter('price_range', e.target.value)}
            className="block bg-[var(--color-surface-high)] rounded-lg px-3 py-2 text-sm outline-none"
          >
            {PRICE_OPTIONS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="space-y-0.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Status</label>
          <select
            value={filters.status || 'All'}
            onChange={(e) => applyFilter('status', e.target.value)}
            className="block bg-[var(--color-surface-high)] rounded-lg px-3 py-2 text-sm outline-none"
          >
            {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Search</label>
          <div className="flex items-center bg-[var(--color-surface-high)] rounded-lg px-3 py-2 gap-2">
            <span className="material-symbols-outlined text-[16px] text-[var(--color-outline)]">search</span>
            <input
              type="text"
              placeholder="Search properties..."
              value={filters.search}
              onChange={handleSearch}
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-[var(--color-outline)]"
            />
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-3 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Properties grid */}
      {!loading && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {properties.map((prop, idx) => {
            const isComparing = compareIds.has(prop.id);
            const stagger = idx % 3 === 1;
            return (
              <div
                key={prop.id}
                className={`group ${stagger ? 'md:mt-12' : ''}`}
              >
                <div className="bg-white rounded-2xl editorial-shadow overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Image */}
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={imageFor(prop, idx)}
                      alt={prop.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {/* Overlay badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {prop.status && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${statusBadgeColor(prop.status)}`}>
                          {prop.status}
                        </span>
                      )}
                      {prop.rera_verified && (
                        <span className="bg-white/90 backdrop-blur text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1">
                          <span className="material-symbols-outlined filled text-[12px]">verified</span>
                          RERA Verified
                        </span>
                      )}
                    </div>
                    {/* Edit/Delete on hover */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(prop)}
                        className="w-9 h-9 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white"
                      >
                        <span className="material-symbols-outlined text-[20px] text-[var(--color-navy-900)]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(prop.id)}
                        className="w-9 h-9 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white"
                      >
                        <span className="material-symbols-outlined text-[20px] text-[var(--color-error)]">delete</span>
                      </button>
                    </div>
                    {/* Compare checkbox */}
                    <label className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur rounded-full px-3 py-1.5 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium">
                      <input
                        type="checkbox"
                        checked={isComparing}
                        onChange={() => toggleCompare(prop.id)}
                        className="accent-[var(--color-navy-900)]"
                      />
                      Compare
                    </label>
                  </div>
                  {/* Info */}
                  <div className="p-5 space-y-2">
                    <h3 className="font-headline text-2xl text-[var(--color-navy-900)] leading-tight">
                      {prop.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-[var(--color-on-surface-variant)]">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      {prop.location || prop.address || 'Location N/A'}
                    </div>
                    <p className="text-lg font-semibold text-[var(--color-navy-900)]">
                      {prop.price_min && prop.price_max
                        ? `${fmtINR(prop.price_min)} - ${fmtINR(prop.price_max)}`
                        : prop.price || prop.price_range || 'Price on Request'}
                    </p>
                    {(prop.bhk || prop.bedrooms) && (
                      <p className="text-sm text-[var(--color-on-surface-variant)]">
                        {prop.bhk || `${prop.bedrooms} BHK`}
                        {prop.area ? ` | ${prop.area}` : ''}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List view */}
      {!loading && viewMode === 'list' && (
        <div className="space-y-4">
          {properties.map((prop, idx) => {
            const isComparing = compareIds.has(prop.id);
            return (
              <div
                key={prop.id}
                className="bg-white rounded-2xl editorial-shadow flex overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="w-48 h-48 shrink-0 overflow-hidden">
                  <img
                    src={imageFor(prop, idx)}
                    alt={prop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-headline text-2xl text-[var(--color-navy-900)]">{prop.name}</h3>
                      {prop.status && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${statusBadgeColor(prop.status)}`}>
                          {prop.status}
                        </span>
                      )}
                      {prop.rera_verified && (
                        <span className="text-emerald-600 flex items-center gap-0.5 text-xs font-medium">
                          <span className="material-symbols-outlined filled text-[14px]">verified</span>
                          RERA
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-[var(--color-on-surface-variant)]">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      {prop.location || prop.address || 'Location N/A'}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <p className="text-lg font-semibold text-[var(--color-navy-900)]">
                        {prop.price_min && prop.price_max
                          ? `${fmtINR(prop.price_min)} - ${fmtINR(prop.price_max)}`
                          : prop.price || prop.price_range || 'Price on Request'}
                      </p>
                      {(prop.bhk || prop.bedrooms) && (
                        <p className="text-sm text-[var(--color-on-surface-variant)]">
                          {prop.bhk || `${prop.bedrooms} BHK`}
                          {prop.area ? ` | ${prop.area}` : ''}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(prop)}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--color-surface-high)] transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px] text-[var(--color-navy-900)]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(prop.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px] text-[var(--color-error)]">delete</span>
                        </button>
                      </div>
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-[var(--color-on-surface-variant)]">
                        <input
                          type="checkbox"
                          checked={isComparing}
                          onChange={() => toggleCompare(prop.id)}
                          className="accent-[var(--color-navy-900)]"
                        />
                        Compare
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && properties.length === 0 && (
        <div className="text-center py-16 text-[var(--color-outline)]">
          <span className="material-symbols-outlined text-5xl mb-3 block">apartment</span>
          <p className="text-lg">No properties match your criteria</p>
        </div>
      )}

      {/* Compare Modal */}
      {compareData && compareData.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCompareData(null)} />
          <div className="relative bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-auto editorial-shadow">
            <div className="sticky top-0 bg-white z-10 px-8 py-5 border-b border-[var(--color-outline-variant)]/20 flex items-center justify-between">
              <h3 className="font-headline text-2xl text-[var(--color-navy-900)]">Property Comparison</h3>
              <button onClick={() => setCompareData(null)} className="w-9 h-9 rounded-full hover:bg-[var(--color-surface-high)] flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-8">
              <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${compareData.length}, 1fr)` }}>
                {/* Images */}
                {compareData.map((p, i) => (
                  <div key={p.id || i} className="space-y-4">
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[var(--color-surface-high)]">
                      <img src={p.image_url || p.image || PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length]} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <h4 className="font-headline text-xl text-[var(--color-navy-900)]">{p.name}</h4>
                    <p className="text-sm text-[var(--color-on-surface-variant)]">{p.location}</p>
                  </div>
                ))}
              </div>
              {/* Comparison rows */}
              <div className="mt-8 space-y-0">
                {[
                  { label: 'Price', get: p => p.price_min && p.price_max ? `${fmtINR(p.price_min)} - ${fmtINR(p.price_max)}` : fmtINR(p.price_min || p.price_max) || '—' },
                  { label: 'Type', get: p => p.type || '—' },
                  { label: 'BHK', get: p => p.bhk || '—' },
                  { label: 'Carpet Area', get: p => p.carpet_area ? `${p.carpet_area.toLocaleString('en-IN')} sq.ft` : '—' },
                  { label: 'Developer', get: p => p.developer || '—' },
                  { label: 'Status', get: p => p.construction_status === 'ready' ? 'Ready to Move' : p.construction_status || p.status || '—' },
                  { label: 'RERA', get: p => p.rera_verified ? `✓ ${p.rera_number || 'Verified'}` : 'Not Verified' },
                ].map((row, ri) => (
                  <div key={row.label} className={`grid gap-6 py-3 ${ri % 2 === 0 ? 'bg-[var(--color-surface)]' : ''} px-4 rounded-lg`} style={{ gridTemplateColumns: `repeat(${compareData.length}, 1fr)` }}>
                    {compareData.map((p, i) => (
                      <div key={p.id || i}>
                        {i === 0 && <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-1">{row.label}</p>}
                        {i > 0 && <p className="text-[10px] font-bold uppercase tracking-widest text-transparent mb-1">{row.label}</p>}
                        <p className="text-sm font-medium text-[var(--color-navy-900)]">{row.get(p)}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compare bar */}
      {compareIds.size >= 2 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-navy-900)] text-white py-4 px-6 flex items-center justify-between editorial-shadow">
          <span className="font-medium">
            Compare <span className="text-[var(--color-gold)] font-bold">{compareIds.size}</span> properties
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCompareIds(new Set())}
              className="text-sm text-[var(--color-outline-variant)] hover:text-white transition-colors"
            >
              Clear
            </button>
            <button
              onClick={async () => {
                try {
                  const data = await api.compareProperties([...compareIds]);
                  setCompareData(Array.isArray(data) ? data : data.properties || []);
                } catch {
                  // Fallback: use local data
                  setCompareData(properties.filter(p => compareIds.has(p.id)));
                }
              }}
              className="bg-[var(--color-gold)] text-[var(--color-gold-deep)] px-6 py-2.5 rounded-full text-sm font-bold hover:brightness-110 transition"
            >
              Compare Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
