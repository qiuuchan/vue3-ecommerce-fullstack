import axios from 'axios';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ElMessage } from 'element-plus';
import { getAccessToken, setAccessToken, clearAccessToken } from '@/utils/tokenStorage';

// 接口基础地址：在项目根目录建 .env 可写 VITE_API_BASE_URL=https://你的域名
// 不写则用 /api，开发时可在 vite 里配代理把 /api 转到后端
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

// 创建 axios 实例：统一超时时间、请求头等
export const request: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
});

// 请求拦截：在发请求前做统一处理（带上内存中的 accessToken 和界面语言）
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // 携带当前界面语言，供后端返回多语言业务数据
    const locale = typeof window !== 'undefined' ? localStorage.getItem('app_locale') || 'zh-CN' : 'zh-CN';
    if (config.headers) {
      config.headers['Accept-Language'] = locale;
      // 使用自定义 header，避免浏览器覆盖 Accept-Language
      config.headers['X-App-Language'] = locale;
    }
    // 记录请求开始时间，用于后续耗时监控
    (config as InternalAxiosRequestConfig & { metadata?: { startTime: number } }).metadata = { startTime: Date.now() };
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 从 axios 错误里取出给人看的文案（单测与拦截器共用，避免逻辑散两处）
 */
export function getAxiosErrorMessage(error: AxiosError<{ message?: string }>): string {
  const backendMsg = error.response?.data?.message;
  return backendMsg || error.message || '请求失败，请稍后再试';
}

let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

const processQueue = (token: string): void => {
  pendingRequests.forEach((cb) => cb(token));
  pendingRequests = [];
};

const redirectToLogin = (): void => {
  clearAccessToken();
  window.localStorage.removeItem('refresh_token');
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

// 响应拦截：统一处理“请求失败”时的提示和日志，并支持 401 自动刷新 Token
request.interceptors.response.use(
  (response) => {
    const config = response.config as InternalAxiosRequestConfig & { metadata?: { startTime: number } };
    const startTime = config.metadata?.startTime;
    if (startTime) {
      const duration = Date.now() - startTime;
      if (duration > 1000) {
        console.warn(`[SlowRequest] ${config.method?.toUpperCase()} ${config.url} took ${duration}ms`);
      }
    }
    return response;
  },
  async (error: AxiosError<{ message?: string }>) => {
    const originalConfig = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    // 401 且不是重试请求时，尝试刷新 Token
    if (error.response?.status === 401 && originalConfig && !originalConfig._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingRequests.push((token: string) => {
            originalConfig.headers.Authorization = `Bearer ${token}`;
            resolve(request(originalConfig));
          });
        });
      }

      isRefreshing = true;
      originalConfig._retry = true;

      try {
        const refreshToken = window.localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }
        const res = await axios.post<{ token: string }>(`${baseURL}/auth/refresh`, { refreshToken });
        const newToken = res.data.token;
        setAccessToken(newToken);
        processQueue(newToken);
        originalConfig.headers.Authorization = `Bearer ${newToken}`;
        return request(originalConfig);
      } catch (refreshError) {
        pendingRequests = [];
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const msg = getAxiosErrorMessage(error);
    // 401 由 Token 刷新逻辑处理，此处不提示
    if (error.response?.status !== 401) {
      ElMessage.error(msg);
    }
    console.error('接口请求出错：', error);
    return Promise.reject(new Error(msg));
  }
);

/**
 * 带重试的 GET 请求
 * @param url 请求地址
 * @param params 查询参数
 * @param retries 剩余重试次数
 * @param delay 当前退避延迟（ms）
 */
async function getDataWithRetry<T>(
  url: string,
  params?: object,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    const res = await request.get<T>(url, { params });
    return res.data;
  } catch (error) {
    if (retries > 0 && axios.isAxiosError(error) && !error.response) {
      // 仅网络错误（无响应）时重试，有 HTTP 响应时不重试
      await new Promise((resolve) => setTimeout(resolve, delay));
      return getDataWithRetry<T>(url, params, retries - 1, delay * 2);
    }
    throw error;
  }
}

// GET：直接返回响应里的 data（业务数据一般在 data 里），自带失败重试
export async function getData<T>(url: string, params?: object): Promise<T> {
  return getDataWithRetry<T>(url, params);
}

/**
 * 带重试的通用请求封装（支持 POST/PUT/DELETE）
 * @param method HTTP 方法
 * @param url 请求地址
 * @param data 请求体
 * @param retries 剩余重试次数
 * @param delay 当前退避延迟（ms）
 */
async function requestWithRetry<T>(
  method: 'post' | 'put' | 'delete',
  url: string,
  data?: unknown,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    let res;
    if (method === 'post') {
      res = await request.post<T>(url, data);
    } else if (method === 'put') {
      res = await request.put<T>(url, data);
    } else {
      res = await request.delete<T>(url);
    }
    return res.data;
  } catch (error) {
    if (retries > 0 && axios.isAxiosError(error) && !error.response) {
      // 仅网络错误（无响应）时重试
      await new Promise((resolve) => setTimeout(resolve, delay));
      return requestWithRetry<T>(method, url, data, retries - 1, delay * 2);
    }
    throw error;
  }
}

// POST（带重试）
export async function postData<T>(url: string, body?: unknown): Promise<T> {
  return requestWithRetry<T>('post', url, body);
}

// PUT（带重试）
export async function putData<T>(url: string, body?: unknown): Promise<T> {
  return requestWithRetry<T>('put', url, body);
}

// DELETE（带重试）
export async function deleteData<T>(url: string): Promise<T> {
  return requestWithRetry<T>('delete', url);
}

// 请求去重：相同 URL + 方法 + 参数的正在进行的请求会被复用
const pendingRequestMap = new Map<string, Promise<unknown>>();

function buildRequestKey(method: string, url: string, data?: unknown): string {
  const dataKey = data ? JSON.stringify(data) : '';
  return `${method}:${url}:${dataKey}`;
}

/**
 * 带去重的请求封装
 * @param method HTTP 方法
 * @param url 请求地址
 * @param data 请求体
 */
export async function dedupedRequest<T>(
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  data?: unknown
): Promise<T> {
  const key = buildRequestKey(method, url, data);
  if (pendingRequestMap.has(key)) {
    return pendingRequestMap.get(key) as Promise<T>;
  }

  let promise: Promise<T>;
  if (method === 'get') {
    promise = getData<T>(url, data as object | undefined);
  } else if (method === 'post') {
    promise = postData<T>(url, data);
  } else if (method === 'put') {
    promise = putData<T>(url, data);
  } else {
    promise = deleteData<T>(url);
  }

  pendingRequestMap.set(key, promise);
  promise.finally(() => {
    pendingRequestMap.delete(key);
  });

  return promise;
}

// 导出 CancelToken 以支持请求取消
export const CancelToken = axios.CancelToken;
