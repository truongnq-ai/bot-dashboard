# BÁO CÁO PHÂN TÍCH DISCOVERY
## Module: Web Admin Dashboard (NextJS)
## Dự án: TeachFlow Phase 1

---

## MỤC ĐÍCH CỦA BÁO CÁO

Báo cáo này tồn tại để:
- **Phân tích và làm rõ** codebase hiện tại của module Web Admin Dashboard
- **Xác định** phần nào có giá trị và có thể giữ lại cho TeachFlow Phase 1
- **Xác định** phần nào bắt buộc phải loại bỏ hoặc reset
- **Cảnh báo** những rủi ro nghiêm trọng nếu reuse nhầm logic admin/user management
- **Vạch ranh giới** rõ ràng giữa UI/frontend infra thuần và logic vi phạm System Law/Phase 1

**LƯU Ý QUAN TRỌNG:**
- Báo cáo này **KHÔNG đề xuất giải pháp**
- Báo cáo này **KHÔNG refactor**
- Báo cáo này **CHỈ phân tích và hiểu đúng code hiện tại**

---

## I. MỤC ĐÍCH & GIẢ ĐỊNH NGẦM CỦA MODULE

### 1.1 Mục đích ban đầu của module

Module Web Admin Dashboard được xây dựng để phục vụ:

**Đối tượng:**
- **Admin nghiệp vụ** (business admin) - người quản lý hệ thống
- **Admin kỹ thuật** (technical admin) - người vận hành hệ thống

**Authority giả định:**
- Admin có quyền quản lý toàn bộ users (students, parents, admins)
- Admin có quyền quản lý content (exercises, chapters, skills, questions)
- Admin có quyền duyệt bài tập (review/approve exercises)
- Admin có quyền xem dashboard tổng hợp và analytics

### 1.2 Giả định ngầm về user model

Module này **giả định tồn tại**:

1. **Nhiều loại user:**
   - Admin (nghiệp vụ)
   - Student
   - Parent
   - Trial user

2. **Role-based access control:**
   - Mỗi user có role
   - Role quyết định quyền truy cập
   - Admin có quyền cao nhất

3. **User management:**
   - Admin có thể tạo/sửa/xóa users
   - Admin có thể reset password
   - Admin có thể quản lý lifecycle của users

### 1.3 Xung đột trực tiếp với TeachFlow Phase 1

**XUNG ĐỘT NGHIÊM TRỌNG:**

1. **Admin nghiệp vụ không tồn tại trong Phase 1:**
   - Phase 1: Admin chỉ là technical operator ngoài hệ thống
   - Module hiện tại: Admin là actor chính trong hệ thống

2. **User management không tồn tại trong Phase 1:**
   - Phase 1: Không có user management UI
   - Module hiện tại: Có đầy đủ UI quản lý users (students, parents, admins)

3. **Role-based access control không tồn tại trong Phase 1:**
   - Phase 1: Chỉ có 1 role duy nhất = Teacher
   - Module hiện tại: Giả định nhiều role và permission matrix

4. **Dashboard tổng hợp không tồn tại trong Phase 1:**
   - Phase 1: Không có dashboard, analytics, insight
   - Module hiện tại: Có dashboard với metrics, charts, statistics

5. **Review/approval workflow không tồn tại trong Phase 1:**
   - Phase 1: Teacher tự approve bài của mình
   - Module hiện tại: Admin duyệt bài tập (DRAFT → REVIEWED → APPROVED)

---

## II. PHÂN TÍCH CHỨC NĂNG & MÀN HÌNH

### 2.1 Nhóm màn hình chính

#### A. Dashboard & Overview
**Màn hình:**
- `/dashboard` - Dashboard tổng hợp với metrics, charts, statistics

**Chức năng:**
- Hiển thị metrics tổng hợp (EcommerceMetrics)
- Biểu đồ doanh thu (MonthlySalesChart)
- Thống kê (StatisticsChart)
- Recent orders (RecentOrders)
- Demographic card (DemographicCard)

