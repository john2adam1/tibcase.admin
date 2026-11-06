'use client';

/* ============================================================
   STATISTIKA SAHIFALARI (Moliya, AI xarajati, Faollik) va
   foydalanuvchi statistikasi bloki.
   Endpointlar: /web/stats/finance|ai-cost|premium-cost|engagement,
   /web/user/{id}/stats. Kontrakt: API_WEB.md → "Statistika".
   ============================================================ */

import React, { useState, useEffect } from 'react';

/* ---------- Formatlash ---------- */
const fmtInt = (n) =>
  typeof n === 'number' && isFinite(n) ? Math.round(n).toLocaleString('en-US').replace(/,/g, ' ') : '—';
const fmtUzs = (n) => (typeof n === 'number' && isFinite(n) ? `${fmtInt(n)} so'm` : '—');
const fmtUsd = (n, d = 2) => (typeof n === 'number' && isFinite(n) ? `$${n.toFixed(d)}` : '—');
const fmtPct = (v) => (typeof v === 'number' && isFinite(v) ? `${Math.round(v * 1000) / 10}%` : '—');
// "2026-11-05 14:02:11+05" -> "2026-11-05 14:02"
const fmtDT = (s) => (typeof s === 'string' && s ? s.slice(0, 16) : '—');
const shortDate = (s) => (typeof s === 'string' ? s.slice(5, 10) : '');

/* ---------- Davr (Toshkent vaqti) ---------- */
const TZ = 'Asia/Tashkent';
const ymd = (d) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
const daysAgo = (n) => ymd(new Date(Date.now() - n * 86400000));
const presetRange = (n) => ({ from: daysAgo(n - 1), to: daysAgo(0) });
const MAX_DAYS = 366;

function rangeError(r) {
  if (!r.from || !r.to) return "Davrning ikkala sanasini tanlang.";
  const a = Date.parse(r.from);
  const b = Date.parse(r.to);
  if (isNaN(a) || isNaN(b)) return "Sana noto'g'ri.";
  if (a > b) return "Boshlanish sanasi tugash sanasidan keyin bo'lmasligi kerak.";
  if ((b - a) / 86400000 + 1 > MAX_DAYS) return `Davr ${MAX_DAYS} kundan oshmasligi kerak.`;
  return '';
}

/* ---------- Ma'lumot yuklash ---------- */
function useStat(api, path, range, tick, silent = false) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const bad = rangeError(range);

  useEffect(() => {
    if (!path || bad) { setLoading(false); return undefined; }
    let off = false;
    setLoading(true);
    api(path, { query: { from: range.from, to: range.to }, silent })
      .then((d) => { if (!off) { setData(d); setFailed(false); } })
      .catch(() => { if (!off) { setData(null); setFailed(true); } })
      .finally(() => { if (!off) setLoading(false); });
    return () => { off = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, range.from, range.to, tick]);

  return { data, loading, failed, bad };
}

/* ---------- Umumiy UI ---------- */
function RangeBar({ range, setRange, onRefresh }) {
  const [active, setActive] = useState(30);
  const pick = (n) => { setActive(n); setRange(presetRange(n)); };
  const err = rangeError(range);
  return (
    <>
      <div className="toolbar">
        {[7, 30, 90].map((n) => (
          <button key={n} className={active === n ? 'primary' : ''} onClick={() => pick(n)}>
            {n} kun
          </button>
        ))}
        <div className="field">
          <label>Dan</label>
          <input type="date" value={range.from} max={range.to || undefined}
            onChange={(e) => { setActive(0); setRange({ ...range, from: e.target.value }); }} />
        </div>
        <div className="field">
          <label>Gacha</label>
          <input type="date" value={range.to} min={range.from || undefined}
            onChange={(e) => { setActive(0); setRange({ ...range, to: e.target.value }); }} />
        </div>
        <button onClick={onRefresh}>🔄 Yangilash</button>
      </div>
      {err && <p className="muted" style={{ color: 'var(--warn-text)', marginTop: -8 }}>{err}</p>}
    </>
  );
}

