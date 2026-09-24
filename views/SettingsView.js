import React, { useState } from 'react';
import { Icon } from '../components/Icons';
import { DataService, ApiConfig } from '../lib/api';

export const SettingsView = ({ onShowToast }) => {
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const currentUser = ApiConfig.getCurrentUser();

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      onShowToast("Yangi parollar mos kelmadi!", "error");
      return;
    }

    setSavingPassword(true);
    try {
      await DataService.changePassword(
        passwordForm.old_password,
        passwordForm.new_password,
        passwordForm.confirm_password
      );
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
      onShowToast("Parol muvaffaqiyatli yangilandi!", "success");
    } catch (err) {
      onShowToast(err.message || "Parolni o'zgartirishda xatolik", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: '700' }}>Xavfsizlik va Hisob Sozlamalari</h2>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Admin hisobi va parolni boshqarish
        </div>
      </div>

      {/* Account Info */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon name="shield" size={16} color="var(--accent-blue)" />
          <span>Faol Admin Hisobi</span>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div>Login: <strong style={{ color: '#fff' }}>{currentUser?.login || 'Admin'}</strong></div>
          <div>Rol: <strong style={{ color: 'var(--accent-cyan)' }}>{currentUser?.role || 'Administrator'}</strong></div>
        </div>
      </div>

      {/* Security & Password */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon name="key" size={16} color="var(--accent-cyan)" />
          <span>Admin Parolini O'zgartirish</span>
        </div>

        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Joriy Parol:</label>
            <input
              type="password"
              className="form-input"
              required
              value={passwordForm.old_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Yangi Parol:</label>
              <input
                type="password"
                className="form-input"
                required
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Yangi Parolni Tasdiqlang:</label>
              <input
                type="password"
                className="form-input"
                required
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className="btn-primary"
            style={{ alignSelf: 'flex-start', marginTop: '4px' }}
          >
            {savingPassword ? "Saqlanmoqda..." : "Parolni Saqlash"}
          </button>
        </form>
      </div>
    </div>
  );
};
