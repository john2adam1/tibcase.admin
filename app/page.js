'use client';

import React, { useState, useEffect, useRef } from 'react';

const API_BASE = 'https://dev-medic.axadjonovsardorbek.uz';

export default function AdminApp() {
  const [token, setToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [role, setRole] = useState('');
  const [uid, setUid] = useState('');
  const [currentTab, setCurrentTab] = useState('dashboard');

  // Login form state
  const [loginInput, setLoginInput] = useState('medicai');
  const [passwordInput, setPasswordInput] = useState('1234');
  const [loginErr, setLoginErr] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, kind = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, kind }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, kind === 'err' ? 7000 : 4000);
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('ts_access');
    const savedRefresh = localStorage.getItem('ts_refresh');
    const savedRole = localStorage.getItem('ts_role');
    const savedUid = localStorage.getItem('ts_uid');

    if (savedToken) {
      setToken(savedToken);
      setRefreshToken(savedRefresh || '');
      setRole(savedRole || 'Admin');
      setUid(savedUid || '');
    }
  }, []);

  // Universal API caller with auto-refresh
  const api = async (path, { method = 'GET', body = null, isForm = false, query = null } = {}, retry = true) => {
    let url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
    if (query) {
      const qs = Object.entries(query)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
      if (qs) url += (url.includes('?') ? '&' : '?') + qs;
    }

    const headers = {
      'Accept-Language': 'uz'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let fetchBody = undefined;
    if (isForm) {
      fetchBody = body; // FormData (browser sets multipart boundary)
    } else if (body !== null && body !== undefined) {
      headers['Content-Type'] = 'application/json';
      fetchBody = JSON.stringify(body);
    }

    let res;
    try {
      res = await fetch(url, { method, headers, body: fetchBody });
    } catch (err) {
      addToast(`Tarmoq xatosi: ${err.message}`, 'err');
      throw err;
    }

    if (res.status === 401 && retry && refreshToken && path !== '/auth/token/refresh') {
      try {
        const refreshRes = await fetch(`${API_BASE}/auth/token/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken })
        });
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          if (refreshData?.access_token) {
            setToken(refreshData.access_token);
            if (refreshData.refresh_token) setRefreshToken(refreshData.refresh_token);
            localStorage.setItem('ts_access', refreshData.access_token);
            if (refreshData.refresh_token) localStorage.setItem('ts_refresh', refreshData.refresh_token);
            return api(path, { method, body, isForm, query }, false);
          }
        }
      } catch {
        // Refresh token failed
      }
      handleLogout();
      addToast("Sessiya tugagan, qaytadan kiring", "err");
      throw new Error("Session expired");
    }

    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      let msg = `Xatolik (${res.status})`;
      if (data && data.error && data.error.message) msg = data.error.message + (data.error.details ? ` — ${data.error.details}` : '');
      else if (data && data.message) msg = data.message;
      else if (typeof data === 'string' && data) msg = data;
      addToast(msg, 'err');
      throw new Error(msg);
    }

    return data;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginErr('');
    setLoggingIn(true);

    try {
      const res = await fetch(`${API_BASE}/web/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: loginInput, password: passwordInput })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLoginErr((data && data.error && data.error.message) || data.message || "Login yoki parol noto'g'ri");
        setLoggingIn(false);
        return;
      }

      setToken(data.access_token || '');
      setRefreshToken(data.refresh_token || '');
      setRole(data.role || 'Admin');
      setUid(data.id || '');

      localStorage.setItem('ts_access', data.access_token || '');
      localStorage.setItem('ts_refresh', data.refresh_token || '');
      localStorage.setItem('ts_role', data.role || 'Admin');
      localStorage.setItem('ts_uid', data.id || '');

      addToast("Tizimga muvaffaqiyatli kirildi", "ok");
    } catch (err) {
      setLoginErr(`Ulanib bo'lmadi: ${err.message}`);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ts_access');
    localStorage.removeItem('ts_refresh');
    localStorage.removeItem('ts_role');
    localStorage.removeItem('ts_uid');
    setToken('');
    setRefreshToken('');
    setRole('');
    setUid('');
  };

  if (!token) {
    return (
      <div id="loginScreen">
        <div className="loginBox">
          <h1>TibSphereAI Admin</h1>
          <p>Admin hisobi bilan tizimga kiring</p>
          {loginErr && <div id="loginErr">{loginErr}</div>}
          <form onSubmit={handleLogin}>
            <div className="field">
              <label>Login</label>
              <input
                type="text"
                required
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="medicai"
                autoFocus
              />
            </div>
            <div className="field">
              <label>Parol</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••"
              />
            </div>
            <button
              type="submit"
              className="primary"
              style={{ width: '100%', marginTop: '10px' }}
              disabled={loggingIn}
            >
              {loggingIn ? "Tekshirilmoqda..." : "Kirish"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div id="app">
      {/* Topbar */}
      <div id="topbar">
        <div className="brand">🩺 TibSphereAI Admin</div>
        <div className="right">
          <span>Rol: {role || '—'} · ID: {uid || '—'}</span>
          <button className="sm" onClick={handleLogout}>Chiqish</button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <div id="sidebar">
        <div className="grp">Umumiy</div>
        <button
          className={`nav ${currentTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentTab('dashboard')}
        >
          📊 Dashboard
        </button>

        <div className="grp">Kontent</div>
        <button
          className={`nav ${currentTab === 'banner' ? 'active' : ''}`}
          onClick={() => setCurrentTab('banner')}
        >
          🖼 Bannerlar
        </button>
        <button
          className={`nav ${currentTab === 'about' ? 'active' : ''}`}
          onClick={() => setCurrentTab('about')}
        >
          ℹ️ Biz haqimizda
        </button>
        <button
          className={`nav ${currentTab === 'faq' ? 'active' : ''}`}
          onClick={() => setCurrentTab('faq')}
        >
          ❓ FAQ
        </button>
        <button
          className={`nav ${currentTab === 'contact' ? 'active' : ''}`}
          onClick={() => setCurrentTab('contact')}
        >
          ☎️ Kontaktlar
        </button>
        <button
          className={`nav ${currentTab === 'partner' ? 'active' : ''}`}
          onClick={() => setCurrentTab('partner')}
        >
          🤝 Hamkorlar
        </button>
        <button
          className={`nav ${currentTab === 'app_route' ? 'active' : ''}`}
          onClick={() => setCurrentTab('app_route')}
        >
          🔗 App Route
        </button>

        <div className="grp">Ta'lim kontenti</div>
        <button
          className={`nav ${currentTab === 'category' ? 'active' : ''}`}
          onClick={() => setCurrentTab('category')}
        >
          📁 Bo'limlar
        </button>
        <button
          className={`nav ${currentTab === 'topic' ? 'active' : ''}`}
          onClick={() => setCurrentTab('topic')}
        >
          📑 Mavzular
        </button>
        <button
          className={`nav ${currentTab === 'case' ? 'active' : ''}`}
          onClick={() => setCurrentTab('case')}
        >
          🧠 Case'lar
        </button>
        <button
          className={`nav ${currentTab === 'level' ? 'active' : ''}`}
          onClick={() => setCurrentTab('level')}
        >
          🏅 Levellar
        </button>
        <button
          className={`nav ${currentTab === 'ai_prompt' ? 'active' : ''}`}
          onClick={() => setCurrentTab('ai_prompt')}
        >
          🤖 AI Promptlar
        </button>

        <div className="grp">Savdo</div>
        <button
          className={`nav ${currentTab === 'tariff' ? 'active' : ''}`}
          onClick={() => setCurrentTab('tariff')}
        >
          💳 Tariflar
        </button>
        <button
          className={`nav ${currentTab === 'order' ? 'active' : ''}`}
          onClick={() => setCurrentTab('order')}
        >
          🧾 Buyurtmalar
        </button>
        <button
          className={`nav ${currentTab === 'promocode' ? 'active' : ''}`}
          onClick={() => setCurrentTab('promocode')}
        >
          🎟 Promokodlar
        </button>
        <button
          className={`nav ${currentTab === 'coin_monitoring' ? 'active' : ''}`}
          onClick={() => setCurrentTab('coin_monitoring')}
        >
          🪙 Tangalar monitoringi
        </button>

        <div className="grp">Foydalanuvchilar</div>
        <button
          className={`nav ${currentTab === 'user' ? 'active' : ''}`}
          onClick={() => setCurrentTab('user')}
        >
          👤 Foydalanuvchilar
        </button>
        <button
          className={`nav ${currentTab === 'notification' ? 'active' : ''}`}
          onClick={() => setCurrentTab('notification')}
        >
          🔔 Bildirishnomalar
        </button>

        <div className="grp">Boshqaruv</div>
        <button
          className={`nav ${currentTab === 'admin' ? 'active' : ''}`}
          onClick={() => setCurrentTab('admin')}
        >
          🧑‍💼 Adminlar
        </button>
        <button
          className={`nav ${currentTab === 'my_profile' ? 'active' : ''}`}
          onClick={() => setCurrentTab('my_profile')}
        >
          👤 Mening profilim
        </button>
        <button
          className={`nav ${currentTab === 'role' ? 'active' : ''}`}
          onClick={() => setCurrentTab('role')}
        >
          🛡 Rollar
        </button>
        <button
          className={`nav ${currentTab === 'modules' ? 'active' : ''}`}
          onClick={() => setCurrentTab('modules')}
        >
          🧩 Panel modullari
        </button>
        <button
          className={`nav ${currentTab === 'accesses' ? 'active' : ''}`}
          onClick={() => setCurrentTab('accesses')}
        >
          🔐 Rol ruxsatlari
        </button>
        <button
          className={`nav ${currentTab === 'setting' ? 'active' : ''}`}
          onClick={() => setCurrentTab('setting')}
        >
          ⚙️ Sozlamalar
        </button>
      </div>

      {/* Main Area */}
      <div id="main">
        {currentTab === 'dashboard' && <DashboardPanel api={api} addToast={addToast} />}
        {currentTab === 'banner' && <GenericPanel key="banner" moduleKey="banner" api={api} addToast={addToast} />}
        {currentTab === 'about' && <GenericPanel key="about" moduleKey="about" api={api} addToast={addToast} />}
        {currentTab === 'faq' && <GenericPanel key="faq" moduleKey="faq" api={api} addToast={addToast} />}
        {currentTab === 'contact' && <GenericPanel key="contact" moduleKey="contact" api={api} addToast={addToast} />}
        {currentTab === 'partner' && <GenericPanel key="partner" moduleKey="partner" api={api} addToast={addToast} />}
        {currentTab === 'app_route' && <AppRoutePanel api={api} addToast={addToast} />}

        {currentTab === 'category' && <GenericPanel key="category" moduleKey="category" api={api} addToast={addToast} />}
        {currentTab === 'topic' && <GenericPanel key="topic" moduleKey="topic" api={api} addToast={addToast} />}
        {currentTab === 'case' && <CasePanel api={api} addToast={addToast} />}
        {currentTab === 'level' && <GenericPanel key="level" moduleKey="level" api={api} addToast={addToast} />}
        {currentTab === 'ai_prompt' && <AiPromptPanel api={api} addToast={addToast} />}

        {currentTab === 'tariff' && <GenericPanel key="tariff" moduleKey="tariff" api={api} addToast={addToast} />}
        {currentTab === 'order' && <OrderPanel api={api} addToast={addToast} />}
        {currentTab === 'promocode' && <GenericPanel key="promocode" moduleKey="promocode" api={api} addToast={addToast} />}
        {currentTab === 'coin_monitoring' && <CoinMonitoringPanel api={api} addToast={addToast} />}

        {currentTab === 'user' && <UserPanel api={api} addToast={addToast} />}
        {currentTab === 'notification' && <GenericPanel key="notification" moduleKey="notification" api={api} addToast={addToast} />}

        {currentTab === 'admin' && <GenericPanel key="admin" moduleKey="admin" api={api} addToast={addToast} />}
        {currentTab === 'my_profile' && <AdminProfilePanel api={api} addToast={addToast} />}
        {currentTab === 'role' && <GenericPanel key="role" moduleKey="role" api={api} addToast={addToast} />}
        {currentTab === 'modules' && <CustomPermissionPanel mode="modules" api={api} addToast={addToast} />}
        {currentTab === 'accesses' && <CustomPermissionPanel mode="accesses" api={api} addToast={addToast} />}
        {currentTab === 'setting' && <SettingsPanel api={api} addToast={addToast} />}
      </div>

      {/* Toasts Container */}
      <div id="toasts">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.kind}`}>{t.msg}</div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   HELPERS & OPTION CACHE
   ============================================================ */
function extractList(json) {
  if (Array.isArray(json)) return { items: json, count: json.length };
  if (json && typeof json === 'object') {
    if (Array.isArray(json.data)) {
      const count = typeof json.total === 'number' ? json.total : json.data.length;
      return { items: json.data, count };
    }
    for (const k of Object.keys(json)) {
      if (Array.isArray(json[k])) {
        const count = typeof json.total === 'number' ? json.total : (typeof json.count === 'number' ? json.count : json[k].length);
        return { items: json[k], count };
      }
    }
  }
  return { items: [], count: 0 };
}

function fmtCell(v) {
  if (v === null || v === undefined || v === '') return <span className="muted">—</span>;
  if (typeof v === 'boolean') return v ? '✅' : '⬜️';
  if (typeof v === 'object') {
    if (v.uz !== undefined || v.ru !== undefined || v.en !== undefined) {
      return v.uz || v.ru || v.en || '';
    }
    const s = JSON.stringify(v);
    return <code className="small" title={s}>{s.length > 50 ? `${s.slice(0, 50)}…` : s}</code>;
  }
  const s = String(v);
  return s.length > 100 ? `${s.slice(0, 100)}…` : s;
}

const REF_CACHE = {};
async function loadRefOptions(kind, api) {
  if (REF_CACHE[kind]) return REF_CACHE[kind];
  let items = [];
  try {
    if (kind === 'category') {
      const r = await api('/web/category', { query: { limit: 100, page: 1 } });
      items = extractList(r).items.map(x => ({ value: x.id, label: (x.name && (x.name.uz || x.name.ru || x.name.en)) || x.id }));
    } else if (kind === 'topic') {
      const r = await api('/web/topic', { query: { limit: 200, page: 1 } });
      items = extractList(r).items.map(x => ({ value: x.id, label: (x.name && (x.name.uz || x.name.ru || x.name.en)) || x.id }));
    } else if (kind === 'partner') {
      const r = await api('/web/partner', { query: { limit: 100, page: 1 } });
      items = extractList(r).items.map(x => ({ value: x.id, label: x.name || x.id }));
    } else if (kind === 'role') {
      const r = await api('/web/role', { query: { limit: 100, page: 1 } });
      items = extractList(r).items.map(x => ({ value: x.id, label: x.name || x.id }));
    } else if (kind === 'tariff') {
      const r = await api('/web/tariff');
      items = extractList(r).items.map(x => ({ value: x.id, label: x.name || x.id }));
    }
  } catch {
    items = [];
  }
  REF_CACHE[kind] = items;
  return items;
}
function invalidateRef(kind) {
  delete REF_CACHE[kind];
}

/* ============================================================
   FILE UPLOAD BUTTON
   ============================================================ */
function UploadButton({ onDone, api, addToast }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    setUploading(true);
    try {
      const res = await api('/web/file-upload', { method: 'POST', body: fd, isForm: true });
      const url = res.Url || res.url || '';
      onDone(url);
      addToast("Fayl muvaffaqiyatli yuklandi", "ok");
    } catch {
      // error handled by api
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <button
        type="button"
        className="sm"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? "⏳..." : "📤 Yuklash"}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
}

/* ============================================================
   DASHBOARD PANEL
   ============================================================ */
function DashboardPanel({ api }) {
  const [data, setData] = useState(null);
  const [type, setType] = useState('');
  const [day, setDay] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = async () => {
    try {
      const res = await api('/web/dashboard', { query: { type, day, from, to } });
      setData(res);
    } catch {
      // handled
    }
  };

  useEffect(() => {
    load();
  }, []);

  const items = [
    ["Bo'limlar", data?.categories],
    ["Case'lar", data?.cases],
    ["Foydalanuvchilar", data?.users],
    ["Faol foydalanuvchilar", data?.active_users],
    ["Faol obunalar", data?.active_subscriptions],
    ["Yakunlangan sessiyalar", data?.completed_sessions],
    ["AI xarajat (USD)", data?.ai_total_cost_usd]
  ];

  return (
    <div>
      <h2 className="pageTitle">Dashboard</h2>
      <p className="pageDesc">/web/dashboard</p>

      <div className="toolbar">
        <div className="field">
          <label>Turi</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">—</option>
            <option value="day">Kun</option>
            <option value="week">Hafta</option>
            <option value="month">Oy</option>
            <option value="year">Yil</option>
            <option value="range">Oraliq</option>
          </select>
        </div>
        <div className="field">
          <label>Kun</label>
          <input type="date" value={day} onChange={(e) => setDay(e.target.value)} />
        </div>
        <div className="field">
          <label>Dan</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="field">
          <label>Gacha</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <button className="primary" onClick={load}>Yangilash</button>
      </div>

      <div className="cards">
        {items.map(([l, v], idx) => (
          <div key={idx} className="card">
            <div className="v">{v ?? '—'}</div>
            <div className="l">{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   MODULE CONFIGS FOR GENERIC CRUD
   ============================================================ */
const MODULE_CONFIGS = {
  banner: {
    label: "Bannerlar",
    base: '/web/banner',
    columns: ['id', 'title', 'order_num', 'created_at'],
    search: [{ name: 'title', label: 'Sarlavha', type: 'text' }],
    fields: [
      { name: 'title', label: 'Sarlavha', type: 'ml', required: true },
      { name: 'description', label: 'Tavsif', type: 'ml', textarea: true },
      { name: 'image_url', label: 'Rasm URL (til bo\'yicha)', type: 'ml', upload: true },
      { name: 'link_url', label: 'Havola', type: 'text' },
      { name: 'order_num', label: 'Tartib raqami', type: 'number' }
    ]
  },
  about: {
    label: "Biz haqimizda",
    base: '/web/about',
    columns: ['id', 'title', 'order_num', 'created_at'],
    search: [{ name: 'title', label: 'Sarlavha', type: 'text' }],
    fields: [
      { name: 'title', label: 'Sarlavha', type: 'ml', required: true },
      { name: 'description', label: 'Tavsif', type: 'ml', textarea: true },
      { name: 'link_url', label: 'Havola', type: 'text' },
      { name: 'order_num', label: 'Tartib raqami', type: 'number' }
    ]
  },
  faq: {
    label: "FAQ",
    base: '/web/faq',
    columns: ['id', 'question', 'order_num', 'created_at'],
    search: [{ name: 'question', label: 'Savol', type: 'text' }],
    fields: [
      { name: 'question', label: 'Savol', type: 'ml', required: true },
      { name: 'answer', label: 'Javob', type: 'ml', textarea: true },
      { name: 'order_num', label: 'Tartib raqami', type: 'number' }
    ]
  },
  contact: {
    label: "Kontaktlar",
    base: '/web/contact',
    columns: ['id', 'name', 'phone_number', 'link_url', 'created_at'],
    search: [
      { name: 'name', label: 'Ism', type: 'text' },
      { name: 'phone_number', label: 'Telefon', type: 'text' }
    ],
    fields: [
      { name: 'name', label: 'Ism', type: 'text', required: true },
      { name: 'phone_number', label: 'Telefon raqam', type: 'text' },
      { name: 'link_url', label: 'Havola', type: 'text' }
    ]
  },
  partner: {
    label: "Hamkorlar",
    base: '/web/partner',
    columns: ['id', 'name', 'link_url', 'created_at'],
    search: [{ name: 'name', label: 'Nomi', type: 'text' }],
    fields: [
      { name: 'name', label: 'Nomi', type: 'text', required: true },
      { name: 'image_url', label: 'Rasm URL', type: 'file' },
      { name: 'link_url', label: 'Havola', type: 'text' },
      { name: 'description', label: 'Tavsif', type: 'ml', textarea: true }
    ],
    onSaved: () => invalidateRef('partner')
  },
  tariff: {
    label: "Tariflar",
    base: '/web/tariff',
    noPagination: true,
    columns: ['id', 'name', 'kind', 'duration', 'coins', 'price', 'created_at'],
    search: [
      { name: 'duration', label: 'Muddat (kun)', type: 'number' },
      { name: 'kind', label: 'Turi', type: 'select', includeEmpty: true, options: [{ value: 'subscription', label: 'Obuna' }, { value: 'coin_package', label: 'Tanga paketi' }] }
    ],
    fields: [
      { name: 'name', label: 'Nomi', type: 'text', required: true },
      { name: 'kind', label: 'Turi', type: 'select', options: [{ value: 'subscription', label: 'Obuna (Premium)' }, { value: 'coin_package', label: 'Tanga paketi' }] },
      { name: 'duration', label: 'Muddat (oy)', type: 'number', showIf: (v) => v.kind !== 'coin_package' },
      { name: 'coins', label: 'Tanga soni', type: 'number', showIf: (v) => v.kind === 'coin_package' },
      { name: 'price', label: 'Narx (so\'m)', type: 'number', step: '0.01' },
      { name: 'description', label: 'Tavsif', type: 'textarea' }
    ],
    onSaved: () => invalidateRef('tariff')
  },
  category: {
    label: "Bo'limlar (Category)",
    base: '/web/category',
    columns: ['id', 'name', 'audience', 'order_num', 'created_at'],
    search: [
      { name: 'name', label: 'Nomi', type: 'text' },
      { name: 'audience', label: 'Rejim', type: 'select', includeEmpty: true, options: [{ value: 'doctor', label: '👨‍⚕️ Shifokor' }, { value: 'citizen', label: '🚑 Aholi (Birinchi yordam)' }] }
    ],
    fields: [
      { name: 'name', label: 'Nomi', type: 'ml', required: true },
      { name: 'icon_url', label: 'Ikonka URL', type: 'file' },
      { name: 'audience', label: 'Rejim (Home ekran toggle)', type: 'select', options: [{ value: 'doctor', label: '👨‍⚕️ Shifokor' }, { value: 'citizen', label: '🚑 Aholi (Birinchi yordam)' }] },
      { name: 'order_num', label: 'Tartib raqami', type: 'number' }
    ],
    onSaved: () => invalidateRef('category')
  },
  topic: {
    label: "Mavzular (Topic)",
    base: '/web/topic',
    columns: ['id', 'category_id', 'name', 'order_num', 'created_at'],
    search: [
      { name: 'category_id', label: 'Bo\'lim', type: 'select', asyncOptions: 'category', includeEmpty: true }
    ],
    fields: [
      { name: 'category_id', label: 'Bo\'lim', type: 'select', asyncOptions: 'category', required: true },
      { name: 'name', label: 'Nomi', type: 'ml', required: true },
      { name: 'order_num', label: 'Tartib raqami', type: 'number' }
    ],
    onSaved: () => invalidateRef('topic')
  },
  promocode: {
    label: "Promokodlar",
    base: '/web/promocode',
    columns: ['id', 'code', 'partner_id', 'value', 'status', 'issued_at', 'expires_at'],
    search: [
      { name: 'partner_id', label: 'Hamkor', type: 'select', asyncOptions: 'partner', includeEmpty: true },
      { name: 'status', label: 'Status', type: 'select', includeEmpty: true, options: [{ value: 'active', label: 'Active' }, { value: 'used', label: 'Used' }, { value: 'expired', label: 'Expired' }] }
    ],
    fields: [
      { name: 'partner_id', label: 'Hamkor', type: 'select', asyncOptions: 'partner', required: true },
      { name: 'value', label: 'Qiymat (tanga)', type: 'number', required: true },
      { name: 'created_by', label: 'Yaratuvchi (admin ID)', type: 'text' },
      { name: 'expires_at', label: 'Amal qilish muddati (YYYY-MM-DD)', type: 'text' }
    ],
    canUpdate: false
  },
  admin: {
    label: "Adminlar",
    base: '/web/admin',
    columns: ['id', 'login', 'role_name', 'partner_name', 'created_at'],
    search: [{ name: 'login', label: 'Login', type: 'text' }],
    fields: [
      { name: 'login', label: 'Login', type: 'text', required: true },
      { name: 'password', label: 'Parol', type: 'password', required: true },
      { name: 'role_id', label: 'Rol', type: 'select', asyncOptions: 'role', includeEmpty: true },
      { name: 'partner_id', label: 'Hamkor (faqat "Hamkor Admin" uchun)', type: 'select', asyncOptions: 'partner', includeEmpty: true }
    ],
    updateFields: [
      { name: 'login', label: 'Login', type: 'text', required: true },
      { name: 'role_id', label: 'Rol', type: 'select', asyncOptions: 'role', includeEmpty: true },
      { name: 'partner_id', label: 'Hamkor (faqat "Hamkor Admin" uchun)', type: 'select', asyncOptions: 'partner', includeEmpty: true },
      { name: 'password', label: 'Yangi parol (bo\'sh qolsa o\'zgarmaydi)', type: 'password' }
    ]
  },
  role: {
    label: "Rollar",
    base: '/web/role',
    columns: ['id', 'name', 'slug', 'is_system', 'created_at'],
    search: [{ name: 'name', label: 'Nomi', type: 'text' }],
    fields: [
      { name: 'name', label: 'Nomi', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true }
    ],
    onSaved: () => invalidateRef('role')
  },
  level: {
    label: "Levellar",
    base: '/web/level',
    columns: ['id', 'level_number', 'slug', 'required_xp', 'title'],
    search: [],
    fields: [
      { name: 'level_number', label: 'Level raqami', type: 'number', required: true },
      { name: 'slug', label: 'Slug (o\'zgarmas kod)', type: 'text', required: true },
      { name: 'required_xp', label: 'Kerakli XP', type: 'number' },
      { name: 'title', label: 'Sarlavha', type: 'text' },
      { name: 'badge_image_url', label: 'Belgi rasmi (URL)', type: 'file' }
    ]
  },
  notification: {
    label: "Bildirishnomalar",
    base: '/web/notification',
    columns: ['id', 'title', 'type', 'created_at'],
    search: [{ name: 'title', label: 'Sarlavha', type: 'text' }],
    fields: [
      { name: 'title', label: 'Sarlavha', type: 'ml', required: true },
      { name: 'message', label: 'Matn', type: 'ml', textarea: true },
      { name: 'type', label: 'Turi', type: 'select', options: [{ value: 'all', label: 'Hammaga (all)' }, { value: 'selected', label: 'Tanlangan foydalanuvchi (selected)' }] },
      { name: 'user_id', label: 'Foydalanuvchi ID (type=selected bo\'lsa)', type: 'text' }
    ],
    updateFields: [
      { name: 'title', label: 'Sarlavha', type: 'ml', required: true },
      { name: 'message', label: 'Matn', type: 'ml', textarea: true }
    ]
  }
};

/* ============================================================
   GENERIC CRUD PANEL
   ============================================================ */
function GenericPanel({ moduleKey, api, addToast }) {
  const cfg = MODULE_CONFIGS[moduleKey];
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({});

  // Dynamic async options cache for search and modal fields
  const [asyncOpts, setAsyncOpts] = useState({});

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [formValues, setFormValues] = useState({});

  useEffect(() => {
    // Preload async options for this module
    const kinds = new Set();
    cfg.search.forEach(s => { if (s.asyncOptions) kinds.add(s.asyncOptions); });
    (cfg.fields || []).forEach(f => { if (f.asyncOptions) kinds.add(f.asyncOptions); });
    (cfg.updateFields || []).forEach(f => { if (f.asyncOptions) kinds.add(f.asyncOptions); });

    kinds.forEach(async (kind) => {
      const opts = await loadRefOptions(kind, api);
      setAsyncOpts(prev => ({ ...prev, [kind]: opts }));
    });
  }, [moduleKey]);

  const load = async () => {
    setLoading(true);
    const query = { ...filters };
    if (!cfg.noPagination) {
      query.page = page;
      query.limit = limit;
    }
    try {
      const res = await api(cfg.base, { query });
      const extracted = extractList(res);
      setItems(extracted.items);
      setCount(extracted.count);
    } catch {
      setItems([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, limit, moduleKey]);

  const handleOpenCreate = () => {
    setEditItem(null);
    setModalTitle(`Yangi: ${cfg.label}`);
    setFormValues({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (row) => {
    setEditItem(row);
    setModalTitle(`Tahrirlash: ${cfg.label}`);
    setFormValues(row);
    setIsModalOpen(true);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Rostdan o'chirilsinmi? ID: ${row.id}`)) return;
    try {
      await api(`${cfg.base}/${row.id}/delete`, { method: 'DELETE' });
      addToast("O'chirildi", "ok");
      if (cfg.onSaved) cfg.onSaved();
      load();
    } catch {
      // handled
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem?.id) {
        await api(`${cfg.base}/${editItem.id}/update`, { method: 'PUT', body: formValues });
        addToast("Saqlandi", "ok");
      } else {
        await api(cfg.base, { method: 'POST', body: formValues });
        addToast("Yaratildi", "ok");
      }
      if (cfg.onSaved) cfg.onSaved();
      setIsModalOpen(false);
      load();
    } catch {
      // handled
    }
  };

  const totalPages = Math.max(1, Math.ceil((count || items.length) / limit));
  const activeFields = editItem ? (cfg.updateFields || cfg.fields) : cfg.fields;

  return (
    <div>
      <h2 className="pageTitle">{cfg.label}</h2>
      <p className="pageDesc">{cfg.base}</p>

      {/* Toolbar */}
      <div className="toolbar">
        {cfg.search.map(sf => {
          const opts = sf.options || (sf.asyncOptions ? asyncOpts[sf.asyncOptions] || [] : []);
          return (
            <div key={sf.name} className="field">
              <label>{sf.label}</label>
              {sf.type === 'select' ? (
                <select
                  value={filters[sf.name] || ''}
                  onChange={(e) => setFilters({ ...filters, [sf.name]: e.target.value })}
                >
                  <option value="">— barchasi —</option>
                  {opts.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={sf.type === 'number' ? 'number' : 'text'}
                  value={filters[sf.name] || ''}
                  onChange={(e) => setFilters({ ...filters, [sf.name]: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); load(); } }}
                />
              )}
            </div>
          );
        })}

        {cfg.search.length > 0 && (
          <button onClick={() => { setPage(1); load(); }}>🔍 Qidirish</button>
        )}

        {cfg.canCreate !== false && (
          <button className="primary" onClick={handleOpenCreate}>+ Yangi</button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <p className="muted">Yuklanmoqda...</p>
      ) : items.length === 0 ? (
        <p className="muted">Ma'lumot topilmadi.</p>
      ) : (
        <table>
          <thead>
            <tr>
              {cfg.columns.map(c => <th key={c}>{c}</th>)}
              <th>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, idx) => (
              <tr key={row.id || idx}>
                {cfg.columns.map(c => (
                  <td key={c}>{fmtCell(row[c])}</td>
                ))}
                <td>
                  <div className="actions">
                    {cfg.canUpdate !== false && (
                      <button className="sm" onClick={() => handleOpenEdit(row)}>✏️ Tahrir</button>
                    )}
                    {cfg.canDelete !== false && (
                      <button className="sm danger" onClick={() => handleDelete(row)}>🗑 O'chirish</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pager */}
      {!cfg.noPagination && (
        <div className="pager">
          <button className="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Oldingi</button>
          <span>Sahifa {page} / {totalPages} — jami: {count}</span>
          <button className="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Keyingi →</button>
          <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} style={{ width: 'auto' }}>
            {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}/sahifa</option>)}
          </select>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modalOverlay" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="modal">
            <h3>{modalTitle}</h3>
            <form onSubmit={handleModalSubmit}>
              <div className="formGrid">
                {activeFields.map(f => {
                  if (f.showIf && !f.showIf(formValues)) return null;
                  const opts = f.options || (f.asyncOptions ? asyncOpts[f.asyncOptions] || [] : []);

                  return (
                    <div key={f.name} className={`field ${f.type === 'ml' || f.type === 'textarea' || f.full ? 'full' : ''}`}>
                      <label>{f.label} {f.required && '*'}</label>
                      {f.type === 'ml' ? (
                        <div>
                          <div className="mlWrap">
                            {['uz', 'ru', 'en'].map(l => (
                              <div key={l}>
                                <div className="lang">{l.toUpperCase()}</div>
                                {f.textarea ? (
                                  <textarea
                                    value={formValues[f.name]?.[l] || ''}
                                    onChange={(e) => {
                                      const cur = formValues[f.name] || {};
                                      setFormValues({ ...formValues, [f.name]: { ...cur, [l]: e.target.value } });
                                    }}
                                  />
                                ) : (
                                  <input
                                    type="text"
                                    value={formValues[f.name]?.[l] || ''}
                                    onChange={(e) => {
                                      const cur = formValues[f.name] || {};
                                      setFormValues({ ...formValues, [f.name]: { ...cur, [l]: e.target.value } });
                                    }}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                          {f.upload && (
                            <div style={{ marginTop: '6px' }}>
                              <UploadButton
                                api={api}
                                addToast={addToast}
                                onDone={(url) => {
                                  setFormValues({
                                    ...formValues,
                                    [f.name]: { uz: url, ru: url, en: url }
                                  });
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ) : f.type === 'textarea' ? (
                        <textarea
                          rows={3}
                          value={formValues[f.name] || ''}
                          onChange={(e) => setFormValues({ ...formValues, [f.name]: e.target.value })}
                        />
                      ) : f.type === 'file' ? (
                        <div className="rowInline">
                          <input
                            type="text"
                            value={formValues[f.name] || ''}
                            onChange={(e) => setFormValues({ ...formValues, [f.name]: e.target.value })}
                          />
                          <UploadButton
                            api={api}
                            addToast={addToast}
                            onDone={(url) => setFormValues({ ...formValues, [f.name]: url })}
                          />
                        </div>
                      ) : f.type === 'select' ? (
                        <select
                          value={formValues[f.name] !== undefined ? formValues[f.name] : (opts[0]?.value || '')}
                          onChange={(e) => setFormValues({ ...formValues, [f.name]: e.target.value })}
                        >
                          {f.includeEmpty && <option value="">— tanlang —</option>}
                          {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      ) : (
                        <input
                          type={f.type === 'number' ? 'number' : f.type === 'password' ? 'password' : 'text'}
                          step={f.step}
                          value={formValues[f.name] !== undefined ? formValues[f.name] : ''}
                          onChange={(e) => setFormValues({
                            ...formValues,
                            [f.name]: f.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value
                          })}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="modalFooter">
                <button type="button" onClick={() => setIsModalOpen(false)}>Bekor qilish</button>
                <button type="submit" className="primary">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   CLINICAL CASES PANEL
   ============================================================ */
function CasePanel({ api, addToast }) {
  const [cases, setCases] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({ search: '', topic_id: '', category_id: '', difficulty: '', status: '' });

  // Topic and category options
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);

  // AI Gen modal
  const [isAiGenOpen, setIsAiGenOpen] = useState(false);
  const [aiGenTopic, setAiGenTopic] = useState('');
  const [aiGenDiff, setAiGenDiff] = useState('medium');
  const [aiGenComplaint, setAiGenComplaint] = useState('');
  const [aiGenAnswer, setAiGenAnswer] = useState('');
  const [generating, setGenerating] = useState(false);

  // Info modal (for test patient / debrief)
  const [infoModal, setInfoModal] = useState(null);

  // Create / Edit Case modal
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [caseForm, setCaseForm] = useState({
    topic_id: '',
    title: { uz: '', ru: '', en: '' },
    subtitle: { uz: '', ru: '', en: '' },
    chief_complaint: { uz: '', ru: '', en: '' },
    expected_answer: '',
    cover_image_url: '',
    difficulty: 'medium',
    patient_age: 35,
    patient_gender: 'male',
    expected_duration_minutes: 15,
    visual_state: '',
    initial_vitals: { hr: 80, bp: '120/80', spo2: 98, rr: 16, temp: 36.6, gcs: 15 },
    scenario: '{}',
    order_num: 1
  });

  const loadRefs = async () => {
    const t = await loadRefOptions('topic', api);
    const c = await loadRefOptions('category', api);
    setTopics(t);
    setCategories(c);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await api('/web/case', { query: { ...filters, page, limit } });
      const extracted = extractList(res);
      setCases(extracted.items);
      setCount(extracted.count);
    } catch {
      setCases([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRefs();
  }, []);

  useEffect(() => {
    load();
  }, [page, limit]);

  const handlePublish = async (id) => {
    try {
      await api(`/web/case/${id}/publish`, { method: 'PUT' });
      addToast("Case published", "ok");
      load();
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Rostdan o'chirilsinmi?")) return;
    try {
      await api(`/web/case/${id}/delete`, { method: 'DELETE' });
      addToast("O'chirildi", "ok");
      load();
    } catch {}
  };

  const handleAiGenSubmit = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      await api('/web/case/ai-generate', {
        method: 'POST',
        body: {
          topic: aiGenTopic,
          difficulty: aiGenDiff,
          chief_complaint: aiGenComplaint,
          expected_answer: aiGenAnswer
        }
      });
      addToast("AI case qoralamasi yaratildi (draft) — ro'yxatdan ko'rib chiqing", "ok");
      setIsAiGenOpen(false);
      load();
    } catch {}
    finally {
      setGenerating(false);
    }
  };

  const handleTestPatient = async (c) => {
    const q = window.prompt("Shifokor savoli:", "Sizni qayerda og'riq bezovta qilyapti?");
    if (!q) return;
    try {
      const res = await api('/web/ai-prompt/test-patient', {
        method: 'POST',
        body: { case_id: c.id, question: q }
      });
      const html = res.is_action
        ? `${res.is_correct ? '✅ To\'g\'ri' : '⚠️ Xato'} (sog'liq: ${res.health_delta > 0 ? '+' : ''}${res.health_delta}%) - ${res.feedback || ''}`
        : res.reply || '';
      setInfoModal({
        title: `Bemor AI: ${c.title?.uz || c.id}`,
        content: (
          <div>
            <p style={{ marginBottom: '10px', fontSize: '13px' }}>{html}</p>
            <p className="muted" style={{ fontSize: '11px' }}>
              🔢 Tokenlar: {res.tokens || 0} | 💵 Xarajat: ${Number(res.cost_usd || 0).toFixed(6)}
            </p>
          </div>
        )
      });
    } catch {}
  };

  const handleTestDebrief = async (c) => {
    const sampleEvents = [
      { type: 'question', payload: { question: 'Qayerda og\'riq bor?' } },
      { type: 'medication', payload: { name: 'Aspirin', dose: '300mg', route: 'oral' } }
    ];
    try {
      const res = await api('/web/ai-prompt/test-debrief', {
        method: 'POST',
        body: { case_id: c.id, events: sampleEvents }
      });
      const rep = res.report || {};
      setInfoModal({
        title: `Debrief AI: ${c.title?.uz || c.id}`,
        content: (
          <div>
            <p style={{ marginBottom: '6px' }}><b>To'g'ri qadamlar:</b> {(rep.correct_steps || []).join(', ') || '—'}</p>
            <p style={{ marginBottom: '6px' }}><b>Noto'g'ri qadamlar:</b> {(rep.incorrect_steps || []).join(', ') || '—'}</p>
            <p style={{ marginBottom: '6px' }}><b>Qo'llanma izohi:</b> {rep.guideline_notes || '—'}</p>
            <p style={{ marginBottom: '10px' }}><b>Zaif mavzular:</b> {(rep.weak_topics || []).join(', ') || '—'}</p>
            <p className="muted" style={{ fontSize: '11px' }}>
              🔢 Tokenlar: {res.tokens || 0} | 💵 Xarajat: ${Number(res.cost_usd || 0).toFixed(6)}
            </p>
          </div>
        )
      });
    } catch {}
  };

  const handleOpenCreateCase = () => {
    setEditingCase(null);
    setCaseForm({
      topic_id: topics[0]?.value || '',
      title: { uz: '', ru: '', en: '' },
      subtitle: { uz: '', ru: '', en: '' },
      chief_complaint: { uz: '', ru: '', en: '' },
      expected_answer: '',
      cover_image_url: '',
      difficulty: 'medium',
      patient_age: 35,
      patient_gender: 'male',
      expected_duration_minutes: 15,
      visual_state: '',
      initial_vitals: { hr: 80, bp: '120/80', spo2: 98, rr: 16, temp: 36.6, gcs: 15 },
      scenario: '{}',
      order_num: 1
    });
    setIsCaseModalOpen(true);
  };

  const handleOpenEditCase = async (c) => {
    setEditingCase(c);
    let full = c;
    try {
      full = await api(`/web/case/${c.id}`);
    } catch {}
    setCaseForm({
      topic_id: full.topic_id || topics[0]?.value || '',
      title: full.title || { uz: '', ru: '', en: '' },
      subtitle: full.subtitle || { uz: '', ru: '', en: '' },
      chief_complaint: full.chief_complaint || { uz: '', ru: '', en: '' },
      expected_answer: full.expected_answer || '',
      cover_image_url: full.cover_image_url || '',
      difficulty: full.difficulty || 'medium',
      patient_age: full.patient_age ?? 35,
      patient_gender: full.patient_gender || 'male',
      expected_duration_minutes: full.expected_duration_minutes ?? 15,
      visual_state: full.visual_state || '',
      initial_vitals: full.initial_vitals || { hr: 80, bp: '120/80', spo2: 98, rr: 16, temp: 36.6, gcs: 15 },
      scenario: typeof full.scenario === 'object' ? JSON.stringify(full.scenario, null, 2) : (full.scenario || '{}'),
      order_num: full.order_num ?? 1
    });
    setIsCaseModalOpen(true);
  };

  const handleSaveCase = async (e) => {
    e.preventDefault();
    let parsedScenario = {};
    try {
      parsedScenario = JSON.parse(caseForm.scenario || '{}');
    } catch {
      addToast("Scenario — JSON formati noto'g'ri", "err");
      return;
    }

    const payload = {
      ...caseForm,
      scenario: parsedScenario,
      patient_age: Number(caseForm.patient_age) || 0,
      expected_duration_minutes: Number(caseForm.expected_duration_minutes) || 0,
      order_num: Number(caseForm.order_num) || 0
    };

    try {
      if (editingCase?.id) {
        await api(`/web/case/${editingCase.id}/update`, { method: 'PUT', body: payload });
        addToast("Case saqlandi", "ok");
      } else {
        await api('/web/case', { method: 'POST', body: payload });
        addToast("Case yaratildi", "ok");
      }
      setIsCaseModalOpen(false);
      load();
    } catch {}
  };

  const totalPages = Math.max(1, Math.ceil((count || cases.length) / limit));

  return (
    <div>
      <h2 className="pageTitle">Klinik Case'lar</h2>
      <p className="pageDesc">/web/case</p>

      <div className="toolbar">
        <div className="field">
          <label>Mavzu</label>
          <select
            value={filters.topic_id}
            onChange={(e) => setFilters({ ...filters, topic_id: e.target.value })}
          >
            <option value="">— hammasi —</option>
            {topics.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Bo'lim</label>
          <select
            value={filters.category_id}
            onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
          >
            <option value="">— hammasi —</option>
            {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Qiyinlik</label>
          <select
            value={filters.difficulty}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
          >
            <option value="">— barchasi —</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div className="field">
          <label>Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">— barchasi —</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="field">
          <label>Qidiruv</label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); load(); } }}
          />
        </div>
        <button onClick={() => { setPage(1); load(); }}>🔍 Qidirish</button>
        <button className="primary" onClick={handleOpenCreateCase}>+ Yangi</button>
        <button className="primary" onClick={() => setIsAiGenOpen(true)}>🤖 AI bilan yaratish</button>
      </div>

      {loading ? (
        <p className="muted">Yuklanmoqda...</p>
      ) : cases.length === 0 ? (
        <p className="muted">Klinik case'lar topilmadi.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Sarlavha</th>
              <th>Qiyinlik</th>
              <th>Status</th>
              <th>Yoshi</th>
              <th>Yaratildi</th>
              <th>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {cases.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{fmtCell(c.title)}</td>
                <td><span className="pill">{c.difficulty}</span></td>
                <td>
                  <span className={`pill ${c.status === 'published' ? 'ok' : ''}`}>
                    {c.status}
                  </span>
                </td>
                <td>{c.patient_age ?? '—'}</td>
                <td>{fmtCell(c.created_at)}</td>
                <td>
                  <div className="actions">
                    <button className="sm" onClick={() => handleOpenEditCase(c)}>✏️ Tahrir</button>
                    {c.status !== 'published' && (
                      <button className="sm ok" onClick={() => handlePublish(c.id)}>Publish</button>
                    )}
                    <button className="sm" onClick={() => handleTestPatient(c)}>🧪 Bemor AI</button>
                    <button className="sm" onClick={() => handleTestDebrief(c)}>🧪 Debrief AI</button>
                    <button className="sm danger" onClick={() => handleDelete(c.id)}>🗑 O'chirish</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="pager">
        <button className="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Oldingi</button>
        <span>Sahifa {page} / {totalPages} — jami: {count}</span>
        <button className="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Keyingi →</button>
        <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} style={{ width: 'auto' }}>
          {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}/sahifa</option>)}
        </select>
      </div>

      {/* Info modal for AI results */}
      {infoModal && (
        <div className="modalOverlay" onClick={() => setInfoModal(null)}>
          <div className="modal">
            <h3>{infoModal.title}</h3>
            {infoModal.content}
            <div className="modalFooter">
              <button className="primary" onClick={() => setInfoModal(null)}>Yopish</button>
            </div>
          </div>
        </div>
      )}

      {/* AI Gen Modal */}
      {isAiGenOpen && (
        <div className="modalOverlay" onClick={(e) => { if (e.target === e.currentTarget) setIsAiGenOpen(false); }}>
          <div className="modal">
            <h3>AI yordamida case generatsiyasi</h3>
            <form onSubmit={handleAiGenSubmit}>
              <div className="field">
                <label>Mavzu (matn) *</label>
                <input
                  type="text"
                  required
                  value={aiGenTopic}
                  onChange={(e) => setAiGenTopic(e.target.value)}
                  placeholder="Masalan: O'tkir appenditsit"
                />
              </div>
              <div className="field">
                <label>Qiyinlik</label>
                <select value={aiGenDiff} onChange={(e) => setAiGenDiff(e.target.value)}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="field">
                <label>Bemor shikoyati (ixtiyoriy)</label>
                <textarea
                  rows={3}
                  value={aiGenComplaint}
                  onChange={(e) => setAiGenComplaint(e.target.value)}
                  placeholder="Bemor nimadan shikoyat qilmoqda..."
                />
              </div>
              <div className="field">
                <label>To'g'ri javob/tashxis (ixtiyoriy)</label>
                <textarea
                  rows={2}
                  value={aiGenAnswer}
                  onChange={(e) => setAiGenAnswer(e.target.value)}
                  placeholder="Masalan: O'tkir appenditsit, flegmonoz bosqich"
                />
              </div>
              <div className="modalFooter">
                <button type="button" onClick={() => setIsAiGenOpen(false)}>Bekor qilish</button>
                <button type="submit" className="primary" disabled={generating}>
                  {generating ? "Yaratilmoqda..." : "Yaratish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Case Modal */}
      {isCaseModalOpen && (
        <div className="modalOverlay" onClick={(e) => { if (e.target === e.currentTarget) setIsCaseModalOpen(false); }}>
          <div className="modal" style={{ width: '700px' }}>
            <h3>{editingCase ? "Case tahrirlash" : "Yangi Case"}</h3>
            <form onSubmit={handleSaveCase}>
              <div className="formGrid">
                <div className="field full">
                  <label>Mavzu (Topic) *</label>
                  <select
                    value={caseForm.topic_id}
                    onChange={(e) => setCaseForm({ ...caseForm, topic_id: e.target.value })}
                    required
                  >
                    <option value="">— mavzuni tanlang —</option>
                    {topics.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>

                <div className="field full">
                  <label>Sarlavha *</label>
                  <div className="mlWrap">
                    {['uz', 'ru', 'en'].map(l => (
                      <div key={l}>
                        <div className="lang">{l.toUpperCase()}</div>
                        <input
                          type="text"
                          required={l === 'uz'}
                          value={caseForm.title?.[l] || ''}
                          onChange={(e) => setCaseForm({
                            ...caseForm,
                            title: { ...caseForm.title, [l]: e.target.value }
                          })}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="field full">
                  <label>Kichik sarlavha (subtitle)</label>
                  <div className="mlWrap">
                    {['uz', 'ru', 'en'].map(l => (
                      <div key={l}>
                        <div className="lang">{l.toUpperCase()}</div>
                        <input
                          type="text"
                          value={caseForm.subtitle?.[l] || ''}
                          onChange={(e) => setCaseForm({
                            ...caseForm,
                            subtitle: { ...caseForm.subtitle, [l]: e.target.value }
                          })}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="field full">
                  <label>Chief complaint (shikoyat)</label>
                  <div className="mlWrap">
                    {['uz', 'ru', 'en'].map(l => (
                      <div key={l}>
                        <div className="lang">{l.toUpperCase()}</div>
                        <textarea
                          rows={2}
                          value={caseForm.chief_complaint?.[l] || ''}
                          onChange={(e) => setCaseForm({
                            ...caseForm,
                            chief_complaint: { ...caseForm.chief_complaint, [l]: e.target.value }
                          })}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="field full">
                  <label>Kutilgan javob</label>
                  <textarea
                    rows={2}
                    value={caseForm.expected_answer || ''}
                    onChange={(e) => setCaseForm({ ...caseForm, expected_answer: e.target.value })}
                  />
                </div>

                <div className="field">
                  <label>Qiyinlik</label>
                  <select
                    value={caseForm.difficulty}
                    onChange={(e) => setCaseForm({ ...caseForm, difficulty: e.target.value })}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="field">
                  <label>Bemor yoshi</label>
                  <input
                    type="number"
                    value={caseForm.patient_age}
                    onChange={(e) => setCaseForm({ ...caseForm, patient_age: e.target.value })}
                  />
                </div>

                <div className="field">
                  <label>Bemor jinsi</label>
                  <select
                    value={caseForm.patient_gender}
                    onChange={(e) => setCaseForm({ ...caseForm, patient_gender: e.target.value })}
                  >
                    <option value="male">Erkak</option>
                    <option value="female">Ayol</option>
                  </select>
                </div>

                <div className="field">
                  <label>Kutilgan davomiylik (min)</label>
                  <input
                    type="number"
                    value={caseForm.expected_duration_minutes}
                    onChange={(e) => setCaseForm({ ...caseForm, expected_duration_minutes: e.target.value })}
                  />
                </div>

                <div className="field full">
                  <label>Muqova rasm URL</label>
                  <div className="rowInline">
                    <input
                      type="text"
                      value={caseForm.cover_image_url || ''}
                      onChange={(e) => setCaseForm({ ...caseForm, cover_image_url: e.target.value })}
                    />
                    <UploadButton
                      api={api}
                      addToast={addToast}
                      onDone={(url) => setCaseForm({ ...caseForm, cover_image_url: url })}
                    />
                  </div>
                </div>

                <div className="field">
                  <label>Vitals: HR</label>
                  <input
                    type="number"
                    value={caseForm.initial_vitals?.hr || 80}
                    onChange={(e) => setCaseForm({
                      ...caseForm,
                      initial_vitals: { ...caseForm.initial_vitals, hr: Number(e.target.value) }
                    })}
                  />
                </div>
                <div className="field">
                  <label>Vitals: BP</label>
                  <input
                    type="text"
                    value={caseForm.initial_vitals?.bp || '120/80'}
                    onChange={(e) => setCaseForm({
                      ...caseForm,
                      initial_vitals: { ...caseForm.initial_vitals, bp: e.target.value }
                    })}
                  />
                </div>
                <div className="field">
                  <label>Vitals: SpO2</label>
                  <input
                    type="number"
                    value={caseForm.initial_vitals?.spo2 || 98}
                    onChange={(e) => setCaseForm({
                      ...caseForm,
                      initial_vitals: { ...caseForm.initial_vitals, spo2: Number(e.target.value) }
                    })}
                  />
                </div>
                <div className="field">
                  <label>Vitals: RR</label>
                  <input
                    type="number"
                    value={caseForm.initial_vitals?.rr || 16}
                    onChange={(e) => setCaseForm({
                      ...caseForm,
                      initial_vitals: { ...caseForm.initial_vitals, rr: Number(e.target.value) }
                    })}
                  />
                </div>

                <div className="field full">
                  <label>Scenario (JSON)</label>
                  <textarea
                    rows={6}
                    value={caseForm.scenario}
                    onChange={(e) => setCaseForm({ ...caseForm, scenario: e.target.value })}
                  />
                </div>
              </div>

              <div className="modalFooter">
                <button type="button" onClick={() => setIsCaseModalOpen(false)}>Bekor qilish</button>
                <button type="submit" className="primary">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   USER PANEL
   ============================================================ */
function UserPanel({ api, addToast }) {
  const [users, setUsers] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({ name: '', email: '', phone_number: '' });
  const [selectedUser, setSelectedUser] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api('/web/user', { query: { ...filters, limit, page } });
      const extracted = extractList(res);
      setUsers(extracted.items);
      setCount(extracted.count);
    } catch {
      setUsers([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, limit]);

  const handleDelete = async (u) => {
    if (!window.confirm(`Foydalanuvchi o'chirilsinmi? ID: ${u.id}`)) return;
    try {
      await api(`/web/user/${u.id}/delete`, { method: 'DELETE' });
      addToast("O'chirildi", "ok");
      load();
    } catch {}
  };

  const totalPages = Math.max(1, Math.ceil((count || users.length) / limit));

  return (
    <div>
      <h2 className="pageTitle">Foydalanuvchilar</h2>
      <p className="pageDesc">/web/user — mobil ilova foydalanuvchilari (faqat ko'rish/o'chirish)</p>

      <div className="toolbar">
        <div className="field">
          <label>Ism</label>
          <input
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            placeholder="Ism"
          />
        </div>
        <div className="field">
          <label>Email</label>
          <input
            value={filters.email}
            onChange={(e) => setFilters({ ...filters, email: e.target.value })}
            placeholder="Email"
          />
        </div>
        <div className="field">
          <label>Telefon</label>
          <input
            value={filters.phone_number}
            onChange={(e) => setFilters({ ...filters, phone_number: e.target.value })}
            placeholder="Telefon"
          />
        </div>
        <button onClick={() => { setPage(1); load(); }}>🔍 Qidirish</button>
      </div>

      {loading ? (
        <p className="muted">Yuklanmoqda...</p>
      ) : users.length === 0 ? (
        <p className="muted">Foydalanuvchilar topilmadi.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Ism</th>
              <th>Telefon</th>
              <th>Email</th>
              <th>Level</th>
              <th>XP</th>
              <th>Coins</th>
              <th>Ro'yxatdan o'tgan</th>
              <th>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{fmtCell(u.id)}</td>
                <td>{fmtCell(u.name)}</td>
                <td>{fmtCell(u.phone_number)}</td>
                <td>{fmtCell(u.email)}</td>
                <td>{fmtCell(u.level)}</td>
                <td>{fmtCell(u.xp)}</td>
                <td>{fmtCell(u.coins)}</td>
                <td>{fmtCell(u.created_at)}</td>
                <td>
                  <div className="actions">
                    <button className="sm" onClick={async () => {
                      try {
                        const full = await api(`/web/user/${u.id}`);
                        setSelectedUser(full);
                      } catch {}
                    }}>👁 Ko'rish</button>
                    <button className="sm danger" onClick={() => handleDelete(u)}>🗑 O'chirish</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="pager">
        <button className="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Oldingi</button>
        <span>Sahifa {page} / {totalPages} — jami: {count}</span>
        <button className="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Keyingi →</button>
      </div>

      {selectedUser && (
        <div className="modalOverlay" onClick={() => setSelectedUser(null)}>
          <div className="modal">
            <h3>Foydalanuvchi ma'lumotlari: {selectedUser.id}</h3>
            <textarea
              readOnly
              rows={14}
              value={JSON.stringify(selectedUser, null, 2)}
              style={{ fontFamily: 'monospace', fontSize: '12px' }}
            />
            <div className="modalFooter">
              <button className="primary" onClick={() => setSelectedUser(null)}>Yopish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ORDER PANEL
   ============================================================ */
function OrderPanel({ api }) {
  const [orders, setOrders] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState('');
  const [userId, setUserId] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api('/web/order', { query: { status, user_id: userId, limit, page } });
      const extracted = extractList(res);
      setOrders(extracted.items);
      setCount(extracted.count);
    } catch {
      setOrders([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, limit]);

  const totalPages = Math.max(1, Math.ceil((count || orders.length) / limit));

  return (
    <div>
      <h2 className="pageTitle">Buyurtmalar (Obunalar)</h2>
      <p className="pageDesc">/web/order — faqat ko'rish</p>

      <div className="toolbar">
        <div className="field">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">— barchasi —</option>
            <option value="NEW">NEW</option>
            <option value="PAID">PAID</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="RESERVED">RESERVED</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
        </div>
        <div className="field">
          <label>User ID</label>
          <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID" />
        </div>
        <button onClick={() => { setPage(1); load(); }}>🔍 Qidirish</button>
      </div>

      {loading ? (
        <p className="muted">Yuklanmoqda...</p>
      ) : orders.length === 0 ? (
        <p className="muted">Buyurtmalar topilmadi.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Foydalanuvchi</th>
              <th>Tarif</th>
              <th>Summa</th>
              <th>Tanga</th>
              <th>Turi</th>
              <th>Status</th>
              <th>Yaratildi</th>
              <th>To'landi</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td>{fmtCell(o.id)}</td>
                <td>
                  {fmtCell(o.user_name || o.user_id)}
                  <br />
                  <span className="muted">{fmtCell(o.user_phone)}</span>
                </td>
                <td>{fmtCell(o.tariff_name)}</td>
                <td>{fmtCell(o.amount)}</td>
                <td>{fmtCell(o.coins_used)}</td>
                <td>{fmtCell(o.payment_type)}</td>
                <td><span className="pill">{fmtCell(o.status)}</span></td>
                <td>{fmtCell(o.created_at)}</td>
                <td>{fmtCell(o.paid_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="pager">
        <button className="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Oldingi</button>
        <span>Sahifa {page} / {totalPages} — jami: {count}</span>
        <button className="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Keyingi →</button>
      </div>
    </div>
  );
}

/* ============================================================
   COIN MONITORING PANEL
   ============================================================ */
function CoinMonitoringPanel({ api }) {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [reason, setReason] = useState('');
  const [userId, setUserId] = useState('');

  const loadSummary = async () => {
    try {
      const s = await api('/web/coin-transaction/summary');
      setSummary(s);
    } catch {}
  };

  const loadList = async () => {
    setLoading(true);
    try {
      const res = await api('/web/coin-transaction', { query: { reason, user_id: userId, limit, page } });
      const extracted = extractList(res);
      setTransactions(extracted.items);
      setCount(extracted.count);
    } catch {
      setTransactions([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    loadList();
  }, [page, limit]);

  const cards = [
    ['Sotib olingan (pul evaziga)', summary?.total_purchased],
    ['Ishlab topilgan (referral/promo/simulyatsiya)', summary?.total_earned],
    ['Sarflangan (case ochish va h.k.)', summary?.total_spent],
    ['Aylanmada (hozirgi jami balans)', summary?.coins_in_circulation]
  ];

  const totalPages = Math.max(1, Math.ceil((count || transactions.length) / limit));

  return (
    <div>
      <h2 className="pageTitle">Tangalar savdosi monitoringi</h2>
      <p className="pageDesc">/web/coin-transaction — faqat ko'rish</p>

      <div className="cards">
        {cards.map(([l, v], idx) => (
          <div key={idx} className="card">
            <div className="v">🪙 {v ?? 0}</div>
            <div className="l">{l}</div>
          </div>
        ))}
      </div>

      <div className="toolbar">
        <div className="field">
          <label>Sabab</label>
          <select value={reason} onChange={(e) => setReason(e.target.value)}>
            <option value="">— barcha sabablar —</option>
            <option value="coin_purchase">Tanga sotib olish</option>
            <option value="category_unlock">Bo'lim ochish</option>
            <option value="referral_reward">Referral</option>
            <option value="promo_redeem">Promokod</option>
            <option value="simulation_finish">Simulyatsiya</option>
          </select>
        </div>
        <div className="field">
          <label>User ID</label>
          <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID" />
        </div>
        <button onClick={() => { setPage(1); loadList(); }}>🔍 Qidirish</button>
      </div>

      {loading ? (
        <p className="muted">Yuklanmoqda...</p>
      ) : transactions.length === 0 ? (
        <p className="muted">Tranzaksiyalar topilmadi.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Foydalanuvchi</th>
              <th>O'zgarish</th>
              <th>Sabab</th>
              <th>Manba</th>
              <th>Vaqt</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, idx) => (
              <tr key={t.id || idx}>
                <td>{fmtCell(t.user_name || t.user_id)}</td>
                <td>
                  {t.delta > 0 ? (
                    <span style={{ color: '#4ade80' }}>+{t.delta}</span>
                  ) : (
                    <span style={{ color: '#f87171' }}>{t.delta}</span>
                  )}
                </td>
                <td><span className="pill">{fmtCell(t.reason)}</span></td>
                <td>{fmtCell(t.reference_type)} {fmtCell(t.reference_id)}</td>
                <td>{fmtCell(t.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="pager">
        <button className="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Oldingi</button>
        <span>Sahifa {page} / {totalPages} — jami: {count}</span>
        <button className="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Keyingi →</button>
      </div>
    </div>
  );
}

/* ============================================================
   AI PROMPT PANEL
   ============================================================ */
function AiPromptPanel({ api, addToast }) {
  const [prompts, setPrompts] = useState([]);
  const [usage, setUsage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePrompt, setActivePrompt] = useState({ key: 'patient_persona', template: '', model_params: {} });
  const [modelParamsStr, setModelParamsStr] = useState('{}');

  const load = async () => {
    try {
      const u = await api('/web/ai-prompt/usage');
      setUsage(u);
    } catch {}
    try {
      const res = await api('/web/ai-prompt');
      const items = Array.isArray(res) ? res : (res?.data || []);
      setPrompts(items);
    } catch {
      setPrompts([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleOpenEdit = (p) => {
    setActivePrompt(p);
    setModelParamsStr(typeof p.model_params === 'object' ? JSON.stringify(p.model_params, null, 2) : (p.model_params || '{}'));
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    let parsedParams = {};
    try {
      parsedParams = JSON.parse(modelParamsStr || '{}');
    } catch {
      addToast("Model parametrlari — JSON formati noto'g'ri", "err");
      return;
    }
    try {
      await api('/web/ai-prompt', { method: 'PUT', body: { ...activePrompt, model_params: parsedParams } });
      addToast("Saqlandi", "ok");
      setIsModalOpen(false);
      load();
    } catch {}
  };

  return (
    <div>
      <h2 className="pageTitle">AI Promptlar</h2>
      <p className="pageDesc">/web/ai-prompt — bemor personaji / debrief / case generatsiya promptlari</p>

      {usage && (
        <div className="cards">
          <div className="card">
            <div className="v">{usage.total_tokens ?? 0}</div>
            <div className="l">Jami tokenlar</div>
          </div>
          <div className="card">
            <div className="v">${Number(usage.total_cost_usd ?? 0).toFixed(6)}</div>
            <div className="l">Jami xarajat (USD)</div>
          </div>
        </div>
      )}

      <button className="primary" onClick={() => { setActivePrompt({ key: 'patient_persona', template: '' }); setModelParamsStr('{}'); setIsModalOpen(true); }}>
        + Prompt qo'shish / yangilash
      </button>

      <div style={{ marginTop: '14px' }}>
        {prompts.length === 0 ? (
          <p className="muted">Hali prompt kiritilmagan.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Key</th>
                <th>Template</th>
                <th>Model params</th>
                <th>Yangilangan</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {prompts.map((p, idx) => (
                <tr key={p.key || idx}>
                  <td>{p.key}</td>
                  <td>{fmtCell(p.template)}</td>
                  <td>{fmtCell(p.model_params)}</td>
                  <td>{fmtCell(p.updated_at)}</td>
                  <td>
                    <button className="sm" onClick={() => handleOpenEdit(p)}>✏️ Tahrir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modalOverlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal">
            <h3>AI Prompt saqlash</h3>
            <form onSubmit={handleSave}>
              <div className="field">
                <label>Key</label>
                <select value={activePrompt.key} onChange={(e) => setActivePrompt({ ...activePrompt, key: e.target.value })}>
                  <option value="patient_persona">patient_persona</option>
                  <option value="debrief">debrief</option>
                  <option value="case_generation">case_generation</option>
                </select>
              </div>
              <div className="field">
                <label>Template</label>
                <textarea
                  rows={8}
                  value={activePrompt.template || ''}
                  onChange={(e) => setActivePrompt({ ...activePrompt, template: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Model parametrlari (JSON)</label>
                <textarea
                  rows={4}
                  value={modelParamsStr}
                  onChange={(e) => setModelParamsStr(e.target.value)}
                />
              </div>
              <div className="modalFooter">
                <button type="button" onClick={() => setIsModalOpen(false)}>Bekor qilish</button>
                <button type="submit" className="primary">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   APP ROUTE PANEL
   ============================================================ */
function AppRoutePanel({ api, addToast }) {
  const [routes, setRoutes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formValues, setFormValues] = useState({
    call_center: '',
    support_url: '',
    app_version: { android: '', ios: '' },
    app_links: { google: '', apple: '' },
    payment_min_version: '',
    buy_course: false
  });

  const load = async () => {
    try {
      const res = await api('/web/app-route');
      const extracted = extractList(res);
      setRoutes(extracted.items);
    } catch {
      setRoutes([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleOpenEdit = (r) => {
    setEditItem(r);
    setFormValues({
      call_center: r.call_center || '',
      support_url: r.support_url || '',
      app_version: r.app_version || { android: '', ios: '' },
      app_links: r.app_links || { google: '', apple: '' },
      payment_min_version: r.payment_min_version || '',
      buy_course: !!r.buy_course
    });
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditItem(null);
    setFormValues({
      call_center: '',
      support_url: '',
      app_version: { android: '', ios: '' },
      app_links: { google: '', apple: '' },
      payment_min_version: '',
      buy_course: false
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editItem?.id) {
        await api(`/web/app-route/${editItem.id}/update`, { method: 'PUT', body: formValues });
        addToast("Saqlandi", "ok");
      } else {
        await api('/web/app-route', { method: 'POST', body: formValues });
        addToast("Yaratildi", "ok");
      }
      setIsModalOpen(false);
      load();
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm("O'chirilsinmi?")) return;
    try {
      await api(`/web/app-route/${id}/delete`, { method: 'DELETE' });
      addToast("O'chirildi", "ok");
      load();
    } catch {}
  };

  return (
    <div>
      <h2 className="pageTitle">App Route (ilova sozlamalari)</h2>
      <p className="pageDesc">/web/app-route — call-center, versiyalar, do'kon havolalari</p>

      <div className="toolbar">
        <button className="primary" onClick={handleOpenCreate}>
          ➕ Yangi qo'shish
        </button>
      </div>

      {routes.length === 0 ? (
        <p className="muted">Ma'lumot topilmadi — yuqoridagi "Yangi qo'shish" orqali birinchi sozlamani kiriting.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Call-center</th>
              <th>Support URL</th>
              <th>Versiya (android/ios)</th>
              <th>Buy course</th>
              <th>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {routes.map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{fmtCell(r.call_center)}</td>
                <td>{fmtCell(r.support_url)}</td>
                <td>{fmtCell(r.app_version?.android)} / {fmtCell(r.app_version?.ios)}</td>
                <td>{fmtCell(r.buy_course)}</td>
                <td>
                  <div className="actions">
                    <button className="sm" onClick={() => handleOpenEdit(r)}>✏️ Tahrir</button>
                    <button className="sm danger" onClick={() => handleDelete(r.id)}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isModalOpen && (
        <div className="modalOverlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal">
            <h3>App Route {editItem ? 'tahrirlash' : 'qo\'shish'}</h3>
            <form onSubmit={handleSave}>
              <div className="field">
                <label>Call-center</label>
                <input
                  value={formValues.call_center}
                  onChange={(e) => setFormValues({ ...formValues, call_center: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Support URL</label>
                <input
                  value={formValues.support_url}
                  onChange={(e) => setFormValues({ ...formValues, support_url: e.target.value })}
                />
              </div>
              <div className="formGrid">
                <div className="field">
                  <label>Android versiya</label>
                  <input
                    value={formValues.app_version?.android || ''}
                    onChange={(e) => setFormValues({
                      ...formValues,
                      app_version: { ...formValues.app_version, android: e.target.value }
                    })}
                  />
                </div>
                <div className="field">
                  <label>iOS versiya</label>
                  <input
                    value={formValues.app_version?.ios || ''}
                    onChange={(e) => setFormValues({
                      ...formValues,
                      app_version: { ...formValues.app_version, ios: e.target.value }
                    })}
                  />
                </div>
                <div className="field">
                  <label>Google Play havola</label>
                  <input
                    value={formValues.app_links?.google || ''}
                    onChange={(e) => setFormValues({
                      ...formValues,
                      app_links: { ...formValues.app_links, google: e.target.value }
                    })}
                  />
                </div>
                <div className="field">
                  <label>App Store havola</label>
                  <input
                    value={formValues.app_links?.apple || ''}
                    onChange={(e) => setFormValues({
                      ...formValues,
                      app_links: { ...formValues.app_links, apple: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div className="field">
                <label>To'lov uchun min versiya</label>
                <input
                  value={formValues.payment_min_version || ''}
                  onChange={(e) => setFormValues({ ...formValues, payment_min_version: e.target.value })}
                />
              </div>
              <div className="checkRow" style={{ marginTop: '8px', marginBottom: '14px' }}>
                <label>
                  <input
                    type="checkbox"
                    checked={formValues.buy_course}
                    onChange={(e) => setFormValues({ ...formValues, buy_course: e.target.checked })}
                  />
                  Kurs sotib olish yoqilgan
                </label>
              </div>
              <div className="modalFooter">
                <button type="button" onClick={() => setIsModalOpen(false)}>Bekor qilish</button>
                <button type="submit" className="primary">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ADMIN PROFILE PANEL
   ============================================================ */
function AdminProfilePanel({ api, addToast }) {
  const [me, setMe] = useState(null);
  const [isPwModalOpen, setIsPwModalOpen] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await api('/web/admin/profile');
      setMe(res);
    } catch {}
  };

  useEffect(() => {
    load();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!oldPass || !newPass) {
      addToast("Barcha maydonlarni to'ldiring", "err");
      return;
    }
    if (newPass !== confirmPass) {
      addToast("Yangi parol va tasdiq mos emas", "err");
      return;
    }
    setSaving(true);
    try {
      await api('/web/auth/password/change', {
        method: 'PUT',
        body: { old_password: oldPass, new_password: newPass, confirm_password: confirmPass }
      });
      addToast("Parol muvaffaqiyatli almashtirildi", "ok");
      setIsPwModalOpen(false);
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
    } catch {}
    finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="pageTitle">Mening profilim</h2>
      <p className="pageDesc">/web/admin/profile</p>

      <div className="kv card" style={{ maxWidth: '420px', marginBottom: '14px' }}>
        {me ? (
          <>
            <div><span className="k">ID</span>{me.id}</div>
            <div><span className="k">Login</span>{me.login}</div>
            <div><span className="k">Rol</span>{me.role_name || '—'}</div>
            <div><span className="k">Yaratilgan</span>{me.created_at || '—'}</div>
            <div><span className="k">Yangilangan</span>{me.updated_at || '—'}</div>
          </>
        ) : (
          <p className="muted">Profil yuklanmoqda...</p>
        )}
      </div>

      <button className="primary" onClick={() => setIsPwModalOpen(true)}>
        🔑 Parolni almashtirish
      </button>

      {isPwModalOpen && (
        <div className="modalOverlay" onClick={() => setIsPwModalOpen(false)}>
          <div className="modal" style={{ width: '400px' }}>
            <h3>Parolni almashtirish</h3>
            <form onSubmit={handlePasswordChange}>
              <div className="field">
                <label>Joriy parol</label>
                <input
                  type="password"
                  required
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Yangi parol</label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Yangi parol (tasdiq)</label>
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                />
              </div>
              <div className="modalFooter">
                <button type="button" onClick={() => setIsPwModalOpen(false)}>Bekor qilish</button>
                <button type="submit" className="primary" disabled={saving}>
                  {saving ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   SYSTEM SETTINGS PANEL
   ============================================================ */
function SettingsPanel({ api, addToast }) {
  const [settings, setSettings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formKey, setFormKey] = useState('');
  const [formVal, setFormVal] = useState('');

  const load = async () => {
    try {
      const res = await api('/web/setting');
      setSettings(Array.isArray(res) ? res : []);
    } catch {
      setSettings([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api('/web/setting', { method: 'PUT', body: { key: formKey, value: formVal } });
      addToast("Sozlama saqlandi", "ok");
      setIsModalOpen(false);
      load();
    } catch {}
  };

  return (
    <div>
      <h2 className="pageTitle">Tizim sozlamalari</h2>
      <p className="pageDesc">/web/setting — key/value (value JSON string sifatida)</p>

      <button className="primary" onClick={() => { setFormKey('daily_free_limit'); setFormVal(''); setIsModalOpen(true); }}>
        + Sozlama qo'shish / yangilash
      </button>

      <div style={{ marginTop: '14px' }}>
        {settings.length === 0 ? (
          <p className="muted">Sozlamalar topilmadi.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Key</th>
                <th>Value</th>
                <th>Yangilangan</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {settings.map((s, idx) => (
                <tr key={s.key || idx}>
                  <td>{s.key}</td>
                  <td>{fmtCell(s.value)}</td>
                  <td>{fmtCell(s.updated_at)}</td>
                  <td>
                    <button className="sm" onClick={() => { setFormKey(s.key); setFormVal(typeof s.value === 'object' ? JSON.stringify(s.value) : String(s.value || '')); setIsModalOpen(true); }}>
                      ✏️ Tahrir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modalOverlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal">
            <h3>Sozlama saqlash</h3>
            <form onSubmit={handleSave}>
              <div className="field">
                <label>Key *</label>
                <input
                  type="text"
                  required
                  value={formKey}
                  onChange={(e) => setFormKey(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Value (JSON string, masalan: 3)</label>
                <textarea
                  rows={3}
                  value={formVal}
                  onChange={(e) => setFormVal(e.target.value)}
                />
              </div>
              <div className="modalFooter">
                <button type="button" onClick={() => setIsModalOpen(false)}>Bekor qilish</button>
                <button type="submit" className="primary">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   CUSTOM PERMISSION PANEL (MODULES TREE & ROLE ACCESSES)
   ============================================================ */
function CustomPermissionPanel({ mode, api, addToast }) {
  const [stack, setStack] = useState([{ id: '', title: 'Root' }]);
  const [items, setItems] = useState([]);
  const [roles, setRoles] = useState([]);
  const [roleId, setRoleId] = useState('');
  const [loading, setLoading] = useState(true);

  // Module create/edit modal
  const [isModModalOpen, setIsModModalOpen] = useState(false);
  const [modTitle, setModTitle] = useState('');
  const [modAttr, setModAttr] = useState('{}');
  const [modOrder, setModOrder] = useState(0);
  const [editModId, setEditModId] = useState(null);

  const loadRoles = async () => {
    const r = await loadRefOptions('role', api);
    setRoles(r);
    if (r.length && !roleId) setRoleId(r[0].value);
  };

  useEffect(() => {
    if (mode === 'accesses') loadRoles();
  }, [mode]);

  const loadLevel = async () => {
    setLoading(true);
    const parent = stack[stack.length - 1];
    if (mode === 'modules') {
      try {
        const json = parent.id
          ? await api(`/web/custom-permission/${parent.id}/children`)
          : await api('/web/custom-permission');
        const extracted = extractList(json);
        setItems(extracted.items);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    } else {
      if (!roleId) {
        setItems([]);
        setLoading(false);
        return;
      }
      try {
        const json = await api('/web/custom-permission/accesses', { query: { role_id: roleId, parent_id: parent.id } });
        setItems((json && json.items) || []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadLevel();
  }, [mode, stack, roleId]);

  const handleOpenAddModule = () => {
    setEditModId(null);
    setModTitle('');
    setModAttr('{}');
    setModOrder(0);
    setIsModModalOpen(true);
  };

  const handleOpenEditModule = (m) => {
    setEditModId(m.id);
    setModTitle(m.title);
    setModAttr(typeof m.attributes === 'object' ? JSON.stringify(m.attributes, null, 2) : (m.attributes || '{}'));
    setModOrder(m.order_num ?? 0);
    setIsModModalOpen(true);
  };

  const handleSaveModule = async (e) => {
    e.preventDefault();
    let parsedAttr = {};
    try {
      parsedAttr = JSON.parse(modAttr || '{}');
    } catch {
      addToast("Atributlar — JSON formati noto'g'ri", "err");
      return;
    }
    const parent = stack[stack.length - 1];
    try {
      if (editModId) {
        await api(`/web/custom-permission/${editModId}/update`, {
          method: 'PUT',
          body: { title: modTitle, attributes: parsedAttr, order_num: Number(modOrder) }
        });
        addToast("Modul saqlandi", "ok");
      } else {
        await api('/web/custom-permission', {
          method: 'POST',
          body: { parent_id: parent.id, title: modTitle, attributes: parsedAttr, order_num: Number(modOrder) }
        });
        addToast("Modul yaratildi", "ok");
      }
      setIsModModalOpen(false);
      loadLevel();
    } catch {}
  };

  const handleDeleteModule = async (id) => {
    if (!window.confirm("Modul o'chirilsinmi?")) return;
    try {
      await api(`/web/custom-permission/${id}/delete`, { method: 'DELETE' });
      addToast("O'chirildi", "ok");
      loadLevel();
    } catch {}
  };

  const handleToggleAccess = async (it, perm, currentVal) => {
    const newVal = !currentVal;
    const body = {
      role_id: roleId,
      custom_permission_id: it.custom_permission_id,
      read: it.read,
      write: it.write,
      update: it.update,
      delete: it.delete,
      [perm]: newVal
    };
    try {
      await api('/web/custom-permission/accesses', { method: 'PUT', body });
      addToast("Ruxsat yangilandi", "ok");
      setItems(prev => prev.map(item => item.custom_permission_id === it.custom_permission_id ? { ...item, [perm]: newVal } : item));
    } catch {}
  };

  return (
    <div>
      <h2 className="pageTitle">{mode === 'modules' ? 'Admin panel modullari' : 'Rol ruxsatlari (Accesses)'}</h2>
      <p className="pageDesc">
        {mode === 'modules'
          ? '/web/custom-permission — daraxt tuzilmali modullar'
          : '/web/custom-permission/accesses — rol bo\'yicha CRUD ruxsatlar'}
      </p>

      {mode === 'accesses' && (
        <div className="toolbar">
          <div className="field">
            <label>Rol</label>
            <select value={roleId} onChange={(e) => { setRoleId(e.target.value); setStack([{ id: '', title: 'Root' }]); }}>
              {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="breadcrumb">
        {stack.map((s, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span>›</span>}
            <button className="sm" onClick={() => setStack(stack.slice(0, i + 1))}>
              {s.title}
            </button>
          </React.Fragment>
        ))}
      </div>

      {mode === 'modules' && (
        <div style={{ marginBottom: '12px' }}>
          <button className="primary" onClick={handleOpenAddModule}>+ Modul qo'shish</button>
        </div>
      )}

      {loading ? (
        <p className="muted">Yuklanmoqda...</p>
      ) : items.length === 0 ? (
        <p className="muted">Modullar topilmadi.</p>
      ) : mode === 'modules' ? (
        <table>
          <thead>
            <tr>
              <th>Nomi</th>
              <th>Tartib</th>
              <th>Atributlar</th>
              <th>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {items.map(m => (
              <tr key={m.id}>
                <td>{m.title}</td>
                <td>{m.order_num ?? ''}</td>
                <td>{fmtCell(m.attributes)}</td>
                <td>
                  <div className="actions">
                    <button className="sm" onClick={() => setStack([...stack, { id: m.id, title: m.title }])}>
                      📂 Ichiga kirish
                    </button>
                    <button className="sm" onClick={() => handleOpenEditModule(m)}>✏️</button>
                    <button className="sm danger" onClick={() => handleDeleteModule(m.id)}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Modul</th>
              <th>Read</th>
              <th>Write</th>
              <th>Update</th>
              <th>Delete</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(it => (
              <tr key={it.custom_permission_id}>
                <td>{it.title}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={!!it.read}
                    onChange={() => handleToggleAccess(it, 'read', !!it.read)}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={!!it.write}
                    onChange={() => handleToggleAccess(it, 'write', !!it.write)}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={!!it.update}
                    onChange={() => handleToggleAccess(it, 'update', !!it.update)}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={!!it.delete}
                    onChange={() => handleToggleAccess(it, 'delete', !!it.delete)}
                  />
                </td>
                <td>
                  {it.has_children && (
                    <button className="sm" onClick={() => setStack([...stack, { id: it.custom_permission_id, title: it.title }])}>
                      📂
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isModModalOpen && (
        <div className="modalOverlay" onClick={() => setIsModModalOpen(false)}>
          <div className="modal">
            <h3>{editModId ? "Modulni tahrirlash" : "Yangi modul"}</h3>
            <form onSubmit={handleSaveModule}>
              <div className="field">
                <label>Nomi *</label>
                <input
                  type="text"
                  required
                  value={modTitle}
                  onChange={(e) => setModTitle(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Atributlar (JSON)</label>
                <textarea
                  rows={4}
                  value={modAttr}
                  onChange={(e) => setModAttr(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Tartib raqami</label>
                <input
                  type="number"
                  value={modOrder}
                  onChange={(e) => setModOrder(e.target.value)}
                />
              </div>
              <div className="modalFooter">
                <button type="button" onClick={() => setIsModModalOpen(false)}>Bekor qilish</button>
                <button type="submit" className="primary">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
