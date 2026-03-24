import apiClient from './apiClient';

const userService = {
  async getAllUsersByAdmin() {
    const response = await apiClient.get('/admin/users');
    return response.data.users || [];
  },
  async updateUserByAdmin(userId, payload) {
    const response = await apiClient.put(`/admin/users/${userId}`, payload);
    return response.data.user;
  },

  async deleteUserByAdmin(userId) {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  },
};

export default userService;
