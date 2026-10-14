import axios from 'axios';
import { API_BASE_URL } from '../constants/config';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

let accessToken = null;
let refreshToken = null;
let refreshPromise = null;
let sessionHandlers = {};

export const setSessionTokens = tokens => {
  accessToken = tokens?.accessToken ?? null;
  refreshToken = tokens?.refreshToken ?? null;
};

export const getRefreshToken = () => refreshToken;

// onTokensRefreshed: persist the rotated pair.
// onSessionExpired: the refresh token was rejected, so the user must log in again.
export const setSessionHandlers = handlers => {
  sessionHandlers = handlers || {};
};

// Bare axios on purpose: going through axiosClient would run this response
// interceptor on the refresh call itself.
const refreshSession = async () => {
  const { data } = await axios.post(
    `${API_BASE_URL}/auth/refresh`,
    { refreshToken },
    { timeout: 10000 },
  );
  setSessionTokens(data?.data);
  await sessionHandlers.onTokensRefreshed?.(data?.data);
  return data?.data?.accessToken;
};

axiosClient.interceptors.request.use(config => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  response => response,
  async error => {
    const config = error?.config;
    const sentToken = config?.headers?.Authorization;

    // Requests without a token (login's "Incorrect password" is a 401 too)
    // and already-retried requests are passed through untouched.
    if (error?.response?.status !== 401 || !sentToken || config._retried || !refreshToken) {
      return Promise.reject(error);
    }

    config._retried = true;

    // Another request already refreshed while this one was in flight.
    if (accessToken && sentToken !== `Bearer ${accessToken}`) {
      return axiosClient(config);
    }

    // Every 401 that arrives during a refresh waits on the same call:
    // refresh tokens are single-use, so a second concurrent refresh would
    // look like token reuse to the server and end the session.
    if (!refreshPromise) {
      refreshPromise = refreshSession().finally(() => {
        refreshPromise = null;
      });
    }

    try {
      await refreshPromise;
    } catch (refreshError) {
      // A network failure isn't a dead session; only the server rejecting
      // the refresh token is.
      const status = refreshError?.response?.status;
      if (status === 400 || status === 401) {
        setSessionTokens(null);
        sessionHandlers.onSessionExpired?.();
      }
      return Promise.reject(error);
    }

    return axiosClient(config);
  },
);

export default axiosClient;