**Vi phạm Phase 1:**
- ❌ **VI PHẠM NGHIÊM TRỌNG**: Dashboard tổng hợp không tồn tại trong Phase 1
- ❌ **VI PHẠM**: Analytics và insight không được phép
- ❌ **VI PHẠM**: Metrics và statistics không được phép

**Kết luận:** **MUST BE REMOVED**

---

#### B. User Management
**Màn hình:**
- `/users/students` - Quản lý học sinh
- `/users/parents` - Quản lý phụ huynh
- `/users/admins` - Quản lý admin

**Chức năng:**

**Students:**
- List students với pagination
- Filter students
- View student detail
- (Có thể có create/edit/delete - cần xác nhận)

**Parents:**
- List parents với pagination
- Filter parents
- View parent detail
- (Có thể có create/edit/delete - cần xác nhận)

**Admins:**
- List admins với pagination
- Filter admins by role
- Create admin (AdminCreateModal)
- View admin detail (AdminDetailModal)
- Reset password (resetUserPassword API)

**Vi phạm Phase 1:**
- ❌ **VI PHẠM NGHIÊM TRỌNG**: User management UI không tồn tại trong Phase 1
- ❌ **VI PHẠM**: Student user không tồn tại trong Phase 1
- ❌ **VI PHẠM**: Parent user không tồn tại trong Phase 1
- ❌ **VI PHẠM**: Admin nghiệp vụ không tồn tại trong Phase 1
- ❌ **VI PHẠM**: Reset password từ UI không được phép trong Phase 1

**Kết luận:** **MUST BE REMOVED**

---

#### C. Content Management
**Màn hình:**
- `/content/chapters` - Quản lý chương
- `/content/skills` - Quản lý kỹ năng
- `/content/questions` - Quản lý câu hỏi
- `/content/exercises` - Quản lý bài tập
- `/content/exercises/create` - Tạo bài tập
- `/content/exercises/create-from-json` - Tạo bài tập từ JSON
- `/content/exercises/[id]` - Chi tiết bài tập
- `/content/exercises/[id]/edit` - Sửa bài tập
- `/content/exercises/[id]/review` - Duyệt bài tập (bị block bởi middleware)

**Chức năng:**

**Exercises:**
- List exercises với pagination
- Filter by grade, chapter, skill, reviewStatus
- Create exercise (manual, AI, from JSON)
- View exercise detail
- Edit exercise
- Review/approve exercise (DRAFT → REVIEWED → APPROVED)
- Bulk approve/reject

**Vi phạm Phase 1:**

**CÓ THỂ GIỮ (với sửa đổi):**
- ✅ List exercises (nhưng chỉ của teacher, không phải tất cả)
- ✅ Create exercise (manual và AI - đúng với Flow B)
- ✅ Edit exercise
- ✅ View exercise detail

**PHẢI LOẠI BỎ:**
- ❌ Review/approve workflow (Phase 1: teacher tự approve)
- ❌ ReviewStatus filter (DRAFT/REVIEWED/APPROVED → chỉ DRAFT/APPROVED)
- ❌ Bulk approve/reject
- ❌ Create from JSON (không có trong UI-Spec)
- ❌ Filter by grade/chapter/skill (có thể giữ nếu là filter của teacher)

**Kết luận:** **RESET / REWRITE REQUIRED**

---

#### D. System & AI Quality
**Màn hình:**
- `/system/logs` - System logs
- `/system/health` - System health
- `/system/metrics` - System metrics
- `/ai-quality/solutions` - AI solutions review
- `/ai-quality/accuracy` - Accuracy metrics
- `/ai-quality/errors` - Error analysis

**Chức năng:**
- System monitoring
- AI quality monitoring
- Analytics và metrics

**Vi phạm Phase 1:**
- ❌ **VI PHẠM**: System monitoring UI không tồn tại trong Phase 1
- ❌ **VI PHẠM**: AI quality monitoring không tồn tại trong Phase 1
- ❌ **VI PHẠM**: Analytics và metrics không được phép

**Kết luận:** **MUST BE REMOVED** (đã bị block bởi middleware)

---

