import React from 'react';
import { Icon } from './Icons';
import { ApiConfig } from '../lib/api';

export const Header = ({ activeTab, onShowToast, onLogout }) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard & Analitika';
      case 'cases': return 'Klinik Case\'lar';
      case 'categories': return 'Bo\'limlar (Kategoriyalar)';
      case 'topics': return 'Mavzular';
      case 'ai_prompts': return 'AI Promptlari';
      case 'levels': return 'Levellar (XP)';
      case 'tariffs': return 'Tariflar';
      case 'orders': return 'Buyurtmalar & To\'lovlar';
      case 'promocodes': return 'Promokodlar';
      case 'partners': return 'Hamkorlar';
      case 'banners': return 'Bannerlar';
      case 'notifications': return 'Bildirishnomalar';
      case 'cms': return 'CMS Kontent';
      case 'admins': return 'Adminlar & Rollar';
      case 'settings': return 'Sozlamalar';
      default: return 'TibCase Admin';
    }
  };

  const currentUser = ApiConfig.getCurrentUser();
  const token = ApiConfig.getToken();

  return (
    <header style={{
      height: '60px',
      background: 'rgba(13, 21, 39, 0.95)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 30
    }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff', letterSpacing: '-0.01em' }}>
          {getTabTitle()}
        </h1>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          TibCase / Admin
        </div>
      </div>

      {/* Right side: Auth status & profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {token ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#fff' }}>
                {currentUser?.login || 'Admin'}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--accent-emerald)' }}>
                ● Tizimga kirilgan
              </div>
            </div>
            <button
              onClick={onLogout}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
              title="Chiqish"
            >
              <Icon name="logOut" size={14} />
              <span>Chiqish</span>
            </button>
          </div>
        ) : (
          <div style={{ fontSize: '0.78rem', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>⚠️ Tizimga kirilmagan</span>
          </div>
        )}
      </div>
    </header>
  );
};
