<template>
  <el-dialog
    v-model="dialogVisible"
    @close="handleClose"
    :title="title"
    :width="width"
    :modal="true"
    :close-on-click-modal="false"
    :center="true"
  >
    <div class="markdown-content" v-html="renderedMarkdown"></div>
    <template #footer>
      <el-button @click="handleClose">{{ t('home.closeButton') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { marked } from 'marked';
import hljs from 'highlight.js/lib/core';
import markdown from 'highlight.js/lib/languages/markdown';
import 'highlight.js/styles/github.css';

hljs.registerLanguage('markdown', markdown);

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: 'Markdown Viewer'
  },
  content: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: '80%'
  }
});

const emit = defineEmits(['update:visible']);

// 内部状态管理与双向同步
const dialogVisible = ref(props.visible);

// 同步父组件状态到内部
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal;
});

// 同步内部状态到父组件
watch(dialogVisible, (newVal) => {
  emit('update:visible', newVal);
});

const handleClose = () => {
  dialogVisible.value = false;
};

const { t } = useI18n();

// 配置 marked
onMounted(() => {
  marked.setOptions({
    highlight: function (code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    },
    breaks: true,
    gfm: true
  });
});

const renderedMarkdown = computed(() => {
  return marked.parse(props.content);
});

</script>

<style scoped>
.markdown-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 16px;
  line-height: 1.6;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.markdown-content p {
  margin-bottom: 1em;
}

.markdown-content pre {
  background-color: #f5f5f5;
  padding: 1em;
  border-radius: 4px;
  overflow-x: auto;
}

.markdown-content code {
  font-family: system-ui, sans-serif;
}

.markdown-content ul,
.markdown-content ol {
  margin-left: 2em;
  margin-bottom: 1em;
}
</style>
