/**
 * Cookie工具函数
 * 提供Cookie的设置、获取和删除等功能
 */

import { isString, isNumber, isUndefined } from './index';

/**
 * Cookie选项接口
 */
export interface CookieOptions {
  /** 过期时间，单位为天 */
  expires?: number | Date;
  /** 路径 */
  path?: string;
  /** 域名 */
  domain?: string;
  /** 是否只能通过HTTPS访问 */
  secure?: boolean;
  /** SameSite属性，可以是 'strict', 'lax', 'none' */
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * 设置Cookie
 * @param name Cookie名称
 * @param value Cookie值
 * @param options Cookie选项
 */
export const setCookie = (
  name: string,
  value: string | number | boolean,
  options: CookieOptions = {}
): void => {
  if (!isString(name)) {
    return;
  }
  
  // 确保在浏览器环境中运行
  if (typeof document === 'undefined') {
    return;
  }
  
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(String(value))}`;
  
  // 处理过期时间
  if (options.expires) {
    let expiresDate: Date;
    
    if (options.expires instanceof Date) {
      expiresDate = options.expires;
    } else if (isNumber(options.expires)) {
      expiresDate = new Date();
      expiresDate.setTime(expiresDate.getTime() + options.expires * 24 * 60 * 60 * 1000);
    } else {
      expiresDate = new Date();
      // 默认会话结束时过期
    }
    
    cookieString += `; expires=${expiresDate.toUTCString()}`;
  }
  
  // 处理路径
  if (options.path) {
    cookieString += `; path=${options.path}`;
  } else {
    cookieString += '; path=/';
  }
  
  // 处理域名
  if (options.domain) {
    cookieString += `; domain=${options.domain}`;
  }
  
  // 处理安全标志
  if (options.secure || (typeof window !== 'undefined' && window.location.protocol === 'https:')) {
    cookieString += '; secure';
  }
  
  // 处理SameSite
  if (options.sameSite) {
    cookieString += `; samesite=${options.sameSite}`;
  }
  
  document.cookie = cookieString;
};

/**
 * 获取Cookie值
 * @param name Cookie名称
 * @returns Cookie值，如果不存在则返回undefined
 */
export const getCookie = (name: string): string | undefined => {
  if (!isString(name)) {
    return undefined;
  }
  
  // 确保在浏览器环境中运行
  if (typeof document === 'undefined') {
    return undefined;
  }
  
  const cookieName = encodeURIComponent(name) + '=';
  const cookieArray = document.cookie.split(';');
  
  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i].trim();
    
    // 检查是否以目标Cookie名称开始
    if (cookie.indexOf(cookieName) === 0) {
      return decodeURIComponent(cookie.substring(cookieName.length));
    }
  }
  
  return undefined;
};

/**
 * 删除Cookie
 * @param name Cookie名称
 * @param options Cookie选项（需要与设置时的路径和域名匹配）
 */
export const removeCookie = (name: string, options: Omit<CookieOptions, 'expires' | 'secure'> = {}): void => {
  if (!isString(name)) {
    return;
  }
  
  // 通过设置过期时间为过去时间来删除Cookie
  setCookie(name, '', {
    ...options,
    expires: new Date(0)
  });
};

/**
 * 清除所有Cookie
 * @param options Cookie选项（需要与设置时的路径和域名匹配）
 */
export const clearCookies = (options: Omit<CookieOptions, 'expires' | 'secure'> = {}): void => {
  // 确保在浏览器环境中运行
  if (typeof document === 'undefined') {
    return;
  }
  
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    const eqIndex = cookie.indexOf('=');
    const name = eqIndex > -1 ? cookie.substr(0, eqIndex) : cookie;
    
    if (name) {
      removeCookie(decodeURIComponent(name), options);
    }
  }
};

/**
 * 检查Cookie是否存在
 * @param name Cookie名称
 * @returns 是否存在
 */
export const hasCookie = (name: string): boolean => {
  return !isUndefined(getCookie(name));
};

/**
 * 获取所有Cookie
 * @returns 包含所有Cookie的对象
 */
export const getAllCookies = (): Record<string, string> => {
  const cookies: Record<string, string> = {};
  
  // 确保在浏览器环境中运行
  if (typeof document === 'undefined') {
    return cookies;
  }
  
  const cookieArray = document.cookie.split(';');
  
  for (let i = 0; i < cookieArray.length; i++) {
    const cookie = cookieArray[i].trim();
    
    if (cookie) {
      const parts = cookie.split('=');
      if (parts.length >= 2) {
        const name = decodeURIComponent(parts[0]);
        const value = decodeURIComponent(parts.slice(1).join('='));
        cookies[name] = value;
      }
    }
  }
  
  return cookies;
};

/**
 * 解析Cookie字符串
 * @param cookieString Cookie字符串
 * @returns 解析后的Cookie对象
 */
export const parseCookieString = (cookieString: string): Record<string, string> => {
  const cookies: Record<string, string> = {};
  
  if (!isString(cookieString)) {
    return cookies;
  }
  
  const cookieArray = cookieString.split(';');
  
  for (let i = 0; i < cookieArray.length; i++) {
    const cookie = cookieArray[i].trim();
    
    if (cookie) {
      const parts = cookie.split('=');
      if (parts.length >= 2) {
        const name = decodeURIComponent(parts[0]);
        const value = decodeURIComponent(parts.slice(1).join('='));
        cookies[name] = value;
      }
    }
  }
  
  return cookies;
};

/**
 * 生成Cookie字符串
 * @param cookies Cookie对象
 * @param options Cookie选项
 * @returns 生成的Cookie字符串
 */
export const generateCookieString = (
  cookies: Record<string, string | number | boolean>,
  options: CookieOptions = {}
): string => {
  const cookieStrings: string[] = [];
  
  Object.keys(cookies).forEach(name => {
    const value = cookies[name];
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(String(value))}`;
    
