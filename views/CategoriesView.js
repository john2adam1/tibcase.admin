import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import { DataService } from '../lib/api';
import { Modal } from '../components/Modal';

export const CategoriesView = ({ onShowToast, lang = 'uz' }) => {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [form, setForm] = useState({
    name: { uz: '', ru: '', en: '' },
    icon_url: 'heartPulse',
    audience: 'all',
    order_num: 1
  });

  const loadData = () => {
    setCategories(DataService.getCategories());
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditingItem(null);
    setForm({
      name: { uz: '', ru: '', en: '' },
      icon_url: 'heartPulse',
      audience: 'all',
      order_num: categories.length + 1
    });
    setIsModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditingItem(cat);
    setForm({
      name: cat.name || { uz: '', ru: '', en: '' },
      icon_url: cat.icon_url || 'heartPulse',
      audience: cat.audience || 'all',
      order_num: cat.order_num || 1
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    DataService.saveCategory({
      ...editingItem,
      ...form
    });
    setIsModalOpen(false);
    loadData();
    onShowToast("Bo'lim muvaffaqiyatli saqlandi!", "success");
  };

  const handleDelete = (id) => {
    if (window.confirm("Rostdan ham ushbu kategoriyani o'chirmoqchimisiz?")) {
      DataService.deleteCategory(id);
      loadData();
      onShowToast("Bo'lim o'chirildi.", "warning");
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', color: '#fff', fontWeight: '800' }}>Tibbiy Bo'limlar (Kategoriyalar)</h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Kardiologiya, Terapiya, Nevrologiya va boshqa mutaxassisliklar katalogi
          </div>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Icon name="plus" size={16} />
          <span>Yangi Bo'lim Qo'shish</span>
        </button>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tartib</th>
              <th>Belgi</th>
              <th>Bo'lim Nomi (UZ / RU / EN)</th>
              <th>Auditoriya</th>
              <th>Yaratilgan Sana</th>
              <th style={{ textAlign: 'right' }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id}>
                <td style={{ width: '60px', fontWeight: '700', color: 'var(--accent-cyan)' }}>
                  #{c.order_num}
                </td>
                <td style={{ width: '60px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={c.icon_url || 'folders'} size={18} color="var(--accent-cyan)" />
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: '600', color: '#fff' }}>{c.name?.[lang] || c.name?.uz}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    RU: {c.name?.ru || '—'} | EN: {c.name?.en || '—'}
                  </div>
                </td>
                <td>
                  <span className={`badge ${c.audience === 'all' ? 'badge-cyan' : c.audience === 'doctor' ? 'badge-emerald' : 'badge-purple'}`}>
                    {c.audience === 'all' ? 'Barchaga ochiq' : c.audience === 'doctor' ? 'Faqat Shifokorlar' : 'Talabalar'}
                  </span>
                </td>
                <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '6px' }}>
                    <button onClick={() => openEdit(c)} className="btn-icon" title="Tahrirlash">
                      <Icon name="edit" size={16} />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="btn-icon" style={{ color: 'var(--accent-rose)' }} title="O'chirish">
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Category CRUD Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Bo'limni Tahrirlash" : "Yangi Bo'lim Qo'shish"}
        maxWidth="550px"
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Bo'lim Nomi (O'zbekcha):</label>
            <input
              className="form-input"
              required
              placeholder="Masalan: Kardiologiya"
              value={form.name.uz}
              onChange={(e) => setForm({ ...form, name: { ...form.name, uz: e.target.value } })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Bo'lim Nomi (Русский):</label>
              <input
                className="form-input"
                placeholder="Кардиология"
                value={form.name.ru || ''}
                onChange={(e) => setForm({ ...form, name: { ...form.name, ru: e.target.value } })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Bo'lim Nomi (English):</label>
              <input
                className="form-input"
                placeholder="Cardiology"
                value={form.name.en || ''}
                onChange={(e) => setForm({ ...form, name: { ...form.name, en: e.target.value } })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Belgi (Icon):</label>
              <select
                className="form-select"
                value={form.icon_url}
                onChange={(e) => setForm({ ...form, icon_url: e.target.value })}
              >
                <option value="heartPulse">Yurak (Cardio)</option>
                <option value="brain">Miya (Neuro)</option>
                <option value="activity">Puls / Faollik</option>
                <option value="stethoscope">Stetoskop</option>
                <option value="shield">Xirurgiya / Qalqon</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Auditoriya:</label>
              <select
                className="form-select"
                value={form.audience}
                onChange={(e) => setForm({ ...form, audience: e.target.value })}
              >
                <option value="all">Barchaga</option>
                <option value="student">Talabalar</option>
                <option value="doctor">Shifokorlar</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tartib raqami:</label>
              <input
                type="number"
                className="form-input"
                value={form.order_num}
                onChange={(e) => setForm({ ...form, order_num: parseInt(e.target.value) || 1 })}
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
