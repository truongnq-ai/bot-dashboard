# TUTOR ADMIN DASHBOARD

**Module:** Dashboard Web cho Admin Quản trị  
**Version:** 1.0.0  
**Last Updated:** 2025-12-21

---

## 📋 TỔNG QUAN

### Mục đích Module

Tutor Admin Dashboard là **dashboard web dành cho admin** để quản lý và giám sát hệ thống Tutor. Module này cho phép admin:

- **Quản lý nội dung**: Quản lý learning content, skill graphs, questions
- **Giám sát chất lượng AI**: Theo dõi độ chính xác của AI service, review solutions
- **Theo dõi hệ thống**: System metrics, user analytics, performance monitoring
- **Quản lý người dùng**: View và manage users (students, parents, admins)

### Vai trò trong Hệ thống Tutor

Theo [System Architecture](../../tutor_docs/technical_design/system_architecture_phase_1-2025-12-15-00-21.md):

- **Frontend**: Next.js Web Dashboard (SSR + CSR)
- **Authentication**: JWT với admin role (ROLE_ADMIN)
- **API Integration**: Giao tiếp với Core Service qua REST API
- **User Persona**: Admin/Operations team, có kiến thức kỹ thuật

### Scope Phase 1 (MVP)

Theo [PRD MVP](../../tutor_docs/prd/prd_mvp_phase_1-2025-12-14-22-15.md):

**Phase 1 (MVP)**:
- Admin dashboard cơ bản
- System monitoring
- User management (view only)
- AI quality monitoring (basic)

**Phase 3 (Mở rộng)**:
- Admin/Ops dashboard nâng cao
- Quản trị nội dung chi tiết
- Giám sát chất lượng AI nâng cao

## Roadmap

Xem [Admin Dashboard Roadmap](../../tutor_docs/04-for-developers/roadmap/admin-dashboard.md) để theo dõi tiến độ triển khai chi tiết.

---

## 🏗️ KIẾN TRÚC & TECH STACK

### Tech Stack Hiện Tại

| Component | Version | Status | Ghi chú |
|-----------|---------|--------|---------|
| **Next.js** | 16.0.10 | ✅ Đạt yêu cầu | Yêu cầu: 14+ |
| **React** | 19.2.0 | ✅ Latest | |
| **TypeScript** | 5.9.3 | ✅ Đạt yêu cầu | Yêu cầu: 5.3+ |
| **Tailwind CSS** | 4.1.17 | ✅ Latest | |
| **ApexCharts** | 4.7.0 | ✅ Đạt yêu cầu | Cho analytics charts |
| **FullCalendar** | 6.1.19 | ⚠️ Có thể cần | Nếu cần calendar cho scheduling |
| **React DnD** | 16.0.1 | ❌ Không cần | Xóa khỏi dependencies |
| **React Dropzone** | 14.3.8 | ⚠️ Có thể cần | Nếu cần upload content |

### Dependencies Cần Thêm

```bash
# API Client
npm install axios

# Form handling (cho content management)
npm install react-hook-form zod

# Date formatting
npm install date-fns

# Data tables (cho user/content management)
npm install @tanstack/react-table

# File upload (nếu cần)
npm install react-dropzone
```

### Dependencies Cần Xóa

```bash
# React DnD - Không cần cho admin dashboard
npm uninstall react-dnd react-dnd-html5-backend

# FullCalendar - Đánh giá lại (có thể cần cho scheduling)
# npm uninstall @fullcalendar/core @fullcalendar/daygrid @fullcalendar/interaction @fullcalendar/list @fullcalendar/react @fullcalendar/timegrid
```

---

## 📁 CẤU TRÚC PROJECT

### Cấu trúc Hiện Tại (Sau Cleanup)

