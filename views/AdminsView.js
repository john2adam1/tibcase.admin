import React, { useState } from 'react';
import { Icon } from '../components/Icons';
import { INITIAL_ADMINS } from '../lib/mockData';

export const AdminsView = ({ onShowToast }) => {
  const [admins] = useState(INITIAL_ADMINS);
  const [roles] = useState([
    {
      id: 'role-super',
      name: 'Super Admin',
      description: 'Barcha ruxsatlarga ega: keyslar, tariflar, moliya, adminlar va AI sozlamalari.',
      users_count: 1
    },
    {
      id: 'role-editor',
      name: 'Klinik Muharrir (Medical Doctor Lead)',
      description: 'Klinik keyslar yaratish, tibbiy stsenariylarni tasdiqlash va AI promptlarini sinash.',
      users_count: 2
    },
    {
      id: 'role-support',
      name: 'Qo\'llab-quvvatlash (Support Specialist)',
      description: 'Foydalanuvchilar murojaatlari, to\'lovlar va FAQ bo\'limini boshqarish.',
      users_count: 3
    }
  ]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', color: '#fff', fontWeight: '800' }}>Adminlar & Rollar (RBAC)</h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Admin panel xodimlari, rollar va ruxsatlar matritsasi
          </div>
        </div>
        <button onClick={() => onShowToast("Yangi admin taklif qilish oynasi", "info")} className="btn-primary">
          <Icon name="plus" size={16} />
          <span>+ Yangi Xodim Qo'shish</span>
        </button>
      </div>

      {/* Admin Users Table */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff', marginBottom: '14px' }}>
          Tizim Administratorlari
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Admin E-pochta / Login</th>
                <th>Roli</th>
                <th>Filial / Hamkor OTM</th>
                <th>Ro'yxatdan o'tgan</th>
                <th>Holat</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: '600', color: '#fff' }}>
                    {a.login}
                  </td>
                  <td>
                    <span className="badge badge-cyan">{a.role}</span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {a.partner_name}
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {new Date(a.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <span className="badge badge-emerald">Faol</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC Roles Matrix */}
      <div>
        <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '14px' }}>
          Rollar va Ruxsatlar Tizimi (RBAC)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {roles.map(r => (
            <div key={r.id} className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '1rem', fontWeight: '700', color: '#fff' }}>{r.name}</span>
                <span className="badge badge-slate">{r.users_count} xodim</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {r.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
