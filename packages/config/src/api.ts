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