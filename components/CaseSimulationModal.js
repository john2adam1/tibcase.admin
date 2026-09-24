import React, { useState } from 'react';
import { Icon } from './Icons';
import { Modal } from './Modal';

export const CaseSimulationModal = ({ isOpen, onClose, caseData, lang = 'uz' }) => {
  const [activeSimTab, setActiveSimTab] = useState('overview');
  const [userDiagnosis, setUserDiagnosis] = useState('');
  const [userTreatment, setUserTreatment] = useState('');
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  if (!caseData) return null;

  const vitals = caseData.initial_vitals || {
    blood_pressure: "120/80 mmHg",
    heart_rate: 75,
    temperature: 36.6,
    spo2: 98,
    respiratory_rate: 16
  };

  const handleRunEvaluation = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      setEvaluationResult({
        score: 92,
        xp: 180,
        verdict: "A'lo darajadagi klinik yondashuv!",
        feedback: "Tashxis to'g'ri qo'yildi va shoshilinch yordam protokoli (AHA/ESC) talablariga to'liq javob beradi. Bemor holati barqarorlashtirildi.",
        differential_analysis: "Differentsial tashxislash to'g'ri o'tkazilgan."
      });
    }, 900);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Simulyatsiya Sinovi: ${caseData.title?.[lang] || caseData.title?.uz || 'Klinik Keys'}`} maxWidth="880px">
      {/* Vitals Monitor Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '12px',
        marginBottom: '20px',
        padding: '14px',
        background: '#070d19',
        borderRadius: '12px',
        border: '1px solid #1e3a5f'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Qon Bosimi (BP)</div>
          <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{vitals.blood_pressure}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Puls (HR)</div>
          <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#f43f5e', fontFamily: 'var(--font-mono)' }}>{vitals.heart_rate} bpm</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Saturatsiya (SpO2)</div>
          <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#10b981', fontFamily: 'var(--font-mono)' }}>{vitals.spo2}%</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Harorat (Temp)</div>
          <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>{vitals.temperature} °C</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Nafas Soni (RR)</div>
          <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#a855f7', fontFamily: 'var(--font-mono)' }}>{vitals.respiratory_rate} /min</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '18px', paddingBottom: '8px' }}>
        {[
          { id: 'overview', label: 'Bemor Anamnezi', icon: 'fileText' },
          { id: 'diagnostics', label: 'Tahlillar & EKG', icon: 'activity' },
          { id: 'ai_solve', label: 'Shifokor Javobi & AI Tekshiruv', icon: 'sparkles' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveSimTab(t.id)}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeSimTab === t.id ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
              color: activeSimTab === t.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              border: activeSimTab === t.id ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent'
            }}
          >
            <Icon name={t.icon} size={15} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeSimTab === 'overview' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ padding: '14px', background: 'var(--bg-input)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-cyan)', marginBottom: '4px', textTransform: 'uppercase' }}>
              Asosiy Shikoyat
            </div>
            <div style={{ fontSize: '0.9rem', color: '#fff', lineHeight: '1.5' }}>
              {caseData.chief_complaint?.[lang] || caseData.chief_complaint?.uz || 'Shikoyat kiritilmagan'}
            </div>
          </div>

          <div style={{ padding: '14px', background: 'var(--bg-input)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
              Kasallik Anamnezi & Tarixi
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {caseData.scenario?.patient_history || "Bemor holati to'g'risida batafsil ma'lumot stsenariyda ko'rsatilgan."}
            </div>
          </div>

          <div style={{ padding: '14px', background: 'var(--bg-input)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
              Fizikal Ko'rik Natijalari
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {caseData.scenario?.physical_exam || "Auskultatsiya, palpatsiya va perkussiya belgilari."}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Diagnostics */}
      {activeSimTab === 'diagnostics' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {caseData.scenario?.ecg_findings && (
            <div style={{ padding: '14px', background: '#0a1628', borderRadius: '10px', border: '1px solid #1e3a8a' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#60a5fa', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon name="heartPulse" size={16} />
                <span>EKG / Instrumental Tekshiruv Natijasi</span>
              </div>
              <div style={{ fontSize: '0.88rem', color: '#e2e8f0', lineHeight: '1.5' }}>
                {caseData.scenario.ecg_findings}
              </div>
            </div>
          )}

          {caseData.scenario?.lab_tests && (
            <div style={{ padding: '14px', background: 'var(--bg-input)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#34d399', marginBottom: '8px' }}>
                Laborator Tahlillar (Biokimyo & Qon)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                {Object.entries(caseData.scenario.lab_tests).map(([key, val]) => (
                  <div key={key} style={{ padding: '8px 10px', background: '#111e38', borderRadius: '6px', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.7rem', display: 'block' }}>{key.replace('_', ' ')}</span>
                    <strong style={{ color: '#fff' }}>{String(val)}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: AI Solve */}
      {activeSimTab === 'ai_solve' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Sizning Yakuniy Klinik Tashxisingiz:</label>
            <input
              className="form-input"
              placeholder="Masalan: Pastki devor ST-elevatsiyali o'tkir miokard infarkti..."
              value={userDiagnosis}
              onChange={(e) => setUserDiagnosis(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Shoshilinch Davolash va Dori-Darmon Rejasi:</label>
            <textarea
              className="form-textarea"
              placeholder="Aspirin + Klopidogrel, Geparin, Kislorod, Shoshilinch PKI..."
              value={userTreatment}
              onChange={(e) => setUserTreatment(e.target.value)}
              rows={3}
            />
          </div>

          <button
            onClick={handleRunEvaluation}
            disabled={isEvaluating}
            className="btn-primary"
            style={{ width: '100%', padding: '10px' }}
          >
            <Icon name="sparkles" size={17} />
            <span>{isEvaluating ? "AI Baholamoqda..." : "AI Ekspert Bahosini Olish"}</span>
          </button>

          {evaluationResult && (
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              marginTop: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ fontWeight: '700', color: '#34d399', fontSize: '0.95rem' }}>{evaluationResult.verdict}</div>
                <div className="badge badge-emerald">+{evaluationResult.xp} XP / {evaluationResult.score} Ball</div>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: '1.5' }}>
                {evaluationResult.feedback}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