#### E. Authentication
**Màn hình:**
- `/login` - Đăng nhập
- `/reset-password` - Đặt lại mật khẩu

**Chức năng:**
- Login với username/password
- Reset password (có thể có)

**Vi phạm Phase 1:**

**CÓ THỂ GIỮ (với sửa đổi):**
- ✅ Login (đúng với Phase 1 spec)

**PHẢI LOẠI BỎ:**
- ❌ Reset password từ UI (Phase 1: admin reset ngoài hệ thống)

**Kết luận:** **RESET / REWRITE REQUIRED** (login giữ, reset password loại bỏ)

---

### 2.2 Tổng kết vi phạm theo nhóm màn hình

| Nhóm màn hình | Vi phạm Phase 1 | Mức độ | Kết luận |
|--------------|-----------------|--------|----------|
| Dashboard | Analytics, metrics, insight | NGHIÊM TRỌNG | MUST BE REMOVED |
| User Management | User management UI, role management | NGHIÊM TRỌNG | MUST BE REMOVED |
| Content Management | Review workflow, bulk actions | TRUNG BÌNH | RESET / REWRITE REQUIRED |
| System & AI Quality | Monitoring, analytics | NGHIÊM TRỌNG | MUST BE REMOVED |
| Authentication | Reset password | NHẸ | RESET / REWRITE REQUIRED |

---

## III. AUTH, ROLE & PERMISSION LOGIC (ĐIỂM NGUY HIỂM NHẤT)

### 3.1 Authentication Logic

**File:** `src/context/AuthContext.tsx`

**Cách xử lý:**
- Login với username/password
- Lưu token trong httpOnly cookie
- Check auth status qua `/api/auth/check`
- User object chỉ có `sub` field (không có role)

**Đánh giá:**
- ✅ **SAFE**: Login logic cơ bản đúng với Phase 1
- ⚠️ **CẦN XEM XÉT**: User object không có role - đúng với Phase 1 (chỉ có teacher)
- ✅ **SAFE**: Token storage trong httpOnly cookie - an toàn

**Kết luận:** **SAFE TO KEEP** (với xác nhận không có role logic)

---

### 3.2 Role & Permission Logic

**Phát hiện quan trọng:**

1. **KHÔNG có role-based access control trong frontend:**
   - Codebase hiện tại **KHÔNG có** logic check role trong UI
   - Tất cả authenticated users có quyền truy cập tất cả routes
   - Menu không có role-based filtering

2. **Backend có role-based authorization:**
   - Backend có `.hasRole("ADMIN")` trong SecurityConfig
   - Frontend không enforce role, nhưng backend có thể reject

**Đánh giá:**
- ✅ **SAFE**: Frontend không có role logic - đúng với Phase 1
- ⚠️ **RỦI RO**: Nếu reuse backend logic có role → sẽ vi phạm Phase 1
- ✅ **SAFE**: Middleware chỉ check authentication, không check role

**Kết luận:** **SAFE TO KEEP** (frontend auth logic), nhưng **CẢNH BÁO** về backend

---

### 3.3 Admin giả định là actor hợp pháp

**Phát hiện:**

1. **Menu config có "Quản trị viên":**
   - Menu có `/users/admins` - giả định admin là user trong hệ thống

2. **Admin management UI:**
   - Có AdminList, AdminCreateModal, AdminDetailModal
   - Có API `createAdmin`, `getAdmins`, `resetUserPassword`

3. **Dashboard giả định admin view:**
   - Dashboard hiển thị metrics tổng hợp - giả định admin xem toàn hệ thống

**Vi phạm Phase 1:**
- ❌ **VI PHẠM**: Admin không phải là user trong hệ thống Phase 1
- ❌ **VI PHẠM**: Admin không có UI trong Phase 1
- ❌ **VI PHẠM**: Admin không can thiệp nghiệp vụ

**Kết luận:** **MUST BE REMOVED** (admin management UI)

---

### 3.4 Có thể reuse không?

**Authentication logic:**
- ✅ **CÓ THỂ REUSE**: Login logic cơ bản
- ❌ **KHÔNG REUSE**: Reset password logic
- ❌ **KHÔNG REUSE**: Admin management logic

