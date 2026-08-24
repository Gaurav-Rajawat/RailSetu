import axios from 'axios';
import { API_BASE_URL, MOCK_MODE } from '../config';
import { useAuthStore } from '../store/authStore';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

// Request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle MOCK_MODE for development without backend
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Check if network error and MOCK_MODE is true
    if (MOCK_MODE && error.config && error.config.url === '/auth/login') {
      console.warn('[MOCK MODE] Backend unreachable, returning mock login response.');
      
      return new Promise((resolve) => {
        setTimeout(() => {
          let reqData = { employeeId: 'EMP001' };
          try {
            if (error.config.data) {
              reqData = JSON.parse(error.config.data);
            }
          } catch (e) {}

          resolve({
            data: {
              token: 'mock-jwt-token-12345',
              user: {
                id: 'usr_1',
                employeeId: reqData.employeeId,
                name: 'Jane Doe',
                role: 'Field Inspector',
              }
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: error.config,
          } as any);
        }, 500);
      });
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials: { employeeId: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
};

export const reportApi = {
  submitReport: async (report: import('../types/report').Report) => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            serverId: 'srv_' + report.id,
            status: 'SUBMITTED',
          });
        }, 800);
      });
    }

    const formData = new FormData();
    formData.append('id', report.id);
    formData.append('category', report.category);
    formData.append('description', report.description);
    formData.append('latitude', String(report.latitude));
    formData.append('longitude', String(report.longitude));
    
    if (report.photoUri) {
      const filename = report.photoUri.split('/').pop() || 'photo.jpg';
      formData.append('photo', {
        uri: report.photoUri,
        name: filename,
        type: 'image/jpeg',
      } as any);
    }

    if (report.voiceNoteUri) {
      const vFilename = report.voiceNoteUri.split('/').pop() || 'audio.m4a';
      formData.append('voiceNote', {
        uri: report.voiceNoteUri,
        name: vFilename,
        type: 'audio/m4a',
      } as any);
    }

    const response = await api.post('/reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
