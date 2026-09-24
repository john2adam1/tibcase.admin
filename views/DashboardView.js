import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import { DataService } from '../lib/api';

export const DashboardView = ({ onNavigate, onShowToast, lang = 'uz' }) => {
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState('month');
  const [recentCases, setRecentCases] = useState([]);

  useEffect(() => {
    DataService.getDashboardStats(period).then(data => setStats(data));
    setRecentCases(DataService.getCases().slice(0, 4));
  }, [period]);

  if (!stats) return <div style={{ padding: '24px', color: 'var(--text-secondary)' }}>Yuklanmoqda...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Banner */}
      <div style={{
        padding: '24px 28px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(59, 130, 246, 0.18) 50%, rgba(139, 92, 246, 0.12) 100%)',
        border: '1px solid rgba(6, 182, 212, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-cyan">TIBCASE v2.4</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bugun: 24-Mart, 2026</span>
          </div>
          <h1 style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '8px' }}>
            Xush kelibsiz, Bosh Administrator! 👋
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: '1.5' }}>
            TibCase platformasida hozirda <strong>{stats.active_users.toLocaleString()}</strong> nafar faol tibbiyot talabalari va shifokorlar AI klinik simulyatsiyalardan foydalanmoqda.
          </p>
        </div>

        {/* Quick Period Selector */}
        <div style={{ zIndex: 2, display: 'flex', gap: '6px', background: 'rgba(10, 16, 32, 0.7)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          {['day', 'week', 'month', 'year'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: '600',
                textTransform: 'capitalize',
                background: period === p ? 'var(--accent-cyan)' : 'transparent',
                color: period === p ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.15s ease'
              }}
            >
              {p === 'day' ? 'Bugun' : p === 'week' ? 'Hafta' : p === 'month' ? 'Oy' : 'Yil'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px'
      }}>
        {/* Active Users */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Faol Foydalanuvchilar</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginTop: '4px' }}>
                {stats.active_users.toLocaleString()}
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="users" size={20} color="var(--accent-blue)" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>
            <span>↑ {stats.users_change_pct}</span>
            <span style={{ color: 'var(--text-muted)' }}>o'tgan davrga nisbatan</span>
          </div>
        </div>

        {/* Clinical Sessions */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>O'tkazilgan Simulyatsiyalar</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginTop: '4px' }}>
                {stats.completed_sessions.toLocaleString()}
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="stethoscope" size={20} color="var(--accent-cyan)" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
            <span>⚡ 94.2% muvaffaqiyatli yakun</span>
          </div>
        </div>

        {/* Total Cases */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Jami Klinik Case'lar</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginTop: '4px' }}>
                {stats.cases_count} ta
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="fileText" size={20} color="var(--accent-emerald)" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span>{stats.categories_count} ta tibbiy yo'nalishda</span>
          </div>
        </div>

        {/* AI Total Cost */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>AI Sarf-Xarajati (Gemini)</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#a78bfa', marginTop: '4px' }}>
                ${stats.ai_total_cost_usd}
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="sparkles" size={20} color="var(--accent-purple)" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Sarf: {stats.ai_tokens_used}</span>
          </div>
        </div>
      </div>

      {/* Analytics Visual Section: Simulated Revenue & Case Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
        {/* Left: Interactive Usage Activity Chart */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: '#fff' }}>Simulyatsiyalar Faollik Grafigi</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Oxirgi 7 kunlik talabalar va shifokorlar o'rtasidagi soatlik faollik</div>
            </div>
            <span className="badge badge-emerald">Real-time</span>
          </div>

          {/* SVG Sparkline / Bar Chart */}
          <div style={{ height: '170px', display: 'flex', alignItems: 'flex-end', gap: '14px', paddingTop: '20px' }}>
            {[
              { day: 'Dush', val: 65, count: '4,210' },
              { day: 'Sesh', val: 78, count: '5,120' },
              { day: 'Chor', val: 88, count: '6,480' },
              { day: 'Pay', val: 95, count: '7,150' },
              { day: 'Jum', val: 82, count: '5,800' },
              { day: 'Shan', val: 70, count: '4,900' },
              { day: 'Yak', val: 90, count: '6,700' }
            ].map(col => (
              <div key={col.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{col.count}</span>
                <div style={{
                  width: '100%',
                  height: `${col.val}%`,
                  background: 'linear-gradient(180deg, #06b6d4 0%, rgba(59, 130, 246, 0.4) 100%)',
                  borderRadius: '6px 6px 2px 2px',
                  boxShadow: '0 0 12px rgba(6, 182, 212, 0.3)',
                  transition: 'height 0.4s ease'
                }}></div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{col.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Revenue & Subscriptions breakdown */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: '#fff' }}>Monetizatsiya va Obunalar</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pro obunalar, coinlar va to'lov turlari</div>
            </div>
            <button onClick={() => onNavigate('orders')} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
              Hammasi →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-input)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }}></div>
                <span style={{ fontSize: '0.85rem', color: '#fff' }}>Oylik va Yillik Pro Obunalar</span>
              </div>
              <strong style={{ fontSize: '0.9rem', color: '#38bdf8' }}>74% (1,240 ta)</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-input)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div>
                <span style={{ fontSize: '0.85rem', color: '#fff' }}>TibCoins Paketlari</span>
              </div>
              <strong style={{ fontSize: '0.9rem', color: '#34d399' }}>26% (480 ta)</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Jami Tushum (Oy bo'yicha):</span>
                <strong style={{ fontSize: '1.15rem', color: '#34d399' }}>{stats.total_revenue_uzs.toLocaleString()} UZS</strong>
              </div>
              <span className="badge badge-emerald">+28% o'sish</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Clinical Cases Section */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff' }}>So'nggi Qo'shilgan Klinik Keyslar</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bemorlar shikoyati, vitals va simulyatsiya tayyorgarligi</div>
          </div>
          <button onClick={() => onNavigate('cases')} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
            Barcha Keyslar ({stats.cases_count})
          </button>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Keys Nomi</th>
                <th>Yo'nalish</th>
                <th>Bemor</th>
                <th>Qiyinlik</th>
                <th>Holat</th>
                <th>Vitals</th>
                <th>Harakat</th>
              </tr>
            </thead>
            <tbody>
              {recentCases.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: '600', color: '#fff' }}>{c.title?.[lang] || c.title?.uz}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.subtitle?.[lang] || c.subtitle?.uz}</div>
                  </td>
                  <td>
                    <span className="badge badge-slate">{c.category_name?.[lang] || c.category_name?.uz || 'Kardiologiya'}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem' }}>{c.patient_age} yosh, {c.patient_gender === 'male' ? 'Erkak' : 'Ayol'}</span>
                  </td>
                  <td>
                    <span className={`badge ${c.difficulty === 'easy' ? 'badge-emerald' : c.difficulty === 'medium' ? 'badge-cyan' : 'badge-rose'}`}>
                      {c.difficulty.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${c.status === 'published' ? 'badge-emerald' : 'badge-amber'}`}>
                      {c.status === 'published' ? 'Nashr qilingan' : 'Qoralama'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                      {c.initial_vitals?.blood_pressure} | {c.initial_vitals?.heart_rate} bpm
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => onNavigate('cases')}
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    >
                      Boshqarish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
