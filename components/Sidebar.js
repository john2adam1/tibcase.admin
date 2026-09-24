import React from 'react';
import { Icon } from './Icons';

export const Sidebar = ({ activeTab, setActiveTab, lang, setLang }) => {
  const menuSections = [
    {
      title: "ASOSIY BOSHQARUV",
      items: [
        { id: "dashboard", label: "Dashboard / Analitika", icon: "dashboard", badge: "Live" }
      ]
    },
    {
      title: "TIBBIY BAZA & SIMULYATSIYA",
      items: [
        { id: "cases", label: "Klinik Case'lar (Simulyatsiya)", icon: "stethoscope", highlight: true },
        { id: "categories", label: "Bo'limlar (Kategoriya)", icon: "folders" },
        { id: "topics", label: "Mavzular (Topics)", icon: "listChecks" },
        { id: "ai_prompts", label: "AI Promptlar & Sandbox", icon: "sparkles", badge: "AI" },
        { id: "levels", label: "Levellar & XP (Reyting)", icon: "award" }
      ]
    },
    {
      title: "MOLIYA VA MONETIZATSIYA",
      items: [
        { id: "tariffs", label: "Tariflar & Coin Paketlar", icon: "creditCard" },
        { id: "orders", label: "Buyurtmalar & To'lovlar", icon: "shoppingBag" },
        { id: "promocodes", label: "Promokodlar", icon: "tag" },
        { id: "partners", label: "Hamkorlar & Universitetlar", icon: "handshake" }
      ]
    },
    {
      title: "KONTENT VA CMS",
      items: [
        { id: "banners", label: "Bannerlar & Slaydlar", icon: "image" },
        { id: "notifications", label: "Push Bildirishnomalar", icon: "bell" },
        { id: "cms", label: "CMS & Ilova Havolalari", icon: "fileText" }
      ]
    },
    {
      title: "TIZIM & XAVFSIZLIK",
      items: [
        { id: "admins", label: "Adminlar & Rollar (RBAC)", icon: "users" },
        { id: "settings", label: "Tizim Sozlamalari", icon: "settings" }
      ]
    }
  ];

  return (
    <aside style={{
      width: '280px',
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
        padding: '20px 22px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(6, 182, 212, 0.4)'
        }}>
          <Icon name="stethoscope" size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: '800', letterSpacing: '-0.03em', color: '#fff' }}>TibCase</span>
            <span className="badge badge-cyan" style={{ padding: '1px 6px', fontSize: '0.65rem' }}>ADMIN</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TibSphere AI Engine</span>
        </div>
      </div>

      {/* Navigation List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 12px'
      }}>
        {menuSections.map((sec, idx) => (
          <div key={idx} style={{ marginBottom: '20px' }}>
            <div style={{
              fontSize: '0.68rem',
              fontWeight: '700',
              color: 'var(--text-muted)',
              padding: '0 12px 8px 12px',
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
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    marginBottom: '3px',
                    transition: 'all 0.18s ease',
                    background: isActive ? 'linear-gradient(90deg, rgba(6, 182, 212, 0.18) 0%, rgba(59, 130, 246, 0.1) 100%)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                    color: isActive ? '#fff' : 'var(--text-secondary)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                      e.currentTarget.style.color = '#fff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon
                      name={item.icon}
                      size={17}
                      color={isActive ? 'var(--accent-cyan)' : 'var(--text-muted)'}
                    />
                    <span style={{ fontSize: '0.84rem', fontWeight: isActive ? '600' : '500' }}>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`badge ${item.badge === 'AI' ? 'badge-purple' : 'badge-emerald'}`} style={{ padding: '2px 6px', fontSize: '0.65rem' }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Language & Profile Footer */}
      <div style={{
        padding: '14px 16px',
        borderTop: '1px solid var(--border-subtle)',
        background: '#0a1020',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Til / Язык:</span>
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-input)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            {['uz', 'ru', 'en'].map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  padding: '2px 7px',
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  borderRadius: '4px',
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '6px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid var(--accent-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon name="shield" size={15} color="var(--accent-blue)" />
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              Super Admin
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
              Online / Active
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
