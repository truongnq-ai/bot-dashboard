# BÁO CÁO KHẢO SÁT HIỆN TRẠNG
## Module: Web Admin Dashboard (Next.js)
## Dự án: Gia sư Toán AI

---

## 1. TECH STACK & NỀN TẢNG

### Framework & Core
- **Next.js**: Version 16.0.10
- **Router Type**: App Router (Next.js 13+ App Directory)
- **React**: Version 19.2.0
- **React DOM**: Version 19.2.0
- **TypeScript**: Version 5.9.3
- **TypeScript Strict Mode**: Enabled (`strict: true` trong tsconfig.json)

### UI & Styling
- **Tailwind CSS**: Version 4.1.17 (với PostCSS)
- **@tailwindcss/forms**: Version 0.5.10
- **@tailwindcss/postcss**: Version 4.1.17
- **tailwind-merge**: Version 2.6.0 (utility để merge Tailwind classes)
- **remixicon**: Version 4.3.0 (icon library)

### State Management
- **@tanstack/react-query**: Version 5.56.2 (React Query cho server state)
- **React Context API**: Sử dụng cho:
  - `AuthContext` (authentication state)
  - `SidebarContext` (sidebar state)
  - `ThemeContext` (theme state)

### Form & Validation
- **react-hook-form**: Version 7.69.0
- **@hookform/resolvers**: Version 5.2.2
- **zod**: Version 4.2.1 (schema validation)

### HTTP / API Client
- **axios**: Version 1.13.2
- Custom API client với interceptors (token refresh, error handling)

### Rich Text Editor
- **@tiptap/react**: Version 3.14.0
- **@tiptap/starter-kit**: Version 3.14.0
- **@tiptap/extension-placeholder**: Version 3.14.0

### Math Rendering
- **katex**: Version 0.16.27
- **react-katex**: Version 3.1.0

### Charts & Visualization
- **apexcharts**: Version 4.7.0
- **react-apexcharts**: Version 1.8.0
- **@fullcalendar/core**: Version 6.1.19
- **@fullcalendar/react**: Version 6.1.19
- **@fullcalendar/daygrid, timegrid, list, interaction**: Version 6.1.19
- **@react-jvectormap/core**: Version 1.0.4
- **@react-jvectormap/world**: Version 1.1.2

### Table & Data Grid
- **@tanstack/react-table**: Version 8.21.3

### Drag & Drop
- **@dnd-kit/core**: Version 6.3.1
- **@dnd-kit/sortable**: Version 10.0.0
- **@dnd-kit/utilities**: Version 3.2.2

### Utilities
- **react-hot-toast**: Version 2.6.0 (toast notifications)
- **flatpickr**: Version 4.6.13 (date picker)
- **react-dropzone**: Version 14.3.8 (file upload)
- **swiper**: Version 11.2.10 (carousel/slider)

### Build Tools
- **PostCSS**: Version 8.5.6
- **Autoprefixer**: Version 10.4.22
- **ESLint**: Version 9.39.1
- **eslint-config-next**: Version 16.0.7
- **@svgr/webpack**: Version 8.1.0 (SVG as React components)

---

## 2. CẤU TRÚC THƯ MỤC & MODULE

### Root Structure
```
tutor-admin-dashboard/
├── src/                    # Source code chính
├── public/                 # Static assets
├── .next/                  # Next.js build output
├── node_modules/           # Dependencies
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.js
├── prettier.config.js
├── eslint.config.mjs
└── .eslintrc.json
```

