/**
 * 日期工具函数
 * 提供常见的日期操作、格式化和计算功能
 */

import { isDate, isNumber, isString } from './index';

/**
 * 格式化日期
 * @param date 日期对象、时间戳或日期字符串
 * @param format 格式化模板，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export const formatDate = (
  date: Date | number | string,
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string => {
  const d = parseDate(date);
  
  if (!isDate(d) || isNaN(d.getTime())) {
    return '';
  }
  
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();
  
  const padZero = (num: number): string => {
    return num < 10 ? `0${num}` : `${num}`;
  };
  
  return format
    .replace('YYYY', `${year}`)
    .replace('YY', `${year % 100}`)
    .replace('MM', padZero(month))
    .replace('M', `${month}`)
    .replace('DD', padZero(day))
    .replace('D', `${day}`)
    .replace('HH', padZero(hours))
    .replace('H', `${hours}`)
    .replace('mm', padZero(minutes))
    .replace('m', `${minutes}`)
    .replace('ss', padZero(seconds))
    .replace('s', `${seconds}`);
};

/**
 * 解析日期字符串或时间戳为日期对象
 * @param date 日期对象、时间戳或日期字符串
 * @returns 日期对象
 */
export const parseDate = (date: Date | number | string): Date => {
  if (isDate(date)) {
    return new Date(date.getTime());
  }
  
  if (isNumber(date)) {
    return new Date(date);
  }
  
  if (isString(date)) {
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  
  return new Date();
};

/**
 * 获取相对时间描述
 * @param date 日期对象、时间戳或日期字符串
 * @param now 参考时间，默认为当前时间
 * @returns 相对时间字符串
 */
export const getRelativeTime = (
  date: Date | number | string,
  now: Date = new Date()
): string => {
  const targetDate = parseDate(date);
  
  if (!isDate(targetDate) || !isDate(now) || isNaN(targetDate.getTime()) || isNaN(now.getTime())) {
    return '';
  }
  
  const diffMs = now.getTime() - targetDate.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  if (diffSeconds < 60) {
    return '刚刚';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks}周前`;
  } else if (diffMonths < 12) {
    return `${diffMonths}个月前`;
  } else {
    return `${diffYears}年前`;
  }
};

/**
 * 检查两个日期是否是同一天
 * @param date1 第一个日期
 * @param date2 第二个日期
 * @returns 是否是同一天
 */
export const isSameDay = (date1: Date | number | string, date2: Date | number | string): boolean => {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  
  if (!isDate(d1) || !isDate(d2) || isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    return false;
  }
  
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

/**
 * 检查日期是否是今天
 * @param date 日期
 * @returns 是否是今天
 */
export const isToday = (date: Date | number | string): boolean => {
  return isSameDay(date, new Date());
};

/**
 * 检查日期是否是昨天
 * @param date 日期
 * @returns 是否是昨天
 */
export const isYesterday = (date: Date | number | string): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
};

/**
 * 检查日期是否是明天
 * @param date 日期
 * @returns 是否是明天
 */
export const isTomorrow = (date: Date | number | string): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isSameDay(date, tomorrow);
};

/**
 * 获取日期所在月份的第一天
 * @param date 日期
 * @returns 月份第一天的日期对象
 */
export const getMonthFirstDay = (date: Date | number | string): Date => {
  const d = parseDate(date);
  
  if (!isDate(d) || isNaN(d.getTime())) {
    return new Date();
  }
  
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

/**
 * 获取日期所在月份的最后一天
 * @param date 日期
 * @returns 月份最后一天的日期对象
 */
export const getMonthLastDay = (date: Date | number | string): Date => {
  const d = parseDate(date);
  
  if (!isDate(d) || isNaN(d.getTime())) {
    return new Date();
  }
  
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
};

/**
 * 计算两个日期之间的天数差
 * @param date1 第一个日期
 * @param date2 第二个日期
 * @returns 天数差
 */
export const getDayDiff = (date1: Date | number | string, date2: Date | number | string): number => {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  
  if (!isDate(d1) || !isDate(d2) || isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    return 0;
  }
  
  // 转换为 UTC 时间并忽略时间部分
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  
  // 计算天数差
  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
};

/**
 * 计算日期加上指定天数后的日期
 * @param date 基础日期
 * @param days 天数
 * @returns 计算后的日期对象
 */
export const addDays = (date: Date | number | string, days: number): Date => {
  const d = parseDate(date);
  
  if (!isDate(d) || isNaN(d.getTime()) || !isNumber(days)) {
    return new Date();
  }
  
  d.setDate(d.getDate() + days);
  return d;
};

/**
 * 计算日期加上指定月数后的日期
 * @param date 基础日期
 * @param months 月数
 * @returns 计算后的日期对象
 */
export const addMonths = (date: Date | number | string, months: number): Date => {
  const d = parseDate(date);
  
  if (!isDate(d) || isNaN(d.getTime()) || !isNumber(months)) {
    return new Date();
  }
  
  d.setMonth(d.getMonth() + months);
  return d;
};

/**
 * 计算日期加上指定年数后的日期
 * @param date 基础日期
 * @param years 年数
 * @returns 计算后的日期对象
 */
export const addYears = (date: Date | number | string, years: number): Date => {
  const d = parseDate(date);
  
  if (!isDate(d) || isNaN(d.getTime()) || !isNumber(years)) {
    return new Date();
  }
  
  d.setFullYear(d.getFullYear() + years);
  return d;
};

/**
 * 获取日期的季度
 * @param date 日期
 * @returns 季度（1-4）
 */
export const getQuarter = (date: Date | number | string): number => {
  const d = parseDate(date);
  
  if (!isDate(d) || isNaN(d.getTime())) {
    return 1;
  }
  
  return Math.floor(d.getMonth() / 3) + 1;
};

/**
 * 获取日期是星期几
 * @param date 日期
 * @param locale 语言环境，默认为 'zh-CN'
 * @param short 是否返回短格式，默认为 false
 * @returns 星期几字符串
 */
export const getWeekday = (
  date: Date | number | string,
  locale: string = 'zh-CN',
  short: boolean = false
): string => {
  const d = parseDate(date);
  
  if (!isDate(d) || isNaN(d.getTime())) {
    return '';
  }
  
  const options: Intl.DateTimeFormatOptions = {
    weekday: short ? 'short' : 'long'
  };
  
  try {
    return d.toLocaleDateString(locale, options);
  } catch (error) {
    // 降级处理
    const weekdays = short
      ? ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      : ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    
    return weekdays[d.getDay()];
  }
};

/**
 * 获取指定月份的天数
 * @param year 年份
 * @param month 月份（1-12）
 * @returns 天数
 */
export const getDaysInMonth = (year: number, month: number): number => {
  if (!isNumber(year) || !isNumber(month) || month < 1 || month > 12) {
    return 0;
  }
  
  return new Date(year, month, 0).getDate();
};

/**
 * 检查年份是否是闰年
 * @param year 年份
 * @returns 是否是闰年
 */
export const isLeapYear = (year: number): boolean => {
  if (!isNumber(year)) {
    return false;
  }
  
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

/**
 * 获取日期所在周的第一天（周一）
 * @param date 日期
 * @returns 周第一天的日期对象
 */
export const getWeekFirstDay = (date: Date | number | string): Date => {
  const d = parseDate(date);
  
  if (!isDate(d) || isNaN(d.getTime())) {
    return new Date();
  }
  
  const day = d.getDay() || 7; // 将周日转换为7
  const diff = d.getDate() - day + 1; // 调整到周一
  return new Date(d.setDate(diff));
};

/**
 * 获取日期所在周的最后一天（周日）
 * @param date 日期
 * @returns 周最后一天的日期对象
 */
export const getWeekLastDay = (date: Date | number | string): Date => {
  const d = parseDate(date);
  
  if (!isDate(d) || isNaN(d.getTime())) {
    return new Date();
  }
  
  const day = d.getDay() || 7; // 将周日转换为7
  const diff = d.getDate() - day + 7; // 调整到周日
  return new Date(d.setDate(diff));
};

/**
 * 获取时间戳（秒）
 * @param date 日期
 * @returns 时间戳（秒）
 */
export const getTimestamp = (date: Date | number | string): number => {
  const d = parseDate(date);
  
  if (!isDate(d) || isNaN(d.getTime())) {
    return 0;
  }
  
  return Math.floor(d.getTime() / 1000);
};

export default {
  formatDate,
  parseDate,
  getRelativeTime,
  isSameDay,
  isToday,
  isYesterday,
  isTomorrow,
  getMonthFirstDay,
  getMonthLastDay,
  getDayDiff,
  addDays,
  addMonths,
  addYears,
  getQuarter,
  getWeekday,
  getDaysInMonth,
  isLeapYear,
  getWeekFirstDay,
  getWeekLastDay,
  getTimestamp
};