**Role & Permission logic:**
- ✅ **SAFE**: Frontend không có role logic - không cần loại bỏ
- ⚠️ **CẢNH BÁO**: Không được thêm role logic vào frontend

**Kết luận tổng thể:**
- **SAFE TO KEEP**: Auth context và login logic
- **MUST BE REMOVED**: Admin management, reset password
- **CẢNH BÁO**: Không được reuse backend role logic

---

## IV. FRONTEND INFRA & UI TOOLING

### 4.1 NextJS Boilerplate & Routing

**File:** `src/app/`, `src/middleware.ts`

**Thành phần:**
- Next.js App Router structure
- Route groups `(admin)` và `(full-width-pages)`
- Middleware cho auth guard
- Layout components (AppHeader, AppSidebar)

**Đánh giá:**
- ✅ **SAFE TO KEEP**: NextJS boilerplate và routing structure
- ✅ **SAFE TO KEEP**: Layout components (có thể sửa menu)
- ⚠️ **CẦN XEM XÉT**: Middleware có Phase 1 route check - có thể giữ

**Kết luận:** **SAFE TO KEEP**

---

### 4.2 Component Library & UI Primitives

**Thành phần:**
- `src/components/ui/` - UI primitives (buttons, modals, dropdowns, etc.)
- `src/components/form/` - Form components (inputs, selects, date-picker, etc.)
- `src/components/common/` - Common components (AlertModal, ConfirmModal, etc.)
- `src/components/charts/` - Chart components
- `src/icons/` - Icon components

**Đánh giá:**
- ✅ **SAFE TO KEEP**: UI primitives không mang nghiệp vụ
- ✅ **SAFE TO KEEP**: Form components thuần
- ✅ **SAFE TO KEEP**: Common components
- ⚠️ **CẦN XEM XÉT**: Chart components - Phase 1 không có analytics, nhưng có thể giữ cho tương lai

**Kết luận:** **SAFE TO KEEP**

---

### 4.3 State Management & Data Fetching

**Thành phần:**
- `@tanstack/react-query` - Server state management
- `src/context/` - Context providers (AuthContext, SidebarContext, ThemeContext)
- `src/lib/hooks/` - Custom hooks cho data fetching
- `src/lib/api/` - API service layer

**Đánh giá:**
- ✅ **SAFE TO KEEP**: React Query setup
- ✅ **SAFE TO KEEP**: Context providers (AuthContext cần xác nhận)
- ✅ **SAFE TO KEEP**: Hooks pattern và API service layer structure
- ⚠️ **CẦN XEM XÉT**: API services có thể gọi endpoints không tồn tại trong Phase 1

**Kết luận:** **SAFE TO KEEP** (infrastructure), nhưng **CẦN REVIEW** API services

---

### 4.4 Rich Text Editor & Math Rendering

**Thành phần:**
- `@tiptap/react` - Rich text editor
- `katex`, `react-katex` - Math rendering

**Đánh giá:**
- ✅ **SAFE TO KEEP**: Rich text editor - cần cho exercise editor
- ✅ **SAFE TO KEEP**: Math rendering - cần cho exercise content

**Kết luận:** **SAFE TO KEEP**

---

### 4.5 Encode nghiệp vụ vs Tooling thuần

**Phân loại:**

**TOOLING THUẦN (SAFE TO KEEP):**
- NextJS routing và layout
- UI primitives (buttons, modals, inputs)
- Form components
- State management (React Query, Context)
- Rich text editor
- Math rendering
- Icon library

**ENCODE NGHIỆP VỤ (CẦN XEM XÉT):**
- Menu config (có admin, students, parents)
- Dashboard components (analytics, metrics)
- User management components
- Exercise review workflow
- API services (có thể gọi endpoints không tồn tại)

**Kết luận:** 
- **SAFE TO KEEP**: ~70% là tooling thuần
- **CẦN REVIEW**: ~30% encode nghiệp vụ

---

## V. VI PHẠM SYSTEM LAW & PHASE 1

