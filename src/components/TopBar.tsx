"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Moon,
  Sun,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  TrendingUp,
  Plus,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

interface TopBarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  filters: { startDate: string; endDate: string };
  onFilterChange: (filters: { startDate?: string; endDate?: string }) => void;
}

export default function TopBar({
  isMobileOpen,
  setIsMobileOpen,
  filters,
  onFilterChange
}: TopBarProps) {
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="sticky top-0 z-30 glass border-b border-slate-200/50 dark:border-slate-700/50">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6 gap-3">
        {/* Mobile menu toggle */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors btn-press"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Dashboard Greeting */}
        <div className="hidden md:flex items-center gap-3 flex-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-sm">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-none">
                Welcome back, {user?.name?.split(" ")[0] || "there"} 👋
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} · Fin Tracker
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Date Range Picker */}
          <DateRangePicker filters={filters} onFilterChange={onFilterChange} />

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1 pl-1 pr-2 rounded-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-200/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden gradient-primary flex items-center justify-center text-white font-bold text-xs">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.name?.[0].toUpperCase() || "U"}</span>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            <AnimatePresence>
              {showUserDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserDropdown(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-56 rounded-xl glass card p-2 z-50 shadow-xl border border-slate-200/50 dark:border-slate-700/50"
                  >
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user?.name || "User"}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowProfileModal(true);
                        setShowUserDropdown(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <UserIcon className="w-4 h-4" />
                      View Profile
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserDropdown(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileModal(false)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm glass card shadow-2xl rounded-2xl overflow-hidden bg-white dark:bg-slate-900"
            >
              {/* Header */}
              <div className="relative h-24 gradient-primary">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Avatar */}
              <div className="absolute top-12 left-1/2 -translate-x-1/2">
                <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-800 flex items-center justify-center shadow-lg overflow-hidden gradient-secondary text-white text-3xl font-bold">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span>{user?.name?.[0].toUpperCase() || "U"}</span>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="pt-14 pb-6 px-6 text-center">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                  {user?.name || "User"}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  {user?.email}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <UserIcon className="w-4 h-4" /> Account Type
                    </span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Free Plan
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Member Since
                    </span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowProfileModal(false)}
                  className="w-full mt-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
