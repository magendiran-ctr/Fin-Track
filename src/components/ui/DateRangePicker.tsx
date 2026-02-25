"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    ChevronDown,
} from "lucide-react";

interface DateRangePickerProps {
    filters: { startDate: string; endDate: string };
    onFilterChange: (filters: { startDate?: string; endDate?: string }) => void;
}

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];
const MONTHS_SHORT = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

type PickerView = "calendar" | "months" | "years";

export function DateRangePicker({ filters, onFilterChange }: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<PickerView>("calendar");
    const [viewDate, setViewDate] = useState(() => new Date(filters.startDate));
    const [selectingEnd, setSelectingEnd] = useState(false);
    const [tempStart, setTempStart] = useState<string>(filters.startDate);
    const [tempEnd, setTempEnd] = useState<string>(filters.endDate);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    // Get calendar grid days
    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const days: { date: number; month: number; year: number; isCurrentMonth: boolean }[] = [];

        // Previous month's trailing days
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({
                date: daysInPrevMonth - i,
                month: month - 1,
                year: month === 0 ? year - 1 : year,
                isCurrentMonth: false,
            });
        }

        // Current month's days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ date: i, month, year, isCurrentMonth: true });
        }

        // Next month's leading days
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({
                date: i,
                month: month + 1,
                year: month === 11 ? year + 1 : year,
                isCurrentMonth: false,
            });
        }

        return days;
    }, [year, month]);

    const toDateStr = (y: number, m: number, d: number) => {
        return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    };

    const isInRange = (dateStr: string) => {
        return dateStr >= tempStart && dateStr <= tempEnd;
    };

    const isStart = (dateStr: string) => dateStr === tempStart;
    const isEnd = (dateStr: string) => dateStr === tempEnd;
    const isToday = (y: number, m: number, d: number) => {
        const today = new Date();
        return y === today.getFullYear() && m === today.getMonth() && d === today.getDate();
    };

    const handleDayClick = (y: number, m: number, d: number) => {
        const dateStr = toDateStr(y, m, d);
        if (!selectingEnd) {
            setTempStart(dateStr);
            setTempEnd(dateStr);
            setSelectingEnd(true);
        } else {
            if (dateStr < tempStart) {
                setTempStart(dateStr);
                setTempEnd(tempStart);
            } else {
                setTempEnd(dateStr);
            }
            setSelectingEnd(false);
        }
    };

    const handleApply = () => {
        onFilterChange({ startDate: tempStart, endDate: tempEnd });
        setIsOpen(false);
        setSelectingEnd(false);
    };


    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

    const handleMonthSelect = (m: number) => {
        setViewDate(new Date(year, m, 1));
        setView("calendar");
    };

    const handleYearSelect = (y: number) => {
        setViewDate(new Date(y, month, 1));
        setView("months");
    };

    // Format display label
    const formatDisplayDate = (dateStr: string) => {
        const d = new Date(dateStr + "T00:00:00");
        return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
    };

    const displayLabel = tempStart === tempEnd
        ? formatDisplayDate(tempStart)
        : `${formatDisplayDate(filters.startDate)} – ${formatDisplayDate(filters.endDate)}`;

    // Year range for year picker
    const yearRange = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years: number[] = [];
        for (let y = currentYear - 5; y <= currentYear + 1; y++) {
            years.push(y);
        }
        return years;
    }, []);

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) {
                        setTempStart(filters.startDate);
                        setTempEnd(filters.endDate);
                        setViewDate(new Date(filters.startDate));
                        setView("calendar");
                        setSelectingEnd(false);
                    }
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-200/50 transition-colors"
            >
                <CalendarIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:inline">
                    {displayLabel}
                </span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 sm:hidden">
                    {MONTHS_SHORT[new Date(filters.startDate).getMonth()]}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Dropdown Calendar */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => { setIsOpen(false); setSelectingEnd(false); }} />
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-2 z-50 w-[320px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 shadow-2xl shadow-slate-900/10 dark:shadow-black/30 overflow-hidden"
                        >

                            {/* Calendar Header */}
                            <div className="flex items-center justify-between px-4 pt-3 pb-2">
                                <button
                                    onClick={prevMonth}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4 text-slate-500" />
                                </button>
                                <button
                                    onClick={() => setView(view === "calendar" ? "months" : view === "months" ? "years" : "calendar")}
                                    className="px-3 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-semibold text-slate-700 dark:text-slate-200"
                                >
                                    {view === "years"
                                        ? `${yearRange[0]} – ${yearRange[yearRange.length - 1]}`
                                        : `${MONTHS[month]} ${year}`}
                                </button>
                                <button
                                    onClick={nextMonth}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4 text-slate-500" />
                                </button>
                            </div>

                            {/* Calendar Body */}
                            <div className="px-3 pb-2">
                                <AnimatePresence mode="wait">
                                    {view === "calendar" && (
                                        <motion.div
                                            key="calendar"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.1 }}
                                        >
                                            {/* Day headers */}
                                            <div className="grid grid-cols-7 mb-1">
                                                {DAYS.map((d) => (
                                                    <div key={d} className="text-center text-[10px] font-semibold text-slate-400 dark:text-slate-500 py-1">
                                                        {d}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Day grid */}
                                            <div className="grid grid-cols-7 gap-px">
                                                {calendarDays.map((day, idx) => {
                                                    const dateStr = toDateStr(day.year, day.month, day.date);
                                                    const inRange = isInRange(dateStr);
                                                    const start = isStart(dateStr);
                                                    const end = isEnd(dateStr);
                                                    const today = isToday(day.year, day.month, day.date);

                                                    return (
                                                        <button
                                                            key={idx}
                                                            onClick={() => handleDayClick(day.year, day.month, day.date)}
                                                            className={`
                                relative w-full aspect-square flex items-center justify-center text-xs font-medium rounded-lg transition-all duration-100
                                ${!day.isCurrentMonth ? "text-slate-300 dark:text-slate-600" : "text-slate-700 dark:text-slate-200"}
                                ${inRange && !start && !end ? "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300" : ""}
                                ${start || end ? "bg-teal-500 text-white shadow-sm shadow-teal-500/30 dark:bg-teal-500" : ""}
                                ${!inRange && day.isCurrentMonth ? "hover:bg-slate-100 dark:hover:bg-slate-800" : ""}
                                ${today && !start && !end ? "ring-1 ring-teal-400 dark:ring-teal-500" : ""}
                              `}
                                                        >
                                                            {day.date}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}

                                    {view === "months" && (
                                        <motion.div
                                            key="months"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.1 }}
                                        >
                                            <div className="grid grid-cols-3 gap-2 py-2">
                                                {MONTHS_SHORT.map((m, idx) => (
                                                    <button
                                                        key={m}
                                                        onClick={() => handleMonthSelect(idx)}
                                                        className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${idx === month
                                                            ? "bg-teal-500 text-white shadow-sm"
                                                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                            }`}
                                                    >
                                                        {m}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {view === "years" && (
                                        <motion.div
                                            key="years"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.1 }}
                                        >
                                            <div className="grid grid-cols-3 gap-2 py-2">
                                                {yearRange.map((y) => (
                                                    <button
                                                        key={y}
                                                        onClick={() => handleYearSelect(y)}
                                                        className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${y === year
                                                            ? "bg-teal-500 text-white shadow-sm"
                                                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                            }`}
                                                    >
                                                        {y}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Footer: selected range + apply */}
                            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    {selectingEnd ? (
                                        <span className="text-teal-600 dark:text-teal-400 font-medium">Select end date…</span>
                                    ) : (
                                        <span>{formatDisplayDate(tempStart)} → {formatDisplayDate(tempEnd)}</span>
                                    )}
                                </div>
                                <button
                                    onClick={handleApply}
                                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-teal-500 text-white hover:bg-teal-600 transition-colors shadow-sm"
                                >
                                    Apply
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
