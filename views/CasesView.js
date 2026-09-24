import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import { DataService } from '../lib/api';
import { CaseEditorModal } from './CaseEditorModal';
import { CaseSimulationModal } from '../components/CaseSimulationModal';

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

        <button
          onClick={() => {
            setEditingCase(null);
            setIsEditorOpen(true);
          }}
          className="btn-primary"
        >
          <Icon name="plus" size={16} />
          <span>Yangi Keys Yaratish</span>
        </button>
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
    </div>
  );
};
