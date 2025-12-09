/**
 * 工具函数库入口
 * 导出所有工具函数
 */

// 类型判断工具
/**
 * 判断值是否为数字（包括整数和浮点数，但排除NaN）
 * @param value 要判断的值
 * @returns 是数字返回true，否则返回false
 */
export const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

/**
 * 判断值是否为整数
 * @param value 要判断的值
 * @returns 是整数返回true，否则返回false
 */
export const isInteger = (value: unknown): value is number => {
  return isNumber(value) && Number.isInteger(value);
};

/**
 * 判断值是否为字符串
 * @param value 要判断的值
 * @returns 是字符串返回true，否则返回false
 */
export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

/**
 * 判断值是否为布尔值
 * @param value 要判断的值
 * @returns 是布尔值返回true，否则返回false
 */
export const isBoolean = (value: unknown): value is boolean => {
  return typeof value === 'boolean';
};

/**
 * 判断值是否为函数
 * @param value 要判断的值
 * @returns 是函数返回true，否则返回false
 */
export const isFunction = (value: unknown): value is Function => {
  return typeof value === 'function';
};

/**
 * 判断值是否为对象（排除null）
 * @param value 要判断的值
 * @returns 是对象返回true，否则返回false
 */
export const isObject = (value: unknown): value is object => {
  return value !== null && typeof value === 'object';
};

/**
 * 判断值是否为普通对象（非数组、非null、非日期等特殊对象）
 * @param value 要判断的值
 * @returns 是普通对象返回true，否则返回false
 */
export const isPlainObject = (value: unknown): value is Record<string, any> => {
  return isObject(value) && Object.prototype.toString.call(value) === '[object Object]';
};

/**
 * 判断值是否为数组
 * @param value 要判断的值
 * @returns 是数组返回true，否则返回false
 */
export const isArray = (value: unknown): value is any[] => {
  return Array.isArray(value);
};

/**
 * 判断值是否为null
 * @param value 要判断的值
 * @returns 是null返回true，否则返回false
 */
export const isNull = (value: unknown): value is null => {
  return value === null;
};

/**
 * 判断值是否为undefined
 * @param value 要判断的值
 * @returns 是undefined返回true，否则返回false
 */
export const isUndefined = (value: unknown): value is undefined => {
  return value === undefined;
};

/**
 * 判断值是否为null或undefined
 * @param value 要判断的值
 * @returns 是null或undefined返回true，否则返回false
 */
export const isNil = (value: unknown): value is null | undefined => {
  return isNull(value) || isUndefined(value);
};

/**
 * 判断值是否为NaN
 * @param value 要判断的值
 * @returns 是NaN返回true，否则返回false
 */
export const isNaNValue = (value: unknown): boolean => {
  return typeof value === 'number' && isNaN(value);
};

/**
 * 判断值是否为正则表达式
 * @param value 要判断的值
 * @returns 是正则表达式返回true，否则返回false
 */
export const isRegExp = (value: unknown): value is RegExp => {
  return isObject(value) && Object.prototype.toString.call(value) === '[object RegExp]';
};

/**
 * 判断值是否为日期对象
 * @param value 要判断的值
 * @returns 是日期对象返回true，否则返回false
 */
export const isDate = (value: unknown): value is Date => {
  return isObject(value) && Object.prototype.toString.call(value) === '[object Date]' && !isNaN((value as Date).getTime());
};

/**
 * 判断值是否为空（null、undefined、空字符串、空数组、空对象）
 * @param value 要判断的值
 * @returns 是空值返回true，否则返回false
 */
export const isEmpty = (value: unknown): boolean => {
  if (isNil(value)) return true;
  if (isString(value)) return value.trim() === '';
  if (isArray(value)) return value.length === 0;
  if (isPlainObject(value)) return Object.keys(value).length === 0;
  return false;
};

/**
 * 获取值的确切类型
 * @param value 要获取类型的值
 * @returns 字符串形式的类型名称
 */
export const getType = (value: unknown): string => {
  if (isNil(value)) return value === null ? 'null' : 'undefined';
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
};

// 导入其他工具函数
import * as clone from './clone';
import * as debounce from './debounce';
import * as url from './url';
import * as json from './json';
import * as string from './string';
import * as array from './array';
import * as object from './object';
import * as number from './number';
import * as date from './date';
import * as cookie from './cookie';
import * as storage from './storage';

// 导出所有工具函数
export { clone, debounce, url, json, string, array, object, number, date, cookie, storage };

export const utils = {
  // 类型判断工具
  isNumber,
  isInteger,
  isString,
  isBoolean,
  isFunction,
  isObject,
  isPlainObject,
  isArray,
  isNull,
  isUndefined,
  isNil,
  isNaNValue,
  isRegExp,
  isDate,
  isEmpty,
  getType,
  
  // 克隆工具
  ...clone,
  
  // 防抖节流工具
  ...debounce,
  
  // URL工具
  ...url,
  
  // JSON工具
  ...json,
  
  // 字符串工具
  ...string,
  
  // 数组工具
  ...array,
  
  // 对象工具
  ...object,
  
  // 数字工具
  ...number,
  
  // 日期工具
  ...date,
  
  // Cookie工具
  ...cookie,
  
  // 存储工具
  ...storage
};

export default utils;