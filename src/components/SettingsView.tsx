"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    User,
    Lock,
    Bell,
    Globe,
    Shield,
    Smartphone,
    Check
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";

export function SettingsView() {
    const { user } = useAuth();

    const sections = [
        {
            title: "Account Information",
            icon: User,
            description: "Manage your personal details and account settings.",
            items: [
                { label: "Email Address", value: user?.email || "user@example.com", type: "text" },
                { label: "Username", value: user?.email?.split("@")[0] || "user", type: "text" },
            ],
            action: "Update Profile"
        },
        {
            title: "Security",
            icon: Lock,
            description: "Keep your account secure with a strong password and 2FA.",
            items: [
                { label: "Password", value: "••••••••••••", type: "password" },
                { label: "Two-Factor Auth", value: "Disabled", type: "status" },
            ],
            action: "Manage Security"
        },
        {
            title: "Preferences",
            icon: Globe,
            description: "Set your preferred currency and language.",
            items: [
                { label: "Currency", value: "Indian Rupee (₹)", type: "select" },
                { label: "Language", value: "English (US)", type: "select" },
            ],
            action: "Save Preferences"
        }
    ];

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-outfit">Settings</h2>
                <p className="text-slate-500 dark:text-slate-400">Manage your account preferences and security.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map((section, idx) => (
                    <motion.div
                        key={section.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass card p-6 flex flex-col h-full"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
                                <section.icon className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100">{section.title}</h3>
                        </div>

                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-grow">
                            {section.description}
                        </p>

                        <div className="space-y-4 mb-6">
                            {section.items.map((item) => (
                                <div key={item.label} className="flex flex-col gap-1">
                                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                        {item.label}
                                    </span>
                                    <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <Button variant="secondary" className="w-full justify-center">
                            {section.action}
                        </Button>
                    </motion.div>
                ))}

                {/* Notifications Mockup */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass card p-6 md:col-span-2"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Notifications</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Manage how you receive updates and reports.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            "Daily Spending Alert",
                            "Weekly Summary Report",
                            "New Login Alert",
                            "Promotional Offers"
                        ].map((pref) => (
                            <div key={pref} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{pref}</span>
                                <div className="w-10 h-5 bg-teal-500 rounded-full relative cursor-pointer">
                                    <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-all" />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
