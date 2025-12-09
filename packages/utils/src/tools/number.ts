/**
 * 数字工具函数
 * 提供常见的数字操作和格式化功能
 */

import { isNumber, isInteger } from './index';

/**
 * 检查数字是否在指定范围内
 * @param num 要检查的数字
 * @param min 最小值
 * @param max 最大值
 * @param inclusive 是否包含边界，默认为 true
 * @returns 是否在范围内
 */
export const isInRange = (
  num: number,
  min: number,
  max: number,
  inclusive: boolean = true
): boolean => {
  if (!isNumber(num) || !isNumber(min) || !isNumber(max)) {
    return false;
  }
  
  if (inclusive) {
    return num >= min && num <= max;
  }
  
  return num > min && num < max;
};

/**
 * 限制数字在指定范围内
 * @param num 要限制的数字
 * @param min 最小值
 * @param max 最大值
 * @returns 限制后的数字
 */
export const clamp = (num: number, min: number, max: number): number => {
  if (!isNumber(num) || !isNumber(min) || !isNumber(max)) {
    return num;
  }
  
  return Math.min(Math.max(num, min), max);
};

/**
 * 生成随机数
 * @param min 最小值（包含）
 * @param max 最大值（包含）
 * @returns 随机数
 */
export const random = (min: number, max: number): number => {
  if (!isNumber(min) || !isNumber(max)) {
    return 0;
  }
  
  min = Math.ceil(min);
  max = Math.floor(max);
  
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * 格式化数字为千分位格式
 * @param num 要格式化的数字
 * @param decimals 小数位数，默认为 0
 * @returns 格式化后的字符串
 */
export const formatNumber = (num: number, decimals: number = 0): string => {
  if (!isNumber(num)) {
    return '0';
  }
  
  // 确保 decimals 是有效的整数
  const safeDecimals = Math.max(0, Math.floor(decimals));
  
  try {
    return num.toLocaleString('zh-CN', {
      minimumFractionDigits: safeDecimals,
      maximumFractionDigits: safeDecimals
    });
  } catch (error) {
    // 降级处理
    const parts = num.toFixed(safeDecimals).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }
};

/**
 * 格式化金额
 * @param amount 金额
 * @param decimals 小数位数，默认为 2
 * @param prefix 前缀，默认为 '¥'
 * @returns 格式化后的金额字符串
 */
export const formatCurrency = (
  amount: number,
  decimals: number = 2,
  prefix: string = '¥'
): string => {
  if (!isNumber(amount)) {
    return prefix + '0.00';
  }
  
  const formattedNumber = formatNumber(amount, decimals);
  return prefix + formattedNumber;
};

/**
 * 将数字转换为百分比
 * @param num 要转换的数字
 * @param decimals 小数位数，默认为 2
 * @param suffix 后缀，默认为 '%'
 * @returns 百分比字符串
 */
export const toPercentage = (
  num: number,
  decimals: number = 2,
  suffix: string = '%'
): string => {
  if (!isNumber(num)) {
    return '0' + suffix;
  }
  
  const percentage = num * 100;
  return formatNumber(percentage, decimals) + suffix;
};

/**
 * 安全地进行加法运算，避免浮点数精度问题
 * @param a 第一个数
 * @param b 第二个数
 * @returns 结果
 */
export const add = (a: number, b: number): number => {
  if (!isNumber(a) || !isNumber(b)) {
    return 0;
  }
  
  const precision = Math.pow(10, Math.max(getDecimalPlaces(a), getDecimalPlaces(b)));
  return Math.round((a * precision + b * precision) / precision);
};

/**
 * 安全地进行减法运算，避免浮点数精度问题
 * @param a 被减数
 * @param b 减数
 * @returns 结果
 */
export const subtract = (a: number, b: number): number => {
  if (!isNumber(a) || !isNumber(b)) {
    return 0;
  }
  
  const precision = Math.pow(10, Math.max(getDecimalPlaces(a), getDecimalPlaces(b)));
  return Math.round((a * precision - b * precision) / precision);
};

/**
 * 安全地进行乘法运算，避免浮点数精度问题
 * @param a 第一个数
 * @param b 第二个数
 * @returns 结果
 */
export const multiply = (a: number, b: number): number => {
  if (!isNumber(a) || !isNumber(b)) {
    return 0;
  }
  
  const precision = Math.pow(10, getDecimalPlaces(a) + getDecimalPlaces(b));
  return Math.round((a * b * precision) / precision);
};

/**
 * 安全地进行除法运算，避免浮点数精度问题
 * @param a 被除数
 * @param b 除数
 * @returns 结果
 */
export const divide = (a: number, b: number): number => {
  if (!isNumber(a) || !isNumber(b) || b === 0) {
    return 0;
  }
  
  // 处理除零错误
  if (b === 0) {
    return 0;
  }
  
  // 先转换为整数乘法，再除法
  const aDecimals = getDecimalPlaces(a);
  const bDecimals = getDecimalPlaces(b);
  const precision = Math.pow(10, bDecimals - aDecimals);
  
  return multiply(a * precision, 1 / b);
};

/**
 * 获取数字的小数位数
 * @param num 数字
 * @returns 小数位数
 */
function getDecimalPlaces(num: number): number {
  if (!isNumber(num) || isInteger(num)) {
    return 0;
  }
  
  const numStr = (num as number).toString();
  const decimalIndex = numStr.indexOf('.');
  
  if (decimalIndex === -1) {
    return 0;
  }
  
  return numStr.length - decimalIndex - 1;
}

/**
 * 生成范围内的数字数组
 * @param start 起始值
 * @param end 结束值
 * @param step 步长，默认为 1
 * @returns 数字数组
 */
export const range = (start: number, end: number, step: number = 1): number[] => {
  if (!isNumber(start) || !isNumber(end) || !isNumber(step) || step === 0) {
    return [];
  }
  
  const result: number[] = [];
  
  if (step > 0) {
    for (let i = start; i <= end; i += step) {
      result.push(i);
    }
  } else {
    for (let i = start; i >= end; i += step) {
      result.push(i);
    }
  }
  
  return result;
};

/**
 * 计算数组的平均值
 * @param arr 数字数组
 * @returns 平均值
 */
export const average = (arr: number[]): number => {
  if (!Array.isArray(arr) || arr.length === 0) {
    return 0;
  }
  
  const validNumbers = arr.filter(isNumber);
  
  if (validNumbers.length === 0) {
    return 0;
  }
  
  const sum = validNumbers.reduce((acc, num) => acc + num, 0);
  return sum / validNumbers.length;
};

/**
 * 计算数组的总和
 * @param arr 数字数组
 * @returns 总和
 */
export const sum = (arr: number[]): number => {
  if (!Array.isArray(arr) || arr.length === 0) {
    return 0;
  }
  
  return arr.filter(isNumber).reduce((acc, num) => acc + num, 0);
};

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @param decimals 小数位数，默认为 2
 * @returns 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (!isNumber(bytes) || bytes < 0) {
    return '0 B';
  }
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

export default {
  isInRange,
  clamp,
  random,
  formatNumber,
  formatCurrency,
  toPercentage,
  add,
  subtract,
  multiply,
  divide,
  range,
  average,
  sum,
  formatFileSize
};