/**
 * 字符串工具函数
 * 提供常见的字符串处理功能
 */

/**
 * 截断字符串并添加省略号
 * @param str 原始字符串
 * @param maxLength 最大长度
 * @param suffix 省略符号，默认为 '...'
 * @returns 截断后的字符串
 */
export const truncateString = (
  str: string,
  maxLength: number,
  suffix: string = '...'
): string => {
  if (typeof str !== 'string' || maxLength <= 0) {
    return str;
  }
  
  if (str.length <= maxLength) {
    return str;
  }
  
  return str.slice(0, maxLength - suffix.length) + suffix;
};

/**
 * 移除字符串首尾空格
 * @param str 原始字符串
 * @returns 移除空格后的字符串
 */
export const trim = (str: string): string => {
  if (typeof str !== 'string') {
    return str;
  }
  
  return str.trim();
};

/**
 * 移除字符串所有空格
 * @param str 原始字符串
 * @returns 移除所有空格后的字符串
 */
export const removeSpaces = (str: string): string => {
  if (typeof str !== 'string') {
    return str;
  }
  
  return str.replace(/\s+/g, '');
};

/**
 * 转换字符串为驼峰命名
 * @param str 原始字符串
 * @returns 驼峰命名的字符串
 */
export const toCamelCase = (str: string): string => {
  if (typeof str !== 'string') {
    return str;
  }
  
  // 处理连字符、下划线等分隔符
  return str.replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''));
};

/**
 * 转换字符串为连字符命名
 * @param str 原始字符串
 * @returns 连字符命名的字符串
 */
export const toKebabCase = (str: string): string => {
  if (typeof str !== 'string') {
    return str;
  }
  
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
};

/**
 * 转换字符串为下划线命名
 * @param str 原始字符串
 * @returns 下划线命名的字符串
 */
export const toSnakeCase = (str: string): string => {
  if (typeof str !== 'string') {
    return str;
  }
  
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
};

/**
 * 检查字符串是否包含特定子串
 * @param str 原始字符串
 * @param substring 要检查的子串
 * @param caseSensitive 是否区分大小写，默认为 false
 * @returns 是否包含子串
 */
export const contains = (
  str: string,
  substring: string,
  caseSensitive: boolean = false
): boolean => {
  if (typeof str !== 'string' || typeof substring !== 'string') {
    return false;
  }
  
  if (caseSensitive) {
    return str.includes(substring);
  }
  
  return str.toLowerCase().includes(substring.toLowerCase());
};

/**
 * 检查字符串是否以特定子串开头
 * @param str 原始字符串
 * @param prefix 前缀子串
 * @param caseSensitive 是否区分大小写，默认为 false
 * @returns 是否以子串开头
 */
export const startsWith = (
  str: string,
  prefix: string,
  caseSensitive: boolean = false
): boolean => {
  if (typeof str !== 'string' || typeof prefix !== 'string') {
    return false;
  }
  
  if (caseSensitive) {
    return str.startsWith(prefix);
  }
  
  return str.toLowerCase().startsWith(prefix.toLowerCase());
};

/**
 * 检查字符串是否以特定子串结尾
 * @param str 原始字符串
 * @param suffix 后缀子串
 * @param caseSensitive 是否区分大小写，默认为 false
 * @returns 是否以子串结尾
 */
export const endsWith = (
  str: string,
  suffix: string,
  caseSensitive: boolean = false
): boolean => {
  if (typeof str !== 'string' || typeof suffix !== 'string') {
    return false;
  }
  
  if (caseSensitive) {
    return str.endsWith(suffix);
  }
  
  return str.toLowerCase().endsWith(suffix.toLowerCase());
};

/**
 * 格式化字符串，使用模板替换
 * @param template 模板字符串，如 'Hello, {name}!' 
 * @param data 数据对象，包含要替换的值
 * @returns 格式化后的字符串
 */
export const formatString = (
  template: string,
  data: Record<string, string | number | boolean | null | undefined>
): string => {
  if (typeof template !== 'string' || typeof data !== 'object' || data === null) {
    return template;
  }
  
  return template.replace(/\{([^}]*)\}/g, (_, key) => {
    const value = data[key];
    return value !== undefined && value !== null ? String(value) : '';
  });
};

export default {
  truncateString,
  trim,
  removeSpaces,
  toCamelCase,
  toKebabCase,
  toSnakeCase,
  contains,
  startsWith,
  endsWith,
  formatString
};