### 5.1 Vi phạm System Law

**System Law vi phạm:**

1. **Đối tượng trung tâm:**
   - ❌ **VI PHẠM**: Module giả định admin là đối tượng trung tâm
   - ✅ **ĐÚNG**: Phase 1 chỉ có teacher là đối tượng trung tâm

2. **Quyền kiểm soát:**
   - ❌ **VI PHẠM**: Admin có quyền can thiệp domain thay giáo viên
   - ✅ **ĐÚNG**: Phase 1 chỉ có giáo viên kiểm soát domain của mình

3. **Human-in-the-loop:**
   - ⚠️ **CẦN XEM XÉT**: Review workflow có thể vi phạm (admin duyệt thay giáo viên)
   - ✅ **ĐÚNG**: Phase 1 giáo viên tự approve

**Kết luận:** **VI PHẠM NGHIÊM TRỌNG** về đối tượng trung tâm và quyền kiểm soát

---

### 5.2 Vi phạm Phase 1 Law

**Phase 1 Law vi phạm:**

1. **Law 2.1 - Người dùng:**
   - ❌ **VI PHẠM**: Module có UI cho students, parents, admins
   - ✅ **ĐÚNG**: Phase 1 chỉ có teacher

2. **Law 2.2 - Admin:**
   - ❌ **VI PHẠM**: Module có admin UI và admin can thiệp nghiệp vụ
   - ✅ **ĐÚNG**: Phase 1 admin không có UI, không can thiệp nghiệp vụ

3. **Law 4.1 - Trạng thái bài tập:**
   - ❌ **VI PHẠM**: Module có REVIEWED status và review workflow
   - ✅ **ĐÚNG**: Phase 1 chỉ có DRAFT và APPROVED

4. **Law 8.1 - UI không gây ảo giác quyền lực AI:**
   - ⚠️ **CẦN XEM XÉT**: Dashboard có thể tạo ảo giác "hệ thống biết nhiều hơn giáo viên"
   - ✅ **ĐÚNG**: Phase 1 không có dashboard

**Kết luận:** **VI PHẠM NGHIÊM TRỌNG** về user model và exercise workflow

---

### 5.3 Dashboard tổng hợp & Analytics

**Phát hiện:**

1. **Dashboard components:**
   - `EcommerceMetrics` - Metrics tổng hợp
   - `MonthlySalesChart` - Biểu đồ doanh thu
   - `StatisticsChart` - Thống kê
   - `RecentOrders` - Recent orders
   - `DemographicCard` - Demographic data

2. **Vi phạm:**
   - ❌ **VI PHẠM**: Dashboard tổng hợp không tồn tại trong Phase 1
   - ❌ **VI PHẠM**: Analytics và insight không được phép
   - ❌ **VI PHẠM**: Metrics và statistics không được phép

**Kết luận:** **MUST BE REMOVED**

---

### 5.4 Những chỗ NGUY HIỂM NHẤT nếu reuse nhầm

**TOP 5 RỦI RO NGHIÊM TRỌNG:**

1. **Admin management UI:**
   - ❌ **NGUY HIỂM**: Nếu reuse → tạo authority cho admin nghiệp vụ
   - ❌ **NGUY HIỂM**: Vi phạm System Law về đối tượng trung tâm

2. **User management UI:**
   - ❌ **NGUY HIỂM**: Nếu reuse → tạo user management trong Phase 1
   - ❌ **NGUY HIỂM**: Vi phạm Phase 1 Law về user model

3. **Review workflow:**
   - ❌ **NGUY HIỂM**: Nếu reuse → admin duyệt bài thay giáo viên
   - ❌ **NGUY HIỂM**: Vi phạm System Law về quyền kiểm soát

4. **Dashboard analytics:**
   - ❌ **NGUY HIỂM**: Nếu reuse → tạo dashboard tổng hợp
   - ❌ **NGUY HIỂM**: Vi phạm Phase 1 Law về UI

5. **Role-based logic (nếu có):**
   - ❌ **NGUY HIỂM**: Nếu thêm role logic → vi phạm Phase 1 Law
   - ⚠️ **MAY MẮN**: Frontend hiện tại không có role logic

