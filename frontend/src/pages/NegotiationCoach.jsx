import { useState, useEffect, useRef } from 'react';
import api from '../api';

const DEAL_ID = 10;

const defaultMessages = [
  {
    role: 'ai',
    text: 'Good afternoon. I\'ve reviewed the Belvedere Heights file and current market comps. The listing is priced at $2.85M, which sits 4.2% above the median comp. However, buyer engagement signals are strong — 88% interest score. I recommend we anchor our counter at $2.72M and negotiate toward $2.78M. Shall I walk you through the valuation logic?',
  },
  {
    role: 'user',
    text: 'Yes, show me the comps that support a lower anchor.',
  },
  {
    role: 'ai',
    text: 'Three comparable sales within 0.4 miles closed in the last 90 days: 1) 412 Belvedere Dr — $2.68M (3,420 sqft), 2) 88 Summit Terrace — $2.74M (3,610 sqft), 3) 1100 Ridge Lane — $2.81M (3,800 sqft). Adjusting for square footage and lot premium, the subject property\'s fair market value is approximately $2.73M–$2.79M. This gives us room to anchor at $2.72M without appearing unreasonable.',
  },
];

const defaultComps = {
  subject: {
    address: '1420 Belvedere Heights Dr',
    city: 'Beverly Hills, CA 90210',
    list_price: 2850000,
    sqft: 3650,
    beds: 5,
    baths: 4,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=300&fit=crop',
  },
  comps: [
    { id: 1, address: '412 Belvedere Dr', sold_price: 2680000, sqft: 3420, image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=120&h=80&fit=crop' },
    { id: 2, address: '88 Summit Terrace', sold_price: 2740000, sqft: 3610, image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=120&h=80&fit=crop' },
  ],
};

const defaultHealth = {
  buyer_interest: 88,
  price_alignment: 65,
};

const defaultInsights = [
  { icon: 'show_chart', text: 'Median price in this ZIP rose 2.1% in the last quarter' },
  { icon: 'schedule', text: 'Average days on market: 28 (down from 35)' },
  { icon: 'groups', text: '3 competing offers detected within 0.5 miles' },
  { icon: 'trending_up', text: 'Buyer demand index: 8.4/10 (very strong)' },
];

function fmt(n) {
  if (n == null) return '--';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

export default function NegotiationCoach() {
  const [messages, setMessages] = useState(defaultMessages);
  const [comps, setComps] = useState(defaultComps);
  const [health, setHealth] = useState(defaultHealth);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.getChatHistory(DEAL_ID).catch(() => null),
      api.getDealComps(DEAL_ID).catch(() => null),
      api.getDealHealth(DEAL_ID).catch(() => null),
    ]).then(([hist, c, h]) => {
      if (Array.isArray(hist) && hist.length) {
        setMessages(hist.map(m => ({ role: m.role === 'assistant' ? 'ai' : 'user', text: m.content })));
      } else if (hist?.messages?.length) {
        setMessages(hist.messages.map(m => ({ role: m.role === 'assistant' ? 'ai' : 'user', text: m.content || m.text })));
      }
      if (c) setComps(c);
      if (h) setHealth(h);
    });
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend(text) {
    const msg = text || input.trim();
    if (!msg) return;
    setMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setInput('');
    setSending(true);
    try {
      const res = await api.sendChat(DEAL_ID, msg);
      if (res?.messages?.length) {
        const last = res.messages[res.messages.length - 1];
        if (last.role === 'assistant') {
          setMessages((prev) => [...prev, { role: 'ai', text: last.content }]);
        }
      } else if (res?.reply) {
        setMessages((prev) => [...prev, { role: 'ai', text: res.reply }]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'I apologize — I was unable to process that request. Please try rephrasing your question.' },
      ]);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const chips = ['Focus on Valuation', 'Leverage Closing Speed', 'Request New Comps'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)] mb-2">
          Active Negotiation
        </p>
        <h2 className="font-headline text-5xl lg:text-6xl text-[var(--color-navy-900)]">
          The Residences at <span className="italic text-[var(--color-gold)]">Belvedere Heights</span>
        </h2>
        <div className="flex items-center gap-2 mt-3">
          <span className="material-symbols-outlined text-base text-[var(--color-gold)]">auto_awesome</span>
          <span className="text-sm text-[var(--color-on-surface-variant)]">Powered by AI Intelligence</span>
        </div>
      </div>

      {/* Main 12-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column — 8 cols */}
        <div className="lg:col-span-8 space-y-6">
          {/* Chat Interface Card */}
          <div className="bg-white rounded-xl editorial-shadow overflow-hidden">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[var(--color-navy-900)] text-xl">psychology_alt</span>
                <h3 className="font-headline text-lg text-[var(--color-navy-900)]">Negotiation Strategist</h3>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-[#f7f9fc] text-[var(--color-on-surface-variant)] border border-gray-200">
                DEAL-{DEAL_ID}
              </span>
            </div>

            {/* Messages area */}
            <div ref={scrollRef} className="p-6 space-y-5 min-h-[500px] max-h-[500px] overflow-y-auto">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'ai' && (
                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: '#000828' }}>
                      <span className="material-symbols-outlined text-[var(--color-gold)] text-sm">auto_awesome</span>
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'ai'
                        ? 'bg-[#f7f9fc] text-[var(--color-navy-900)]'
                        : 'text-white'
                    }`}
                    style={msg.role === 'user' ? { background: '#152040' } : undefined}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: '#000828' }}>
                    <span className="material-symbols-outlined text-[var(--color-gold)] text-sm">auto_awesome</span>
                  </div>
                  <div className="bg-[#f7f9fc] rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Choice chips */}
            <div className="px-6 pb-3 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSend(chip)}
                  disabled={sending}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-full border border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[#000828] transition-colors disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input tray */}
            <div className="px-6 pb-6 pt-2">
              <div className="flex items-center gap-3 bg-[#f7f9fc] rounded-full px-4 py-2 border border-gray-200 focus-within:border-[var(--color-gold)] transition-colors">
                <span className="material-symbols-outlined text-gray-400 text-xl">chat_bubble</span>
                <input
                  type="text"
                  placeholder="Type your negotiation question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                  className="flex-1 bg-transparent text-sm text-[var(--color-navy-900)] placeholder:text-gray-400 outline-none"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={sending || !input.trim()}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-colors disabled:opacity-40"
                  style={{ background: 'var(--color-gold)', color: '#000828' }}
                >
                  <span className="material-symbols-outlined text-lg">send</span>
                </button>
              </div>
            </div>
          </div>

          {/* Market Insights + Health — 2-col grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dark card: Market-Aware Insights */}
            <div className="rounded-xl p-6" style={{ background: '#152040' }}>
              <div className="flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-[var(--color-gold)]">trending_up</span>
                <h4 className="font-headline text-lg text-white">Market-Aware Insights</h4>
              </div>
              <ul className="space-y-4">
                {defaultInsights.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[var(--color-gold)] text-base mt-0.5">{item.icon}</span>
                    <span className="text-sm text-gray-300 leading-relaxed">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Light card: Negotiation Health */}
            <div className="bg-white rounded-xl editorial-shadow p-6">
              <h4 className="font-headline text-lg text-[var(--color-navy-900)] mb-6">Current Negotiation Health</h4>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[var(--color-on-surface-variant)]">Buyer Interest</span>
                    <span className="font-semibold text-[var(--color-navy-900)]">{health.buyer_interest}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${health.buyer_interest}%`, background: 'var(--color-gold)' }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[var(--color-on-surface-variant)]">Price Alignment</span>
                    <span className="font-semibold text-[var(--color-navy-900)]">{health.price_alignment}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${health.price_alignment}%`, background: '#152040' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column — 4 cols */}
        <div className="lg:col-span-4 space-y-6">
          {/* Comp Card */}
          <div className="bg-white rounded-xl editorial-shadow overflow-hidden">
            <div className="relative">
              <img
                src={comps.subject.image}
                alt={comps.subject.address}
                className="w-full h-40 object-cover"
              />
              <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white" style={{ background: '#000828' }}>
                Subject
              </span>
            </div>
            <div className="p-5">
              <h4 className="font-headline text-lg text-[var(--color-navy-900)]">{comps.subject.address}</h4>
              <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">{comps.subject.city}</p>
              <p className="text-xl font-bold text-[var(--color-gold)] mt-2">{fmt(comps.subject.list_price)}</p>
              <div className="flex gap-4 mt-2 text-xs text-[var(--color-on-surface-variant)]">
                <span>{comps.subject.beds} Beds</span>
                <span>{comps.subject.baths} Baths</span>
                <span>{comps.subject.sqft?.toLocaleString()} sqft</span>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-3">Top Comparable Comps</p>
                <div className="space-y-3">
                  {comps.comps.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 group cursor-pointer">
                      <img src={c.image} alt={c.address} className="w-14 h-10 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--color-navy-900)] truncate">{c.address}</p>
                        <p className="text-xs text-[var(--color-gold)]">Sold {fmt(c.sold_price)}</p>
                      </div>
                      <span className="material-symbols-outlined text-gray-300 group-hover:text-[var(--color-gold)] text-lg transition-colors">chevron_right</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Objection Handler */}
          <div className="bg-[#f7f9fc] rounded-xl p-5 border-l-4" style={{ borderColor: 'var(--color-gold)' }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[var(--color-navy-900)]">shield</span>
              <h4 className="font-headline text-lg text-[var(--color-navy-900)]">Objection Handler</h4>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-red-500 mb-1">Objection</p>
                <p className="text-sm text-[var(--color-navy-900)]">"The property is overpriced compared to recent sales."</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mt-2 mb-1">Response</p>
                <p className="text-sm text-[var(--color-on-surface-variant)]">
                  The subject property features a 200 sqft premium lot and renovated kitchen (2024) not reflected in raw comp data. Adjusted value supports the current ask within 2.3%.
                </p>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs font-semibold uppercase tracking-wider text-red-500 mb-1">Objection</p>
                <p className="text-sm text-[var(--color-navy-900)]">"We need a faster closing timeline."</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mt-2 mb-1">Response</p>
                <p className="text-sm text-[var(--color-on-surface-variant)]">
                  Our client has pre-approval in hand and can close within 21 days. This positions us favorably against competing offers requiring 45-day contingencies.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <button
              className="w-full px-5 py-3 rounded-xl text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              style={{ background: 'var(--color-gold)', color: '#000828' }}
            >
              <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
              Generate Counter-Offer PDF
            </button>
            <button
              className="w-full px-5 py-3 rounded-xl text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border border-gray-200 text-[var(--color-navy-900)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors"
            >
              <span className="material-symbols-outlined text-lg">mail</span>
              Email Draft to Principal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
