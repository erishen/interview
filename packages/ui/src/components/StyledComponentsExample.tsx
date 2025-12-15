'use client';

import React from 'react';
import styled from 'styled-components';
import { defaultTheme } from '@interview/config';

// Styled Components 示例组件
export const StyledExample = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary[500]}, ${props => props.theme.colors.primary[600]});
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.lg};
  color: white;
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  box-shadow: ${props => props.theme.shadows.md};
  transition: transform 0.2s ease-in-out;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

export const StyledCard = styled.div`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
`;

export const StyledTitle = styled.h2`
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin-bottom: ${props => props.theme.spacing.md};
`;

export const StyledText = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.base};
  line-height: ${props => props.theme.typography.lineHeight.relaxed};
`;

export const StyledButton = styled.button`
  background: ${props => props.theme.colors.primary[500]};
  color: white;
  border: none;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    background: ${props => props.theme.colors.primary[600]};
    transform: translateY(-1px);
  }
  
  &:active {
    background: ${props => props.theme.colors.primary[700]};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// 使用 styled-components 的示例组件
export const StyledComponentsExample: React.FC = () => {
  return (
    <StyledExample>
      <StyledTitle>Styled Components 示例</StyledTitle>
      <StyledCard>
        <StyledText>
          这是一个使用 styled-components 创建的示例组件。它完全支持主题系统，
          可以轻松地在不同主题之间切换。
        </StyledText>
        <StyledButton>点击我</StyledButton>
      </StyledCard>
    </StyledExample>
  );
};