```
tutor-admin-dashboard/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (full-width-pages)/       # Auth pages (GIỮ LẠI)
│   │   │   ├── (auth)/
│   │   │   │   ├── signin/          # ✅ Cần customize cho admin login
│   │   │   │   └── layout.tsx
│   │   │   └── (error-pages)/
│   │   │       ├── error-404/       # ✅ GIỮ LẠI
│   │   │       └── error-500/       # ✅ Có thể cần
│   │   ├── dashboard/                # ✅ CẦN TẠO MỚI
│   │   │   ├── page.tsx              # Dashboard overview
│   │   │   ├── users/                # User management
│   │   │   │   ├── students/         # Student management
│   │   │   │   ├── parents/          # Parent management
│   │   │   │   └── admins/           # Admin management
│   │   │   ├── content/              # Content management
│   │   │   │   ├── skills/           # Skill graph management
│   │   │   │   └── questions/        # Question management
│   │   │   ├── ai-quality/           # AI quality monitoring
│   │   │   │   ├── solutions/        # Review AI solutions
│   │   │   │   └── accuracy/         # Accuracy metrics
│   │   │   └── system/               # System monitoring
│   │   │       ├── metrics/          # System metrics
│   │   │       ├── logs/             # System logs
│   │   │       └── health/            # Health checks
│   │   ├── layout.tsx                 # Root layout
│   │   └── globals.css
│   ├── components/
│   │   ├── auth/                     # ✅ GIỮ LẠI, cần customize
│   │   │   └── SignInForm.tsx
│   │   ├── dashboard/                # ✅ CẦN TẠO MỚI
│   │   │   ├── MetricsCard.tsx       # System metrics cards
│   │   │   ├── UserTable.tsx         # User management table
│   │   │   ├── ContentTable.tsx      # Content management table
│   │   │   └── AISolutionReview.tsx  # AI solution review component
│   │   ├── layout/                    # ✅ GIỮ LẠI
│   │   │   ├── AppHeader.tsx
│   │   │   └── AppSidebar.tsx
│   │   └── common/                    # ✅ GIỮ LẠI, loại bỏ không cần
│   │       ├── PageBreadCrumb.tsx
│   │       └── ThemeToggleButton.tsx
│   ├── lib/
│   │   ├── api/                      # ✅ CẦN TẠO MỚI
│   │   │   ├── client.ts             # API client với auth interceptor
│   │   │   ├── endpoints.ts          # API endpoints constants
│   │   │   └── admin.ts              # Admin API functions
│   │   ├── hooks/                    # ✅ CẦN TẠO MỚI
│   │   │   ├── useAuth.ts            # Authentication hook
│   │   │   ├── useUsers.ts           # User data hook
│   │   │   ├── useContent.ts         # Content data hook
│   │   │   └── useSystem.ts          # System metrics hook
│   │   └── utils/
│   │       └── formatters.ts        # Date/number formatters
│   ├── context/                      # ✅ GIỮ LẠI
│   │   ├── ThemeContext.tsx
│   │   └── AuthContext.tsx           # ✅ CẦN TẠO MỚI
│   └── types/                        # ✅ CẦN TẠO MỚI
│       ├── admin.ts
│       ├── user.ts
│       ├── content.ts
│       └── system.ts
├── public/                           # Static assets
├── .env.local                        # Environment variables
├── next.config.ts
├── tsconfig.json
└── package.json
```

### Components/Pages Cần Xóa

Các component/pages sau là **demo từ TailAdmin template**, không cần cho Admin Dashboard:

