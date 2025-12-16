import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// 基础响应结构
export interface BaseResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 请求配置扩展
export interface RequestConfig extends AxiosRequestConfig {
  // 是否显示加载状态
  showLoading?: boolean;
  // 是否显示错误提示
  showError?: boolean;
  // 自定义错误处理
  errorHandler?: (error: AxiosError) => void;
  // 是否跳过响应拦截
  skipResponseIntercept?: boolean;
}

// 请求拦截器配置
export interface InterceptorConfig {
  // 请求拦截器
  request?: {
    onFulfilled?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
    onRejected?: (error: any) => any;
  };
  // 响应拦截器
  response?: {
    onFulfilled?: <T = any>(response: AxiosResponse<T>) => AxiosResponse<T> | Promise<AxiosResponse<T>>;
    onRejected?: (error: any) => any;
  };
}

// 实例配置
export interface InstanceConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  interceptors?: InterceptorConfig;
  authCallback?: (error: AxiosError) => void;
}