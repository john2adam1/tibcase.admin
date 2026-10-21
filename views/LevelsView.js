import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import { DataService } from '../lib/api';

export const LevelsView = () => {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DataService.getLevels()
      .then(res => {
        setLevels(Array.isArray(res) ? res : []);
        setLoading(false);
      })
      .catch(() => {
        setLevels([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: '700' }}>Levellar (XP)</h2>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          GET /web/level
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Yuklanmoqda...
        </div>
      ) : levels.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Hozircha levellar mavjud emas.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {levels.map((lvl, idx) => (
            <div key={lvl.id || idx} className="glass-panel" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon name="award" size={20} color="var(--accent-cyan)" />
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>
                    {lvl.title?.uz || lvl.title || lvl.slug || `Level ${lvl.level_number || lvl.level}`}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
                    Level {lvl.level_number || lvl.level || idx + 1}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ padding: '6px 10px', background: 'var(--bg-input)', borderRadius: '6px', fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Kerakli XP:</span>
                  <strong style={{ color: '#fff' }}>{lvl.required_xp ?? lvl.min_xp ?? 0} XP</strong>
                </div>

                <div style={{ padding: '6px 10px', background: 'var(--bg-input)', borderRadius: '6px', fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Bazaviy mukofot:</span>
                  <span style={{ display: 'flex', gap: '8px' }}>
                    <strong style={{ color: '#38bdf8' }}>+{lvl.xp_reward ?? 0} XP</strong>
                    <strong style={{ color: '#fbbf24' }}>🪙 +{lvl.coin_reward ?? 0}</strong>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
