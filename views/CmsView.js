import React, { useState } from 'react';
import { Icon } from '../components/Icons';

export const CmsView = ({ onShowToast, lang = 'uz' }) => {
  const [activeSubTab, setActiveSubTab] = useState('about');

  const [aboutText, setAboutText] = useState({
    uz: "TibCase — bu O'zbekiston tibbiyot talabalari, klinik ordinatorlar va amaliyotchi shifokorlar uchun sun'iy intellekt (TibSphere AI) yordamida yaratilgan interaktiv klinik simulyatsiya platformasi. Platforma klinik fikrlashni rivojlantirish va amaliy tajriba orttirishga xizmat qiladi.",
    ru: "TibCase — интерактивная платформа клинических симуляций на базе искусственного интеллекта TibSphere AI.",
    en: "TibCase is an advanced medical clinical case simulation platform powered by TibSphere AI."
  });

  const [faqs, setFaqs] = useState([
    { id: 1, q: "TibCoins nima va ularni qanday to'plash mumkin?", a: "TibCoins — bu platforma ichki tangalari. Har bir to'g'ri yechilgan klinik keys va test uchun XP hamda TibCoins beriladi." },
    { id: 2, q: "AI ekspert baholash qanchalik aniq?", a: "TibCase AI O'zbekiston Sog'liqni Saqlash Vazirligi klinik protokollari va xalqaro AHA, ESC, WHO standartlari asosida o'qitilgan." }
  ]);

  const [appRoutes, setAppRoutes] = useState([
    { route: "app://case/{id}", description: "Muayyan klinik keysni simulyatorda ochish", screen: "CaseDetailScreen" },
    { route: "app://tariffs", description: "Pro obuna va TibCoins sotib olish ekrani", screen: "SubscriptionScreen" },
    { route: "app://profile/certificates", description: "Foydalanuvchi sertifikatlari", screen: "CertificateScreen" }
  ]);

  const handleSaveAbout = () => {
    onShowToast("'Biz haqimizda' ma'lumotlari saqlandi!", "success");
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '1.35rem', color: '#fff', fontWeight: '800' }}>CMS Kontent & Ilova Havolalari</h2>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Statik sahifalar, foydalanuvchi qo'llanmalari va mobil ilova ichki marshrutlari
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
        {[
          { id: 'about', label: 'Biz haqimizda', icon: 'info' },
          { id: 'faq', label: 'FAQ (Ko\'p beriladigan savollar)', icon: 'helpCircle' },
          { id: 'routes', label: 'App Deep Links (Marshrutlar)', icon: 'route' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveSubTab(t.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeSubTab === t.id ? 'var(--accent-cyan)' : 'var(--bg-input)',
              color: activeSubTab === t.id ? '#fff' : 'var(--text-secondary)'
            }}
          >
            <Icon name={t.icon} size={16} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {activeSubTab === 'about' && (
        <div className="glass-panel" style={{ padding: '22px', maxWidth: '800px' }}>
          <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff', marginBottom: '14px' }}>
            "Biz haqimizda" Sahifasi Matni
          </div>

          <div className="form-group">
            <label className="form-label">Tavsif (O'zbekcha):</label>
            <textarea
              className="form-textarea"
              rows={4}
              value={aboutText.uz}
              onChange={(e) => setAboutText({ ...aboutText, uz: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tavsif (Русский):</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={aboutText.ru}
              onChange={(e) => setAboutText({ ...aboutText, ru: e.target.value })}
            />
          </div>

          <button onClick={handleSaveAbout} className="btn-primary" style={{ marginTop: '10px' }}>
            <Icon name="check" size={16} />
            <span>O'zgarishlarni Saqlash</span>
          </button>
        </div>
      )}

      {activeSubTab === 'faq' && (
        <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff' }}>Ko'p Beriladigan Savollar ({faqs.length})</div>
            <button onClick={() => onShowToast("Yangi FAQ savol qo'shish", "info")} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              + Savol Qo'shish
            </button>
          </div>

          {faqs.map(f => (
            <div key={f.id} style={{ padding: '14px', background: 'var(--bg-input)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.9rem', marginBottom: '6px' }}>{f.q}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{f.a}</div>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'routes' && (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ilova Ichki Havolasi (Deep Link)</th>
                <th>Vazifasi</th>
                <th>Mobil Ekran (Screen)</th>
              </tr>
            </thead>
            <tbody>
              {appRoutes.map((r, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: '600' }}>
                    {r.route}
                  </td>
                  <td style={{ color: '#fff' }}>{r.description}</td>
                  <td>
                    <span className="badge badge-slate">{r.screen}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
