import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import { DataService } from '../lib/api';

export const PartnersView = ({ onShowToast }) => {
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    setPartners(DataService.getPartners());
  }, []);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', color: '#fff', fontWeight: '800' }}>Hamkor Tibbiyot OTMlari & Tashkilotlar</h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Universitetlar, klinikalar va hamkorlikdagi daromad taqsimoti (Revenue Share)
          </div>
        </div>
        <button onClick={() => onShowToast("Yangi hamkor shartnomasi qo'shish oynasi", "info")} className="btn-primary">
          <Icon name="plus" size={16} />
          <span>+ Yangi Hamkor Qo'shish</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
        {partners.map(p => (
          <div key={p.id} className="glass-panel" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>{p.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Mas'ul: {p.contact_person}
                </div>
              </div>
              <span className="badge badge-emerald">Faol Hamkor</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '16px 0', padding: '12px', background: 'var(--bg-input)', borderRadius: '10px' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Hamkor Ulushi:</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>{p.revenue_share_percent}%</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Jalb Qilingan Talabalar:</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>{p.referred_users.toLocaleString()}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Jami Ulush Tushumi:</span>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#34d399' }}>
                  {p.total_revenue_uzs.toLocaleString()} UZS
                </div>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.phone}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
