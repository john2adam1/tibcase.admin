import React from 'react';
import { Icon } from './Icons';

export const Toast = ({ message, type = 'info', onClose }) => {
  if (!message) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          border: '1px solid rgba(16, 185, 129, 0.4)',
          background: 'rgba(16, 185, 129, 0.15)',
          color: '#34d399',
          icon: 'check'
        };
      case 'error':
        return {
          border: '1px solid rgba(244, 63, 94, 0.4)',
          background: 'rgba(244, 63, 94, 0.15)',
          color: '#fb7185',
          icon: 'x'
        };
      case 'warning':
        return {
          border: '1px solid rgba(245, 158, 11, 0.4)',
          background: 'rgba(245, 158, 11, 0.15)',
          color: '#fbbf24',
          icon: 'info'
        };
      default:
        return {
          border: '1px solid rgba(6, 182, 212, 0.4)',
          background: 'rgba(6, 182, 212, 0.15)',
          color: '#22d3ee',
          icon: 'info'
        };
    }
  };

  const current = getTypeStyles();

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 18px',
      borderRadius: '10px',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
      animation: 'fadeIn 0.2s ease-out forwards',
      maxWidth: '420px',
      ...current
    }}>
      <Icon name={current.icon} size={18} color={current.color} />
      <span style={{ fontSize: '0.85rem', fontWeight: '500', color: '#fff', flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
        <Icon name="x" size={14} />
      </button>
    </div>
  );
};
