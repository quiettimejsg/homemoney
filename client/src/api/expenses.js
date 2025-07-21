import axios from 'axios';

// 使用相对路径API基础URL，通过Vite代理转发请求
export const API_BASE = '/api';

export const ExpenseAPI = {
  async addExpensesBatch (records) {
    try {
      return await axios.post(`${API_BASE}/expenses/batch`, records, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('批量添加消费记录失败:', error);
      throw error;
    }
  },

  async getExpenses (page = 1, limit = 1000) {
    console.log('[Expense API] 尝试获取消费数据，API基础URL:', API_BASE);
    try {
      const response = await axios.get(`${API_BASE}/expenses`, {
        params: { page, limit }
      });
      // 适配新的API响应格式
      if (response && response.data) {
        // 新格式：{ data: [...], total: number, page: number, limit: number }
        if (response.data.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        // 兼容旧格式：直接返回数组
        return Array.isArray(response.data) ? response.data : [];
      }
      return [];
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        console.error('获取消费数据失败：网络连接异常，请检查服务器或网络状态。', error);
      } else {
        console.error('获取消费数据失败:', error);
      }
      console.error('[Expense API] 获取消费数据失败详情:', error.response || error.message || error);
      throw error; // 向上传递错误以便前端处理
    }
  },

  async addExpense (data) {
    try {
      return await axios.post(`${API_BASE}/expenses`, data, {
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        transformRequest: [(data) => JSON.stringify({
          ...data,
          amount: parseFloat(data.amount),
          // 使用remark字段，不再需要itemName
          remark: data.remark || ''
        })]
      });
    } catch (error) {
      console.error('添加消费数据失败:', error);
      throw error; // 添加操作失败需要向上抛出错误
    }
  },

  async getStatistics () {
    try {
      const response = await axios.get(`${API_BASE}/expenses/statistics`);
      return response.data;
    } catch (error) {
      console.error('获取统计数据失败:', error);
      return { error: error.message };
    }
  }
};
