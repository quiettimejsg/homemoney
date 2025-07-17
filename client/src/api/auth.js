import request from '@/utils/request';
import { STORAGE_KEYS } from '@/utils/constants';

/**
 * 2FA登录验证API
 * @param {Object} credentials - 用户凭证
 * @param {string} credentials.account - 账号
 * @param {string} credentials.code - 2FA验证码
 * @returns {Promise<Object>} 登录结果
 */
export const loginWith2FA = async (credentials) => {
  try {
    const response = await request({ url: '/api/auth/login', method: 'post', data: credentials });
    console.log('Raw login response:', JSON.stringify(response, null, 2));
    console.log('Login response structure:', response);
    // 多路径令牌提取逻辑，支持常见响应结构
    // 扩展令牌提取路径以支持更多常见命名约定
    // 提取令牌并移除可能的空白字符
    const token = (response?.data?.token || response?.token || response?.data?.data?.token || response?.data?.accessToken || response?.accessToken || response?.data?.authToken || response?.data?.access_token || response?.access_token)?.trim();
    if (token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      console.log('Token stored successfully:', token);
    }
    console.log('Extracted token:', token);
    console.log('Response structure details:', {
      success: response.success,
      hasData: !!response.data,
      dataKeys: response.data ? Object.keys(response.data) : [],
      tokenPaths: {
        'response.token': response?.token,
        'response.data.token': response?.data?.token,
        'response.data.data.token': response?.data?.data?.token
      }
    });

    if (response.success && token) {
      // 使用同步存储确保令牌立即可用
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      // 新增：存储用户信息
      if (response.data) {
        localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(response.data));
      }
      // 验证存储操作
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      console.log('Token stored successfully:', storedToken);
      if (storedToken !== token) {
        console.error('Token storage mismatch!', { expected: token, actual: storedToken });
        throw new Error('令牌存储失败，请刷新页面重试');
      }
      // 返回包含令牌的响应，便于调用者立即使用
      return { ...response, token };
    } else {
      console.error('Login failed to provide valid token:', { success: response.success, token, response });
      throw new Error('登录失败：未获取到有效令牌');
    }
  } catch (error) {
    // 统一错误处理
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || '登录请求失败');
    }
    throw new Error('网络错误，无法连接到服务器');
  }
};

/**
 * 生成TOTP密钥
 * @param {Object} data - 请求数据
 * @returns {Promise}
 */

export const generateTOTPSecret = (data) => {
  return request({
    url: '/api/auth/generate-totp',
    method: 'post',
    data
  });
};

/**
 * 用户注册请求（生成TOTP密钥）
 * @param {string} username - 用户名
 * @returns {Promise}
 */
export const register = (username) => {
  return request({
    url: '/api/auth/register',
    method: 'post',
    data: { username }
  });
};

/**
 * 验证注册验证码并完成注册
 * @param {Object} data - 验证数据
 * @param {string} data.tempId - 临时注册ID
 * @param {string} data.code - 2FA验证码
 * @returns {Promise}
 */
export const verifyRegister = (data) => {
  return request({
    url: '/api/auth/verify-register',
    method: 'post',
    data
  });
};

/**
 * 获取当前用户信息
 * @returns {Promise<Object>} 用户信息
 */
export const getUserInfo = () => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN)?.trim();
  console.log('getUserInfo - Token available:', !!token);
  console.log('getUserInfo - Token value:', token);
  console.log('getUserInfo - Request URL:', '/api/auth/user');
  return request({
    url: '/api/auth/user',
    method: 'get',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};
