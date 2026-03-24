import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../api';

const STAGES = [
  { id: 'lead_capture', name: 'Lead Capture', color: 'cyan-600', border: 'border-l-cyan-600', bg: 'bg-cyan-50', text: 'text-cyan-700', badge: 'bg-cyan-100 text-cyan-700' },
  { id: 'qualification', name: 'Qualification', color: 'indigo-600', border: 'border-l-indigo-600', bg: 'bg-indigo-50', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-700' },
  { id: 'site_visit', name: 'Site Visit', color: 'blue-600', border: 'border-l-blue-600', bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
  { id: 'negotiation', name: 'Negotiation', color: 'amber-600', border: 'border-l-amber-600', bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
  { id: 'agreement', name: 'Agreement', color: 'emerald-600', border: 'border-l-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
  { id: 'documentation', name: 'Documentation', color: 'slate-600', border: 'border-l-slate-600', bg: 'bg-slate-50', text: 'text-slate-700', badge: 'bg-slate-100 text-slate-700' },
  { id: 'registration', name: 'Registration', color: 'slate-600', border: 'border-l-slate-600', bg: 'bg-slate-50', text: 'text-slate-700', badge: 'bg-slate-100 text-slate-700' },
  { id: 'possession', name: 'Possession', color: 'primary', border: 'border-l-[var(--color-navy-900)]', bg: 'bg-[var(--color-surface-low)]', text: 'text-[var(--color-navy-900)]', badge: 'bg-[var(--color-navy-800)] text-white' },
];

const INPUT_CLS = "w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)] text-sm focus:ring-2 focus:ring-[var(--color-gold)] focus:border-transparent";

function formatValue(v) {
  if (!v) return '\u20B90';
  const num = typeof v === 'number' ? v : parseFloat(v);
  if (num >= 10000000) return `\u20B9${(num / 10000000).toFixed(1)} Cr`;
  if (num >= 100000) return `\u20B9${(num / 100000).toFixed(1)} L`;
  return `\u20B9${num.toLocaleString('en-IN')}`;
}

function timeAgo(date) {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function DealFormModal({ deal, onClose, onSave }) {
  const isEdit = !!deal;
  const [form, setForm] = useState({
    lead_name: deal?.lead_name || deal?.name || '',
    property_name: deal?.property_name || '',
    stage: deal?.stage || 'lead_capture',
    value: deal?.value || '',
    probability: deal?.probability ?? '',
    expected_close_date: deal?.expected_close_date || '',
    notes: deal?.notes || '',
  });

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    const payload = {
      ...form,
      value: form.value ? Number(form.value) : 0,
      probability: form.probability !== '' ? Number(form.probability) : null,
    };
    try {
      if (isEdit) {
        await api.updateDeal(deal.id, payload);
      } else {
        await api.createDeal(payload);
      }
      onSave();
    } catch (e) {
      alert(e.message || 'Failed to save deal');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto editorial-shadow">
        <h3 className="font-headline text-2xl text-[var(--color-navy-900)] mb-6">{isEdit ? 'Edit Deal' : 'New Deal'}</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-on-surface-variant)] mb-1">Lead Name</label>
            <input value={form.lead_name} onChange={e => set('lead_name', e.target.value)} className={INPUT_CLS} placeholder="Lead name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-on-surface-variant)] mb-1">Property Name</label>
            <input value={form.property_name} onChange={e => set('property_name', e.target.value)} className={INPUT_CLS} placeholder="Property name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-on-surface-variant)] mb-1">Stage</label>
            <select value={form.stage} onChange={e => set('stage', e.target.value)} className={INPUT_CLS}>
              {STAGES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-on-surface-variant)] mb-1">Value</label>
            <input type="number" value={form.value} onChange={e => set('value', e.target.value)} className={INPUT_CLS} placeholder="Deal value" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-on-surface-variant)] mb-1">Probability (0-100)</label>
            <input type="number" min="0" max="100" value={form.probability} onChange={e => set('probability', e.target.value)} className={INPUT_CLS} placeholder="Probability %" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-on-surface-variant)] mb-1">Expected Close Date</label>
            <input type="date" value={form.expected_close_date} onChange={e => set('expected_close_date', e.target.value)} className={INPUT_CLS} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-on-surface-variant)] mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} className={INPUT_CLS} placeholder="Deal notes..." />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-[var(--color-surface-high)] text-sm font-medium">Cancel</button>
          <button onClick={handleSubmit} className="flex-1 py-3 rounded-xl bg-[#152040] text-white text-sm font-medium">Save</button>
        </div>
      </div>
    </div>
  );
}

