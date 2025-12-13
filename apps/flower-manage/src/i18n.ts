import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// 导入翻译资源
import zhCN from '../scripts/files/zh-CN.json';
import enUS from '../scripts/files/en-US.json';

// 配置i18next
const i18nConfig = {
  resources: {
    'zh-CN': {
      translation: zhCN
    },
    'en-US': {
      translation: enUS
    }
  },
  lng: localStorage.getItem('language') || 'zh-CN', // 默认语言
  fallbackLng: 'zh-CN', // 回退语言
  debug: false,
  interpolation: {
    escapeValue: false, // react已经处理了xss
  },
  detection: {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage'],
  },
};

// 初始化i18next
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init(i18nConfig);

export default i18n;