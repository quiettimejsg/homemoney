/*
 * @file i18n.js
 * @package 家庭记账本
 * @module 国际化配置
 * @description 多语言支持核心配置文件，初始化i18n实例并加载语言包
 * @author 开发者
 * @version 1.0
*/

import { createI18n } from 'vue-i18n';
import enUS from './en-US.json';
import zhCL from './zh-CL.json';
import dayjs from 'dayjs';
// 导入语言包
import 'dayjs/locale/en'; // 英文

// 获取浏览器默认语言
const browserLanguage = navigator.language || navigator.userLanguage;
console.log('获取到的浏览器默认语言为:', browserLanguage);
// 定义支持的语言列表
const supportedLanguages = ['en-US', 'zh-CL'];
console.log('支持的语言列表为:', supportedLanguages);
// 检查浏览器语言是否在支持列表中
let defaultLocale = 'en-US'; // 默认语言
console.log('初始默认语言设置为:', defaultLocale);
// 特殊处理香港和台湾地区语言，使用zh-CL
if (browserLanguage === 'zh-HK' || browserLanguage === 'zh-tw' || browserLanguage === 'zh-TW' || browserLanguage === 'zh-hk') {
  defaultLocale = 'zh-CL';
  console.log('浏览器语言为香港或台湾地区语言，默认语言更新为:', defaultLocale);
} else if (supportedLanguages.includes(browserLanguage)) {
  defaultLocale = browserLanguage;
  console.log('浏览器语言在支持列表中，默认语言更新为:', defaultLocale);
} else {
  // 处理类似 'zh' 这种情况，取前两位匹配
  const shortLanguage = browserLanguage.slice(0, 2);
  console.log('浏览器语言不在支持列表中，截取前两位:', shortLanguage);
  const matchedLanguage = supportedLanguages.find(lang => lang.startsWith(shortLanguage));
  if (matchedLanguage) {
    defaultLocale = matchedLanguage;
    console.log('找到匹配的语言，默认语言更新为:', defaultLocale);
  } else {
    console.log('未找到匹配的语言，默认语言保持不变:', defaultLocale);
  }
}
/**
 * 初始化i18n实例
 * @type {import('vue-i18n').I18n}
 */
const i18n = createI18n({
  legacy: false, // 使用组合式API模式
  locale: defaultLocale, // 根据浏览器语言设置默认语言
  fallbackLocale: 'en-US', // 回退语言
  messages: {
    'en-US': enUS,
    'zh-CL': zhCL
  }
});

// 监听语言切换并更新 Day.js 语言
i18n.global.onLanguageChanged = (locale) => {
  dayjs.locale(locale);
};

// 导出语言切换方法
export const changeLanguage = (newLocale) => {
  if (supportedLanguages.includes(newLocale)) {
    i18n.global.locale.value = newLocale;
    dayjs.locale(newLocale);
    console.log(`语言已切换为: ${newLocale}`);
  } else {
    console.error(`不支持的语言: ${newLocale}`);
  }
};

export default i18n;
