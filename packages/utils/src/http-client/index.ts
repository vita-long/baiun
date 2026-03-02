// 导出事件系统
export { eventEmitter, ERROR_CODES, type ErrorCode, type EventMap, type EventCallback } from './event-emit';

// 导出 HTTP 客户端类和类型
export { HttpClient, type HttpClientConfig, type HttpErrorInfo, type UploadOptions, type RequestQueueItem } from './request';

// 导出默认实例
export { default } from './request';