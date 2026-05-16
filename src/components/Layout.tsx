import React, { useState } from 'react';
import { useStore } from '../store';
import { Bell, LogOut, Menu, X, Target, LayoutDashboard, Users, BarChart2, FileText, ShieldCheck, CheckSquare, TrendingUp, ClipboardList } from 'lucide-react';

const NAV_ITEMS = {
  employee: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'goals', label: 'My Goals', icon: Target },
    { id: 'checkin', label: 'Check-ins', icon: CheckSquare },
    { id: 'reports', label: 'Reports', icon: FileText },
  ],
  manager: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'goals', label: 'My Goals', icon: Target },
    { id: 'team', label: 'Team Review', icon: Users },
    { id: 'checkin', label: 'Check-ins', icon: CheckSquare },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'reports', label: 'Reports', icon: FileText },
  ],
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'team', label: 'All Employees', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'reports', label: 'Reports', icon: ClipboardList },
    { id: 'admin', label: 'Admin Panel', icon: ShieldCheck },
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout, activePage, setActivePage, notifications, markAllRead } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);

  if (!currentUser) return null;

  const navItems = NAV_ITEMS[currentUser.role] || NAV_ITEMS.employee;
  const unread = notifications.filter(n => n.userId === currentUser.id && !n.isRead).length;

  const roleColors: Record<string, string> = { admin: '#ef4444', manager: '#f59e0b', employee: '#10b981' };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{ width: sidebarOpen ? 240 : 0, minWidth: sidebarOpen ? 240 : 0, background: 'var(--bg-800)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease', overflow: 'hidden' }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: 'white', fontFamily: 'Outfit, sans-serif', flexShrink: 0 }}>A</div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap' }}>AtomQuest</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 0.5 }}>Goal Tracking Portal</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const active = activePage === item.id;
            return (
              <button key={item.id} onClick={() => setActivePage(item.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: active ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))' : 'transparent', color: active ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: active ? 600 : 400, fontSize: 14, transition: 'all 0.15s', textAlign: 'left', width: '100%', whiteSpace: 'nowrap', borderLeft: active ? '3px solid var(--accent-primary)' : '3px solid transparent' }}>
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User info */}
        <div style={{ padding: 12, borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${roleColors[currentUser.role]}, #6366f1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>{currentUser.avatar || currentUser.name.slice(0,2)}</div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{currentUser.role}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{ height: 60, background: 'var(--bg-800)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4, borderRadius: 6 }}>
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div>
              <span style={{ fontSize: 15, fontWeight: 600, textTransform: 'capitalize' }}>{navItems.find(n => n.id === activePage)?.label || 'Dashboard'}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>FY 2025–26</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setNotifOpen(!notifOpen)} style={{ position: 'relative', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
                <Bell size={16} />
                {unread > 0 && <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, background: 'var(--accent-danger)', borderRadius: '50%', fontSize: 10, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</span>}
              </button>
              {notifOpen && (
                <div style={{ position: 'absolute', top: 44, right: 0, width: 340, background: 'var(--bg-700)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow-card)', zIndex: 100, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications {unread > 0 && <span style={{ background: 'var(--accent-danger)', color: 'white', fontSize: 10, padding: '1px 6px', borderRadius: 10, marginLeft: 6 }}>{unread}</span>}</span>
                    {unread > 0 && <button onClick={markAllRead} style={{ fontSize: 12, color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>Mark all read</button>}
                  </div>
                  <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                    {notifications.filter(n => n.userId === currentUser.id).length === 0
                      ? <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No notifications</div>
                      : notifications.filter(n => n.userId === currentUser.id).map(n => (
                        <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: n.isRead ? 'transparent' : 'rgba(99,102,241,0.06)' }}>
                          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{n.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{n.message}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{new Date(n.createdAt).toLocaleDateString()}</div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={logout} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#ef4444', display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, fontWeight: 500 }}>
              <LogOut size={14} /> <span className="hide-mobile">Logout</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 24, background: 'var(--bg-900)' }}>
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {notifOpen && <div onClick={() => setNotifOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />}
    </div>
  );
}
