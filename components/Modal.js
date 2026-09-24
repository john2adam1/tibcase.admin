import React from 'react';
import { Icon } from './Icons';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = '650px' }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 10, 20, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 90,
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 22px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#0e1628'
        }}>
          <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff' }}>{title}</div>
          <button
            onClick={onClose}
            className="btn-icon"
            style={{ borderRadius: '50%', padding: '6px' }}
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '22px', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
};
