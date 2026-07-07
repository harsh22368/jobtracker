import axios from 'axios';

const api = axios.create({
  // Use Vercel's environment variable for production, fallback to relative /api for local dev
  baseURL: import.meta.env.VITE_API_URL || '/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getApplications = async (params) => {
  const response = await api.get('/applications', { params });
  return response.data;
};

export const getApplicationById = async (id) => {
  const response = await api.get(`/applications/${id}`);
  return response.data;
};

export const createApplication = async (data) => {
  const response = await api.post('/applications', data);
  return response.data;
};

export const updateApplication = async (id, data) => {
  const response = await api.put(`/applications/${id}`, data);
  return response.data;
};

export const deleteApplication = async (id) => {
  const response = await api.delete(`/applications/${id}`);
  return response.data;
};

export const uploadResume = async (id, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/applications/${id}/resume`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getResumeDownloadUrl = (id) => {
  return `${api.defaults.baseURL}/applications/${id}/resume`;
};

export default api;
