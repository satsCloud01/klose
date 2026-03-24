import { useState, useEffect, useRef } from 'react';
import api from '../api';

const fallbackLeaderboard = [
  { id: 1, name: 'Arjun Mehta', role: 'Senior Agent', avatar: null, revenue: 4200000, deals: 18, color: 'bg-[#e3c285]' },
  { id: 2, name: 'Kavitha Rao', role: 'Lead Consultant', avatar: null, revenue: 3800000, deals: 15, color: 'bg-emerald-500' },
  { id: 3, name: 'Sameer Khan', role: 'Associate Agent', avatar: null, revenue: 3100000, deals: 12, color: 'bg-blue-500' },
];

const fallbackTeam = [
  { id: 1, name: 'Arjun Mehta', active_leads: 24, capacity: 30, capacity_pct: 80 },
  { id: 2, name: 'Kavitha Rao', active_leads: 18, capacity: 25, capacity_pct: 72 },
  { id: 3, name: 'Sameer Khan', active_leads: 28, capacity: 30, capacity_pct: 93 },
  { id: 4, name: 'Priya Nair', active_leads: 12, capacity: 25, capacity_pct: 48 },
  { id: 5, name: 'Vikram Joshi', active_leads: 21, capacity: 30, capacity_pct: 70 },
];

const fallbackRules = [
  { id: 1, name: 'Round Robin', active: true, description: 'Distribute leads evenly across available agents' },
  { id: 2, name: 'Skill Match', active: true, description: 'Route leads based on agent expertise and property type' },
  { id: 3, name: 'Capacity Gate', active: false, description: 'Block assignments when agent load exceeds 90%' },
];

const fallbackStats = { total_agents: 5, avg_conversion: 26.4, monthly_revenue: 14300000, performance_trend: 14 };

const focusChips = ['Underperforming', 'Inactive >48h', 'High Commissions', 'Certifications Due'];

const inputClass = "w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)] text-sm focus:ring-2 focus:ring-[var(--color-gold)] focus:border-transparent";

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2);
}

function fmtRevenue(n) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

function capacityColor(pct) {
  if (pct >= 90) return 'bg-red-500';
  if (pct >= 70) return 'bg-[#e3c285]';
  return 'bg-emerald-500';
}

