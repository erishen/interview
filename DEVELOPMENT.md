# Development Guide

## 🏗️ Monorepo Structure

This project follows a monorepo architecture using Turborepo for efficient build orchestration and pnpm workspaces for dependency management.

## 🔧 Development Workflow

### Setting Up Your Environment

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Start Development Servers**
   ```bash
   pnpm dev
   ```

3. **Run Type Checking**
   ```bash
   pnpm type-check
   ```

### Working with Packages

#### Creating a New Shared Package

1. Create directory structure:
   ```bash
   mkdir -p packages/new-package/src
   ```

2. Create `package.json`:
   ```json
   {
     "name": "@interview/new-package",
     "version": "0.1.0",
     "private": true,
     "main": "./src/index.ts",
     "types": "./src/index.ts"
   }
   ```

3. Add to root `tsconfig.json` paths:
   ```json
   {
     "paths": {
       "@interview/new-package": ["./packages/new-package/src"]
     }
   }
   ```

#### Using Shared Packages

In any app, add the package as a dependency:

```json
{
  "dependencies": {
    "@interview/new-package": "workspace:*"
  }
}
```

Then import in your code:
```typescript
import { something } from "@interview/new-package";
```

### Code Quality

#### ESLint Configuration

The project uses a shared ESLint configuration in `packages/eslint-config`. Each app extends this configuration:

```javascript
// apps/web/.eslintrc.json
{
  "extends": ["@interview/eslint-config"]
}
```

#### TypeScript Configuration

- Root `tsconfig.json` contains shared configuration
- Each app has its own `tsconfig.json` that extends the root
- Packages use the root configuration directly

### Build System

#### Turborepo Pipeline

The `turbo.json` file defines the build pipeline:

- `build`: Builds all packages and apps
- `dev`: Starts development servers
- `lint`: Runs linting across all packages
- `type-check`: Runs TypeScript checking
- `test`: Runs tests

#### Dependency Graph

Turborepo automatically handles the dependency graph:
- Packages are built before apps that depend on them
- Changes trigger rebuilds only for affected packages

### Testing Strategy

#### Unit Tests
- Use Jest for unit testing
- Place tests next to source files with `.test.ts` extension
- Run with `pnpm test`

#### Integration Tests
- Use Playwright for end-to-end testing
- Place in `tests/` directory in each app
- Run with `pnpm test:e2e`

### Styling Guidelines

#### Tailwind CSS
- Use Tailwind utility classes for styling
- Shared components in `@interview/ui` should be styled with Tailwind
- Custom CSS should be minimal and placed in component files

#### Component Design
- Follow atomic design principles
- Create reusable components in `@interview/ui`
- Use TypeScript interfaces for props
- Include proper JSDoc comments

### Performance Optimization

#### Bundle Analysis
```bash
# Analyze bundle size
cd apps/web
pnpm build
pnpm analyze
```

#### Code Splitting
- Use dynamic imports for large components
- Implement route-based code splitting
- Lazy load non-critical components

### Debugging

#### Development Tools
- Use React Developer Tools
- Enable TypeScript strict mode
- Use ESLint and Prettier extensions in your editor

#### Common Issues
1. **Import Resolution**: Check `tsconfig.json` paths
2. **Build Failures**: Run `pnpm clean` and rebuild
3. **Type Errors**: Ensure all packages are built

### Deployment

#### Environment Setup
- Development: `pnpm dev`
- Staging: `pnpm build && pnpm start`
- Production: Use Docker or platform-specific deployment

#### Environment Variables
- Use `.env.local` for local development
- Use `.env.production` for production builds
- Never commit sensitive environment variables

### Best Practices

1. **Code Organization**
   - Keep components small and focused
   - Use custom hooks for complex logic
   - Separate business logic from UI components

2. **Performance**
   - Use React.memo for expensive components
   - Implement proper loading states
   - Optimize images and assets

3. **Accessibility**
   - Use semantic HTML elements
   - Include proper ARIA attributes
   - Test with screen readers

4. **Security**
   - Validate all user inputs
   - Use HTTPS in production
   - Implement proper authentication

## 🔍 Troubleshooting

### Common Commands

```bash
# Clean all build artifacts
pnpm clean

# Reinstall all dependencies
rm -rf node_modules packages/*/node_modules apps/*/node_modules
pnpm install

# Check for dependency issues
pnpm audit

# Update dependencies
pnpm update
```

### Getting Help

- Check the project documentation
- Review existing code patterns
- Ask team members for guidance
- Create detailed issue reports