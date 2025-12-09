/**
 * 对象工具函数
 * 提供常见的对象操作功能
 */

import { isObject, isPlainObject, isArray, isNil } from './index';

/**
 * 检查对象是否包含指定属性
 * @param obj 目标对象
 * @param key 要检查的属性键
 * @returns 是否包含该属性
 */
export const hasOwn = <T extends object>(obj: T, key: string | number | symbol): boolean => {
  return isObject(obj) && Object.prototype.hasOwnProperty.call(obj, key);
};

/**
 * 获取对象的所有键
 * @param obj 目标对象
 * @returns 键数组
 */
export const getKeys = <T extends object>(obj: T): (keyof T)[] => {
  if (!isObject(obj)) {
    return [];
  }
  
  return Object.keys(obj) as (keyof T)[];
};

/**
 * 获取对象的所有值
 * @param obj 目标对象
 * @returns 值数组
 */
export const getValues = <T extends object>(obj: T): any[] => {
  if (!isObject(obj)) {
    return [];
  }
  
  return Object.values(obj);
};

/**
 * 获取对象的所有键值对
 * @param obj 目标对象
 * @returns 键值对数组
 */
export const getEntries = <T extends object>(obj: T): [keyof T, T[keyof T]][] => {
  if (!isObject(obj)) {
    return [];
  }
  
  return Object.entries(obj) as [keyof T, T[keyof T]][];
};

/**
 * 安全地获取对象深层属性
 * @param obj 目标对象
 * @param path 属性路径，如 'a.b.c' 或 ['a', 'b', 'c']
 * @param defaultValue 默认值
 * @returns 属性值或默认值
 */
export const get = <T = any>(
  obj: Record<string, any>,
  path: string | string[],
  defaultValue?: T
): T => {
  if (!isObject(obj) || (typeof path !== 'string' && !isArray(path))) {
    return defaultValue as T;
  }
  
  const keys = typeof path === 'string' ? path.split('.') : path;
  let result: any = obj;
  
  for (const key of keys) {
    if (isNil(result) || !isObject(result) || !hasOwn(result, key)) {
      return defaultValue as T;
    }
    
    result = (result as Record<string, any>)[key];
  }
  
  return result as T;
};

/**
 * 安全地设置对象深层属性
 * @param obj 目标对象
 * @param path 属性路径，如 'a.b.c' 或 ['a', 'b', 'c']
 * @param value 要设置的值
 * @returns 设置后的对象
 */
export const set = <T extends object>(
  obj: T,
  path: string | string[],
  value: any
): T => {
  if (!isPlainObject(obj) || (typeof path !== 'string' && !isArray(path))) {
    return obj;
  }
  
  const keys = typeof path === 'string' ? path.split('.') : path;
  const newObj = { ...obj };
  let current: any = newObj;
  
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const isLastKey = i === keys.length - 1;
    
    if (isLastKey) {
      current[key] = value;
    } else {
      if (!isPlainObject(current[key])) {
        current[key] = {};
      }
      current = current[key];
    }
  }
  
  return newObj;
};

/**
 * 合并多个对象
 * @param objects 要合并的对象列表
 * @returns 合并后的新对象
 */
export const merge = <T extends object>(...objects: Partial<T>[]): T => {
  if (objects.length === 0) {
    return {} as T;
  }
  
  if (objects.length === 1) {
    return { ...objects[0] } as T;
  }
  
  // 使用更宽松的类型定义
  const result: any = {};
  
  objects.forEach(obj => {
    if (!isPlainObject(obj)) {
      return;
    }
    
    for (const key in obj) {
      if (hasOwn(obj, key)) {
        const value = obj[key];
        
        if (isPlainObject(value) && isPlainObject(result[key])) {
          result[key] = merge(result[key], value);
        } else {
          result[key] = value;
        }
      }
    }
  });
  
  return result as T;
};

/**
 * 从对象中删除指定属性
 * @param obj 目标对象
 * @param keys 要删除的属性键数组
 * @returns 删除属性后的新对象
 */
export const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  if (!isPlainObject(obj) || !isArray(keys)) {
    return obj as Omit<T, K>;
  }
  
  const newObj = { ...obj };
  
  for (const key of keys) {
    if (hasOwn(newObj, key)) {
      delete newObj[key];
    }
  }
  
  return newObj as Omit<T, K>;
};

/**
 * 从对象中提取指定属性
 * @param obj 目标对象
 * @param keys 要提取的属性键数组
 * @returns 提取的属性组成的新对象
 */
export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  if (!isPlainObject(obj) || !isArray(keys)) {
    return {} as Pick<T, K>;
  }
  
  const newObj = {} as Pick<T, K>;
  
  for (const key of keys) {
    if (hasOwn(obj, key)) {
      newObj[key] = obj[key];
    }
  }
  
  return newObj;
};

/**
 * 判断两个对象是否深度相等
 * @param obj1 第一个对象
 * @param obj2 第二个对象
 * @returns 是否深度相等
 */
export const isEqual = (obj1: any, obj2: any): boolean => {
  // 处理基本类型和引用相同的情况
  if (obj1 === obj2) {
    return true;
  }
  
  // 处理null和undefined
  if (isNil(obj1) || isNil(obj2)) {
    return false;
  }
  
  // 处理类型不同的情况
  if (typeof obj1 !== typeof obj2) {
    return false;
  }
  
  // 处理数组
  if (isArray(obj1) && isArray(obj2)) {
    if (obj1.length !== obj2.length) {
      return false;
    }
    
    return obj1.every((item: any, index: number) => isEqual(item, obj2[index]));
  }
  
  // 处理普通对象
  if (isPlainObject(obj1) && isPlainObject(obj2)) {
    const keys1 = getKeys(obj1);
    const keys2 = getKeys(obj2);
    
    if (keys1.length !== keys2.length) {
      return false;
    }
    
    return keys1.every((key: any) => hasOwn(obj2, key) && isEqual(obj1[key], obj2[key]));
  }
  
  // 处理其他类型（日期、正则等）
  if (obj1 instanceof Date && obj2 instanceof Date) {
    return obj1.getTime() === obj2.getTime();
  }
  
  if (obj1 instanceof RegExp && obj2 instanceof RegExp) {
    return obj1.source === obj2.source && obj1.flags === obj2.flags;
  }
  
  // 默认情况返回值比较
  return obj1 === obj2;
};

/**
 * 将对象转换为查询字符串
 * @param obj 对象
 * @returns 查询字符串
 */
export const toQueryString = (obj: Record<string, any>): string => {
  if (!isPlainObject(obj)) {
    return '';
  }
  
  return Object.entries(obj)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
};

export default {
  hasOwn,
  getKeys,
  getValues,
  getEntries,
  get,
  set,
  merge,
  omit,
  pick,
  isEqual,
  toQueryString
};