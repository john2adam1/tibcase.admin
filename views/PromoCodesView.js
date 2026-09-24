import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import { DataService } from '../lib/api';
import { Modal } from '../components/Modal';

export const PromoCodesView = ({ onShowToast }) => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    code: '',
    discount_amount: 0,
    discount_type: 'percent',
    max_uses: 100,
    expires_at: ''
  });

  const loadData = () => {
    setLoading(true);
    DataService.getPromoCodes()
      .then(res => {
        setPromos(Array.isArray(res) ? res : []);
        setLoading(false);
      })
      .catch(() => {
        setPromos([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await DataService.createPromoCode({
        ...form,
        code: form.code.toUpperCase()
      });
      setIsModalOpen(false);
      onShowToast("Promokod yaratildi!", "success");
      loadData();
    } catch (err) {
      onShowToast(err.message || "Xatolik", "error");
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: '700' }}>Promokodlar</h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            GET /web/promocode
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Icon name="plus" size={16} />
          <span>+ Yangi Promokod</span>
        </button>
      </div>

      <div className="data-table-container">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Yuklanmoqda...
          </div>
        ) : promos.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Hozircha promokodlar mavjud emas.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Promokod</th>
                <th>Chegirma</th>
                <th>Ishlatilgan / Limit</th>
                <th>Amal qilish muddati</th>
                <th>Holat</th>
              </tr>
            </thead>
            <tbody>
              {promos.map(p => (
                <tr key={p.id}>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--accent-cyan)' }}>
                      {p.code}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-emerald">
                      {p.discount_type === 'percent' ? `${p.discount_amount}%` : `${p.discount_amount} UZS`}
                    </span>
                  </td>
                  <td>
                    {p.used_count || 0} / {p.max_uses || 'Cheksiz'}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {p.expires_at || '—'}
                  </td>
                  <td>
                    <span className={`badge ${p.is_active !== false ? 'badge-emerald' : 'badge-amber'}`}>
                      {p.is_active !== false ? 'Faol' : 'Nofaol'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yangi Promokod" maxWidth="450px">
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Kod:</label>
            <input
              className="form-input"
              required
              style={{ textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Chegirma Miqdori:</label>
              <input
                type="number"
                className="form-input"
                required
                value={form.discount_amount}
                onChange={(e) => setForm({ ...form, discount_amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Turi:</label>
              <select
                className="form-select"
                value={form.discount_type}
                onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
              >
                <option value="percent">Foiz (%)</option>
                <option value="fixed">Aniq summa (UZS)</option>
              </select>
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
