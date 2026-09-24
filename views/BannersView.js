import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import { DataService } from '../lib/api';
import { Modal } from '../components/Modal';

export const BannersView = ({ onShowToast, lang = 'uz' }) => {
  const [banners, setBanners] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [form, setForm] = useState({
    title: { uz: '', ru: '', en: '' },
    image_url: '',
    action_route: 'app://cases',
    order_num: 1,
    is_active: true
  });

  const loadData = () => {
    setBanners(DataService.getBanners());
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditingItem(null);
    setForm({
      title: { uz: '', ru: '', en: '' },
      image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1000&auto=format&fit=crop&q=80',
      action_route: 'app://cases',
      order_num: banners.length + 1,
      is_active: true
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    DataService.saveBanner({
      ...editingItem,
      ...form
    });
    setIsModalOpen(false);
    loadData();
    onShowToast("Banner saqlandi!", "success");
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', color: '#fff', fontWeight: '800' }}>Bannerlar & Slaydlar</h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Ilovaning bosh sahifasidagi reklama va yangiliklar karuseli
          </div>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Icon name="plus" size={16} />
          <span>Yangi Banner</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '18px' }}>
        {banners.map(b => (
          <div key={b.id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '140px', background: '#0a1020', position: 'relative' }}>
              <img
                src={b.image_url}
                alt="Banner"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span className="badge badge-cyan" style={{ position: 'absolute', top: '10px', left: '10px' }}>
                Tartib #{b.order_num}
              </span>
            </div>

            <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.95rem', marginBottom: '6px' }}>
                  {b.title?.[lang] || b.title?.uz}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                  {b.action_route}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  onClick={() => {
                    setEditingItem(b);
                    setForm(b);
                    setIsModalOpen(true);
                  }}
                  className="btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                >
                  <Icon name="edit" size={14} />
                  <span>Tahrirlash</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Banner Qo'shish / Tahrirlash" maxWidth="520px">
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Banner Sarlavhasi (UZ):</label>
            <input
              className="form-input"
              required
              value={form.title.uz}
              onChange={(e) => setForm({ ...form, title: { ...form.title, uz: e.target.value } })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Rasm Havolasi (Image URL):</label>
            <input
              className="form-input"
              required
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Bosilganda ochiladigan havola (Route):</label>
            <input
              className="form-input"
              value={form.action_route}
              onChange={(e) => setForm({ ...form, action_route: e.target.value })}
              placeholder="app://case/case-stemi-01 yoki app://tariffs"
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
