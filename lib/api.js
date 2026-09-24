// API Client routing through secure server proxy (/api/...)

const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('tibcase_access_token') || localStorage.getItem('ts_access') || '';
  }
  return '';
};

export const ApiConfig = {
  getToken,
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tibcase_access_token', token);
      localStorage.setItem('ts_access', token);
    }
  },
  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tibcase_access_token');
      localStorage.removeItem('tibcase_refresh_token');
      localStorage.removeItem('tibcase_admin_user');
      localStorage.removeItem('ts_access');
      localStorage.removeItem('ts_refresh');
      localStorage.removeItem('ts_role');
      localStorage.removeItem('ts_uid');
    }
  },
  getCurrentUser: () => {
    if (typeof window !== 'undefined') {
      try {
        const u = localStorage.getItem('tibcase_admin_user');
        return u ? JSON.parse(u) : null;
      } catch {
        return null;
      }
    }
    return null;
  },
  setCurrentUser: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tibcase_admin_user', JSON.stringify(user));
    }
  }
};

async function request(endpoint, options = {}) {
  // Routes through internal Next.js server proxy: /api/web/...
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = `/api/${cleanEndpoint}`;
  const token = getToken();

  const isForm = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    'Accept-Language': 'uz',
    ...(isForm ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = (data && data.error && (data.error.message || data.error)) || data?.message || "Xatolik yuz berdi";
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export const DataService = {
  // --- Autentifikatsiya ---
  login: async (login, password) => {
    const data = await request('web/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ login, password })
    });
    if (data?.access_token) {
      ApiConfig.setToken(data.access_token);
      if (data.refresh_token) {
        localStorage.setItem('tibcase_refresh_token', data.refresh_token);
        localStorage.setItem('ts_refresh', data.refresh_token);
      }
      if (data.role) localStorage.setItem('ts_role', data.role);
      if (data.id) localStorage.setItem('ts_uid', data.id);
      ApiConfig.setCurrentUser({
        id: data.id,
        role: data.role,
        login
      });
    }
    return data;
  },

  changePassword: async (old_password, new_password, confirm_password) => {
    return request('web/auth/password/change', {
      method: 'PUT',
      body: JSON.stringify({ old_password, new_password, confirm_password })
    });
  },

  refreshPassword: async (role, user_id) => {
    return request('web/auth/password/refresh', {
      method: 'PUT',
      body: JSON.stringify({ role, user_id })
    });
  },

  // --- Dashboard ---
  getDashboardStats: async (params = {}) => {
    const query = typeof params === 'string' ? `type=${params}` : new URLSearchParams(params).toString();
    try {
      const data = await request(`web/dashboard${query ? `?${query}` : ''}`);
      return {
        active_subscriptions: data?.active_subscriptions ?? 0,
        active_users: data?.active_users ?? 0,
        ai_total_cost_usd: data?.ai_total_cost_usd ?? 0,
        cases: data?.cases ?? 0,
        categories: data?.categories ?? 0,
        completed_sessions: data?.completed_sessions ?? 0,
        users: data?.users ?? 0
      };
    } catch {
      return {
        active_subscriptions: 0,
        active_users: 0,
        ai_total_cost_usd: 0,
        cases: 0,
        categories: 0,
        completed_sessions: 0,
        users: 0
      };
    }
  },

  // --- Bo'limlar (Category) ---
  getCategories: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    try {
      const res = await request(`web/category${query ? `?${query}` : ''}`);
      return res?.categories || res?.data || (Array.isArray(res) ? res : []);
    } catch {
      return [];
    }
  },
  getCategoryById: async (id) => {
    return request(`web/category/${id}`);
  },
  createCategory: async (category) => {
    return request('web/category', {
      method: 'POST',
      body: JSON.stringify(category)
    });
  },
  updateCategory: async (id, category) => {
    return request(`web/category/${id}/update`, {
      method: 'PUT',
      body: JSON.stringify(category)
    });
  },
  deleteCategory: async (id) => {
    return request(`web/category/${id}/delete`, {
      method: 'DELETE'
    });
  },

  // --- Mavzular (Topic) ---
  getTopics: async (params = {}) => {
    const query = typeof params === 'string'
      ? (params ? `category_id=${params}` : '')
      : new URLSearchParams(params).toString();
    try {
      const res = await request(`web/topic${query ? `?${query}` : ''}`);
      return res?.topics || res?.data || (Array.isArray(res) ? res : []);
    } catch {
      return [];
    }
  },
  getTopicById: async (id) => {
    return request(`web/topic/${id}`);
  },
  createTopic: async (topic) => {
    return request('web/topic', {
      method: 'POST',
      body: JSON.stringify(topic)
    });
  },
  updateTopic: async (id, topic) => {
    return request(`web/topic/${id}/update`, {
      method: 'PUT',
      body: JSON.stringify(topic)
    });
  },
  deleteTopic: async (id) => {
    return request(`web/topic/${id}/delete`, {
      method: 'DELETE'
    });
  },

  // --- Klinik Case'lar ---
  getCases: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    try {
      const res = await request(`web/case${query ? `?${query}` : ''}`);
      return res?.cases || res?.data || (Array.isArray(res) ? res : []);
    } catch {
      return [];
    }
  },
  getCaseById: async (id) => {
    return request(`web/case/${id}`);
  },
  createCase: async (caseData) => {
    return request('web/case', {
      method: 'POST',
      body: JSON.stringify(caseData)
    });
  },
  updateCase: async (id, caseData) => {
    return request(`web/case/${id}/update`, {
      method: 'PUT',
      body: JSON.stringify(caseData)
    });
  },
  deleteCase: async (id) => {
    return request(`web/case/${id}/delete`, {
      method: 'DELETE'
    });
  },
  publishCase: async (id) => {
    return request(`web/case/${id}/publish`, {
      method: 'PUT'
    });
  },
  aiGenerateCase: async (payload) => {
    return request('web/case/ai-generate', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // --- Levellar (XP) ---
  getLevels: async () => {
    try {
      const res = await request('web/level');
      return Array.isArray(res) ? res : (res?.levels || res?.data || []);
    } catch {
      return [];
    }
  },
  createLevel: async (level) => {
    return request('web/level', {
      method: 'POST',
      body: JSON.stringify(level)
    });
  },
  updateLevel: async (id, level) => {
    return request(`web/level/${id}/update`, {
      method: 'PUT',
      body: JSON.stringify(level)
    });
  },
  deleteLevel: async (id) => {
    return request(`web/level/${id}/delete`, {
      method: 'DELETE'
    });
  },

  // --- AI Promptlar & Testing ---
  getAiPrompts: async () => {
    try {
      const res = await request('web/ai-prompt');
      return Array.isArray(res) ? res : (res?.data || []);
    } catch {
      return [];
    }
  },
  updateAiPrompt: async (prompt) => {
    return request('web/ai-prompt', {
      method: 'PUT',
      body: JSON.stringify(prompt)
    });
  },
  testAiDebrief: async (case_id, events) => {
    return request('web/ai-prompt/test-debrief', {
      method: 'POST',
      body: JSON.stringify({ case_id, events })
    });
  },
  testAiPatient: async (case_id, question) => {
    return request('web/ai-prompt/test-patient', {
      method: 'POST',
      body: JSON.stringify({ case_id, question })
    });
  },
  getAiUsage: async () => {
    return request('web/ai-prompt/usage');
  },

  // --- Tariflar ---
  getTariffs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    try {
      const res = await request(`web/tariff${query ? `?${query}` : ''}`);
      return res?.tariffs || res?.data || (Array.isArray(res) ? res : []);
    } catch {
      return [];
    }
  },
  getTariffById: async (id) => {
    return request(`web/tariff/${id}`);
  },
  createTariff: async (tariff) => {
    return request('web/tariff', {
      method: 'POST',
      body: JSON.stringify(tariff)
    });
  },
  updateTariff: async (id, tariff) => {
    return request(`web/tariff/${id}/update`, {
      method: 'PUT',
      body: JSON.stringify(tariff)
    });
  },
  deleteTariff: async (id) => {
    return request(`web/tariff/${id}/delete`, {
      method: 'DELETE'
    });
  },

  // --- Buyurtmalar ---
  getOrders: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    try {
      const res = await request(`web/order${query ? `?${query}` : ''}`);
      return res?.orders || res?.data || (Array.isArray(res) ? res : []);
    } catch {
      return [];
    }
  },
  getOrderById: async (id) => {
    return request(`web/order/${id}`);
  },

  // --- Promokodlar ---
  getPromoCodes: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    try {
      const res = await request(`web/promocode${query ? `?${query}` : ''}`);
      return res?.promocodes || res?.data || (Array.isArray(res) ? res : []);
    } catch {
      return [];
    }
  },
  getPromoCodeById: async (id) => {
    return request(`web/promocode/${id}`);
  },
  createPromoCode: async (promo) => {
    return request('web/promocode', {
      method: 'POST',
      body: JSON.stringify(promo)
    });
  },
  deletePromoCode: async (id) => {
    return request(`web/promocode/${id}/delete`, {
      method: 'DELETE'
    });
  },

  // --- Hamkorlar ---
  getPartners: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    try {
      const res = await request(`web/partner${query ? `?${query}` : ''}`);
      return res?.partners || res?.data || (Array.isArray(res) ? res : []);
    } catch {
      return [];
    }
  },
  getPartnerById: async (id) => {
    return request(`web/partner/${id}`);
  },
  createPartner: async (partner) => {
    return request('web/partner', {
      method: 'POST',
      body: JSON.stringify(partner)
    });
  },
  updatePartner: async (id, partner) => {
    return request(`web/partner/${id}/update`, {
      method: 'PUT',
      body: JSON.stringify(partner)
    });
  },
  deletePartner: async (id) => {
    return request(`web/partner/${id}/delete`, {
      method: 'DELETE'
    });
  },

  // --- Tangalar monitoringi ---
  getCoinTransactions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    try {
      const res = await request(`web/coin-transaction${query ? `?${query}` : ''}`);
      return res?.transactions || res?.data || (Array.isArray(res) ? res : []);
    } catch {
      return [];
    }
  },
  getCoinSummary: async () => {
    return request('web/coin-transaction/summary');
  },

  // --- Sozlamalar ---
  getSettings: async () => {
    try {
      const res = await request('web/setting');
      return Array.isArray(res) ? res : (res?.data || []);
    } catch {
      return [];
    }
  },
  updateSetting: async (key, value) => {
    return request('web/setting', {
      method: 'PUT',
      body: JSON.stringify({ key, value: String(value) })
    });
  },

  // --- Bildirishnomalar ---
  getNotifications: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    try {
      const res = await request(`web/notification${query ? `?${query}` : ''}`);
      return res?.notifications || res?.data || (Array.isArray(res) ? res : []);
    } catch {
      return [];
    }
  },
  getNotificationById: async (id) => {
    return request(`web/notification/${id}`);
  },
  createNotification: async (notif) => {
    return request('web/notification', {
      method: 'POST',
      body: JSON.stringify(notif)
    });
  },
  updateNotification: async (id, notif) => {
    return request(`web/notification/${id}/update`, {
      method: 'PUT',
      body: JSON.stringify(notif)
    });
  },
  deleteNotification: async (id) => {
    return request(`web/notification/${id}/delete`, {
      method: 'DELETE'
    });
  },

  // --- Bannerlar ---
  getBanners: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    try {
      const res = await request(`web/banner${query ? `?${query}` : ''}`);
      return res?.banners || res?.data || (Array.isArray(res) ? res : []);
    } catch {
      return [];
    }
  },
  getBannerById: async (id) => {
    return request(`web/banner/${id}`);
  },
  createBanner: async (banner) => {
    return request('web/banner', {
      method: 'POST',
      body: JSON.stringify(banner)
    });
  },
  updateBanner: async (id, banner) => {
    return request(`web/banner/${id}/update`, {
      method: 'PUT',
      body: JSON.stringify(banner)
    });
  },
  deleteBanner: async (id) => {
    return request(`web/banner/${id}/delete`, {
      method: 'DELETE'
    });
  },

  // --- Biz haqimizda (About) ---
  getAbouts: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    try {
      const res = await request(`web/about${query ? `?${query}` : ''}`);
      return res?.abouts || res?.data || (Array.isArray(res) ? res : []);
    } catch {
      return [];
    }
  },
  getAboutById: async (id) => {
    return request(`web/about/${id}`);
  },
  createAbout: async (about) => {
    return request('web/about', {
      method: 'POST',
      body: JSON.stringify(about)
    });
  },
  updateAbout: async (id, about) => {
    return request(`web/about/${id}/update`, {
      method: 'PUT',
      body: JSON.stringify(about)
    });
  },
  deleteAbout: async (id) => {
    return request(`web/about/${id}/delete`, {
      method: 'DELETE'
    });
  },

  // --- FAQ ---
  getFaqs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    try {
      const res = await request(`web/faq${query ? `?${query}` : ''}`);
      return res?.faqs || res?.data || (Array.isArray(res) ? res : []);
    } catch {
      return [];
    }
  },
  getFaqById: async (id) => {
    return request(`web/faq/${id}`);
  },
  createFaq: async (faq) => {
    return request('web/faq', {
      method: 'POST',
      body: JSON.stringify(faq)
    });
  },
  updateFaq: async (id, faq) => {
    return request(`web/faq/${id}/update`, {
      method: 'PUT',
      body: JSON.stringify(faq)
    });
  },
  deleteFaq: async (id) => {
    return request(`web/faq/${id}/delete`, {
      method: 'DELETE'
    });
  },

  // --- Kontaktlar ---
  getContacts: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    try {
      const res = await request(`web/contact${query ? `?${query}` : ''}`);
      return res?.contacts || res?.data || (Array.isArray(res) ? res : []);
    } catch {
      return [];
    }
  },
  getContactById: async (id) => {
    return request(`web/contact/${id}`);
  },
  createContact: async (contact) => {
    return request('web/contact', {
      method: 'POST',
      body: JSON.stringify(contact)
    });
  },
  updateContact: async (id, contact) => {
    return request(`web/contact/${id}/update`, {
      method: 'PUT',
      body: JSON.stringify(contact)
    });
  },
  deleteContact: async (id) => {
    return request(`web/contact/${id}/delete`, {
      method: 'DELETE'
    });
  },

  // --- App Route ---
  getAppRoutes: async () => {
    try {
      const res = await request('web/app-route');
      return res?.app_routes || res?.data || (Array.isArray(res) ? res : []);
    } catch {
      return [];
    }
  },
  getAppRouteById: async (id) => {
    return request(`web/app-route/${id}`);
  },
  createAppRoute: async (route) => {
    return request('web/app-route', {
      method: 'POST',
      body: JSON.stringify(route)
    });
  },
  updateAppRoute: async (id, route) => {
    return request(`web/app-route/${id}/update`, {
      method: 'PUT',
      body: JSON.stringify(route)
    });
  },
  deleteAppRoute: async (id) => {
    return request(`web/app-route/${id}/delete`, {
      method: 'DELETE'
    });
  },

  // --- Mobil Foydalanuvchilar (User) ---
  getUsers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    try {
      const res = await request(`web/user${query ? `?${query}` : ''}`);
      return res?.users || res?.data || (Array.isArray(res) ? res : []);
    } catch {
      return [];
    }
  },
  getUserById: async (id) => {
    return request(`web/user/${id}`);
  },
  deleteUser: async (id) => {
    return request(`web/user/${id}/delete`, {
      method: 'DELETE'
    });
  },

  // --- Adminlar & Rollar ---
  getProfile: async () => {
    return request('web/admin/profile');
  },
  getAdmins: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    try {
      const res = await request(`web/admin${query ? `?${query}` : ''}`);
      return res?.admins || res?.data || (Array.isArray(res) ? res : []);
    } catch {
      return [];
    }
  },
  getAdminById: async (id) => {
    return request(`web/admin/${id}`);
  },
  createAdmin: async (admin) => {
    return request('web/admin', {
      method: 'POST',
      body: JSON.stringify(admin)
    });
  },
  updateAdmin: async (id, admin) => {
    return request(`web/admin/${id}/update`, {
      method: 'PUT',
      body: JSON.stringify(admin)
    });
  },
  deleteAdmin: async (id) => {
    return request(`web/admin/${id}/delete`, {
      method: 'DELETE'
    });
  },

  getRoles: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    try {
      const res = await request(`web/role${query ? `?${query}` : ''}`);
      return res?.roles || res?.data || (Array.isArray(res) ? res : []);
    } catch {
      return [];
    }
  },
  getRoleById: async (id) => {
    return request(`web/role/${id}`);
  },
  createRole: async (role) => {
    return request('web/role', {
      method: 'POST',
      body: JSON.stringify(role)
    });
  },
  updateRole: async (id, role) => {
    return request(`web/role/${id}/update`, {
      method: 'PUT',
      body: JSON.stringify(role)
    });
  },
  deleteRole: async (id) => {
    return request(`web/role/${id}/delete`, {
      method: 'DELETE'
    });
  },

  // --- Maxsus ruxsatlar (Custom Permission) ---
  getCustomPermissions: async () => {
    try {
      const res = await request('web/custom-permission');
      return res?.modules || res?.data || (Array.isArray(res) ? res : []);
    } catch {
      return [];
    }
  },
  getCustomPermissionChildren: async (id) => {
    try {
      const res = await request(`web/custom-permission/${id}/children`);
      return res?.modules || res?.data || (Array.isArray(res) ? res : []);
    } catch {
      return [];
    }
  },
  createCustomPermission: async (data) => {
    return request('web/custom-permission', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  updateCustomPermission: async (id, data) => {
    return request(`web/custom-permission/${id}/update`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  deleteCustomPermission: async (id) => {
    return request(`web/custom-permission/${id}/delete`, {
      method: 'DELETE'
    });
  },
  getRoleAccesses: async (role_id, parent_id = '') => {
    const query = new URLSearchParams({ role_id, ...(parent_id ? { parent_id } : {}) }).toString();
    return request(`web/custom-permission/accesses?${query}`);
  },
  updateRoleAccess: async (accessData) => {
    return request('web/custom-permission/accesses', {
      method: 'PUT',
      body: JSON.stringify(accessData)
    });
  },

  // --- Fayl yuklash ---
  uploadFile: async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return request('web/file-upload', {
      method: 'POST',
      body: fd
    });
  }
};
