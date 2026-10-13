import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import { DataService } from '../lib/api';
import { CaseEditorModal } from './CaseEditorModal';
import { CaseSimulationModal } from '../components/CaseSimulationModal';
import { Modal } from '../components/Modal';

export const CasesView = ({ onShowToast, lang = 'uz' }) => {
  const [cases, setCases] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCase, setEditingCase] = useState(null);

  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [simCase, setSimCase] = useState(null);

  // AI Gen state
  const [isAiGenOpen, setIsAiGenOpen] = useState(false);
  const [aiGenTopic, setAiGenTopic] = useState('');
  const [aiGenDiff, setAiGenDiff] = useState('medium');
  const [aiGenComplaint, setAiGenComplaint] = useState('');
  const [aiGenAnswer, setAiGenAnswer] = useState('');
  const [aiGenErr, setAiGenErr] = useState('');
  const [generating, setGenerating] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [casesRes, catsRes, topsRes] = await Promise.all([
        DataService.getCases(),
        DataService.getCategories(),
        DataService.getTopics()
      ]);
      setCases(Array.isArray(casesRes) ? casesRes : []);
      setCategories(Array.isArray(catsRes) ? catsRes : []);
      setTopics(Array.isArray(topsRes) ? topsRes : []);
    } catch {
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const filteredCases = cases.filter(c => {
    const titleMatch = (c.title?.[lang] || c.title?.uz || c.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (c.subtitle?.[lang] || c.subtitle?.uz || c.subtitle || '').toLowerCase().includes(searchTerm.toLowerCase());

    const catMatch = !selectedCategory || c.category_id === selectedCategory;
    const topMatch = !selectedTopic || c.topic_id === selectedTopic;
    const diffMatch = !selectedDifficulty || c.difficulty === selectedDifficulty;
    const statusMatch = !selectedStatus || c.status === selectedStatus;

    return titleMatch && catMatch && topMatch && diffMatch && statusMatch;
  });

  const handleSaveCase = async (casePayload) => {
    try {
      if (editingCase?.id) {
        await DataService.updateCase(editingCase.id, casePayload);
        onShowToast("Keys yangilandi!", "success");
      } else {
        await DataService.createCase(casePayload);
        onShowToast("Yangi keys yaratildi!", "success");
      }
      setIsEditorOpen(false);
      setEditingCase(null);
      loadAll();
    } catch (err) {
      onShowToast(err.message || "Xatolik yuz berdi", "error");
    }
  };

  const handleDeleteCase = async (id) => {
    if (window.confirm("Haqiqatan ham bu klinik keysni o'chirmoqchimisiz?")) {
      try {
        await DataService.deleteCase(id);
        loadAll();
        onShowToast("Keys o'chirildi.", "info");
      } catch (err) {
        onShowToast(err.message || "O'chirishda xatolik", "error");
      }
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      await DataService.publishCase(id);
      loadAll();
      onShowToast("Keys holati yangilandi!", "success");
    } catch (err) {
      onShowToast(err.message || "Holatni o'zgartirishda xatolik", "error");
    }
  };

  const handleAiGenSubmit = async (e) => {
    e.preventDefault();
    if (!aiGenTopic.trim()) {
      setAiGenErr("Mavzu matnini kiriting");
      return;
    }
    setGenerating(true);
    setAiGenErr('');
    try {
      const payload = {
        topic: aiGenTopic.trim(),
        difficulty: aiGenDiff
      };
      if (aiGenComplaint.trim()) payload.chief_complaint = aiGenComplaint.trim();
      if (aiGenAnswer.trim()) payload.expected_answer = aiGenAnswer.trim();

      await DataService.aiGenerateCase(payload);
      onShowToast("AI keys qoralamasi muvaffaqiyatli yaratildi!", "success");
      setIsAiGenOpen(false);
      setAiGenTopic('');
      setAiGenComplaint('');
      setAiGenAnswer('');
      loadAll();
    } catch (err) {
      setAiGenErr(err?.message || "AI generatsiyasida xatolik");
      onShowToast(err?.message || "AI keys generatsiyasida xatolik", "error");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: '700' }}>Klinik Case'lar</h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            GET /web/case ({filteredCases.length} ta)
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setAiGenErr('');
              setIsAiGenOpen(true);
            }}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>🤖 AI bilan yaratish</span>
          </button>
          <button
            onClick={() => {
              setEditingCase(null);
              setIsEditorOpen(true);
            }}
            className="btn-primary"
          >
            <Icon name="plus" size={16} />
            <span>+ Yangi Keys Yaratish</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Card */}
      <div className="glass-panel" style={{ padding: '14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '34px' }}
              placeholder="Qidiruv..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Icon name="search" size={15} />
            </div>
          </div>

          {/* Category Filter */}
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Barcha Bo'limlar</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name?.[lang] || c.name?.uz || c.name}</option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            className="form-select"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
          >
            <option value="">Barcha Qiyinlik</option>
            <option value="easy">Oson</option>
            <option value="medium">O'rta</option>
            <option value="hard">Qiyin</option>
          </select>

          {/* Status Filter */}
          <select
            className="form-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">Barcha Holat</option>
            <option value="published">Nashr qilingan</option>
            <option value="draft">Qoralama</option>
          </select>
        </div>
      </div>

      {/* Cases Table */}
      <div className="data-table-container">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Yuklanmoqda...
          </div>
        ) : filteredCases.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Hozircha klinik keyslar mavjud emas.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Keys Nomi</th>
                <th>Qiyinlik</th>
                <th>Holat</th>
                <th>Bemor</th>
                <th style={{ textAlign: 'right' }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: '600', color: '#fff', fontSize: '0.88rem' }}>
                      {c.title?.[lang] || c.title?.uz || c.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {c.subtitle?.[lang] || c.subtitle?.uz || ''}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${c.difficulty === 'easy' ? 'badge-emerald' : c.difficulty === 'medium' ? 'badge-cyan' : 'badge-rose'}`}>
                      {c.difficulty || 'medium'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleTogglePublish(c.id)}
                      className={`badge ${c.status === 'published' ? 'badge-emerald' : 'badge-amber'}`}
                      style={{ cursor: 'pointer', border: 'none' }}
                    >
                      {c.status === 'published' ? 'Nashr qilingan' : 'Qoralama'}
                    </button>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {c.patient_age ? `${c.patient_age} yosh, ` : ''} {c.patient_gender ? (c.patient_gender === 'male' ? 'Erkak' : 'Ayol') : ''}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        onClick={() => {
                          setSimCase(c);
                          setIsSimModalOpen(true);
                        }}
                        className="btn-icon"
                        title="Sinov"
                        style={{ color: 'var(--accent-cyan)' }}
                      >
                        <Icon name="play" size={15} />
                      </button>

                      <button
                        onClick={() => {
                          setEditingCase(c);
                          setIsEditorOpen(true);
                        }}
                        className="btn-icon"
                        title="Tahrirlash"
                      >
                        <Icon name="edit" size={15} />
                      </button>

                      <button
                        onClick={() => handleDeleteCase(c.id)}
                        className="btn-icon"
                        title="O'chirish"
                        style={{ color: 'var(--accent-rose)' }}
                      >
                        <Icon name="trash" size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Editor Modal */}
      <CaseEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingCase(null);
        }}
        caseItem={editingCase}
        categories={categories}
        topics={topics}
        onSave={handleSaveCase}
        lang={lang}
      />

      {/* Simulation Modal */}
      <CaseSimulationModal
        isOpen={isSimModalOpen}
        onClose={() => {
          setIsSimModalOpen(false);
          setSimCase(null);
        }}
        caseData={simCase}
        lang={lang}
      />

      {/* AI Case Generation Modal */}
      <Modal
        isOpen={isAiGenOpen}
        onClose={() => setIsAiGenOpen(false)}
        title="AI Yordamida Klinik Keys Yaratish (POST /web/case/ai-generate)"
        maxWidth="540px"
      >
        <form onSubmit={handleAiGenSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {aiGenErr && (
            <div style={{
              color: '#fca5a5',
              background: 'rgba(239,68,68,.12)',
              border: '1px solid rgba(239,68,68,.4)',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '0.8rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              <strong>Server xatosi:</strong> {aiGenErr}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Mavzu (Topic / Tashxis) *:</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="Masalan: O'tkir appenditsit yoki Gipertonik kriz"
              value={aiGenTopic}
              onChange={(e) => setAiGenTopic(e.target.value)}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Gemini AI shu mavzuga mos to'liq klinik keys stsenariysi va bemor vitallarini generatsiya qiladi.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Qiyinlik Darajasi *:</label>
            <select
              className="form-select"
              value={aiGenDiff}
              onChange={(e) => setAiGenDiff(e.target.value)}
            >
              <option value="easy">Easy (Oson)</option>
              <option value="medium">Medium (O'rta)</option>
              <option value="hard">Hard (Qiyin)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Asosiy Shikoyat (Chief Complaint — Ixtiyoriy):</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Bo'sh qoldirilsa AI o'zi yaratadi..."
              value={aiGenComplaint}
              onChange={(e) => setAiGenComplaint(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Kutilayotgan To'g'ri Tashxis (Expected Diagnosis — Ixtiyoriy):</label>
            <input
              type="text"
              className="form-input"
              placeholder="Bo'sh qoldirilsa AI o'zi aniqlaydi..."
              value={aiGenAnswer}
              onChange={(e) => setAiGenAnswer(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={() => setIsAiGenOpen(false)}
              className="btn-secondary"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={generating}
              className="btn-primary"
            >
              {generating ? "AI generatsiya qilmoqda..." : "🤖 Generatsiya qilish"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
