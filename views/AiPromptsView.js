import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import { DataService } from '../lib/api';

export const AiPromptsView = ({ onShowToast }) => {
  const [prompts, setPrompts] = useState([]);
  const [activePrompt, setActivePrompt] = useState(null);

  // Testing Sandbox state
  const [testInput, setTestInput] = useState(
    "Shifokor javobi: Bemorga zudlik bilan Aspirin 300mg chaynashga berildi, Klopidogrel 300mg, Morfin 5mg v/i og'riqsizlantirish uchun berildi va EKGda STEMI aniqlangani uchun shoshilinch kateterizatsiya laboratoriyasiga yuborildi."
  );
  const [testOutput, setTestOutput] = useState(null);
  const [isRunningTest, setIsRunningTest] = useState(false);

  useEffect(() => {
    const list = DataService.getAiPrompts();
    setPrompts(list);
    if (list.length > 0) setActivePrompt(list[0]);
  }, []);

  const handleSaveActivePrompt = () => {
    if (!activePrompt) return;
    DataService.saveAiPrompt(activePrompt);
    setPrompts(DataService.getAiPrompts());
    onShowToast("AI Prompt va sozlamalar muvaffaqiyatli saqlandi!", "success");
  };

  const handleExecuteSandboxTest = () => {
    setIsRunningTest(true);
    setTestOutput(null);

    setTimeout(() => {
      setIsRunningTest(false);
      setTestOutput({
        score: 95,
        diagnosis_accuracy: "correct",
        treatment_safety: "optimal",
        xp_earned: 220,
        feedback_uz: "A'lo darajadagi shoshilinch yordam! O'tkir ST-elevatsiyali infarktda ikki karra antitrombotsitar terapiya, narkotik analgetik va zudlik bilan reperfuziyaga (ChKB) yuborish to'liq va o'z vaqtida bajarildi.",
        key_learning_points: [
          "STEMI aniqlanganda eshik-ballon vaqti 90 daqiqadan oshmasligi shart",
          "Ko'krak og'rig'i davom etayotganda morfin vena ichiga titrlab yuboriladi"
        ],
        execution_time_ms: 640,
        tokens_consumed: 342
      });
    }, 1100);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', color: '#fff', fontWeight: '800' }}>AI Prompt Muhandisligi & Test Sandbox</h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Gemini AI model parametrlarini sozlash, baholash mezonlari va sinov
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Left: Prompt Selector */}
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
            Tizim AI Promptlari ({prompts.length})
          </div>

          {prompts.map(p => {
            const isSelected = activePrompt?.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setActivePrompt(p)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-input)',
                  border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.88rem', color: isSelected ? '#fff' : 'var(--text-primary)' }}>
                    {p.name}
                  </span>
                  <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>{p.version}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {p.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Prompt Editor & Live Sandbox */}
        {activePrompt && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Editor Box */}
            <div className="glass-panel" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>{activePrompt.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Model: <strong>{activePrompt.model}</strong></div>
                </div>
                <button onClick={handleSaveActivePrompt} className="btn-primary">
                  <Icon name="check" size={16} />
                  <span>Promptni Saqlash</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Sun'iy Intellekt Modeli:</label>
                  <select
                    className="form-select"
                    value={activePrompt.model}
                    onChange={(e) => setActivePrompt({ ...activePrompt, model: e.target.value })}
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Tezkor & Arzon)</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro (Murakkab Klinik Fikrlash)</option>
                    <option value="gemini-3.0-flash">Gemini 3.0 Flash (Next-gen)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span>Harorat (Temperature): {activePrompt.temperature}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Klinik aniqlik uchun pastroq tavsiya etiladi</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    style={{ width: '100%', marginTop: '8px' }}
                    value={activePrompt.temperature}
                    onChange={(e) => setActivePrompt({ ...activePrompt, temperature: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">System Instruction / Prompt Matni:</label>
                <textarea
                  className="form-textarea"
                  rows={8}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', lineHeight: '1.5' }}
                  value={activePrompt.prompt_text}
                  onChange={(e) => setActivePrompt({ ...activePrompt, prompt_text: e.target.value })}
                />
              </div>
            </div>

            {/* Live Sandbox Test Box */}
            <div className="glass-panel" style={{ padding: '22px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Icon name="sparkles" size={18} color="var(--accent-purple)" />
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#fff' }}>Jonli Test Sandbox (Simulyator)</div>
              </div>

              <div className="form-group">
                <label className="form-label">Test Foydalanuvchi Kiritmasi (Talaba/Shifokor javobi):</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                />
              </div>

              <button
                onClick={handleExecuteSandboxTest}
                disabled={isRunningTest}
                className="btn-secondary"
                style={{ width: '100%', padding: '10px', borderColor: 'rgba(139, 92, 246, 0.5)', color: 'var(--accent-purple)' }}
              >
                <Icon name="play" size={16} color="var(--accent-purple)" />
                <span>{isRunningTest ? "AI Test Qilinmoqda..." : "Promptni Jonli Sinovdan O'tkazish"}</span>
              </button>

              {testOutput && (
                <div style={{ marginTop: '16px', padding: '16px', background: '#0a1020', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-emerald">Javob Qabul Qilindi</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{testOutput.execution_time_ms} ms | {testOutput.tokens_consumed} token</span>
                    </div>
                    <span className="badge badge-cyan">{testOutput.score} Ball / +{testOutput.xp_earned} XP</span>
                  </div>

                  <pre style={{
                    background: '#070b16',
                    padding: '12px',
                    borderRadius: '8px',
                    color: '#38bdf8',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {JSON.stringify(testOutput, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
