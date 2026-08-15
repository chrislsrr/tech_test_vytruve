import api from './api';

// Types pour correspondre au backend NestJS
interface RegisterUserDto {
  name: string;
  email: string;
  password: string;
}

interface LoginUserDto {
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
}

// Service pour la gestion des utilisateurs
export const userService = {
  // Inscription d'un nouvel utilisateur
  register: async (data: RegisterUserDto): Promise<AuthResponse> => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  // Connexion d'un utilisateur
  login: async (data: LoginUserDto): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  // Récupérer le profil de l'utilisateur connecté
  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Récupérer tous les utilisateurs (si autorisé)
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  // Récupérer un utilisateur par ID
  getById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
};

export type { RegisterUserDto, LoginUserDto, AuthResponse, User };
