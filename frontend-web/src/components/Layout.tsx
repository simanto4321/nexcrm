import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard', label: 'Home', icon: '🏠' },
  { to: '/contacts', label: 'Contacts', icon: '👤' },
  { to: '/pipeline', label: 'Deals', icon: '💼' },
  { to: '/tasks', label: 'Tasks', icon: '✓' },
  { to: '/settings', label: 'Setup', icon: '⚙', adminOnly: true },
]

export default function Layout() {
  const { tenantName, user, logout, isAdmin, role } = useAuth()

  return (
    <div className="app-shell flex min-h-screen deep-bg-app">
      <aside className="hidden lg:flex w-56 flex-col fixed inset-y-0 left-0 sidebar-dark border-r z-40">
        <div className="h-14 flex items-center px-4 border-b border-white/10 gap-2">
          <div className="w-8 h-8 rounded bg-[#e42527] flex items-center justify-center text-white font-bold text-sm shadow-md">N</div>
          <div className="min-w-0">
            <p className="font-bold text-white text-sm truncate">NexCRM</p>
            <p className="text-[10px] text-slate-500 truncate">{tenantName}</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-600">Modules</p>
          {navItems.filter((i) => !i.adminOnly || isAdmin).map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-[#338cf0] text-white flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 capitalize">{role?.replace('_', ' ')}</p>
            </div>
          </div>
          <button type="button" onClick={logout} className="w-full mt-1 text-xs text-slate-500 hover:text-[#fca5a5] py-1">
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        <header className="h-14 topbar-dark border-b flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-8 h-8 rounded bg-[#e42527] flex items-center justify-center text-white font-bold text-sm">N</div>
            <span className="font-bold text-sm text-white">{tenantName}</span>
          </div>
          <div className="hidden sm:flex flex-1 max-w-md">
            <input type="search" placeholder="Search CRM..." className="zoho-input py-2 text-sm w-full max-w-xs" readOnly />
          </div>
          <span className="hidden md:inline text-xs text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
            {tenantName}
          </span>
          <button type="button" onClick={logout} className="lg:hidden text-xs text-[#fca5a5] font-semibold ml-2">Sign out</button>
        </header>

        <nav className="lg:hidden flex topbar-dark border-b border-white/10 overflow-x-auto">
          {navItems.filter((i) => !i.adminOnly || isAdmin).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex-shrink-0 px-4 py-3 text-xs font-semibold border-b-2 ${
                  isActive ? 'border-[#e42527] text-[#fca5a5]' : 'border-transparent text-slate-500'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 p-4 sm:p-6 page-fade deep-bg-app">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