```
❌ XÓA:
- src/app/(admin)/(others-pages)/        # Tất cả demo pages
  - (chart)/bar-chart/
  - (chart)/line-chart/
  - (forms)/form-elements/
  - (tables)/basic-tables/
  - blank/
  - calendar/                             # Có thể giữ nếu cần scheduling
  - profile/                              # Profile demo (không cần)

- src/app/(admin)/(ui-elements)/        # Demo UI components
  - alerts/                               # Có thể giữ nếu cần alert system
  - avatars/
  - badge/
  - buttons/
  - images/
  - modals/                               # Có thể giữ nếu cần modal dialogs
  - videos/

- src/components/ecommerce/             # Ecommerce demo components
- src/components/example/                # Example components
- src/components/videos/                 # Video demo components
- src/components/user-profile/           # Profile demo

⚠️ GIỮ LẠI (có thể dùng):
- src/components/form/                  # Form components (cần cho content management)
- src/components/tables/                 # Table components (cần cho user/content tables)
- src/components/charts/                # Chart components (cần cho analytics)
- src/components/ui/modal/              # Modal components (cần cho dialogs)
```

---

## 🔧 KẾ HOẠCH LÀM SẠCH (CLEANUP PLAN)

### Phase 1: Xóa Demo Components (Ưu tiên CAO)

**Mục tiêu**: Loại bỏ tất cả demo/example code không cần thiết từ TailAdmin template.

#### 1.1. Xóa Demo Pages

```bash
# Xóa demo pages
rm -rf src/app/(admin)/(others-pages)
rm -rf src/app/(admin)/(ui-elements)
rm -rf src/app/(admin)/layout.tsx
rm -rf src/app/(admin)/page.tsx
```

#### 1.2. Xóa Demo Components

```bash
# Xóa ecommerce demo
rm -rf src/components/ecommerce

# Xóa example components
rm -rf src/components/example

# Xóa video demo
rm -rf src/components/videos

# Xóa user-profile demo
rm -rf src/components/user-profile
```

#### 1.3. Xóa Dependencies Không Cần

```bash
# Xóa React DnD (không cần drag & drop)
npm uninstall react-dnd react-dnd-html5-backend

# Đánh giá lại FullCalendar (có thể cần cho scheduling)
# Nếu không cần → xóa
# npm uninstall @fullcalendar/core @fullcalendar/daygrid @fullcalendar/interaction @fullcalendar/list @fullcalendar/react @fullcalendar/timegrid
```

### Phase 2: Customize Authentication (Ưu tiên CAO)

**Mục tiêu**: Customize authentication flow cho admin role.

#### 2.1. Customize SignIn Form

**File**: `src/components/auth/SignInForm.tsx`

**Yêu cầu**:
- Username input (alphanumeric)
- Password input
- Admin-only login (không hỗ trợ OAuth cho admin)
- Handle admin authentication

**API Integration**:
- `POST /api/admin/login` (username/password)

**Authentication Flow**:
Theo [Authentication Flow](../../tutor_docs/technical_design/authentication_flow_phase_1-2025-12-15.md):
- Admin không đăng ký được (chỉ được tạo bởi admin khác hoặc seed data)
- Username: Alphanumeric (case-insensitive)
- Không hỗ trợ OAuth

### Phase 3: Tạo Dashboard Pages (Ưu tiên CAO)

**Mục tiêu**: Implement các dashboard pages cho admin.

#### 3.1. Dashboard Overview Page

**File**: `src/app/dashboard/page.tsx`

**Features**:

- **System Metrics Cards**:
  - Total Users (Students + Parents)
  - Active Sessions
  - AI Service Health
  - System Uptime

- **Quick Stats**:
  - New users today/week
  - Total practice sessions
  - AI solution accuracy rate
  - System error rate

- **Charts**:
  - User growth chart
  - Activity chart (requests per hour)
  - AI accuracy trend
  - System performance metrics

**API Integration**:
- `GET /api/admin/metrics`
- `GET /api/admin/stats`

#### 3.2. User Management Pages

**File**: `src/app/dashboard/users/students/page.tsx`  
**File**: `src/app/dashboard/users/parents/page.tsx`  
**File**: `src/app/dashboard/users/admins/page.tsx`

**Features**:
- User list table (pagination, search, filter)
- User details view
- User status management (active/inactive)
- View user activity logs

