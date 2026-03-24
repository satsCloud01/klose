import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import TourWizard from '../components/TourWizard';

const steps = [
  { icon: 'dashboard', label: 'Command Center', num: '01' },
  { icon: 'groups', label: 'Lead Intelligence', num: '02' },
  { icon: 'domain', label: 'Property Portfolio', num: '03' },
  { icon: 'calendar_month', label: 'Site Orchestration', num: '04' },
  { icon: 'view_kanban', label: 'Pipeline Control', num: '05' },
  { icon: 'psychology_alt', label: 'AI Negotiation', num: '06' },
  { icon: 'calculate', label: 'Financial Tools', num: '07' },
  { icon: 'handshake', label: 'Partner Network', num: '08' },
  { icon: 'group_work', label: 'Team Analytics', num: '09' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="bg-[#000828] text-white overflow-x-hidden">
      <TourWizard isOpen={showTour} onClose={() => setShowTour(false)} />

      {/* ══════════ SECTION 1: Hero ══════════ */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-[#000828]">
        {/* Background Video — positioned in lower half only */}
        <video
          autoPlay muted loop playsInline
          className="absolute bottom-0 left-0 w-full h-[60%] object-cover opacity-15"
        >
          <source src="https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4" type="video/mp4" />
        </video>
        <div className="absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-b from-[#000828] via-transparent to-[#000828]" />

        {/* Radial glow behind title */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.07]" style={{ background: 'radial-gradient(circle, #e3c285 0%, transparent 70%)' }} />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(227,194,133,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(227,194,133,0.6) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }} />

        {/* Hero Content */}
        <div className={`relative z-10 text-center px-6 transition-all duration-[1500ms] ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Pre-title */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-12 bg-[#e3c285]/40" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[#e3c285]/80">
              Premium Real Estate CRM
            </span>
            <div className="h-px w-12 bg-[#e3c285]/40" />
          </div>

          {/* Main Title */}
          <h1 className="font-headline text-[7rem] md:text-[10rem] lg:text-[12rem] leading-[0.85] tracking-tight" style={{ color: '#e3c285' }}>
            <span className="italic">K</span>lose
          </h1>

          {/* Tagline — rotating */}
          <p className="mt-6 font-headline text-xl md:text-2xl italic text-white/50 tracking-wide">
            Where every deal finds its destiny.
          </p>
          <p className="mt-3 text-[11px] uppercase tracking-[0.35em] text-white/20">
            Your legacy, one closing at a time
          </p>

          {/* CTA */}
          <div className={`mt-14 transition-all duration-[2000ms] delay-500 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <button
              onClick={() => navigate('/dashboard')}
              className="group relative px-12 py-5 rounded-full text-xs font-bold uppercase tracking-[0.3em] overflow-hidden transition-all duration-500 hover:shadow-[0_0_60px_rgba(227,194,133,0.3)]"
              style={{ background: '#e3c285', color: '#000828' }}
            >
              <span className="relative z-10">Enter Dashboard</span>
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
            </button>
          </div>

          {/* Tour CTA */}
          <div className={`mt-6 transition-all duration-[2000ms] delay-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <button
              onClick={() => setShowTour(true)}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-[11px] font-bold uppercase tracking-[0.25em] border border-[#e3c285]/30 text-[#e3c285]/80 hover:border-[#e3c285]/60 hover:text-[#e3c285] transition-all duration-500"
            >
              <span className="material-symbols-outlined text-base">tour</span>
              Take the Tour
            </button>
          </div>

          {/* Scroll indicator */}
          <div className={`mt-20 flex flex-col items-center gap-2 transition-all duration-[2000ms] delay-1000 ${loaded ? 'opacity-60' : 'opacity-0'}`}>
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">Explore</span>
            <div className="w-px h-8 bg-gradient-to-b from-[#e3c285]/60 to-transparent animate-pulse" />
          </div>
        </div>
      </section>

      {/* ══════════ SECTION 2: Philosophy ══════════ */}
      <section className="relative py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#e3c285]/60 block mb-6">Philosophy</span>
              <h2 className="font-headline text-4xl md:text-5xl leading-tight text-white/90">
                Where every deal finds its <span className="italic text-[#e3c285]">destiny</span>.
              </h2>
              <p className="mt-8 text-lg text-white/40 leading-relaxed font-light">
                Klose is not a CRM. It's an empire-grade operating system for India's finest real estate professionals
                — from Bandra to Golf Links, from namaste to sold. Flawlessly.
              </p>
              <div className="mt-10 flex items-center gap-6">
                <div className="text-center">
                  <div className="font-headline text-4xl text-[#e3c285]">₹350Cr</div>
                  <div className="text-[10px] uppercase tracking-widest text-white/30 mt-1">Pipeline Value</div>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div className="text-center">
                  <div className="font-headline text-4xl text-[#e3c285]">68%</div>
                  <div className="text-[10px] uppercase tracking-widest text-white/30 mt-1">Win Rate</div>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div className="text-center">
                  <div className="font-headline text-4xl text-[#e3c285]">9</div>
                  <div className="text-[10px] uppercase tracking-widest text-white/30 mt-1">Modules</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80"
                  alt="Luxury property"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-[#152040] border border-[#e3c285]/20 rounded-xl p-6 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#e3c285]">auto_awesome</span>
                  <div>
                    <div className="text-sm font-semibold text-white">AI-Powered</div>
                    <div className="text-[10px] text-white/40">Intelligent Deal Engine</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ SECTION 3: The 9-Step Journey ══════════ */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#152040]/30 to-transparent" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#e3c285]/60 block mb-4">The Journey</span>
            <h2 className="font-headline text-4xl md:text-5xl text-white/90">
              From namaste to <span className="italic text-[#e3c285]">sold</span> — flawlessly
            </h2>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-9 gap-4">
            {steps.map((step, i) => (
              <div
                key={i}
                className="group flex flex-col items-center text-center cursor-default"
              >
                <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl border border-white/10 bg-white/[0.03] flex items-center justify-center mb-4 group-hover:border-[#e3c285]/50 group-hover:bg-[#e3c285]/10 transition-all duration-500">
                  <span className="material-symbols-outlined text-2xl text-white/40 group-hover:text-[#e3c285] transition-colors duration-500">
                    {step.icon}
                  </span>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#e3c285]/10 border border-[#e3c285]/30 flex items-center justify-center text-[9px] font-bold text-[#e3c285] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {step.num}
                  </span>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50 group-hover:text-white transition-colors duration-300">
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ SECTION 4: Feature Showcase ══════════ */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="md:col-span-2 relative rounded-2xl overflow-hidden group h-80">
              <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80" alt="Dashboard" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#000828] via-[#000828]/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8">
                <span className="text-[10px] uppercase tracking-widest text-[#e3c285] font-bold">AI Intelligence</span>
                <h3 className="font-headline text-2xl text-white mt-2">AI-powered negotiation coach</h3>
                <p className="text-sm text-white/40 mt-2 max-w-md">Real-time market comps, objection handlers, and counter-offer generation.</p>
              </div>
            </div>
            {/* Card 2 */}
            <div className="relative rounded-2xl overflow-hidden bg-[#152040] border border-white/5 p-8 flex flex-col justify-between h-80">
              <div>
                <span className="material-symbols-outlined text-4xl text-[#e3c285]/40">view_kanban</span>
                <h3 className="font-headline text-xl text-white mt-4">8-Stage Pipeline</h3>
                <p className="text-sm text-white/30 mt-3">Drag-and-drop Kanban from lead capture to possession handover.</p>
              </div>
              <div className="flex gap-1">
                {[40, 55, 45, 70, 85, 100, 90, 60].map((h, i) => (
                  <div key={i} className="flex-1 bg-white/5 rounded-t-sm" style={{ height: `${h}%`, maxHeight: 60 }}>
                    <div className="w-full rounded-t-sm" style={{ height: `${h}%`, background: i >= 5 ? '#e3c285' : i >= 3 ? '#8596ff' : 'rgba(255,255,255,0.15)' }} />
                  </div>
                ))}
              </div>
            </div>
            {/* Card 3 */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#e3c285] to-[#c29d5b] p-8 flex flex-col justify-between h-64">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#000828]/60 font-bold">Financial Suite</span>
                <h3 className="font-headline text-2xl text-[#000828] mt-2">EMI & Affordability</h3>
                <p className="text-sm text-[#000828]/50 mt-2">Bank rate comparisons, loan calculators, and instant affordability checks.</p>
              </div>
              <div className="font-headline text-5xl text-[#000828]/20">₹97,450<span className="text-xl">/mo</span></div>
            </div>
            {/* Card 4 */}
            <div className="md:col-span-2 relative rounded-2xl overflow-hidden group h-64">
              <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80" alt="Properties" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#000828] via-[#000828]/70 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8">
                <span className="text-[10px] uppercase tracking-widest text-[#e3c285] font-bold">Channel Partners</span>
                <h3 className="font-headline text-2xl text-white mt-2">Tiered broker network with commission ledger</h3>
                <p className="text-sm text-white/40 mt-2">Gold, Silver, Bronze tiers. Real-time payout tracking.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ SECTION 5: Final CTA ══════════ */}
      <section className="py-40 px-6 text-center relative">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle at center, #e3c285 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }} />
        <div className="relative z-10">
          <h2 className="font-headline text-5xl md:text-7xl text-white/90 mb-6">
            Your empire. <span className="italic text-[#e3c285]">Orchestrated</span>.
          </h2>
          <p className="text-lg text-white/30 mb-14 max-w-md mx-auto">
            Deals don't close themselves. Legends do. Step into the throne of closings.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="group relative px-16 py-6 rounded-full text-sm font-bold uppercase tracking-[0.3em] overflow-hidden transition-all duration-500 hover:shadow-[0_0_80px_rgba(227,194,133,0.25)]"
            style={{ background: '#e3c285', color: '#000828' }}
          >
            <span className="relative z-10">Launch Klose</span>
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <h3 className="font-headline text-xl italic text-[#e3c285]">Klose</h3>
            <span className="text-xs text-white/20">v1.0.0</span>
          </div>
          <p className="text-xs text-white/20 tracking-widest uppercase">
            Where India's top closers command their empire
          </p>
        </div>
      </footer>
    </div>
  );
}
