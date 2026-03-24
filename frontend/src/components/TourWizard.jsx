import { useState, useEffect, useCallback } from 'react';

const TOUR_STEPS = [
  {
    icon: 'dashboard',
    title: 'Your Command Center',
    subtitle: 'See everything. Miss nothing.',
    description: 'A single-glance dashboard that surfaces your ₹350 Crore pipeline, AI-prioritized hot leads, and real-time activity from 99acres, MagicBricks, Housing.com, and WhatsApp. AI-powered morning briefings tell you exactly which follow-ups will move crores today.',
    valueProp: 'Indian brokers using AI dashboards close 23% more deals per quarter — that\'s lakhs in extra brokerage.',
    visual: 'metrics',
  },
  {
    icon: 'groups',
    title: 'AI-Powered Lead Intelligence',
    subtitle: 'Every lead scored. Every NRI & HNI ranked.',
    description: 'Multi-channel lead capture from 99acres, MagicBricks, Housing.com, Instagram, WhatsApp, and walk-ins. Every lead — from a Bandra walk-in to an NRI inquiry from Dubai — gets an AI intent score (0-100) based on engagement, budget fit, and RERA-verified property matches.',
    valueProp: 'AI scoring reduces unqualified follow-ups by 40%, so your team chases only the leads that convert to token bookings.',
    visual: 'leadCard',
  },
  {
    icon: 'domain',
    title: 'Curated Property Portfolio',
    subtitle: 'From 2BHK flats to ₹50Cr penthouses.',
    description: 'RERA-verified listings with construction status tracking (Under Construction / Ready to Move), carpet area in sq.ft, side-by-side comparisons, and AI-powered lead-property matching. From Lodha to DLF, every project tells a story that sells.',
    valueProp: 'RERA-verified properties with rich media sell 31% faster in the Indian market.',
    visual: 'propertyCard',
  },
  {
    icon: 'calendar_month',
    title: 'Orchestrated Site Visits',
    subtitle: 'From Powai to Palm Beach Road — seamlessly.',
    description: 'Coordinate multi-stakeholder site visits across projects. Calendar sync with agent assignment, real-time status (confirmed/pending/no-show), and instant post-visit feedback capture. Perfect for managing weekend rush at sample flats.',
    valueProp: 'Structured site visit management increases token booking rates by 28% in Indian metro markets.',
    visual: 'visitCard',
  },
  {
    icon: 'view_kanban',
    title: 'Visual Pipeline Mastery',
    subtitle: 'From enquiry to possession — visualized.',
    description: 'An 8-stage Kanban pipeline built for Indian real estate: Lead Capture → Qualification → Site Visit → Negotiation → Agreement → Documentation → Registration → Possession. Drag-and-drop deals worth crores across stages with real-time forecasting.',
    valueProp: 'Visual pipelines improve forecast accuracy by 35% — critical when each deal is worth ₹1-50 Crore.',
    visual: 'kanban',
  },
  {
    icon: 'psychology_alt',
    title: 'Your AI Closing Strategist',
    subtitle: 'Negotiate like a Dalal Street veteran.',
    description: 'An AI coach that analyzes circle rates, ready reckoner values, buyer intent, and pricing trends to recommend counter-offer strategies. Pre-crafted objection handlers for common Indian buyer concerns: "Price is too high", "GST worries", "Possession delay fears".',
    valueProp: 'AI-assisted negotiations achieve 4.2% higher sale prices — on a ₹5 Crore deal, that\'s ₹21 Lakhs more.',
    visual: 'aiChat',
  },
  {
    icon: 'calculate',
    title: 'Precision Financial Tools',
    subtitle: 'EMI, affordability, stamp duty — instant.',
    description: 'Interactive EMI calculator with real-time sliders, affordability checker with DTI analysis, and live rate comparisons across SBI, HDFC, ICICI, Axis, and Kotak. Help NRI buyers understand forex implications. Generate client-ready PDF reports instantly.',
    valueProp: 'On-the-spot EMI clarity at the sample flat reduces buyer hesitation by 52% and speeds up token bookings.',
    visual: 'emi',
  },
  {
    icon: 'handshake',
    title: 'Channel Partner Empire',
    subtitle: 'Gold. Silver. Bronze. Brokerage-driven.',
    description: 'Manage your CP network with tiered brokerage structures (1-3% slabs), automated payout tracking, real-time conversion analytics, and location-based lead routing. From sub-brokers to franchise partners — every referral is tracked from source to registration.',
    valueProp: 'Structured CP programs increase referral volume by 45% — the lifeblood of Indian real estate sales.',
    visual: 'tiers',
  },
  {
    icon: 'group_work',
    title: 'Team Performance Intelligence',
    subtitle: 'Build a sales army. Measure every soldier.',
    description: 'Monthly leaderboards, AI-driven lead auto-assignment (round robin, luxury tier lock for ₹5Cr+ deals, geo-routing by micro-market), workload visualization, and capacity management. Know who\'s your Virat Kohli and who needs coaching.',
    valueProp: 'Data-driven team management improves per-agent brokerage by 19% — compounding across your entire team.',
    visual: 'leaderboard',
  },
];

