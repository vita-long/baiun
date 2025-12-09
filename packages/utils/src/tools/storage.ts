/**
 * Storage工具函数
 * 提供localStorage和sessionStorage的安全封装
 */

import { isString, isObject, isNumber, isBoolean, isUndefined } from './index';

/**
 * 存储类型枚举
 */
export enum StorageType {
  LOCAL = 'localStorage',
  SESSION = 'sessionStorage'
}

/**
 * 检查存储是否可用
 * @param type 存储类型
 * @returns 是否可用
 */
export const isStorageAvailable = (type: StorageType): boolean => {
  try {
    // 确保在浏览器环境中
    if (typeof window === 'undefined') {
      return false;
    }
    
    const storage = window[type];
    if (!storage) {
      return false;
    }
    
    // 测试存储是否可写
    const testKey = '__storage_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    // 处理隐私模式或存储配额限制
    return false;
  }
};

/**
 * 获取存储实例
 * @param type 存储类型
 * @returns 存储实例或null
 */
function getStorageInstance(type: StorageType): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    return window[type];
  } catch (error) {
    return null;
  }
}

/**
 * 设置存储项
 * @param key 键名
 * @param value 值，可以是字符串、数字、布尔值、对象或数组
 * @param type 存储类型，默认为localStorage
 * @returns 是否设置成功
 */
export const setStorage = (
  key: string,
  value: string | number | boolean | object | null | undefined,
  type: StorageType = StorageType.LOCAL
): boolean => {
  if (!isString(key) || key.trim() === '') {
    return false;
  }
  
  const storage = getStorageInstance(type);
  if (!storage) {
    return false;
  }
  
  try {
    let valueToStore: string;
    
    // 处理不同类型的值
    if (value === null || isUndefined(value)) {
      valueToStore = 'null';
    } else if (isString(value) || isNumber(value) || isBoolean(value)) {
      valueToStore = String(value);
    } else if (isObject(value)) {
      // 尝试序列化对象
      valueToStore = JSON.stringify(value);
    } else {
      valueToStore = String(value);
    }
    
    storage.setItem(key, valueToStore);
    return true;
  } catch (error) {
    // 处理存储错误（如配额限制）
    return false;
  }
};

/**
 * 获取存储项
 * @param key 键名
 * @param type 存储类型，默认为localStorage
 * @param defaultValue 默认值
 * @returns 存储的值，如果不存在则返回默认值
 */
export const getStorage = <T = string>(
  key: string,
  type: StorageType = StorageType.LOCAL,
  defaultValue?: T
): T | undefined => {
  if (!isString(key) || key.trim() === '') {
    return defaultValue;
  }
  
  const storage = getStorageInstance(type);
  if (!storage) {
    return defaultValue;
  }
  
  try {
    const value = storage.getItem(key);
    
    if (value === null) {
      return defaultValue;
    }
    
    // 尝试解析为JSON
    try {
      return JSON.parse(value) as T;
    } catch (e) {
      // 如果解析失败，返回原始字符串
      // 处理特殊值
      if (value === 'true') {
        return true as unknown as T;
      } else if (value === 'false') {
        return false as unknown as T;
      } else if (value === 'null') {
        return null as unknown as T;
      }
      // 尝试解析为数字
      const num = Number(value);
      if (!isNaN(num) && String(num) === value) {
        return num as unknown as T;
      }
      
      return value as unknown as T;
    }
  } catch (error) {
    return defaultValue;
  }
};

/**
 * 删除存储项
 * @param key 键名
 * @param type 存储类型，默认为localStorage
 * @returns 是否删除成功
 */
