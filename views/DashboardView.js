import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import { DataService } from '../lib/api';

export const DashboardView = ({ onNavigate, onShowToast, lang = 'uz' }) => {
  const [stats, setStats] = useState({
    active_subscriptions: 0,
    active_users: 0,
    ai_total_cost_usd: 0,
    cases: 0,
    categories: 0,
    completed_sessions: 0,
    users: 0
  });
  const [period, setPeriod] = useState('month');
  const [recentCases, setRecentCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      DataService.getDashboardStats(period),
      DataService.getCases({ limit: 5 })
    ])
      .then(([statsData, casesData]) => {
        if (isMounted) {
          setStats(statsData);
          setRecentCases(Array.isArray(casesData) ? casesData : []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [period]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: '700' }}>Dashboard Ko'rsatkichlari</h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            GET /web/dashboard API ma'lumotlari
          </div>
        </div>

        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-input)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          {[
            { id: 'day', label: 'Kun' },
            { id: 'week', label: 'Hafta' },
            { id: 'month', label: 'Oy' },
            { id: 'year', label: 'Yil' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '600',
                background: period === p.id ? 'var(--accent-cyan)' : 'transparent',
                color: period === p.id ? '#fff' : 'var(--text-secondary)'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px'
      }}>
        {/* Total Users */}
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
            Jami Foydalanuvchilar (users)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff', marginTop: '6px' }}>
            {stats.users.toLocaleString()}
          </div>
        </div>

        {/* Active Users */}
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
            Faol Foydalanuvchilar (active_users)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-blue)', marginTop: '6px' }}>
            {stats.active_users.toLocaleString()}
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
            Faol Obunalar (active_subscriptions)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-cyan)', marginTop: '6px' }}>
            {stats.active_subscriptions.toLocaleString()}
          </div>
        </div>

        {/* Completed Sessions */}
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
            O'tkazilgan Simulyatsiyalar (completed_sessions)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-emerald)', marginTop: '6px' }}>
            {stats.completed_sessions.toLocaleString()}
          </div>
        </div>

        {/* Total Cases */}
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
            Klinik Case'lar (cases)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff', marginTop: '6px' }}>
            {stats.cases.toLocaleString()}
          </div>
        </div>

        {/* Categories */}
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
            Bo'limlar (categories)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff', marginTop: '6px' }}>
            {stats.categories.toLocaleString()}
          </div>
        </div>

        {/* AI Total Cost */}
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
            AI Xarajati (ai_total_cost_usd)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-purple)', marginTop: '6px' }}>
            ${stats.ai_total_cost_usd}
          </div>
        </div>
      </div>

      {/* Recent Cases */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>
            Klinik Case'lar
          </div>
          <button onClick={() => onNavigate('cases')} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
            Barcha Keyslar →
          </button>
        </div>

        {recentCases.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Hozircha klinik keyslar mavjud emas.
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nomi</th>
                  <th>Qiyinlik</th>
                  <th>Holat</th>
                  <th>Bemor</th>
                </tr>
              </thead>
              <tbody>
                {recentCases.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: '600', color: '#fff' }}>{c.title?.[lang] || c.title?.uz || c.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.subtitle?.[lang] || c.subtitle?.uz || ''}</div>
                    </td>
                    <td>
                      <span className={`badge ${c.difficulty === 'easy' ? 'badge-emerald' : c.difficulty === 'medium' ? 'badge-cyan' : 'badge-rose'}`}>
                        {c.difficulty || 'medium'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${c.status === 'published' ? 'badge-emerald' : 'badge-amber'}`}>
                        {c.status || 'draft'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {c.patient_age ? `${c.patient_age} yosh` : ''} {c.patient_gender ? (c.patient_gender === 'male' ? 'Erkak' : 'Ayol') : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
