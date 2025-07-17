import { createApp } from 'vue';
import axios from 'axios';
import { setupAxiosInterceptors } from './utils/offlineDataSync.js';

import './styles/common.css'; // 导入公共样式文件
import './styles/fonts.css'; // 导入自定义字体
import 'element-plus/dist/index.css'; // 导入Element Plus基础样式

import router from './router';
import i18n from './locales/i18n.js';
import 'dayjs/locale/en'; // 正确命名导出i18n实例供其他模块使用
// 使用locales目录下已配置的i18n实例（包含完整语言包）
import { createPinia } from 'pinia';

import * as ElementPlusIconsVue from '@element-plus/icons-vue';

import App from './App.vue';
// 设置Axios离线拦截器
setupAxiosInterceptors(axios);

// 应用初始化日志 - 捕获设备信息
console.log('[App Initialization] Starting application load for user agent:', navigator.userAgent);
axios.post('/api/logs', {
  type: 'app_initialization',
  message: 'Application started loading',
  userAgent: navigator.userAgent,
  timestamp: new Date().toISOString(),
  url: window.location.href
}).then(() => {
  console.log('[Initialization Log] Successfully sent to server');
}).catch(logErr => {
  console.error('[Initialization Log] Failed to send:', logErr);
  // 尝试使用fetch作为备用方案发送日志
  fetch('/api/logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'app_initialization_fallback',
      message: 'Failed to send initialization log via axios',
      error: logErr.message,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href
    })
  }).catch(fetchErr => {
    console.error('[Initialization Log] Fallback fetch also failed:', fetchErr);
  });
}); // 英语
export { i18n };
const pinia = createPinia();

// 全局错误处理
window.addEventListener('error', (event) => {
  console.error('[Global Error]', event.error);
  axios.post('/api/logs', {
    type: 'global_js_error',
    message: event.error.message,
    stack: event.error.stack,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    url: window.location.href
  }).catch(logErr => {
    console.error('[Global Error] Failed to send error log:', logErr);
  });
});

// 未捕获的Promise拒绝处理
window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Rejection]', event.reason);
  axios.post('/api/logs', {
    type: 'unhandled_rejection',
    message: event.reason.message,
    stack: event.reason.stack,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    url: window.location.href
  }).catch(logErr => {
    console.error('[Unhandled Rejection] Failed to send error log:', logErr);
  });
});

const app = createApp({
  components: { App },
  template: `
    <Suspense>
      <App />
      <template #fallback>Loading...</template>
    </Suspense>
  `
});
app.use(pinia); // 安装Pinia实例
// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.use(router);
app.use(i18n);
app.mount('#app');
console.log('[App Initialization] Application mounted successfully');

// 深色模式适配
const applyDarkMode = (isDark) => {
  if (isDark) {
    document.documentElement.classList.add('dark-mode');
  } else {
    document.documentElement.classList.remove('dark-mode');
  }
};

// 检测系统主题偏好
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
applyDarkMode(mediaQuery.matches);

// 监听主题变化
mediaQuery.addEventListener('change', (e) => {
  applyDarkMode(e.matches);
});
