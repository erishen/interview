/**
 * 应用通用常量
 */

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    REGISTER: '/auth/register',
  },
  ITEMS: {
    LIST: '/items',
    CREATE: '/items',
    DETAIL: '/items/:id',
    UPDATE: '/items/:id',
    DELETE: '/items/:id',
  },
  REDIS: {
    STATS: '/redis/stats',
    KEYS: '/redis/keys',
    SET: '/redis/set',
    GET: '/redis/get',
    DELETE: '/redis/delete',
  },
} as const

export const VALIDATION_RULES = {
  EMAIL_MAX_LENGTH: 255,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MAX_LENGTH: 100,
} as const
