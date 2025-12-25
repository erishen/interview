import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// 支持的语言
export const locales = ['en', 'zh'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  // This function can be marked `async` if using `await requestLocale`

  // Provide a static locale, request a given one, or use one based on the user request
  let locale = await requestLocale;

  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as Locale)) notFound();

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