    // 处理过期时间
    if (options.expires instanceof Date) {
      cookieString += `; expires=${options.expires.toUTCString()}`;
    } else if (isNumber(options.expires)) {
      const expiresDate = new Date();
      expiresDate.setTime(expiresDate.getTime() + options.expires * 24 * 60 * 60 * 1000);
      cookieString += `; expires=${expiresDate.toUTCString()}`;
    }
    
    // 处理路径
    if (options.path) {
      cookieString += `; path=${options.path}`;
    }
    
    // 处理域名
    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }
    
    // 处理安全标志
    if (options.secure) {
      cookieString += '; secure';
    }
    
    // 处理SameSite
    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`;
    }
    
    cookieStrings.push(cookieString);
  });
  
  return cookieStrings.join('; ');
};

/**
 * 获取Cookie的过期时间
 * @param name Cookie名称
 * @returns 过期时间Date对象，如果是会话Cookie则返回null
 */
export const getCookieExpires = (name: string): Date | null => {
  if (!isString(name)) {
    return null;
  }
  
  // 确保在浏览器环境中运行
  if (typeof document === 'undefined') {
    return null;
  }
  
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    const parts = cookie.split(';');
    
    // 检查第一个部分是否是目标Cookie
    const firstPart = parts[0].trim();
    const eqIndex = firstPart.indexOf('=');
    const cookieName = eqIndex > -1 ? firstPart.substr(0, eqIndex) : firstPart;
    
    if (decodeURIComponent(cookieName) === name) {
      // 查找expires属性
      for (let j = 1; j < parts.length; j++) {
        const part = parts[j].trim();
        if (part.toLowerCase().startsWith('expires=')) {
          const expiresValue = part.substring(8);
          const expiresDate = new Date(expiresValue);
          
          if (!isNaN(expiresDate.getTime())) {
            return expiresDate;
          }
          
          break;
        }
      }
      
      // 如果没有找到expires属性，说明是会话Cookie
      return null;
    }
  }
  
  return null;
};

/**
 * 检查Cookie是否是会话Cookie
 * @param name Cookie名称
 * @returns 是否是会话Cookie
 */
export const isSessionCookie = (name: string): boolean => {
  return getCookieExpires(name) === null;
};

export default {
  setCookie,
  getCookie,
  removeCookie,
  clearCookies,
  hasCookie,
  getAllCookies,
  parseCookieString,
  generateCookieString,
  getCookieExpires,
  isSessionCookie
};