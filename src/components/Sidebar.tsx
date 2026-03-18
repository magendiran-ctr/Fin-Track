"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  PieChart,
  Settings,
  LogOut,
  IndianRupee,
  CreditCard,
  Plus
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/?tab=dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/?tab=expenses", label: "Expenses", icon: IndianRupee },
  { href: "/?tab=analytics", label: "Analytics", icon: PieChart },
  { href: "/?tab=reports", label: "Reports", icon: CreditCard },
  { href: "/?tab=subscription", label: "Subscription", icon: CreditCard },
  { href: "/?tab=settings", label: "Settings", icon: Settings }
];

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export default function Sidebar({ isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const currentTab = searchParams.get("tab") || "dashboard";

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
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className={`fixed top-0 left-0 h-full w-[280px] bg-[#3E5251] text-white z-40 shadow-xl shadow-black/20 lg:rounded-r-[3rem] overflow-visible
          ${isMobileOpen ? "translate-x-0" : "hidden lg:flex"} flex flex-col py-10`}
      >
        {/* Profile header */}
        <div className="flex flex-col items-center mt-2 mb-12 text-center">
          <div className="relative w-[84px] h-[84px] rounded-full border-[3px] border-[#E5B842] p-1 mb-4">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#3E5251] flex items-center justify-center">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {user?.email?.[0]?.toUpperCase() || "U"}
                </span>
              )}
            </div>
          </div>
          <div className="px-4">
            <h2 className="text-[15px] font-bold text-white uppercase tracking-[0.1em]">
              {user?.name || "Alex Johnson"}
            </h2>
            <p className="text-[11px] text-[#A1B5B3] mt-1.5 font-medium tracking-wide">
              {user?.email || "alex.johnson@gmail.com"}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 w-full relative z-10">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const tabParam = new URLSearchParams(item.href.split("?")[1] || "").get("tab");
            const isItemActive = tabParam === currentTab;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`relative flex items-center gap-5 py-3.5 pl-6 ml-10 transition-all duration-300 group
                  ${isItemActive
                    ? "bg-[#E0F0E9] text-[#3E5251] rounded-l-full lg:rounded-r-none rounded-r-full"
                    : "text-white/80 hover:bg-white/5 rounded-l-full lg:rounded-r-none rounded-r-full hover:text-white"
                  }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isItemActive ? "text-[#3E5251]" : "text-[#E5B842] opacity-80 group-hover:opacity-100"}`} />
                <span className="text-[11px] font-bold tracking-[0.15em] uppercase mt-[2px]">
                  {item.label}
                </span>

                {/* Active extension with inverse curves */}
                {isItemActive && (
                  <div className="absolute top-0 -right-[1px] bottom-0 w-[24px]">
                    <div className="absolute inset-0 bg-[#E0F0E9] w-[26px]" />
                    {/* Top inner-curve */}
                    <div className="absolute -top-[24px] right-0 w-[24px] h-[24px] overflow-hidden pointer-events-none">
                      <div className="absolute inset-0 bg-[#E0F0E9]"></div>
                      <div className="absolute inset-0 bg-[#3E5251] rounded-br-[24px]"></div>
                    </div>
                    {/* Bottom inner-curve */}
                    <div className="absolute -bottom-[24px] right-0 w-[24px] h-[24px] overflow-hidden pointer-events-none">
                      <div className="absolute inset-0 bg-[#E0F0E9]"></div>
                      <div className="absolute inset-0 bg-[#3E5251] rounded-tr-[24px]"></div>
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick actions & Logout at bottom styled uniformly */}
        <div className="mt-auto pt-8 flex flex-col gap-3 w-full relative z-10 pb-4">
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-expense-modal'));
              setIsMobileOpen(false);
            }}
            className="relative flex items-center gap-5 py-3.5 pl-6 ml-10 text-white/80 hover:bg-white/5 rounded-l-full lg:rounded-r-none rounded-r-full hover:text-white group transition-all w-[calc(100%-40px)]"
          >
            <Plus className="w-5 h-5 text-[#E5B842] opacity-80 group-hover:opacity-100" />
            <span className="text-[11px] font-bold tracking-[0.15em] uppercase mt-[2px]">Add Expense</span>
          </button>

          <button
            onClick={() => {
              logout();
              setIsMobileOpen(false);
            }}
            className="relative flex items-center gap-5 py-3.5 pl-6 ml-10 text-white/80 hover:bg-white/5 rounded-l-full lg:rounded-r-none rounded-r-full hover:text-white group transition-all w-[calc(100%-40px)]"
          >
            <LogOut className="w-5 h-5 text-[#E5B842] opacity-80 group-hover:opacity-100" />
            <span className="text-[11px] font-bold tracking-[0.15em] uppercase mt-[2px]">Logout</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
