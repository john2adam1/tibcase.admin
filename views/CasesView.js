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
  const [aiGenTopicId, setAiGenTopicId] = useState('');
  const [aiGenTopic, setAiGenTopic] = useState('');
  const [aiGenDiff, setAiGenDiff] = useState('medium');
  const [aiGenComplaint, setAiGenComplaint] = useState('');
  const [aiGenAnswer, setAiGenAnswer] = useState('');
  const [aiGenSourceIds, setAiGenSourceIds] = useState([]);
  const [aiGenErr, setAiGenErr] = useState('');
  const [generating, setGenerating] = useState(false);

  // AI Batch state
  const [isAiBatchOpen, setIsAiBatchOpen] = useState(false);
  const [aiBatchCategoryId, setAiBatchCategoryId] = useState('');
  const [aiBatchTopicIds, setAiBatchTopicIds] = useState([]);
  const [aiBatchDiff, setAiBatchDiff] = useState('medium');
  const [aiBatchCount, setAiBatchCount] = useState(1);
  const [aiBatchSourceIds, setAiBatchSourceIds] = useState([]);
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [aiBatchResult, setAiBatchResult] = useState(null);
  const [aiBatchErr, setAiBatchErr] = useState('');

  const [sources, setSources] = useState([]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [casesRes, catsRes, topsRes, sourcesRes] = await Promise.all([
        DataService.getCases(),
        DataService.getCategories(),
        DataService.getTopics(),
        DataService.getCaseSources()
      ]);
      setCases(Array.isArray(casesRes) ? casesRes : []);
      setCategories(Array.isArray(catsRes) ? catsRes : []);
      setTopics(Array.isArray(topsRes) ? topsRes : []);
      setSources(Array.isArray(sourcesRes) ? sourcesRes : []);
    } catch {
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const toggleSourceId = (list, id) => {
    return list.includes(id) ? list.filter(x => x !== id) : [...list, id];
  };

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
    const topicText = aiGenTopic.trim();
    if (!aiGenTopicId && !topicText) {
      setAiGenErr("Mavzuni ro'yxatdan tanlang yoki matn yozing");
      return;
    }
    setGenerating(true);
    setAiGenErr('');
    try {
      const payload = {
        difficulty: aiGenDiff
      };
      if (aiGenTopicId) payload.topic_id = aiGenTopicId;
      if (topicText) payload.topic = topicText;
      if (aiGenSourceIds.length) payload.source_ids = aiGenSourceIds;
      if (aiGenComplaint.trim()) payload.chief_complaint = aiGenComplaint.trim();
      if (aiGenAnswer.trim()) payload.expected_answer = aiGenAnswer.trim();

      await DataService.aiGenerateCase(payload);
      onShowToast("AI keys qoralamasi muvaffaqiyatli yaratildi!", "success");
      setIsAiGenOpen(false);
      setAiGenTopicId('');
      setAiGenTopic('');
      setAiGenComplaint('');
      setAiGenAnswer('');
      setAiGenSourceIds([]);
      loadAll();
    } catch (err) {
      setAiGenErr(err?.message || "AI generatsiyasida xatolik");
      onShowToast(err?.message || "AI keys generatsiyasida xatolik", "error");
    } finally {
      setGenerating(false);
    }
  };

  const batchTopicCount = aiBatchTopicIds.length
    ? aiBatchTopicIds.length
    : (aiBatchCategoryId ? topics.filter(t => t.category_id === aiBatchCategoryId).length : 0);
  const batchTotal = batchTopicCount * (Number(aiBatchCount) || 0);

  const handleAiBatchSubmit = async (e) => {
    e.preventDefault();
    if (!aiBatchTopicIds.length && !aiBatchCategoryId) {
      setAiBatchErr("Bo'lim tanlang yoki kamida bitta mavzu belgilang");
      return;
    }
    if (batchTotal < 1) {
      setAiBatchErr("Har mavzuga kamida 1 ta case kerak");
      return;
    }
    if (batchTotal > 20) {
      setAiBatchErr(`Jami so'raladigan case soni 20 tadan oshmasligi kerak (hozir: ${batchTotal})`);
      return;
    }
    setBatchGenerating(true);
    setAiBatchErr('');
    setAiBatchResult(null);
    try {
      const body = {
        difficulty: aiBatchDiff,
        count_per_topic: Number(aiBatchCount) || 1
      };
      if (aiBatchTopicIds.length) body.topic_ids = aiBatchTopicIds;
      else body.category_id = aiBatchCategoryId;
      if (aiBatchSourceIds.length) body.source_ids = aiBatchSourceIds;

      const res = await DataService.aiGenerateBatchCase(body);
      setAiBatchResult(res || {});
      if ((res?.created || 0) > 0) {
        onShowToast(`${res.created} ta draft case yaratildi!`, "success");
        loadAll();
      }
    } catch (err) {
      setAiBatchErr(err?.message || "Ommaviy generatsiyada xatolik");
      onShowToast(err?.message || "Ommaviy generatsiyada xatolik", "error");
    } finally {
      setBatchGenerating(false);
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
              setAiBatchErr('');
              setAiBatchResult(null);
              setIsAiBatchOpen(true);
            }}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>🤖 Ommaviy AI generatsiya</span>
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
                      {c.title?.[lang] || c.title?.uz || c.title || `Keys #${c.id}`}
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

      {/* AI Case Generation Modal (Single) */}
      <Modal
        isOpen={isAiGenOpen}
        onClose={() => setIsAiGenOpen(false)}
        title="AI Yordamida Klinik Keys Yaratish (POST /web/case/ai-generate)"
        maxWidth="580px"
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
            <label className="form-label">Mavzuni Ro'yxatdan Tanlang (topic_id):</label>
            <select
              className="form-select"
              value={aiGenTopicId}
              onChange={(e) => setAiGenTopicId(e.target.value)}
            >
              <option value="">— Mavzuni tanlang (ixtiyoriy) —</option>
              {topics.map(t => (
                <option key={t.id} value={t.id}>{t.name?.[lang] || t.name?.uz || t.name}</option>
              ))}
            </select>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Mavzu tanlansa, yaratilgan keys shu mavzuga biriktiriladi.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Yoki Mavzu Matnini Yozing (topic):</label>
            <input
              type="text"
              className="form-input"
              placeholder="Masalan: O'tkir appenditsit yoki Gipertonik kriz"
              value={aiGenTopic}
              onChange={(e) => setAiGenTopic(e.target.value)}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Mavzu tanlanmagan bo'lsa, ushbu matn bo'yicha keys tuziladi.
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
            <label className="form-label">Ishonchli Manbalar (ixtiyoriy):</label>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Hech biri tanlanmasa — bazadagi barcha manbalar ishlatiladi.
            </div>
            {sources.length === 0 ? (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bazada manbalar mavjud emas.</div>
            ) : (
              <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {sources.map(s => (
                  <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <input
                      type="checkbox"
                      checked={aiGenSourceIds.includes(s.id)}
                      onChange={() => setAiGenSourceIds(toggleSourceId(aiGenSourceIds, s.id))}
                    />
                    <span>{s.name}</span>
                  </label>
                ))}
              </div>
            )}
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

      {/* AI Batch Generation Modal */}
      <Modal
        isOpen={isAiBatchOpen}
        onClose={() => setIsAiBatchOpen(false)}
        title="🤖 Ommaviy AI Case Generatsiyasi (POST /web/case/ai-generate-batch)"
        maxWidth="640px"
      >
        <form onSubmit={handleAiBatchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            Butun bo'lim yoki tanlangan mavzular bo'yicha bir martada ko'plab draft keyslar yaratadi.
          </p>

          {aiBatchErr && (
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
              <strong>Xatolik:</strong> {aiBatchErr}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Bo'lim bo'yicha generatsiya:</label>
            <select
              className="form-select"
              value={aiBatchCategoryId}
              onChange={(e) => {
                setAiBatchCategoryId(e.target.value);
                setAiBatchTopicIds([]);
              }}
            >
              <option value="">— Bo'limni tanlang —</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name?.[lang] || c.name?.uz || c.name}</option>
              ))}
            </select>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Quyida aniq mavzular tanlansa, bo'lim e'tiborga olinmaydi.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Yoki Aniq Mavzularni Tanlang:</label>
            <div style={{ maxHeight: '130px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {(aiBatchCategoryId ? topics.filter(t => t.category_id === aiBatchCategoryId) : topics).map(t => (
                <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={aiBatchTopicIds.includes(t.id)}
                    onChange={() => setAiBatchTopicIds(toggleSourceId(aiBatchTopicIds, t.id))}
                  />
                  <span>{t.name?.[lang] || t.name?.uz || t.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Qiyinlik:</label>
              <select
                className="form-select"
                value={aiBatchDiff}
                onChange={(e) => setAiBatchDiff(e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Har bir mavzuga nechta keys:</label>
              <input
                type="number"
                min="1"
                max="20"
                className="form-input"
                value={aiBatchCount}
                onChange={(e) => setAiBatchCount(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
          </div>

          <div style={{ padding: '8px 12px', background: 'var(--bg-input)', borderRadius: '6px', fontSize: '0.8rem', color: batchTotal > 20 ? '#fca5a5' : 'var(--text-secondary)' }}>
            Jami so'raladigan keyslar soni: <strong>{batchTotal}</strong> ta (Chegara: 20 ta). Har bir keys ~10–30 soniya olishi mumkin.
          </div>

          <div className="form-group">
            <label className="form-label">Ishonchli Manbalar:</label>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Hech biri tanlanmasa — bazadagi barcha manbalar ishlatiladi.
            </div>
            {sources.length === 0 ? (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bazada manbalar yo'q (bo'sh qoldirilishi mumkin).</div>
            ) : (
              <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {sources.map(s => (
                  <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <input
                      type="checkbox"
                      checked={aiBatchSourceIds.includes(s.id)}
                      onChange={() => setAiBatchSourceIds(toggleSourceId(aiBatchSourceIds, s.id))}
                    />
                    <span>{s.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {aiBatchResult && (
            <div style={{
              background: 'rgba(6,182,212,0.08)',
              border: '1px solid rgba(6,182,212,0.3)',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '0.82rem'
            }}>
              <div style={{ color: '#fff', fontWeight: '700', marginBottom: '6px' }}>
                Generatsiya natijasi: Yaratildi: <span style={{ color: '#4ade80' }}>{aiBatchResult.created ?? 0}</span> · Xato: <span style={{ color: '#f87171' }}>{aiBatchResult.failed ?? 0}</span>
              </div>
              {(aiBatchResult.items || []).length > 0 && (
                <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-secondary)' }}>
                  {aiBatchResult.items.map((it, idx) => (
                    <li key={it.case_id || `${it.topic_id}-${idx}`}>
                      {it.case_id ? `Case #${it.case_id} yaratildi` : (it.error || 'Xato')}
                      {it.topic_id ? ` (mavzu: ${it.topic_id})` : ''}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              disabled={batchGenerating}
              onClick={() => setIsAiBatchOpen(false)}
              className="btn-secondary"
            >
              Yopish
            </button>
            <button
              type="submit"
              disabled={batchGenerating || batchTotal < 1 || batchTotal > 20}
              className="btn-primary"
            >
              {batchGenerating ? "Ketma-ket yaratilmoqda..." : "🚀 Ommaviy Yaratish"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
