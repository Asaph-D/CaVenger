/**
 * Configuration de l'API
 * 
 * Modifiez cette valeur selon votre environnement :
 * - Développement local : 'http://localhost:3000/api'
 * - Production : 'https://votre-domaine.com/api'
 */
export const API_CONFIG = {
  baseUrl: 'http://localhost:3000/api',
  authEndpoint: '/auth',
  cvEndpoint: '/cv'
};

/**
 * Construit l'URL complète pour un endpoint d'authentification
 */
export function getAuthUrl(endpoint: string): string {
  return `${API_CONFIG.baseUrl}${API_CONFIG.authEndpoint}${endpoint}`;
}

/**
 * Construit l'URL complète pour un endpoint CV
 */
export function getCvUrl(endpoint: string): string {
  return `${API_CONFIG.baseUrl}${API_CONFIG.cvEndpoint}${endpoint}`;
}




