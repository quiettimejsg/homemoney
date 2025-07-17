import dayjs from 'dayjs';
import { Solar } from 'lunar-javascript';

// 古风月份名称 (周礼·月令)
const CLASSICAL_MONTHS = [
  '孟春', '仲春', '季春',
  '孟夏', '仲夏', '季夏',
  '孟秋', '仲秋', '季秋',
  '孟冬', '仲冬', '季冬'
];

// 获取古风日期信息
const toClassicalDate = (date) => {
  const solar = Solar.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const lunar = solar.getLunar();
  return {
    classicalMonth: CLASSICAL_MONTHS[date.getMonth()],
    ganZhiYear: lunar.getYearInGanZhi(),
    lunarDayStr: lunar.getDayInChinese()
  };
};

// 获取月份名称
const monthNames = {
  'en-US': ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
};

// 根据语言格式化日期
export const formatDateByLocale = (date, locale) => {
  const d = dayjs(date);
  if (!d.isValid()) return '';

  const year = d.year();
  const month = d.month() + 1;
  const day = d.date();

  switch (locale) {
  case 'en-US': {
    const names = monthNames[locale];
    if (!names) return d.format('YYYY-MM-DD');
    if (locale === 'en-US') return `${names[month - 1]} ${day}, ${year}`;
    if (locale === 'es-ES') return `${day} de ${names[month - 1]} de ${year}`;
    return `${day} ${names[month - 1]} ${year}`;
  }
  case 'zh-CL': {
    const classical = toClassicalDate(d.toDate());
    return `${classical.ganZhiYear}年${classical.classicalMonth}${classical.lunarDayStr}`;
  }
  default:
    return d.format('YYYY-MM-DD');
  }
};

// 根据语言格式化月份标签
export const formatMonthLabelByLocale = (yearMonth, locale) => {
  const d = dayjs(yearMonth);
  if (!d.isValid()) return '';

  const year = d.year();
  const month = d.month() + 1;

  switch (locale) {
  case 'en-US': {
    const names = monthNames[locale];
    if (!names) return d.format('YYYY-MM');
    if (locale === 'es-ES') return `${names[month - 1]} de ${year}`;
    return `${names[month - 1]} ${year}`;
  }
  case 'zh-CL': {
    const classical = toClassicalDate(d.toDate());
    return `${classical.ganZhiYear}年${classical.classicalMonth}`;
  }
  default:
    return d.format('YYYY-MM');
  }
};
