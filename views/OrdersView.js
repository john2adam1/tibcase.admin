import React, { useState, useEffect } from 'react';
import { DataService } from '../lib/api';

export const OrdersView = () => {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    const params = {};
    if (filterStatus) params.status = filterStatus;

    DataService.getOrders(params)
      .then(res => {
        setOrders(Array.isArray(res) ? res : []);
        setLoading(false);
      })
      .catch(() => {
        setOrders([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const totalSum = orders
    .filter(o => o.status === 'paid')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: '700' }}>Buyurtmalar va To'lovlar</h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            GET /web/order
          </div>
        </div>

        <select
          className="form-select"
          style={{ width: '180px' }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Barcha Holatlar</option>
          <option value="paid">To'langan (paid)</option>
          <option value="pending">Kutilmoqda (pending)</option>
          <option value="failed">Bekor qilingan (failed)</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
            Muvaffaqiyatli To'lovlar Summasi
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-emerald)', marginTop: '4px' }}>
            {totalSum.toLocaleString()} UZS
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
            Jami Buyurtmalar Soni
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginTop: '4px' }}>
            {orders.length} ta
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="data-table-container">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Yuklanmoqda...
          </div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Hozircha buyurtmalar yoki to'lovlar mavjud emas.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Mijoz</th>
                <th>Telefon</th>
                <th>Tarif / Mahsulot</th>
                <th>Summa</th>
                <th>To'lov Turi</th>
                <th>Holat</th>
                <th>Sana</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '600', color: 'var(--accent-cyan)' }}>
                    {o.id}
                  </td>
                  <td style={{ fontWeight: '600', color: '#fff' }}>
                    {o.user_name || o.user_id}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    {o.user_phone || '—'}
                  </td>
                  <td>
                    <span className="badge badge-slate">{o.tariff_name || o.tariff_id || '—'}</span>
                  </td>
                  <td style={{ fontWeight: '700', color: '#fff' }}>
                    {(Number(o.amount) || 0).toLocaleString()} UZS
                  </td>
                  <td>
                    <span className="badge badge-cyan">{o.payment_type || '—'}</span>
                  </td>
                  <td>
                    <span className={`badge ${o.status === 'paid' ? 'badge-emerald' : 'badge-amber'}`}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {o.created_at ? new Date(o.created_at).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
