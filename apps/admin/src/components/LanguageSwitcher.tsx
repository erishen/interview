'use client';

import { useLocale } from 'next-intl';
import { Button } from '@interview/ui';

export function LanguageSwitcher() {
  const locale = useLocale();

  const switchLanguage = () => {
    const currentPathname = window.location.pathname;
    const targetLocale = locale === 'zh' ? 'en' : 'zh';

    // 移除旧的语言前缀，添加新的语言前缀
    const newPathname = currentPathname.replace(/\/(en|zh)/, `/${targetLocale}`);

    // 手动跳转到新的 URL
    window.location.href = newPathname;
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-400">{locale === 'zh' ? '中文' : 'EN'}</span>
      <Button
        size="sm"
        variant="outline"
        onClick={switchLanguage}
        className="bg-white/10 hover:bg-white/20 border-white/20 text-white transition-all duration-300"
      >
        {locale === 'zh' ? 'EN' : '中文'}
      </Button>
    </div>
  );
}
