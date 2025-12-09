/**
 * 数组工具函数
 * 提供常见的数组操作功能
 */

import { isArray } from './index';

/**
 * 安全地获取数组元素
 * @param array 数组
 * @param index 索引
 * @param defaultValue 默认值
 * @returns 数组元素或默认值
 */
export const getArrayItem = <T = any>(array: T[], index: number, defaultValue: T): T => {
  if (!isArray(array) || index < 0 || index >= array.length) {
    return defaultValue;
  }
  
  return array[index];
};

/**
 * 数组去重
 * @param array 原始数组
 * @returns 去重后的新数组
 */
export const uniqueArray = <T = any>(array: T[]): T[] => {
  if (!isArray(array)) {
    return array as any;
  }
  
  return [...new Set(array)];
};

/**
 * 深度数组去重
 * @param array 原始数组
 * @returns 深度去重后的新数组
 */
export const deepUniqueArray = <T = any>(array: T[]): T[] => {
  if (!isArray(array)) {
    return array as any;
  }
  
  const seen = new Map<string, boolean>();
  const result: T[] = [];
  
  for (const item of array) {
    let key: string;
    
    try {
      // 使用 JSON.stringify 作为唯一标识符
      key = JSON.stringify(item);
    } catch (error) {
      // 处理无法序列化的情况
      key = item?.toString() || Math.random().toString();
    }
    
    if (!seen.has(key)) {
      seen.set(key, true);
      result.push(item);
    }
  }
  
  return result;
};

/**
 * 数组分组
 * @param array 原始数组
 * @param key 分组键或分组函数
 * @returns 分组后的对象
 */
export const groupBy = <T = any>(
  array: T[],
  key: string | ((item: T) => string | number)
): Record<string | number, T[]> => {
  if (!isArray(array)) {
    return {};
  }
  
  return array.reduce((groups, item) => {
    const groupKey = typeof key === 'function' ? key(item) : (item as any)[key];
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string | number, T[]>);
};

/**
 * 数组扁平化
 * @param array 嵌套数组
 * @returns 扁平化后的数组
 */
export const flattenArray = <T = any>(array: any[]): T[] => {
  if (!isArray(array)) {
    return array as any;
  }
  
  return array.reduce((result, item) => {
    if (Array.isArray(item)) {
      return result.concat(flattenArray(item));
    }
    return result.concat(item);
  }, [] as T[]);
};

/**
 * 数组随机排序
 * @param array 原始数组
 * @returns 随机排序后的新数组
 */
export const shuffleArray = <T = any>(array: T[]): T[] => {
  if (!isArray(array)) {
    return array as any;
  }
  
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  
  return newArray;
};

/**
 * 从数组中随机获取一个元素
 * @param array 原始数组
 * @returns 随机元素或 null
 */
export const getRandomItem = <T = any>(array: T[]): T | null => {
  if (!isArray(array) || array.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

/**
 * 安全地删除数组元素
 * @param array 原始数组
 * @param index 要删除的索引
 * @returns 新的数组
 */
export const removeArrayItem = <T = any>(array: T[], index: number): T[] => {
  if (!isArray(array)) {
    return array as any;
  }
  
  if (index < 0 || index >= array.length) {
    return [...array];
  }
  
  const newArray = [...array];
  newArray.splice(index, 1);
  return newArray;
};

/**
 * 数组交集
 * @param arrays 多个数组
 * @returns 交集数组
 */
export const intersection = <T = any>(...arrays: T[][]): T[] => {
  if (!arrays || arrays.length === 0) {
    return [];
  }
  
  // 检查所有参数是否都是数组
  if (!arrays.every(isArray)) {
    return [];
  }
  
  // 以最短的数组为基准
  const shortestArray = arrays.reduce((a, b) => (a.length <= b.length ? a : b));
  const otherArrays = arrays.filter(arr => arr !== shortestArray);
  
  return shortestArray.filter(item => 
    otherArrays.every(arr => arr.includes(item))
  );
};

/**
 * 数组并集
 * @param arrays 多个数组
 * @returns 并集数组
 */
export const union = <T = any>(...arrays: T[][]): T[] => {
  if (!arrays || arrays.length === 0) {
    return [];
  }
  
  // 检查所有参数是否都是数组
  if (!arrays.every(isArray)) {
    return [];
  }
  
  const set = new Set<T>();
  
  for (const array of arrays) {
    for (const item of array) {
      set.add(item);
    }
  }
  
  return [...set];
};

export default {
  getArrayItem,
  uniqueArray,
  deepUniqueArray,
  groupBy,
  flattenArray,
  shuffleArray,
  getRandomItem,
  removeArrayItem,
  intersection,
  union
};