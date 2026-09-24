import {
  INITIAL_CATEGORIES,
  INITIAL_TOPICS,
  INITIAL_CASES,
  INITIAL_AI_PROMPTS,
  INITIAL_LEVELS,
  INITIAL_TARIFFS,
  INITIAL_ORDERS,
  INITIAL_PROMOCODES,
  INITIAL_PARTNERS,
  INITIAL_ADMINS,
  INITIAL_BANNERS,
  INITIAL_NOTIFICATIONS
} from './mockData';

const STORAGE_KEYS = {
  TOKEN: 'tibcase_token',
  ADMIN_USER: 'tibcase_admin_user',
  API_BASE_URL: 'tibcase_api_base_url',
  USE_LIVE_API: 'tibcase_use_live_api',
  CATEGORIES: 'tibcase_data_categories',
  TOPICS: 'tibcase_data_topics',
  CASES: 'tibcase_data_cases',
  PROMPTS: 'tibcase_data_prompts',
  TARIFFS: 'tibcase_data_tariffs',
  ORDERS: 'tibcase_data_orders',
  PROMOCODES: 'tibcase_data_promocodes',
  PARTNERS: 'tibcase_data_partners',
  BANNERS: 'tibcase_data_banners',
  NOTIFICATIONS: 'tibcase_data_notifications'
};

// Safe storage access helper
const getStored = (key, defaultVal) => {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
};

const setStored = (key, val) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

export const ApiConfig = {
  getBaseUrl: () => {
    if (typeof window === 'undefined') return 'https://api.tibsphereai.uz';
    return localStorage.getItem(STORAGE_KEYS.API_BASE_URL) || 'https://api.tibsphereai.uz';
  },
  setBaseUrl: (url) => {
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.API_BASE_URL, url);
  },
  isLiveApi: () => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEYS.USE_LIVE_API) === 'true';
  },
  setLiveApi: (useLive) => {
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.USE_LIVE_API, useLive ? 'true' : 'false');
  },
  getToken: () => {
    if (typeof window === 'undefined') return 'mock-tib-admin-token-2026';
    return localStorage.getItem(STORAGE_KEYS.TOKEN) || 'mock-tib-admin-token-2026';
  },
  setToken: (token) => {
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },
  getCurrentUser: () => {
    return getStored(STORAGE_KEYS.ADMIN_USER, {
      id: 'adm-1',
      login: 'superadmin@tibsphere.uz',
      role: 'Super Admin',
      partner_name: 'TibSphere Markaziy'
    });
  },
  setCurrentUser: (user) => {
    setStored(STORAGE_KEYS.ADMIN_USER, user);
  }
};

