<!--
 * @file ExportButton.vue
 * @package 家庭记账本
 * @module 公共组件
 * @description 数据导出按钮组件
 * @author 开发者
 * @version 1.0
-->
<template>
  <div class="export-section">
    <button @click="handleExport" class="btn btn-primary">{{ $t('app.export') }}</button>
  </div>
</template>

<script setup>

/**
 * 组件事件定义
 * @typedef {Object} ExportButtonEmits
 * @property {() => void} export-excel - 触发数据导出事件
 */
const emits = defineEmits(['export-excel']);

/**
 * 处理导出按钮点击事件
 */
const handleExport = () => { emits('export-excel'); };
</script>

<style scoped>
/* 已迁移至common.css，仅保留作用域标识 */
</style>
