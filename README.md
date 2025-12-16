# Tutor Admin Dashboard

**Next.js web dashboard for system administrators**

## Project Overview

Tutor Admin Dashboard is a web-based administration panel built with Next.js, providing system administrators with tools to manage content, monitor AI quality, and oversee the Tutor platform.

This module is part of the Tutor ecosystem - an AI-powered math tutoring platform for middle school students.

## Role in System

The Admin Dashboard allows administrators to:
- Manage system content and configurations
- Monitor AI service quality and accuracy
- View system-wide analytics and metrics
- Manage users and permissions
- Oversee learning content and skill graphs

## Tech Stack

### Required (from Project Specification)

| Component | Version | Purpose |
|-----------|---------|---------|
| Next.js | 14+ | Web framework |
| React | Latest | UI library |
| TypeScript | 5.3+ | Type safety |
| Tailwind CSS | Latest | Styling |

### Current Implementation

| Component | Version | Status |
|-----------|---------|--------|
| Next.js | 16.0.10 | ✅ Meets requirement |
| React | 19.2.0 | ✅ Latest |
| TypeScript | 5.9.3 | ✅ Meets requirement |
| Tailwind CSS | 4.1.17 | ✅ Latest |
| ApexCharts | 4.7.0 | ✅ For data visualization |

### Missing / To Be Added

- [ ] **Firebase Admin SDK** - For OAuth token verification (if needed)
- [ ] **API Client Setup** - Integration with Core Service REST API
- [ ] **Authentication Flow** - Customize for admin role
- [ ] **Environment Variables** - API endpoints configuration
- [ ] **Error Handling** - Centralized error handling for API calls
- [ ] **Loading States** - Consistent loading indicators

## Prerequisites

- **Node.js** 18.x or later (recommended: Node.js 20.x LTS)
- **npm** or **yarn** package manager
- **Git** for version control

## Installation

### 1. Install Dependencies

```bash
cd tutor-admin-dashboard
npm install
# or
yarn install
```

> **Note**: If you encounter peer dependency errors, use:
> ```bash
> npm install --legacy-peer-deps
> ```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Authentication (if using NextAuth)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Application
NEXT_PUBLIC_APP_NAME=Tutor Admin
NEXT_PUBLIC_APP_ENV=development
```

### 3. Start Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Core Service API base URL | `http://localhost:8080/api` | Yes |
| `NEXTAUTH_URL` | Application URL for NextAuth | `http://localhost:3000` | No |
| `NEXTAUTH_SECRET` | Secret for NextAuth | - | If using NextAuth |
| `NEXT_PUBLIC_APP_NAME` | Application name | `Tutor Admin` | No |
| `NEXT_PUBLIC_APP_ENV` | Environment (dev/staging/prod) | `development` | No |

### API Integration

The dashboard communicates with the Core Service via REST API. Configure the API client in:

```
src/lib/api/client.ts
```

Example API client setup:

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authentication interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

## Development

### Project Structure

```
tutor-admin-dashboard/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── icons/            # SVG icons
│   └── layout/           # Layout components
├── public/               # Static assets
├── next.config.ts        # Next.js configuration
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── package.json          # Dependencies
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

### Adding New Features

1. **Create Page**: Add new route in `src/app/`
2. **Create Component**: Add reusable components in `src/components/`
3. **API Integration**: Use API client in `src/lib/api/`
4. **Styling**: Use Tailwind CSS classes

## Building

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `.next` directory.

### Build Output

- Static pages are pre-rendered
- Dynamic pages use server-side rendering
- Assets are optimized and minified

## Deployment

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

Build and run:

```bash
docker build -t tutor-admin-dashboard .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.tutor.app/api \
  tutor-admin-dashboard
```

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Other Platforms

Next.js can be deployed to:
- AWS (Amplify, EC2)
- Google Cloud Platform
- Azure
- Any Node.js hosting service

## API Integration

### Core Service Endpoints

The dashboard integrates with Core Service for:

- **Authentication**: Admin login/logout
- **User Management**: View and manage users
- **Content Management**: Manage learning content
- **Analytics**: System-wide metrics
- **Quality Monitoring**: AI service quality metrics

### Example API Call

```typescript
import apiClient from '@/lib/api/client';

// Get system metrics
const getSystemMetrics = async () => {
  const response = await apiClient.get('/admin/metrics');
  return response.data;
};
```

## Next Steps

### Implementation Status

- ✅ **Foundation**: Next.js 16 setup with Tailwind CSS
- ✅ **UI Components**: Dashboard components and layouts
- ✅ **Charts**: ApexCharts integration
- 🚧 **API Integration**: Need to implement Core Service API client
- 📋 **Authentication**: Need to customize for admin role
- 📋 **Content Management**: Need to implement admin features
- 📋 **Analytics Dashboard**: Need to build admin-specific views

### Required Implementations

1. **API Client Setup**
   - Create API client with authentication
   - Add error handling
   - Implement request/response interceptors

2. **Authentication**
   - Customize authentication flow for admin
   - Add role-based access control
   - Implement session management

3. **Admin Features**
   - Content management interface
   - User management
   - System monitoring dashboard
   - AI quality monitoring

4. **Environment Configuration**
   - Setup environment-specific configs
   - Add secrets management
   - Configure API endpoints

## Troubleshooting

### Common Issues

**Issue**: Port 3000 already in use
```bash
# Kill process on port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:3000 | xargs kill
```

**Issue**: Module not found errors
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

**Issue**: Build errors
```bash
# Check TypeScript errors
npm run lint
# Fix and rebuild
npm run build
```

## Related Documentation

- [System Architecture](../../tutor_docs/technical_design/system_architecture_phase_1-2025-12-15-00-21.md)
- [API Specification](../../tutor_docs/technical_design/api_specification_phase_1-2025-12-15-03-30.md)
- [Development Setup](../../tutor_docs/technical_design/development_setup_phase_1-2025-12-15-03-00.md)

## License

This project is part of the Tutor platform and is licensed under the MIT License.

---

**Last Updated**: 2025-12-15
