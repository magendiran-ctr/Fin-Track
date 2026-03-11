"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    Lock,
    Bell,
    Globe,
    Camera,
    Check,
    Loader2,
    X,
    Eye,
    EyeOff,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";

export function SettingsView() {
    const { user, updateAvatar, updateProfile } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isAvatarSaving, setIsAvatarSaving] = useState(false);
    const [avatarSuccess, setAvatarSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Modal states
    const [activeModal, setActiveModal] = useState<"profile" | "security" | "preferences" | null>(null);

    // Profile form state
    const [profileForm, setProfileForm] = useState({
        name: user?.name || "",
        email: user?.email || "",
    });
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState(false);

    // Security form state
    const [securityForm, setSecurityForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        twoFactorEnabled: false,
    });
    const [securitySaving, setSecuritySaving] = useState(false);
    const [securitySuccess, setSecuritySuccess] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    // Preferences form state
    const [preferences, setPreferences] = useState({
        currency: "INR",
        language: "en-US",
        theme: "light",
        dateFormat: "DD/MM/YYYY",
    });
    const [preferencesSaving, setPreferencesSaving] = useState(false);
    const [preferencesSuccess, setPreferencesSuccess] = useState(false);

    // Notification preferences
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
        try {
            await updateAvatar(avatarPreview);
            setAvatarSuccess(true);
            setAvatarPreview(null);
            setTimeout(() => setAvatarSuccess(false), 3000);
        } catch (error: any) {
            alert(error?.message || "Failed to update profile photo");
        } finally {
            setIsAvatarSaving(false);
        }
    };

    const handleAvatarCancel = () => {
        setAvatarPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    useEffect(() => {
        setProfileForm({
            name: user?.name || "",
            email: user?.email || "",
        });
    }, [user]);

    // Profile update handler
    const handleProfileUpdate = async () => {
        const trimmedName = profileForm.name.trim();
        const trimmedEmail = profileForm.email.trim();

        if (!trimmedName || !trimmedEmail) {
            alert("Name and email are required");
            return;
        }

        setProfileSaving(true);
        try {
            const updated = await updateProfile({ name: trimmedName, email: trimmedEmail });
            setProfileForm({ name: updated.name, email: updated.email });
            setProfileSuccess(true);
            setTimeout(() => {
                setProfileSuccess(false);
                setActiveModal(null);
            }, 1500);
        } catch (error: any) {
            alert(error?.message || "Failed to update profile");
        } finally {
            setProfileSaving(false);
        }
    };

    // Security update handler
    const handleSecurityUpdate = async () => {
        if (!securityForm.currentPassword) {
            alert("Current password is required");
            return;
        }
        if (securityForm.newPassword && securityForm.newPassword !== securityForm.confirmPassword) {
            alert("New passwords don't match");
            return;
        }
        setSecuritySaving(true);
        await new Promise(r => setTimeout(r, 1500));
        setSecuritySaving(false);
        setSecuritySuccess(true);
        setTimeout(() => {
            setSecuritySuccess(false);
            setSecurityForm({ currentPassword: "", newPassword: "", confirmPassword: "", twoFactorEnabled: false });
            setActiveModal(null);
        }, 2000);
    };

    // Preferences save handler
    const handlePreferencesSave = async () => {
        setPreferencesSaving(true);
        await new Promise(r => setTimeout(r, 1500));
        setPreferencesSaving(false);
        setPreferencesSuccess(true);
        setTimeout(() => {
            setPreferencesSuccess(false);
            setActiveModal(null);
        }, 2000);
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
            action: "Update Profile",
            modal: "profile" as const,
        },
        {
            title: "Security",
            icon: Lock,
            description: "Keep your account secure with a strong password and 2FA.",
            action: "Manage Security",
            modal: "security" as const,
        },
        {
            title: "Preferences",
            icon: Globe,
            description: "Set your preferred currency and language.",
            action: "Save Preferences",
            modal: "preferences" as const,
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                        <Button 
                            variant="secondary" 
                            className="w-full justify-center"
                            onClick={() => setActiveModal(section.modal)}
                        >
                            {section.action}
                        </Button>
                    </motion.div>
                ))}

                {/* Notifications */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass card p-6 md:col-span-2 lg:col-span-3"
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

            {/* Modals */}
            <AnimatePresence>
                {/* Profile Update Modal */}
                {activeModal === "profile" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setActiveModal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Update Profile</h3>
                                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                                    <input
                                        type="text"
                                        value={profileForm.name}
                                        onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                                        className="w-full mt-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                                    <input
                                        type="email"
                                        value={profileForm.email}
                                        onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                                        className="w-full mt-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                                    />
                                </div>
                            </div>

                            {profileSuccess && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-sm text-teal-600 dark:text-teal-400 font-medium flex items-center gap-2"
                                >
                                    <Check className="w-4 h-4" /> Profile updated successfully!
                                </motion.p>
                            )}

                            <div className="flex gap-3 pt-4">
                                <Button
                                    onClick={() => setActiveModal(null)}
                                    variant="secondary"
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleProfileUpdate}
                                    disabled={profileSaving}
                                    className="flex-1 justify-center"
                                >
                                    {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Security Update Modal */}
                {activeModal === "security" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setActiveModal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 max-h-96 overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Manage Security</h3>
                                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</label>
                                    <div className="relative mt-1">
                                        <input
                                            type={showPasswords.current ? "text" : "password"}
                                            value={securityForm.currentPassword}
                                            onChange={(e) => setSecurityForm({...securityForm, currentPassword: e.target.value})}
                                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                                        />
                                        <button
                                            onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                                            className="absolute right-3 top-2.5 text-slate-400"
                                        >
                                            {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                                    <div className="relative mt-1">
                                        <input
                                            type={showPasswords.new ? "text" : "password"}
                                            value={securityForm.newPassword}
                                            onChange={(e) => setSecurityForm({...securityForm, newPassword: e.target.value})}
                                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                                        />
                                        <button
                                            onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                                            className="absolute right-3 top-2.5 text-slate-400"
                                        >
                                            {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
                                    <div className="relative mt-1">
                                        <input
                                            type={showPasswords.confirm ? "text" : "password"}
                                            value={securityForm.confirmPassword}
                                            onChange={(e) => setSecurityForm({...securityForm, confirmPassword: e.target.value})}
                                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                                        />
                                        <button
                                            onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                                            className="absolute right-3 top-2.5 text-slate-400"
                                        >
                                            {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Two-Factor Authentication</span>
                                    <div
                                        onClick={() => setSecurityForm({...securityForm, twoFactorEnabled: !securityForm.twoFactorEnabled})}
                                        className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${securityForm.twoFactorEnabled ? "bg-teal-500" : "bg-slate-300 dark:bg-slate-700"}`}
                                    >
                                        <motion.div
                                            animate={{ x: securityForm.twoFactorEnabled ? 20 : 2 }}
                                            className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {securitySuccess && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-sm text-teal-600 dark:text-teal-400 font-medium flex items-center gap-2"
                                >
                                    <Check className="w-4 h-4" /> Security settings updated!
                                </motion.p>
                            )}

                            <div className="flex gap-3 pt-4">
                                <Button
                                    onClick={() => setActiveModal(null)}
                                    variant="secondary"
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSecurityUpdate}
                                    disabled={securitySaving}
                                    className="flex-1 justify-center"
                                >
                                    {securitySaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Security"}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Preferences Modal */}
                {activeModal === "preferences" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setActiveModal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Save Preferences</h3>
                                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Currency</label>
                                    <select
                                        value={preferences.currency}
                                        onChange={(e) => setPreferences({...preferences, currency: e.target.value})}
                                        className="w-full mt-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                                    >
                                        <option value="INR">Indian Rupee (₹)</option>
                                        <option value="USD">US Dollar ($)</option>
                                        <option value="EUR">Euro (€)</option>
                                        <option value="GBP">British Pound (£)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Language</label>
                                    <select
                                        value={preferences.language}
                                        onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                                        className="w-full mt-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                                    >
                                        <option value="en-US">English (US)</option>
                                        <option value="en-IN">English (India)</option>
                                        <option value="hi-IN">Hindi</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date Format</label>
                                    <select
                                        value={preferences.dateFormat}
                                        onChange={(e) => setPreferences({...preferences, dateFormat: e.target.value})}
                                        className="w-full mt-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                                    >
                                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Theme</label>
                                    <select
                                        value={preferences.theme}
                                        onChange={(e) => setPreferences({...preferences, theme: e.target.value})}
                                        className="w-full mt-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                                    >
                                        <option value="light">Light</option>
                                        <option value="dark">Dark</option>
                                        <option value="auto">Auto</option>
                                    </select>
                                </div>
                            </div>

                            {preferencesSuccess && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-sm text-teal-600 dark:text-teal-400 font-medium flex items-center gap-2"
                                >
                                    <Check className="w-4 h-4" /> Preferences saved successfully!
                                </motion.p>
                            )}

                            <div className="flex gap-3 pt-4">
                                <Button
                                    onClick={() => setActiveModal(null)}
                                    variant="secondary"
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handlePreferencesSave}
                                    disabled={preferencesSaving}
                                    className="flex-1 justify-center"
                                >
                                    {preferencesSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Preferences"}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