// Main API Repository with interactive mock fallback
export const DataService = {
  // --- DASHBOARD / ANALYTICS ---
  getDashboardStats: async (period = 'month') => {
    const cases = DataService.getCases();
    const categories = DataService.getCategories();
    const orders = DataService.getOrders();
    const totalRev = orders.filter(o => o.status === 'paid').reduce((acc, curr) => acc + curr.amount_uzs, 0);

    return {
      active_users: 14820,
      users_change_pct: "+14.8%",
      active_subscriptions: 1240,
      subs_change_pct: "+22.5%",
      ai_total_cost_usd: 124.60,
      cases_count: cases.length,
      categories_count: categories.length,
      completed_sessions: 58940,
      total_revenue_uzs: totalRev + 120000000,
      ai_tokens_used: "4.2M tokens"
    };
  },

  // --- CATEGORIES ---
  getCategories: () => {
    return getStored(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },
  saveCategory: (category) => {
    const list = DataService.getCategories();
    let updated;
    if (category.id) {
      updated = list.map(c => c.id === category.id ? { ...c, ...category, updated_at: new Date().toISOString() } : c);
    } else {
      const newCat = {
        ...category,
        id: `cat-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      updated = [newCat, ...list];
    }
    setStored(STORAGE_KEYS.CATEGORIES, updated);
    return updated;
  },
  deleteCategory: (id) => {
    const list = DataService.getCategories().filter(c => c.id !== id);
    setStored(STORAGE_KEYS.CATEGORIES, list);
    return list;
  },

  // --- TOPICS ---
  getTopics: (categoryId = null) => {
    const topics = getStored(STORAGE_KEYS.TOPICS, INITIAL_TOPICS);
    if (!categoryId) return topics;
    return topics.filter(t => t.category_id === categoryId);
  },
  saveTopic: (topic) => {
    const list = getStored(STORAGE_KEYS.TOPICS, INITIAL_TOPICS);
    let updated;
    if (topic.id) {
      updated = list.map(t => t.id === topic.id ? { ...t, ...topic } : t);
    } else {
      const newTop = {
        ...topic,
        id: `top-${Date.now()}`,
        created_at: new Date().toISOString()
      };
      updated = [newTop, ...list];
    }
    setStored(STORAGE_KEYS.TOPICS, updated);
    return updated;
  },
  deleteTopic: (id) => {
    const list = getStored(STORAGE_KEYS.TOPICS, INITIAL_TOPICS).filter(t => t.id !== id);
    setStored(STORAGE_KEYS.TOPICS, list);
    return list;
  },

  // --- CASES ---
  getCases: () => {
    return getStored(STORAGE_KEYS.CASES, INITIAL_CASES);
  },
  getCaseById: (id) => {
    return DataService.getCases().find(c => c.id === id);
  },
  saveCase: (caseItem) => {
    const list = DataService.getCases();
    let updated;
    if (caseItem.id) {
      updated = list.map(c => c.id === caseItem.id ? { ...c, ...caseItem, updated_at: new Date().toISOString() } : c);
    } else {
      const newCase = {
        ...caseItem,
        id: `case-${Date.now()}`,
        status: caseItem.status || 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      updated = [newCase, ...list];
    }
    setStored(STORAGE_KEYS.CASES, updated);
    return updated;
  },
  deleteCase: (id) => {
    const list = DataService.getCases().filter(c => c.id !== id);
    setStored(STORAGE_KEYS.CASES, list);
    return list;
  },
  togglePublishCase: (id) => {
    const list = DataService.getCases();
    const updated = list.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === 'published' ? 'draft' : 'published';
        return { ...c, status: nextStatus, updated_at: new Date().toISOString() };
      }
      return c;
    });
    setStored(STORAGE_KEYS.CASES, updated);
    return updated;
  },

  // --- AI PROMPTS ---
  getAiPrompts: () => {
    return getStored(STORAGE_KEYS.PROMPTS, INITIAL_AI_PROMPTS);
  },
  saveAiPrompt: (prompt) => {
    const list = DataService.getAiPrompts();
    let updated;
    if (prompt.id) {
      updated = list.map(p => p.id === prompt.id ? { ...p, ...prompt } : p);
    } else {
      const newPrompt = { ...prompt, id: `prompt-${Date.now()}` };
      updated = [newPrompt, ...list];
    }
    setStored(STORAGE_KEYS.PROMPTS, updated);
    return updated;
  },

  // --- TARIFFS ---
  getTariffs: () => {
    return getStored(STORAGE_KEYS.TARIFFS, INITIAL_TARIFFS);
  },
  saveTariff: (tariff) => {
    const list = DataService.getTariffs();
    let updated;
    if (tariff.id) {
      updated = list.map(t => t.id === tariff.id ? { ...t, ...tariff } : t);
    } else {
      const newTar = { ...tariff, id: `tar-${Date.now()}` };
      updated = [newTar, ...list];
    }
    setStored(STORAGE_KEYS.TARIFFS, updated);
    return updated;
  },

  // --- ORDERS ---
  getOrders: () => {
    return getStored(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  },

  // --- PROMOCODES ---
  getPromoCodes: () => {
    return getStored(STORAGE_KEYS.PROMOCODES, INITIAL_PROMOCODES);
  },
  savePromoCode: (promo) => {
    const list = DataService.getPromoCodes();
    let updated;
    if (promo.id) {
      updated = list.map(p => p.id === promo.id ? { ...p, ...promo } : p);
    } else {
      const newPromo = { ...promo, id: `pr-${Date.now()}`, used_count: 0 };
      updated = [newPromo, ...list];
    }
    setStored(STORAGE_KEYS.PROMOCODES, updated);
    return updated;
  },

  // --- PARTNERS ---
  getPartners: () => {
    return getStored(STORAGE_KEYS.PARTNERS, INITIAL_PARTNERS);
  },

  // --- BANNERS ---
  getBanners: () => {
    return getStored(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
  },
  saveBanner: (banner) => {
    const list = DataService.getBanners();
    let updated;
    if (banner.id) {
      updated = list.map(b => b.id === banner.id ? { ...b, ...banner } : b);
    } else {
      const newBanner = { ...banner, id: `ban-${Date.now()}` };
      updated = [newBanner, ...list];
    }
    setStored(STORAGE_KEYS.BANNERS, updated);
    return updated;
  },

  // --- NOTIFICATIONS ---
  getNotifications: () => {
    return getStored(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },
  sendNotification: (notif) => {
    const list = DataService.getNotifications();
    const newNotif = {
      ...notif,
      id: `notif-${Date.now()}`,
      sent_at: new Date().toISOString(),
      sent_count: Math.floor(Math.random() * 2000 + 3500)
    };
    const updated = [newNotif, ...list];
    setStored(STORAGE_KEYS.NOTIFICATIONS, updated);
    return updated;
  },

  // RESET ALL DEMO DATA
  resetDemoData: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.TOPICS);
    localStorage.removeItem(STORAGE_KEYS.CASES);
    localStorage.removeItem(STORAGE_KEYS.PROMPTS);
    localStorage.removeItem(STORAGE_KEYS.TARIFFS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.PROMOCODES);
    localStorage.removeItem(STORAGE_KEYS.PARTNERS);
    localStorage.removeItem(STORAGE_KEYS.BANNERS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
  }
};
