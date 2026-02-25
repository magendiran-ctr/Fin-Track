"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
    User,
    Lock,
    Bell,
    Globe,
    Camera,
    Check,
    Loader2,
    X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";

export function SettingsView() {
    const { user, updateAvatar } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isAvatarSaving, setIsAvatarSaving] = useState(false);
    const [avatarSuccess, setAvatarSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [notifications, setNotifications] = useState({
        daily: true,
        weekly: true,
        login: true,
        offers: false
    });

    const handleToggle = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Avatar handling
    const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            alert("Image must be smaller than 2MB");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleAvatarSave = async () => {
        if (!avatarPreview) return;
        setIsAvatarSaving(true);
        await new Promise(r => setTimeout(r, 800));
        updateAvatar(avatarPreview);
        setIsAvatarSaving(false);
        setAvatarSuccess(true);
        setAvatarPreview(null);
        setTimeout(() => setAvatarSuccess(false), 3000);
    };

    const handleAvatarCancel = () => {
        setAvatarPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const currentAvatar = avatarPreview || user?.avatar || null;

    const sections = [
        {
            title: "Account Information",
            icon: User,
            description: "Manage your personal details and account settings.",
            items: [
                { label: "Full Name", value: user?.name || "User", type: "text" },
                { label: "Email Address", value: user?.email || "user@example.com", type: "text" },
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-outfit">Settings</h2>
                    <p className="text-slate-500 dark:text-slate-400">Manage your account preferences and security.</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="sm:w-32 justify-center"
                >
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : saveSuccess ? (
                        <><Check className="w-4 h-4" /> Saved!</>
                    ) : "Save Changes"}
                </Button>
            </div>

            {/* Profile Image Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass card p-6"
            >
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-teal-500/20 shadow-lg">
                            {currentAvatar ? (
                                <img
                                    src={currentAvatar}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold">
                                    {user?.name?.[0]?.toUpperCase() || "U"}
                                </div>
                            )}
                        </div>
                        {/* Camera edit button */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-teal-500 hover:bg-teal-600 flex items-center justify-center shadow-md transition-colors"
                            title="Change photo"
                        >
                            <Camera className="w-4 h-4 text-white" />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarFileChange}
                        />
                    </div>

                    {/* Info + actions */}
                    <div className="flex-1 text-center sm:text-left">
                        <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">{user?.name || "User"}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                            Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "–"}
                        </p>

                        {/* Preview actions */}
                        {avatarPreview && (
                            <motion.div
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-2 mt-4 justify-center sm:justify-start"
                            >
                                <button
                                    onClick={handleAvatarSave}
                                    disabled={isAvatarSaving}
                                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition-colors disabled:opacity-60"
                                >
                                    {isAvatarSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                    Save Photo
                                </button>
                                <button
                                    onClick={handleAvatarCancel}
                                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
                                >
                                    <X className="w-3.5 h-3.5" />
                                    Cancel
                                </button>
                            </motion.div>
                        )}

                        {avatarSuccess && !avatarPreview && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-xs text-teal-600 dark:text-teal-400 font-medium mt-3"
                            >
                                ✓ Profile photo updated!
                            </motion.p>
                        )}

                        {!avatarPreview && !avatarSuccess && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="mt-3 text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium"
                            >
                                Click the camera icon or here to change photo
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>

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

                {/* Notifications */}
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
                            { id: "daily", label: "Daily Spending Alert" },
                            { id: "weekly", label: "Weekly Summary Report" },
                            { id: "login", label: "New Login Alert" },
                            { id: "offers", label: "Promotional Offers" }
                        ].map((pref) => (
                            <div key={pref.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{pref.label}</span>
                                <div
                                    onClick={() => handleToggle(pref.id as keyof typeof notifications)}
                                    className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${notifications[pref.id as keyof typeof notifications] ? "bg-teal-500" : "bg-slate-300 dark:bg-slate-700"}`}
                                >
                                    <motion.div
                                        animate={{ x: notifications[pref.id as keyof typeof notifications] ? 20 : 2 }}
                                        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

