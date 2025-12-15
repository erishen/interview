import styled from 'styled-components';
import { defaultTheme } from '@interview/config';

// 基础按钮样式
export const StyledButton = styled.button<{
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  border: 1px solid transparent;
  
  /* 尺寸样式 */
  ${({ size = 'md', theme }) => {
    switch (size) {
      case 'sm':
        return `
          padding: ${theme.spacing.xs} ${theme.spacing.sm};
          font-size: ${theme.typography.fontSize.sm};
          height: 2rem;
        `;
      case 'lg':
        return `
          padding: ${theme.spacing.sm} ${theme.spacing.lg};
          font-size: ${theme.typography.fontSize.lg};
          height: 3rem;
        `;
      default:
        return `
          padding: ${theme.spacing.sm} ${theme.spacing.md};
          font-size: ${theme.typography.fontSize.base};
          height: 2.5rem;
        `;
    }
  }}
  
  /* 变体样式 */
  ${({ variant = 'primary', theme }) => {
    switch (variant) {
      case 'secondary':
        return `
          background-color: ${theme.colors.secondary[100]};
          color: ${theme.colors.secondary[700]};
          border-color: ${theme.colors.secondary[200]};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.secondary[200]};
            border-color: ${theme.colors.secondary[300]};
          }
          
          &:active:not(:disabled) {
            background-color: ${theme.colors.secondary[300]};
          }
        `;
      case 'outline':
        return `
          background-color: transparent;
          color: ${theme.colors.primary[600]};
          border-color: ${theme.colors.primary[300]};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.primary[50]};
            border-color: ${theme.colors.primary[400]};
          }
          
          &:active:not(:disabled) {
            background-color: ${theme.colors.primary[100]};
          }
        `;
      case 'ghost':
        return `
          background-color: transparent;
          color: ${theme.colors.primary[600]};
          border-color: transparent;
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.primary[50]};
          }
          
          &:active:not(:disabled) {
            background-color: ${theme.colors.primary[100]};
          }
        `;
      default: // primary
        return `
          background-color: ${theme.colors.primary[500]};
          color: white;
          border-color: ${theme.colors.primary[500]};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.primary[600]};
            border-color: ${theme.colors.primary[600]};
          }
          
          &:active:not(:disabled) {
            background-color: ${theme.colors.primary[700]};
            border-color: ${theme.colors.primary[700]};
          }
        `;
    }
  }}
  
  /* 禁用状态 */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* 焦点状态 */
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary[500]};
    outline-offset: 2px;
  }
`;

// 基础卡片样式
export const StyledCard = styled.div<{
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg' | 'xl';
}>`
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  
  ${({ padding = 'md', theme }) => {
    switch (padding) {
      case 'sm':
        return `padding: ${theme.spacing.sm};`;
      case 'lg':
        return `padding: ${theme.spacing.xl};`;
      default:
        return `padding: ${theme.spacing.lg};`;
    }
  }}
  
  ${({ shadow = 'sm', theme }) => {
    return `box-shadow: ${theme.shadows[shadow]};`;
  }}
`;

// 基础输入框样式
export const StyledInput = styled.input<{
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
}>`
  width: 100%;
  border: 1px solid ${({ theme, error }) => 
    error ? theme.colors.error : theme.colors.gray[300]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily.sans};
  transition: all 0.2s ease-in-out;
  
  ${({ size = 'md', theme }) => {
    switch (size) {
      case 'sm':
        return `
          padding: ${theme.spacing.xs} ${theme.spacing.sm};
          font-size: ${theme.typography.fontSize.sm};
          height: 2rem;
        `;
      case 'lg':
        return `
          padding: ${theme.spacing.sm} ${theme.spacing.lg};
          font-size: ${theme.typography.fontSize.lg};
          height: 3rem;
        `;
      default:
        return `
          padding: ${theme.spacing.sm} ${theme.spacing.md};
          font-size: ${theme.typography.fontSize.base};
          height: 2.5rem;
        `;
    }
  }}
  
  &:focus {
    outline: none;
    border-color: ${({ theme, error }) => 
      error ? theme.colors.error : theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${({ theme, error }) => 
      error ? `${theme.colors.error}20` : `${theme.colors.primary[500]}20`};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.disabled};
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.gray[50]};
    color: ${({ theme }) => theme.colors.text.disabled};
    cursor: not-allowed;
  }
`;

// 基础文本样式
export const StyledText = styled.span<{
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption';
  color?: 'primary' | 'secondary' | 'disabled';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
}>`
  font-family: ${({ theme }) => theme.typography.fontFamily.sans};
  color: ${({ theme, color = 'primary' }) => {
    switch (color) {
      case 'secondary':
        return theme.colors.text.secondary;
      case 'disabled':
        return theme.colors.text.disabled;
      default:
        return theme.colors.text.primary;
    }
  }};
  
  ${({ weight, theme }) => weight && `font-weight: ${theme.typography.fontWeight[weight]};`}
  
  ${({ variant = 'body', theme }) => {
    switch (variant) {
      case 'h1':
        return `
          font-size: ${theme.typography.fontSize['5xl']};
          font-weight: ${theme.typography.fontWeight.bold};
          line-height: ${theme.typography.lineHeight.tight};
        `;
      case 'h2':
        return `
          font-size: ${theme.typography.fontSize['4xl']};
          font-weight: ${theme.typography.fontWeight.bold};
          line-height: ${theme.typography.lineHeight.tight};
        `;
      case 'h3':
        return `
          font-size: ${theme.typography.fontSize['3xl']};
          font-weight: ${theme.typography.fontWeight.semibold};
          line-height: ${theme.typography.lineHeight.tight};
        `;
      case 'h4':
        return `
          font-size: ${theme.typography.fontSize['2xl']};
          font-weight: ${theme.typography.fontWeight.semibold};
          line-height: ${theme.typography.lineHeight.normal};
        `;
      case 'h5':
        return `
          font-size: ${theme.typography.fontSize.xl};
          font-weight: ${theme.typography.fontWeight.medium};
          line-height: ${theme.typography.lineHeight.normal};
        `;
      case 'h6':
        return `
          font-size: ${theme.typography.fontSize.lg};
          font-weight: ${theme.typography.fontWeight.medium};
          line-height: ${theme.typography.lineHeight.normal};
        `;
      case 'caption':
        return `
          font-size: ${theme.typography.fontSize.sm};
          line-height: ${theme.typography.lineHeight.normal};
        `;
      default: // body
        return `
          font-size: ${theme.typography.fontSize.base};
          line-height: ${theme.typography.lineHeight.normal};
        `;
    }
  }}
`;