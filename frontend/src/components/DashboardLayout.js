'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import buildingService from '@/services/buildingService';
import apartmentService from '@/services/apartmentService';
import residentService from '@/services/residentService';

const adminMenuItems = [
  { key: '/dashboard', icon: '📊', label: 'Tổng quan' },
  { key: '/buildings', icon: '🏢', label: 'Tòa nhà' },
  { key: '/apartments', icon: '🏠', label: 'Căn hộ' },
  { key: '/residents', icon: '👥', label: 'Cư dân' },
  { key: '/services', icon: '🔧', label: 'Dịch vụ' },
  { key: '/service-readings', icon: '📈', label: 'Chỉ số' },
  { key: '/invoices', icon: '📄', label: 'Hóa đơn' },
  { key: '/incidents', icon: '⚠️', label: 'Sự cố' },
  { key: '/users', icon: '👥', label: 'Người dùng' },
];

const residentMenuItems = [
  { key: '/dashboard', icon: '🏠', label: 'Trang chủ Cư dân' },
  { key: '/invoices', icon: '💳', label: 'Hóa đơn' },
  { key: '/incidents', icon: '⚒️', label: 'Sự cố' },
];

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, initialize, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ buildings: [], apartments: [], residents: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);
  const userName = user?.username || 'User';
  const isAdmin = user?.role === 'admin';
  const userRole = isAdmin ? 'Property Manager' : user?.role === 'cudan' ? 'Cư dân' : 'Người dùng';
  const initials = userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

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

  useEffect(() => {
    if (!isAdmin) return;

    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchResults({ buildings: [], apartments: [], residents: [] });
      setShowSearch(false);
      return;
    }

    let active = true;
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const [apartmentsRes, residentsRes, buildingsRes] = await Promise.all([
          apartmentService.getAll({ page: 1, limit: 5, search: query }),
          residentService.getAll({ page: 1, limit: 5, search: query }),
          buildingService.getAll()
        ]);

        if (!active) return;

        const lower = query.toLowerCase();
        const buildings = (buildingsRes.data?.data || [])
          .filter((b) =>
            b.building_name?.toLowerCase().includes(lower) ||
            b.building_id?.toLowerCase().includes(lower)
          )
          .slice(0, 5);

        setSearchResults({
          buildings,
          apartments: apartmentsRes.data?.data || [],
          residents: residentsRes.data?.data || []
        });
        setShowSearch(true);
      } catch {
        if (active) {
          setSearchResults({ buildings: [], apartments: [], residents: [] });
        }
      } finally {
        if (active) setSearchLoading(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery, isAdmin]);

  useEffect(() => {
    if (!showSearch) return;
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearch]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = isAdmin ? adminMenuItems : residentMenuItems;
  const hasResults =
    searchResults.buildings.length ||
    searchResults.apartments.length ||
    searchResults.residents.length;

  const navigateWithSearch = (path, value) => {
    setShowSearch(false);
    router.push(`${path}?search=${encodeURIComponent(value)}`);
  };

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
            <h2>{isAdmin ? 'Ban Quản Lý' : 'Cổng Cư Dân'}</h2>
            <span>{isAdmin ? 'CHUNG CƯ' : 'DỊCH VỤ THÔNG MINH'}</span>
          </div>
        </div>


        

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

      {/* BOTTOM NAV FOR MOBILE */}
      <nav className="bottom-nav">
        {menuItems.map(item => (
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
          align-items: center;
          padding: 0 10px;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
          overflow-x: auto;
          white-space: nowrap;
          -webkit-overflow-scrolling: touch;
        }
        .bottom-nav::-webkit-scrollbar {
          display: none;
        }
        .bottom-nav-item {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
          padding: 0 15px;
          min-width: 75px;
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
            display: flex;
          }
        }
      `}</style>

      {/* MAIN CONTENT */}
      <div className="main-layout">
        {/* TOP BAR */}
        <header className="top-bar">
          <div className="top-bar-search" ref={searchRef} style={{ position: 'relative' }}>
            {!isAdmin ? (
               <div style={{ padding: '8px 0', fontSize: 16, fontWeight: 600, color: 'var(--primary)' }}>
                 Hệ thống cư dân thông minh
               </div>
            ) : (
              <>
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Tìm kiếm cư dân, tòa nhà..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (hasResults) setShowSearch(true);
                  }}
                />
                {showSearch && (
                  <div style={{
                    position: 'absolute',
                    top: 44,
                    left: 0,
                    right: 0,
                    background: '#fff',
                    border: '1px solid var(--border-color)',
                    borderRadius: 10,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    zIndex: 2000,
                    padding: 8
                  }}>
                    {searchLoading && (
                      <div style={{ padding: '8px 12px', fontSize: 13, color: 'var(--text-muted)' }}>
                        Đang tìm kiếm...
                      </div>
                    )}

                    {!searchLoading && !hasResults && (
                      <div style={{ padding: '8px 12px', fontSize: 13, color: 'var(--text-muted)' }}>
                        Không tìm thấy kết quả
                      </div>
                    )}

                    {!searchLoading && hasResults && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {searchResults.buildings.length > 0 && (
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', padding: '0 8px 6px' }}>
                              TÒA NHÀ
                            </div>
                            {searchResults.buildings.map((b) => (
                              <div
                                key={b.building_id}
                                onClick={() => navigateWithSearch('/buildings', b.building_name || b.building_id)}
                                style={{
                                  padding: '8px 10px',
                                  borderRadius: 8,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  justifyContent: 'space-between'
                                }}
                              >
                                <span style={{ fontSize: 13 }}>{b.building_name}</span>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.building_id}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {searchResults.apartments.length > 0 && (
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', padding: '0 8px 6px' }}>
                              CĂN HỘ
                            </div>
                            {searchResults.apartments.map((a) => (
                              <div
                                key={a.apartment_id}
                                onClick={() => navigateWithSearch('/apartments', a.apartment_number || a.apartment_id)}
                                style={{
                                  padding: '8px 10px',
                                  borderRadius: 8,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  justifyContent: 'space-between'
                                }}
                              >
                                <span style={{ fontSize: 13 }}>{a.apartment_number}</span>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.building_name || a.building_id}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {searchResults.residents.length > 0 && (
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', padding: '0 8px 6px' }}>
                              CƯ DÂN
                            </div>
                            {searchResults.residents.map((r) => (
                              <div
                                key={r.resident_id}
                                onClick={() => navigateWithSearch('/residents', r.full_name || r.resident_id)}
                                style={{
                                  padding: '8px 10px',
                                  borderRadius: 8,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  justifyContent: 'space-between'
                                }}
                              >
                                <span style={{ fontSize: 13 }}>{r.full_name}</span>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.apartment_number || 'Chưa liên kết'}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
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