### Source Structure (`src/`)
```
src/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Route group: Admin pages (có layout sidebar)
│   ├── (full-width-pages)/ # Route group: Full-width pages (auth, error)
│   ├── api/                # API routes (Next.js server routes)
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Root page (redirect to /dashboard)
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── admins/            # Admin management components
│   ├── auth/              # Authentication components
│   ├── chapters/          # Chapter management components
│   ├── exercises/         # Exercise management components
│   ├── skills/            # Skill management components
│   ├── questions/         # Question components
│   ├── students/          # Student components
│   ├── parents/          # Parent components
│   ├── trials/            # Trial user components
│   ├── prompt-templates/  # Prompt template components
│   ├── ecommerce/         # Dashboard metrics components (tên legacy)
│   ├── form/              # Form components (inputs, selects, etc.)
│   ├── tables/            # Table components
│   ├── charts/            # Chart components
│   ├── ui/                # UI primitives (buttons, modals, etc.)
│   ├── common/            # Common/shared components
│   ├── header/            # Header components
│   ├── calendar/          # Calendar component
│   ├── devices/           # Device components
│   └── providers/         # Context providers
├── context/               # React Context providers
│   ├── AuthContext.tsx
│   ├── SidebarContext.tsx
│   └── ThemeContext.tsx
├── hooks/                 # Custom React hooks (app-level)
│   ├── useGoBack.ts
│   └── useModal.ts
├── layout/                # Layout components
│   ├── AppHeader.tsx
│   ├── AppSidebar.tsx
│   ├── Backdrop.tsx
│   └── SidebarWidget.tsx
├── lib/                   # Library code / utilities
│   ├── api/               # API service functions
│   ├── config/            # Configuration files
│   ├── hooks/             # Custom hooks (data fetching)
│   └── utils/             # Utility functions
├── types/                 # TypeScript type definitions
├── icons/                 # SVG icon components
└── middleware.ts          # Next.js middleware (auth guard)
```

### Module Organization Pattern
- **Tổ chức theo domain/feature**: Components được nhóm theo domain (exercises, chapters, skills, users...)
- **Separation of concerns**: 
  - `components/`: UI components
  - `lib/api/`: API service layer
  - `lib/hooks/`: Data fetching hooks
  - `types/`: Type definitions
- **Route groups**: Sử dụng Next.js route groups `(admin)` và `(full-width-pages)` để tổ chức layout

### Legacy / Unused Areas
- **`components/ecommerce/`**: Tên folder không phản ánh đúng mục đích (đang dùng cho dashboard metrics)
- **`lib/utils/error-handler.ts` và `lib/utils/errorHandler.ts`**: Có 2 file tương tự (cần xác nhận file nào đang được dùng)

---

## 3. ROUTER & NAVIGATION

### Route Structure (App Router)

#### Root Routes
- `/` → Redirects to `/dashboard`

#### Admin Routes (Protected, có sidebar layout)
- `/dashboard` - Dashboard page
- `/profile` - User profile page

**Users Management:**
- `/users/trial` - Trial users list
- `/users/students` - Students list
- `/users/parents` - Parents list
- `/users/admins` - Admins list

**Content Management:**
- `/content/chapters` - Chapters list
- `/content/skills` - Skills list
- `/content/questions` - Questions list
- `/content/questions/[id]` - Question detail (dynamic route)
- `/content/exercises` - Exercises list
- `/content/exercises/create` - Create exercise
- `/content/exercises/create-from-json` - Create exercise from JSON
- `/content/exercises/[id]` - Exercise detail (dynamic route)
- `/content/exercises/[id]/edit` - Edit exercise (dynamic route)
- `/content/exercises/[id]/review` - Review exercise (dynamic route)
- `/content/prompt-templates` - Prompt templates list

**AI Quality:**
- `/ai-quality/solutions` - AI solutions review (Coming Soon page)
- `/ai-quality/accuracy` - Accuracy metrics (Coming Soon page)
- `/ai-quality/errors` - Error analysis (Coming Soon page)

**System:**
- `/system/metrics` - System metrics
- `/system/logs` - System logs
- `/system/health` - System health

#### Auth Routes (Full-width, no sidebar)
- `/login` - Login page
- `/reset-password` - Reset password page

#### Error Pages
- `/error-404` - 404 error page
- `not-found.tsx` - Next.js not-found handler

### Route Protection
- **Middleware**: `src/middleware.ts` bảo vệ routes
- **Protected routes**: `/dashboard`, `/content`, `/users`, `/ai-quality`, `/system`, `/profile`
- **Auth routes**: `/login`, `/reset-password` (redirect to dashboard nếu đã authenticated)
- **Token check**: Middleware kiểm tra `accessToken` cookie và token expiration

### Route Features
- **Dynamic routes**: Sử dụng `[id]` cho detail/edit pages
- **Nested routes**: `/content/exercises/[id]/edit`, `/content/exercises/[id]/review`
- **Route groups**: `(admin)` và `(full-width-pages)` để áp dụng layout khác nhau

---

## 4. MENU / SIDEBAR / NAVBAR

### Sidebar Menu Structure (`AppSidebar.tsx`)

