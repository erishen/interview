export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  timeout: 10000,
  retries: 3,
  endpoints: {
    auth: {
      login: "/auth/login",
      logout: "/auth/logout",
      register: "/auth/register",
      refresh: "/auth/refresh",
      profile: "/auth/profile",
    },
    users: {
      list: "/users",
      create: "/users",
      update: "/users",
      delete: "/users",
    },
  },
};

// FastAPI Configuration
export const fastApiConfig = {
  baseUrl: process.env.FASTAPI_URL || "http://localhost:8081",
  timeout: 15000,
  retries: 2,
  endpoints: {
    auth: {
      login: "/auth/login",
      me: "/auth/me",
    },
    items: {
      list: "/items/",
      create: "/items/",
      update: "/items/",
      delete: "/items/",
      search: "/items/search",
    },
    redis: {
      ping: "/redis/ping",
      stats: "/redis/stats",
      keys: "/redis/keys",
      get: "/redis/get",
      set: "/redis/set",
      delete: "/redis/delete",
      expire: "/redis/expire",
      flush: "/redis/flushdb",
      cache: "/redis/cache/example",
    },
    system: {
      root: "/",
      health: "/health",
    },
  },
};