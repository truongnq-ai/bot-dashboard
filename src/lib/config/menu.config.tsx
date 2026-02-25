/**
 * Menu Configuration for bot-dashboard (Phase 1)
 */

import React from "react";
import {
  GridIcon,
  UserCircleIcon,
  PageIcon,
  PlugInIcon,
  PieChartIcon,
} from "@/icons/index";

export type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

export const PHASE1_MAIN_MENU_ITEMS: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: <UserCircleIcon />,
    name: "Users",
    subItems: [
      { name: "All Users", path: "/users" },
    ],
  },
  {
    icon: <PageIcon />,
    name: "Accounts",
    subItems: [
      { name: "Accounts", path: "/accounts" },
      { name: "Balances", path: "/balances" },
    ],
  },
  {
    icon: <PieChartIcon />,
    name: "Trading",
    subItems: [
      { name: "OC States", path: "/oc-states" },
      { name: "Signals", path: "/signals" },
      { name: "Orders", path: "/orders" },
      { name: "Positions", path: "/positions" },
    ],
  },
  {
    icon: <PieChartIcon />,
    name: "Risk & System",
    subItems: [
      { name: "Risk Alerts", path: "/risk-alerts" },
      { name: "System Health", path: "/system-health" },
    ],
  },
  {
    icon: <PageIcon />,
    name: 'Config',
    subItems: [
      { name: 'Strategy Config', path: '/config' },
      { name: 'Tham số hệ thống', path: '/params' },
    ],
  },
];

export const PHASE1_OTHERS_MENU_ITEMS: NavItem[] = [
  {
    icon: <PlugInIcon />,
    name: "Auth",
    subItems: [
      { name: "Login", path: "/login" },
      { name: "Reset Password", path: "/reset-password" },
    ],
  },
];
