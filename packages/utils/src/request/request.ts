import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import type { RequestConfig, BaseResponse, InstanceConfig } from './types';

class RequestClient {
  private instance: AxiosInstance;
  private loadingCount = 0;
  private loadingHandler?: {
    show: () => void;
    hide: () => void;
  };
  private errorHandler?: (error: AxiosError) => void;
  private authCallback?: (error: AxiosError) => void;

  constructor(config: InstanceConfig = {}) {
    // 创建axios实例
    this.instance = axios.create({
      baseURL: config.baseURL || '',
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        ...config.headers,
      },
    });
    this.authCallback = config?.authCallback;
    // 设置默认拦截器
    this.setupDefaultInterceptors(config.interceptors);
  }

  // 设置默认拦截器
  private setupDefaultInterceptors(customInterceptors?: InstanceConfig['interceptors']) {
    // 请求拦截器
    this.instance.interceptors.request.use(
      async (config) => {
        const requestConfig = config as RequestConfig;
        
        // 显示加载状态
        if (requestConfig.showLoading) {
          this.showLoading();
        }

        requestConfig.headers = { 
          ...requestConfig.headers,
        };

        // 自定义请求拦截
        if (customInterceptors?.request?.onFulfilled) {
          const result = await customInterceptors.request.onFulfilled(requestConfig);
          return result as any;
        }

        return requestConfig as any;
      },
      (error) => {
        // 隐藏加载状态
        this.hideLoading();

        // 自定义请求错误处理
        if (customInterceptors?.request?.onRejected) {
          return customInterceptors.request.onRejected(error);
        }

        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response) => {
        const config = response.config as RequestConfig;
        
        // 隐藏加载状态
        if (config.showLoading) {
          this.hideLoading();
        }

        // 自定义响应拦截
        if (config.skipResponseIntercept) {
          return response;
        }

        if (customInterceptors?.response?.onFulfilled) {
          return customInterceptors.response.onFulfilled(response);
        }

        // 默认响应处理
        const data = response.data as BaseResponse;
        if (data.code !== 0) {
          this.handleResponseError(data.message, config);
          return Promise.reject(new Error(data.message || '请求失败'));
        }

        return response;
      },
      (error: AxiosError) => {
        const config = error.config as RequestConfig;
        
        // 隐藏加载状态
        if (config?.showLoading) {
          this.hideLoading();
        }

        // 自定义响应错误处理
        if (customInterceptors?.response?.onRejected) {
          return customInterceptors.response.onRejected(error);
        }
        // 默认错误处理
        this.handleAxiosError(error, config);

        return Promise.reject(error);
      }
    );
  }

  // 显示加载状态
  private showLoading() {
    this.loadingCount++;
    if (this.loadingHandler && this.loadingCount === 1) {
      this.loadingHandler.show();
    }
  }

  // 隐藏加载状态
  private hideLoading() {
    this.loadingCount--;
    if (this.loadingHandler && this.loadingCount <= 0) {
      this.loadingHandler.hide();
      this.loadingCount = 0;
    }
  }

  // 处理响应错误
  private handleResponseError(message: string, config?: RequestConfig) {
    if (config?.errorHandler) {
      return config.errorHandler({} as AxiosError);
    }

    if (config?.showError !== false && this.errorHandler) {
      this.errorHandler({ message } as AxiosError);
    } else {
      console.error(message);
    }
  }

  // 处理axios错误
  private handleAxiosError(error: AxiosError, config?: RequestConfig) {
    if (config?.errorHandler) {
      return config.errorHandler(error);
    }

    let errorMessage = '请求失败';
    
    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 401:
          errorMessage = '未授权，请重新登录';
          this.authCallback?.(error);
          break;
        case 403:
          errorMessage = '拒绝访问';
          break;
        case 404:
          errorMessage = '请求的资源不存在';
          break;
        case 500:
          errorMessage = '服务器内部错误';
          break;
        default:
          errorMessage = `请求失败(${status})`;
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      errorMessage = '网络错误，请检查您的网络连接';
    } else {
      // 请求配置出错
      errorMessage = error.message || '请求配置错误';
    }

    if (config?.showError !== false && this.errorHandler) {
      this.errorHandler(error);
    } else {
      console.error(errorMessage);
    }
  }

  // 设置加载处理器
  setLoadingHandler(handler: {
    show: () => void;
    hide: () => void;
  }) {
    this.loadingHandler = handler;
  }

  // 设置全局错误处理器
  setErrorHandler(handler: (error: AxiosError) => void) {
    this.errorHandler = handler;
  }

  // 请求方法封装
  async request<T = any>(config: RequestConfig): Promise<T> {
    try {
      const response = await this.instance.request<BaseResponse<T>>(config);
      // 直接返回data字段
      return response.data.data as T;
    } catch (error) {
      throw error;
    }
  }

  // GET请求
  get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>({
      ...config,
      method: 'GET',
      url,
    });
  }

  // POST请求
  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>({
      ...config,
      method: 'POST',
      url,
      data,
    });
  }

  // PUT请求
  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>({
      ...config,
      method: 'PUT',
      url,
      data,
    });
  }

  // DELETE请求
  delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>({
      ...config,
      method: 'DELETE',
      url,
    });
  }

  // PATCH请求
  patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>({
      ...config,
      method: 'PATCH',
      url,
      data,
    });
  }
}

export type { AxiosError };

export default RequestClient;