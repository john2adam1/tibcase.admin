import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import { DataService, ApiConfig } from '../lib/api';
import { Modal } from '../components/Modal';

export const SettingsView = ({ onShowToast }) => {
  const [activeTab, setActiveTab] = useState('system'); // 'system' | 'security'

  // Difficulty Multipliers
  const [diffReward, setDiffReward] = useState({
    medium_multiplier: 1.5,
    hard_multiplier: 2.0
  });
  const [loadingDiff, setLoadingDiff] = useState(false);
  const [savingDiff, setSavingDiff] = useState(false);

  // Token-to-Coin Rate
  const [coinRate, setCoinRate] = useState(1);
  const [loadingCoinRate, setLoadingCoinRate] = useState(false);
  const [savingCoinRate, setSavingCoinRate] = useState(false);

  // App Settings (Key/Value)
  const [appSettings, setAppSettings] = useState([]);
  const [loadingSettings, setLoadingSettings] = useState(false);

  // Setting Modal
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState('');
  const [settingKey, setSettingKey] = useState('');
  const [settingVal, setSettingVal] = useState('');
  const [savingSetting, setSavingSetting] = useState(false);

  // Security / Password Form
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const currentUser = ApiConfig.getCurrentUser();

  const loadDifficulty = async () => {
    setLoadingDiff(true);
    try {
      const res = await DataService.getDifficultyReward();
      if (res && typeof res === 'object') {
        setDiffReward({
          medium_multiplier: res.medium_multiplier ?? 1.5,
          hard_multiplier: res.hard_multiplier ?? 2.0
        });
      }
    } catch {
      // default kept
    } finally {
      setLoadingDiff(false);
    }
  };

  const loadCoinRate = async () => {
    setLoadingCoinRate(true);
    try {
      const res = await DataService.getCoinRate();
      if (res && res.coins_per_1k_tokens !== undefined) {
        setCoinRate(res.coins_per_1k_tokens);
      }
    } catch {
      // default kept
    } finally {
      setLoadingCoinRate(false);
    }
  };

  const loadAppSettings = async () => {
    setLoadingSettings(true);
    try {
      const res = await DataService.getSettings();
      setAppSettings(Array.isArray(res) ? res : []);
    } catch {
      setAppSettings([]);
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    loadDifficulty();
    loadCoinRate();
    loadAppSettings();
  }, []);

  const handleSaveDifficulty = async (e) => {
    e.preventDefault();
    const medium = parseFloat(diffReward.medium_multiplier);
    const hard = parseFloat(diffReward.hard_multiplier);

    if (isNaN(medium) || isNaN(hard) || medium <= 0 || hard <= 0) {
      onShowToast("Koeffitsientlar 0 dan katta son bo'lishi kerak!", "error");
      return;
    }

    setSavingDiff(true);
    try {
      await DataService.updateDifficultyReward({
        medium_multiplier: medium,
        hard_multiplier: hard
      });
      onShowToast("Qiyinlik koeffitsientlari muvaffaqiyatli saqlandi!", "success");
      loadDifficulty();
    } catch (err) {
      onShowToast(err.message || "Koeffitsientlarni saqlashda xatolik", "error");
    } finally {
      setSavingDiff(false);
    }
  };

  const handleSaveCoinRate = async (e) => {
    e.preventDefault();
    const rate = parseFloat(coinRate);

    if (isNaN(rate) || rate < 0) {
      onShowToast("Tarif 0 yoki undan katta son bo'lishi kerak!", "error");
      return;
    }

    setSavingCoinRate(true);
    try {
      await DataService.updateCoinRate(rate);
      onShowToast("Token-to-coin tarifi muvaffaqiyatli saqlandi!", "success");
      loadCoinRate();
    } catch (err) {
      onShowToast(err.message || "Tarifni saqlashda xatolik", "error");
    } finally {
      setSavingCoinRate(false);
    }
  };

  const handleOpenAddSetting = () => {
    setEditingKey('');
    setSettingKey('daily_free_limit');
    setSettingVal('3');
    setIsSettingModalOpen(true);
  };

  const handleOpenEditSetting = (item) => {
    setEditingKey(item.key);
    setSettingKey(item.key);
    let valStr = item.value;
    if (typeof valStr === 'object' && valStr !== null) {
      valStr = JSON.stringify(valStr, null, 2);
    } else {
      valStr = String(valStr ?? '');
    }
    setSettingVal(valStr);
    setIsSettingModalOpen(true);
  };

  const handleSaveAppSetting = async (e) => {
    e.preventDefault();
    if (!settingKey.trim()) {
      onShowToast("Sozlama kalitini kiriting!", "error");
      return;
    }

    setSavingSetting(true);
    try {
      await DataService.updateSetting(settingKey.trim(), settingVal);
      onShowToast("Tizim sozlamasi saqlandi!", "success");
      setIsSettingModalOpen(false);
      loadAppSettings();
    } catch (err) {
      onShowToast(err.message || "Sozlamani saqlashda xatolik", "error");
    } finally {
      setSavingSetting(false);
    }
  };

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
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Title & Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: '700' }}>Tizim va Xavfsizlik Sozlamalari</h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            GET/PUT /web/setting va /web/setting/difficulty-reward
          </div>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('system')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeTab === 'system' ? 'var(--accent-cyan)' : 'var(--bg-input)',
              color: activeTab === 'system' ? '#fff' : 'var(--text-secondary)',
              border: activeTab === 'system' ? 'none' : '1px solid var(--border-subtle)',
              cursor: 'pointer'
            }}
          >
            <Icon name="settings" size={15} />
            <span>Tizim Sozlamalari</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeTab === 'security' ? 'var(--accent-cyan)' : 'var(--bg-input)',
              color: activeTab === 'security' ? '#fff' : 'var(--text-secondary)',
              border: activeTab === 'security' ? 'none' : '1px solid var(--border-subtle)',
              cursor: 'pointer'
            }}
          >
            <Icon name="shield" size={15} />
            <span>Xavfsizlik & Parol</span>
          </button>
        </div>
      </div>

      {activeTab === 'system' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Card 1: Difficulty Reward Multipliers */}
          <div className="glass-panel" style={{ padding: '20px', maxWidth: '680px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Icon name="activity" size={18} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '1rem', color: '#fff', fontWeight: '700', margin: 0 }}>
                Case Qiyinlik Koeffitsientlari (XP / Coin Mukofoti)
              </h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              /web/setting/difficulty-reward — Mukofot formulasi: <code>level.reward × koeffitsient × (ball / 100)</code>.
              <br />
              <strong>Easy:</strong> 1.0x (o'zgarmas bazaviy koeffitsient).
            </p>

            <form onSubmit={handleSaveDifficulty}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Medium Koeffitsienti *:</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    className="form-input"
                    required
                    value={diffReward.medium_multiplier}
                    onChange={(e) => setDiffReward({ ...diffReward, medium_multiplier: e.target.value })}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Standart: 1.5x
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Hard Koeffitsienti *:</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    className="form-input"
                    required
                    value={diffReward.hard_multiplier}
                    onChange={(e) => setDiffReward({ ...diffReward, hard_multiplier: e.target.value })}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Standart: 2.0x
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingDiff || loadingDiff}
                className="btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                {savingDiff ? "Saqlanmoqda..." : "Koeffitsientlarni Saqlash"}
              </button>
            </form>
          </div>

          {/* Card: Token-to-Coin Tariff */}
          <div className="glass-panel" style={{ padding: '20px', maxWidth: '680px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Icon name="coins" size={18} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '1rem', color: '#fff', fontWeight: '700', margin: 0 }}>
                AI Token-to-Coin Tarifi
              </h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              /web/setting/coin-rate — Har 1 000 token (prompt + completion + debrief) uchun yechiladigan tanga miqdori.
              <br />
              Qiymat = AI tannarxi + platforma xarajati + marja. Kasr sonlar (masalan: 1.5) qabul qilinadi. <code>0</code> = tanga yechilmaydi.
            </p>

            <form onSubmit={handleSaveCoinRate}>
              <div style={{ maxWidth: '320px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Tanga / 1 000 token *:</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="form-input"
                    required
                    value={coinRate}
                    onChange={(e) => setCoinRate(e.target.value)}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Standart: 1.0 (0 bo'lsa tekin)
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingCoinRate || loadingCoinRate}
                className="btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                {savingCoinRate ? "Saqlanmoqda..." : "Tarifni Saqlash"}
              </button>
            </form>
          </div>

          {/* Card 2: App Settings (Key/Value Table) */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon name="sliders" size={17} color="var(--accent-blue)" />
                  <h3 style={{ fontSize: '1rem', color: '#fff', fontWeight: '700', margin: 0 }}>
                    Tizim Global Parametrlari (Key / Value)
                  </h3>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  GET /web/setting — Mobil ilova va backend uchun umumiy parametrlar (masalan: kunlik bepul limit)
                </div>
              </div>

              <button onClick={handleOpenAddSetting} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                <Icon name="plus" size={14} />
                <span>+ Sozlama Qo'shish</span>
              </button>
            </div>

            {loadingSettings ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Yuklanmoqda...
              </div>
            ) : appSettings.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Tizim sozlamalari mavjud emas.
              </div>
            ) : (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '25%' }}>Kalit (Key)</th>
                      <th style={{ width: '45%' }}>Qiymat (Value)</th>
                      <th style={{ width: '20%' }}>Oxirgi yangilanish</th>
                      <th style={{ width: '10%', textAlign: 'right' }}>Amal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appSettings.map((s, idx) => (
                      <tr key={s.key || idx}>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--accent-cyan)' }}>
                            {s.key}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            {typeof s.value === 'object' ? JSON.stringify(s.value) : String(s.value ?? '')}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {s.updated_at ? s.updated_at.replace('T', ' ').slice(0, 19) : '—'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => handleOpenEditSetting(s)}
                            className="btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          >
                            <Icon name="edit" size={13} /> Tahrir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '640px' }}>
          {/* Account Info */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="shield" size={16} color="var(--accent-blue)" />
              <span>Faol Admin Hisobi</span>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>Login: <strong style={{ color: '#fff' }}>{currentUser?.login || 'Admin'}</strong></div>
              <div>Rol: <strong style={{ color: 'var(--accent-cyan)' }}>{currentUser?.role || 'Administrator'}</strong></div>
              {currentUser?.id && <div>ID: <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{currentUser.id}</span></div>}
            </div>
          </div>

          {/* Security & Password */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="key" size={16} color="var(--accent-cyan)" />
              <span>Admin Parolini O'zgartirish (PUT /web/auth/password/change)</span>
            </div>

            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Joriy Parol *:</label>
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
                  <label className="form-label">Yangi Parol *:</label>
                  <input
                    type="password"
                    className="form-input"
                    required
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Yangi Parolni Tasdiqlang *:</label>
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
                style={{ alignSelf: 'flex-start', marginTop: '6px', padding: '8px 18px' }}
              >
                {savingPassword ? "Saqlanmoqda..." : "Parolni Yangilash"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Setting Add/Edit Modal */}
      <Modal
        isOpen={isSettingModalOpen}
        onClose={() => setIsSettingModalOpen(false)}
        title={editingKey ? `Sozlamani Tahrirlash: ${editingKey}` : "Yangi Tizim Sozlamasi"}
        maxWidth="480px"
      >
        <form onSubmit={handleSaveAppSetting} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Kalit (Key) *:</label>
            <input
              type="text"
              className="form-input"
              required
              disabled={!!editingKey}
              placeholder="Masalan: daily_free_limit"
              value={settingKey}
              onChange={(e) => setSettingKey(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Qiymat (Value — JSON string yoki son) *:</label>
            <textarea
              className="form-textarea"
              rows={4}
              required
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
              placeholder="Masalan: 3 yoki {&#34;max_limit&#34;: 5}"
              value={settingVal}
              onChange={(e) => setSettingVal(e.target.value)}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Backend qiymatni JSON string sifatida saqlaydi.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setIsSettingModalOpen(false)} className="btn-secondary">
              Bekor qilish
            </button>
            <button type="submit" disabled={savingSetting} className="btn-primary">
              {savingSetting ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