#### Main Menu Items
1. **Bảng điều khiển** (`/dashboard`)
2. **Hồ sơ người dùng** (`/profile`)
3. **Người dùng** (submenu):
   - Trial (`/users/trial`)
   - Học sinh (`/users/students`)
   - Phụ huynh (`/users/parents`)
   - Quản trị viên (`/users/admins`)
4. **Nội dung** (submenu):
   - Chương (`/content/chapters`)
   - Kỹ năng (`/content/skills`)
   - Câu hỏi (`/content/questions`)
   - Bài tập (`/content/exercises`)
5. **Chất lượng AI** (submenu):
   - Prompt (`/content/prompt-templates`) - ⚠️ Route không khớp với menu path
   - Đánh giá giải pháp (`/ai-quality/solutions`)
   - Chỉ số độ chính xác (`/ai-quality/accuracy`)
   - Phân tích lỗi (`/ai-quality/errors`)
6. **Hệ thống** (submenu):
   - Chỉ số (`/system/metrics`)
   - Nhật ký (`/system/logs`)
   - Sức khỏe (`/system/health`)

#### Others Menu Items
- **Xác thực** (submenu):
  - Đăng nhập (`/login`)
  - Đặt lại mật khẩu (`/reset-password`)

### Menu Features
- **Collapsible sidebar**: Có thể thu gọn/mở rộng
- **Hover expansion**: Sidebar tự mở rộng khi hover (desktop)
- **Mobile responsive**: Sidebar có thể toggle trên mobile
- **Active state**: Menu item được highlight khi route active
- **Submenu toggle**: Submenu có thể mở/đóng
- **Auto-expand submenu**: Submenu tự động mở nếu route hiện tại nằm trong submenu đó

### Menu Configuration
- Menu items được định nghĩa trong `AppSidebar.tsx` dưới dạng array `navItems`
- Không có role-based menu filtering (tất cả menu items hiển thị cho mọi user)
- Menu items có property `pro` và `new` nhưng hiện tại tất cả đều `false`

### Header/Navbar
- **AppHeader.tsx**: Header component với:
  - User dropdown (`UserDropdown`)
  - Notification dropdown (`NotificationDropdown`)
  - Theme toggle button

---

## 5. DANH SÁCH PAGE / SCREEN

### Dashboard Pages
- **`/dashboard`**: Dashboard chính với metrics, charts, recent orders, demographic card

### User Management Pages
- **`/users/trial`**: Danh sách trial users
- **`/users/students`**: Danh sách học sinh
- **`/users/parents`**: Danh sách phụ huynh
- **`/users/admins`**: Danh sách quản trị viên

### Content Management Pages
- **`/content/chapters`**: Danh sách và quản lý chương
- **`/content/skills`**: Danh sách và quản lý kỹ năng
- **`/content/questions`**: Danh sách câu hỏi
- **`/content/questions/[id]`**: Chi tiết câu hỏi
- **`/content/exercises`**: Danh sách bài tập (có filter, search, pagination)
- **`/content/exercises/create`**: Tạo bài tập mới (form)
- **`/content/exercises/create-from-json`**: Tạo bài tập từ JSON
- **`/content/exercises/[id]`**: Chi tiết bài tập
- **`/content/exercises/[id]/edit`**: Chỉnh sửa bài tập
- **`/content/exercises/[id]/review`**: Review bài tập (approve/reject/needs-revision)
- **`/content/prompt-templates`**: Quản lý prompt templates

### AI Quality Pages
- **`/ai-quality/solutions`**: Coming Soon page (chưa implement)
- **`/ai-quality/accuracy`**: Coming Soon page (chưa implement)
- **`/ai-quality/errors`**: Coming Soon page (chưa implement)

### System Pages
- **`/system/metrics`**: System metrics (chưa xác nhận nội dung)
- **`/system/logs`**: System logs (chưa xác nhận nội dung)
- **`/system/health`**: System health (chưa xác nhận nội dung)

### Auth Pages
- **`/login`**: Login form
- **`/reset-password`**: Reset password form (có TODO comment: "Integrate with API")

### Profile Pages
- **`/profile`**: User profile page

### Error Pages
- **`/error-404`**: 404 error page
- **`not-found.tsx`**: Next.js not-found handler

### Page Patterns
- Hầu hết pages là wrapper components render một component chính (ví dụ: `ExercisesPage` → `ExerciseList`)
- Pages sử dụng Next.js `Metadata` API cho SEO
- Dynamic routes sử dụng `[id]` parameter

