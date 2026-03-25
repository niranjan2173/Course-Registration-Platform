import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { getToken } from './session';

const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }

  const hostUri = Constants.expoConfig?.hostUri || '';
  const host = hostUri.split(':')[0];

  if (host) {
    if (Platform.OS === 'android' && (host === 'localhost' || host === '127.0.0.1')) {
      return 'http://10.0.2.2:4000/api';
    }
    return `http://${host}:4000/api`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000/api';
  }

  return 'http://localhost:4000/api';
};

export const apiBaseUrl = getApiBaseUrl();

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Debug base URL in web dev console
if (typeof window !== 'undefined') {
  console.log('[API] Base URL:', apiClient.defaults.baseURL);
}

apiClient.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
