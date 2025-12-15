'use client';

import React from 'react';
import { ThemeProvider } from 'styled-components';
import { defaultTheme } from '@interview/config';

interface StyledComponentsProviderProps {
  children: React.ReactNode;
  theme?: typeof defaultTheme;
}

export const StyledComponentsProvider: React.FC<StyledComponentsProviderProps> = ({
  children,
  theme = defaultTheme,
}) => {
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
};

// 导出 styled-components 的类型
export type { Theme } from '@interview/config';
export { default as styled } from 'styled-components';