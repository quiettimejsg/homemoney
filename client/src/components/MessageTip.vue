<template>
  <Transition name="fade">
    <div v-if="message" :class="['message-tip', type]">
      {{ message }}
    </div>
  </Transition>
</template>

<script setup>
import { watch, onMounted, onUnmounted } from 'vue';
import { useLogStore } from '@/stores/log';

// 使用 defineProps 声明组件接收的属性
const props = defineProps({
  // 消息内容，字符串类型
  message: String,
  // 消息类型，可以是 'success' 或 'error'，默认为 'success'
  type: {
    type: String,
    default: 'success',
    validator: val => ['success', 'error'].includes(val)
  }
});

// 使用 defineEmits 声明组件可以发出的事件
// 'update:message' 事件用于通知父组件更新 message 属性
const emit = defineEmits(['update:message']);

// 用于存储定时器 ID
let timer = null;

// 监听 props.message 的变化
watch(() => props.message, (newVal) => {
  // 如果有新消息内容
  if (newVal) {
    // 记录日志
    const logStore = useLogStore();
    logStore.addLog(newVal);
    // 如果存在旧的定时器，先清除它，避免重复触发
    if (timer) {
      clearTimeout(timer);
    }
    // 设置新的定时器，3秒后清空消息
    timer = setTimeout(() => {
      // 触发 'update:message' 事件，将消息内容设置为空字符串
      emit('update:message', '');
      // 定时器触发后，将 timer 重置为 null
      timer = null;
    }, 3000);
  } else {
    // 如果 message 变为空，立即清除任何正在运行的定时器
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }
}, { immediate: true }); // immediate: true 确保在组件初始化时如果 message 已经有值，也会立即执行一次 watch

// 保存原始console方法
let originalConsoleLog, originalConsoleError;

// 组件挂载时重写console方法
onMounted(() => {
  const logStore = useLogStore();
  originalConsoleLog = console.log;
  originalConsoleError = console.error;

  // 重写log方法
  console.log = function (...args) {
    originalConsoleLog.apply(console, args); // 保留原功能
    logStore.addLog(`[console.log] ${args.join(' ')}`); // 记录到日志
  };

  // 重写error方法
  console.error = function (...args) {
    originalConsoleError.apply(console, args);
    logStore.addLog(`[console.error] ${args.join(' ')}`);
  };
});

// 组件卸载时恢复console方法
onUnmounted(() => {
  if (timer) clearTimeout(timer);
  console.log = originalConsoleLog; // 恢复原始方法
  console.error = originalConsoleError;
});
</script>

<style scoped>
/* 消息提示的基础样式 */
.message-tip {
  position: fixed; /* 固定定位，使其浮动在页面上方 */
  top: 20px; /* 距离顶部 20px */
  left: 50%; /* 水平居中 */
  transform: translateX(-50%); /* 精确水平居中 */
  padding: 12px 20px; /* 内边距 */
  border-radius: 8px; /* 圆角 */
  font-size: 16px; /* 字体大小 */
  font-weight: 500; /* 字体粗细 */
  z-index: 9999; /* 层级，确保在所有其他内容之上 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* 阴影效果 */
  transition: all 0.3s ease-in-out; /* 所有属性的过渡效果 */
  text-align: center; /* 文本居中 */
  max-width: 90vw; /* 最大宽度为视口宽度的90%，防止溢出 */
  min-width: 200px; /* 最小宽度 */
  box-sizing: border-box; /* 边框盒模型，确保padding和border包含在宽度内 */
  word-wrap: break-word; /* 允许长单词或URL地址在必要时换行 */
}

/* 浅色模式成功消息样式 */
.message-tip.light.success {
  background-color: transparent; /* 透明背景 */
  color: #389e0d; /* 深绿色文本 */
  border: 1px solid rgba(183, 235, 143, 0.5); /* 半透明绿色边框 */
}

/* 浅色模式错误消息样式 */
.message-tip.light.error {
  background-color: transparent; /* 透明背景 */
  color: #cf1322; /* 深红色文本 */
  border: 1px solid rgba(255, 163, 158, 0.5); /* 半透明红色边框 */
}

/* 过渡效果的进入和离开动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s, transform 0.5s; /* 透明度和位移的过渡 */
}

/* 进入前和离开后的状态 */
.fade-enter-from,
.fade-leave-to {
  opacity: 0; /* 完全透明 */
  transform: translateX(-50%) translateY(-20px); /* 向上移动 20px */
}

/* 进入后和离开前的状态 */
.fade-enter-to,
.fade-leave-from {
  opacity: 1; /* 完全不透明 */
  transform: translateX(-50%) translateY(0); /* 恢复到原位 */
}
</style>
