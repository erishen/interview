# Environment Configuration

This document explains how to configure environment variables for the interview project.

## Files Overview

- `.env.example` - Template file with all available environment variables
- `.env.local` - Local development configuration (ignored by git)
- `.env.vercel` - Vercel production configuration (ignored by git)

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your actual values** in `.env.local`

3. **Generate secure secrets:**
   ```bash
   # For NEXTAUTH_SECRET
   openssl rand -base64 32

   # Or use online generator: https://generate-secret.vercel.app/32
   ```

## Required Variables

### FastAPI Backend
```bash
FASTAPI_URL=http://localhost:8081
```

### NextAuth (Admin App)
```bash
NEXTAUTH_URL=http://localhost:3003
NEXTAUTH_SECRET=your-secure-random-string-here
```

### Security
```bash
CSRF_SECRET=your-csrf-secret-here
```

## Optional Variables

### OAuth Providers
```bash
# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# GitHub OAuth (from GitHub Developer Settings)
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
```

### Database
```bash
# PostgreSQL connection string
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Or individual components
DB_HOST=localhost
DB_PORT=5432
DB_NAME=interview_db
DB_USER=your-username
DB_PASSWORD=your-password
```

### Redis/Caching
```bash
REDIS_URL=redis://localhost:6379
```

## Development vs Production

### Local Development
- Use `.env.local` for local development
- Variables are automatically loaded by Next.js
- Sensitive values are safe (file is gitignored)

### Production Deployment
- Set environment variables in your deployment platform (Vercel, Heroku, etc.)
- Copy values from `.env.vercel` as reference
- Never commit actual secrets to version control

## Security Best Practices

1. **Never commit secrets** - `.env.local` and `.env.vercel` are gitignored
2. **Use strong secrets** - Generate random strings for secrets
3. **Rotate secrets regularly** - Change secrets periodically
4. **Environment separation** - Use different secrets for dev/staging/prod

## Troubleshooting

### Variables not loading?
- Check if `.env.local` exists in project root
- Restart your development server
- Verify variable names match exactly

### OAuth not working?
- Ensure `NEXTAUTH_URL` matches your app's URL
- Check OAuth app settings match your domain
- Verify client IDs and secrets are correct

### Database connection issues?
- Verify `DATABASE_URL` format
- Check database server is running
- Ensure user has proper permissions

## Getting OAuth Credentials

### Google OAuth
1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create/select a project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs: `http://localhost:3003/api/auth/callback/google`

### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3003/api/auth/callback/github`
4. Copy Client ID and Client Secret
