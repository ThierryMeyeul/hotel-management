import api from '../api/axios';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone_number: string;
  is_blocked: boolean;
  date_joined: string;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  username?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

class ProfileService {
  /**
   * Récupérer le profil de l'utilisateur connecté
   */
  async getProfile(): Promise<UserProfile> {
    const response = await api.get('/accounts/profile/');
    return response.data;
  }

  /**
   * Récupérer un utilisateur par son ID
   */
  async getUserById(userId: number): Promise<UserProfile> {
    const response = await api.get(`/accounts/users/${userId}/`);
    return response.data;
  }

  /**
   * Mettre à jour le profil
   */
  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    const response = await api.patch('/accounts/profile/update/', data);
    return response.data;
  }

  /**
   * Changer le mot de passe
   */
  async changePassword(data: ChangePasswordData): Promise<any> {
    const response = await api.post('/accounts/change-password/', data);
    return response.data;
  }

  /**
   * Uploader une photo de profil (si vous avez cette fonctionnalité)
   */
  async uploadAvatar(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/accounts/profile/avatar/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const profileService = new ProfileService();