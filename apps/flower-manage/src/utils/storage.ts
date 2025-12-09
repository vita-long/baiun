// localStorage 封装工具类
class StorageUtil {
  /**
   * 存储数据到localStorage
   * @param key 存储键名
   * @param value 存储值
   */
  set<T>(key: string, value: T): void {
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
  get<T>(key: string): T | null {
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
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  /**
   * 清空localStorage
   */
  clear(): void {
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
  setTokens(accessToken: string, refreshToken: string): void {
    this.set('accessToken', accessToken);
    this.set('refreshToken', refreshToken);
  }

  /**
   * 获取访问令牌
   * @returns 访问令牌或null
   */
  getAccessToken(): string | null {
    return this.get<string>('accessToken');
  }

  /**
   * 获取刷新令牌
   * @returns 刷新令牌或null
   */
  getRefreshToken(): string | null {
    return this.get<string>('refreshToken');
  }

  /**
   * 清除令牌
   */
  clearTokens(): void {
    this.remove('accessToken');
    this.remove('refreshToken');
  }
}

export const storage = new StorageUtil();

export default StorageUtil;