// items: [ico, label, value, hint?, tone?, goTab?]; goTab + onGo bo'lsa karta bosiladi
function StatCards({ items, onGo }) {
  return (
    <div className="cards">
      {items.map(([ico, label, value, hint, tone, go]) => (
        <div
          key={label}
          className="card"
          title={hint || undefined}
          style={go && onGo ? { cursor: 'pointer' } : undefined}
          role={go && onGo ? 'button' : undefined}
          onClick={go && onGo ? () => onGo(go) : undefined}
        >
          {ico ? <div className="ico">{ico}</div> : null}
          <div className="v" style={tone ? { color: `var(--${tone}-text)` } : undefined}>{value ?? '—'}</div>
          <div className="l">{label}</div>
        </div>
      ))}
    </div>
  );
}

function Pill({ kind, children }) {
  return <span className={`pill ${kind || ''}`}>{children}</span>;
}

function SectionTitle({ children, note }) {
  return (
    <div style={{ margin: '24px 0 10px' }}>
      <h3 style={{ margin: 0 }}>{children}</h3>
      {note ? <p className="muted" style={{ margin: '4px 0 0', fontSize: 12 }}>{note}</p> : null}
    </div>
  );
}

// rows: [{ label, values: { key: number } }], bars: [{ key, label, color }]
function BarChart({ rows, bars, height = 180, fmtVal = fmtInt }) {
  if (!rows || rows.length === 0) return <p className="muted">Ma'lumot yo'q.</p>;
  const max = Math.max(1, ...rows.flatMap((r) => bars.map((b) => Number(r.values[b.key]) || 0)));
  const mid = rows[Math.floor(rows.length / 2)];
  return (
    <div className="chart">
      <div className="chartLegend">
        {bars.map((b) => (
          <span key={b.key}><i style={{ background: b.color }} />{b.label}</span>
        ))}
        <span className="chartMax">eng ko'pi: {fmtVal(max)}</span>
      </div>
      <div className="chartPlot" style={{ height }}>
        {rows.map((r, i) => (
          <div
            key={`${r.label}_${i}`}
            className="chartCol"
            title={`${r.label}\n${bars.map((b) => `${b.label}: ${fmtVal(Number(r.values[b.key]) || 0)}`).join('\n')}`}
          >
            {bars.map((b) => {
              const v = Number(r.values[b.key]) || 0;
              return (
                <div
                  key={b.key}
                  className="chartBar"
                  style={{ height: v > 0 ? `max(${(v / max) * 100}%, 2px)` : 0, background: b.color }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="chartAxis">
        <span>{rows[0].label}</span>
        <span>{mid.label}</span>
        <span>{rows[rows.length - 1].label}</span>
      </div>
    </div>
  );
}

function PageState({ loading, failed, bad, data, children }) {
  if (bad) return null;
  if (loading) return <p className="muted">Yuklanmoqda...</p>;
  if (failed || !data) return <p className="muted">Ma'lumot topilmadi.</p>;
  return children;
}

function SimpleTable({ head, rows, empty = "Ma'lumot yo'q." }) {
  if (!rows || rows.length === 0) return <p className="muted">{empty}</p>;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table>
        <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((cells, i) => (
            <tr key={i}>{cells.map((c, j) => <td key={j}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const TIER_LABEL = { free: 'Bepul', coin: 'Tanga bilan', premium: 'Premium', system: 'Tizim' };
const TIER_PILL = { free: '', coin: 'info', premium: 'brand', system: 'warn' };
const ACTION_LABEL = {
  case_session: 'Keys sessiyasi',
  test_session: 'Test sessiyasi',
  simulation: 'Simulyatsiya',
  flashcard_deck: "Fleshkarta to'plami",
  roadmap: "Yo'l xaritasi"
};

/* ============================================================
   MOLIYA
   ============================================================ */
export function FinancePanel({ api }) {
  const [range, setRange] = useState(presetRange(30));
  const [tick, setTick] = useState(0);
  const { data, loading, failed, bad } = useStat(api, '/web/stats/finance', range, tick);

  const profit = data?.profit_uzs;
  const margin = data && data.revenue_uzs > 0 ? data.profit_uzs / data.revenue_uzs : null;
  const daily = Array.isArray(data?.daily) ? data.daily : [];
  const tariffs = Array.isArray(data?.by_tariff) ? data.by_tariff : [];

  return (
    <div>
      <h2 className="pageTitle">Moliya</h2>
      <p className="pageDesc">/web/stats/finance — tushum, AI xarajati va foyda (Toshkent vaqti bo'yicha)</p>
      <RangeBar range={range} setRange={setRange} onRefresh={() => setTick((t) => t + 1)} />

      <PageState loading={loading} failed={failed} bad={bad} data={data}>
        <StatCards items={[
          ['💰', 'Tushum', fmtUzs(data?.revenue_uzs), "Pul bilan to'langan buyurtmalar (tanga bilan yopilganlar kirmaydi)"],
          ['🤖', 'AI xarajati', fmtUzs(data?.ai_cost_uzs), `${fmtUsd(data?.ai_cost_usd)} · kurs ${fmtInt(data?.usd_to_uzs_rate)}`],
          ['📈', 'Foyda', fmtUzs(profit), 'Tushum − AI xarajati', typeof profit === 'number' ? (profit >= 0 ? 'ok' : 'danger') : undefined],
          ['%', 'Foyda marjasi', fmtPct(margin)],
          ['🧾', "To'langan buyurtmalar", fmtInt(data?.paid_orders)],
          ['💳', "To'lagan foydalanuvchilar", fmtInt(data?.paying_users)],
          ['👥', 'Faol foydalanuvchilar', fmtInt(data?.active_users), "Davrda sessiya, javob yoki fleshkarta takrorlagan"],
          ['📊', 'ARPU', fmtUzs(data?.arpu_uzs), 'Tushum ÷ faol foydalanuvchilar'],
          ['🏷', 'ARPPU', fmtUzs(data?.arppu_uzs), "Tushum ÷ to'lov qilganlar"]
        ]} />

        <SectionTitle note={`USD → so'm kursi: ${fmtInt(data?.usd_to_uzs_rate)} (Sozlamalardagi usd_to_uzs_rate)`}>
          Kunlik tushum va xarajat (so'm)
        </SectionTitle>
        <BarChart
          rows={daily.map((d) => ({
            label: shortDate(d.date) || d.date,
            values: { revenue: d.revenue_uzs, cost: d.ai_cost_uzs }
          }))}
          bars={[
            { key: 'revenue', label: 'Tushum', color: 'var(--ok)' },
            { key: 'cost', label: 'AI xarajati', color: 'var(--danger)' }
          ]}
        />

        <SectionTitle>Tarif bo'yicha sotuv</SectionTitle>
        <SimpleTable
          head={['Tarif', 'Turi', 'Sotilgan', 'Tushum']}
          rows={tariffs.map((t) => [t.name || t.tariff_id, fmtCell(t.kind), fmtInt(t.sold), fmtUzs(t.revenue_uzs)])}
        />

        <details style={{ marginTop: 20 }}>
          <summary className="muted" style={{ cursor: 'pointer', fontSize: 12 }}>Kunlik jadval</summary>
          <div style={{ marginTop: 10 }}>
            <SimpleTable
              head={['Sana', 'Tushum', 'AI xarajati (so\'m)', 'AI xarajati (USD)']}
              rows={[...daily].reverse().map((d) => [d.date, fmtUzs(d.revenue_uzs), fmtUzs(d.ai_cost_uzs), fmtUsd(d.ai_cost_usd)])}
            />
          </div>
        </details>
      </PageState>
    </div>
  );
}

function fmtCell(v) {
  if (v === null || v === undefined || v === '') return '—';
  return String(v);
}

/* ============================================================
   AI XARAJATI (+ premium nazorat)
   ============================================================ */
export function AiCostPanel({ api }) {
  const [range, setRange] = useState(presetRange(30));
  const [tick, setTick] = useState(0);
  const cost = useStat(api, '/web/stats/ai-cost', range, tick);
  const prem = useStat(api, '/web/stats/premium-cost', range, tick);
  const d = cost.data;
  const p = prem.data;

  const features = Array.isArray(d?.by_feature) ? d.by_feature : [];
  const actions = Array.isArray(d?.per_action) ? d.per_action : [];
  const tiers = Array.isArray(d?.by_tier) ? d.by_tier : [];
  const spenders = Array.isArray(p?.top_spenders) ? p.top_spenders : [];

  return (
    <div>
      <h2 className="pageTitle">AI xarajati</h2>
      <p className="pageDesc">/web/stats/ai-cost va /web/stats/premium-cost — AI qancha turadi va kim ko'p sarflaydi</p>
      <RangeBar range={range} setRange={setRange} onRefresh={() => setTick((t) => t + 1)} />

      <PageState loading={cost.loading} failed={cost.failed} bad={cost.bad} data={d}>
        <StatCards items={[
          ['💸', 'Jami xarajat', fmtUsd(d?.total_cost_usd)],
          ['🔤', 'Tokenlar', fmtInt(d?.total_tokens)],
          ['⚡', 'AI chaqiruvlari', fmtInt(d?.calls)],
          ['🪙', 'Yechilgan tangalar', fmtInt(d?.coins_spent)],
          ['🎯', '1 tanganing tannarxi', fmtUsd(d?.cost_per_coin_usd, 5),
            "Bepul va tanga bilan ishlovchilar AI xarajati ÷ yechilgan tangalar. Tanga paketi narxini shunga qarab belgilang."]
        ]} />

        <SectionTitle note="Bitta amalning o'rtacha AI xarajati va foydalanuvchidan yechilgan o'rtacha tanga">
          Bitta amal narxi
        </SectionTitle>
        <SimpleTable
          head={['Amal', 'Soni', "O'rtacha xarajat", "O'rtacha tanga"]}
          rows={actions.map((a) => [
            ACTION_LABEL[a.action] || a.action,
            fmtInt(a.count),
            fmtUsd(a.avg_cost_usd, 4),
            typeof a.avg_coins === 'number' ? a.avg_coins.toFixed(1) : '—'
          ])}
        />

        <SectionTitle>Funksiya bo'yicha</SectionTitle>
        <SimpleTable
          head={['Funksiya', 'Chaqiruvlar', 'Tokenlar', 'Xarajat']}
          rows={features.map((f) => [f.feature, fmtInt(f.calls), fmtInt(f.tokens), fmtUsd(f.cost_usd)])}
        />

        <SectionTitle note="Bepul foydalanuvchilar ham xarajat keltiradi: ular uchun ketgan summani shu yerdan ko'ring">
          Foydalanuvchi turi bo'yicha
        </SectionTitle>
        <SimpleTable
          head={['Turi', 'Foydalanuvchilar', 'Chaqiruvlar', 'Xarajat']}
          rows={tiers.map((t) => [
            <Pill key="p" kind={TIER_PILL[t.tier]}>{TIER_LABEL[t.tier] || t.tier}</Pill>,
            fmtInt(t.users),
            fmtInt(t.calls),
            fmtUsd(t.cost_usd)
          ])}
        />
      </PageState>

      <SectionTitle note="Premiumda tanga yechilmaydi, shuning uchun xarajat alohida nazoratda bo'lishi kerak">
        Premium nazorati
      </SectionTitle>
      <PageState loading={prem.loading} failed={prem.failed} bad={prem.bad} data={p}>
        <StatCards items={[
          ['👑', 'Premium foydalanuvchilar', fmtInt(p?.premium_users)],
          ['💸', "O'rtacha AI xarajati", fmtUsd(p?.avg_ai_cost_usd), 'Bitta premium foydalanuvchiga'],
          ['⚠️', 'Zarar keltirayotganlar', fmtInt(p?.loss_making_users),
            "Umr bo'yi AI xarajati (so'mda) umr bo'yi to'lagan pulidan ko'p bo'lgan premiumlar. Tanlangan davrga bog'liq emas.",
            p?.loss_making_users > 0 ? 'warn' : 'ok']
        ]} />
        <h4 style={{ margin: '4px 0 10px' }}>Eng ko'p sarflaganlar (top 20)</h4>
        <SimpleTable
          head={['Foydalanuvchi', 'Turi', 'Xarajat', 'Tokenlar', 'Sessiyalar', "To'lagan puli"]}
          rows={spenders.map((s) => [
            <span key="n" title={s.user_id}>{s.name || String(s.user_id || '').slice(0, 8)}</span>,
            <Pill key="t" kind={TIER_PILL[s.type]}>{TIER_LABEL[s.type] || s.type || '—'}</Pill>,
            fmtUsd(s.cost_usd),
            fmtInt(s.tokens),
            fmtInt(s.sessions),
            fmtUzs(s.paid_uzs)
          ])}
        />
      </PageState>
    </div>
  );
}

/* ============================================================
   FAOLLIK
   ============================================================ */
function Funnel({ steps }) {
  const base = steps[0]?.value || 0;
  return (
    <div className="funnel">
      {steps.map((s, i) => {
        const prev = i > 0 ? steps[i - 1].value : null;
        const ofBase = base > 0 ? s.value / base : null;
        const ofPrev = prev > 0 ? s.value / prev : null;
        return (
          <div key={s.label} className="funnelRow">
            <div className="funnelLabel">{s.label}</div>
            <div className="funnelTrack">
              <div className="funnelFill" style={{ width: `${Math.max(ofBase == null ? 0 : ofBase * 100, s.value > 0 ? 1.5 : 0)}%` }} />
            </div>
            <div className="funnelVal">
              <b>{fmtInt(s.value)}</b>
              <span className="muted">
                {i === 0 ? '' : ` · ${fmtPct(ofBase)} ro'yxatdan o'tganlardan`}
                {ofPrev != null && i > 1 ? ` · oldingisidan ${fmtPct(ofPrev)}` : ''}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function EngagementPanel({ api }) {
  const [range, setRange] = useState(presetRange(30));
  const [tick, setTick] = useState(0);
  const { data, loading, failed, bad } = useStat(api, '/web/stats/engagement', range, tick);
  const daily = Array.isArray(data?.daily) ? data.daily : [];
  const f = data?.funnel;

  return (
    <div>
      <h2 className="pageTitle">Faollik</h2>
      <p className="pageDesc">/web/stats/engagement — foydalanuvchilar platformadan qanday foydalanayotgani</p>
      <RangeBar range={range} setRange={setRange} onRefresh={() => setTick((t) => t + 1)} />

      <PageState loading={loading} failed={failed} bad={bad} data={data}>
        <StatCards items={[
          ['🟢', 'DAU (bugun)', fmtInt(data?.dau), 'Bugun faol bo‘lgan foydalanuvchilar'],
          ['📅', 'WAU (7 kun)', fmtInt(data?.wau)],
          ['🗓', 'MAU (30 kun)', fmtInt(data?.mau)],
          ['🧲', 'DAU / MAU', fmtPct(data?.dau_mau), "Foydalanuvchilar qanchalik tez-tez qaytishi (yopishqoqlik)"],
          ['🆕', 'Yangi foydalanuvchilar', fmtInt(data?.new_users), 'Tanlangan davrda']
        ]} />
        <p className="muted" style={{ marginTop: -10, fontSize: 12 }}>
          DAU, WAU va MAU bugungi kunga nisbatan hisoblanadi, tanlangan davrga bog'liq emas. Faol = sessiya boshlagan,
          savolga javob bergan yoki fleshkarta takrorlagan. Faqat login qilish faollik emas.
        </p>

        <SectionTitle>Kunlik faol foydalanuvchilar (DAU) va sessiyalar</SectionTitle>
        <BarChart
          rows={daily.map((d) => ({ label: shortDate(d.date) || d.date, values: { dau: d.dau, sessions: d.sessions } }))}
          bars={[
            { key: 'dau', label: 'DAU', color: 'var(--accent)' },
            { key: 'sessions', label: 'Sessiyalar', color: 'var(--info)' }
          ]}
        />

        <SectionTitle>Yangi foydalanuvchilar va fleshkarta takrorlashlari</SectionTitle>
        <BarChart
          rows={daily.map((d) => ({ label: shortDate(d.date) || d.date, values: { users: d.new_users, reviews: d.flashcard_reviews } }))}
          bars={[
            { key: 'users', label: 'Yangi foydalanuvchilar', color: 'var(--ok)' },
            { key: 'reviews', label: 'Fleshkarta takrorlashlari', color: 'var(--warn)' }
          ]}
        />

        <SectionTitle note="Tanlangan davrda ro'yxatdan o'tganlar bo'yicha: ularning nechtasi har bosqichdan o'tdi">
          Voronka
        </SectionTitle>
        {f ? (
          <Funnel steps={[
            { label: "Ro'yxatdan o'tdi", value: f.registered },
            { label: 'Birinchi sessiyani boshladi', value: f.started_session },
            { label: 'Sessiyani tugatdi', value: f.finished_session },
            { label: 'Ertasi kuni qaytdi', value: f.returned_next_day },
            { label: "To'lov qildi", value: f.paid }
          ]} />
        ) : <p className="muted">Ma'lumot yo'q.</p>}
      </PageState>
    </div>
  );
}

/* ============================================================
   DASHBOARD UCHUN QISQACHA XULOSA (oxirgi 30 kun)
   ============================================================ */
export function DashboardSummary({ api, onGo }) {
  const [range] = useState(presetRange(30));
  const fin = useStat(api, '/web/stats/finance', range, 0, true);
  const eng = useStat(api, '/web/stats/engagement', range, 0, true);
  const cost = useStat(api, '/web/stats/ai-cost', range, 0, true);
  const prem = useStat(api, '/web/stats/premium-cost', range, 0, true);

  const loading = fin.loading || eng.loading || cost.loading || prem.loading;
  if (!loading && !fin.data && !eng.data && !cost.data && !prem.data) return null;

  const f = fin.data;
  const profit = f?.profit_uzs;
  const daily = Array.isArray(f?.daily) ? f.daily : [];
  const loss = prem.data?.loss_making_users;

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, margin: '4px 0 12px' }}>
        <h3 style={{ margin: 0 }}>Oxirgi 30 kun: qisqacha xulosa</h3>
        <span className="muted" style={{ fontSize: 12 }}>Kartani bossangiz batafsil sahifa ochiladi</span>
      </div>

      {loading ? <p className="muted">Yuklanmoqda...</p> : (
        <>
          <StatCards onGo={onGo} items={[
            ['💰', 'Tushum', fmtUzs(f?.revenue_uzs), `${fmtInt(f?.paid_orders)} ta to'langan buyurtma`, undefined, 'stats_finance'],
            ['📈', 'Foyda', fmtUzs(profit), 'Tushum − AI xarajati', typeof profit === 'number' ? (profit >= 0 ? 'ok' : 'danger') : undefined, 'stats_finance'],
            ['💳', "To'lagan foydalanuvchilar", fmtInt(f?.paying_users), undefined, undefined, 'stats_finance'],
            ['🟢', 'DAU (bugun)', fmtInt(eng.data?.dau), `MAU: ${fmtInt(eng.data?.mau)}, DAU/MAU: ${fmtPct(eng.data?.dau_mau)}`, undefined, 'stats_engagement'],
            ['🗓', 'MAU (30 kun)', fmtInt(eng.data?.mau), undefined, undefined, 'stats_engagement'],
            ['🆕', 'Yangi foydalanuvchilar', fmtInt(eng.data?.new_users), 'Oxirgi 30 kunda', undefined, 'stats_engagement'],
            ['🎯', '1 tanganing tannarxi', fmtUsd(cost.data?.cost_per_coin_usd, 5), 'AI xarajati ÷ yechilgan tangalar', undefined, 'stats_ai_cost'],
            ['⚠️', 'Zarar keltirayotgan premium', fmtInt(loss), "Umr bo'yi AI xarajati to'lagan pulidan ko'p premiumlar", loss > 0 ? 'warn' : undefined, 'stats_ai_cost']
          ]} />

          {daily.length > 0 && (
            <>
              <h4 style={{ margin: '4px 0 8px' }}>Kunlik tushum va AI xarajati (so'm)</h4>
              <BarChart
                height={120}
                rows={daily.map((d) => ({ label: shortDate(d.date) || d.date, values: { revenue: d.revenue_uzs, cost: d.ai_cost_uzs } }))}
                bars={[
                  { key: 'revenue', label: 'Tushum', color: 'var(--ok)' },
                  { key: 'cost', label: 'AI xarajati', color: 'var(--danger)' }
                ]}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

/* ============================================================
   FOYDALANUVCHI STATISTIKASI (UserPanel modali uchun)
   ============================================================ */
export function UserStatsBlock({ api, userId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let off = false;
    setLoading(true);
    api(`/web/user/${userId}/stats`)
      .then((d) => { if (!off) { setData(d); setFailed(false); } })
      .catch(() => { if (!off) { setData(null); setFailed(true); } })
      .finally(() => { if (!off) setLoading(false); });
    return () => { off = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (loading) return <p className="muted">Statistika yuklanmoqda...</p>;
  if (failed || !data) return <p className="muted">Statistika topilmadi.</p>;

  const daily = Array.isArray(data.daily) ? data.daily : [];
  const cats = Array.isArray(data.top_categories) ? data.top_categories : [];
  const txs = Array.isArray(data.transactions) ? data.transactions : [];
  const orders = Array.isArray(data.orders) ? data.orders : [];
  const sum = (k) => daily.reduce((a, d) => a + (Number(d[k]) || 0), 0);

  return (
    <div>
      <StatCards items={[
        [null, 'Sessiyalar (30 kun)', fmtInt(sum('sessions'))],
        [null, 'Tokenlar (30 kun)', fmtInt(sum('tokens'))],
        [null, 'Tangalar (30 kun)', fmtInt(sum('coins_spent'))]
      ]} />

      <h4 style={{ margin: '4px 0 8px' }}>Oxirgi 30 kun</h4>
      <BarChart
        height={110}
        rows={daily.map((d) => ({ label: shortDate(d.date) || d.date, values: { sessions: d.sessions, coins: d.coins_spent } }))}
        bars={[
          { key: 'sessions', label: 'Sessiyalar', color: 'var(--accent)' },
          { key: 'coins', label: 'Sarflangan tangalar', color: 'var(--warn)' }
        ]}
      />

      <h4 style={{ margin: '18px 0 8px' }}>Eng ko'p ishlatgan bo'limlari</h4>
      <SimpleTable
        head={["Bo'lim", 'Sessiyalar']}
        rows={cats.map((c) => [c.name || c.category_id, fmtInt(c.sessions)])}
      />

      <h4 style={{ margin: '18px 0 8px' }}>Oxirgi tanga yozuvlari</h4>
      <SimpleTable
        head={['Vaqt', "O'zgarish", 'Sabab', 'Manba']}
        rows={txs.map((t) => [
          fmtDT(t.created_at),
          <b key="d" style={{ color: t.delta >= 0 ? 'var(--ok-text)' : 'var(--danger-text)' }}>
            {t.delta > 0 ? `+${t.delta}` : t.delta}
          </b>,
          t.reason || '—',
          t.source || '—'
        ])}
      />

      <h4 style={{ margin: '18px 0 8px' }}>Oxirgi buyurtmalar</h4>
      <SimpleTable
        head={['Tarif', 'Summa', 'Holat', "To'lov turi", "To'langan"]}
        rows={orders.map((o) => [
          o.tariff_name || '—',
          fmtUzs(o.amount),
          <Pill key="s" kind={String(o.status).toLowerCase() === 'paid' ? 'ok' : 'warn'}>{o.status || '—'}</Pill>,
          o.payment_type || '—',
          fmtDT(o.paid_at)
        ])}
      />
    </div>
  );
}
