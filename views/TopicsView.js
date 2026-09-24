import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import { DataService } from '../lib/api';
import { Modal } from '../components/Modal';

export const TopicsView = ({ onShowToast, lang = 'uz' }) => {
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCatFilter, setSelectedCatFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [form, setForm] = useState({
    category_id: '',
    name: { uz: '', ru: '', en: '' },
    order_num: 1
  });

  const loadData = () => {
    setTopics(DataService.getTopics());
    setCategories(DataService.getCategories());
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTopics = selectedCatFilter
    ? topics.filter(t => t.category_id === selectedCatFilter)
    : topics;

  const openCreate = () => {
    setEditingItem(null);
    setForm({
      category_id: categories[0]?.id || '',
      name: { uz: '', ru: '', en: '' },
      order_num: topics.length + 1
    });
    setIsModalOpen(true);
  };

  const openEdit = (top) => {
    setEditingItem(top);
    setForm({
      category_id: top.category_id || '',
      name: top.name || { uz: '', ru: '', en: '' },
      order_num: top.order_num || 1
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    DataService.saveTopic({
      ...editingItem,
      ...form
    });
    setIsModalOpen(false);
    loadData();
    onShowToast("Mavzu muvaffaqiyatli saqlandi!", "success");
  };

  const handleDelete = (id) => {
    if (window.confirm("Rostdan ham ushbu mavzuni o'chirmoqchimisiz?")) {
      DataService.deleteTopic(id);
      loadData();
      onShowToast("Mavzu o'chirildi.", "warning");
    }
  };

  const getCategoryName = (catId) => {
    const c = categories.find(cat => cat.id === catId);
    return c ? (c.name?.[lang] || c.name?.uz) : '—';
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', color: '#fff', fontWeight: '800' }}>Tibbiy Mavzular (Topics)</h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Bo'limlar ostidagi ixtisoslashgan patologiyalar va nozologiyalar
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            className="form-select"
            style={{ width: '220px' }}
            value={selectedCatFilter}
            onChange={(e) => setSelectedCatFilter(e.target.value)}
          >
            <option value="">Barcha Bo'limlar</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name?.[lang] || c.name?.uz}</option>
            ))}
          </select>
          <button onClick={openCreate} className="btn-primary">
            <Icon name="plus" size={16} />
            <span>Yangi Mavzu Qo'shish</span>
          </button>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tartib</th>
              <th>Mavzu Nomi</th>
              <th>Tegishli Bo'lim</th>
              <th style={{ textAlign: 'right' }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {filteredTopics.map(t => (
              <tr key={t.id}>
                <td style={{ width: '60px', fontWeight: '700', color: 'var(--accent-cyan)' }}>
                  #{t.order_num}
                </td>
                <td>
                  <div style={{ fontWeight: '600', color: '#fff' }}>{t.name?.[lang] || t.name?.uz}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    RU: {t.name?.ru || '—'} | EN: {t.name?.en || '—'}
                  </div>
                </td>
                <td>
                  <span className="badge badge-slate">{getCategoryName(t.category_id)}</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '6px' }}>
                    <button onClick={() => openEdit(t)} className="btn-icon" title="Tahrirlash">
                      <Icon name="edit" size={16} />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="btn-icon" style={{ color: 'var(--accent-rose)' }} title="O'chirish">
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Topic CRUD Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Mavzuni Tahrirlash" : "Yangi Mavzu Qo'shish"}
        maxWidth="550px"
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Tegishli Bo'lim (Kategoriya):</label>
            <select
              className="form-select"
              required
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            >
              <option value="">Bo'limni tanlang</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name?.[lang] || c.name?.uz}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Mavzu Nomi (O'zbekcha):</label>
            <input
              className="form-input"
              required
              placeholder="Masalan: O'tkir Koronar Sindrom (OKS)"
              value={form.name.uz}
              onChange={(e) => setForm({ ...form, name: { ...form.name, uz: e.target.value } })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Mavzu Nomi (Русский):</label>
              <input
                className="form-input"
                placeholder="Острый коронарный синдром"
                value={form.name.ru || ''}
                onChange={(e) => setForm({ ...form, name: { ...form.name, ru: e.target.value } })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mavzu Nomi (English):</label>
              <input
                className="form-input"
                placeholder="Acute Coronary Syndrome"
                value={form.name.en || ''}
                onChange={(e) => setForm({ ...form, name: { ...form.name, en: e.target.value } })}
              />
            </div>
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Bekor qilish</button>
            <button type="submit" className="btn-primary">Saqlash</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
