"use client";

import React from "react";
import { motion } from "framer-motion";

interface LogoProps {
    className?: string;
    size?: "sm" | "md" | "lg" | number;
    showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = "md", showText = false }) => {
    const getLogoSize = () => {
        if (typeof size === "number") return size;
        switch (size) {
            case "sm": return 32;
            case "lg": return 48;
            default: return 40;
        }
    };

    const finalSize = getLogoSize();

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ width: finalSize, height: finalSize }}
                className="relative flex-shrink-0"
            >
                {/* Modern Logo Background */}
                <div className="absolute inset-0 rounded-xl gradient-primary shadow-lg shadow-teal-500/25 flex items-center justify-center overflow-hidden">
                    {/* Decorative accent */}
                    <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-white/10 rounded-full blur-2xl" />

                    {/* FT Monogram inspired by user images */}
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="w-3/5 h-3/5 text-white drop-shadow-sm transition-transform duration-300 group-hover:scale-110"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M4 6V8M4 8V18M4 8H12M12 8V10M12 8H18"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M10 12H4"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        {/* The "T" bar extension */}
                        <path
                            d="M14 6L14 18"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M11 6H17"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </motion.div>

            {showText && (
                <div className="flex flex-col leading-tight">
                    <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white uppercase">
                        Fin <span className="text-teal-600 dark:text-teal-400">Tracker</span>
                    </span>
                </div>
            )}
        </div>
    );
};
