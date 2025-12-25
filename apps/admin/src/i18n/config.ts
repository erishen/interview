import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // 默认语言
  defaultLocale: 'zh',
  // 支持的语言
  locales: ['en', 'zh'],
  // 路径前缀配置
  localePrefix: 'always'
});

// 类型化的路由钩子
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
