import { RequestClient } from '@baiun/utils';
import { storage } from '@/utils/storage';
import type { AxiosError } from '@baiun/utils';

// 使用Vite的环境变量，避免TypeScript错误
// 开发环境默认配置
const DEFAULT_DEV_API = 'http://localhost:3012';
const DEFAULT_PROD_API = 'http://47.93.63.238:3012';
const DEFAULT_API_PREFIX = '/api';

// 根据import.meta.env获取环境变量，使用VITE_前缀，提供默认值
const apiHost = import.meta.env.VITE_API_HOST || (import.meta.env.DEV ? DEFAULT_DEV_API : DEFAULT_PROD_API);
const apiPrefix = import.meta.env.VITE_API_PREFIX || DEFAULT_API_PREFIX;

const request = new RequestClient({
  baseURL: `${apiHost}${apiPrefix}`,
  interceptors: {
    request: {
      onFulfilled: (config) => {
        config.headers = {
            ...config.headers,
            'Authorization': `Bearer ${storage.get('accessToken')}`,
          };
        return config;
      },
    },
  },
  authCallback: (error: AxiosError) => {
    const code = (error.response?.data as { code?: number })?.code;
    // 未登录，跳转登录页
    if (code === 12001) {
      storage.remove('accessToken');
      storage.remove('refreshToken');
      window.location.href = '/login';
    } else if(code === 12003) {
      // token 过期
      storage.remove('accessToken');
      storage.remove('refreshToken');
      window.location.href = '/login';
    }
  },
});

export { request };
export default request;
export * from './category';
export * from './product';
export * from './order';
export * from './stock';
export * from './member';
export * from './coupon';