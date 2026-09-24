import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import { DataService } from '../lib/api';
import { Modal } from '../components/Modal';

export const PromoCodesView = ({ onShowToast }) => {
  const [promos, setPromos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [form, setForm] = useState({
    code: '',
    discount_percent: 20,
    max_uses: 200,
    valid_until: '2026-12-31',
    is_active: true
  });

  const loadData = () => {
    setPromos(DataService.getPromoCodes());
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditingItem(null);
    setForm({
      code: '',
      discount_percent: 20,
      max_uses: 200,
      valid_until: '2026-12-31',
      is_active: true
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    DataService.savePromoCode({
      ...editingItem,
      ...form,
      code: form.code.toUpperCase()
    });
    setIsModalOpen(false);
    loadData();
    onShowToast("Promokod saqlandi!", "success");
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', color: '#fff', fontWeight: '800' }}>Promokodlar & Chegirmalar</h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Chegirma kodlarini generatsiya qilish va foydalanish monitoringi
          </div>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Icon name="plus" size={16} />
          <span>Yangi Promokod</span>
        </button>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Promokod</th>
              <th>Chegirma (%)</th>
              <th>Foydalanish / Limit</th>
              <th>Amal qilish muddati</th>
              <th>Holat</th>
              <th style={{ textAlign: 'right' }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {promos.map(p => (
              <tr key={p.id}>
                <td>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.1)', padding: '4px 10px', borderRadius: '6px' }}>
                    {p.code}
                  </span>
                </td>
                <td>
                  <span className="badge badge-emerald">-{p.discount_percent}%</span>
                </td>
                <td>
                  <div style={{ fontSize: '0.85rem', color: '#fff' }}>
                    <strong>{p.used_count}</strong> / {p.max_uses} ta
                  </div>
                  <div style={{ width: '100px', height: '4px', background: 'var(--border-subtle)', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, (p.used_count / p.max_uses) * 100)}%`, height: '100%', background: 'var(--accent-cyan)' }}></div>
                  </div>
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {p.valid_until}
                </td>
                <td>
                  <span className="badge badge-emerald">Faol</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(p.code);
                      onShowToast(`Kopiya qilindi: ${p.code}`, "info");
                    }}
                    className="btn-icon"
                    title="Nusxa olish"
                  >
                    <Icon name="copy" size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yangi Promokod Yaratish" maxWidth="450px">
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Promokod Matni:</label>
            <input
              className="form-input"
              required
              placeholder="Masalan: TIB2026, MEDLIFE"
              style={{ textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Chegirma (%):</label>
              <input
                type="number"
                className="form-input"
                min="1"
                max="100"
                value={form.discount_percent}
                onChange={(e) => setForm({ ...form, discount_percent: parseInt(e.target.value) || 10 })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Maksimal Ishlatish:</label>
              <input
                type="number"
                className="form-input"
                value={form.max_uses}
                onChange={(e) => setForm({ ...form, max_uses: parseInt(e.target.value) || 100 })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Amal qilish muddati:</label>
            <input
              type="date"
              className="form-input"
              value={form.valid_until}
              onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Bekor qilish</button>
            <button type="submit" className="btn-primary">Yaratish</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