**API Integration**:
- `GET /api/admin/users/students`
- `GET /api/admin/users/parents`
- `GET /api/admin/users/admins`
- `GET /api/admin/users/:id`
- `PUT /api/admin/users/:id/status`

#### 3.3. Content Management Pages

**File**: `src/app/dashboard/content/skills/page.tsx`  
**File**: `src/app/dashboard/content/questions/page.tsx`

**Features**:
- Skill graph visualization
- Skill CRUD operations
- Question management
- Content review and approval

**API Integration**:
- `GET /api/admin/content/skills`
- `POST /api/admin/content/skills`
- `PUT /api/admin/content/skills/:id`
- `GET /api/admin/content/questions`
- `POST /api/admin/content/questions`

#### 3.4. AI Quality Monitoring Pages

**File**: `src/app/dashboard/ai-quality/solutions/page.tsx`  
**File**: `src/app/dashboard/ai-quality/accuracy/page.tsx`

**Features**:
- Review AI solutions (approve/reject)
- Accuracy metrics dashboard
- Error analysis
- Solution quality trends

**API Integration**:
- `GET /api/admin/ai-quality/solutions`
- `POST /api/admin/ai-quality/solutions/:id/review`
- `GET /api/admin/ai-quality/accuracy`
- `GET /api/admin/ai-quality/errors`

#### 3.5. System Monitoring Pages

**File**: `src/app/dashboard/system/metrics/page.tsx`  
**File**: `src/app/dashboard/system/logs/page.tsx`  
**File**: `src/app/dashboard/system/health/page.tsx`

**Features**:
- Real-time system metrics
- System logs viewer
- Health check status
- Performance monitoring

**API Integration**:
- `GET /api/admin/system/metrics`
- `GET /api/admin/system/logs`
- `GET /api/admin/system/health`

### Phase 4: API Integration (Ưu tiên CAO)

**Mục tiêu**: Setup API client và integrate với Core Service.

#### 4.1. Tạo API Client

**File**: `src/lib/api/client.ts`

**Yêu cầu**:
- Axios instance với base URL từ env
- Request interceptor: Add JWT access token
- Response interceptor: Handle 401 → refresh token
- Error handling: Centralized error handling
- Retry logic: Retry failed requests

