
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';
import { eventEmitter, ERROR_CODES } from './event-emit';

// 请求配置接口
export interface HttpClientConfig extends AxiosRequestConfig {
  retry?: number;
  retryDelay?: number;
}

// 文件上传选项接口
export interface UploadOptions extends HttpClientConfig {
  onUploadProgress?: (progressEvent: any) => void;
}

// 请求队列项接口
export interface RequestQueueItem {
  cancel: () => void;
  config: HttpClientConfig;
}

// 错误信息接口
export interface HttpErrorInfo {
  code: number | string;
  message: string;
  data?: any;
  status?: number;
  url?: string;
}

/**
 * HTTP客户端类
 * 封装了Axios，提供了更强大的请求能力，包括：
 * - 请求重试
 * - 重复请求取消
 * - 统一的错误处理
 * - 文件上传
 * - 批量请求
 */
export class HttpClient {
  private defaultConfig: HttpClientConfig;
  private axiosInstance: AxiosInstance;
  private requestQueue: Map<string, RequestQueueItem>;

  /**
   * 构造函数
   * @param config 初始化配置
   */
  constructor(config: HttpClientConfig = { retry: 0, retryDelay: 0}) {
    // 默认配置
    this.defaultConfig = {
      baseURL: config.baseURL || '',
      timeout: config.timeout || 10000,
      retry: config.retry || 0,
      retryDelay: config.retryDelay || 1000,
      withCredentials: config.withCredentials || false,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    };

    // 初始化Axios实例
    this.axiosInstance = this.createAxiosInstance();
    
    // 存储请求队列，用于取消重复请求
    this.requestQueue = new Map();
  }

  /**
   * 创建Axios实例
   * @returns Axios实例
   */
  private createAxiosInstance(): AxiosInstance {
    const instance = axios.create(this.defaultConfig);

    // 请求拦截器
    instance.interceptors.request.use(
      (config) => this.handleRequest(config),
      (error) => this.handleRequestError(error)
    );

    // 响应拦截器
    instance.interceptors.response.use(
      (response) => this.handleResponse(response),
      (error) => this.handleResponseError(error)
    );

    return instance;
  }

