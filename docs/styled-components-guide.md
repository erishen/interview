# Styled Components 使用指南

## 概述

本项目已完整集成 styled-components，支持与 Tailwind CSS 混用。styled-components 提供了强大的主题系统和类型安全的样式定义。

## 安装和配置

### 依赖版本

项目使用以下版本的 styled-components 相关依赖：

- `styled-components`: `^6.1.13`
- `@types/styled-components`: `^5.1.34`

### Next.js 配置

已在 `next.config.js` 中启用 styled-components 编译器：

```javascript
module.exports = {
  compiler: {
    styledComponents: true,
  },
};
```

## 主题系统

### 默认主题

项目提供了一个完整的主题配置，包含以下内容：

- **颜色系统**: primary、secondary、gray、success、warning、error、info
- **间距系统**: xs、sm、md、lg、xl、2xl、3xl、4xl
- **圆角系统**: none、sm、md、lg、xl、full
- **阴影系统**: sm、md、lg、xl
- **断点系统**: sm、md、lg、xl、2xl
- **字体系统**: 字体族、字号、字重、行高

### 使用主题

```tsx
import styled from 'styled-components';
import { defaultTheme } from '@interview/config';

const StyledDiv = styled.div`
  color: ${props => props.theme.colors.primary[500]};
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.md};
`;
```

## 组件使用

### 1. 使用 ThemeProvider

在应用根组件中包裹 ThemeProvider：

```tsx
import { StyledComponentsProvider } from '@interview/ui';

function App() {
  return (
    <StyledComponentsProvider>
      <YourComponents />
    </StyledComponentsProvider>
  );
}
```

### 2. 创建 styled 组件

```tsx
import styled from 'styled-components';

const Button = styled.button`
  background: ${props => props.theme.colors.primary[500]};
  color: white;
  padding: ${props => props.theme.spacing.md};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  
  &:hover {
    background: ${props => props.theme.colors.primary[600]};
  }
`;
```

### 3. 使用示例组件

项目提供了一个示例组件：

```tsx
import { StyledComponentsExample } from '@interview/ui';

function MyComponent() {
  return <StyledComponentsExample />;
}
```

## 最佳实践

### 1. 类型安全

利用 TypeScript 的类型推断：

```tsx
import styled, { css } from 'styled-components';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

const Button = styled.button<ButtonProps>`
  padding: ${props => {
    switch (props.size) {
      case 'sm': return props.theme.spacing.sm;
      case 'lg': return props.theme.spacing.lg;
      default: return props.theme.spacing.md;
    }
  }};
  
  background: ${props => 
    props.variant === 'secondary' 
      ? props.theme.colors.secondary[500]
      : props.theme.colors.primary[500]
  };
`;
```

### 2. 响应式设计

使用主题中的断点：

```tsx
const ResponsiveDiv = styled.div`
  padding: ${props => props.theme.spacing.md};
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing.lg};
  }
`;
```

### 3. 主题定制

可以创建自定义主题：

```tsx
import { defaultTheme } from '@interview/config';

const customTheme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    primary: {
      ...defaultTheme.colors.primary,
      500: '#your-custom-color',
    },
  },
};
```

## 与 Tailwind CSS 混用

项目支持同时使用 Tailwind CSS 和 styled-components：

```tsx
// 使用 Tailwind CSS
<div className="p-4 bg-blue-500 text-white rounded">
  Tailwind 组件
</div>

// 使用 styled-components
const StyledDiv = styled.div`
  background: ${props => props.theme.colors.primary[500]};
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.lg};
`;
```

## 注意事项

1. **SSR 支持**: 项目已配置 SSR 支持，styled-components 可以正常工作
2. **性能**: styled-components 会自动进行样式优化
3. **调试**: 可以使用 styled-components devtools 进行调试
4. **主题更新**: 修改主题后需要重新构建项目

## 迁移指南

如果需要将现有组件迁移到 styled-components：

1. 保持组件的 props 接口不变
2. 将样式逻辑移到 styled 组件中
3. 使用主题系统替代硬编码的样式值
4. 添加类型定义确保类型安全