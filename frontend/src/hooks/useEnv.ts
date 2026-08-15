/**
 * Hook personnalisé pour accéder aux variables d'environnement
 * @returns Les variables d'environnement configurées
 */
export function useEnv() {
  return {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    appName: import.meta.env.VITE_APP_NAME,
    appVersion: import.meta.env.VITE_APP_VERSION,
  };
}
