import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import { DataService } from '../lib/api';
import { Modal } from '../components/Modal';

export const TariffsView = ({ onShowToast, lang = 'uz' }) => {
  const [tariffs, setTariffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [form, setForm] = useState({
    type: 'subscription',
    name: { uz: '', ru: '', en: '' },
    price: 0,
    duration: 30,
    is_active: true
  });

  const loadData = () => {
    setLoading(true);
    DataService.getTariffs()
      .then(res => {
        setTariffs(Array.isArray(res) ? res : []);
        setLoading(false);
      })
      .catch(() => {
        setTariffs([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditingItem(null);
    setForm({
      type: 'subscription',
      name: { uz: '', ru: '', en: '' },
      price: 0,
      duration: 30,
      is_active: true
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingItem?.id) {
        await DataService.updateTariff(editingItem.id, form);
        onShowToast("Tarif yangilandi!", "success");
      } else {
        await DataService.createTariff(form);
        onShowToast("Yangi tarif yaratildi!", "success");
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      onShowToast(err.message || "Saqlashda xatolik", "error");
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: '700' }}>Tariflar</h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            GET /web/tariff
          </div>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Icon name="plus" size={16} />
          <span>+ Yangi Tarif</span>
        </button>
      </div>

      <div className="data-table-container">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Yuklanmoqda...
          </div>
        ) : tariffs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Hozircha tariflar mavjud emas.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nomi</th>
                <th>Turi</th>
                <th>Narxi</th>
                <th>Muddati</th>
                <th>Holat</th>
              </tr>
            </thead>
            <tbody>
              {tariffs.map(t => (
                <tr key={t.id}>
                  <td>
                    <div style={{ fontWeight: '600', color: '#fff' }}>
                      {typeof t.name === 'string' ? t.name : (t.name?.[lang] || t.name?.uz || '')}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-slate">{t.type}</span>
                  </td>
                  <td style={{ fontWeight: '700', color: '#fff' }}>
                    {(Number(t.price) || 0).toLocaleString()} UZS
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {t.duration ? `${t.duration} kun` : '—'}
                  </td>
                  <td>
                    <span className={`badge ${t.is_active ? 'badge-emerald' : 'badge-amber'}`}>
                      {t.is_active ? 'Faol' : 'Faol emas'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yangi Tarif Qo'shish" maxWidth="480px">
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
            <label className="form-label">Turi:</label>
            <select
              className="form-select"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="subscription">Obuna (subscription)</option>
              <option value="coin">Tanga (coin)</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Narxi (UZS):</label>
              <input
                type="number"
                className="form-input"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Muddati (Kun):</label>
              <input
                type="number"
                className="form-input"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Bekor qilish</button>
            <button type="submit" className="btn-primary">Saqlash</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
