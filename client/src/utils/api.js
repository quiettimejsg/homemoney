import axios from 'axios';
import i18n from '@/locales/i18n.js';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true
});

// 请求拦截器
api.interceptors.request.use(config => {
  config.signal = new AbortController().signal;
  return config;
}, error => {
  return Promise.reject(error);
});

// 响应拦截器
api.interceptors.response.use(
  response => response.data,
  error => {
    if (axios.isCancel(error)) {
      const cancelError = new Error(i18n.t('expense.common.requestCanceled'));
      cancelError.code = 'REQUEST_CANCELED';
      return Promise.reject(cancelError);
    }
    const apiError = new Error(error.response?.data?.error?.message || i18n.t('expense.common.networkError'));
    apiError.code = error.response?.status || 'NETWORK_ERROR';
    apiError.details = error.config;
    return Promise.reject(error);
  }
);

export default api;
