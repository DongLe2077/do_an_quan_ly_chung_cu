'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useAuthStore from '@/store/authStore';

const adminMenuItems = [
  { key: '/dashboard', icon: '📊', label: 'Tổng quan' },
  { key: '/toa-nha', icon: '🏢', label: 'Tòa nhà' },
  { key: '/phong', icon: '🏠', label: 'Căn hộ' },
  { key: '/cu-dan', icon: '👥', label: 'Cư dân' },
  { key: '/dich-vu', icon: '🔧', label: 'Dịch vụ' },
  { key: '/chi-so-dich-vu', icon: '📈', label: 'Chỉ số' },
  { key: '/hoa-don', icon: '📄', label: 'Hóa đơn' },
  { key: '/su-co', icon: '⚠️', label: 'Sự cố' },
  { key: '/nguoi-dung', icon: '👥', label: 'Người dùng' },
];

const residentMenuItems = [
  { key: '/dashboard', icon: '🏠', label: 'Trang chủ Cư dân' },
  { key: '/hoa-don', icon: '💳', label: 'Hóa đơn' },
  { key: '/su-co', icon: '⚒️', label: 'Sự cố' },
];

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, initialize, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initialize();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        router.push('/login');
      }
    }
  }, [isAuthenticated, mounted]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const userName = user?.TenDangNhap || 'User';
  const isAdmin = user?.VaiTro === 'admin';
  const userRole = isAdmin ? 'Property Manager' : user?.VaiTro === 'cudan' ? 'Cư dân' : 'Người dùng';
  const initials = userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const menuItems = isAdmin ? adminMenuItems : residentMenuItems;

  return (
    <>
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" style={{ 
            width: 42, 
            height: 42, 
            background: 'transparent', 
            padding: 0, 
            overflow: 'hidden', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: '50%'
          }}>
            <img src="/logo.png" alt="Logo" style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', 
              transform: 'scale(1.3)',
              display: 'block'
            }} />
          </div>
          <div className="sidebar-logo-text">
            <h2>{isAdmin ? 'Elevate Admin' : 'Elevate Resident'}</h2>
            <span>{isAdmin ? 'MANAGEMENT' : 'PORTAL'}</span>
          </div>
        </div>

        {isAdmin && (
          <button className="sidebar-new-btn" onClick={() => router.push('/dashboard')}>
            <span>+ Thêm mới</span>
          </button>
        )}
        

        <nav className="sidebar-nav" style={{ marginTop: !isAdmin ? '0' : 'auto' }}>
          {menuItems.map(item => (
            <div
              key={item.key}
              className={`sidebar-nav-item ${pathname === item.key ? 'active' : ''}`}
              onClick={() => router.push(item.key)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom-links">
          <div className="sidebar-bottom-link danger" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span>Đăng xuất</span>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <h4>{userName}</h4>
            <span>{userRole}</span>
          </div>
        </div>
      </aside>

      {/* BOTTOM NAV FOR MOBILE (RESIDENTS ONLY) */}
      {!isAdmin && (
        <nav className="bottom-nav">
          {residentMenuItems.map(item => (
            <div
              key={item.key}
              className={`bottom-nav-item ${pathname === item.key ? 'active' : ''}`}
              onClick={() => router.push(item.key)}
            >
              <span className="bottom-nav-icon">{item.icon}</span>
              <span className="bottom-nav-label">{item.label.replace('Trang chủ Cư dân', 'Tổng quan')}</span>
            </div>
          ))}
          <div
            className={`bottom-nav-item ${pathname === '/profile' ? 'active' : ''}`}
            onClick={() => router.push('/profile')}
          >
            <span className="bottom-nav-icon">👤</span>
            <span className="bottom-nav-label">Cá nhân</span>
          </div>
        </nav>
      )}

      {/* STYLES FOR MOBILE NAV */}
      <style jsx>{`
        .bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 65px;
          background: #fff;
          border-top: 1px solid var(--border-color);
          z-index: 2000;
          justify-content: space-around;
          align-items: center;
          padding: 0 10px;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
        }
        .bottom-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
          flex: 1;
        }
        .bottom-nav-item.active {
          color: var(--accent);
        }
        .bottom-nav-icon {
          font-size: 20px;
        }
        .bottom-nav-label {
          font-size: 10px;
          font-weight: 600;
        }
        
        @media (max-width: 768px) {
          .bottom-nav {
            display: ${!isAdmin ? 'flex' : 'none'};
          }
        }
      `}</style>

      {/* MAIN CONTENT */}
      <div className="main-layout">
        {/* TOP BAR */}
        <header className="top-bar">
          <div className="top-bar-search">
            {!isAdmin ? (
               <div style={{ padding: '8px 0', fontSize: 16, fontWeight: 600, color: 'var(--primary)' }}>
                 Hệ thống cư dân thông minh
               </div>
            ) : (
              <>
                <span className="search-icon">🔍</span>
                <input type="text" placeholder="Tìm kiếm cư dân, tòa nhà..." />
              </>
            )}
          </div>
          <div className="top-bar-right">
            {!isAdmin ? (
               <button className="top-bar-icon-btn" title="Tin nhắn">💬</button>
            ) : (
               <button className="top-bar-icon-btn" title="Thông báo">🔔</button>
            )}
            <div className="top-bar-profile" onClick={() => router.push('/profile')}>
              <span>Profile</span>
              <div className="top-bar-avatar">{initials}</div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="content-area">
          <div key={pathname} className="page-transition">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
