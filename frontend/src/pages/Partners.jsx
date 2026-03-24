import { useState, useEffect } from 'react';
import api from '../api';

const tierConfig = {
  gold:   { icon: 'star',              bg: 'bg-amber-100 text-amber-800',  badge: 'bg-gradient-to-r from-amber-300 to-yellow-500 text-white' },
  silver: { icon: 'workspace_premium', bg: 'bg-slate-100 text-slate-700',  badge: 'bg-slate-300 text-slate-800' },
  bronze: { icon: 'military_tech',     bg: 'bg-orange-100 text-orange-800', badge: 'bg-orange-300 text-orange-900' },
};

const fallbackPartners = [
  { id: 1, company: 'Meridian Realtors', manager: 'Aditya Kapoor', avatar: null, tier: 'gold', leads: 142, conversion: 31.2, pending: 18500 },
  { id: 2, company: 'Horizon Properties', manager: 'Neha Desai', avatar: null, tier: 'silver', leads: 98, conversion: 24.5, pending: 12200 },
  { id: 3, company: 'Pinnacle Estates', manager: 'Rohit Verma', avatar: null, tier: 'gold', leads: 117, conversion: 28.9, pending: 15800 },
  { id: 4, company: 'Azure Brokers', manager: 'Simran Gill', avatar: null, tier: 'bronze', leads: 64, conversion: 19.1, pending: 6400 },
  { id: 5, company: 'Crestview Realty', manager: 'Karan Malhotra', avatar: null, tier: 'silver', leads: 85, conversion: 22.7, pending: 9300 },
];

const fallbackStats = { network_conversion: 24.8, trend: 3.2, total_payouts: 428500 };

const fallbackCommissions = [
  { id: 1, ref: 'COM-4821', description: 'Meridian Q1 override', amount: 4200, date: '2026-03-15' },
  { id: 2, ref: 'COM-4819', description: 'Horizon referral bonus', amount: 1800, date: '2026-03-12' },
  { id: 3, ref: 'COM-4815', description: 'Pinnacle closing fee', amount: 3500, date: '2026-03-10' },
  { id: 4, ref: 'COM-4810', description: 'Azure lead incentive', amount: 950, date: '2026-03-08' },
  { id: 5, ref: 'COM-4807', description: 'Crestview monthly tier', amount: 2100, date: '2026-03-05' },
];

const barHeights = [40, 65, 55, 80, 70, 90, 75];
const barColors = ['bg-[#f7f9fc]', 'bg-[#e3c285]/60', 'bg-[#e3c285]', 'bg-[#152040]/30', 'bg-[#e3c285]/80', 'bg-[#152040]/50', 'bg-[#e3c285]/40'];

const inputClass = "w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)] text-sm focus:ring-2 focus:ring-[var(--color-gold)] focus:border-transparent";

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2);
}

