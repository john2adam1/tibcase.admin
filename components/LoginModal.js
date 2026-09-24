import React, { useState } from 'react';
import { Icon } from './Icons';
import { DataService } from '../lib/api';

export const LoginModal = ({ isOpen, onClose, onSuccess, onShowToast }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await DataService.login(login, password);
      onShowToast("Muvaffaqiyatli tizimga kirildi!", "success");
      onSuccess();
      if (onClose) onClose();
    } catch (err) {
      setError(err.message || "Login yoki parol noto'g'ri.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 10, 20, 0.88)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '28px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px'
          }}>
            <Icon name="stethoscope" size={24} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: '800' }}>TibCase Admin</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Admin hisobi bilan tizimga kiring
          </p>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fb7185',
            fontSize: '0.8rem',
            marginBottom: '16px',
            lineHeight: '1.4'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Admin Login / Email:</label>
            <input
              type="text"
              className="form-input"
              required
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Login"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Parol:</label>
            <input
              type="password"
              className="form-input"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '10px', marginTop: '6px' }}
          >
            {loading ? "Tekshirilmoqda..." : "Kirish"}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ width: '100%', padding: '8px', fontSize: '0.8rem' }}
            >
              Yopish
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
