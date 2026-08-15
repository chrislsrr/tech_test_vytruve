import axios from 'axios';

// Configuration de base de l'API avec l'URL depuis les variables d'environnement
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification si disponible
// Sauf pour les routes d'authentification (login, register)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const isAuthRoute = config.url?.includes('/auth/');
    
    
    
    if (token && token !== 'undefined' && token !== 'null' && !isAuthRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (!token || token === 'undefined' || token === 'null') {
      // Supprimer le header Authorization si présent
      delete config.headers.Authorization;
    }
    
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

// Exemple de fonctions API
export const fetchUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const fetchUserById = async (id: string) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};
