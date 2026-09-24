import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import { DataService } from '../lib/api';
import { Modal } from '../components/Modal';

export const CategoriesView = ({ onShowToast, lang = 'uz' }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [form, setForm] = useState({
    name: { uz: '', ru: '', en: '' },
    icon_url: 'heartPulse',
    audience: 'all',
    order_num: 1
  });

  const loadData = () => {
    setLoading(true);
    DataService.getCategories()
      .then(res => {
        setCategories(Array.isArray(res) ? res : []);
        setLoading(false);
      })
      .catch(() => {
        setCategories([]);
        setLoading(false);
      });
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

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingItem?.id) {
        await DataService.updateCategory(editingItem.id, form);
        onShowToast("Bo'lim yangilandi!", "success");
      } else {
        await DataService.createCategory(form);
        onShowToast("Yangi bo'lim yaratildi!", "success");
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      onShowToast(err.message || "Saqlashda xatolik", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Rostdan ham ushbu kategoriyani o'chirmoqchimisiz?")) {
      try {
        await DataService.deleteCategory(id);
        onShowToast("Bo'lim o'chirildi.", "info");
        loadData();
      } catch (err) {
        onShowToast(err.message || "O'chirishda xatolik", "error");
      }
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: '700' }}>Tibbiy Bo'limlar</h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            GET /web/category
          </div>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Icon name="plus" size={16} />
          <span>+ Yangi Bo'lim</span>
        </button>
      </div>

      <div className="data-table-container">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Yuklanmoqda...
          </div>
        ) : categories.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Hozircha bo'limlar mavjud emas.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Tartib</th>
                <th>Nomi</th>
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
                  <td>
                    <div style={{ fontWeight: '600', color: '#fff' }}>
                      {typeof c.name === 'string' ? c.name : (c.name?.[lang] || c.name?.uz || '')}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-slate">
                      {c.audience || 'all'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button onClick={() => openEdit(c)} className="btn-icon" title="Tahrirlash">
                        <Icon name="edit" size={15} />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="btn-icon" style={{ color: 'var(--accent-rose)' }} title="O'chirish">
                        <Icon name="trash" size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Bo'limni Tahrirlash" : "Yangi Bo'lim Qo'shish"}
        maxWidth="500px"
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Bo'lim Nomi (UZ):</label>
            <input
              className="form-input"
              required
              value={form.name.uz}
              onChange={(e) => setForm({ ...form, name: { ...form.name, uz: e.target.value } })}
              placeholder="Masalan: Kardiologiya"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Bo'lim Nomi (RU):</label>
              <input
                className="form-input"
                value={form.name.ru || ''}
                onChange={(e) => setForm({ ...form, name: { ...form.name, ru: e.target.value } })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Bo'lim Nomi (EN):</label>
              <input
                className="form-input"
                value={form.name.en || ''}
                onChange={(e) => setForm({ ...form, name: { ...form.name, en: e.target.value } })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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