**Kết luận:** **CẢNH BÁO NGHIÊM TRỌNG** - không được reuse admin/user management logic

---

## VI. PHÂN LOẠI THÀNH PHẦN

### 6.1 SAFE TO KEEP

**Frontend Infrastructure:**
- ✅ NextJS App Router structure
- ✅ Route groups và layout system
- ✅ Middleware (với Phase 1 route check)
- ✅ Context providers (AuthContext, SidebarContext, ThemeContext)
- ✅ React Query setup
- ✅ API client structure

**UI Tooling:**
- ✅ UI primitives (`src/components/ui/`)
- ✅ Form components (`src/components/form/`)
- ✅ Common components (`src/components/common/`)
- ✅ Icon library (`src/icons/`)
- ✅ Rich text editor (TipTap)
- ✅ Math rendering (KaTeX)

**Component Structure:**
- ✅ Component organization pattern
- ✅ Hooks pattern (`src/lib/hooks/`)
- ✅ API service layer (`src/lib/api/`)
- ✅ Type definitions (`src/types/`)

**Authentication (cơ bản):**
- ✅ Login logic (AuthContext)
- ✅ Token management (httpOnly cookies)
- ✅ Auth guard (middleware)

**Kết luận:** **~70% codebase là SAFE TO KEEP**

---

### 6.2 RESET / REWRITE REQUIRED

**Content Management (với sửa đổi):**
- ⚠️ Exercise list (phải filter theo teacher_id)
- ⚠️ Exercise create/edit (giữ logic, sửa workflow)
- ⚠️ Exercise detail (giữ UI, sửa data source)
- ❌ Exercise review workflow (loại bỏ)
- ❌ Bulk approve/reject (loại bỏ)
- ❌ Create from JSON (loại bỏ nếu không có trong spec)

**Authentication (với sửa đổi):**
- ✅ Login (giữ)
- ❌ Reset password (loại bỏ)

**Menu & Navigation:**
- ⚠️ Menu config (phải sửa: loại bỏ admin, students, parents)
- ⚠️ Sidebar (phải sửa menu items)

**Dashboard:**
- ❌ Dashboard page (loại bỏ hoàn toàn)
- ❌ Dashboard components (loại bỏ)

**Kết luận:** **~20% codebase cần RESET / REWRITE**

---

### 6.3 MUST BE REMOVED

**User Management:**
- ❌ `/users/students` - Student management UI
- ❌ `/users/parents` - Parent management UI
- ❌ `/users/admins` - Admin management UI
- ❌ `src/components/students/` - Student components
- ❌ `src/components/parents/` - Parent components
- ❌ `src/components/admins/` - Admin components
- ❌ `src/lib/api/student.service.ts` - Student API (nếu có)
- ❌ `src/lib/api/parent.service.ts` - Parent API (nếu có)
- ❌ `src/lib/api/admin.service.ts` - Admin API (nếu có)

**Dashboard & Analytics:**
- ❌ `/dashboard` - Dashboard page
- ❌ `src/components/ecommerce/` - Dashboard components
- ❌ `src/components/charts/` - Chart components (nếu chỉ dùng cho analytics)

**System & AI Quality:**
- ❌ `/system/*` - System monitoring pages
- ❌ `/ai-quality/*` - AI quality monitoring pages
- (Đã bị block bởi middleware, nhưng nên xóa code)

**Review Workflow:**
- ❌ Exercise review status (REVIEWED)
- ❌ Review workflow logic
- ❌ Bulk approve/reject

**Reset Password:**
- ❌ `/reset-password` - Reset password page
- ❌ Reset password logic trong AuthContext

**Kết luận:** **~10% codebase MUST BE REMOVED**

---

## VII. RỦI RO NẾU REUSE SAI

### 7.1 Rủi ro về User Model

**Nếu reuse user management UI:**
- ❌ Tạo user management trong Phase 1 (vi phạm Phase 1 Law)
- ❌ Tạo student/parent user (vi phạm Phase 1 Law)
- ❌ Tạo admin nghiệp vụ (vi phạm System Law)

