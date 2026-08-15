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
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    if (error.response) {
      // Erreur avec réponse du serveur
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Erreur sans réponse
      console.error('API Error: No response received');
    } else {
      // Erreur de configuration
      console.error('API Error:', error.message);
    }
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
