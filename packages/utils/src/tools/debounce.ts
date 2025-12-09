/**
 * 防抖与节流工具函数
 * 提供防抖和节流功能，用于性能优化
 */

/**
 * 防抖函数
 * @param func 需要防抖的函数
 * @param wait 等待时间（毫秒）
 * @param immediate 是否立即执行
 * @returns 防抖处理后的函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(this: any, ...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
    
    if (callNow) func.apply(this, args);
  };
};

/**
 * 节流函数
 * @param func 需要节流的函数
 * @param wait 等待时间（毫秒）
 * @param options 配置项
 * @returns 节流处理后的函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: {
    leading?: boolean;
    trailing?: boolean;
  } = {}
): ((...args: Parameters<T>) => void) => {
  const { leading = true, trailing = true } = options;
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let previous = 0;
  
  const later = (context: any, args: Parameters<T>) => {
    previous = leading === false ? 0 : Date.now();
    timeout = null;
    func.apply(context, args);
  };
  
  return function executedFunction(this: any, ...args: Parameters<T>) {
    const now = Date.now();
    
    if (!previous && leading === false) previous = now;
    
    const remaining = wait - (now - previous);
    
    if (remaining <= 0 || remaining > wait) {
      if (timeout !== null) {
        clearTimeout(timeout);
        timeout = null;
      }
      
      previous = now;
      func.apply(this, args);
    } else if (!timeout && trailing !== false) {
      timeout = setTimeout(() => later(this, args), remaining);
    }
  };
};

export default {
  debounce,
  throttle
};