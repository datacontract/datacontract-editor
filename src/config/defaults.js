/**
 * Default configuration for the Data Contract Editor
 *
 * Uses Vite build-time environment variables (VITE_*).
 * For local dev: create .env.local with your keys
 * For Azure Static Web Apps: set env vars in Azure portal
 * For Docker: these are overridden by config.json at runtime
 */

export const DEFAULT_AI_CONFIG = {
  enabled: !!import.meta.env.VITE_AI_API_KEY,
  endpoint: import.meta.env.VITE_AI_ENDPOINT || '',
  apiKey: import.meta.env.VITE_AI_API_KEY || '',
  model: import.meta.env.VITE_AI_MODEL || 'gpt-4o',
  authHeader: import.meta.env.VITE_AI_AUTH_HEADER || 'bearer',
  maxTokens: 16384,
  temperature: 0.7,
};

export const DEFAULT_TESTS_CONFIG = {
  enabled: true,
  dataContractCliApiServerUrl: import.meta.env.VITE_TESTS_SERVER_URL || null,
  apiKey: null,
};
