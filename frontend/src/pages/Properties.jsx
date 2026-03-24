import { useState, useEffect, useCallback } from 'react';
import api from '../api';

const TYPE_OPTIONS = ['All', 'Apartment', 'Villa', 'Penthouse', 'Plot', 'Townhouse'];
const PRICE_OPTIONS = ['All', 'Under 50L', '50L - 1Cr', '1Cr - 2Cr', '2Cr - 5Cr', '5Cr+'];
const STATUS_OPTIONS = ['All', 'Ready to Move', 'Under Construction', 'Pre-Launch', 'Sold Out'];

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

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [compareIds, setCompareIds] = useState(new Set());
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

  return (
    <div className="space-y-6 pb-24">
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
        <button className="flex items-center gap-2 bg-[var(--color-navy-900)] text-white px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-[var(--color-navy-800)] transition-colors">
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
                    {/* Favorite on hover */}
                    <button className="absolute top-3 right-3 w-9 h-9 bg-white/80 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                      <span className="material-symbols-outlined text-[20px] text-[var(--color-error)]">favorite</span>
                    </button>
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
                        ? `${prop.price_min} - ${prop.price_max}`
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
                          ? `${prop.price_min} - ${prop.price_max}`
                          : prop.price || prop.price_range || 'Price on Request'}
                      </p>
                      {(prop.bhk || prop.bedrooms) && (
                        <p className="text-sm text-[var(--color-on-surface-variant)]">
                          {prop.bhk || `${prop.bedrooms} BHK`}
                          {prop.area ? ` | ${prop.area}` : ''}
                        </p>
                      )}
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
            <button className="bg-[var(--color-gold)] text-[var(--color-gold-deep)] px-6 py-2.5 rounded-full text-sm font-bold hover:brightness-110 transition">
              Compare Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
