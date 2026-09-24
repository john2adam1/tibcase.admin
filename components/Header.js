import React from 'react';
import { Icon } from './Icons';

export const Header = ({
  activeTab,
  onQuickAddCase,
  onQuickAiTest,
  isLiveApi,
  setIsLiveApi,
  onShowToast
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard & Tizim Ko\'rsatkichlari';
      case 'cases': return 'Klinik Case\'lar & Simulyatsiya Boshqaruvi';
      case 'categories': return 'Tibbiy Bo\'limlar (Kategoriyalar)';
      case 'topics': return 'Mavzular (Topics)';
      case 'ai_prompts': return 'AI Prompt Muhandisligi & Test Sandbox';
      case 'levels': return 'Talaba & Shifokor Levellari (XP Tizimi)';
      case 'tariffs': return 'Tariflar & TibCoins Paketlari';
      case 'orders': return 'To\'lovlar & Buyurtmalar Monitoringi';
      case 'promocodes': return 'Promokodlar & Chegirmalar';
      case 'partners': return 'Hamkor Tibbiyot OTMlari & Tashkilotlar';
      case 'banners': return 'Ilova Bannerlari & E\'lonlar';
      case 'notifications': return 'Push Bildirishnomalar Tarqatish';
      case 'cms': return 'CMS Kontent (Biz haqimizda, FAQ, Kontaktlar)';
      case 'admins': return 'Admin Foydalanuvchilar & RBAC Huquqlari';
      case 'settings': return 'Tizim Sozlamalari & API Konfiguratsiya';
      default: return 'TibCase Admin Panel';
    }
  };

  return (
    <header style={{
      height: '64px',
      background: 'rgba(13, 21, 39, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 30
    }}>
      {/* Title & Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff', letterSpacing: '-0.02em' }}>
            {getTabTitle()}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>TibSphere Admin</span>
            <span>/</span>
            <span style={{ color: 'var(--accent-cyan)' }}>{activeTab.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Center / Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Backend Mode Switcher */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-input)',
          padding: '4px 10px',
          borderRadius: '20px',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.75rem'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isLiveApi ? '#10b981' : '#06b6d4',
            boxShadow: isLiveApi ? '0 0 8px #10b981' : '0 0 8px #06b6d4'
          }}></span>
          <span style={{ color: 'var(--text-secondary)' }}>
            Rejim: <strong style={{ color: '#fff' }}>{isLiveApi ? 'Live Backend API' : 'Mahalliy Interaktiv Baza'}</strong>
          </span>
          <button
            onClick={() => {
              const next = !isLiveApi;
              setIsLiveApi(next);
              onShowToast(`Rejim o'zgartirildi: ${next ? 'Live Backend API' : 'Mahalliy Interaktiv Baza'}`, 'info');
            }}
            style={{
              padding: '2px 8px',
              fontSize: '0.68rem',
              borderRadius: '12px',
              background: '#1e293b',
              color: 'var(--accent-cyan)',
              border: '1px solid #334155'
            }}
          >
            Almashtirish
          </button>
        </div>

        {/* Quick Actions */}
        <button
          onClick={onQuickAddCase}
          className="btn-primary"
          style={{ padding: '7px 12px', fontSize: '0.8rem' }}
        >
          <Icon name="plus" size={15} />
          <span>Yangi Keys</span>
        </button>

        <button
          onClick={onQuickAiTest}
          className="btn-secondary"
          style={{ padding: '7px 12px', fontSize: '0.8rem', color: 'var(--accent-purple)', borderColor: 'rgba(139, 92, 246, 0.4)' }}
        >
          <Icon name="sparkles" size={15} color="var(--accent-purple)" />
          <span>AI Sinov</span>
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn-icon"
            style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-input)', padding: '8px', borderRadius: '8px' }}
            title="Bildirishnomalar"
            onClick={() => onShowToast("Tizim yangilanishi: TibCase AI v2.4 barqaror ishlamoqda.", "info")}
          >
            <Icon name="bell" size={16} />
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: 'var(--accent-rose)'
            }}></span>
          </button>
        </div>
      </div>
    </header>
  );
};