**Environment Variables**:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_API_TIMEOUT_MS=30000
```

#### 4.2. Tạo API Endpoints

**File**: `src/lib/api/endpoints.ts`

**Constants**:
```typescript
export const API_ENDPOINTS = {
  // Auth
  ADMIN_LOGIN: '/api/admin/login',
  AUTH_REFRESH_TOKEN: '/api/v1/auth/refresh_token',
  AUTH_LOGOUT: '/api/v1/auth/logout',
  
  // User Management
  ADMIN_USERS_STUDENTS: '/api/admin/users/students',
  ADMIN_USERS_PARENTS: '/api/admin/users/parents',
  ADMIN_USERS_ADMINS: '/api/admin/users/admins',
  ADMIN_USER_DETAIL: '/api/admin/users/:id',
  ADMIN_USER_UPDATE_STATUS: '/api/admin/users/:id/status',
  
  // Content Management
  ADMIN_CONTENT_SKILLS: '/api/admin/content/skills',
  ADMIN_CONTENT_QUESTIONS: '/api/admin/content/questions',
  
  // AI Quality
  ADMIN_AI_QUALITY_SOLUTIONS: '/api/admin/ai-quality/solutions',
  ADMIN_AI_QUALITY_REVIEW: '/api/admin/ai-quality/solutions/:id/review',
  ADMIN_AI_QUALITY_ACCURACY: '/api/admin/ai-quality/accuracy',
  
  // System
  ADMIN_SYSTEM_METRICS: '/api/admin/system/metrics',
  ADMIN_SYSTEM_LOGS: '/api/admin/system/logs',
  ADMIN_SYSTEM_HEALTH: '/api/admin/system/health',
};
```

#### 4.3. Tạo API Functions

**File**: `src/lib/api/admin.ts`

**Functions**:
- `loginAdmin(username, password)`
- `refreshToken(refreshToken)`
- `logout(refreshToken)`
- `getUsers(type)` - type: 'students' | 'parents' | 'admins'
- `getUserDetail(userId)`
- `updateUserStatus(userId, status)`
- `getSkills()`
- `createSkill(data)`
- `updateSkill(skillId, data)`
- `getQuestions()`
- `createQuestion(data)`
- `getAISolutions()`
- `reviewAISolution(solutionId, action)` - action: 'approve' | 'reject'
- `getAIAccuracy()`
- `getSystemMetrics()`
- `getSystemLogs()`
- `getSystemHealth()`

### Phase 5: State Management & Hooks (Ưu tiên TRUNG BÌNH)

**Mục tiêu**: Tạo custom hooks và context cho state management.

#### 5.1. Auth Context

**File**: `src/context/AuthContext.tsx`

**Features**:
- Store access token & refresh token
- Handle token refresh automatically
- Provide auth state to components
- Handle logout
- Admin role check

#### 5.2. Custom Hooks

**Files**:
- `src/hooks/useAuth.ts`: Authentication hook
- `src/hooks/useUsers.ts`: User data hook
- `src/hooks/useContent.ts`: Content data hook
- `src/hooks/useSystem.ts`: System metrics hook
- `src/hooks/useAIQuality.ts`: AI quality data hook

---

## 📦 DEPENDENCIES UPGRADE PLAN

### Dependencies Cần Nâng Cấp

| Package | Current | Target | Reason |
|---------|---------|--------|--------|
| **Next.js** | 16.0.10 | 16.x (latest) | ✅ Đã đạt yêu cầu, giữ nguyên |
| **React** | 19.2.0 | 19.x (latest) | ✅ Latest, giữ nguyên |
| **TypeScript** | 5.9.3 | 5.x (latest) | ✅ Đã đạt yêu cầu, giữ nguyên |
| **Tailwind CSS** | 4.1.17 | 4.x (latest) | ✅ Latest, giữ nguyên |
| **ApexCharts** | 4.7.0 | 4.x (latest) | ✅ Đã đạt yêu cầu, giữ nguyên |

### Dependencies Cần Thêm

```bash
# API Client
npm install axios

# Form handling (cho content management)
npm install react-hook-form zod @hookform/resolvers

# Data tables (cho user/content management)
npm install @tanstack/react-table

# Date formatting
npm install date-fns

# File upload (nếu cần upload content)
npm install react-dropzone
```

### Dependencies Cần Xóa

```bash
# React DnD - Không cần
npm uninstall react-dnd react-dnd-html5-backend

