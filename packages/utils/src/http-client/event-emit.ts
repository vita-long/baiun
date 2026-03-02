// 错误码定义
export const ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  NETWORK_ERROR: 'NETWORK_ERROR'
} as const;

// 错误码类型
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// 事件回调函数类型
export type EventCallback<T = any> = (data: T) => void;

// 事件映射类型
export interface EventMap {
  requestStart: { config: any };
  requestError: { error: any };
  responseSuccess: { response: any; config: any };
  responseError: { error: any; errorInfo: any };
  unauthorized: void;
  forbidden: void;
  notFound: void;
  serverError: any;
  networkError: any;
  generalError: any;
}

/**
 * 事件发射器类
 * 用于处理 HTTP 请求相关的事件
 */
export class EventEmitter {
  private events: Record<string, EventCallback<any>[]>;

  constructor() {
    this.events = {};
  }

  /**
   * 注册事件监听器
   * @param event 事件名称
   * @param callback 事件回调函数
   */
  on<K extends keyof EventMap>(event: K, callback: EventCallback<EventMap[K]>): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  /**
   * 触发事件
   * @param event 事件名称
   * @param data 事件数据
   */
  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }

  /**
   * 移除事件监听器
   * @param event 事件名称
   * @param callback 事件回调函数
   */
  off<K extends keyof EventMap>(event: K, callback: EventCallback<EventMap[K]>): void {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
}

// 创建全局事件实例
const eventEmitter = new EventEmitter();

// 导出事件系统
export { eventEmitter };