import { Outlet, NavLink, useLocation } from 'react-router-dom';

const primaryNav = [
  { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { path: '/leads', icon: 'groups', label: 'Leads' },
  { path: '/properties', icon: 'domain', label: 'Inventory' },
  { path: '/pipeline', icon: 'view_kanban', label: 'Pipeline' },
];

const secondaryNav = [
  { path: '/partners', icon: 'handshake', label: 'Portal' },
  { path: '/team', icon: 'group_work', label: 'Team' },
  { path: '/visits', icon: 'calendar_month', label: 'Visits' },
  { path: '/coach', icon: 'psychology_alt', label: 'Coach' },
  { path: '/finance', icon: 'calculate', label: 'Finance' },
];

const secondaryPaths = secondaryNav.map(n => n.path);

export default function Layout() {
  const { pathname } = useLocation();
  const isSecondary = secondaryPaths.some(p => pathname.startsWith(p));
  const nav = isSecondary ? secondaryNav : primaryNav;

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      {/* Top App Bar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[#152040] flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[var(--color-gold)] flex items-center justify-center overflow-hidden">
            <span className="material-symbols-outlined text-[#152040] text-xl">apartment</span>
          </div>
          <h1 className="font-headline text-2xl italic text-[var(--color-gold)] tracking-widest">Klose</h1>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-8">
            {(isSecondary ? secondaryNav : primaryNav).map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `font-sans text-sm tracking-wide uppercase font-semibold transition-opacity ${
                    isActive ? 'text-[var(--color-gold)]' : 'text-white/70 hover:opacity-80'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            {!isSecondary && (
              <NavLink to="/partners" className="text-white/70 hover:opacity-80 font-sans text-sm tracking-wide uppercase font-semibold">More</NavLink>
            )}
            {isSecondary && (
              <NavLink to="/dashboard" className="text-white/70 hover:opacity-80 font-sans text-sm tracking-wide uppercase font-semibold">Dashboard</NavLink>
            )}
          </nav>
          <NavLink to="/settings" className="text-[var(--color-gold)] hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined">settings</span>
          </NavLink>
          <button className="text-[var(--color-gold)] hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-[72px] h-[calc(100vh-72px)] w-20 bg-[#152040] flex-col items-center py-8 gap-6 z-40">
        {nav.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-all ${
                isActive ? 'text-[var(--color-gold)]' : 'text-white/50 hover:text-[var(--color-gold)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`material-symbols-outlined text-2xl ${isActive ? 'filled' : ''}`}>{item.icon}</span>
                <span className="text-[9px] font-semibold uppercase tracking-tighter">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
        <div className="mt-auto">
          <NavLink to="/settings" className={({ isActive }) => `text-white/50 hover:text-[var(--color-gold)] transition-colors ${isActive ? 'text-[var(--color-gold)]' : ''}`}>
            <span className="material-symbols-outlined text-2xl">settings</span>
          </NavLink>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pt-[72px] md:pl-20 pb-28 md:pb-8 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-white/80 backdrop-blur-xl rounded-t-3xl shadow-[0_-12px_40px_rgba(25,28,30,0.06)]">
        {nav.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center transition-transform ${
                isActive
                  ? 'text-[#152040] font-bold scale-110'
                  : 'text-slate-400 hover:text-[var(--color-secondary)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`material-symbols-outlined ${isActive ? 'filled' : ''}`}>{item.icon}</span>
                <span className="text-[10px] font-semibold uppercase tracking-tighter">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
        <NavLink
          to={isSecondary ? '/dashboard' : '/partners'}
          className="flex flex-col items-center justify-center text-slate-400 hover:text-[var(--color-secondary)]"
        >
          <span className="material-symbols-outlined">more_horiz</span>
          <span className="text-[10px] font-semibold uppercase tracking-tighter">More</span>
        </NavLink>
      </nav>
    </div>
  );
}
