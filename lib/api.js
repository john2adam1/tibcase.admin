// API Client routing through secure server proxy (/api/...)

const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('tibcase_access_token') || '';
  }
  return '';
};

export const ApiConfig = {
  getToken,
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tibcase_access_token', token);
    }
  },
  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tibcase_access_token');
      localStorage.removeItem('tibcase_refresh_token');
      localStorage.removeItem('tibcase_admin_user');
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

  const headers = {
    'Accept-Language': 'uz',
    'Content-Type': 'application/json',
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
      const errorMsg = data?.error || data?.message || "Xatolik yuz berdi";
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export const DataService = {
  // Auth
  login: async (login, password) => {
    const data = await request('web/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ login, password })
    });
    if (data?.access_token) {
      ApiConfig.setToken(data.access_token);
      if (data.refresh_token) {
        localStorage.setItem('tibcase_refresh_token', data.refresh_token);
      }
      ApiConfig.setCurrentUser({
        id: data.id,
        role: data.role,
        login
      });
    }
    return data;
  },

  getProfile: async () => {
    return request('web/admin/profile');
  },

  changePassword: async (old_password, new_password, confirm_password) => {
    return request('web/auth/password/change', {
      method: 'PUT',
      body: JSON.stringify({ old_password, new_password, confirm_password })
    });
  },

  // Dashboard stats
  getDashboardStats: async (type = 'month') => {
    try {
      const data = await request(`web/dashboard?type=${type}`);
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

  // Categories
  getCategories: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    try {
      const res = await request(`web/category${query ? `?${query}` : ''}`);
      return res?.categories || [];
    } catch {
      return [];
    }
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

  // Topics
  getTopics: async (categoryId = '') => {
    const query = categoryId ? `?category_id=${categoryId}` : '';
    try {
      const res = await request(`web/topic${query}`);
      return res?.topics || [];
    } catch {
      return [];
    }
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

  // Cases
  getCases: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    try {
      const res = await request(`web/case${query ? `?${query}` : ''}`);
      return res?.cases || [];
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

  // Tariffs
  getTariffs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    try {
      const res = await request(`web/tariff${query ? `?${query}` : ''}`);
      return res?.tariffs || [];
    } catch {
      return [];
    }
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

  // Orders
  getOrders: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    try {
      const res = await request(`web/order${query ? `?${query}` : ''}`);
      return res?.orders || [];
    } catch {
      return [];
    }
  },

  // Promo codes
  getPromoCodes: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    try {
      const res = await request(`web/promocode${query ? `?${query}` : ''}`);
      return res?.promocodes || [];
    } catch {
      return [];
    }
  },
  createPromoCode: async (promo) => {
    return request('web/promocode', {
      method: 'POST',
      body: JSON.stringify(promo)
    });
  },

  // Partners
  getPartners: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    try {
      const res = await request(`web/partner${query ? `?${query}` : ''}`);
      return res?.partners || [];
    } catch {
      return [];
    }
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

  // Banners
  getBanners: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    try {
      const res = await request(`web/banner${query ? `?${query}` : ''}`);
      return res?.banners || [];
    } catch {
      return [];
    }
  },
  createBanner: async (banner) => {
    return request('web/banner', {
      method: 'POST',
      body: JSON.stringify(banner)
    });
  },
  deleteBanner: async (id) => {
    return request(`web/banner/${id}/delete`, {
      method: 'DELETE'
    });
  },

  // Notifications
  getNotifications: async () => {
    try {
      const res = await request('web/notification');
      return res?.notifications || [];
    } catch {
      return [];
    }
  },
  sendNotification: async (notif) => {
    return request('web/notification/send', {
      method: 'POST',
      body: JSON.stringify(notif)
    });
  },

  // Levels
  getLevels: async () => {
    try {
      const res = await request('web/level');
      return res?.levels || [];
    } catch {
      return [];
    }
  },

  // Prompts
  getAiPrompts: async () => {
    try {
      const res = await request('web/prompt');
      return res?.prompts || [];
    } catch {
      return [];
    }
  },
  updateAiPrompt: async (id, prompt) => {
    return request(`web/prompt/${id}/update`, {
      method: 'PUT',
      body: JSON.stringify(prompt)
    });
  },

  // Admins
  getAdmins: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    try {
      const res = await request(`web/admin${query ? `?${query}` : ''}`);
      return res?.admins || [];
    } catch {
      return [];
    }
  },
  createAdmin: async (admin) => {
    return request('web/admin', {
      method: 'POST',
      body: JSON.stringify(admin)
    });
  },
  getRoles: async () => {
    try {
      const res = await request('web/role');
      return res?.roles || [];
    } catch {
      return [];
    }
  }
};
