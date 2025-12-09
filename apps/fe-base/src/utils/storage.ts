// localStorage 封装工具类
class StorageUtil {
  /**
   * 存储数据到localStorage
   * @param key 存储键名
   * @param value 存储值
   */
  static set<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  /**
   * 从localStorage获取数据
   * @param key 存储键名
   * @returns 存储的值或null
   */
  static get<T>(key: string): T | null {
    try {
      const serializedValue = localStorage.getItem(key);
      if (serializedValue === null) {
        return null;
      }
      return JSON.parse(serializedValue) as T;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  /**
   * 从localStorage移除数据
   * @param key 存储键名
   */
  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  /**
   * 清空localStorage
   */
  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * 存储Token
   * @param accessToken 访问令牌
   * @param refreshToken 刷新令牌
   */
  static setTokens(accessToken: string, refreshToken: string): void {
    this.set('accessToken', accessToken);
    this.set('refreshToken', refreshToken);
  }

  /**
   * 获取访问令牌
   * @returns 访问令牌或null
   */
  static getAccessToken(): string | null {
    return this.get<string>('access_token');
  }

  /**
   * 获取刷新令牌
   * @returns 刷新令牌或null
   */
  static getRefreshToken(): string | null {
    return this.get<string>('refresh_token');
  }

  /**
   * 清除令牌
   */
  static clearTokens(): void {
    this.remove('access_token');
    this.remove('refresh_token');
  }
}

export default StorageUtil;