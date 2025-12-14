# Interview Project

A modern interview project built with Next.js and monorepo architecture using Turborepo.

## 🏗️ Architecture

This project uses a monorepo structure with the following organization:

```
interview/
├── apps/
│   ├── web/          # Main Next.js application
│   └── admin/        # Admin dashboard (Next.js)
├── packages/
│   ├── ui/           # Shared UI components
│   ├── utils/        # Utility functions
│   ├── config/       # Configuration files
│   ├── types/        # TypeScript type definitions
│   └── eslint-config/ # Shared ESLint configuration
├── package.json      # Root package.json
├── pnpm-workspace.yaml
├── turbo.json        # Turborepo configuration
└── tsconfig.json     # Root TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 8+

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd interview
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

This will start:
- Web app at http://localhost:3000
- Admin app at http://localhost:3001

## 📦 Available Scripts

- `pnpm dev` - Start all applications in development mode
- `pnpm build` - Build all applications for production
- `pnpm lint` - Run ESLint across all packages
- `pnpm type-check` - Run TypeScript type checking
- `pnpm test` - Run tests across all packages
- `pnpm clean` - Clean build artifacts
- `pnpm format` - Format code with Prettier

## 🏗️ Project Structure

### Apps

- **web**: Main Next.js application with modern UI
- **admin**: Admin dashboard for managing the application

### Packages

- **ui**: Reusable React components with Tailwind CSS
- **utils**: Utility functions and helpers
- **config**: Configuration files and constants
- **types**: Shared TypeScript type definitions
- **eslint-config**: Shared ESLint configuration

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Turborepo
- **Package Manager**: pnpm
- **Linting**: ESLint + Prettier

## 🔧 Development

### Adding New Packages

To add a new package to the monorepo:

1. Create a new directory in `packages/`
2. Add a `package.json` with the naming convention `@interview/package-name`
3. Update the root `tsconfig.json` paths if needed
4. Add the package to relevant app dependencies

### Working with Shared Components

Components from the `@interview/ui` package can be imported in any app:

```tsx
import { Button, Card, Input } from "@interview/ui";
```

### Environment Variables

Create `.env.local` files in individual apps for environment-specific variables:

```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 📝 Code Style

This project uses:
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety

Run `pnpm lint` and `pnpm format` before committing changes.

## 🚀 Deployment

### Building for Production

```bash
pnpm build
```

### Individual App Deployment

Each app can be deployed independently:

```bash
# Build specific app
cd apps/web
pnpm build
pnpm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.