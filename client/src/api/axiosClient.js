import axios from 'axios';
import { API_BASE_URL } from '../constants/config';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

let currentUserId = null;

export const setCurrentUserId = id => {
  currentUserId = id;
};

axiosClient.interceptors.request.use(config => {
  if (currentUserId) {
    config.headers['x-user-id'] = currentUserId;
  }
  return config;
});

export default axiosClient;
