import React from 'react';
import { Icon } from './Icons';
import { ApiConfig } from '../lib/api';

export const Sidebar = ({ activeTab, setActiveTab, lang, setLang }) => {
  const currentUser = ApiConfig.getCurrentUser();
  const token = ApiConfig.getToken();

  const menuSections = [
    {
      title: "ASOSIY",
      items: [
        { id: "dashboard", label: "Dashboard", icon: "dashboard" }
      ]
    },
    {
      title: "TIBBIY BAZA",
      items: [
        { id: "cases", label: "Klinik Case'lar", icon: "stethoscope" },
        { id: "categories", label: "Bo'limlar", icon: "folders" },
        { id: "topics", label: "Mavzular", icon: "listChecks" },
        { id: "ai_prompts", label: "AI Promptlari", icon: "sparkles" },
        { id: "levels", label: "Levellar (XP)", icon: "award" }
      ]
    },
    {
      title: "MOLIYA",
      items: [
        { id: "tariffs", label: "Tariflar", icon: "creditCard" },
        { id: "orders", label: "Buyurtmalar & To'lovlar", icon: "shoppingBag" },
        { id: "promocodes", label: "Promokodlar", icon: "tag" },
        { id: "partners", label: "Hamkorlar", icon: "handshake" }
      ]
    },
    {
      title: "KONTENT & CMS",
      items: [
        { id: "banners", label: "Bannerlar", icon: "image" },
        { id: "notifications", label: "Bildirishnomalar", icon: "bell" },
        { id: "cms", label: "CMS Kontent", icon: "fileText" }
      ]
    },
    {
      title: "TIZIM",
      items: [
        { id: "admins", label: "Adminlar & Rollar", icon: "users" },
        { id: "settings", label: "Sozlamalar", icon: "settings" }
      ]
    }
  ];

  return (
    <aside style={{
      width: '260px',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '18px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon name="stethoscope" size={20} color="#ffffff" />
        </div>
        <div>
          <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#fff' }}>TibCase Admin</div>
        </div>
      </div>

      {/* Navigation List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '14px 10px'
      }}>
        {menuSections.map((sec, idx) => (
          <div key={idx} style={{ marginBottom: '16px' }}>
            <div style={{
              fontSize: '0.65rem',
              fontWeight: '700',
              color: 'var(--text-muted)',
              padding: '0 10px 6px 10px',
              letterSpacing: '0.08em'
            }}>
              {sec.title}
            </div>
            {sec.items.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    marginBottom: '2px',
                    transition: 'all 0.15s ease',
                    background: isActive ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                    color: isActive ? '#fff' : 'var(--text-secondary)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon
                      name={item.icon}
                      size={16}
                      color={isActive ? 'var(--accent-cyan)' : 'var(--text-muted)'}
                    />
                    <span style={{ fontSize: '0.82rem', fontWeight: isActive ? '600' : '500' }}>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Language & Profile Footer */}
      <div style={{
        padding: '12px 14px',
        borderTop: '1px solid var(--border-subtle)',
        background: '#090e1a',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Til:</span>
          <div style={{ display: 'flex', gap: '3px', background: 'var(--bg-input)', padding: '2px', borderRadius: '4px' }}>
            {['uz', 'ru', 'en'].map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  padding: '2px 6px',
                  fontSize: '0.68rem',
                  fontWeight: '600',
                  borderRadius: '3px',
                  textTransform: 'uppercase',
                  background: lang === l ? 'var(--accent-cyan)' : 'transparent',
                  color: lang === l ? '#fff' : 'var(--text-secondary)'
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'rgba(59, 130, 246, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon name="shield" size={14} color="var(--accent-blue)" />
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {token ? (currentUser?.login || 'Admin') : 'Mehmon'}
            </div>
            <div style={{ fontSize: '0.65rem', color: token ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
              {token ? '● Ulangan' : '○ Ulanmagan'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
