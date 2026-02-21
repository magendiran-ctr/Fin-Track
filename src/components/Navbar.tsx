"use client";

// Top navigation bar

import React, { useState } from "react";
import { LogOut, User, TrendingUp, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";

interface NavbarProps {
  activeTab: "dashboard" | "expenses" | "analytics";
  onTabChange: (tab: "dashboard" | "expenses" | "analytics") => void;
}

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: "dashboard" as const, label: "Dashboard" },
    { id: "expenses" as const, label: "Expenses" },
    { id: "analytics" as const, label: "Analytics" },
  ];

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <TrendingUp size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-800 text-lg">ExpenseIQ</span>
          </div>

          {/* Desktop tabs */}
          <div className="hidden sm:flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* User menu */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
                <User size={14} className="text-slate-600" />
              </div>
              <span className="text-sm font-medium text-slate-700">{user?.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="hidden sm:flex">
              <LogOut size={15} />
              Logout
            </Button>

            {/* Mobile menu button */}
            <button
              className="sm:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-100 py-3 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
            <div className="pt-2 border-t border-slate-100 mt-2 flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center">
                  <User size={13} className="text-slate-600" />
                </div>
                <span className="text-sm text-slate-700">{user?.name}</span>
              </div>
              <button
                onClick={logout}
                className="text-sm text-red-500 hover:text-red-600 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
