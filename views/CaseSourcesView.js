import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import { DataService } from '../lib/api';
import { Modal } from '../components/Modal';

export const CaseSourcesView = ({ onShowToast }) => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    content: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchName.trim()) params.name = searchName.trim();
      const res = await DataService.getCaseSources(params);
      setSources(Array.isArray(res) ? res : []);
    } catch {
      setSources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadData();
  };

  const openCreate = () => {
    setEditingItem(null);
    setForm({
      name: '',
      content: ''
    });
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name || '',
      content: item.content || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.content.trim()) {
      onShowToast("Nomi va mazmuni kiritilishi shart!", "error");
      return;
    }

    setSaving(true);
    try {
      if (editingItem?.id) {
        await DataService.updateCaseSource(editingItem.id, {
          name: form.name.trim(),
          content: form.content.trim()
        });
        onShowToast("Manba yangilandi!", "success");
      } else {
        await DataService.createCaseSource({
          name: form.name.trim(),
          content: form.content.trim()
        });
        onShowToast("Yangi manba yaratildi!", "success");
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      onShowToast(err.message || "Xatolik yuz berdi", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Haqiqatan ham bu manbani o'chirmoqchimisiz?")) return;
    try {
      await DataService.deleteCaseSource(id);
      onShowToast("Manba o'chirildi.", "info");
      loadData();
    } catch (err) {
      onShowToast(err.message || "O'chirishda xatolik", "error");
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: '700', margin: 0 }}>
            📚 Ishonchli Manbalar (Case Sources)
          </h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            /web/case-source — AI keys generatsiya qilishda tayanadigan klinik protokollar, qo'llanmalar va veb-havolalar
          </div>
        </div>

        <button onClick={openCreate} className="btn-primary">
          <Icon name="plus" size={16} />
          <span>+ Yangi Manba</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <form onSubmit={handleSearch} className="glass-panel" style={{ padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'center', maxWidth: '500px' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Nomi bo'yicha qidiruv (masalan: AHA 2020)..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
          Qidirish
        </button>
        {searchName && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => { setSearchName(''); setTimeout(loadData, 0); }}
          >
            Tozalash
          </button>
        )}
      </form>

      {/* Table */}
      <div className="data-table-container">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Yuklanmoqda...
          </div>
        ) : sources.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Hozircha ishonchli manbalar mavjud emas.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '25%' }}>Manba Nomi</th>
                <th style={{ width: '50%' }}>Mazmuni / Havola</th>
                <th style={{ width: '15%' }}>Yaratilgan</th>
                <th style={{ width: '10%', textAlign: 'right' }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {sources.map(s => {
                const isUrl = s.content && (s.content.startsWith('http://') || s.content.startsWith('https://'));
                return (
                  <tr key={s.id}>
                    <td>
                      <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{s.name}</strong>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ID: {s.id}</div>
                    </td>
                    <td>
                      {isUrl ? (
                        <a
                          href={s.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--accent-cyan)', textDecoration: 'underline', wordBreak: 'break-all', fontSize: '0.85rem' }}
                        >
                          {s.content}
                        </a>
                      ) : (
                        <div style={{
                          fontSize: '0.82rem',
                          color: 'var(--text-secondary)',
                          maxHeight: '60px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {s.content}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {s.created_at ? s.created_at.slice(0, 10) : '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => openEdit(s)}
                          className="btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          title="Tahrirlash"
                        >
                          <Icon name="edit" size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="btn-danger"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          title="O'chirish"
                        >
                          <Icon name="trash" size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal: Create / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Manbani Tahrirlash" : "Yangi Ishonchli Manba"}
        maxWidth="600px"
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Manba Nomi *:</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="Masalan: AHA 2020 Yo'riqnomasi yoki ESC STEMI Guidelines"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Veb-havola yoki Matn Parchasi *:</label>
            <textarea
              className="form-textarea"
              rows={8}
              required
              placeholder="https://... veb-havola yoki protokol matni parchasini kiriting. AI keys yaratishda aynan shu manbaga tayanadi."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Agar veb-havola kiritilsa, AI uning mazmunini o'rganadi; agar matn kiritilsa, matn asosida keys tuziladi.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
              Bekor qilish
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
