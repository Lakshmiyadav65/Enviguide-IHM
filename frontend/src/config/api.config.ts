// ============================================================
// IHM Platform - API Configuration
// ============================================================
// This file is the single source of truth for backend endpoints.
// Switch from mock → real API by updating BASE_URL and USE_MOCK.

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  USE_MOCK: import.meta.env.VITE_USE_MOCK === 'true',
  TIMEOUT: 15000, // ms
};

export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },

  // Vessels
  VESSELS: {
    LIST: '/vessels',
    DETAIL: (id: string) => `/vessels/${id}`,
    IMAGE_UPLOAD: (id: string) => `/vessels/${id}/image`,
    DECKS: (id: string) => `/vessels/${id}/decks`,
    MATERIALS: (id: string) => `/vessels/${id}/materials`,
    CERTIFICATES: (id: string) => `/vessels/${id}/certificates`,
  },

  // GA Plans (nested under a vessel)
  GA_PLANS: {
    LIST: (vesselId: string) => `/vessels/${vesselId}/ga-plans`,
    DETAIL: (vesselId: string, planId: string) => `/vessels/${vesselId}/ga-plans/${planId}`,
  },

  // Deck Areas (nested under a GA Plan)
  DECK_AREAS: {
    LIST: (vesselId: string, planId: string) =>
      `/vessels/${vesselId}/ga-plans/${planId}/deck-areas`,
    DETAIL: (vesselId: string, planId: string, areaId: string) =>
      `/vessels/${vesselId}/ga-plans/${planId}/deck-areas/${areaId}`,
  },

  // Purchase Orders
  PURCHASE_ORDERS: {
    LIST: '/purchase-orders',
    DETAIL: (id: string) => `/purchase-orders/${id}`,
    UPLOAD: '/purchase-orders/upload',
    UPLOAD_BULK: '/purchase-orders/upload-bulk',
  },

  // Materials / IHM
  MATERIALS: {
    LIST: '/materials',
    DETAIL: (id: string) => `/materials/${id}`,
    MAPPING: '/materials/mapping',
  },

  // Administration / Audits
  AUDITS: {
    PENDING: '/audits/pending',
    DETAIL: (imo: string) => `/audits/${imo}`,
    REVIEWS: '/audits/reviews',
    REVIEW_DETAIL: (imo: string) => `/audits/reviews/${imo}`,
    MDS_DOC: '/audits/mds-doc',
    MDS_PENDING: '/audits/mds-pending',
    VESSEL_PO_ITEMS: (vesselId: string) => `/audits/vessels/${vesselId}/po-items`,
    DOCUMENTS: (imo: string) => `/audits/${imo}/documents`,
    CLARIFICATION_EMAIL: '/audits/clarification-email',
    LINE_ITEMS: (imo: string) => `/audits/${imo}/line-items`,
    LINE_ITEMS_BY_ID: (auditId: string) => `/audits/by-id/${auditId}/line-items`,
    CLARIFICATIONS: (imo: string) => `/audits/${imo}/clarifications`,
    CLARIFICATION_ITEM_DOC: (clarId: string, idx: number | string, kind: 'md' | 'sdoc') =>
      `/audits/clarifications/${clarId}/items/${idx}/document/${kind}`,
    CLARIFICATION_ITEM_DOC_PREVIEW: (clarId: string, idx: number | string, kind: 'md' | 'sdoc') =>
      `/audits/clarifications/${clarId}/items/${idx}/document/${kind}/preview-url`,
    CLARIFICATION_ITEM_REMIND: (clarId: string, idx: number | string) =>
      `/audits/clarifications/${clarId}/items/${idx}/remind`,
    CLARIFICATION_ITEM_REVIEW: (clarId: string, idx: number | string) =>
      `/audits/clarifications/${clarId}/items/${idx}/review`,
    DELETE: (id: string) => `/audits/${id}`,
  },

  // Security / Users
  SECURITY: {
    USERS: '/security/users',
    USER_DETAIL: (id: string) => `/security/users/${id}`,
    USER_RIGHTS: '/security/user-rights',
    USER_ROLE_RIGHTS: '/security/user-role-rights',
    USER_CATEGORIES: '/security/user-categories',
    USER_MENU: '/security/user-menu',
  },

  // Master Data
  MASTER: {
    SUPPLIERS: '/master/suppliers',
    EQUIPMENT: '/master/equipment',
    SUSPECTED_KEYWORDS: '/master/suspected-keywords',
    REGISTERED: '/master/registered',
    OWNERSHIP: '/master/ownership',
  },

  // Dashboard
  DASHBOARD: {
    STATS: '/dashboard/stats',
    SOC_ALERTS: '/dashboard/soc-alerts',
  },
};