/* ── Visual mini-components for each step ── */

function MetricsVisual() {
  return (
    <div className="tour-visual-card">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pipeline', value: '₹350Cr', icon: 'account_balance' },
          { label: 'Active Deals', value: '24', icon: 'handshake' },
          { label: 'Win Rate', value: '68%', icon: 'trophy' },
        ].map((m) => (
          <div key={m.label} className="text-center p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <span className="material-symbols-outlined text-[#e3c285] text-xl">{m.icon}</span>
            <div className="font-headline text-2xl text-white mt-2">{m.value}</div>
            <div className="text-[10px] uppercase tracking-widest text-white/30 mt-1">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LeadCardVisual() {
  return (
    <div className="tour-visual-card">
      <div className="p-5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#e3c285]/20 flex items-center justify-center text-[#e3c285] font-headline text-lg">PS</div>
          <div>
            <div className="text-white font-semibold text-sm">Priya Sharma</div>
            <div className="text-white/30 text-xs">WhatsApp &middot; 3BHK Bandra West</div>
          </div>
        </div>
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-white/40">AI Intent Score</span>
          <span className="text-[#e3c285] font-bold">94 / 100</span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-[#e3c285] to-[#c29d5b]" style={{ width: '94%' }} />
        </div>
        <div className="mt-3 flex gap-2">
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/20 text-emerald-400 font-medium">Hot Lead</span>
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-[#e3c285]/20 text-[#e3c285] font-medium">Budget: 2-3 Cr</span>
        </div>
      </div>
    </div>
  );
}

function PropertyCardVisual() {
  return (
    <div className="tour-visual-card">
      <div className="rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.06]">
        <div className="h-28 bg-gradient-to-br from-[#152040] to-[#000828] relative flex items-center justify-center">
          <span className="material-symbols-outlined text-[#e3c285]/20 text-6xl">apartment</span>
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">RERA Verified</div>
        </div>
        <div className="p-4">
          <div className="font-headline text-white text-base">Bandra West Penthouse</div>
          <div className="text-white/30 text-xs mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[#e3c285] text-xs">location_on</span>
            Bandra West, Mumbai
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-headline text-[#e3c285]">8.5 - 12 Cr</span>
            <span className="text-white/30 text-xs">4 BHK &middot; 3,200 sqft</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function VisitCardVisual() {
  return (
    <div className="tour-visual-card">
      <div className="space-y-3">
        {[
          { name: 'Priya Sharma', property: 'Sea Face Penthouse', status: 'Confirmed', color: 'emerald' },
          { name: 'Rajesh Mehta', property: 'Bandra 3BHK', status: 'Pending', color: 'amber' },
        ].map((v) => (
          <div key={v.name} className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#152040] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#e3c285] text-lg">event</span>
            </div>
            <div className="flex-1">
              <div className="text-white text-sm font-medium">{v.name}</div>
              <div className="text-white/30 text-xs">{v.property}</div>
            </div>
            <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${v.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>{v.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function KanbanVisual() {
  const cols = [
    { name: 'Lead', color: '#06b6d4', cards: 2, value: '₹1.2Cr' },
    { name: 'Qualify', color: '#818cf8', cards: 2, value: '₹3.8Cr' },
    { name: 'Visit', color: '#3b82f6', cards: 2, value: '₹5.5Cr' },
    { name: 'Negotiate', color: '#f59e0b', cards: 1, value: '₹4.2Cr' },
    { name: 'Agree', color: '#34d399', cards: 1, value: '₹8.1Cr' },
    { name: 'Possess', color: '#e3c285', cards: 1, value: '₹12.5Cr' },
  ];
  return (
    <div className="tour-visual-card">
      <div className="flex gap-3 overflow-hidden">
        {cols.map((col) => (
          <div key={col.name} className="flex-1 min-w-0">
            {/* Column header */}
            <div className="mb-3 pb-2 border-b border-white/10">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: col.color }} />
                <span className="text-[11px] font-bold uppercase tracking-wide text-white/80">{col.name}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] font-semibold" style={{ color: col.color }}>{col.value}</span>
                <span className="text-[9px] bg-white/10 text-white/50 px-1.5 py-0.5 rounded-full font-bold">{col.cards}</span>
              </div>
            </div>
            {/* Cards */}
            <div className="space-y-2">
              {Array.from({ length: col.cards }).map((_, j) => (
                <div key={j} className="rounded-lg p-2 border-l-[3px]" style={{ borderColor: col.color, background: 'rgba(255,255,255,0.05)' }}>
                  <div className="h-2 w-4/5 rounded-full bg-white/20 mb-1.5" />
                  <div className="h-1.5 w-3/5 rounded-full bg-white/10" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AiChatVisual() {
  return (
    <div className="tour-visual-card">
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-white/50 text-sm">person</span>
          </div>
          <div className="p-3 rounded-xl rounded-tl-sm bg-white/[0.06] text-white/60 text-xs max-w-[80%]">
            Buyer wants 15% below asking on the Worli flat. How should I counter?
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <div className="p-3 rounded-xl rounded-tr-sm bg-[#e3c285]/10 border border-[#e3c285]/20 text-white/70 text-xs max-w-[85%]">
            <span className="text-[#e3c285] font-semibold">AI Coach:</span> Market comps show similar units sold at 8-10% below asking. Counter at 7% discount + include parking. Buyer engagement score is 82 — they're serious.
          </div>
          <div className="w-7 h-7 rounded-full bg-[#e3c285]/20 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[#e3c285] text-sm">psychology_alt</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmiVisual() {
  return (
    <div className="tour-visual-card">
      <div className="p-5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-center">
        <div className="text-white/30 text-xs uppercase tracking-widest mb-2">Monthly EMI</div>
        <div className="font-headline text-5xl text-[#e3c285]">₹97,450</div>
        <div className="text-white/20 text-sm font-headline mt-1">/month</div>
        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          {[
            { label: 'Principal', value: '1.2 Cr' },
            { label: 'Rate', value: '8.5%' },
            { label: 'Tenure', value: '20 yrs' },
          ].map((d) => (
            <div key={d.label}>
              <div className="text-white text-sm font-medium">{d.value}</div>
              <div className="text-white/20 text-[10px] uppercase tracking-wider mt-0.5">{d.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TiersVisual() {
  return (
    <div className="tour-visual-card">
      <div className="flex gap-3 justify-center">
        {[
          { tier: 'Gold', color: '#e3c285', deals: '50+', pct: '3.5%' },
          { tier: 'Silver', color: '#a8b4c8', deals: '25+', pct: '2.5%' },
          { tier: 'Bronze', color: '#cd7f32', deals: '10+', pct: '1.5%' },
        ].map((t) => (
          <div key={t.tier} className="flex-1 p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-center">
            <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center mb-2" style={{ background: `${t.color}20`, border: `1px solid ${t.color}40` }}>
              <span className="material-symbols-outlined text-lg" style={{ color: t.color }}>military_tech</span>
            </div>
            <div className="font-headline text-sm text-white">{t.tier}</div>
            <div className="text-[10px] text-white/30 mt-1">{t.deals} deals</div>
            <div className="font-headline text-lg mt-1" style={{ color: t.color }}>{t.pct}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LeaderboardVisual() {
  return (
    <div className="tour-visual-card">
      <div className="flex items-end justify-center gap-3 h-36">
        {[
          { name: 'Arjun', rank: 2, h: 70, deals: 18 },
          { name: 'Vikram', rank: 1, h: 100, deals: 24 },
          { name: 'Meera', rank: 3, h: 55, deals: 15 },
        ].map((p) => (
          <div key={p.name} className="flex flex-col items-center gap-2 flex-1">
            <div className="text-white text-xs font-medium">{p.name}</div>
            <div className="text-[10px] text-white/30">{p.deals} deals</div>
            <div
              className="w-full rounded-t-lg flex items-start justify-center pt-2"
              style={{
                height: `${p.h}%`,
                background: p.rank === 1 ? 'linear-gradient(to top, rgba(227,194,133,0.3), rgba(227,194,133,0.6))' : 'rgba(255,255,255,0.06)',
              }}
            >
              <span className="font-headline text-lg" style={{ color: p.rank === 1 ? '#e3c285' : 'rgba(255,255,255,0.4)' }}>#{p.rank}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const VISUALS = {
  metrics: MetricsVisual,
  leadCard: LeadCardVisual,
  propertyCard: PropertyCardVisual,
  visitCard: VisitCardVisual,
  kanban: KanbanVisual,
  aiChat: AiChatVisual,
  emi: EmiVisual,
  tiers: TiersVisual,
  leaderboard: LeaderboardVisual,
};

export default function TourWizard({ isOpen, onClose }) {
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(false);

  const total = TOUR_STEPS.length;

  // Open animation
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  const goTo = useCallback((next) => {
    if (animating || next < 0 || next >= total) return;
    setAnimating(true);
    setVisible(false);
    setTimeout(() => {
      setStep(next);
      setVisible(true);
      setAnimating(false);
    }, 400);
  }, [animating, total]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(step + 1);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goTo(step - 1);
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, step, goTo, onClose]);

  if (!isOpen) return null;

  const current = TOUR_STEPS[step];
  const Visual = VISUALS[current.visual];
  const pct = ((step + 1) / total) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: '#000828' }}>
      {/* Animated gradient bg */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[800px] h-[800px] rounded-full opacity-[0.07] blur-[120px]"
          style={{
            background: 'radial-gradient(circle, #e3c285 0%, transparent 70%)',
            top: '10%', left: '60%',
            animation: 'tourGlow 8s ease-in-out infinite alternate',
          }}
        />
        <div className="absolute w-[600px] h-[600px] rounded-full opacity-[0.04] blur-[100px]"
          style={{
            background: 'radial-gradient(circle, #8596ff 0%, transparent 70%)',
            bottom: '10%', left: '10%',
            animation: 'tourGlow 10s ease-in-out infinite alternate-reverse',
          }}
        />
      </div>

      {/* Top bar */}
      <div className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-3">
          <span className="font-headline text-xl italic text-[#e3c285]">Klose</span>
          <span className="text-white/20 text-xs">Guided Tour</span>
        </div>
        <button onClick={onClose} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-[#e3c285]/40 hover:bg-white/[0.03] transition-all">
          <span className="material-symbols-outlined text-white/50 hover:text-white text-xl">close</span>
        </button>
      </div>

      {/* Main content area */}
      <div className="flex-1 relative z-10 flex items-center justify-center px-6 md:px-12 overflow-hidden">
        <div
          className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center transition-all duration-500 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
          }}
        >
          {/* Left: text content */}
          <div className="order-2 lg:order-1">
            {/* Giant step number */}
            <div
              className="font-headline text-[8rem] md:text-[10rem] leading-none text-white/[0.04] select-none absolute -left-2 -top-8 lg:relative lg:left-auto lg:top-auto"
              style={{
                transitionDelay: '50ms',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.6s ease, transform 0.6s ease',
              }}
            >
              {String(step + 1).padStart(2, '0')}
            </div>

            {/* Icon */}
            <div className="mb-4" style={{ transitionDelay: '100ms', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(15px)', transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s' }}>
              <span className="material-symbols-outlined text-[#e3c285] text-4xl">{current.icon}</span>
            </div>

            {/* Title */}
            <h2
              className="font-headline text-4xl md:text-5xl text-white/90 leading-tight"
              style={{ transitionDelay: '150ms', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(15px)', transition: 'opacity 0.5s ease 0.15s, transform 0.5s ease 0.15s' }}
            >
              {current.title}
            </h2>

            {/* Subtitle */}
            <p
              className="mt-3 font-headline text-lg italic text-white/40"
              style={{ transitionDelay: '200ms', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)', transition: 'opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s' }}
            >
              {current.subtitle}
            </p>

            {/* Description */}
            <p
              className="mt-6 text-white/35 leading-relaxed max-w-xl"
              style={{ transitionDelay: '250ms', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)', transition: 'opacity 0.5s ease 0.25s, transform 0.5s ease 0.25s' }}
            >
              {current.description}
            </p>

            {/* Value prop */}
            <div
              className="mt-8 flex items-start gap-3 pl-4 border-l-2 border-[#e3c285]/50 max-w-lg"
              style={{ transitionDelay: '350ms', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 0.5s ease 0.35s, transform 0.5s ease 0.35s' }}
            >
              <span className="material-symbols-outlined text-[#e3c285] text-lg mt-0.5">insights</span>
              <p className="text-sm text-[#e3c285]/80 leading-relaxed">{current.valueProp}</p>
            </div>
          </div>

          {/* Right: visual */}
          <div
            className="order-1 lg:order-2"
            style={{ transitionDelay: '300ms', opacity: visible ? 1 : 0, transform: visible ? 'translateX(0) scale(1)' : 'translateX(20px) scale(0.97)', transition: 'opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s' }}
          >
            {Visual && <Visual />}
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="relative z-20 px-6 md:px-12 pb-6">
        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 mb-5">
          {TOUR_STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="transition-all duration-300"
              style={{
                width: i === step ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: i === step ? '#e3c285' : 'rgba(255,255,255,0.15)',
              }}
            />
          ))}
        </div>

        <div className="flex items-center justify-between">
          {/* Step counter */}
          <span className="font-mono text-sm text-white/30 tracking-widest">
            {String(step + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>

          {/* Nav buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => goTo(step - 1)}
              disabled={step === 0}
              className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest border transition-all disabled:opacity-20 disabled:cursor-not-allowed hover:bg-[#e3c285]/10"
              style={{ borderColor: 'rgba(227,194,133,0.4)', color: '#e3c285' }}
            >
              Back
            </button>
            {step < total - 1 ? (
              <button
                onClick={() => goTo(step + 1)}
                className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all hover:shadow-[0_0_30px_rgba(227,194,133,0.2)]"
                style={{ background: '#e3c285', color: '#000828' }}
              >
                Next
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all hover:shadow-[0_0_30px_rgba(227,194,133,0.2)]"
                style={{ background: '#e3c285', color: '#000828' }}
              >
                Get Started
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 w-full h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${pct}%`, background: '#e3c285' }}
          />
        </div>
      </div>

      {/* Keyframe animation injected via style tag */}
      <style>{`
        @keyframes tourGlow {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-40px, 30px) scale(1.1); }
        }
        .tour-visual-card {
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}
