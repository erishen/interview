'use client';

import React from 'react';
import { StyledComponentsProvider } from '@interview/ui';
import { StyledComponentsExample } from '@interview/ui';

export default function StyledComponentsPage() {
  return (
    <StyledComponentsProvider>
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Styled Components 示例</h1>
        <StyledComponentsExample />
      </div>
    </StyledComponentsProvider>
  );
}