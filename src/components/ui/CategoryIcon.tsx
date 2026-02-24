"use client";

import React from "react";
import * as LucideIcons from "lucide-react";
import { ExpenseCategory, CATEGORY_ICONS } from "@/lib/types";

interface CategoryIconProps {
    category: ExpenseCategory;
    className?: string;
    size?: number;
    style?: React.CSSProperties;
}

export function CategoryIcon({ category, className, size = 18, style }: CategoryIconProps) {
    const iconName = CATEGORY_ICONS[category];
    const IconComponent = (LucideIcons as any)[iconName];

    if (!IconComponent) {
        return <LucideIcons.HelpCircle className={className} size={size} style={style} />;
    }

    return <IconComponent className={className} size={size} style={style} />;
}