  /**
   * 请求前处理
   * @param config 请求配置
   * @returns 处理后的请求配置
   */
  private handleRequest(config: any): any {
    // 添加请求ID用于追踪
    (config as any).requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 检查是否有重复请求
    const requestKey = this.generateRequestKey(config);
    if (this.requestQueue.has(requestKey)) {
      // 取消之前的相同请求
      this.requestQueue.get(requestKey)?.cancel();
    }

    // 创建取消令牌
    const source = axios.CancelToken.source();
    config.cancelToken = source.token;
    
    // 将请求加入队列
    this.requestQueue.set(requestKey, { cancel: source.cancel, config });

    // 添加认证token（如果存在）
    const token = this.getToken();
    if (token && config.headers && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 触发请求开始事件
    eventEmitter.emit('requestStart', { config });

    console.log(`[HttpClient] 发起请求: ${config.method?.toUpperCase()} ${config.url}`, config.data || config.params);

    return config;
  }

  /**
   * 请求错误处理
   * @param error 请求错误
   * @returns 错误Promise
   */
  private handleRequestError(error: AxiosError): Promise<never> {
    console.error('[HttpClient] 请求配置错误:', error);
    eventEmitter.emit('requestError', { error });
    return Promise.reject(error);
  }

  /**
   * 响应处理
   * @param response 响应对象
   * @returns 响应对象
   */
  private handleResponse(response: AxiosResponse): AxiosResponse {
    const requestKey = this.generateRequestKey(response.config as HttpClientConfig);
    this.requestQueue.delete(requestKey);

    console.log(`[HttpClient] 响应成功: ${response.status} ${response.config.url}`, response.data);

    // 触发响应成功事件
    eventEmitter.emit('responseSuccess', { 
      response, 
      config: response.config 
    });

    return response;
  }

  /**
   * 响应错误处理
   * @param error 响应错误
   * @returns 错误Promise
   */
  private async handleResponseError(error: AxiosError): Promise<never> {
    if (error.config) {
      const requestKey = this.generateRequestKey(error.config as HttpClientConfig);
      this.requestQueue.delete(requestKey);
    }

    if (axios.isCancel(error)) {
      console.log('[HttpClient] 请求被取消:', error.message);
      return Promise.reject(new Error('REQUEST_CANCELLED'));
    }

    console.error('[HttpClient] 响应错误:', error);

    // 获取错误信息
    const errorInfo = this.parseError(error);

    // 根据错误类型进行处理
    switch (errorInfo.code) {
      case ERROR_CODES.UNAUTHORIZED:
        // 401错误，触发登录事件
        eventEmitter.emit('unauthorized', undefined);
        break;
        
      case ERROR_CODES.FORBIDDEN:
        eventEmitter.emit('forbidden', undefined);
        break;
        
      case ERROR_CODES.NOT_FOUND:
        eventEmitter.emit('notFound', undefined);
        break;
        
      case ERROR_CODES.SERVER_ERROR:
        eventEmitter.emit('serverError', errorInfo);
        break;
        
      case ERROR_CODES.NETWORK_ERROR:
        eventEmitter.emit('networkError', errorInfo);
        break;
        
      default:
        eventEmitter.emit('generalError', errorInfo);
    }

    // 触发通用错误事件
    eventEmitter.emit('responseError', { error, errorInfo });

    return Promise.reject(errorInfo);
  }

  /**
   * 解析错误信息
   * @param error Axios错误对象
   * @returns 格式化的错误信息
   */
  private parseError(error: AxiosError): HttpErrorInfo {
    if (error.response) {
      // 服务器返回错误状态码
      const responseData = error.response.data as { message?: string };
      return {
        code: error.response.status,
        message: responseData?.message || error.response.statusText,
        data: error.response.data,
        status: error.response.status,
        url: error.config?.url
      };
    } else if (error.request) {
      // 网络错误
      return {
        code: ERROR_CODES.NETWORK_ERROR,
        message: '网络连接失败，请检查网络',
        url: error.config?.url
      };
    } else {
      // 其他错误
      return {
        code: 'UNKNOWN_ERROR',
        message: error.message || '未知错误',
        url: error.config?.url
      };
    }
  }

  /**
   * 生成请求唯一键
   * @param config 请求配置
   * @returns 请求唯一键
   */
  private generateRequestKey(config: HttpClientConfig): string {
    const method = config.method?.toLowerCase() || 'get';
    const url = config.url || '';
    const params = JSON.stringify(config.params || {});
    const data = JSON.stringify(config.data || {});
    
    return `${method}:${url}?${params}:${data}`;
  }

  /**
   * 获取认证token
   * @returns token字符串
   */
  private getToken(): string | null {
    // 这里可以从localStorage、cookie或其他存储方式获取token
    // 实际项目中可能需要更复杂的token管理逻辑
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  }

  /**
   * 设置认证token
   * @param token token字符串
   * @param persistent 是否持久化存储
   */
  public setToken(token: string, persistent: boolean = true): void {
    if (persistent) {
      localStorage.setItem('auth_token', token);
    } else {
      sessionStorage.setItem('auth_token', token);
    }
  }

  /**
   * 清除认证token
   */
  public clearToken(): void {
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
  }

  /**
   * 通用请求方法
   * @param config 请求配置
   * @returns 响应数据
   */
  public async request<T = any>(config: HttpClientConfig): Promise<T> {
    try {
      const response = await this.axiosInstance(config);
      return response.data as T;
    } catch (error) {
      if (((config.retry === undefined) ? this.defaultConfig.retry || 0 : config.retry) > 0) {
        return this.retryRequest<T>(config, error as AxiosError);
      }
      throw error;
    }
  }

  /**
   * 重试请求
   * @param config 请求配置
   * @param error 错误对象
   * @param attempt 当前尝试次数
   * @returns 响应数据
   */
  private async retryRequest<T = any>(config: HttpClientConfig, error: AxiosError, attempt: number = 0): Promise<T> {
    const maxRetries = config.retry !== undefined ? config.retry : this.defaultConfig.retry || 0;
    
    if (attempt >= maxRetries) {
      throw error;
    }

    console.log(`[HttpClient] 请求重试第 ${attempt + 1} 次...`);
    
    // 等待一段时间后重试
    await this.delay(config.retryDelay || this.defaultConfig.retryDelay || 0);
    
    try {
      const response = await this.axiosInstance(config);
      return response.data as T;
    } catch (retryError) {
      if (attempt < maxRetries - 1) {
        return this.retryRequest<T>(config, retryError as AxiosError, attempt + 1);
      }
      throw retryError;
    }
  }

  /**
   * 延迟函数
   * @param ms 延迟毫秒数
   * @returns Promise
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * GET请求
   * @param url 请求地址
   * @param config 请求配置
   * @returns 响应数据
   */
  public get<T = any>(url: string, config: HttpClientConfig = {}): Promise<T> {
    return this.request<T>({ method: 'GET', url, ...config });
  }

  /**
   * POST请求
   * @param url 请求地址
   * @param data 请求数据
   * @param config 请求配置
   * @returns 响应数据
   */
  public post<T = any>(url: string, data: any, config: HttpClientConfig = {}): Promise<T> {
    return this.request<T>({ method: 'POST', url, data, ...config });
  }

  /**
   * PUT请求
   * @param url 请求地址
   * @param data 请求数据
   * @param config 请求配置
   * @returns 响应数据
   */
  public put<T = any>(url: string, data: any, config: HttpClientConfig = {}): Promise<T> {
    return this.request<T>({ method: 'PUT', url, data, ...config });
  }

  /**
   * DELETE请求
   * @param url 请求地址
   * @param config 请求配置
   * @returns 响应数据
   */
  public delete<T = any>(url: string, config: HttpClientConfig = {}): Promise<T> {
    return this.request<T>({ method: 'DELETE', url, ...config });
  }

  /**
   * PATCH请求
   * @param url 请求地址
   * @param data 请求数据
   * @param config 请求配置
   * @returns 响应数据
   */
  public patch<T = any>(url: string, data: any, config: HttpClientConfig = {}): Promise<T> {
    return this.request<T>({ method: 'PATCH', url, data, ...config });
  }

  /**
   * 文件上传方法
   * @param url 上传接口地址
   * @param fileData 文件数据，可以是单个文件、文件数组或包含文件的对象
   * @param config 配置选项
   * @param onUploadProgress 上传进度回调函数
   * @returns 响应数据
   */
  public upload<T = any>(url: string, fileData: File | File[] | Record<string, any>, config: HttpClientConfig = {}): Promise<T> {
    // 创建FormData对象
    const formData = new FormData();
    
    // 处理文件数据
    if (fileData instanceof File) {
      // 单个文件
      formData.append('file', fileData, fileData.name);
    } else if (Array.isArray(fileData)) {
      // 文件数组
      fileData.forEach((file, index) => {
        if (file instanceof File) {
          formData.append(`files[${index}]`, file, file.name);
        }
      });
    } else if (typeof fileData === 'object' && fileData !== null) {
      // 包含文件的对象
      for (const key in fileData) {
        if (Object.prototype.hasOwnProperty.call(fileData, key)) {
          const value = fileData[key];
          if (value instanceof File) {
            formData.append(key, value, value.name);
          } else if (Array.isArray(value)) {
            // 如果值是文件数组
            value.forEach((file, index) => {
              if (file instanceof File) {
                formData.append(`${key}[${index}]`, file, file.name);
              }
            });
          } else {
            // 普通字段
            formData.append(key, value as string | Blob);
          }
        }
      }
    }

    // 合并配置
    const uploadConfig: HttpClientConfig = {
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config.headers
      },
      ...config
    };

    return this.request<T>(uploadConfig);
  }

  /**
   * 批量请求
   * @param requests 请求配置数组
   * @returns 响应数据数组
   */
  public async all<T = any>(requests: HttpClientConfig[]): Promise<T[]> {
    return Promise.all(requests.map(req => this.request<T>(req)));
  }

  /**
   * 并发请求，返回最先完成的结果
   * @param requests 请求配置数组
   * @returns 最先完成的响应数据
   */
  public race<T = any>(requests: HttpClientConfig[]): Promise<T> {
    return Promise.race(requests.map(req => this.request<T>(req)));
  }

  /**
   * 取消所有请求
   */
  public cancelAllRequests(): void {
    for (const [key, request] of this.requestQueue) {
      request.cancel();
      this.requestQueue.delete(key);
    }
  }
}

// 创建默认实例
const httpClient = new HttpClient({
  baseURL: process.env.API_BASE_URL || '/api',
  timeout: 10000,
  retry: 2,
  retryDelay: 1000
});

// 导出实例
export default httpClient;