/**
 * Application-wide constants
 */
export const APP_CONFIG = {
  name: "Oceano Infrastructure Manager",
  version: "1.0.0",
  refreshInterval: 30000, // 30 seconds
  timeouts: {
    api: 10000, // 10 seconds
    refresh: 5000, // 5 seconds
  },
} as const;

/**
 * Service status constants
 */
export const SERVICE_STATUS = {
  RUNNING: "running",
  STOPPED: "stopped",
  WARNING: "warning",
  ERROR: "error",
} as const;

/**
 * Service status colors
 */
export const STATUS_COLORS = {
  [SERVICE_STATUS.RUNNING]: "text-green-500",
  [SERVICE_STATUS.WARNING]: "text-yellow-500",
  [SERVICE_STATUS.ERROR]: "text-red-500",
  [SERVICE_STATUS.STOPPED]: "text-gray-500",
} as const;

/**
 * Service status icons
 */
export const STATUS_ICONS = {
  [SERVICE_STATUS.RUNNING]: "🟢",
  [SERVICE_STATUS.WARNING]: "🟡",
  [SERVICE_STATUS.ERROR]: "🔴",
  [SERVICE_STATUS.STOPPED]: "⚫",
} as const;

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  services: "/api/services",
  metrics: "/api/metrics",
  serviceAction: (id: string) => `/api/services/${id}/action`,
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  theme: "oceano_theme",
  refreshInterval: "oceano_refresh_interval",
  lastRefresh: "oceano_last_refresh",
} as const;