---

## 6. LOGIC NGHIỆP VỤ TRONG FRONTEND

### Exercise Management Logic
- **Review status workflow**: PENDING → APPROVED/REJECTED/NEEDS_REVISION
- **Review validation**: Yêu cầu `reviewNotes` khi status là REJECTED
- **Statistics calculation**: Tính toán stats từ current page data (có comment: "These would ideally come from a stats endpoint")
- **Filter logic**: 
  - Reset `skillId` và `chapterId` khi `grade` thay đổi và skill không thuộc grade mới
  - Fetch chapters theo grade khi grade được chọn
- **LaTeX validation**: Validate LaTeX trong các fields của exercise
- **JSON import**: Parse và validate JSON khi tạo exercise từ JSON

### User Management Logic
- **Status management**: Có thể update status của users (admins, students, parents, trials)
- **Filtering**: Filter users theo status, search text

### Content Hierarchy Logic
- **Grade → Chapter → Skill → Exercise**: Hierarchical relationship
- **Skill filtering**: Filter skills theo grade
- **Chapter filtering**: Filter chapters theo grade
- **Exercise filtering**: Filter exercises theo skill, grade, chapter, reviewStatus, difficultyLevel

### AI Generation Logic
- **Exercise generation**: Generate exercises với AI (có nonce để tránh duplicate)
- **Prompt generation**: Generate prompt cho exercise creation
- **Generation metadata**: Track provider used, confidence, total generated/valid

### Form Validation Logic
- **Required fields**: Validation cho required fields trong forms
- **LaTeX validation**: Validate LaTeX syntax
- **JSON validation**: Validate JSON structure khi import
- **Review notes**: Required khi reject exercise

### Display Logic
- **Active route highlighting**: Menu items và submenu được highlight khi route active
- **Submenu auto-expand**: Submenu tự động mở nếu route hiện tại nằm trong đó
- **Loading states**: Hiển thị loading state khi fetch data
- **Error handling**: Hiển thị error messages khi API call fails
- **Empty states**: Hiển thị empty state khi không có data

### Statistics & Metrics Logic
- **Dashboard metrics**: Hiển thị metrics trên dashboard (có thể là mock data hoặc real data - cần xác nhận)
- **Exercise stats**: Tính toán stats từ usage data (totalAttempts, successRate, avgTime)

---

## 7. API USAGE & DATA FLOW

### API Client Architecture
- **Base URL**: Configured trong `lib/config/api.config.ts`
  - Production: `https://apitutor.dienluc.vn`
  - Development: `https://apitutor.dienluc.vn` (cùng URL)
- **API Version**: `/api/v1` prefix
- **Timeout**: Configurable via `NEXT_PUBLIC_API_TIMEOUT_MS` (default: 60000ms)

### API Client Features
- **Token management**: 
  - Auto-inject `accessToken` vào request headers
  - Token được lấy từ `/api/auth/token` (server-side proxy)
  - Token caching (30 seconds cache)
- **Token refresh**:
  - Proactive refresh: Refresh token nếu expires trong 5 phút
  - Reactive refresh: Refresh token khi nhận 401 response
  - Queue mechanism: Prevent multiple simultaneous refresh requests
- **Error handling**: 
  - 401 → Auto refresh token và retry request
  - Refresh failed → Redirect to `/login`
- **Credentials**: `withCredentials: true` để include cookies

### API Services (`lib/api/`)
1. **auth.service.ts**: Login, logout, refresh token
2. **exercise.service.ts**: CRUD exercises, review, generate, validate LaTeX
3. **chapter.service.ts**: CRUD chapters, get by grade
4. **skill.service.ts**: CRUD skills
5. **question.service.ts**: CRUD questions, get by exercise/skill, stats, practices, generate
6. **admin.service.ts**: List, get, create admins, update status
7. **student.service.ts**: List, get students, update status
8. **parent.service.ts**: List, get parents, update status
9. **trial.service.ts**: List, get trials, update status
10. **device.service.ts**: Get devices by user
11. **grade.service.ts**: List grades
12. **image.service.ts**: Upload, delete images
13. **prompt-template.service.ts**: CRUD prompt templates, activate/deactivate

### API Endpoints (`lib/api/endpoints.ts`)
- Tất cả endpoints được định nghĩa trong file này
- Endpoints sử dụng function để tạo dynamic paths (ví dụ: `EXERCISES_GET(id)`)

