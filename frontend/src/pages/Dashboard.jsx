import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import TourWizard from '../components/TourWizard';

function fmt(n) {
  if (n == null) return '--';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

const channelColors = {
  WhatsApp: 'bg-emerald-500',
  MagicBricks: 'bg-amber-500',
  Facebook: 'bg-blue-500',
  Instagram: 'bg-pink-500',
  '99acres': 'bg-orange-500',
  Referral: 'bg-violet-500',
  'Walk-in': 'bg-teal-500',
};

const channelBadgeColors = {
  WhatsApp: 'bg-emerald-100 text-emerald-700',
  MagicBricks: 'bg-amber-100 text-amber-700',
  Facebook: 'bg-blue-100 text-blue-700',
  Instagram: 'bg-pink-100 text-pink-700',
  '99acres': 'bg-orange-100 text-orange-700',
  Referral: 'bg-violet-100 text-violet-700',
  'Walk-in': 'bg-teal-100 text-teal-700',
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [activity, setActivity] = useState(null);
  const [briefing, setBriefing] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTour, setShowTour] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.getDashboardSummary().catch(() => null),
      api.getDashboardActivity().catch(() => null),
      api.getDashboardBriefing().catch(() => null),
      api.getDashboardRecommendations().catch(() => null),
    ]).then(([s, a, b, r]) => {
      setSummary(s);
      setActivity(a);
      setBriefing(b);
      setRecommendations(r);
      setLoading(false);
    });
  }, []);

  // Fallback data when API is loading or unavailable
  const stats = summary || {
    pipeline_value: 42800000,
    active_deals: 24,
    win_rate: 68,
    new_leads_today: 7,
    showings_this_week: 12,
    avg_days_to_close: 34,
  };

  const activities = activity?.items || [
    { id: 1, lead_name: 'Priya Sharma', action: 'responded to WhatsApp follow-up', channel: 'WhatsApp', time: '12 min ago' },
    { id: 2, lead_name: 'Rajesh Mehta', action: 'viewed 3BR listing on MagicBricks', channel: 'MagicBricks', time: '34 min ago' },
    { id: 3, lead_name: 'Ananya Gupta', action: 'clicked Facebook ad for Bandra West', channel: 'Facebook', time: '1 hr ago' },
    { id: 4, lead_name: 'Vikram Singh', action: 'requested site visit via Instagram', channel: 'Instagram', time: '2 hrs ago' },
    { id: 5, lead_name: 'Meera Patel', action: 'submitted inquiry on 99acres', channel: '99acres', time: '3 hrs ago' },
  ];

  const brief = briefing || {
    text: 'You have 3 hot leads requiring immediate follow-up. Two site visits are scheduled today, and the Bandra West penthouse listing has received 8 new inquiries overnight. Your pipeline momentum is strong this week.',
    priority_actions: ['Follow up with Priya Sharma on the 4BHK offer', 'Confirm 2pm site visit at Worli Sea Face'],
  };

  const recs = recommendations?.properties || [
    { id: 1, title: 'Bandra West Penthouse', price: 85000000, location: 'Bandra West, Mumbai', bedrooms: 4, area_sqft: 3200, image: null },
    { id: 2, title: 'Juhu Beach Villa', price: 120000000, location: 'Juhu, Mumbai', bedrooms: 5, area_sqft: 4500, image: null },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[var(--color-on-surface-variant)] font-headline text-lg italic">Preparing your command center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Tour Wizard */}
      <TourWizard isOpen={showTour} onClose={() => setShowTour(false)} />

      {/* Welcome Section */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-gold)] mb-2">Command Center</p>
          <h2 className="font-headline text-4xl text-[var(--color-navy-900)]">
            Your empire, <span className="italic text-[var(--color-gold)]">orchestrated</span>.
          </h2>
          <p className="mt-2 text-[var(--color-on-surface-variant)] text-lg">
            Crores move faster when you move smarter. Here's your morning brief.
          </p>
        </div>
        <button
          onClick={() => setShowTour(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest border border-[var(--color-gold)]/40 text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 transition-all"
        >
          <span className="material-symbols-outlined text-base">tour</span>
          Take a Tour
        </button>
      </div>

      {/* Main Grid: Left content + Right sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column — 2/3 width */}
        <div className="lg:col-span-2 space-y-8">
          {/* AI Priority Briefing */}
          <div className="rounded-xl p-6 relative overflow-hidden" style={{ background: '#152040' }}>
            <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
              <div className="w-full h-full rounded-full" style={{ background: 'radial-gradient(circle, var(--color-gold) 0%, transparent 70%)' }} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-[var(--color-gold)] text-2xl">bolt</span>
                <h3 className="font-headline text-xl text-white">AI Priority Briefing</h3>
              </div>
              <p className="text-gray-300 leading-relaxed mb-5">{brief.text}</p>
              {brief.priority_actions && brief.priority_actions.length > 0 && (
                <ul className="space-y-2 mb-6">
                  {brief.priority_actions.map((action, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                      <span className="material-symbols-outlined text-[var(--color-gold)] text-base mt-0.5">arrow_right</span>
                      {action}
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex gap-3">
                <button className="px-5 py-2.5 rounded-full text-sm font-semibold uppercase tracking-wider"
                  style={{ background: 'var(--color-gold)', color: '#000828' }}>
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">phone_in_talk</span>
                    Follow Up Now
                  </span>
                </button>
                <button className="px-5 py-2.5 rounded-full text-sm font-semibold uppercase tracking-wider border border-gray-500 text-gray-300 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">calendar_today</span>
                    View Schedule
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Lead Activity */}
          <div className="bg-white rounded-xl editorial-shadow p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-headline text-xl text-[var(--color-navy-900)]">Recent Lead Activity</h3>
              <button className="text-sm text-[var(--color-gold)] hover:underline font-medium">View All</button>
            </div>
            <div className="space-y-4">
              {activities.map((item) => (
                <div key={item.id} className="flex items-start gap-4 group">
                  <div className={`w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0 ${channelColors[item.channel] || 'bg-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--color-navy-900)]">
                      <span className="font-semibold">{item.lead_name}</span>{' '}
                      <span className="text-[var(--color-on-surface-variant)]">{item.action}</span>
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${channelBadgeColors[item.channel] || 'bg-gray-100 text-gray-600'}`}>
                        {item.channel}
                      </span>
                      <span className="text-xs text-gray-400">{item.time}</span>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-gold)]">
                    <span className="material-symbols-outlined text-xl">arrow_forward</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Property Recommendations */}
          <div className="bg-white rounded-xl editorial-shadow p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-headline text-xl text-[var(--color-navy-900)]">Recommended Properties</h3>
              <button onClick={() => navigate('/properties')} className="text-sm text-[var(--color-gold)] hover:underline font-medium">Browse All</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {recs.map((prop, i) => (
                <div key={prop.id} className={`rounded-xl overflow-hidden relative group cursor-pointer ${i === 0 ? 'md:row-span-2' : ''}`}>
                  {/* Image placeholder with gradient overlay */}
                  <div className={`${i === 0 ? 'h-80' : 'h-40'} relative`}
                    style={{ background: i === 0 ? 'linear-gradient(135deg, #152040 0%, #000828 100%)' : 'linear-gradient(135deg, #1a2a4a 0%, #152040 100%)' }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="material-symbols-outlined text-[var(--color-gold)] text-3xl opacity-30">apartment</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="font-headline text-white text-lg">{prop.title}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[var(--color-gold)] text-sm">location_on</span>
                        <span className="text-gray-300 text-sm">{prop.location}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-headline text-[var(--color-gold)] text-xl">
                          {prop.price >= 10000000 ? `${(prop.price / 10000000).toFixed(1)} Cr` : fmt(prop.price)}
                        </span>
                        <div className="flex gap-3 text-gray-300 text-xs">
                          {prop.bedrooms && <span>{prop.bedrooms} BHK</span>}
                          {prop.area_sqft && <span>{prop.area_sqft.toLocaleString()} sqft</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar — 1/3 width */}
        <div className="space-y-6">
          {/* Pipeline Value */}
          <div className="bg-white rounded-xl editorial-shadow p-6 text-center">
            <span className="material-symbols-outlined text-[var(--color-gold)] text-3xl mb-2">account_balance</span>
            <p className="text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-1">Pipeline Value</p>
            <p className="font-headline text-4xl text-[var(--color-navy-900)]">
              {fmt(stats.pipeline_value)}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl editorial-shadow p-5 text-center">
              <span className="material-symbols-outlined text-[var(--color-gold)] text-2xl">handshake</span>
              <p className="font-headline text-3xl text-[var(--color-navy-900)] mt-2">{stats.active_deals}</p>
              <p className="text-xs uppercase tracking-wider text-[var(--color-on-surface-variant)] mt-1">Active Deals</p>
            </div>
            <div className="bg-white rounded-xl editorial-shadow p-5 text-center">
              <span className="material-symbols-outlined text-[var(--color-gold)] text-2xl">trophy</span>
              <p className="font-headline text-3xl text-[var(--color-navy-900)] mt-2">{stats.win_rate}%</p>
              <p className="text-xs uppercase tracking-wider text-[var(--color-on-surface-variant)] mt-1">Win Rate</p>
            </div>
            <div className="bg-white rounded-xl editorial-shadow p-5 text-center">
              <span className="material-symbols-outlined text-[var(--color-gold)] text-2xl">person_add</span>
              <p className="font-headline text-3xl text-[var(--color-navy-900)] mt-2">{stats.new_leads_today}</p>
              <p className="text-xs uppercase tracking-wider text-[var(--color-on-surface-variant)] mt-1">New Today</p>
            </div>
            <div className="bg-white rounded-xl editorial-shadow p-5 text-center">
              <span className="material-symbols-outlined text-[var(--color-gold)] text-2xl">home_work</span>
              <p className="font-headline text-3xl text-[var(--color-navy-900)] mt-2">{stats.showings_this_week}</p>
              <p className="text-xs uppercase tracking-wider text-[var(--color-on-surface-variant)] mt-1">Site Visits</p>
            </div>
          </div>

          {/* Avg Days to Close */}
          <div className="bg-white rounded-xl editorial-shadow p-6 text-center">
            <span className="material-symbols-outlined text-[var(--color-gold)] text-2xl mb-2">schedule</span>
            <p className="text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-1">Avg. Days to Close</p>
            <p className="font-headline text-3xl text-[var(--color-navy-900)]">{stats.avg_days_to_close}</p>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl editorial-shadow p-6">
            <h4 className="font-headline text-lg text-[var(--color-navy-900)] mb-4">Quick Actions</h4>
            <div className="space-y-3">
              {[
                { icon: 'person_add', label: 'Add New Lead', path: '/leads' },
                { icon: 'add_home', label: 'List Property', path: '/properties' },
                { icon: 'event', label: 'Schedule Visit', path: '/visits' },
                { icon: 'smart_toy', label: 'AI Coach', path: '/coach' },
              ].map((a) => (
                <button key={a.label}
                  onClick={() => navigate(a.path)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-100 hover:border-[var(--color-gold)] hover:bg-[var(--color-gold)]/5 transition-all text-left group">
                  <span className="material-symbols-outlined text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-gold)] transition-colors">{a.icon}</span>
                  <span className="text-sm font-medium text-[var(--color-navy-900)]">{a.label}</span>
                  <span className="material-symbols-outlined text-gray-300 ml-auto text-base group-hover:text-[var(--color-gold)] transition-colors">chevron_right</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
