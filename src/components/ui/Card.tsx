import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({ children, className = "", padding = "md" }: CardProps) {
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color?: "green" | "blue" | "purple" | "orange" | "red";
}

export function StatCard({ title, value, subtitle, icon, trend, color = "green" }: StatCardProps) {
  const colors = {
    green: "from-emerald-500 to-teal-600",
    blue: "from-blue-500 to-indigo-600",
    purple: "from-purple-500 to-violet-600",
    orange: "from-orange-400 to-amber-500",
    red: "from-red-500 to-rose-600",
  };

  const bgColors = {
    green: "bg-emerald-50",
    blue: "bg-blue-50",
    purple: "bg-purple-50",
    orange: "bg-orange-50",
    red: "bg-red-50",
  };

  const textColors = {
    green: "text-emerald-600",
    blue: "text-blue-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
    red: "text-red-600",
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 h-full relative">
      {/* Desktop icon - positioned top right */}
      <div
        className={`hidden sm:flex w-10 h-10 rounded-xl ${bgColors[color]} ${textColors[color]} items-center justify-center absolute top-4 right-4`}
      >
        {icon}
      </div>
      {/* Mobile: icon + text in a row */}
      <div className="flex items-center gap-3 sm:hidden">
        <div
          className={`w-9 h-9 rounded-xl ${bgColors[color]} ${textColors[color]} flex items-center justify-center flex-shrink-0`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 leading-tight">{title}</p>
          <p className="text-base font-bold text-slate-800 mt-0.5 break-words leading-snug">{value}</p>
        </div>
      </div>
      {/* Desktop: stacked text */}
      <div className="hidden sm:block sm:pr-14">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-800 mt-1 break-words leading-snug">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <span
              className={`text-xs font-medium ${trend.value >= 0 ? "text-emerald-600" : "text-red-500"
                }`}
            >
              {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-slate-400">{trend.label}</span>
          </div>
        )}
      </div>
    </Card>
  );
}