### Data Fetching Pattern
- **Custom hooks**: Mỗi domain có custom hooks trong `lib/hooks/`:
  - `useExercises`, `useExercise`, `useExerciseStats`, `useReviewHistory`
  - `useChapters`, `useSkills`, `useQuestions`
  - `useAdmins`, `useStudents`, `useParents`, `useTrials`
  - `useGrades`, `useAuth`
- **React Query**: 
  - Có `QueryProvider` setup trong root layout
  - Nhưng custom hooks **KHÔNG sử dụng** React Query hooks (`useQuery`, `useMutation`)
  - Custom hooks sử dụng `useState` + `useEffect` pattern thay vì React Query
  - React Query chỉ được setup nhưng chưa được sử dụng trong data fetching
- **Loading states**: Mỗi hook trả về `{ data, loading, error, refetch }`
- **Memoization**: Search params được memoize để tránh re-fetch không cần thiết

### API Routes (Next.js Server Routes)
- **`/api/auth/login`**: Proxy login request, set httpOnly cookies
- **`/api/auth/logout`**: Proxy logout request, clear cookies
- **`/api/auth/refresh`**: Proxy refresh token request, update cookies
- **`/api/auth/token`**: Get access token from cookie (server-side)
- **`/api/auth/check`**: Check authentication status

### Mock Data vs Real API
- **Dashboard metrics**: Có thể là mock data (components trong `ecommerce/` folder)
- **Main data**: Tất cả CRUD operations gọi real API
- **Coming Soon pages**: Không có API calls

### Error Handling Strategy
- **Service layer**: Throw Error với message từ API response
- **Component layer**: Catch errors và hiển thị toast notifications
- **Error handler utility**: `lib/utils/errorHandler.ts` và `lib/utils/error-handler.ts` (có 2 files - cần xác nhận)
- **Toast notifications**: Sử dụng `react-hot-toast` để hiển thị errors

---

## 8. AUTH / ROLE / GUARD

### Authentication Flow
1. **Login**:
   - User nhập username/password trong `SignInForm`
   - Call `/api/auth/login` (Next.js API route)
   - API route proxy request đến backend `/api/v1/admin/login`
   - Backend trả về `accessToken` và `refreshToken`
   - API route set httpOnly cookies: `accessToken`, `refreshToken`
   - Redirect to `/dashboard`
2. **Token Storage**:
   - Tokens được lưu trong **httpOnly cookies** (không thể access từ client-side JavaScript)
   - `accessToken`: Expires theo `expiresIn` từ backend
   - `refreshToken`: Expires theo `refreshTokenExpiresIn` từ backend
3. **Token Usage**:
   - Client-side không thể đọc httpOnly cookies
   - API client gọi `/api/auth/token` để lấy token (server-side proxy)
   - Token được cache 30 seconds để tránh excessive API calls
4. **Token Refresh**:
   - **Proactive**: Refresh nếu token expires trong 5 phút
   - **Reactive**: Refresh khi nhận 401 response
   - Refresh queue mechanism để tránh multiple simultaneous refresh requests
5. **Logout**:
   - Call `/api/auth/logout` (Next.js API route)
   - API route proxy request đến backend và clear cookies
   - Redirect to `/login`

### Authentication Context
- **AuthContext**: 
  - `isAuthenticated`: Boolean state
  - `user`: User object (chỉ có `sub` field hiện tại)
  - `loading`: Loading state
  - `login(username, password)`: Login function
  - `logout()`: Logout function
  - `checkAuth()`: Check authentication status (call `/api/auth/check`)

### Role Management
- **Không có role-based access control**: Tất cả authenticated users có quyền truy cập tất cả routes
- **User object**: Chỉ có `sub` field (subject/user ID từ JWT), không có role field
- **Menu**: Không có role-based menu filtering

### Route Guards
- **Middleware guard**: `src/middleware.ts`
  - Check `accessToken` cookie
  - Check token expiration (decode JWT và check `exp` claim)
  - Redirect to `/login` nếu không có token hoặc token expired
  - Redirect authenticated users away from auth routes
- **Protected routes**: `/dashboard`, `/content`, `/users`, `/ai-quality`, `/system`, `/profile`
- **Auth routes**: `/login`, `/reset-password` (redirect to dashboard nếu đã authenticated)