# FullCalendar - Đánh giá lại (có thể cần cho scheduling)
# npm uninstall @fullcalendar/core @fullcalendar/daygrid @fullcalendar/interaction @fullcalendar/list @fullcalendar/react @fullcalendar/timegrid
```

---

## 🔐 AUTHENTICATION FLOW

### Flow Overview

Theo [Authentication Flow](../../tutor_docs/technical_design/authentication_flow_phase_1-2025-12-15.md):

1. **Admin Login**:
   - User nhập username (alphanumeric) + password
   - Backend verify → trả về `accessToken` (6h) + `refreshToken` (30d)
   - Frontend lưu tokens → redirect to dashboard

2. **Token Refresh**:
   - Khi `accessToken` hết hạn (401) → gọi `/api/v1/auth/refresh_token`
   - Backend trả về tokens mới (refresh token rotation)
   - Frontend update tokens → retry request ban đầu

3. **Logout**:
   - Gọi `/api/v1/auth/logout` với `refreshToken`
   - Backend revoke refresh token
   - Frontend xóa tokens → redirect to login

### Admin Authentication Rules

- **Không đăng ký được**: Admin chỉ được tạo bởi admin khác hoặc seed data
- **Username**: Alphanumeric (case-insensitive), unique
- **Không hỗ trợ OAuth**: Chỉ username/password
- **Role**: ROLE_ADMIN

### Token Storage

**Recommendation**:
- **Access Token**: Memory hoặc sessionStorage
- **Refresh Token**: httpOnly cookie (recommended) hoặc localStorage

---

## 🌐 API INTEGRATION

### Core Service Endpoints

**Note**: Admin API endpoints chưa được định nghĩa chi tiết trong [API Specification](../../tutor_docs/technical_design/api_specification_phase_1-2025-12-15-03-30.md). Cần implement sau.

#### Authentication Endpoints

- `POST /api/admin/login` - Đăng nhập admin
- `GET /api/v1/auth/refresh_token` - Refresh access token
- `POST /api/v1/auth/logout` - Đăng xuất

#### User Management Endpoints (Cần implement)

- `GET /api/admin/users/students` - Danh sách học sinh
- `GET /api/admin/users/parents` - Danh sách phụ huynh
- `GET /api/admin/users/admins` - Danh sách admin
- `GET /api/admin/users/:id` - Chi tiết user
- `PUT /api/admin/users/:id/status` - Cập nhật status user

#### Content Management Endpoints (Cần implement)

- `GET /api/admin/content/skills` - Danh sách skills
- `POST /api/admin/content/skills` - Tạo skill
- `PUT /api/admin/content/skills/:id` - Cập nhật skill
- `GET /api/admin/content/questions` - Danh sách questions
- `POST /api/admin/content/questions` - Tạo question

#### AI Quality Endpoints (Cần implement)

- `GET /api/admin/ai-quality/solutions` - Danh sách AI solutions
- `POST /api/admin/ai-quality/solutions/:id/review` - Review solution
- `GET /api/admin/ai-quality/accuracy` - Accuracy metrics
- `GET /api/admin/ai-quality/errors` - Error analysis

#### System Endpoints (Cần implement)

- `GET /api/admin/system/metrics` - System metrics
- `GET /api/admin/system/logs` - System logs
- `GET /api/admin/system/health` - Health check

### API Client Setup

**File**: `src/lib/api/client.ts`

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT_MS || '30000'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add access token
apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken(); // From memory/sessionStorage
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor: Handle 401 → refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try refresh token
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh_token`,
            {},
            { headers: { Authorization: `Bearer ${refreshToken}` } }
          );
          // Update tokens
          setAccessToken(data.data.accessToken);
          setRefreshToken(data.data.refreshToken);
          // Retry original request
          error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return apiClient.request(error.config);
        } catch (refreshError) {
          // Refresh failed → logout
          logout();
          window.location.href = '/signin';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 🚀 DEPLOYMENT

### Environment Variables

**File**: `.env.local`

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_API_TIMEOUT_MS=30000

# Application
NEXT_PUBLIC_APP_NAME=Tutor Admin Dashboard
NEXT_PUBLIC_APP_ENV=development
```

### Docker Deployment

**File**: `Dockerfile`

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

**Build & Run**:
```bash
docker build -t tutor-admin-dashboard .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.tutor.app/api \
  tutor-admin-dashboard
```

---

## ✅ CHECKLIST IMPLEMENTATION

### Phase 1: Cleanup (Ưu tiên CAO)

- [ ] Xóa demo pages (`(admin)/(others-pages)`, `(admin)/(ui-elements)`)
- [ ] Xóa demo components (`ecommerce`, `example`, `videos`, `user-profile`)
- [ ] Xóa dependencies không cần (`react-dnd`, `react-dnd-html5-backend`)
- [ ] Đánh giá và xóa FullCalendar nếu không cần
- [ ] Cleanup `package.json`

### Phase 2: Authentication (Ưu tiên CAO)

- [ ] Customize `SignInForm.tsx` (admin username/password)
- [ ] Implement admin authentication flow
- [ ] Implement token refresh mechanism
- [ ] Implement logout flow
- [ ] Add admin role check

### Phase 3: API Integration (Ưu tiên CAO)

- [ ] Tạo API client (`src/lib/api/client.ts`)
- [ ] Tạo API endpoints constants
- [ ] Tạo API functions (`src/lib/api/admin.ts`)
- [ ] Implement error handling
- [ ] Implement retry logic
- [ ] Test API integration

### Phase 4: Dashboard Pages (Ưu tiên CAO)

- [ ] Tạo dashboard overview page
- [ ] Tạo user management pages (students, parents, admins)
- [ ] Tạo content management pages (skills, questions)
- [ ] Tạo AI quality monitoring pages
- [ ] Tạo system monitoring pages
- [ ] Implement loading states
- [ ] Implement error states

### Phase 5: State Management (Ưu tiên TRUNG BÌNH)

- [ ] Tạo AuthContext
- [ ] Tạo custom hooks (`useAuth`, `useUsers`, `useContent`, `useSystem`, `useAIQuality`)
- [ ] Implement token storage
- [ ] Implement token refresh logic

### Phase 6: Polish & Testing (Ưu tiên THẤP)

- [ ] Responsive design
- [ ] Accessibility improvements
- [ ] Performance optimization
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests

---

## 📚 TÀI LIỆU THAM CHIẾU

### Business Documentation

- [PRD MVP](../../tutor_docs/prd/prd_mvp_phase_1-2025-12-14-22-15.md)
- [System Architecture](../../tutor_docs/technical_design/system_architecture_phase_1-2025-12-15-00-21.md)

### Technical Documentation

- [System Architecture](../../tutor_docs/technical_design/system_architecture_phase_1-2025-12-15-00-21.md)
- [API Specification](../../tutor_docs/technical_design/api_specification_phase_1-2025-12-15-03-30.md)
- [Authentication Flow](../../tutor_docs/technical_design/authentication_flow_phase_1-2025-12-15.md)
- [Project Structure](../../tutor_docs/technical_design/project_structure_phase_1-2025-12-15-04-30.md)
- [Deployment Guide](../../tutor_docs/technical_design/deployment_guide_phase_1-2025-12-15-04-15.md)

---

## 🐛 TROUBLESHOOTING

### Common Issues

**Issue**: Port 3000 already in use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:3000 | xargs kill
```

**Issue**: API connection errors
- Verify Core Service is running
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Check CORS configuration in Core Service

**Issue**: Token refresh fails
- Check refresh token storage
- Verify refresh token endpoint
- Check token expiration times

**Issue**: Admin API endpoints not found
- Admin API endpoints cần được implement trong Core Service
- Check API specification updates

---

## 📝 NOTES

### Design Principles

1. **Admin-focused**: UI/UX dành cho admin có kiến thức kỹ thuật
2. **Data-driven**: Hiển thị metrics và analytics rõ ràng
3. **Efficient**: Tối ưu cho việc quản lý và giám sát hệ thống
4. **Secure**: Role-based access control, audit logging

### Security Considerations

1. **Token Storage**: Không lưu tokens trong localStorage (dùng httpOnly cookie hoặc sessionStorage)
2. **HTTPS**: Luôn dùng HTTPS trong production
3. **CORS**: Configure CORS đúng trong Core Service
4. **Role-based Access**: Chỉ admin mới truy cập được
5. **Audit Logging**: Log tất cả admin actions

### Phase 1 vs Phase 3

**Phase 1 (MVP)**:
- Admin dashboard cơ bản
- System monitoring cơ bản
- User management (view only)
- AI quality monitoring (basic)

**Phase 3 (Mở rộng)**:
- Admin/Ops dashboard nâng cao
- Quản trị nội dung chi tiết
- Giám sát chất lượng AI nâng cao
- Advanced analytics và reporting

---

**Last Updated**: 2025-12-16  
**Author**: System Architect + PM (theo Q&A Guidelines)
