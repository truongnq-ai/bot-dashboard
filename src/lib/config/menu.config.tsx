/**
 * Menu Configuration for Phase 1
 * 
 * Defines which menu items are visible in Phase 1.
 * This config is separate from route access control (middleware handles that).
 */

import React from "react";
import {
  GridIcon,
  UserCircleIcon,
  PageIcon,
  PlugInIcon,
  GraduationCapIcon,
  PieChartIcon,
} from "@/icons/index";

export type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

/**
 * Phase 1 Main Menu Items
 * Only includes routes that are in Phase 1 Allowed Scope
 */
export const PHASE1_MAIN_MENU_ITEMS: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Bảng điều khiển",
    path: "/dashboard",
  },
  {
    icon: <UserCircleIcon />,
    name: "Hồ sơ người dùng",
    path: "/profile",
  },
  {
    icon: <UserCircleIcon />,
    name: "Người dùng",
    subItems: [
      { name: "Quản trị viên", path: "/users/admins", pro: false },
      { name: "Giáo viên", path: "/users/teachers", pro: false },
    ],
  },
  {
    icon: <PageIcon />,
    name: "Danh mục",
    subItems: [
      { name: "Môn học", path: "/content/subjects", pro: false },
      { name: "Chủ đề", path: "/content/topics", pro: false },
    ],
  },
  {
    icon: <GraduationCapIcon />,
    name: "Giảng dạy",
    subItems: [
      { name: "Bài tập", path: "/exercises", pro: false },
      { name: "Đề bài", path: "/exercise-sets", pro: false },
      { name: "Giao bài", path: "/assignments", pro: false },
    ],
  },
  {
    icon: <PieChartIcon />,
    name: "Thống kê",
    subItems: [
      { name: "Bài tập", path: "/statistics/exercises", pro: false },
    ],
  },
];

/**
 * Phase 1 Others Menu Items (Auth section)
 */
export const PHASE1_OTHERS_MENU_ITEMS: NavItem[] = [
  {
    icon: <PlugInIcon />,
    name: "Xác thực",
    subItems: [
      { name: "Đăng nhập", path: "/login", pro: false },
      { name: "Đặt lại mật khẩu", path: "/reset-password", pro: false },
    ],
  },
];

