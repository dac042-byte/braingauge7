import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getPassage = () => api.get('/passage');

export const uploadAudio = (audioBlob, duration) => {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.wav');
  formData.append('duration', duration);

  return api.post('/audio/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    params: { duration }
  });
};

export const submitCognitiveTest = (data) =>
  api.post('/cognitive/submit', data);

export const submitVisualTest = (data) =>
  api.post('/visual/submit', data);

export const getWeeklyScore = () =>
  api.get('/score/weekly');

export const getHistory = () =>
  api.get('/history');

export const getInsights = () =>
  api.get('/insights');

export const resetBaseline = () =>
  api.post('/baseline/reset');

export default api;
