/**
 * 克隆工具函数
 * 提供深拷贝和浅拷贝功能
 */

import { isPlainObject, isArray } from './index';

/**
 * 浅拷贝函数
 * @param target 要拷贝的目标对象
 * @returns 拷贝后的新对象
 */
export const shallowClone = <T>(target: T): T => {
  if (target === null || typeof target !== 'object') {
    return target;
  }
  
  if (isArray(target)) {
    return [...target] as unknown as T;
  }
  
  if (isPlainObject(target)) {
    return { ...target };
  }
  
  // 对于其他对象类型，返回原始对象
  return target;
};

/**
 * 深拷贝函数
 * 支持对象、数组、日期、正则表达式等常用数据类型
 * @param target 要深拷贝的目标对象
 * @param cache 缓存对象，用于处理循环引用
 * @returns 深拷贝后的新对象
 */
export const deepClone = <T>(target: T, cache: WeakMap<any, any> = new WeakMap()): T => {
  // 基本类型直接返回
  if (target === null || typeof target !== 'object') {
    return target;
  }
  
  // 处理循环引用
  if (cache.has(target)) {
    return cache.get(target);
  }
  
  // 处理日期对象
  if (target instanceof Date) {
    const result = new Date(target.getTime());
    cache.set(target, result);
    return result as unknown as T;
  }
  
  // 处理正则表达式
  if (target instanceof RegExp) {
    const result = new RegExp(target.source, target.flags);
    cache.set(target, result);
    return result as unknown as T;
  }
  
  // 处理数组
  if (isArray(target)) {
    const result: any[] = [];
    cache.set(target, result);
    
    for (let i = 0; i < target.length; i++) {
      result[i] = deepClone(target[i], cache);
    }
    
    return result as unknown as T;
  }
  
  // 处理普通对象
  if (isPlainObject(target)) {
    const result: Record<string, any> = {};
    cache.set(target, result);
    
    for (const key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        result[key] = deepClone(target[key], cache);
      }
    }
    
    return result as unknown as T;
  }
  
  // 对于其他对象类型，返回原始对象
  return target;
};

export default {
  shallowClone,
  deepClone
};