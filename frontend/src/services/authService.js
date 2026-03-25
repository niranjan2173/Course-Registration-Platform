import apiClient from './apiClient';
import { clearSession, getCurrentUser as getUserFromSession, setCurrentUser, setSession } from './session';

const authService = {
  async login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password });
    setSession({ authToken: response.data.token, user: response.data.user });
    return response.data.user;
  },

  async register({ name, email, password, department, phone, address, location, studyLevel, institution, dob }) {
    const response = await apiClient.post('/auth/register', {
      name,
      email,
      password,
      department,
      phone,
      address,
      location,
      studyLevel,
      institution,
      dob,
    });
    return response.data;
  },

  async updateProfile(payload) {
    const response = await apiClient.put('/users/me', payload);
    setCurrentUser(response.data.user);
    return response.data.user;
  },

  async getProfile() {
    const response = await apiClient.get('/users/me');
    setCurrentUser(response.data.user);
    return response.data.user;
  },

  async uploadAvatar(asset) {
    const data = new FormData();
    const fileName = asset?.fileName || `avatar-${Date.now()}.jpg`;
    const fileType = asset?.mimeType || 'image/jpeg';

    data.append('avatar', {
      uri: asset.uri,
      name: fileName,
      type: fileType,
    });

    const response = await apiClient.post('/users/me/avatar', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setCurrentUser(response.data.user);
    return response.data.user;
  },

  logout() {
    clearSession();
  },

  getCurrentUser() {
    return getUserFromSession();
  },

  isAdmin() {
    return getUserFromSession()?.role === 'admin';
  },
};

export default authService;
