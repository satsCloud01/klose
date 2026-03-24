import { useState, useEffect } from 'react';
import api from '../api';

const FILTERS = ['All Tours', 'Confirmed', 'Pending Feedback', 'Completed'];

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const INPUT_CLS = "w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)] text-sm focus:ring-2 focus:ring-[var(--color-gold)] focus:border-transparent";

function MiniCalendar({ visits = [], selectedDate, onSelectDate }) {
  const [viewDate, setViewDate] = useState(new Date());
  const today = new Date();
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // Build set of dates that have visits
  const visitDates = new Set();
  visits.forEach(v => {
    const d = v.scheduled_at || v.scheduled_date || v.date;
    if (d) {
      const dt = new Date(d);
      if (dt.getFullYear() === year && dt.getMonth() === month) visitDates.add(dt.getDate());
    }
  });

  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const isSelected = (d) => {
    if (!selectedDate) return false;
    const sd = new Date(selectedDate);
    return d === sd.getDate() && month === sd.getMonth() && year === sd.getFullYear();
  };

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const handleClick = (d) => {
    if (!d) return;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    onSelectDate?.(selectedDate === dateStr ? null : dateStr);
  };

  return (
    <div className="bg-white rounded-2xl p-5 editorial-shadow">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-headline text-lg text-[var(--color-navy-900)]">{monthName}</h4>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="w-7 h-7 rounded-full hover:bg-[var(--color-surface-high)] flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-base">chevron_left</span>
          </button>
          <button onClick={nextMonth} className="w-7 h-7 rounded-full hover:bg-[var(--color-surface-high)] flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-base">chevron_right</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
        {DAYS.map((d, i) => (
          <span key={i} className="text-[var(--color-outline)] font-medium py-1">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {cells.map((d, i) => {
          const hasVisit = d && visitDates.has(d);
          return (
            <button
              key={i}
              onClick={() => handleClick(d)}
              disabled={!d}
              className={`py-1.5 rounded-lg transition-all relative ${
                isSelected(d)
                  ? 'bg-[var(--color-gold)] text-[var(--color-navy-900)] font-bold ring-2 ring-[var(--color-gold)] ring-offset-1'
                  : isToday(d)
                    ? 'bg-[var(--color-navy-900)] text-white font-semibold'
                    : d
                      ? 'text-[var(--color-on-surface)] hover:bg-[var(--color-surface-high)] cursor-pointer'
                      : 'cursor-default'
              }`}
            >
              {d || ''}
              {hasVisit && !isSelected(d) && !isToday(d) && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--color-gold)]" />
              )}
            </button>
          );
        })}
      </div>
      {selectedDate && (
        <button onClick={() => onSelectDate(null)} className="mt-3 w-full text-xs text-[var(--color-secondary)] font-medium hover:underline">
          Clear date filter
        </button>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    confirmed: { bg: 'bg-emerald-50 text-emerald-700', icon: 'check_circle' },
    pending: { bg: 'bg-[var(--color-secondary-fixed)] text-[var(--color-secondary)]', icon: 'schedule' },
    'awaiting feedback': { bg: 'bg-[var(--color-secondary-fixed)] text-[var(--color-secondary)] border-l-4 border-[var(--color-gold)]', icon: 'rate_review' },
    completed: { bg: 'bg-blue-50 text-blue-700', icon: 'task_alt' },
    'no-show': { bg: 'bg-[var(--color-error-container)] text-[var(--color-error)]', icon: 'person_off' },
    cancelled: { bg: 'bg-red-50 text-red-700', icon: 'cancel' },
  };
  const s = map[(status || '').toLowerCase()] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg}`}>
      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{s.icon}</span>
      {status}
    </span>
  );
}

function VisitFormModal({ visit, onClose, onSave }) {
  const isEdit = !!visit;
  const [form, setForm] = useState({
    lead_name: visit?.lead_name || '',
    lead_id: visit?.lead_id || '',
    property_name: visit?.property_name || '',
    property_id: visit?.property_id || '',
    agent_name: visit?.agent_name || '',
    agent_id: visit?.agent_id || '',
    scheduled_date: visit?.scheduled_date || visit?.date || '',
    scheduled_time: visit?.scheduled_time || visit?.time || '',
    status: visit?.status || 'Pending',
    feedback: visit?.feedback || '',
    rating: visit?.rating || '',
  });

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    try {
      if (isEdit) {
        await api.updateVisit(visit.id, form);
      } else {
        await api.createVisit(form);
      }
      onSave();
    } catch (e) {
      alert(e.message || 'Failed to save visit');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto editorial-shadow">
        <h3 className="font-headline text-2xl text-[var(--color-navy-900)] mb-6">{isEdit ? 'Edit Visit' : 'Schedule Visit'}</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-on-surface-variant)] mb-1">Lead Name</label>
            <input value={form.lead_name} onChange={e => set('lead_name', e.target.value)} className={INPUT_CLS} placeholder="Lead name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-on-surface-variant)] mb-1">Lead ID</label>
            <input value={form.lead_id} onChange={e => set('lead_id', e.target.value)} className={INPUT_CLS} placeholder="Lead ID (optional)" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-on-surface-variant)] mb-1">Property Name</label>
            <input value={form.property_name} onChange={e => set('property_name', e.target.value)} className={INPUT_CLS} placeholder="Property name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-on-surface-variant)] mb-1">Property ID</label>
            <input value={form.property_id} onChange={e => set('property_id', e.target.value)} className={INPUT_CLS} placeholder="Property ID (optional)" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-on-surface-variant)] mb-1">Agent Name</label>
            <input value={form.agent_name} onChange={e => set('agent_name', e.target.value)} className={INPUT_CLS} placeholder="Agent name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-on-surface-variant)] mb-1">Agent ID</label>
            <input value={form.agent_id} onChange={e => set('agent_id', e.target.value)} className={INPUT_CLS} placeholder="Agent ID (optional)" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-on-surface-variant)] mb-1">Scheduled Date & Time</label>
            <input
              type="datetime-local"
              value={form.scheduled_date ? `${form.scheduled_date}T${form.scheduled_time || '10:00'}` : ''}
              onChange={e => {
                const [d, t] = e.target.value.split('T');
                set('scheduled_date', d);
                setForm(prev => ({ ...prev, scheduled_date: d, scheduled_time: t }));
              }}
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-on-surface-variant)] mb-1">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className={INPUT_CLS}>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {isEdit && (
            <>
              <div>
                <label className="block text-sm font-medium text-[var(--color-on-surface-variant)] mb-1">Feedback</label>
                <textarea value={form.feedback} onChange={e => set('feedback', e.target.value)} rows={3} className={INPUT_CLS} placeholder="Visit feedback..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-on-surface-variant)] mb-1">Rating</label>
                <select value={form.rating} onChange={e => set('rating', e.target.value)} className={INPUT_CLS}>
                  <option value="">No rating</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-[var(--color-surface-high)] text-sm font-medium">Cancel</button>
          <button onClick={handleSubmit} className="flex-1 py-3 rounded-xl bg-[#152040] text-white text-sm font-medium">Save</button>
        </div>
      </div>
    </div>
  );
}

function VisitCard({ visit, onEdit, onDelete }) {
  const borderColor =
    (visit.status || '').toLowerCase() === 'confirmed'
      ? 'border-l-emerald-500'
      : (visit.status || '').toLowerCase() === 'awaiting feedback'
        ? 'border-l-[var(--color-gold)]'
        : (visit.status || '').toLowerCase() === 'no-show'
          ? 'border-l-[var(--color-error)]'
          : 'border-l-[var(--color-secondary)]';

  return (
    <div className={`bg-white rounded-2xl p-5 editorial-shadow border-l-4 ${borderColor} flex gap-5 items-start hover:shadow-lg transition-shadow`}>
      <div className="w-24 h-24 rounded-lg bg-[var(--color-surface-high)] flex-shrink-0 overflow-hidden">
        {visit.property_image ? (
          <img src={visit.property_image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[var(--color-outline)]" style={{ fontSize: 32 }}>home</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1.5">
          <span className="text-sm text-[var(--color-outline)]">{visit.time || visit.scheduled_time || '10:00 AM'}</span>
          <StatusBadge status={visit.status || 'Pending'} />
        </div>
        <h3 className="font-headline text-2xl text-[var(--color-navy-900)] truncate">{visit.lead_name || 'Lead'}</h3>
        <p className="text-sm text-[var(--color-on-surface-variant)] mt-1 truncate">
          Visiting: <span className="font-medium">{visit.property_name || 'Property'}</span>
          {visit.agent_name && <> &bull; Agent: <span className="font-medium">{visit.agent_name}</span></>}
        </p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onEdit(visit)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--color-navy-900)] text-white hover:opacity-90 transition-opacity flex items-center gap-1"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>visibility</span> View Details
          </button>
          <button
            onClick={() => onEdit(visit)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-high)] transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span> Reschedule
          </button>
          <button
            onClick={() => onDelete(visit)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span> Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SiteVisits() {
  const [visits, setVisits] = useState([]);
  const [stats, setStats] = useState({ confirmed: 12, pending: 4, completed: 0, total: 0 });
  const [activeFilter, setActiveFilter] = useState('All Tours');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVisit, setEditingVisit] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.getVisits().catch(() => []),
      api.getVisitStats().catch(() => ({})),
    ]).then(([v, s]) => {
      setVisits(Array.isArray(v) ? v : v.visits || []);
      if (s && typeof s === 'object') setStats(prev => ({ ...prev, ...s }));
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = () => {
    setShowForm(false);
    setEditingVisit(null);
    fetchData();
  };

  const handleEdit = (visit) => {
    setEditingVisit(visit);
    setShowForm(true);
  };

  const handleDelete = async (visit) => {
    if (!window.confirm('Delete this visit?')) return;
    try {
      await api.deleteVisit(visit.id);
      fetchData();
    } catch (e) {
      alert(e.message || 'Failed to delete visit');
    }
  };

  const filtered = visits.filter(v => {
    // Date filter
    if (selectedDate) {
      const vd = v.scheduled_at || v.scheduled_date || v.date || '';
      if (!vd.startsWith(selectedDate)) return false;
    }
    // Status filter
    if (activeFilter === 'All Tours') return true;
    const s = (v.status || '').toLowerCase();
    if (activeFilter === 'Confirmed') return s === 'confirmed';
    if (activeFilter === 'Pending Feedback') return s === 'pending' || s === 'awaiting feedback';
    if (activeFilter === 'Completed') return s === 'completed';
    return true;
  });

  const spotlight = visits[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-headline text-5xl md:text-6xl text-[var(--color-navy-900)]">Site Visits</h1>
        <p className="text-[var(--color-on-surface-variant)] mt-2 text-lg max-w-2xl">
          Curate the physical journey for every prospect. Schedule tours, track confirmations, and turn walkthroughs into signed deals.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Mini Calendar */}
          <MiniCalendar visits={visits} selectedDate={selectedDate} onSelectDate={setSelectedDate} />

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--color-secondary-fixed)] rounded-2xl p-5 editorial-shadow text-center">
              <p className="text-3xl font-bold text-[var(--color-secondary)]">{stats.confirmed ?? 12}</p>
              <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">Confirmed</p>
            </div>
            <div className="bg-[var(--color-surface-high)] rounded-2xl p-5 editorial-shadow text-center border-b-4 border-[var(--color-gold)]">
              <p className="text-3xl font-bold text-[var(--color-gold-deep)]">{String(stats.pending ?? 4).padStart(2, '0')}</p>
              <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">Pending</p>
            </div>
          </div>

          {/* Property Spotlight */}
          <div className="relative rounded-2xl overflow-hidden editorial-shadow h-56">
            <div className="absolute inset-0 bg-[var(--color-navy-800)]">
              {spotlight?.property_image && (
                <img src={spotlight.property_image} alt="" className="w-full h-full object-cover opacity-60" />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-navy-900)] via-transparent to-transparent" />
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--color-gold)] text-[var(--color-gold-deep)]">
                Most Visited
              </span>
            </div>
            <div className="absolute bottom-4 left-5 right-5 text-white">
              <h3 className="font-headline text-xl">{spotlight?.property_name || 'Riverside Towers A-201'}</h3>
              <p className="text-[var(--color-gold-light)] font-semibold mt-0.5">
                {spotlight?.property_price || '\u20B91.85 Cr'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Main */}
        <div className="col-span-12 lg:col-span-8 space-y-5">
          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeFilter === f
                    ? 'bg-[var(--color-navy-900)] text-white shadow-md'
                    : 'bg-white text-[var(--color-on-surface-variant)] editorial-shadow hover:bg-[var(--color-surface-high)]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Visit Cards */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <span className="material-symbols-outlined animate-spin text-[var(--color-outline)]" style={{ fontSize: 32 }}>progress_activity</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 editorial-shadow text-center">
              <span className="material-symbols-outlined text-[var(--color-outline)]" style={{ fontSize: 48 }}>event_busy</span>
              <p className="text-[var(--color-on-surface-variant)] mt-3">No visits match this filter.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((visit, i) => (
                <VisitCard key={visit.id || i} visit={visit} onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => { setEditingVisit(null); setShowForm(true); }}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-[var(--color-gold)] text-[var(--color-gold-deep)] editorial-shadow hover:scale-105 transition-transform flex items-center justify-center z-40"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 28 }}>add_location_alt</span>
      </button>

      {/* Modal */}
      {showForm && (
        <VisitFormModal
          visit={editingVisit}
          onClose={() => { setShowForm(false); setEditingVisit(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
