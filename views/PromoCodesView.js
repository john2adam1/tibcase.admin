import React, { useState, useEffect, useMemo } from 'react';
import { Icon } from '../components/Icons';
import { DataService, ApiConfig } from '../lib/api';
import { Modal } from '../components/Modal';

export const PromoCodesView = ({ onShowToast }) => {
  const [promos, setPromos] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedPartner, setSelectedPartner] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchCode, setSearchCode] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewPromo, setViewPromo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const currentUser = ApiConfig.getCurrentUser();

  const [form, setForm] = useState({
    partner_id: '',
    value: 50,
    expires_at: '',
    created_by: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedPartner) params.partner_id = selectedPartner;
      if (selectedStatus) params.status = selectedStatus;

      const [promoRes, partnersRes] = await Promise.all([
        DataService.getPromoCodes(params),
        DataService.getPartners().catch(() => [])
      ]);

      const list = Array.isArray(promoRes)
        ? promoRes
        : (promoRes?.promocodes || promoRes?.data || []);
      setPromos(list);

      const pList = Array.isArray(partnersRes)
        ? partnersRes
        : (partnersRes?.partners || partnersRes?.data || []);
      setPartners(pList);
    } catch {
      setPromos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPartner, selectedStatus]);

  const handleOpenCreate = () => {
    setForm({
      partner_id: partners[0]?.id || '',
      value: 50,
      expires_at: '',
      created_by: currentUser?.id || currentUser?.login || ''
    });
    setIsCreateOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.partner_id) {
      onShowToast("Hamkorni tanlang", "error");
      return;
    }
    if (!form.value || Number(form.value) <= 0) {
      onShowToast("Tanga miqdori 0 dan katta bo'lishi kerak", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        partner_id: form.partner_id,
        value: parseInt(form.value, 10),
        expires_at: form.expires_at || undefined,
        created_by: form.created_by || currentUser?.id || undefined
      };

      await DataService.createPromoCode(payload);
      setIsCreateOpen(false);
      onShowToast("Yangi promokod muvaffaqiyatli yaratildi!", "success");
      loadData();
    } catch (err) {
      onShowToast(err.message || "Promokod yaratishda xatolik", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Haqiqatan ham bu promokodni o'chirmoqchimisiz?")) return;
    try {
      await DataService.deletePromoCode(id);
      onShowToast("Promokod o'chirildi", "info");
      loadData();
      if (viewPromo?.id === id) setViewPromo(null);
    } catch (err) {
      onShowToast(err.message || "O'chirishda xatolik", "error");
    }
  };

  const handleCopy = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      onShowToast(`"${code}" nusxalandi!`, "success");
    }).catch(() => {
      onShowToast("Nusxalashda xatolik", "error");
    });
  };

  const handleView = async (promo) => {
    try {
      const res = await DataService.getPromoCodeById(promo.id);
      setViewPromo(res || promo);
    } catch {
      setViewPromo(promo);
    }
  };

  const filteredPromos = useMemo(() => {
    return promos.filter(p => {
      if (searchCode && !p.code?.toLowerCase().includes(searchCode.toLowerCase().trim())) {
        return false;
      }
      return true;
    });
  }, [promos, searchCode]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-emerald">Faol (Active)</span>;
      case 'used':
        return <span className="badge badge-cyan">Ishlatilgan (Used)</span>;
      case 'expired':
        return <span className="badge badge-amber">Muddati o'tgan (Expired)</span>;
      default:
        return <span className="badge badge-gray">{status || '—'}</span>;
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: '700' }}>Promokodlar</h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            GET /web/promocode — Hamkorlar va foydalanuvchilar uchun tanga promokodlari ({filteredPromos.length} ta)
          </div>
        </div>
        <button onClick={handleOpenCreate} className="btn-primary">
          <Icon name="plus" size={16} />
          <span>+ Yangi Promokod</span>
        </button>
      </div>

      {/* Filters */}
      <div className="glass-panel" style={{ padding: '14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {/* Search code */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '34px', fontFamily: 'var(--font-mono)' }}
              placeholder="Kodi bo'yicha qidiruv..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
            />
            <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Icon name="search" size={15} />
            </div>
          </div>

          {/* Partner filter */}
          <div>
            <select
              className="form-select"
              value={selectedPartner}
              onChange={(e) => setSelectedPartner(e.target.value)}
            >
              <option value="">Barcha Hamkorlar</option>
              {partners.map(p => (
                <option key={p.id} value={p.id}>{p.name || p.id}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Barcha Statuslar</option>
              <option value="active">Active (Faol)</option>
              <option value="used">Used (Ishlatilgan)</option>
              <option value="expired">Expired (Muddati o'tgan)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="data-table-container">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Yuklanmoqda...
          </div>
        ) : filteredPromos.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Promokodlar topilmadi.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Promokod</th>
                <th>Hamkor</th>
                <th>Qiymat (Tanga)</th>
                <th>Holat</th>
                <th>Amal qilish muddati</th>
                <th>Berilgan sana</th>
                <th style={{ textAlign: 'right' }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredPromos.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--accent-cyan)', fontSize: '0.9rem' }}>
                        {p.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(p.code)}
                        title="Nusxalash"
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex' }}
                      >
                        <Icon name="copy" size={13} />
                      </button>
                    </div>
                  </td>
                  <td>
                    <span style={{ color: '#fff', fontWeight: '500' }}>
                      {p.partner_name || partners.find(pt => pt.id === p.partner_id)?.name || p.partner_id || '—'}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-amber" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      🪙 {p.value} tanga
                    </span>
                  </td>
                  <td>
                    {getStatusBadge(p.status)}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {p.expires_at ? p.expires_at.split('T')[0] : 'Cheksiz'}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {p.issued_at ? p.issued_at.split('T')[0] : '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        onClick={() => handleView(p)}
                        className="btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        title="Batafsil"
                      >
                        <Icon name="eye" size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="btn-danger"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        title="O'chirish"
                      >
                        <Icon name="trash" size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Yangi Promokod Generatsiya Qilish" maxWidth="480px">
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Hamkor (O'quv markaz / tashkilot) *:</label>
            <select
              className="form-select"
              required
              value={form.partner_id}
              onChange={(e) => setForm({ ...form, partner_id: e.target.value })}
            >
              <option value="">— Hamkorni tanlang —</option>
              {partners.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.id.slice(0, 8)}...)</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tanga Qiymati (Coins) *:</label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                min="1"
                className="form-input"
                required
                value={form.value}
                onChange={(e) => setForm({ ...form, value: parseInt(e.target.value, 10) || 0 })}
              />
              <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                tanga
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Foydalanuvchi ushbu promokodni kiritganda hisobiga shuncha tanga qo'shiladi.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Amal Qilish Muddati (YYYY-MM-DD):</label>
            <input
              type="date"
              className="form-input"
              value={form.expires_at}
              onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Yaratuvchi (Admin ID / Login):</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ixtiyoriy (default: sizning hisobingiz)"
              value={form.created_by}
              onChange={(e) => setForm({ ...form, created_by: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setIsCreateOpen(false)} className="btn-secondary">
              Bekor qilish
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Yaratilmoqda...' : 'Promokod Yaratish'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      <Modal isOpen={!!viewPromo} onClose={() => setViewPromo(null)} title="Promokod Tafsilotlari" maxWidth="520px">
        {viewPromo && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: '10px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>PROMOKOD</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', letterSpacing: '1px' }}>
                {viewPromo.code}
              </div>
              <button
                type="button"
                onClick={() => handleCopy(viewPromo.code)}
                className="btn-secondary"
                style={{ marginTop: '10px', padding: '4px 12px', fontSize: '0.75rem' }}
              >
                <Icon name="copy" size={13} /> Nusxalash
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Hamkor:</div>
                <div style={{ color: '#fff', fontWeight: '600' }}>{viewPromo.partner_name || viewPromo.partner_id || '—'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Qiymat:</div>
                <div style={{ color: '#fbbf24', fontWeight: '700' }}>🪙 {viewPromo.value} tanga</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Holati:</div>
                <div>{getStatusBadge(viewPromo.status)}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Yaratuvchi:</div>
                <div style={{ color: '#fff' }}>{viewPromo.created_by || '—'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Berilgan sana:</div>
                <div style={{ color: '#fff' }}>{viewPromo.issued_at || '—'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Amal qilish muddati:</div>
                <div style={{ color: '#fff' }}>{viewPromo.expires_at || 'Cheksiz'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Ishlatilgan sana:</div>
                <div style={{ color: '#fff' }}>{viewPromo.used_at || '—'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Kim tomonidan:</div>
                <div style={{ color: '#fff' }}>{viewPromo.used_by || '—'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                onClick={() => handleDelete(viewPromo.id)}
                className="btn-danger"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                <Icon name="trash" size={14} /> O'chirish
              </button>
              <button type="button" onClick={() => setViewPromo(null)} className="btn-secondary">
                Yopish
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
