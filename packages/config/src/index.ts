// Configuration
export { siteConfig } from "./site";
export { apiConfig, fastApiConfig } from "./api";
export { dbConfig } from "./database";

// Styled Components Theme
export { defaultTheme } from "./styled-components";
export type { Theme } from "./styled-components";

// Environment utilities
export {
  getEnvVar,
  getEnvVarAsNumber,
  getEnvVarAsBoolean,
  isProduction,
  isDevelopment,
  isTest,
} from "./env";