export const removeStorage = (
  key: string,
  type: StorageType = StorageType.LOCAL
): boolean => {
  if (!isString(key) || key.trim() === '') {
    return false;
  }
  
  const storage = getStorageInstance(type);
  if (!storage) {
    return false;
  }
  
  try {
    storage.removeItem(key);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * 清除所有存储项
 * @param type 存储类型，默认为localStorage
 * @returns 是否清除成功
 */
export const clearStorage = (type: StorageType = StorageType.LOCAL): boolean => {
  const storage = getStorageInstance(type);
  if (!storage) {
    return false;
  }
  
  try {
    storage.clear();
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * 获取所有存储项
 * @param type 存储类型，默认为localStorage
 * @returns 包含所有存储项的对象
 */
export const getAllStorage = (type: StorageType = StorageType.LOCAL): Record<string, any> => {
  const result: Record<string, any> = {};
  
  const storage = getStorageInstance(type);
  if (!storage) {
    return result;
  }
  
  try {
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key) {
        result[key] = getStorage(key, type);
      }
    }
  } catch (error) {
    // 忽略错误
  }
  
  return result;
};

/**
 * 检查存储项是否存在
 * @param key 键名
 * @param type 存储类型，默认为localStorage
 * @returns 是否存在
 */
export const hasStorage = (
  key: string,
  type: StorageType = StorageType.LOCAL
): boolean => {
  if (!isString(key) || key.trim() === '') {
    return false;
  }
  
  const storage = getStorageInstance(type);
  if (!storage) {
    return false;
  }
  
  try {
    return storage.getItem(key) !== null;
  } catch (error) {
    return false;
  }
};

/**
 * 获取存储项数量
 * @param type 存储类型，默认为localStorage
 * @returns 存储项数量
 */
export const getStorageLength = (type: StorageType = StorageType.LOCAL): number => {
  const storage = getStorageInstance(type);
  if (!storage) {
    return 0;
  }
  
  try {
    return storage.length;
  } catch (error) {
    return 0;
  }
};

/**
 * 获取指定索引的键名
 * @param index 索引
 * @param type 存储类型，默认为localStorage
 * @returns 键名，如果不存在则返回null
 */
export const getStorageKey = (
  index: number,
  type: StorageType = StorageType.LOCAL
): string | null => {
  if (!isNumber(index) || index < 0) {
    return null;
  }
  
  const storage = getStorageInstance(type);
  if (!storage) {
    return null;
  }
  
  try {
    return storage.key(index);
  } catch (error) {
    return null;
  }
};

/**
 * 设置带过期时间的存储项
 * @param key 键名
 * @param value 值
 * @param expireIn 过期时间（毫秒）
 * @param type 存储类型，默认为localStorage
 * @returns 是否设置成功
 */
export const setStorageWithExpiry = (
  key: string,
  value: string | number | boolean | object | null | undefined,
  expireIn: number,
  type: StorageType = StorageType.LOCAL
): boolean => {
  if (!isNumber(expireIn) || expireIn <= 0) {
    return setStorage(key, value, type);
  }
  
  const expiryTime = Date.now() + expireIn;
  const data = {
    value,
    expiry: expiryTime
  };
  
  return setStorage(key, data, type);
};

/**
 * 获取带过期时间的存储项
 * @param key 键名
 * @param type 存储类型，默认为localStorage
 * @param defaultValue 默认值
 * @returns 存储的值，如果已过期则返回默认值并删除该项
 */
export const getStorageWithExpiry = <T = string>(
  key: string,
  type: StorageType = StorageType.LOCAL,
  defaultValue?: T
): T | undefined => {
  try {
    const data = getStorage<{ value: T; expiry: number }>(key, type);
    
    // 如果数据不存在或不是预期格式，返回默认值
    if (!isObject(data) || isUndefined(data.expiry)) {
      return defaultValue;
    }
    
    const now = Date.now();
    
    // 检查是否已过期
    if (data.expiry < now) {
      // 已过期，删除该项
      removeStorage(key, type);
      return defaultValue;
    }
    
    return data.value;
  } catch (error) {
    return defaultValue;
  }
};

/**
 * 存储管理器类
 * 提供更便捷的存储操作方式
 */
export class StorageManager {
  private type: StorageType;
  
  constructor(type: StorageType = StorageType.LOCAL) {
    this.type = type;
  }
  
  /**
   * 设置存储项
   */
  set(key: string, value: any): boolean {
    return setStorage(key, value, this.type);
  }
  
  /**
   * 获取存储项
   */
  get<T = string>(key: string, defaultValue?: T): T | undefined {
    return getStorage(key, this.type, defaultValue);
  }
  
  /**
   * 删除存储项
   */
  remove(key: string): boolean {
    return removeStorage(key, this.type);
  }
  
  /**
   * 清除所有存储项
   */
  clear(): boolean {
    return clearStorage(this.type);
  }
  
  /**
   * 检查存储项是否存在
   */
  has(key: string): boolean {
    return hasStorage(key, this.type);
  }
  
  /**
   * 获取所有存储项
   */
  getAll(): Record<string, any> {
    return getAllStorage(this.type);
  }
  
  /**
   * 获取存储项数量
   */
  getLength(): number {
    return getStorageLength(this.type);
  }
  
  /**
   * 获取指定索引的键名
   */
  getKey(index: number): string | null {
    return getStorageKey(index, this.type);
  }
  
  /**
   * 设置带过期时间的存储项
   */
  setWithExpiry(key: string, value: any, expireIn: number): boolean {
    return setStorageWithExpiry(key, value, expireIn, this.type);
  }
  
  /**
   * 获取带过期时间的存储项
   */
  getWithExpiry<T = string>(key: string, defaultValue?: T): T | undefined {
    return getStorageWithExpiry(key, this.type, defaultValue);
  }
  
  /**
   * 检查存储是否可用
   */
  isAvailable(): boolean {
    return isStorageAvailable(this.type);
  }
}

// 创建默认实例
export const localStorage = new StorageManager(StorageType.LOCAL);
export const sessionStorage = new StorageManager(StorageType.SESSION);

export default {
  StorageType,
  isStorageAvailable,
  setStorage,
  getStorage,
  removeStorage,
  clearStorage,
  getAllStorage,
  hasStorage,
  getStorageLength,
  getStorageKey,
  setStorageWithExpiry,
  getStorageWithExpiry,
  StorageManager,
  localStorage,
  sessionStorage
};