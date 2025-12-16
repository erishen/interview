# Storybook Setup Guide

This document explains how to use Storybook in the interview project.

## What is Storybook?

Storybook is a tool for building UI components and pages in isolation. It streamlines UI development, testing, and documentation.

## Getting Started

### Installation

Storybook has been pre-configured in this project. All dependencies are managed through the workspace catalog.

### Running Storybook

```bash
# From the project root
pnpm storybook

# Or from the web app directory
cd apps/web
pnpm storybook
```

This will start Storybook on `http://localhost:6006`.

### Building Storybook

```bash
# From the project root
pnpm build-storybook

# Or from the web app directory
cd apps/web
pnpm build-storybook
```

This creates a static build in the `storybook-static` directory.

## Project Structure

```
apps/web/
├── .storybook/
│   ├── main.ts          # Storybook configuration
│   └── preview.ts       # Global decorators and parameters
├── src/
│   └── stories/         # Story files
│       ├── Button.stories.ts
│       ├── Card.stories.tsx
│       ├── Input.stories.tsx
│       └── Examples.stories.tsx
└── package.json
```

## Writing Stories

### Basic Story Structure

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { YourComponent } from '@interview/ui';

const meta = {
  title: 'Components/YourComponent',
  component: YourComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // Define controls for component props
  },
} satisfies Meta<typeof YourComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Default props
  },
};
```

### Story Categories

- **Components/**: Individual UI components
- **Examples/**: Complex component combinations
- **Utils/**: Utility function demonstrations

## Features

### Auto-generated Documentation

Stories with the `autodocs` tag automatically generate documentation from TypeScript types and JSDoc comments.

### Interactive Controls

Use `argTypes` to create interactive controls for component props:

```typescript
argTypes: {
  variant: {
    control: { type: 'select' },
    options: ['default', 'primary', 'secondary'],
  },
  disabled: {
    control: 'boolean',
  },
}
```

### Responsive Testing

Built-in viewport controls for testing components at different screen sizes:
- Mobile (375px)
- Tablet (768px)
- Desktop (1024px)

### Theme Testing

Background controls for testing components in light and dark themes.

## Best Practices

### 1. Comprehensive Coverage

Create stories for:
- All component variants
- Different states (loading, error, disabled)
- Interactive examples
- Real-world use cases

### 2. Meaningful Names

Use descriptive story names:
```typescript
export const LoadingState: Story = { /* ... */ };
export const WithValidationError: Story = { /* ... */ };
export const LargeDataSet: Story = { /* ... */ };
```

### 3. Documentation

Add descriptions to help users understand components:
```typescript
parameters: {
  docs: {
    description: {
      component: 'A flexible button component with multiple variants.',
    },
  },
},
```

### 4. Realistic Data

Use realistic data in examples to better demonstrate component usage.

## Deployment

Storybook can be deployed as a static site. The build output in `storybook-static/` can be hosted on any static hosting service.

### Vercel Deployment

Add to `vercel.json`:
```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "buildCommand": "pnpm build-storybook"
      }
    }
  ]
}
```

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all workspace packages are properly linked
2. **CSS Issues**: Check that global styles are imported in `.storybook/preview.ts`
3. **TypeScript Errors**: Verify TypeScript configuration in `.storybook/main.ts`

### Getting Help

- [Storybook Documentation](https://storybook.js.org/docs)
- [Storybook Discord](https://discord.gg/storybook)
- [GitHub Issues](https://github.com/storybookjs/storybook/issues)