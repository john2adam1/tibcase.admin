import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import { Modal } from '../components/Modal';

export const CaseEditorModal = ({
  isOpen,
  onClose,
  caseItem,
  categories = [],
  topics = [],
  onSave,
  lang = 'uz'
}) => {
  const [activeTab, setActiveTab] = useState('basic');

  // Form State
  const [formData, setFormData] = useState({
    title: { uz: '', ru: '', en: '' },
    subtitle: { uz: '', ru: '', en: '' },
    chief_complaint: { uz: '', ru: '', en: '' },
    category_id: '',
    topic_id: '',
    difficulty: 'medium',
    status: 'draft',
    patient_age: 45,
    patient_gender: 'male',
    visual_state: 'normal',
    expected_duration_minutes: 15,
    order_num: 1,
    cover_image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=60',
    expected_answer: '',
    initial_vitals: {
      bp: '120/80',
      hr: 76,
      temp: 36.6,
      spo2: 98,
      rr: 16,
      gcs: 15
    },
    scenario: {
      patient_history: '',
      physical_exam: '',
      ecg_findings: '',
      lab_tests: {},
      differential_diagnoses: [],
      treatment_steps: []
    }
  });

  const [rawLabText, setRawLabText] = useState('{}');
  const [rawDiffText, setRawDiffText] = useState('');
  const [rawTreatmentText, setRawTreatmentText] = useState('');

  useEffect(() => {
    if (caseItem) {
      const v = caseItem.initial_vitals || {};
      setFormData({
        ...caseItem,
        title: caseItem.title || { uz: '', ru: '', en: '' },
        subtitle: caseItem.subtitle || { uz: '', ru: '', en: '' },
        chief_complaint: caseItem.chief_complaint || { uz: '', ru: '', en: '' },
        category_id: caseItem.category_id || '',
        topic_id: caseItem.topic_id || '',
        difficulty: caseItem.difficulty || 'medium',
        status: caseItem.status || 'draft',
        patient_age: caseItem.patient_age ?? 45,
        patient_gender: caseItem.patient_gender || 'male',
        visual_state: caseItem.visual_state || 'normal',
        expected_duration_minutes: caseItem.expected_duration_minutes ?? 15,
        order_num: caseItem.order_num ?? 1,
        cover_image_url: caseItem.cover_image_url || '',
        expected_answer: caseItem.expected_answer || '',
        initial_vitals: {
          bp: v.bp || v.blood_pressure || '120/80',
          hr: v.hr ?? v.heart_rate ?? 76,
          temp: v.temp ?? v.temperature ?? 36.6,
          spo2: v.spo2 ?? 98,
          rr: v.rr ?? v.respiratory_rate ?? 16,
          gcs: v.gcs ?? 15
        },
        scenario: caseItem.scenario || {
          patient_history: '',
          physical_exam: '',
          ecg_findings: '',
          lab_tests: {},
          differential_diagnoses: [],
          treatment_steps: []
        }
      });

      if (caseItem.scenario?.lab_tests) {
        setRawLabText(JSON.stringify(caseItem.scenario.lab_tests, null, 2));
      } else {
        setRawLabText('{}');
      }

      setRawDiffText((caseItem.scenario?.differential_diagnoses || []).join('\n'));
      setRawTreatmentText((caseItem.scenario?.treatment_steps || []).join('\n'));
    } else {
      // Default empty
      const defaultCat = categories[0]?.id || '';
      const defaultTopic = topics[0]?.id || '';
      setFormData({
        title: { uz: '', ru: '', en: '' },
        subtitle: { uz: '', ru: '', en: '' },
        chief_complaint: { uz: '', ru: '', en: '' },
        category_id: defaultCat,
        topic_id: defaultTopic,
        difficulty: 'medium',
        status: 'draft',
        patient_age: 45,
        patient_gender: 'male',
        visual_state: 'normal',
        expected_duration_minutes: 15,
        order_num: 1,
        cover_image_url: '',
        expected_answer: '',
        initial_vitals: {
          bp: '120/80',
          hr: 80,
          temp: 36.6,
          spo2: 98,
          rr: 16,
          gcs: 15
        },
        scenario: {
          patient_history: '',
          physical_exam: '',
          ecg_findings: '',
          lab_tests: {},
          differential_diagnoses: [],
          treatment_steps: []
        }
      });
      setRawLabText('{}');
      setRawDiffText('');
      setRawTreatmentText('');
    }
  }, [caseItem, isOpen, categories, topics]);

  // Sync category if topic is selected
  const handleTopicChange = (topicId) => {
    const matched = topics.find(t => t.id === topicId);
    setFormData(prev => ({
      ...prev,
      topic_id: topicId,
      category_id: matched?.category_id || prev.category_id
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let parsedLabs = {};
    try {
      parsedLabs = rawLabText ? JSON.parse(rawLabText) : {};
    } catch {
      alert("Laborator tahlillar JSON formati noto'g'ri!");
      return;
    }

    const payload = {
      ...formData,
      category_id: formData.category_id || undefined,
      patient_age: parseInt(formData.patient_age, 10) || 0,
      expected_duration_minutes: parseInt(formData.expected_duration_minutes, 10) || 15,
      order_num: parseInt(formData.order_num, 10) || 1,
      initial_vitals: {
        bp: String(formData.initial_vitals?.bp || '120/80'),
        hr: Number(formData.initial_vitals?.hr) || 80,
        temp: Number(formData.initial_vitals?.temp) || 36.6,
        spo2: Number(formData.initial_vitals?.spo2) || 98,
        rr: Number(formData.initial_vitals?.rr) || 16,
        gcs: Number(formData.initial_vitals?.gcs) || 15
      },
      scenario: {
        ...formData.scenario,
        lab_tests: parsedLabs,
        differential_diagnoses: rawDiffText.split('\n').map(s => s.trim()).filter(Boolean),
        treatment_steps: rawTreatmentText.split('\n').map(s => s.trim()).filter(Boolean)
      }
    };

    onSave(payload);
  };

  // Filter topics based on category if selected
  const availableTopics = formData.category_id
    ? topics.filter(t => !t.category_id || t.category_id === formData.category_id)
    : topics;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={caseItem ? `Klinik Keysni Tahrirlash (#${caseItem.id})` : "Yangi Klinik Keys Yaratish"}
      maxWidth="900px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
          {[
            { id: 'basic', label: "1. Asosiy & Ko'rinish", icon: 'fileText' },
            { id: 'vitals', label: '2. Bemor & Vitals', icon: 'heartPulse' },
            { id: 'scenario', label: '3. Stsenariy & Tahlillar', icon: 'activity' },
            { id: 'protocol', label: '4. Tashxis & Davo', icon: 'listChecks' }
          ].map(t => (
            <button
              type="button"
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: activeTab === t.id ? 'var(--accent-cyan)' : 'var(--bg-input)',
                color: activeTab === t.id ? '#fff' : 'var(--text-secondary)',
                border: activeTab === t.id ? 'none' : '1px solid var(--border-subtle)'
              }}
            >
              <Icon name={t.icon} size={15} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Basic */}
        {activeTab === 'basic' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Kategoriya / Bo'lim:</label>
                <select
                  className="form-select"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                >
                  <option value="">— Bo'limni tanlang —</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name?.[lang] || c.name?.uz || c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Mavzu (Topic) *:</label>
                <select
                  className="form-select"
                  value={formData.topic_id}
                  onChange={(e) => handleTopicChange(e.target.value)}
                  required
                >
                  <option value="">— Mavzuni tanlang —</option>
                  {availableTopics.map(t => (
                    <option key={t.id} value={t.id}>{t.name?.[lang] || t.name?.uz || t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Multilingual Titles */}
            <div className="form-group">
              <label className="form-label">Keys Nomi (O'zbekcha) *:</label>
              <input
                className="form-input"
                required
                placeholder="Masalan: O'tkir Miokard Infarkti (STEMI)"
                value={formData.title.uz || ''}
                onChange={(e) => setFormData({ ...formData, title: { ...formData.title, uz: e.target.value } })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Keys Nomi (Русский):</label>
                <input
                  className="form-input"
                  placeholder="Острый инфаркт миокарда..."
                  value={formData.title.ru || ''}
                  onChange={(e) => setFormData({ ...formData, title: { ...formData.title, ru: e.target.value } })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Keys Nomi (English):</label>
                <input
                  className="form-input"
                  placeholder="Acute Myocardial Infarction..."
                  value={formData.title.en || ''}
                  onChange={(e) => setFormData({ ...formData, title: { ...formData.title, en: e.target.value } })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Qisqa Tavsif / Subtitle (UZ):</label>
              <input
                className="form-input"
                placeholder="58 yoshli bemorda to'sh ortidagi o'tkir og'riq..."
                value={formData.subtitle.uz || ''}
                onChange={(e) => setFormData({ ...formData, subtitle: { ...formData.subtitle, uz: e.target.value } })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Muqova Rasm URL (Cover Image):</label>
              <input
                type="text"
                className="form-input"
                placeholder="https://images.unsplash.com/..."
                value={formData.cover_image_url || ''}
                onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Qiyinlik Darajasi:</label>
                <select
                  className="form-select"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                >
                  <option value="easy">Oson (Easy)</option>
                  <option value="medium">O'rta (Medium)</option>
                  <option value="hard">Qiyin (Hard)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Holat (Status):</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="draft">Qoralama (Draft)</option>
                  <option value="published">Nashr qilingan (Published)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Kutilayotgan Vaqt (daqiqa):</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.expected_duration_minutes}
                  onChange={(e) => setFormData({ ...formData, expected_duration_minutes: parseInt(e.target.value, 10) || 15 })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Vitals */}
        {activeTab === 'vitals' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Bemor Yoshi:</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.patient_age}
                  onChange={(e) => setFormData({ ...formData, patient_age: parseInt(e.target.value, 10) || 0 })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bemor Jinsi:</label>
                <select
                  className="form-select"
                  value={formData.patient_gender}
                  onChange={(e) => setFormData({ ...formData, patient_gender: e.target.value })}
                >
                  <option value="male">Erkak (Male)</option>
                  <option value="female">Ayol (Female)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tashqi Ko'rinish (Visual State):</label>
                <select
                  className="form-select"
                  value={formData.visual_state}
                  onChange={(e) => setFormData({ ...formData, visual_state: e.target.value })}
                >
                  <option value="normal">Normal / Tinch</option>
                  <option value="sweating_pale">Oqargan, sovuq ter bosgan</option>
                  <option value="cyanotic">Sianotik (ko'kargan lab/barmoqlar)</option>
                  <option value="dyspnea_tripod">Ortopnoe / Hansirash</option>
                  <option value="facial_droop">Yuz asimmetriyasi (FAST)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Asosiy Shikoyat (Chief Complaint UZ) *:</label>
              <textarea
                className="form-textarea"
                required
                rows={3}
                placeholder="To'sh suyagi orqasida bosuvchi chidab bo'lmas og'riq..."
                value={formData.chief_complaint.uz || ''}
                onChange={(e) => setFormData({ ...formData, chief_complaint: { ...formData.chief_complaint, uz: e.target.value } })}
              />
            </div>

            {/* Vitals Box - Swagger models.CaseVitals */}
            <div style={{ padding: '16px', background: '#0a1424', borderRadius: '10px', border: '1px solid #1e3a66' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-cyan)', marginBottom: '12px' }}>
                Boshlang'ich Vital Ko'rsatkichlar (Initial Vitals — Swagger Schema)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                <div>
                  <label className="form-label">Qon Bosimi (BP):</label>
                  <input
                    className="form-input"
                    placeholder="120/80"
                    value={formData.initial_vitals.bp || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      initial_vitals: { ...formData.initial_vitals, bp: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="form-label">Puls (HR bpm):</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.initial_vitals.hr ?? 80}
                    onChange={(e) => setFormData({
                      ...formData,
                      initial_vitals: { ...formData.initial_vitals, hr: parseInt(e.target.value, 10) || 0 }
                    })}
                  />
                </div>
                <div>
                  <label className="form-label">Harorat (°C):</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={formData.initial_vitals.temp ?? 36.6}
                    onChange={(e) => setFormData({
                      ...formData,
                      initial_vitals: { ...formData.initial_vitals, temp: parseFloat(e.target.value) || 36.6 }
                    })}
                  />
                </div>
                <div>
                  <label className="form-label">SpO2 (%):</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.initial_vitals.spo2 ?? 98}
                    onChange={(e) => setFormData({
                      ...formData,
                      initial_vitals: { ...formData.initial_vitals, spo2: parseInt(e.target.value, 10) || 98 }
                    })}
                  />
                </div>
                <div>
                  <label className="form-label">Nafas (RR /min):</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.initial_vitals.rr ?? 16}
                    onChange={(e) => setFormData({
                      ...formData,
                      initial_vitals: { ...formData.initial_vitals, rr: parseInt(e.target.value, 10) || 16 }
                    })}
                  />
                </div>
                <div>
                  <label className="form-label">Glazgo (GCS 3-15):</label>
                  <input
                    type="number"
                    min="3"
                    max="15"
                    className="form-input"
                    value={formData.initial_vitals.gcs ?? 15}
                    onChange={(e) => setFormData({
                      ...formData,
                      initial_vitals: { ...formData.initial_vitals, gcs: parseInt(e.target.value, 10) || 15 }
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Scenario */}
        {activeTab === 'scenario' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Kasallik Tarixi & Anamnezi (Patient History):</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Bemor qachondan beri og'riydi, qo'shimcha kasalliklar, zararli odatlar..."
                value={formData.scenario.patient_history || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  scenario: { ...formData.scenario, patient_history: e.target.value }
                })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Fizikal Ko'rik (Physical Exam):</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Umumiy holati, o'pka auskultatsiyasi, yurak tonlari..."
                value={formData.scenario.physical_exam || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  scenario: { ...formData.scenario, physical_exam: e.target.value }
                })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">EKG / Instrumental Tekshiruv Xulosasi:</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="II, III, aVF da ST elevatsiyasi, r-to'lqin shakllanishi..."
                value={formData.scenario.ecg_findings || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  scenario: { ...formData.scenario, ecg_findings: e.target.value }
                })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Laboratoriya Tahlillari (JSON formatda):</label>
              <textarea
                className="form-textarea"
                rows={4}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                value={rawLabText}
                onChange={(e) => setRawLabText(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Tab 4: Protocol */}
        {activeTab === 'protocol' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Kutilayotgan To'g'ri Tashxis (Expected Diagnosis) *:</label>
              <input
                className="form-input"
                required
                placeholder="Masalan: Pastki devor ST-elevatsiyali o'tkir miokard infarkti (STEMI)"
                value={formData.expected_answer || ''}
                onChange={(e) => setFormData({ ...formData, expected_answer: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Differentsial Tashxislar (Har bir qatorga bittadan):</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Aorta qatlamlanishi&#10;O'pka arteriyasi tromboemboliyasi&#10;O'tkir perikardit"
                value={rawDiffText}
                onChange={(e) => setRawDiffText(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tavsiya Etiladigan Davolash Bosqichlari (Har bir qatorga bittadan):</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Aspirin 300 mg + Klopidogrel 300 mg&#10;Kislorodoterapiya (SpO2 < 94%)&#10;Geparin bolus 5000 XB&#10;Shoshilinch Koronar Angiografiya"
                value={rawTreatmentText}
                onChange={(e) => setRawTreatmentText(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
          <button type="button" onClick={onClose} className="btn-secondary">
            Bekor qilish
          </button>
          <button type="submit" className="btn-primary">
            <Icon name="check" size={16} />
            <span>Klinik Keysni Saqlash</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
