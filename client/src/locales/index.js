import { createI18n } from 'vue-i18n';
import enUS from './en-US.json';
import zhCL from './zh-CL.json';

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CL',
  fallbackLocale: 'en-US',
  messages: {
    'en-US': enUS,
    'zh-CL': zhCL
  }
});

export default i18n;