### JWT Utilities
- **`lib/utils/jwt.ts`**: 
  - `decodeJWT(token)`: Decode JWT (không verify signature - chỉ đọc claims)
  - `isTokenExpired(token)`: Check token expiration
  - `isTokenExpiringSoon(token, minutes)`: Check nếu token expires trong X phút

### Cookie Utilities
- **`lib/utils/cookies.ts`**: 
  - Helper functions để set/get cookies
  - Note: httpOnly cookies chỉ có thể set từ server-side

---

## 9. STYLE, CODE QUALITY & CONSISTENCY

### Coding Style
- **TypeScript**: Strict mode enabled
- **Naming conventions**:
  - Components: PascalCase (ví dụ: `ExerciseList.tsx`)
  - Files: PascalCase cho components, camelCase cho utilities
  - Functions: camelCase
  - Types/Interfaces: PascalCase
- **File organization**: 
  - Mỗi component trong file riêng
  - Types trong `types/` folder
  - Utils trong `lib/utils/` folder

### Code Comments
- **Documentation comments**: Nhiều files có JSDoc-style comments ở đầu file
- **TODO comments**: 
  - `ResetPasswordForm.tsx`: "TODO: Integrate with API"
  - `ExerciseList.tsx`: "Note: These would ideally come from a stats endpoint"
- **Implementation notes**: Nhiều comments giải thích logic (ví dụ: token caching, refresh queue)

### Code Consistency
- **API response handling**: Consistent pattern với `ResponseObject<T>` wrapper
- **Error handling**: Consistent pattern throw Error với message từ API
- **Loading states**: Consistent pattern `{ data, loading, error, refetch }` trong custom hooks
- **Component structure**: Consistent pattern page component → feature component

### Potential Issues
- **Duplicate files**: 
  - `lib/utils/error-handler.ts` và `lib/utils/errorHandler.ts` (cần xác nhận file nào đang dùng)
- **Legacy naming**: 
  - `components/ecommerce/` folder không phản ánh đúng mục đích (đang dùng cho dashboard metrics)
- **Route mismatch**: 
  - Menu item "Prompt" trong "Chất lượng AI" submenu có path `/content/prompt-templates` (không khớp với parent menu)

### Dead Code / Unused Components
- **Đang được dùng**: 
  - `components/ecommerce/` components: ✅ Đang được dùng trong `/dashboard` page
- **Có thể không dùng**: 
  - `components/calendar/Calendar.tsx`: Chỉ có CSS styles trong globals.css, không thấy import trong app routes
  - `components/devices/DeviceListModal.tsx`: Không thấy import trong app routes
  - `components/tables/BasicTableOne.tsx`: Chỉ có definition, không thấy import

### Type Safety
- **Strong typing**: Hầu hết code có TypeScript types
- **Type definitions**: Tất cả types được định nghĩa trong `types/` folder
- **API types**: Request/Response types được định nghĩa rõ ràng

### Form Handling
- **react-hook-form**: Consistent usage pattern
- **Validation**: ✅ Sử dụng zod schemas với `zodResolver` trong:
  - `ExerciseCreateForm.tsx`
  - `ExerciseEditForm.tsx`

---

## 10. BUILD, CONFIG & ENV

### Environment Variables
- **Không có `.env` files** trong codebase (có thể trong `.gitignore`)
- **API Base URL**: Hardcoded trong `lib/config/api.config.ts`
  - Production: `https://apitutor.dienluc.vn`
  - Development: `https://apitutor.dienluc.vn` (cùng URL)
- **API Timeout**: `NEXT_PUBLIC_API_TIMEOUT_MS` (default: 60000ms)
- **API Base URL override**: 
  - Server-side: `API_BASE_URL`
  - Client-side: `NEXT_PUBLIC_API_BASE_URL` (chỉ trong production)
- **Cookie security**: `secure: true` trong production, `false` trong development

### Build Scripts (`package.json`)
- **`dev`**: `next dev` - Development server
- **`build`**: `next build` - Production build
- **`start`**: `next start` - Start production server
- **`lint`**: `eslint .` - Lint code

### Next.js Configuration (`next.config.ts`)
- **SVG handling**: Configured để import SVG như React components (sử dụng `@svgr/webpack`)
- **Turbopack**: Có config cho turbopack (SVG loader)

