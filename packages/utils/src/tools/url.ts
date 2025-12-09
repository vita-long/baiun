/**
 * URL 工具函数
 * 提供地址栏参数获取和操作功能
 */

/**
 * 获取 URL 中的查询参数
 * @param url 可选，指定的 URL 字符串，默认为当前页面 URL
 * @returns 查询参数对象
 */
export const getQueryParams = (url?: string): Record<string, string> => {
  const params: Record<string, string> = {};
  const queryString = url
    ? url.includes('?')
      ? url.split('?')[1]
      : ''
    : window.location.search.substring(1);
  
  if (!queryString) return params;
  
  const pairs = queryString.split('&');
  
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    if (key) {
      params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
    }
  }
  
  return params;
};

/**
 * 根据键名获取 URL 中的查询参数值
 * @param key 查询参数键名
 * @param url 可选，指定的 URL 字符串，默认为当前页面 URL
 * @returns 查询参数值，如果不存在返回 null
 */
export const getQueryParam = (key: string, url?: string): string | null => {
  const params = getQueryParams(url);
  return params[key] ?? null;
};

/**
 * 构建带查询参数的 URL
 * @param baseUrl 基础 URL
 * @param params 查询参数对象
 * @returns 构建后的完整 URL
 */
export const buildUrlWithParams = (baseUrl: string, params: Record<string, any>): string => {
  if (!params || typeof params !== 'object') return baseUrl;
  
  const url = new URL(baseUrl, window.location.origin);
  
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  }
  
  // 如果是相对路径，去掉 origin
  if (baseUrl.startsWith('/')) {
    return url.pathname + url.search;
  }
  
  return url.toString();
};

/**
 * 从 URL 中删除指定的查询参数
 * @param url 原始 URL
 * @param keys 要删除的参数键名数组
 * @returns 删除参数后的新 URL
 */
export const removeQueryParams = (url: string, keys: string[]): string => {
  const urlObj = new URL(url, window.location.origin);
  
  for (const key of keys) {
    urlObj.searchParams.delete(key);
  }
  
  // 保持原始 URL 的路径格式
  if (url.startsWith('/')) {
    return urlObj.pathname + urlObj.search;
  }
  
  return urlObj.toString();
};

/**
 * 获取 URL 的路径部分
 * @param url 可选，指定的 URL 字符串，默认为当前页面 URL
 * @returns URL 的路径部分
 */
export const getPathname = (url?: string): string => {
  try {
    const urlObj = url ? new URL(url, window.location.origin) : window.location;
    return urlObj.pathname;
  } catch (error) {
    console.error('Invalid URL:', error);
    return '';
  }
};

/**
 * 获取 URL 的协议部分
 * @param url 可选，指定的 URL 字符串，默认为当前页面 URL
 * @returns URL 的协议部分（http: 或 https:）
 */
export const getProtocol = (url?: string): string => {
  try {
    const urlObj = url ? new URL(url) : window.location;
    return urlObj.protocol;
  } catch (error) {
    console.error('Invalid URL:', error);
    return window.location.protocol;
  }
};

export default {
  getQueryParams,
  getQueryParam,
  buildUrlWithParams,
  removeQueryParams,
  getPathname,
  getProtocol
};