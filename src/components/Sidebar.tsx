"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Settings,
  LogOut,
  Menu,
  X,
  Wallet,
  IndianRupee
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/?tab=expenses", label: "Expenses", icon: IndianRupee },
  { href: "/?tab=analytics", label: "Analytics", icon: PieChart },
  { href: "/?tab=settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export default function Sidebar({ isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname + "?tab=" === href.split("?")[1]?.split("=")[1] ? pathname : false;
  };

  return (
    <>

      {/* Sidebar backdrop for mobile */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isMobileOpen ? 0 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-r border-slate-200/50 dark:border-slate-700/50 z-40 
          ${isMobileOpen ? "translate-x-0" : "hidden lg:flex"} flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Fin-Track</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isItemActive = pathname === "/" && item.href === "/"
              ? pathname === "/"
              : pathname === item.href.split("?")[0];

            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  onMouseEnter={() => setIsHovered(item.href)}
                  onMouseLeave={() => setIsHovered(null)}
                  className={`sidebar-link flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${isItemActive
                      ? "bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 text-teal-700 dark:text-teal-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                    }
                    ${isItemActive ? "active" : ""}
                  `}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className={`w-5 h-5 transition-colors ${isItemActive ? "text-teal-600 dark:text-teal-400" : "group-hover:text-teal-600 dark:group-hover:text-teal-400"}`} />
                  </motion.div>
                  <span className="font-medium">{item.label}</span>

                  {/* Active indicator */}
                  {isItemActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="ml-auto w-2 h-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500"
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-3 p-3 rounded-xl glass mb-3">
            <div className="w-10 h-10 rounded-full gradient-secondary flex items-center justify-center text-white font-semibold">
              {user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                {user?.email || "User"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Free Plan
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
