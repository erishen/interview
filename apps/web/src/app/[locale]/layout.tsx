import type { Metadata } from "next";
import StyledComponentsRegistry from "@/lib/styled-components-registry";
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {locales} from '@/i18n/request';

export const metadata: Metadata = {
  title: "Interview Project",
  description: "A modern interview project built with Next.js and monorepo architecture",
};

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  
  // 确保 locale 是有效的
  if (!locales.includes(locale as any)) {
    notFound();
  }
  
  // 提供消息给所有组件
  const messages = await getMessages();

  return (
    <StyledComponentsRegistry>
      <NextIntlClientProvider messages={messages}>
        {children}
      </NextIntlClientProvider>
    </StyledComponentsRegistry>
  );
}
