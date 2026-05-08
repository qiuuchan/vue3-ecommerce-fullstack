import { storeToRefs } from 'pinia';
import { appMessages, permissionMessageKey, type AppLocale } from '@/i18n/index';
import { useLocaleStore } from '@/stores/localeStore';

// 全站文案：语言来自 localeStore（localStorage），与后台/前台无关
export function useAppI18n() {
  const localeStore = useLocaleStore();
  const { locale } = storeToRefs(localeStore);

  const t = (key: string, vars?: Record<string, string | number>): string => {
    const table = appMessages[locale.value as AppLocale] ?? appMessages['zh-CN'];
    let s = table[key] ?? key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return s;
  };

  /** 权限码转当前语言标签 */
  const perm = (code: string): string => {
    const k = permissionMessageKey(code);
    return t(k) === k ? code : t(k);
  };

  return {
    t,
    perm,
    locale,
    setLocale: localeStore.setLocale
  };
}
