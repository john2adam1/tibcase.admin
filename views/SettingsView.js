import React, { useState } from 'react';
import { Icon } from '../components/Icons';
import { ApiConfig, DataService } from '../lib/api';

export const SettingsView = ({ onShowToast, isLiveApi, setIsLiveApi }) => {
  const [baseUrl, setBaseUrl] = useState(ApiConfig.getBaseUrl());
  const [dailyFreeLimit, setDailyFreeLimit] = useState(3);
  const [voiceActor, setVoiceActor] = useState('uz-female-doctor');

  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  const handleSaveApi = () => {
    ApiConfig.setBaseUrl(baseUrl);
    onShowToast("API Base URL saqlandi!", "success");
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      onShowToast("Yangi parollar mos kelmadi!", "error");
      return;
    }
    setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
    onShowToast("Parol muvaffaqiyatli yangilandi!", "success");
  };

  const handleResetData = () => {
    if (window.confirm("Barcha namunaviy ma'lumotlarni boshlang'ich holatga qaytarmoqchimisiz?")) {
      DataService.resetDemoData();
      onShowToast("Namunaviy ma'lumotlar tiklandi!", "info");
      setTimeout(() => window.location.reload(), 600);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      <div>
        <h2 style={{ fontSize: '1.35rem', color: '#fff', fontWeight: '800' }}>Tizim Sozlamalari & API Konfiguratsiya</h2>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Backend server ulanishi, sun'iy intellekt kvotalari va xavfsizlik
        </div>
      </div>

      {/* Backend API Configuration */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon name="settings" size={18} color="var(--accent-cyan)" />
          <span>Backend API Serveri</span>
        </div>

        <div className="form-group">
          <label className="form-label">API Base URL (Swagger bo'yicha):</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              className="form-input"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.tibsphereai.uz"
            />
            <button onClick={handleSaveApi} className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
              Saqlash
            </button>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Barcha <code>/web/...</code> so'rovlari shu manzilga yo'naltiriladi.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: 'var(--bg-input)', borderRadius: '10px', marginTop: '14px' }}>
          <div>
            <div style={{ fontWeight: '600', color: '#fff', fontSize: '0.88rem' }}>Jonli Backend So'rovlari (Live API)</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              O'chirilganda, ilova brauzer xotirasidagi to'liq interaktiv mock ma'lumotlar bilan ishlaydi.
            </div>
          </div>
          <button
            onClick={() => {
              const next = !isLiveApi;
              setIsLiveApi(next);
              ApiConfig.setLiveApi(next);
              onShowToast(`Rejim: ${next ? 'Live Backend API' : 'Mahalliy Baza'}`, "info");
            }}
            className={`badge ${isLiveApi ? 'badge-emerald' : 'badge-cyan'}`}
            style={{ padding: '6px 14px', fontSize: '0.8rem', cursor: 'pointer', border: 'none' }}
          >
            {isLiveApi ? '● Yoqilgan (Live)' : '○ O\'chirilgan (Mock)'}
          </button>
        </div>
      </div>

      {/* Voice & App Defaults */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff', marginBottom: '14px' }}>
          Simulyatsiya va Ovoz Sozlamalari (TTS)
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Kunlik Bepul Keyslar Limiti:</label>
            <input
              type="number"
              className="form-input"
              value={dailyFreeLimit}
              onChange={(e) => setDailyFreeLimit(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Virtual Bemor Ovozi (TTS Voice):</label>
            <select
              className="form-select"
              value={voiceActor}
              onChange={(e) => setVoiceActor(e.target.value)}
            >
              <option value="uz-female-doctor">O'zbekcha (Ayol shifokor)</option>
              <option value="uz-male-patient">O'zbekcha (Erkak bemor)</option>
              <option value="ru-female-neutral">Ruscha (Neytral)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security & Password */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff', marginBottom: '14px' }}>
          Admin Parolini Yangilash
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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

          <button type="submit" className="btn-secondary" style={{ alignSelf: 'flex-start' }}>
            <Icon name="key" size={15} />
            <span>Parolni Saqlash</span>
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid rgba(244, 63, 94, 0.3)', background: 'rgba(244, 63, 94, 0.05)' }}>
        <div style={{ fontWeight: '700', color: '#fb7185', fontSize: '0.95rem', marginBottom: '6px' }}>
          Xavfli Hudud: Namuna Ma'lumotlarni Qaytarish
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
          Agar barcha keyslar, kategoriyalar va parametrlarni asl demo holatiga qaytarmoqchi bo'lsangiz, quyidagi tugmani bosing.
        </div>
        <button onClick={handleResetData} className="btn-danger">
          Boshlang'ich Ma'lumotlarni Qayta Yuklash
        </button>
      </div>
    </div>
  );
};
