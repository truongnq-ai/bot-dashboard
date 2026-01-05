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
      { name: "Giáo viên", path: "/users/teachers", pro: false },
      { name: "Phụ huynh", path: "/users/parents", pro: false },
      { name: "Quản trị viên", path: "/users/admins", pro: false },
    ],
  },
  {
    icon: <PageIcon />,
    name: "Nội dung",
    subItems: [
      { name: "Chương", path: "/content/chapters", pro: false },
      { name: "Kỹ năng", path: "/content/skills", pro: false },
      { name: "Câu hỏi", path: "/content/questions", pro: false },
      { name: "Bài tập", path: "/content/exercises", pro: false },
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

