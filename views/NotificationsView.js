import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import { DataService } from '../lib/api';

export const NotificationsView = ({ onShowToast }) => {
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({
    title: '',
    body: '',
    audience: 'all'
  });
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setHistory(DataService.getNotifications());
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (!form.title || !form.body) return;

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      DataService.sendNotification(form);
      setHistory(DataService.getNotifications());
      setForm({ title: '', body: '', audience: 'all' });
      onShowToast("Push bildirishnoma barcha foydalanuvchilarga yuborildi!", "success");
    }, 700);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '1.35rem', color: '#fff', fontWeight: '800' }}>Push Bildirishnomalar Tarqatish</h2>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Foydalanuvchilarning telefonlariga yangi keyslar, musobaqalar va aksiyalar haqida xabar yuborish
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Form */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
            Yangi Xabar Yaratish
          </div>

          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Sarlavha (Title):</label>
              <input
                className="form-input"
                required
                placeholder="Masalan: Yangi EKG keysi chiqdi!"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Xabar Matni (Body):</label>
              <textarea
                className="form-textarea"
                required
                rows={4}
                placeholder="O'tkir koronar sindrom bo'yicha yangi klinik keysni yechib, 250 XP ishlang..."
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Auditoriya:</label>
              <select
                className="form-select"
                value={form.audience}
                onChange={(e) => setForm({ ...form, audience: e.target.value })}
              >
                <option value="all">Barcha foydalanuvchilar (14,800+)</option>
                <option value="doctor">Faqat Shifokorlar (3,200+)</option>
                <option value="student">Tibbiyot Talabalari (11,600+)</option>
                <option value="pro">Faqat Pro Obunachilar</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="btn-primary"
              style={{ width: '100%', padding: '10px' }}
            >
              <Icon name="send" size={16} />
              <span>{isSending ? "Tarqatilmoqda..." : "Push Xabarni Yuborish"}</span>
            </button>
          </form>
        </div>

        {/* History */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
            Yuborilgan Xabarlar Tarixi
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {history.map(item => (
              <div key={item.id} style={{ padding: '14px', background: 'var(--bg-input)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{item.title}</strong>
                  <span className="badge badge-emerald">✓ {item.sent_count} ta yetkazildi</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {item.body}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Yuborilgan vaqt: {new Date(item.sent_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
