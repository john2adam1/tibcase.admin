import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import { DataService } from '../lib/api';
import { Modal } from '../components/Modal';

export const BannersView = ({ onShowToast, lang = 'uz' }) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: { uz: '', ru: '', en: '' },
    image_url: '',
    link_url: '',
    is_active: true
  });

  const loadData = () => {
    setLoading(true);
    DataService.getBanners()
      .then(res => {
        setBanners(Array.isArray(res) ? res : []);
        setLoading(false);
      })
      .catch(() => {
        setBanners([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await DataService.createBanner(form);
      setIsModalOpen(false);
      onShowToast("Banner saqlandi!", "success");
      loadData();
    } catch (err) {
      onShowToast(err.message || "Xatolik", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bannerni o'chirmoqchimisiz?")) {
      try {
        await DataService.deleteBanner(id);
        onShowToast("Banner o'chirildi", "info");
        loadData();
      } catch (err) {
        onShowToast(err.message || "Xatolik", "error");
      }
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: '700' }}>Bannerlar</h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            GET /web/banner
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Icon name="plus" size={16} />
          <span>+ Yangi Banner</span>
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Yuklanmoqda...
        </div>
      ) : banners.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Hozircha bannerlar mavjud emas.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {banners.map(b => (
            <div key={b.id} className="glass-panel" style={{ overflow: 'hidden' }}>
              {b.image_url && (
                <div style={{ height: '140px', background: '#0e1628' }}>
                  <img src={b.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '700', color: '#fff' }}>
                    {typeof b.title === 'string' ? b.title : (b.title?.[lang] || b.title?.uz || '')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>{b.link_url}</div>
                </div>
                <button onClick={() => handleDelete(b.id)} className="btn-icon" style={{ color: 'var(--accent-rose)' }}>
                  <Icon name="trash" size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yangi Banner" maxWidth="480px">
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Sarlavha (UZ):</label>
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
            <label className="form-label">Havola (Link URL):</label>
            <input
              className="form-input"
              value={form.link_url}
              onChange={(e) => setForm({ ...form, link_url: e.target.value })}
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
