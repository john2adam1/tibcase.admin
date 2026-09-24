import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import { DataService } from '../lib/api';
import { Modal } from '../components/Modal';

export const PartnersView = ({ onShowToast, lang = 'uz' }) => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [form, setForm] = useState({
    name: '',
    description: { uz: '', ru: '', en: '' },
    image_url: '',
    link_url: ''
  });

  const loadData = () => {
    setLoading(true);
    DataService.getPartners()
      .then(res => {
        setPartners(Array.isArray(res) ? res : []);
        setLoading(false);
      })
      .catch(() => {
        setPartners([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditingItem(null);
    setForm({
      name: '',
      description: { uz: '', ru: '', en: '' },
      image_url: '',
      link_url: ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingItem?.id) {
        await DataService.updatePartner(editingItem.id, form);
        onShowToast("Hamkor ma'lumotlari yangilandi!", "success");
      } else {
        await DataService.createPartner(form);
        onShowToast("Yangi hamkor muvaffaqiyatli qo'shildi!", "success");
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      onShowToast(err.message || "Saqlashda xatolik yuz berdi", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Haqiqatan ham bu hamkorni o'chirmoqchimisiz?")) {
      try {
        await DataService.deletePartner(id);
        onShowToast("Hamkor o'chirildi", "info");
        loadData();
      } catch (err) {
        onShowToast(err.message || "O'chirishda xatolik yuz berdi", "error");
      }
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: '700' }}>Hamkorlar</h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            GET /web/partner
          </div>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Icon name="plus" size={16} />
          <span>+ Yangi Hamkor Qo'shish</span>
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Yuklanmoqda...
        </div>
      ) : partners.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Hozircha hamkorlar mavjud emas.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {partners.map(p => (
            <div key={p.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff' }}>{p.name}</div>
                  {p.link_url && (
                    <a
                      href={p.link_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}
                    >
                      <span>{p.link_url}</span>
                      <Icon name="externalLink" size={12} />
                    </a>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => handleDelete(p.id)} className="btn-icon" style={{ color: 'var(--accent-rose)' }} title="O'chirish">
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              </div>

              {p.description && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {typeof p.description === 'string' ? p.description : (p.description[lang] || p.description.uz || '')}
                </div>
              )}

              {p.image_url && (
                <div style={{ width: '100%', height: '100px', borderRadius: '8px', overflow: 'hidden', background: '#0e1628' }}>
                  <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Partner Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Hamkorni Tahrirlash" : "Yangi Hamkor Qo'shish"}
        maxWidth="500px"
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Hamkor Nomi (Name):</label>
            <input
              className="form-input"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Masalan: Toshkent Tibbiyot Akademiyasi"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tavsif (Description UZ):</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={form.description.uz}
              onChange={(e) => setForm({ ...form, description: { ...form.description, uz: e.target.value } })}
              placeholder="Hamkor haqida qisqacha ma'lumot..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Rasm Havolasi (Image URL):</label>
            <input
              className="form-input"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Sayt Havolasi (Link URL):</label>
            <input
              className="form-input"
              value={form.link_url}
              onChange={(e) => setForm({ ...form, link_url: e.target.value })}
              placeholder="https://tma.uz"
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