**Hệ quả:**
- Phase 1 scope bị vỡ
- System Law bị vi phạm
- Phải rollback và refactor

**Kết luận:** **RỦI RO NGHIÊM TRỌNG** - không được reuse

---

### 7.2 Rủi ro về Authority

**Nếu reuse admin management:**
- ❌ Tạo authority cho admin nghiệp vụ (vi phạm System Law)
- ❌ Admin can thiệp domain thay giáo viên (vi phạm System Law)
- ❌ Giảm quyền kiểm soát của giáo viên (vi phạm System Law)

**Hệ quả:**
- System Law bị vi phạm nghiêm trọng
- Đối tượng trung tâm sai
- Phải rollback toàn bộ

**Kết luận:** **RỦI RO NGHIÊM TRỌNG** - không được reuse

---

### 7.3 Rủi ro về Review Workflow

**Nếu reuse review workflow:**
- ❌ Admin duyệt bài thay giáo viên (vi phạm System Law)
- ❌ Tạo REVIEWED status (vi phạm Phase 1 Law)
- ❌ Giảm quyền kiểm soát của giáo viên (vi phạm System Law)

**Hệ quả:**
- Phase 1 Law bị vi phạm
- System Law bị vi phạm
- Phải sửa lại workflow

**Kết luận:** **RỦI RO TRUNG BÌNH** - không được reuse

---

### 7.4 Rủi ro về Dashboard

**Nếu reuse dashboard:**
- ❌ Tạo dashboard tổng hợp (vi phạm Phase 1 Law)
- ❌ Tạo analytics và insight (vi phạm Phase 1 Law)
- ❌ Tạo ảo giác "hệ thống biết nhiều hơn giáo viên" (vi phạm System Law)

**Hệ quả:**
- Phase 1 Law bị vi phạm
- UI-Spec bị vi phạm
- Phải loại bỏ dashboard

**Kết luận:** **RỦI RO TRUNG BÌNH** - không được reuse

---

## VIII. CÂU HỎI CẦN PRODUCT OWNER CHỐT

### 8.1 Câu hỏi về Exercise Management

1. **Filter by grade/chapter/skill:**
   - Hiện tại: Exercise list có filter by grade/chapter/skill
   - Câu hỏi: Phase 1 có cho phép filter này không? (UI-Spec không rõ)
   - Khuyến nghị: Có thể giữ nếu là filter của teacher (không phải toàn hệ thống)

2. **Create from JSON:**
   - Hiện tại: Có route `/content/exercises/create-from-json`
   - Câu hỏi: Phase 1 có cho phép tạo bài từ JSON không?
   - Khuyến nghị: Không có trong UI-Spec → nên loại bỏ

3. **Exercise detail view:**
   - Hiện tại: Có exercise detail page
   - Câu hỏi: Phase 1 có cần exercise detail view không? (UI-Spec chỉ có list và editor)
   - Khuyến nghị: Có thể giữ nếu là view của teacher (không phải review)

---

### 8.2 Câu hỏi về Authentication

1. **User object structure:**
   - Hiện tại: User object chỉ có `sub` field
   - Câu hỏi: Phase 1 có cần thêm field nào không? (name, teacher_id?)
   - Khuyến nghị: Theo Phase 1 spec, cần map `user_id` → `teacher_id`

2. **Token refresh:**
   - Hiện tại: Có token refresh logic
   - Câu hỏi: Phase 1 có cần token refresh không?
   - Khuyến nghị: Có thể giữ (không vi phạm Phase 1)

---

### 8.3 Câu hỏi về Menu & Navigation

1. **Menu structure:**
   - Hiện tại: Menu có "Người dùng" với students/parents/admins
   - Câu hỏi: Phase 1 menu structure như thế nào?
   - Khuyến nghị: Theo UI-Spec, chỉ có Class List và Exercise List

2. **Profile page:**
   - Hiện tại: Có `/profile` page
   - Câu hỏi: Phase 1 có cần profile page không?
   - Khuyến nghị: UI-Spec không có → nên loại bỏ hoặc xác nhận

