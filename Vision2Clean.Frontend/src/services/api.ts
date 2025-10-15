import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { config, endpoints } from '../config';

// Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
  version?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
  timestamp: string;
}

export interface RequestConfig extends AxiosRequestConfig {
  retry?: number;
  retryDelay?: number;
  skipAuth?: boolean;
  skipRetry?: boolean;
  timeout?: number;
}

// Cache implementation
class ApiCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = config.performance.cacheTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

// Request queue for managing concurrent requests
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private activeRequests = 0;

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          this.activeRequests++;
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.activeRequests--;
          this.processNext();
        }
      });

      this.processNext();
    });
  }

  private processNext(): void {
    if (this.activeRequests < config.performance.maxConcurrentRequests && this.queue.length > 0) {
      const nextRequest = this.queue.shift();
      if (nextRequest) {
        nextRequest();
      }
    }
  }
}

/**
 * Enhanced API Client with comprehensive error handling, caching, and retry logic
 */
class ApiClient {
  private client: AxiosInstance;
  private cache = new ApiCache();
  private requestQueue = new RequestQueue();

  constructor() {
    this.client = axios.create({
      baseURL: config.api.baseUrl,
      timeout: config.api.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Client-Version': config.app.version,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (requestConfig) => {
        // Add auth token
        const token = this.getAuthToken();
        const reqConfig = requestConfig as RequestConfig;
        if (token && !reqConfig.skipAuth) {
          requestConfig.headers.Authorization = `Bearer ${token}`;
        }

        // Add request timestamp
        requestConfig.headers['X-Request-Timestamp'] = new Date().toISOString();

        // Log request in development
        if (config.app.debug) {
          console.log(`🚀 API Request: ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`, {
            data: requestConfig.data,
            params: requestConfig.params,
          });
        }

        return requestConfig;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Log response in development
        if (config.app.debug) {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            data: response.data,
          });
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as RequestConfig;

        // Log error in development
        if (config.app.debug) {
          console.error(`❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
            status: error.response?.status,
            message: error.message,
            data: error.response?.data,
          });
        }

        // Handle authentication errors
        if (error.response?.status === 401 && !originalRequest?.skipAuth) {
          await this.handleAuthError();
          return Promise.reject(error);
        }

        // Retry logic
        if (this.shouldRetry(error, originalRequest)) {
          return this.retryRequest(originalRequest, error);
        }

        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  private getAuthToken(): string | null {
    return localStorage.getItem(config.auth.tokenKey);
  }

  private async handleAuthError(): Promise<void> {
    // Clear tokens
    localStorage.removeItem(config.auth.tokenKey);
    localStorage.removeItem(config.auth.refreshTokenKey);

    // Redirect to login or emit auth error event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
  }

  private shouldRetry(error: AxiosError, originalRequest?: RequestConfig): boolean {
    if (originalRequest?.skipRetry) return false;

    const retryAttempts = originalRequest?.retry ?? config.api.retryAttempts;
    const currentAttempts = (originalRequest as any)?._retryCount ?? 0;

    if (currentAttempts >= retryAttempts) return false;

    // Only retry on network errors or 5xx server errors
    if (!error.response) return true; // Network error
    if (error.response.status >= 500) return true; // Server error
    if (error.response.status === 429) return true; // Rate limit

    return false;
  }

  private async retryRequest(originalRequest: RequestConfig, _error: AxiosError): Promise<any> {
    const retryCount = ((originalRequest as any)._retryCount ?? 0) + 1;
    const retryDelay = originalRequest?.retryDelay ?? config.api.retryDelay;

    // Exponential backoff
    const delay = retryDelay * Math.pow(2, retryCount - 1);

    (originalRequest as any)._retryCount = retryCount;

    // Add jitter to prevent thundering herd
    const jitteredDelay = delay + Math.random() * 1000;

    console.log(`🔄 Retrying request (${retryCount}/${config.api.retryAttempts}) after ${jitteredDelay}ms`);

    await new Promise(resolve => setTimeout(resolve, jitteredDelay));

    return this.client.request(originalRequest);
  }

  private normalizeError(error: AxiosError): ApiError {
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    };

    if (error.response) {
      // Server responded with error status
      apiError.status = error.response.status;
      const responseData = error.response.data as any;
      apiError.message = responseData?.message || error.message;
      apiError.code = responseData?.code;
      apiError.details = responseData?.details;
    } else if (error.request) {
      // Network error
      apiError.message = 'Network error. Please check your connection.';
      apiError.code = 'NETWORK_ERROR';
    } else {
      // Request setup error
      apiError.message = error.message;
      apiError.code = 'REQUEST_ERROR';
    }

    return apiError;
  }

  private getCacheKey(method: string, url: string, params?: any): string {
    return `${method}:${url}:${JSON.stringify(params || {})}`;
  }

  /**
   * Generic request method with caching and queue management
   */
  async request<T = any>(config: RequestConfig): Promise<ApiResponse<T>> {
    const { method = 'GET', url = '', params, data, ...restConfig } = config;

    // Check cache for GET requests
    if (method.toLowerCase() === 'get') {
      const cacheKey = this.getCacheKey(method, url, params);
      const cachedData = this.cache.get(cacheKey);
      if (cachedData) {
        console.log(`💾 Cache hit: ${method.toUpperCase()} ${url}`);
        return cachedData;
      }
    }

    // Add to request queue
    return this.requestQueue.add(async () => {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.request({
        method,
        url,
        params,
        data,
        ...restConfig,
      });

      // Cache GET responses
      if (method.toLowerCase() === 'get') {
        const cacheKey = this.getCacheKey(method, url, params);
        this.cache.set(cacheKey, response.data);
      }

      return response.data;
    });
  }

  /**
   * Convenience methods
   */
  async get<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'GET', url, ...config });
  }

  async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'POST', url, data, ...config });
  }

  async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PUT', url, data, ...config });
  }

  async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PATCH', url, data, ...config });
  }

  async delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'DELETE', url, ...config });
  }

  /**
   * Upload file with progress tracking
   */
  async upload<T = any>(
    url: string,
    file: File | FormData,
    onProgress?: (progress: number) => void,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const formData = file instanceof FormData ? file : new FormData();
    if (file instanceof File) {
      formData.append('file', file);
    }

    return this.request<T>({
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          onProgress(progress);
        }
      },
      ...config,
    });
  }

  /**
   * Download file
   */
  async download(url: string, filename?: string, config?: RequestConfig): Promise<void> {
    const response = await this.client.request({
      method: 'GET',
      url,
      responseType: 'blob',
      ...config,
    });

    // Create download link
    const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = urlBlob;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(urlBlob);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Set auth token
   */
  setAuthToken(token: string): void {
    localStorage.setItem(config.auth.tokenKey, token);
  }

  /**
   * Remove auth token
   */
  removeAuthToken(): void {
    localStorage.removeItem(config.auth.tokenKey);
    localStorage.removeItem(config.auth.refreshTokenKey);
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Service classes for different API endpoints
export class AuthService {
  static async login(credentials: { email: string; password: string }) {
    return apiClient.post(endpoints.auth.login, credentials);
  }

  static async logout() {
    return apiClient.post(endpoints.auth.logout);
  }

  static async refreshToken() {
    const refreshToken = localStorage.getItem(config.auth.refreshTokenKey);
    return apiClient.post(endpoints.auth.refresh, { refreshToken });
  }

  static async getProfile() {
    return apiClient.get(endpoints.auth.profile);
  }
}

export class DetectionService {
  static async uploadImage(file: File, onProgress?: (progress: number) => void) {
    return apiClient.upload(endpoints.detection.upload, file, onProgress);
  }

  static async analyzeImage(imageId: string, options?: any) {
    return apiClient.post(endpoints.detection.analyze, { imageId, ...options });
  }

  static async getHistory(params?: { page?: number; limit?: number; type?: string }) {
    return apiClient.get(endpoints.detection.history, { params });
  }

  static async getResults(id: string) {
    return apiClient.get(endpoints.detection.results(id));
  }
}

export class AnalyticsService {
  static async getDashboardData(timeRange?: string) {
    return apiClient.get(endpoints.analytics.dashboard, { params: { timeRange } });
  }

  static async getPerformanceMetrics(timeRange?: string) {
    return apiClient.get(endpoints.analytics.performance, { params: { timeRange } });
  }

  static async getRegionalData() {
    return apiClient.get(endpoints.analytics.regions);
  }

  static async getCategoryBreakdown() {
    return apiClient.get(endpoints.analytics.categories);
  }

  static async exportData(format: 'csv' | 'pdf' | 'xlsx' = 'csv') {
    return apiClient.download(endpoints.analytics.export, `analytics-export.${format}`, {
      params: { format },
    });
  }
}

export class SystemService {
  static async getHealth() {
    return apiClient.get(endpoints.system.health, { skipAuth: true });
  }

  static async getMetrics() {
    return apiClient.get(endpoints.system.metrics);
  }

  static async getStatus() {
    return apiClient.get(endpoints.system.status);
  }
}

export default apiClient;