import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import { DataService } from '../lib/api';
import { Modal } from '../components/Modal';

export const TariffsView = ({ onShowToast, lang = 'uz' }) => {
  const [tariffs, setTariffs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [form, setForm] = useState({
    type: 'subscription',
    name: { uz: '', ru: '', en: '' },
    price_uzs: 50000,
    duration_days: 30,
    daily_ai_limit: 100,
    coins_amount: 100,
    bonus_coins: 10,
    is_active: true
  });

  const loadData = () => {
    setTariffs(DataService.getTariffs());
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = (type = 'subscription') => {
    setEditingItem(null);
    setForm({
      type,
      name: { uz: '', ru: '', en: '' },
      price_uzs: type === 'subscription' ? 79000 : 25000,
      duration_days: 30,
      daily_ai_limit: 100,
      coins_amount: 100,
      bonus_coins: 10,
      is_active: true
    });
    setIsModalOpen(true);
  };

  const openEdit = (tar) => {
    setEditingItem(tar);
    setForm({
      type: tar.type,
      name: tar.name || { uz: '', ru: '', en: '' },
      price_uzs: tar.price_uzs || 0,
      duration_days: tar.duration_days || 30,
      daily_ai_limit: tar.daily_ai_limit || 100,
      coins_amount: tar.coins_amount || 0,
      bonus_coins: tar.bonus_coins || 0,
      is_active: tar.is_active !== false
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    DataService.saveTariff({
      ...editingItem,
      ...form
    });
    setIsModalOpen(false);
    loadData();
    onShowToast("Tarif rejasi muvaffaqiyatli saqlandi!", "success");
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', color: '#fff', fontWeight: '800' }}>Tariflar & Tangalar Paketlari</h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Obunalar, tanga (TibCoins) narxlari va kunlik AI limitlari
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => openCreate('coin_package')} className="btn-secondary">
            <Icon name="coins" size={16} />
            <span>+ Yangi Coin Paketi</span>
          </button>
          <button onClick={() => openCreate('subscription')} className="btn-primary">
            <Icon name="plus" size={16} />
            <span>+ Yangi Pro Obuna</span>
          </button>
        </div>
      </div>

      {/* Subscription Tariffs Grid */}
      <div>
        <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon name="creditCard" size={18} color="var(--accent-cyan)" />
          <span>Obuna Rejalari (Subscriptions)</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {tariffs.filter(t => t.type === 'subscription').map(t => (
            <div key={t.id} className="glass-panel" style={{ padding: '22px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fff' }}>
                    {t.name?.[lang] || t.name?.uz}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Muddati: {t.duration_days} kun</div>
                </div>
                <span className="badge badge-cyan">{t.price_uzs.toLocaleString()} UZS</span>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Kunlik AI Quota:</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--accent-emerald)' }}>
                  {t.daily_ai_limit} ta klinik so'rov / kuniga
                </div>
              </div>

              {t.features && (
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '18px' }}>
                  {t.features.map((f, i) => (
                    <li key={i} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Icon name="check" size={14} color="var(--accent-cyan)" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button onClick={() => openEdit(t)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                  <Icon name="edit" size={14} />
                  <span>Tahrirlash</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coin Packages Grid */}
      <div>
        <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon name="coins" size={18} color="var(--accent-amber)" />
          <span>TibCoins Tangalar Paketlari</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {tariffs.filter(t => t.type === 'coin_package').map(t => (
            <div key={t.id} className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff' }}>
                  {t.name?.[lang] || t.name?.uz}
                </div>
                <span className="badge badge-amber">{t.price_uzs.toLocaleString()} UZS</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '14px 0' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fbbf24' }}>
                  {t.coins_amount}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>TibCoins</div>
                {t.bonus_coins > 0 && (
                  <span className="badge badge-emerald">+{t.bonus_coins} Bonus</span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button onClick={() => openEdit(t)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                  <Icon name="edit" size={14} />
                  <span>Tahrirlash</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Tarifni Tahrirlash" : "Yangi Tarif Qo'shish"}
        maxWidth="500px"
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Tarif Nomi (UZ):</label>
            <input
              className="form-input"
              required
              value={form.name.uz}
              onChange={(e) => setForm({ ...form, name: { ...form.name, uz: e.target.value } })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Narxi (UZS):</label>
            <input
              type="number"
              className="form-input"
              required
              value={form.price_uzs}
              onChange={(e) => setForm({ ...form, price_uzs: parseInt(e.target.value) || 0 })}
            />
          </div>

          {form.type === 'subscription' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Muddat (Kun):</label>
                <input
                  type="number"
                  className="form-input"
                  value={form.duration_days}
                  onChange={(e) => setForm({ ...form, duration_days: parseInt(e.target.value) || 30 })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Kunlik AI Limit:</label>
                <input
                  type="number"
                  className="form-input"
                  value={form.daily_ai_limit}
                  onChange={(e) => setForm({ ...form, daily_ai_limit: parseInt(e.target.value) || 100 })}
                />
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Tangalar Miqdori:</label>
                <input
                  type="number"
                  className="form-input"
                  value={form.coins_amount}
                  onChange={(e) => setForm({ ...form, coins_amount: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Bonus Tangalar:</label>
                <input
                  type="number"
                  className="form-input"
                  value={form.bonus_coins}
                  onChange={(e) => setForm({ ...form, bonus_coins: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Bekor qilish</button>
            <button type="submit" className="btn-primary">Saqlash</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