### TypeScript Configuration (`tsconfig.json`)
- **Target**: ES2017
- **Module**: esnext
- **Module Resolution**: bundler
- **JSX**: react-jsx
- **Strict**: true
- **Paths**: `@/*` → `./src/*`

### PostCSS Configuration (`postcss.config.js`)
- **Plugin**: `@tailwindcss/postcss`

### Prettier Configuration (`prettier.config.js`)
- **Plugin**: `prettier-plugin-tailwindcss` (auto-sort Tailwind classes)

### ESLint Configuration
- **Config files**: 
  - `eslint.config.mjs` (ESLint 9 flat config)
  - `.eslintrc.json` (legacy config - có thể không dùng)
- **Config**: `eslint-config-next`

### Feature Flags / Config
- **Không có feature flags** trong codebase
- **UI Config**: Có `lib/config/ui.config.ts` (chưa xác nhận nội dung)
- **App Config**: Có `lib/config/app.config.ts` (chưa xác nhận nội dung)

---

## 🔎 TỔNG KẾT KHẢO SÁT

### Các Khu Vực Lớn của Codebase

1. **Content Management** (Lớn nhất):
   - Exercises: CRUD, review, generate, validate LaTeX
   - Chapters: CRUD, filter by grade
   - Skills: CRUD, filter by grade
   - Questions: CRUD, stats, practices, generate
   - Prompt Templates: CRUD, activate/deactivate

2. **User Management**:
   - Admins, Students, Parents, Trials
   - Status management
   - List và detail views

3. **Authentication & Authorization**:
   - Login/logout flow
   - Token management (httpOnly cookies)
   - Middleware guards
   - API routes proxy

4. **Dashboard & Metrics**:
   - Dashboard page với metrics, charts
   - Components trong `ecommerce/` folder (legacy naming)

5. **AI Quality** (Đang phát triển):
   - 3 pages đều là "Coming Soon"
   - Chưa có implementation

6. **System Management** (Chưa xác nhận):
   - Metrics, logs, health pages
   - Chưa xác nhận nội dung implementation

### Những Vùng Nhiều Code
- **Exercise management**: Nhiều components, hooks, services, types
- **Form components**: Nhiều form elements và utilities
- **API services**: 15 service files
- **Custom hooks**: 10 hook files cho data fetching

### Những Vùng Ít Code
- **AI Quality pages**: Chỉ có Coming Soon components
- **System pages**: Chưa xác nhận implementation
- **Error pages**: Chỉ có basic error pages

### Những Vùng Unclear Cần Confirm Thêm

1. **Duplicate files**:
   - `lib/utils/error-handler.ts` vs `lib/utils/errorHandler.ts` - File nào đang được dùng?

2. **Legacy components** (Đã xác nhận):
   - `components/ecommerce/` - ✅ Đang được dùng trong `/dashboard` page
   - `components/calendar/Calendar.tsx` - ❓ Chỉ có CSS styles, không thấy import trong routes
   - `components/devices/DeviceListModal.tsx` - ❓ Không thấy import trong routes
   - `components/tables/BasicTableOne.tsx` - ❓ Chỉ có definition, không thấy import

3. **System pages**:
   - `/system/metrics`, `/system/logs`, `/system/health` - Có implementation chưa?

4. **Dashboard data**:
   - Dashboard metrics có phải mock data không?

5. **Config files** (Đã xác nhận):
   - `lib/config/ui.config.ts`: ✅ Button loading state config (DOTS_ANIMATION_INTERVAL)
   - `lib/config/app.config.ts`: ✅ App metadata (name, version, environment)

6. **Route mismatch**:
   - Menu "Prompt" trong "Chất lượng AI" submenu có path `/content/prompt-templates` - Có đúng không?

7. **React Query usage** (Đã xác nhận):
   - ✅ Có `QueryProvider` setup nhưng custom hooks **KHÔNG dùng** React Query hooks
   - Custom hooks sử dụng `useState` + `useEffect` pattern
   - React Query được install và setup nhưng chưa được tích hợp vào data fetching logic

8. **Zod validation** (Đã xác nhận):
   - ✅ Đang được dùng trong `ExerciseCreateForm` và `ExerciseEditForm` với `zodResolver`

---

**Ngày khảo sát**: [Tự động generate]
**Người khảo sát**: AI Assistant
**Mục đích**: Chuẩn bị cho bước cleanup & tái cấu trúc

