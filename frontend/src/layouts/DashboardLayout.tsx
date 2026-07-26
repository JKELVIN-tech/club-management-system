import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import clsx from 'clsx';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Overview', roles: ['ADMIN', 'TREASURER', 'SECRETARY', 'MEMBER'] },
  { to: '/profile', label: 'My Profile', roles: ['ADMIN', 'TREASURER', 'SECRETARY', 'MEMBER'] },
  { to: '/members', label: 'Members', roles: ['ADMIN', 'TREASURER', 'SECRETARY'] },
  { to: '/finance', label: 'Finance', roles: ['ADMIN', 'TREASURER'] },
  { to: '/events', label: 'Events', roles: ['ADMIN', 'SECRETARY', 'TREASURER', 'MEMBER'] },
  { to: '/communication', label: 'Announcements', roles: ['ADMIN', 'SECRETARY', 'TREASURER', 'MEMBER'] },
  { to: '/reports', label: 'Reports', roles: ['ADMIN', 'SECRETARY', 'TREASURER'] },
];

export function DashboardLayout() {
  const { member, logout } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const visibleItems = NAV_ITEMS.filter((item) => member && item.roles.includes(member.role));

  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="flex w-60 flex-col bg-forest-dark text-white/90">
        <div className="px-6 py-6">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-white/50">
            Club Management
          </p>
          <p className="font-display text-lg font-medium text-white">System</p>
        </div>
        <nav className="flex-1 px-3">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'mb-1 block rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-forest text-white' : 'text-white/70 hover:bg-forest/60 hover:text-white'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 px-4 py-4">
          <p className="truncate text-sm font-medium text-white">
            {member?.firstName} {member?.lastName}
          </p>
          <p className="text-xs text-white/50">{member?.role}</p>
          <button
            onClick={handleLogout}
            className="mt-3 text-xs font-medium text-amber hover:underline"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
