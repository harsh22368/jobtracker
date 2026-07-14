import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Applications ──

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

// ── JD Parser ──

export const parseJobDescription = async (rawText) => {
  const response = await api.post('/jd/parse', { rawText });
  return response.data;
};

// ── Interview Rounds ──

export const getRounds = async (appId) => {
  const response = await api.get(`/applications/${appId}/rounds`);
  return response.data;
};

export const addRounds = async (appId, rounds) => {
  const response = await api.post(`/applications/${appId}/rounds`, rounds);
  return response.data;
};

export const updateRound = async (appId, roundId, data) => {
  const response = await api.put(`/applications/${appId}/rounds/${roundId}`, data);
  return response.data;
};

export const deleteRound = async (appId, roundId) => {
  const response = await api.delete(`/applications/${appId}/rounds/${roundId}`);
  return response.data;
};

export default api;
