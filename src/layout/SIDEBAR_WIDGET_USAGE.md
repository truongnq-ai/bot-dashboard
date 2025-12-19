# SidebarWidget Usage Guide

## Overview

`SidebarWidget` là component hiển thị ở cuối sidebar, có thể chuyển đổi giữa hai chế độ:
- **System Status** (mặc định): Hiển thị trạng thái hệ thống
- **Feature Announcement**: Hiển thị thông báo tính năng mới

## Basic Usage

### Mặc định (System Status)

```tsx
// Hiển thị System Status mặc định
<SidebarWidget />
```

### Với Feature Announcement

```tsx
// Hiển thị Feature Announcement
<SidebarWidget 
  featureAnnouncement={{
    title: "New Feature Available",
    description: "AI Quality Monitoring v2.0 is now live with enhanced analytics!",
    link: "/ai-quality/accuracy",
    linkText: "Try It Now"
  }}
/>
```

## Examples

### Example 1: Feature Announcement với link

```tsx
<SidebarWidget 
  featureAnnouncement={{
    title: "AI Quality v2.0",
    description: "Enhanced accuracy metrics and real-time monitoring",
    link: "/ai-quality/accuracy",
    linkText: "Explore Now"
  }}
/>
```

### Example 2: Feature Announcement không có link (Coming Soon)

```tsx
<SidebarWidget 
  featureAnnouncement={{
    title: "Content Management",
    description: "Advanced content editor coming soon in Phase 2",
    linkText: "Coming Soon"
  }}
/>
```

### Example 3: Dynamic Feature Announcement

```tsx
// Có thể lấy từ API, context, hoặc state
const [announcement, setAnnouncement] = useState<FeatureAnnouncement | null>(null);

useEffect(() => {
  // Fetch announcement from API
  fetchAnnouncement().then(setAnnouncement);
}, []);

<SidebarWidget featureAnnouncement={announcement} />
```

## Features

- ✅ **Auto-toggle**: Tự động chuyển sang Feature Announcement khi có thông báo
- ✅ **Manual toggle**: User có thể click để chuyển đổi giữa hai chế độ
- ✅ **System Status**: Link đến `/system/health` để xem chi tiết
- ✅ **Responsive**: Tự động ẩn/hiện theo sidebar state
- ✅ **Dark mode**: Hỗ trợ dark mode

## Props

```typescript
interface SidebarWidgetProps {
  /**
   * Force widget to show feature announcement mode
   * If null, will show system status by default
   */
  featureAnnouncement?: FeatureAnnouncement | null;
}

interface FeatureAnnouncement {
  title: string;              // Tiêu đề thông báo
  description: string;         // Mô tả ngắn
  link?: string;              // Link đến trang chi tiết (optional)
  linkText?: string;          // Text cho button (optional, default: "Learn More")
}
```

## Integration với AppSidebar

Hiện tại widget được sử dụng trong `AppSidebar.tsx`:

```tsx
{isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
```

Để thêm feature announcement, có thể update như sau:

```tsx
// Option 1: Hardcode announcement
{isExpanded || isHovered || isMobileOpen ? (
  <SidebarWidget 
    featureAnnouncement={{
      title: "New Feature",
      description: "Check out our latest updates",
      link: "/dashboard"
    }}
  />
) : null}

// Option 2: Dynamic từ context/state
const { currentAnnouncement } = useAnnouncements();
{isExpanded || isHovered || isMobileOpen ? (
  <SidebarWidget featureAnnouncement={currentAnnouncement} />
) : null}
```
