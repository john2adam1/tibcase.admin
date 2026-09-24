import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import { DataService } from '../lib/api';
import { Modal } from '../components/Modal';

export const TopicsView = ({ onShowToast, lang = 'uz' }) => {
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCatFilter, setSelectedCatFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [form, setForm] = useState({
    category_id: '',
    name: { uz: '', ru: '', en: '' },
    order_num: 1
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [topsRes, catsRes] = await Promise.all([
        DataService.getTopics(selectedCatFilter),
        DataService.getCategories()
      ]);
      setTopics(Array.isArray(topsRes) ? topsRes : []);
      setCategories(Array.isArray(catsRes) ? catsRes : []);
    } catch {
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCatFilter]);

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

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingItem?.id) {
        await DataService.updateTopic(editingItem.id, form);
        onShowToast("Mavzu yangilandi!", "success");
      } else {
        await DataService.createTopic(form);
        onShowToast("Yangi mavzu yaratildi!", "success");
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      onShowToast(err.message || "Saqlashda xatolik", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Rostdan ham ushbu mavzuni o'chirmoqchimisiz?")) {
      try {
        await DataService.deleteTopic(id);
        onShowToast("Mavzu o'chirildi.", "info");
        loadData();
      } catch (err) {
        onShowToast(err.message || "O'chirishda xatolik", "error");
      }
    }
  };

  const getCategoryName = (catId) => {
    const c = categories.find(cat => cat.id === catId);
    return c ? (c.name?.[lang] || c.name?.uz || c.name) : '—';
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: '700' }}>Tibbiy Mavzular</h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            GET /web/topic
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            className="form-select"
            style={{ width: '200px' }}
            value={selectedCatFilter}
            onChange={(e) => setSelectedCatFilter(e.target.value)}
          >
            <option value="">Barcha Bo'limlar</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name?.[lang] || c.name?.uz || c.name}</option>
            ))}
          </select>
          <button onClick={openCreate} className="btn-primary">
            <Icon name="plus" size={16} />
            <span>+ Yangi Mavzu</span>
          </button>
        </div>
      </div>

      <div className="data-table-container">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Yuklanmoqda...
          </div>
        ) : topics.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Hozircha mavzular mavjud emas.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Tartib</th>
                <th>Nomi</th>
                <th>Bo'lim</th>
                <th style={{ textAlign: 'right' }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {topics.map(t => (
                <tr key={t.id}>
                  <td style={{ width: '60px', fontWeight: '700', color: 'var(--accent-cyan)' }}>
                    #{t.order_num}
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', color: '#fff' }}>
                      {typeof t.name === 'string' ? t.name : (t.name?.[lang] || t.name?.uz || '')}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-slate">{getCategoryName(t.category_id)}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button onClick={() => openEdit(t)} className="btn-icon" title="Tahrirlash">
                        <Icon name="edit" size={15} />
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="btn-icon" style={{ color: 'var(--accent-rose)' }} title="O'chirish">
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Mavzuni Tahrirlash" : "Yangi Mavzu Qo'shish"}
        maxWidth="500px"
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Tegishli Bo'lim:</label>
            <select
              className="form-select"
              required
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            >
              <option value="">Tanlang</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name?.[lang] || c.name?.uz || c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Mavzu Nomi (UZ):</label>
            <input
              className="form-input"
              required
              value={form.name.uz}
              onChange={(e) => setForm({ ...form, name: { ...form.name, uz: e.target.value } })}
            />
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
