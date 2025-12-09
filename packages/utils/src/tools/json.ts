/**
 * JSON 工具函数
 * 提供安全的 JSON 解析和序列化功能
 */

/**
 * 安全地解析 JSON 字符串
 * @param json JSON 字符串
 * @param defaultValue 解析失败时的默认值
 * @returns 解析后的对象或默认值
 */
export const safeJsonParse = <T = any>(json: string, defaultValue: T = {} as T): T => {
  try {
    // 检查是否为有效的字符串
    if (typeof json !== 'string' || !json.trim()) {
      return defaultValue;
    }
    
    return JSON.parse(json) as T;
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return defaultValue;
  }
};

/**
 * 安全地序列化对象为 JSON 字符串
 * @param value 要序列化的对象
 * @param defaultValue 序列化失败时的默认值
 * @param replacer JSON.stringify 的 replacer 参数
 * @param space JSON.stringify 的 space 参数
 * @returns 序列化后的 JSON 字符串或默认值
 */
export const safeJsonStringify = (
  value: any,
  defaultValue: string = '{}',
  replacer?: (key: string, value: any) => any,
  space?: string | number
): string => {
  try {
    if (value === undefined) {
      return defaultValue;
    }
    
    // 处理循环引用和特殊对象
  const seen = new WeakSet<object>();
  const safeReplacer = replacer
    ? (key: string, val: any) => {
        const replaced = replacer(key, val);
        return handleCircularReference(replaced, seen);
      }
    : (_key: string, val: any) => handleCircularReference(val, seen);
    
    return JSON.stringify(value, safeReplacer, space);
  } catch (error) {
    console.error('Failed to stringify to JSON:', error);
    return defaultValue;
  }
};

/**
 * 处理对象中的循环引用
 * @param value 要检查的值
 * @param seen 已见过的对象集合
 * @returns 处理后的值
 */
function handleCircularReference(value: any, seen: WeakSet<object>): any {
  if (value !== null && typeof value === 'object') {
    if (seen.has(value)) {
      // 处理循环引用，返回 [Circular] 标记或简化对象
      return '[Circular]';
    }
    
    seen.add(value);
    
    // 处理特殊对象类型
    if (value instanceof Date) {
      return { __type: 'Date', value: value.toISOString() };
    } else if (value instanceof RegExp) {
      return { __type: 'RegExp', source: value.source, flags: value.flags };
    } else if (value instanceof Map) {
      return { __type: 'Map', entries: Array.from(value.entries()) };
    } else if (value instanceof Set) {
      return { __type: 'Set', values: Array.from(value.values()) };
    }
    
    // 处理数组和普通对象
  if (Array.isArray(value)) {
    return value.map((item) => handleCircularReference(item, seen));
  }
  
  // 处理普通对象
  const result: Record<string, any> = {};
  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      result[key] = handleCircularReference(value[key], seen);
    }
  }
    
    return result;
  }
  
  return value;
}

/**
 * 克隆对象（基于 JSON 序列化和反序列化）
 * @param obj 要克隆的对象
 * @returns 克隆后的新对象
 */
export const jsonClone = <T = any>(obj: T): T | null => {
  try {
    return safeJsonParse<T>(safeJsonStringify(obj));
  } catch (error) {
    console.error('Failed to clone object:', error);
    return null;
  }
};

export default {
  safeJsonParse,
  safeJsonStringify,
  jsonClone
};