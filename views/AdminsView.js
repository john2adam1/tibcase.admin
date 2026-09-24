import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import { DataService } from '../lib/api';
import { Modal } from '../components/Modal';

export const AdminsView = ({ onShowToast }) => {
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    login: '',
    password: '',
    role_id: '',
    partner_id: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [adminsRes, rolesRes] = await Promise.all([
        DataService.getAdmins(),
        DataService.getRoles()
      ]);
      setAdmins(Array.isArray(adminsRes) ? adminsRes : []);
      setRoles(Array.isArray(rolesRes) ? rolesRes : []);
    } catch {
      setAdmins([]);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await DataService.createAdmin(form);
      setIsModalOpen(false);
      onShowToast("Admin muvaffaqiyatli qo'shildi!", "success");
      loadData();
    } catch (err) {
      onShowToast(err.message || "Xatolik", "error");
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: '700' }}>Adminlar & Rollar</h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            GET /web/admin & GET /web/role
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Icon name="plus" size={16} />
          <span>+ Yangi Admin</span>
        </button>
      </div>

      <div className="data-table-container">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Yuklanmoqda...
          </div>
        ) : admins.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Hozircha adminlar ro'yxati mavjud emas.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Login</th>
                <th>Roli</th>
                <th>Hamkor</th>
                <th>Sana</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: '600', color: '#fff' }}>
                    {a.login}
                  </td>
                  <td>
                    <span className="badge badge-cyan">{a.role_name || a.role_id || '—'}</span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {a.partner_name || a.partner_id || '—'}
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {a.created_at ? new Date(a.created_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yangi Admin Qo'shish" maxWidth="450px">
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Login / Email:</label>
            <input
              type="text"
              className="form-input"
              required
              value={form.login}
              onChange={(e) => setForm({ ...form, login: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Parol:</label>
            <input
              type="password"
              className="form-input"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Rol:</label>
            <select
              className="form-select"
              required
              value={form.role_id}
              onChange={(e) => setForm({ ...form, role_id: e.target.value })}
            >
              <option value="">Rolni tanlang</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name || r.id}</option>
              ))}
            </select>
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
