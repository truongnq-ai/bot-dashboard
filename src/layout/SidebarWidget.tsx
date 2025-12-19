"use client";
import React, { useState } from "react";
import Link from "next/link";

type WidgetMode = "systemStatus" | "featureAnnouncement";

interface FeatureAnnouncement {
  title: string;
  description: string;
  link?: string;
  linkText?: string;
}

interface SidebarWidgetProps {
  /**
   * Force widget to show feature announcement mode
   * If null, will show system status by default
   */
  featureAnnouncement?: FeatureAnnouncement | null;
}

export default function SidebarWidget({ 
  featureAnnouncement = null 
}: SidebarWidgetProps = {}) {
  const [mode, setMode] = useState<WidgetMode>(
    featureAnnouncement ? "featureAnnouncement" : "systemStatus"
  );

  // Toggle between modes (only if both are available)
  const canToggle = featureAnnouncement !== null;
  const toggleMode = () => {
    if (canToggle) {
      setMode(mode === "systemStatus" ? "featureAnnouncement" : "systemStatus");
    }
  };

  // System Status View
  const SystemStatusView = () => (
    <>
      <div className="flex items-center justify-center mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            System Status
          </h3>
        </div>
      </div>
      <p className="mb-4 text-gray-500 text-theme-sm dark:text-gray-400">
        All systems operational
      </p>
      <Link
        href="/system/health"
        className="flex items-center justify-center gap-2 p-3 font-medium text-white rounded-lg bg-brand-500 text-theme-sm hover:bg-brand-600 transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        View Health
      </Link>
      {canToggle && (
        <button
          onClick={toggleMode}
          className="mt-2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          New feature available →
        </button>
      )}
    </>
  );

  // Feature Announcement View
  const FeatureAnnouncementView = () => {
    if (!featureAnnouncement) return null;

    return (
      <>
        <div className="flex items-center justify-center mb-2">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-warning-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {featureAnnouncement.title}
            </h3>
          </div>
        </div>
        <p className="mb-4 text-gray-500 text-theme-sm dark:text-gray-400">
          {featureAnnouncement.description}
        </p>
        {featureAnnouncement.link ? (
          <Link
            href={featureAnnouncement.link}
            className="flex items-center justify-center gap-2 p-3 font-medium text-white rounded-lg bg-brand-500 text-theme-sm hover:bg-brand-600 transition-colors"
          >
            {featureAnnouncement.linkText || "Learn More"}
          </Link>
        ) : (
          <div className="flex items-center justify-center gap-2 p-3 font-medium text-gray-700 rounded-lg bg-gray-100 text-theme-sm dark:bg-gray-800 dark:text-gray-300">
            {featureAnnouncement.linkText || "Coming Soon"}
          </div>
        )}
        {canToggle && (
          <button
            onClick={toggleMode}
            className="mt-2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            ← System Status
          </button>
        )}
      </>
    );
  };

  return (
    <div
      className={`
        mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gray-50 px-4 py-5 text-center dark:bg-white/[0.03]`}
    >
      {mode === "systemStatus" ? <SystemStatusView /> : <FeatureAnnouncementView />}
    </div>
  );
}
