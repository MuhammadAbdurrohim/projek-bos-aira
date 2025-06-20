/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  TIMEOUT: 30000, // 30 seconds
};

/**
 * Authentication
 */
export const AUTH = {
  TOKEN_KEY: 'airastore_token',
  USER_KEY: 'airastore_user',
  ROLES: {
    ADMIN: 'admin',
    USER: 'user',
  },
};

/**
 * Order Status
 */
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

/**
 * Payment Status
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

/**
 * File Upload
 */
export const UPLOAD = {
  MAX_SIZE: 2 * 1024 * 1024, // 2MB
  ALLOWED_TYPES: {
    IMAGE: ['image/jpeg', 'image/png', 'image/gif'],
    DOCUMENT: ['application/pdf'],
  },
  IMAGE_DIMENSIONS: {
    PRODUCT: {
      width: 800,
      height: 800,
    },
    AVATAR: {
      width: 200,
      height: 200,
    },
  },
};

/**
 * Pagination
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PER_PAGE: 10,
  PER_PAGE_OPTIONS: [10, 25, 50, 100],
};

/**
 * Date Formats
 */
export const DATE_FORMAT = {
  DISPLAY: {
    DATE: 'dd MMM yyyy',
    TIME: 'HH:mm',
    DATETIME: 'dd MMM yyyy HH:mm',
  },
  INPUT: {
    DATE: 'yyyy-MM-dd',
    TIME: 'HH:mm',
    DATETIME: 'yyyy-MM-dd\'T\'HH:mm',
  },
};

/**
 * Navigation
 */
export const NAV_ITEMS = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: 'ri-dashboard-line',
  },
  {
    title: 'Products',
    path: '/dashboard/produk',
    icon: 'ri-shopping-bag-line',
  },
  {
    title: 'Categories',
    path: '/dashboard/kategori',
    icon: 'ri-price-tag-3-line',
  },
  {
    title: 'Orders',
    path: '/dashboard/pesanan',
    icon: 'ri-shopping-cart-line',
  },
  {
    title: 'Live Streams',
    path: '/dashboard/live-stream',
    icon: 'ri-live-line',
  },
  {
    title: 'Users',
    path: '/dashboard/pengguna',
    icon: 'ri-user-line',
  },
  {
    title: 'Settings',
    path: '/dashboard/pengaturan',
    icon: 'ri-settings-line',
  },
];

/**
 * Form Validation Messages
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL: 'Please enter a valid email address',
  PHONE: 'Please enter a valid phone number',
  PASSWORD: {
    MIN_LENGTH: 'Password must be at least 8 characters',
    MATCH: 'Passwords do not match',
  },
  FILE: {
    SIZE: 'File size must be less than 2MB',
    TYPE: 'File type not supported',
  },
};

/**
 * Toast Messages
 */
export const TOAST_MESSAGES = {
  SUCCESS: {
    CREATE: 'Created successfully',
    UPDATE: 'Updated successfully',
    DELETE: 'Deleted successfully',
    SAVE: 'Changes saved successfully',
  },
  ERROR: {
    CREATE: 'Failed to create',
    UPDATE: 'Failed to update',
    DELETE: 'Failed to delete',
    SAVE: 'Failed to save changes',
    GENERIC: 'Something went wrong',
  },
};

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  THEME: 'airastore_theme',
  LANGUAGE: 'airastore_language',
  SIDEBAR_STATE: 'airastore_sidebar',
};

/**
 * Theme
 */
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
};

/**
 * Languages
 */
export const LANGUAGES = {
  EN: 'en',
  ID: 'id',
};

/**
 * Currency
 */
export const CURRENCY = {
  CODE: 'IDR',
  SYMBOL: 'Rp',
  LOCALE: 'id-ID',
};
