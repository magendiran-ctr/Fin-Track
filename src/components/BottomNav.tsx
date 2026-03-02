"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Settings,
  Plus
} from "lucide-react";

const navItems = [
  { href: "/?tab=dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/?tab=expenses", label: "Expenses", icon: Receipt },
  { href: "/?tab=analytics", label: "Analytics", icon: PieChart },
  { href: "/?tab=settings", label: "Settings", icon: Settings },
];

export default function BottomNav({ onAddClick }: { onAddClick: () => void }) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "dashboard";

  return (
    <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white dark:bg-slate-900 border-t border-slate-200/50 dark:border-slate-700/50 z-40">
      <div className="flex items-center justify-around h-20 px-4">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.href.includes(`tab=${currentTab}`);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-2xl transition-all"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isActive
                    ? "bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                }`}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
              <span className={`text-xs font-medium ${
                isActive ? "text-teal-600 dark:text-teal-400" : "text-slate-600 dark:text-slate-400"
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
        
        {/* Floating Add Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddClick}
          className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full gradient-primary text-white flex items-center justify-center shadow-xl shadow-teal-500/40"
        >
          <Plus className="w-7 h-7" />
        </motion.button>
      </div>
    </div>
  );
}
