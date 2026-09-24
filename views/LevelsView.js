import React from 'react';
import { Icon } from '../components/Icons';
import { INITIAL_LEVELS } from '../lib/mockData';

export const LevelsView = () => {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', color: '#fff', fontWeight: '800' }}>Levellar & XP Reyting Tizimi</h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Talabalar va shifokorlarning klinik tajribasi (Gamification & XP thresholds)
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {INITIAL_LEVELS.map(lvl => (
          <div key={lvl.level} className="glass-panel" style={{ padding: '20px', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(6, 182, 212, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon name="award" size={22} color="var(--accent-cyan)" />
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff' }}>{lvl.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: '600' }}>Daraja: Level {lvl.level}</div>
              </div>
            </div>

            <div style={{ padding: '10px 14px', background: 'var(--bg-input)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Kerakli Tajriba Bali (XP):</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', marginTop: '2px' }}>
                {lvl.min_xp.toLocaleString()} — {lvl.max_xp.toLocaleString()} XP
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