function MemberEditModal({ member, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: member?.name || '',
    role: member?.role || '',
    phone: member?.phone || '',
    email: member?.email || '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api.updateTeamMember(member.id, form);
      onSaved();
    } catch {
      onSaved();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto editorial-shadow">
        <h3 className="font-headline text-2xl text-[var(--color-navy-900)] mb-6">Edit Team Member</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#000828]/60 mb-1">Name</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} className={inputClass} placeholder="Full name" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#000828]/60 mb-1">Role</label>
            <input value={form.role} onChange={e => set('role', e.target.value)} className={inputClass} placeholder="e.g. Senior Agent" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#000828]/60 mb-1">Phone</label>
            <input value={form.phone} onChange={e => set('phone', e.target.value)} className={inputClass} placeholder="+91 98765 43210" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#000828]/60 mb-1">Email</label>
            <input value={form.email} onChange={e => set('email', e.target.value)} className={inputClass} placeholder="member@company.com" type="email" />
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

export default function Team() {
  const [team, setTeam] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState(null);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredLeader, setHoveredLeader] = useState(null);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const rulesRef = useRef(null);

  const fetchData = () => {
    Promise.all([
      api.getTeam().catch(() => null),
      api.getLeaderboard().catch(() => null),
      api.getTeamStats().catch(() => null),
      api.getAssignmentRules().catch(() => null),
    ]).then(([t, lb, s, r]) => {
      setTeam(t?.members || t || fallbackTeam);
      setLeaderboard(lb?.leaderboard || lb || fallbackLeaderboard);
      setStats(s || fallbackStats);
      // Normalize API rules: {key, enabled} → {id, name, active, description}
      const rawRules = r?.rules || r || fallbackRules;
      setRules(Array.isArray(rawRules) ? rawRules.map((rule, i) => ({
        id: rule.id || rule.key || i,
        name: rule.name || rule.key || `Rule ${i+1}`,
        active: rule.active ?? rule.enabled ?? false,
        description: (rule.description || '').replace('$5M', '₹5 Cr'),
      })) : fallbackRules);
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  const handleEditClose = () => { setShowMemberForm(false); setEditingMember(null); };
  const handleEditSaved = () => { handleEditClose(); fetchData(); };
  const openEdit = (member) => { setEditingMember(member); setShowMemberForm(true); };

  const handleToggleRule = async (ruleId) => {
    setRules(prev => prev.map(r => {
      if (r.id === ruleId) return { ...r, active: !r.active };
      return r;
    }));
    try {
      const updated = rules.map(r => r.id === ruleId ? { key: r.id, enabled: !r.active } : { key: r.id, enabled: r.active });
      await api.updateAssignmentRules(updated);
    } catch {
      // keep local state even if API fails
    }
  };

  const scrollToRules = () => {
    rulesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const st = stats || fallbackStats;

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
          <h1 className="font-headline text-5xl md:text-6xl text-[#000828] leading-tight">Team Intelligence</h1>
          <p className="mt-2 text-lg text-[#000828]/60">
            Welcome back, <span className="font-semibold text-[#000828]">Priya</span>. Your team's performance is up <span className="text-emerald-600 font-semibold">{st.performance_trend}%</span> this month.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-6">

          {/* Leaderboard */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl editorial-shadow p-8">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#e3c285] mb-1">Performance Elite</p>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline text-2xl text-[#000828]">Monthly Leaderboard</h2>
              <span className="text-sm text-[#000828]/40">March 2026</span>
            </div>
            <div className="space-y-4">
              {leaderboard.map((leader, idx) => {
                const isHovered = hoveredLeader === leader.id;
                return (
                  <div
                    key={leader.id}
                    className={`group flex items-center gap-5 p-4 rounded-xl transition-all duration-200 cursor-pointer ${
                      isHovered ? 'bg-[#152040] text-white scale-[1.02]' : 'bg-[#f7f9fc]'
                    }`}
                    onMouseEnter={() => setHoveredLeader(leader.id)}
                    onMouseLeave={() => setHoveredLeader(null)}
                  >
                    {/* Rank */}
                    <span className={`font-headline text-2xl italic w-8 ${
                      isHovered ? 'text-[#e3c285]' : 'text-[#000828]/20'
                    }`} style={{ WebkitTextStroke: isHovered ? 'none' : '1px' }}>
                      {idx + 1}
                    </span>

                    {/* Avatar + Info */}
                    <div className="w-12 h-12 rounded-full bg-[#000828]/10 flex items-center justify-center font-headline text-sm flex-shrink-0">
                      {initials(leader.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-headline text-lg ${isHovered ? 'text-white' : 'text-[#000828]'}`}>{leader.name}</p>
                      <p className={`text-sm ${isHovered ? 'text-white/60' : 'text-[#000828]/50'}`}>{leader.role}</p>
                    </div>

                    {/* Revenue + Deals */}
                    <div className="text-right flex items-center gap-4">
                      <span className={`font-headline text-xl ${isHovered ? 'text-[#e3c285]' : 'text-[#000828]'}`}>
                        {fmtRevenue(leader.revenue)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${leader.color || 'bg-[#e3c285]'}`} />
                        <span className={`text-sm ${isHovered ? 'text-white/70' : 'text-[#000828]/50'}`}>
                          {leader.deals} deals
                        </span>
                      </div>
                    </div>

                    {/* Edit Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); openEdit(leader); }}
                      className={`opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg ${
                        isHovered ? 'hover:bg-white/10' : 'hover:bg-[#000828]/5'
                      }`}
                      title="Edit member"
                    >
                      <span className={`material-symbols-outlined text-lg ${isHovered ? 'text-white/70' : 'text-[#000828]/50'}`}>edit</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assignment Rules */}
          <div ref={rulesRef} className="col-span-12 lg:col-span-4 bg-[#152040] rounded-2xl editorial-shadow p-6 text-white flex flex-col">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/40 mb-1">Operational Logic</p>
            <h2 className="font-headline text-xl mb-5">Assignment Rules</h2>
            <div className="space-y-3 flex-1">
              {rules.map(rule => (
                <div key={rule.id} className="bg-white/5 backdrop-blur rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-white">{rule.name}</p>
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className="focus:outline-none transition-colors"
                      title={rule.active ? 'Disable rule' : 'Enable rule'}
                    >
                      <span className={`material-symbols-outlined text-xl ${rule.active ? 'text-emerald-400 hover:text-emerald-300' : 'text-white/30 hover:text-white/50'}`}>
                        {rule.active ? 'toggle_on' : 'toggle_off'}
                      </span>
                    </button>
                  </div>
                  <p className="text-xs text-white/50">{rule.description}</p>
                </div>
              ))}
            </div>
            <button
              onClick={scrollToRules}
              className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-[#e3c285] to-amber-400 text-[#000828] font-semibold text-sm hover:brightness-110 transition"
            >
              Modify Flow Logic
            </button>
          </div>

          {/* Workload Visualization */}
          <div className="col-span-12 bg-white rounded-2xl editorial-shadow p-8">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#000828]/50 mb-1">Workload Distribution</p>
            <h2 className="font-headline text-2xl text-[#000828] mb-6">Agent Capacity</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {team.map(agent => {
                const pct = agent.capacity_pct ?? Math.round((agent.active_leads / (agent.capacity || 30)) * 100);
                return (
                  <div key={agent.id} className="bg-[#f7f9fc] rounded-2xl p-5 flex flex-col items-center h-48 justify-between">
                    <div className="text-center">
                      <p className="font-headline text-4xl text-[#000828]">{agent.active_leads}</p>
                      <p className="text-xs text-[#000828]/40 mt-1">Active Leads</p>
                    </div>
                    <div className="w-full">
                      <div className="w-full h-2 bg-[#000828]/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${capacityColor(pct)}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs font-medium text-[#000828] truncate">{agent.name?.split(' ')[0]}</p>
                        <p className={`text-xs font-semibold ${pct >= 90 ? 'text-red-500' : 'text-[#000828]/50'}`}>{pct}%</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Focus Chips */}
        <div className="flex flex-wrap gap-3">
          {focusChips.map(chip => (
            <button
              key={chip}
              className="px-4 py-2 rounded-full border border-[#000828]/10 text-sm text-[#000828]/60 hover:bg-[#000828] hover:text-white hover:border-transparent transition"
            >
              {chip}
            </button>
          ))}
        </div>

      </div>

      {/* Member Edit Modal */}
      {showMemberForm && editingMember && (
        <MemberEditModal
          member={editingMember}
          onClose={handleEditClose}
          onSaved={handleEditSaved}
        />
      )}
    </div>
  );
}
