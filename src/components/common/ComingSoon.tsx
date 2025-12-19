"use client";
import React from "react";
import "remixicon/fonts/remixicon.css";

interface ComingSoonProps {
  title?: string;
  description?: string;
}

export default function ComingSoon({
  title = "Chức năng đang nâng cấp",
  description = "Tính năng này đang được phát triển và sẽ sớm có mặt. Vui lòng quay lại sau!",
}: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="relative">
        {/* Animated background circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 bg-gradient-to-br from-brand-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-md">
          {/* Icon */}
          <div className="mb-6 relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center shadow-lg animate-bounce">
              <i className="ri-tools-line text-5xl text-white"></i>
            </div>
            {/* Decorative circles */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
            {title}
          </h1>

          {/* Description */}
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            {description}
          </p>

          {/* Decorative elements */}
          <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
            <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Đang phát triển</span>
            <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Bottom decorative wave */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent pointer-events-none"></div>
    </div>
  );
}
