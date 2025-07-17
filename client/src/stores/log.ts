import { defineStore } from 'pinia';

// 定义日志存储
export const useLogStore = defineStore('log', {
  state: () => ({ 
    logs: [] as string[] // 假设日志是字符串数组，可根据实际需求调整类型
  }),
  actions: {
    addLog(log: string) {
      this.logs.push(log);
    },
    clearLogs() {
      this.logs = [];
    }
  }
});