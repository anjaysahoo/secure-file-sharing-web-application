import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { NavigateFunction } from 'react-router-dom';

interface User {
  username: string;
  password: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
}

interface FileAccessPayload {
  username: string;
  file_id: number;
  action: 'grant' | 'revoke';
}

const apiClient: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json'
  }
});

const refreshToken = async (): Promise<string> => {
  const refresh_token = localStorage.getItem('refresh_token');
  try {
    const response: AxiosResponse<TokenResponse> = await apiClient.post('/users/refresh', {}, {
      headers: {
        'Authorization': `Bearer ${refresh_token}`
      }
    });
    localStorage.setItem('access_token', response.data.access_token);
    if (response.data.refresh_token) {
      localStorage.setItem('refresh_token', response.data.refresh_token);
    }
    return response.data.access_token;
  } catch (error) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    throw error;
  }
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      error.response?.data?.detail?.includes('expired_token') &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshToken();
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const api = {
  register(user: User): Promise<AxiosResponse> {
    return apiClient.post('/users/register', user);
  },

  login(user: User): Promise<AxiosResponse> {
    return apiClient.post('/users/login', user);
  },

  refreshToken,

  logout(): Promise<AxiosResponse> {
    const refresh_token = localStorage.getItem('refresh_token');
    return apiClient.post('/users/logout', {}, {
      headers: {
        'Authorization': `Bearer ${refresh_token}`
      }
    });
  },

  getAllFiles(): Promise<AxiosResponse> {
    const access_token = localStorage.getItem('access_token');
    return apiClient.get('/files', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
  },

  uploadFile(formData: FormData): Promise<AxiosResponse> {
    const access_token = localStorage.getItem('access_token');
    const isAdmin = localStorage.getItem('is_admin') === 'true';

    if (!isAdmin) {
      return Promise.reject(new Error('Only admins can upload files.'));
    }

    return apiClient.post('/files/upload/', formData, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  manageFileAccess(payload: FileAccessPayload): Promise<AxiosResponse> {
    const access_token = localStorage.getItem('access_token');
    const isAdmin = localStorage.getItem('is_admin') === 'true';

    if (!isAdmin) {
      return Promise.reject(new Error('Only admins can manage file access.'));
    }

    return apiClient.post('/users/file-access/', payload, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
  },

  deleteFile(fileId: number): Promise<AxiosResponse> {
    const access_token = localStorage.getItem('access_token');
    const isAdmin = localStorage.getItem('is_admin') === 'true';

    if (!isAdmin) {
      return Promise.reject(new Error('Only admins can delete files.'));
    }

    return apiClient.delete(`/files/delete/${fileId}`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
  },

  grantAdmin(username: string): Promise<AxiosResponse> {
    const access_token = localStorage.getItem('access_token');
    const isAdmin = localStorage.getItem('is_admin') === 'true';

    if (!isAdmin) {
      return Promise.reject(new Error('Only admins can grant admin rights.'));
    }

    return apiClient.post('/users/grant-admin/', { username }, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
  },

  getUserStatistics(): Promise<AxiosResponse> {
    const access_token = localStorage.getItem('access_token');
    return apiClient.get('/users/user-statistics', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
  },

  downloadFile(fileId: number): Promise<AxiosResponse> {
    const access_token = localStorage.getItem('access_token');
    return apiClient.get(`/files/download/${fileId}`, {
      responseType: 'blob',
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
  }
};

export default api;
