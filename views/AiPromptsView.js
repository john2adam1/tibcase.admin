import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import { DataService } from '../lib/api';

export const AiPromptsView = ({ onShowToast }) => {
  const [prompts, setPrompts] = useState([]);
  const [activePrompt, setActivePrompt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DataService.getAiPrompts()
      .then(res => {
        const list = Array.isArray(res) ? res : [];
        setPrompts(list);
        if (list.length > 0) setActivePrompt(list[0]);
        setLoading(false);
      })
      .catch(() => {
        setPrompts([]);
        setLoading(false);
      });
  }, []);

  const handleSaveActivePrompt = async () => {
    if (!activePrompt) return;
    try {
      await DataService.updateAiPrompt(activePrompt.id, activePrompt);
      onShowToast("Prompt muvaffaqiyatli saqlandi!", "success");
    } catch (err) {
      onShowToast(err.message || "Saqlashda xatolik", "error");
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: '700' }}>AI Promptlari</h2>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          GET /web/prompt
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Yuklanmoqda...
        </div>
      ) : prompts.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Hozircha promptlar mavjud emas.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '16px', alignItems: 'start' }}>
          {/* List */}
          <div className="glass-panel" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {prompts.map(p => {
              const isSelected = activePrompt?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setActivePrompt(p)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-input)',
                    border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ fontWeight: '600', fontSize: '0.85rem', color: isSelected ? '#fff' : 'var(--text-primary)' }}>
                    {p.name || p.id}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {p.model || 'Gemini'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Prompt Editor */}
          {activePrompt && (
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff' }}>
                  {activePrompt.name || activePrompt.id}
                </div>
                <button onClick={handleSaveActivePrompt} className="btn-primary">
                  <Icon name="check" size={15} />
                  <span>Saqlash</span>
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Prompt Matni:</label>
                <textarea
                  className="form-textarea"
                  rows={8}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                  value={activePrompt.prompt_text || activePrompt.text || ''}
                  onChange={(e) => setActivePrompt({ ...activePrompt, prompt_text: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