function PartnerFormModal({ partner, onClose, onSaved }) {
  const isEdit = !!partner;
  const [form, setForm] = useState({
    name: partner?.manager || '',
    company: partner?.company || '',
    phone: partner?.phone || '',
    email: partner?.email || '',
    tier: partner?.tier || 'bronze',
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (isEdit) {
        await api.updatePartner(partner.id, form);
      } else {
        await api.createPartner(form);
      }
      onSaved();
    } catch {
      // fallback: still close and refetch
      onSaved();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto editorial-shadow">
        <h3 className="font-headline text-2xl text-[var(--color-navy-900)] mb-6">
          {isEdit ? 'Edit Partner' : 'Add Partner'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#000828]/60 mb-1">Contact Name</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} className={inputClass} placeholder="e.g. Aditya Kapoor" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#000828]/60 mb-1">Company</label>
            <input value={form.company} onChange={e => set('company', e.target.value)} className={inputClass} placeholder="e.g. Meridian Realtors" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#000828]/60 mb-1">Phone</label>
            <input value={form.phone} onChange={e => set('phone', e.target.value)} className={inputClass} placeholder="+91 98765 43210" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#000828]/60 mb-1">Email</label>
            <input value={form.email} onChange={e => set('email', e.target.value)} className={inputClass} placeholder="partner@company.com" type="email" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#000828]/60 mb-1">Tier</label>
            <select value={form.tier} onChange={e => set('tier', e.target.value)} className={inputClass}>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="bronze">Bronze</option>
            </select>
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

export default function Partners() {
  const [partners, setPartners] = useState([]);
  const [stats, setStats] = useState(null);
  const [commissions, setCommissions] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);

  const fetchData = () => {
    Promise.all([
      api.getPartners().catch(() => null),
      api.getPartnerStats().catch(() => null),
      api.getPartnerCommissions(1).catch(() => null),
    ]).then(([p, s, c]) => {
      setPartners(p?.partners || p || fallbackPartners);
      setStats(s || fallbackStats);
      setCommissions(c?.commissions || c || fallbackCommissions);
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  const handleFormClose = () => { setShowForm(false); setEditingPartner(null); };
  const handleFormSaved = () => { handleFormClose(); fetchData(); };
  const openCreate = () => { setEditingPartner(null); setShowForm(true); };
  const openEdit = (p) => { setEditingPartner(p); setShowForm(true); };

  const st = stats || fallbackStats;
  const displayPartners = activeTab === 'recent' ? partners.slice(0, 3) : partners;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#e3c285] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">

        {/* Header */}
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#e3c285] mb-2">Network Oversight</p>
          <h1 className="font-headline text-5xl md:text-6xl text-[#000828] leading-tight">
            Elevating the <span className="italic">Standard</span> of Brokerage Excellence.
          </h1>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-12 gap-6">
          {/* Main Metric Card */}
          <div className="col-span-12 md:col-span-8 bg-white rounded-2xl editorial-shadow p-8">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#000828]/50 mb-1">Network Conversion</p>
            <div className="flex items-end justify-between">
              <div>
                <span className="font-headline text-6xl text-[#000828]">{st.network_conversion}%</span>
                <span className="ml-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
                  <span className="material-symbols-outlined text-base">trending_up</span>
                  +{st.trend}%
                </span>
              </div>
              <div className="flex items-end gap-1.5 h-20">
                {barHeights.map((h, i) => (
                  <div key={i} className={`flex-1 w-4 rounded-t ${barColors[i]}`} style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>

          {/* Payout Card */}
          <div className="col-span-12 md:col-span-4 bg-[#152040] rounded-2xl editorial-shadow p-8 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/50 mb-1">Total Payouts</p>
              <p className="font-headline text-4xl text-white">₹{(st.total_payouts || st.total_commission || 0).toLocaleString('en-IN')}</p>
            </div>
            <button className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-[#e3c285] to-amber-400 text-[#000828] font-semibold text-sm hover:brightness-110 transition">
              Release Funds
            </button>
          </div>
        </div>

        {/* Partner List + Commission Ledger */}
        <div className="grid grid-cols-12 gap-6">
          {/* Partner List */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-2xl text-[#000828]">Channel Partners</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={openCreate}
                  className="px-4 py-1.5 rounded-lg text-sm font-medium border-2 border-[#e3c285] text-[#e3c285] hover:bg-[#e3c285] hover:text-[#000828] transition flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  Add Partner
                </button>
                <div className="flex bg-[#000828]/5 rounded-lg p-0.5">
                  {['all', 'recent'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                        activeTab === tab ? 'bg-white text-[#000828] editorial-shadow' : 'text-[#000828]/50'
                      }`}
                    >
                      {tab === 'all' ? 'All Partners' : 'Recent Only'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {displayPartners.map(p => {
                const tc = tierConfig[p.tier] || tierConfig.bronze;
                return (
                  <div key={p.id} className="group bg-white rounded-2xl editorial-shadow p-5 flex items-center gap-5 hover:scale-[1.01] transition-transform">
                    {/* Avatar with tier overlay */}
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-full bg-[#000828]/10 flex items-center justify-center text-[#000828] font-headline text-lg">
                        {initials(p.manager || p.company)}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${tc.bg} flex items-center justify-center`}>
                        <span className="material-symbols-outlined text-xs">{tc.icon}</span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-headline text-xl text-[#000828] truncate">{p.company}</p>
                      <p className="text-sm text-[#000828]/50">{p.manager}</p>
                    </div>

                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-semibold text-[#000828]">{p.leads}</p>
                        <p className="text-[#000828]/40">leads</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-[#000828]">{p.conversion}%</p>
                        <p className="text-[#000828]/40">conversion</p>
                      </div>
                    </div>

                    {/* Tier Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${tc.badge}`}>
                      {p.tier}
                    </span>

                    {/* Pending */}
                    <div className="text-right">
                      <p className="font-headline text-lg text-[#000828]">₹{p.pending?.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-[#000828]/40">pending</p>
                    </div>

                    {/* Edit Button */}
                    <button
                      onClick={() => openEdit(p)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-[#000828]/5"
                      title="Edit partner"
                    >
                      <span className="material-symbols-outlined text-lg text-[#000828]/50">edit</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Commission Ledger + Tier Privileges */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Commission Ledger */}
            <div className="bg-[#152040] rounded-2xl editorial-shadow p-6 text-white">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/40 mb-1">Ledger</p>
              <h3 className="font-headline text-xl mb-5">Commission Ledger</h3>
              <div className="space-y-4">
                {commissions.map(c => (
                  <div key={c.id} className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-white/40 font-mono">{c.ref}</p>
                      <p className="text-sm text-white/80">{c.description}</p>
                    </div>
                    <p className="font-headline text-lg text-[#e3c285]">+₹{c.amount?.toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 text-xs text-white/40">
                Next payout cycle: <span className="text-[#e3c285]">April 1, 2026</span>
              </div>
            </div>

            {/* Tier Privileges */}
            <div className="bg-white rounded-2xl editorial-shadow p-6">
              <h3 className="font-headline text-lg text-[#000828] mb-4">Tier Privileges</h3>
              <div className="space-y-3">
                {[
                  { tier: 'Gold', bonus: '15% bonus on all closings', color: 'text-amber-600' },
                  { tier: 'Silver', bonus: '5% bonus on referral closings', color: 'text-slate-500' },
                  { tier: 'Bronze', bonus: 'Standard commission rates', color: 'text-orange-600' },
                ].map(t => (
                  <div key={t.tier} className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${t.color}`}>check_circle</span>
                    <div>
                      <p className="text-sm font-semibold text-[#000828]">{t.tier}</p>
                      <p className="text-xs text-[#000828]/50">{t.bonus}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Partner Form Modal */}
      {showForm && (
        <PartnerFormModal
          partner={editingPartner}
          onClose={handleFormClose}
          onSaved={handleFormSaved}
        />
      )}
    </div>
  );
}
