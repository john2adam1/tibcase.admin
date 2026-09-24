import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import { DataService } from '../lib/api';

export const OrdersView = ({ onShowToast }) => {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    setOrders(DataService.getOrders());
  }, []);

  const filtered = filterStatus
    ? orders.filter(o => o.status === filterStatus)
    : orders;

  const totalSum = orders.filter(o => o.status === 'paid').reduce((acc, curr) => acc + curr.amount_uzs, 0);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', color: '#fff', fontWeight: '800' }}>To'lovlar & Tranzaksiyalar Monitoringi</h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Payme, Click, Uzum orqali amalga oshirilgan barcha to'lovlar
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            className="form-select"
            style={{ width: '180px' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Barcha Holatlar</option>
            <option value="paid">To'langan (Paid)</option>
            <option value="pending">Kutilmoqda (Pending)</option>
            <option value="failed">Bekor qilingan</option>
          </select>
        </div>
      </div>

      {/* Summary Mini Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Muvaffaqiyatli To'lovlar</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-emerald)', marginTop: '4px' }}>
            {totalSum.toLocaleString()} UZS
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Jami Buyurtmalar Soni</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', marginTop: '4px' }}>
            {orders.length} ta
          </div>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Mijoz (Shifokor/Talaba)</th>
              <th>Telefon</th>
              <th>Sotib Olingan Mahsulot</th>
              <th>Summa</th>
              <th>To'lov Turi</th>
              <th>Holat</th>
              <th>Sana</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '600', color: 'var(--accent-cyan)' }}>
                  {o.id}
                </td>
                <td style={{ fontWeight: '600', color: '#fff' }}>
                  {o.user_name}
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  {o.user_phone}
                </td>
                <td>
                  <span className="badge badge-slate">{o.item_name}</span>
                </td>
                <td style={{ fontWeight: '700', color: '#fff' }}>
                  {o.amount_uzs.toLocaleString()} UZS
                </td>
                <td>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    background: o.payment_method === 'Payme' ? 'rgba(6, 182, 212, 0.15)' : o.payment_method === 'Click' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                    color: o.payment_method === 'Payme' ? '#22d3ee' : o.payment_method === 'Click' ? '#60a5fa' : '#a78bfa'
                  }}>
                    {o.payment_method}
                  </span>
                </td>
                <td>
                  <span className={`badge ${o.status === 'paid' ? 'badge-emerald' : 'badge-amber'}`}>
                    {o.status === 'paid' ? 'Muvaffaqiyatli' : 'Kutilmoqda'}
                  </span>
                </td>
                <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(o.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