---

## IX. TỔNG KẾT

### 9.1 Phân loại tổng thể

| Loại | Tỷ lệ | Mô tả |
|------|-------|-------|
| **SAFE TO KEEP** | ~70% | Frontend infra, UI tooling, component structure |
| **RESET / REWRITE REQUIRED** | ~20% | Content management (với sửa đổi), menu, auth (một phần) |
| **MUST BE REMOVED** | ~10% | User management, dashboard, system monitoring, review workflow |

---

### 9.2 Rủi ro lớn nhất

1. **Admin management UI** - Rủi ro nghiêm trọng
2. **User management UI** - Rủi ro nghiêm trọng
3. **Review workflow** - Rủi ro trung bình
4. **Dashboard analytics** - Rủi ro trung bình

---

### 9.3 Khuyến nghị

1. **GIỮ LẠI:**
   - Frontend infrastructure (~70%)
   - UI tooling và component library
   - Authentication logic cơ bản (login)

2. **SỬA ĐỔI:**
   - Exercise management (loại bỏ review workflow)
   - Menu config (loại bỏ admin/students/parents)
   - API services (filter theo teacher_id)

3. **LOẠI BỎ:**
   - User management UI (students, parents, admins)
   - Dashboard và analytics
   - System monitoring
   - Review workflow
   - Reset password

---

## X. KẾT LUẬN

Module Web Admin Dashboard hiện tại:

- **CÓ GIÁ TRỊ:** ~70% là frontend infrastructure và UI tooling - có thể giữ lại
- **CẦN SỬA ĐỔI:** ~20% là content management và menu - cần reset/rewrite
- **PHẢI LOẠI BỎ:** ~10% là user management và dashboard - phải loại bỏ hoàn toàn

**RỦI RO LỚN NHẤT:**
- Reuse nhầm admin/user management logic → vi phạm System Law và Phase 1 Law nghiêm trọng
- Reuse nhầm review workflow → vi phạm quyền kiểm soát của giáo viên

**RANH GIỚI RÕ RÀNG:**
- **SAFE:** Frontend infra, UI tooling, component structure
- **DANGER:** Admin/user management, dashboard, review workflow

---

**KẾT THÚC BÁO CÁO**

Kết quả phân tích
Phân loại codebase
SAFE TO KEEP (~70%):
Frontend infrastructure (NextJS, routing, layout)
UI tooling (components, forms, icons)
State management (React Query, Context)
Rich text editor & Math rendering
Authentication logic cơ bản (login)
RESET / REWRITE REQUIRED (~20%):
Exercise management (cần loại bỏ review workflow)
Menu config (cần loại bỏ admin/students/parents)
API services (cần filter theo teacher_id)
MUST BE REMOVED (~10%):
User management UI (students, parents, admins)
Dashboard & analytics
System monitoring
Review workflow
Reset password
Rủi ro lớn nhất
Admin management UI — vi phạm System Law về đối tượng trung tâm
User management UI — vi phạm Phase 1 Law về user model
Review workflow — vi phạm quyền kiểm soát của giáo viên
Dashboard analytics — vi phạm Phase 1 Law về UI
Phát hiện quan trọng
Frontend không có role-based access control — đúng với Phase 1
Backend có role logic — không được reuse
Module giả định admin là actor chính — vi phạm System Law
Dashboard tổng hợp — vi phạm Phase 1 Law
Báo cáo chi tiết đã được lưu tại:
tutor-admin-dashboard/WEB_ADMIN_DASHBOARD_DISCOVERY_REPORT.md
Báo cáo bao gồm:
Phân tích mục đích và giả định ngầm
Phân tích từng nhóm màn hình
Phân tích Auth, Role & Permission logic
Phân tích Frontend infra & UI tooling
Phân tích vi phạm System Law & Phase 1
Phân loại thành phần (KEEP / RESET / REMOVE)
Danh sách rủi ro
Câu hỏi cần Product Owner chốt
Báo cáo này có thể dùng làm tài liệu chính thức cho bước CLEANUP tiếp theo.