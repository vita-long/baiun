import { makeAutoObservable } from 'mobx';
import StorageUtil from '@/utils/storage';
import request from '@/service';
import type { LoginResponse } from '@/types/user';

interface UserInfo {
  username: string;
  email: string;
  [key: string]: any;
}

class AuthStore {
  isAuthenticated: boolean = false;
  userInfo: UserInfo | null = null;
  loading: boolean = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    // 初始化时检查是否有token
    this.checkAuthStatus();
  }

  /**
   * 检查认证状态
   */
  checkAuthStatus() {
    const accessToken = StorageUtil.getAccessToken();
    if (accessToken) {
      this.isAuthenticated = true;
      this.fetchUserInfo();
    } else {
      // 添加模拟数据用于演示
      this.isAuthenticated = true;
      this.userInfo = {
        username: '测试用户',
        email: 'test@example.com',
        avatar: 'https://via.placeholder.com/150'
      };
    }
  }

  /**
   * 获取用户信息
   */
  async fetchUserInfo() {
    try {
      this.loading = true;
      this.error = null;
      // 模拟API调用
      // const response = await request.get('/user/info');
      // this.userInfo = response.data;
      // 这里暂时使用mock数据
      this.userInfo = {
        username: StorageUtil.get('username') || 'user',
        email: StorageUtil.get('email') || 'user@example.com'
      };
    } catch (error) {
      this.error = '获取用户信息失败';
      console.error('Fetch user info error:', error);
    } finally {
      this.loading = false;
    }
  }

  /**
   * 登录
   * @param username 用户名
   * @param password 密码
   */
  async login(username: string, password: string) {
    try {
      this.loading = true;
      this.error = null;
      
      // 模拟API调用
      const response = await request.post<LoginResponse>('/auth/login', { username, password });
      const { accessToken, refreshToken, user } = response;
      
      // 存储token
      StorageUtil.setTokens(accessToken, refreshToken);
      StorageUtil.set('userInfo', user);
      
      this.isAuthenticated = true;
      this.userInfo = user;
      
      return true;
    } catch (error) {
      this.error = '登录失败，请检查用户名和密码';
      console.error('Login error:', error);
      return false;
    } finally {
      this.loading = false;
    }
  }

  /**
   * 注册
   * @param username 用户名
   * @param email 邮箱
   * @param password 密码
   */
  async register(username: string, email: string, password: string) {
    try {
      this.loading = true;
      this.error = null;
      
      const response = await request.post('/auth/register', { username, email, password });
      console.log(response);
      return true;
    } catch (error) {
      this.error = '注册失败，请稍后重试';
      console.error('Register error:', error);
      return false;
    } finally {
      this.loading = false;
    }
  }

  /**
   * 发送验证码
   * @param email 邮箱
   */
  async sendVerificationCode(email: string) {
    try {
      this.loading = true;
      this.error = null;
      
      // 模拟API调用
      // await request.post('/send-code', { email });
      
      // Mock成功响应
      console.log('Verification code sent to:', email);
      
      return true;
    } catch (error) {
      this.error = '发送验证码失败，请稍后重试';
      console.error('Send verification code error:', error);
      return false;
    } finally {
      this.loading = false;
    }
  }

  /**
   * 重置密码
   * @param email 邮箱
   * @param code 验证码
   * @param newPassword 新密码
   */
  async resetPassword(email: string, _code: string, _newPassword: string) {
    try {
      this.loading = true;
      this.error = null;
      
      // 模拟API调用
      // await request.post('/reset-password', { email, code, new_password: newPassword });
      
      // Mock成功响应
      console.log('Password reset for:', email);
      
      return true;
    } catch (error) {
      this.error = '重置密码失败，请检查验证码是否正确';
      console.error('Reset password error:', error);
      return false;
    } finally {
      this.loading = false;
    }
  }

  /**
   * 登出
   */
  logout() {
    StorageUtil.clearTokens();
    StorageUtil.remove('username');
    StorageUtil.remove('email');
    this.isAuthenticated = false;
    this.userInfo = null;
    this.error = null;
  }

  /**
   * 清除错误信息
   */
  clearError() {
    this.error = null;
  }
}

// 创建单例实例
const authStore = new AuthStore();

export default authStore;