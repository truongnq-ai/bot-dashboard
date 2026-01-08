"use client";
import React, { useEffect, useState } from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";

export const EcommerceMetrics = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    setIsVisible(true);
  }, []);

  const metrics = [
    {
      icon: <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />,
      label: "Customers",
      value: "3,782",
      badge: (
        <Badge color="success">
          <ArrowUpIcon />
          11.01%
        </Badge>
      ),
    },
    {
      icon: <BoxIconLine className="text-gray-800 dark:text-white/90" />,
      label: "Orders",
      value: "5,359",
      badge: (
        <Badge color="error">
          <ArrowDownIcon className="text-error-500" />
          9.05%
        </Badge>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {metrics.map((metric, index) => (
        <div
          key={metric.label}
          className={`
            rounded-2xl 
            border 
            border-gray-200 
            bg-white 
            p-5 
            dark:border-gray-800 
            dark:bg-white/[0.03] 
            md:p-6
            cursor-pointer
            ${isVisible ? 'animate-fade-in-slide-up' : 'opacity-0 translate-y-2'}
            hover-lift
            hover:shadow-[var(--shadow-theme-md)]
            hover:border-brand-500
            dark:hover:border-brand-500
            transition-all 
            duration-300 
            ease-out
            will-change-transform
          `}
          style={{
            animationDelay: `${index * 50}ms`,
            animationFillMode: 'forwards',
          }}
        >
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <div
              className={`
                ${isVisible ? 'animate-icon-scale-in' : 'opacity-0 scale-[0.8]'}
              `}
              style={{
                animationDelay: `${index * 50 + 100}ms`,
                animationFillMode: 'forwards',
              }}
            >
              {metric.icon}
            </div>
          </div>

          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {metric.label}
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {metric.value}
              </h4>
            </div>
            {metric.badge}
          </div>
        </div>
      ))}
    </div>
  );
};