function DealCard({ deal, stage, index, onEdit, onDelete }) {
  return (
    <Draggable draggableId={String(deal.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group relative bg-white rounded-xl p-4 editorial-shadow border-l-4 ${stage.border} mb-3 cursor-grab active:cursor-grabbing transition-shadow ${
            snapshot.isDragging ? 'shadow-2xl ring-2 ring-[var(--color-gold)]/30 rotate-1' : 'hover:shadow-lg'
          }`}
        >
          {/* Delete button - visible on hover */}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(deal); }}
            className="absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete deal"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
          </button>

          <div className="flex items-start justify-between mb-2 pr-6">
            <h4
              className="font-headline text-lg text-[var(--color-navy-900)] leading-tight cursor-pointer hover:underline"
              onClick={() => onEdit(deal)}
            >
              {deal.lead_name || deal.name || 'Unknown'}
            </h4>
            {deal.probability != null && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stage.badge}`}>
                {deal.probability}%
              </span>
            )}
          </div>
          <p className="text-xl font-bold text-[var(--color-navy-900)]">{formatValue(deal.value)}</p>
          {deal.next_action && (
            <div className="flex items-center gap-1.5 mt-2 text-sm text-[var(--color-on-surface-variant)]">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>task_alt</span>
              <span className="truncate">{deal.next_action}</span>
            </div>
          )}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-surface-high)]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[var(--color-secondary-fixed)] flex items-center justify-center text-xs font-bold text-[var(--color-secondary)]">
                {(deal.agent_name || deal.agent || 'A').charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-[var(--color-outline)]">{deal.agent_name || deal.agent || ''}</span>
            </div>
            {deal.updated_at && (
              <span className="text-xs text-[var(--color-outline)]">{timeAgo(deal.updated_at)}</span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}

function StageColumn({ stage, deals, onEdit, onDelete }) {
  const totalValue = deals.reduce((sum, d) => sum + (typeof d.value === 'number' ? d.value : parseFloat(d.value) || 0), 0);

  return (
    <div className="min-w-[320px] max-w-[320px] flex-shrink-0 snap-start">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={`font-semibold text-sm ${stage.text}`}>{stage.name}</h3>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stage.badge}`}>{deals.length}</span>
        </div>
        <p className="text-xs text-[var(--color-outline)]">Forecast: {formatValue(totalValue)}</p>
      </div>
      <Droppable droppableId={stage.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[200px] rounded-xl p-2 transition-colors ${
              snapshot.isDraggingOver ? `${stage.bg} ring-2 ring-dashed ring-[var(--color-outline-variant)]` : 'bg-transparent'
            }`}
          >
            {deals.length === 0 && !snapshot.isDraggingOver ? (
              <div className="border-2 border-dashed border-[var(--color-outline-variant)] rounded-xl p-8 text-center">
                <span className="material-symbols-outlined text-[var(--color-outline)]" style={{ fontSize: 24 }}>inbox</span>
                <p className="text-xs text-[var(--color-outline)] mt-2">Empty Stage</p>
              </div>
            ) : (
              deals.map((deal, i) => (
                <DealCard key={deal.id} deal={deal} stage={stage} index={i} onEdit={onEdit} onDelete={onDelete} />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

export default function Pipeline() {
  const [pipeline, setPipeline] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);

  const fetchPipeline = () => {
    setLoading(true);
    api.getPipeline()
      .then(data => {
        if (data.stages && Array.isArray(data.stages)) {
          const map = {};
          data.stages.forEach(s => { map[s.id || s.stage] = s.deals || []; });
          setPipeline(map);
        } else if (Array.isArray(data)) {
          const map = {};
          STAGES.forEach(s => { map[s.id] = []; });
          data.forEach(deal => {
            const stageId = (deal.stage || 'lead_capture').toLowerCase().replace(/\s+/g, '_');
            if (!map[stageId]) map[stageId] = [];
            map[stageId].push(deal);
          });
          setPipeline(map);
        } else {
          setPipeline(data);
        }
      })
      .catch(() => {
        const empty = {};
        STAGES.forEach(s => { empty[s.id] = []; });
        setPipeline(empty);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPipeline(); }, []);

  const handleSave = () => {
    setShowForm(false);
    setEditingDeal(null);
    fetchPipeline();
  };

  const handleEdit = (deal) => {
    setEditingDeal(deal);
    setShowForm(true);
  };

  const handleDelete = async (deal) => {
    if (!window.confirm('Delete this deal?')) return;
    try {
      await api.deleteDeal(deal.id);
      fetchPipeline();
    } catch (e) {
      alert(e.message || 'Failed to delete deal');
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const dealId = parseInt(result.draggableId);
    const sourceStage = source.droppableId;
    const destStage = destination.droppableId;

    setPipeline(prev => {
      const next = { ...prev };
      const sourceDeals = [...(next[sourceStage] || [])];
      const [moved] = sourceDeals.splice(source.index, 1);
      if (!moved) return prev;

      const updatedDeal = { ...moved, stage: destStage };

      if (sourceStage === destStage) {
        sourceDeals.splice(destination.index, 0, updatedDeal);
        next[sourceStage] = sourceDeals;
      } else {
        next[sourceStage] = sourceDeals;
        const destDeals = [...(next[destStage] || [])];
        destDeals.splice(destination.index, 0, updatedDeal);
        next[destStage] = destDeals;
      }
      return next;
    });

    if (sourceStage !== destStage) {
      api.updateDeal(dealId, { stage: destStage }).catch(() => {
        fetchPipeline();
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="material-symbols-outlined animate-spin text-[var(--color-outline)]" style={{ fontSize: 40 }}>progress_activity</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-headline text-4xl md:text-5xl text-[var(--color-navy-900)]">Deal Pipeline</h1>
          <p className="text-[var(--color-on-surface-variant)] mt-2 text-lg max-w-xl">
            Track every deal from first contact to possession. Drag cards between stages to update progress.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white editorial-shadow text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-high)] transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>filter_list</span>
            Filter
          </button>
          <button
            onClick={() => { setEditingDeal(null); setShowForm(true); }}
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-[var(--color-navy-900)] text-white hover:opacity-90 transition-opacity flex items-center gap-2 editorial-shadow"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
            New Deal
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-5 overflow-x-auto no-scrollbar snap-x pb-4 -mx-2 px-2">
          {STAGES.map(stage => (
            <StageColumn
              key={stage.id}
              stage={stage}
              deals={pipeline[stage.id] || []}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </DragDropContext>

      {/* Modal */}
      {showForm && (
        <DealFormModal
          deal={editingDeal}
          onClose={() => { setShowForm(false); setEditingDeal(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
