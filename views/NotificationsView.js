import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import { DataService } from '../lib/api';

export const NotificationsView = ({ onShowToast }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '',
    body: ''
  });
  const [isSending, setIsSending] = useState(false);

  const loadData = () => {
    setLoading(true);
    DataService.getNotifications()
      .then(res => {
        setHistory(Array.isArray(res) ? res : []);
        setLoading(false);
      })
      .catch(() => {
        setHistory([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.title || !form.body) return;

    setIsSending(true);
    try {
      await DataService.sendNotification(form);
      setForm({ title: '', body: '' });
      onShowToast("Bildirishnoma yuborildi!", "success");
      loadData();
    } catch (err) {
      onShowToast(err.message || "Yuborishda xatolik", "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: '700' }}>Push Bildirishnomalar</h2>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          GET /web/notification
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Form */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', marginBottom: '14px' }}>
            Yangi Bildirishnoma Yuborish
          </div>

          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Sarlavha (Title):</label>
              <input
                className="form-input"
                required
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
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="btn-primary"
              style={{ width: '100%', padding: '10px' }}
            >
              <Icon name="send" size={16} />
              <span>{isSending ? "Yuborilmoqda..." : "Yuborish"}</span>
            </button>
          </form>
        </div>

        {/* History */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', marginBottom: '14px' }}>
            Yuborilgan Xabarlar Tarixi
          </div>

          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Yuklanmoqda...
            </div>
          ) : history.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Hozircha yuborilgan xabarlar mavjud emas.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {history.map((item, idx) => (
                <div key={item.id || idx} style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: '600', color: '#fff', fontSize: '0.88rem', marginBottom: '4px' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {item.body}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
