import RequestClient from './request';
import type {
  BaseResponse,
  RequestConfig,
  InterceptorConfig,
  InstanceConfig
} from './types';

// 创建默认实例
const defaultInstance = new RequestClient();

// 导出默认实例的方法
export const request = defaultInstance.request.bind(defaultInstance);
export const get = defaultInstance.get.bind(defaultInstance);
export const post = defaultInstance.post.bind(defaultInstance);
export const put = defaultInstance.put.bind(defaultInstance);
export const del = defaultInstance.delete.bind(defaultInstance);
export const patch = defaultInstance.patch.bind(defaultInstance);
export const setLoadingHandler = defaultInstance.setLoadingHandler.bind(defaultInstance);
export const setErrorHandler = defaultInstance.setErrorHandler.bind(defaultInstance);

// 导出类和类型
export { RequestClient };
export type {
  BaseResponse,
  RequestConfig,
  InterceptorConfig,
  InstanceConfig
};

// 默认导出
export default {
  request,
  get,
  post,
  put,
  delete: del,
  patch,
  setLoadingHandler,
  setErrorHandler,
  RequestClient
};