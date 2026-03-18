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

const isValidDateString = (value: string) => {
    if (!value) return false;
    const date = new Date(`${value}T00:00:00`);
    return !Number.isNaN(date.getTime());
};

const toTodayDateStr = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

const formatDisplayDate = (dateStr: string) => {
    if (!isValidDateString(dateStr)) return "Select date";
    const d = new Date(`${dateStr}T00:00:00`);
    return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
};

export function DateRangePicker({ filters, onFilterChange }: DateRangePickerProps) {
    const safeStart = isValidDateString(filters.startDate) ? filters.startDate : "";
    const safeEnd = isValidDateString(filters.endDate) ? filters.endDate : "";
    const initialDateForCalendar = safeStart || safeEnd || toTodayDateStr();

    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<PickerView>("calendar");
    const [viewDate, setViewDate] = useState(() => new Date(`${initialDateForCalendar}T00:00:00`));
    const [selectingEnd, setSelectingEnd] = useState(false);
    const [tempStart, setTempStart] = useState<string>(safeStart);
    const [tempEnd, setTempEnd] = useState<string>(safeEnd);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        const days: { date: number; month: number; year: number; isCurrentMonth: boolean }[] = [];

        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({ date: daysInPrevMonth - i, month: month - 1, year: month === 0 ? year - 1 : year, isCurrentMonth: false });
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ date: i, month, year, isCurrentMonth: true });
        }
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ date: i, month: month + 1, year: month === 11 ? year + 1 : year, isCurrentMonth: false });
        }
        return days;
    }, [year, month]);

    const toDateStr = (y: number, m: number, d: number) =>
        `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    const isInRange = (dateStr: string) => {
        if (!tempStart || !tempEnd) return false;
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

    const handleClear = () => {
        setTempStart("");
        setTempEnd("");
        onFilterChange({ startDate: "", endDate: "" });
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

    const displayLabel = !safeStart && !safeEnd
        ? "All time"
        : safeStart === safeEnd
            ? formatDisplayDate(safeStart)
            : `${formatDisplayDate(safeStart)} - ${formatDisplayDate(safeEnd)}`;

    const yearRange = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years: number[] = [];
        for (let y = currentYear - 5; y <= currentYear + 1; y++) years.push(y);
        return years;
    }, []);

    return (
        <div className="relative">
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) {
                        const nextStart = isValidDateString(filters.startDate) ? filters.startDate : "";
                        const nextEnd = isValidDateString(filters.endDate) ? filters.endDate : "";
                        const openDate = nextStart || nextEnd || toTodayDateStr();
                        setTempStart(nextStart);
                        setTempEnd(nextEnd);
                        setViewDate(new Date(`${openDate}T00:00:00`));
                        setView("calendar");
                        setSelectingEnd(false);
                    }
                }}
                className="flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-200/50 transition-colors"
            >
                <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600 dark:text-teal-400" />
                <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
                    {displayLabel}
                </span>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40 bg-black/10 sm:bg-transparent" onClick={() => { setIsOpen(false); setSelectingEnd(false); }} />
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="fixed left-2 right-2 top-16 z-50 sm:absolute sm:left-auto sm:top-auto sm:right-0 sm:mt-2 w-auto sm:w-[280px] rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 shadow-2xl shadow-slate-900/10 dark:shadow-black/30 overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5">
                                <button
                                    onClick={prevMonth}
                                    className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
                                </button>
                                <button
                                    onClick={() => setView(view === "calendar" ? "months" : view === "months" ? "years" : "calendar")}
                                    className="px-2 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-semibold text-slate-700 dark:text-slate-200"
                                >
                                    {view === "years"
                                        ? `${yearRange[0]} - ${yearRange[yearRange.length - 1]}`
                                        : `${MONTHS[month]} ${year}`}
                                </button>
                                <button
                                    onClick={nextMonth}
                                    className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                                </button>
                            </div>

                            <div className="px-2.5 pb-1.5">
                                <AnimatePresence mode="wait">
                                    {view === "calendar" && (
                                        <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
                                            <div className="grid grid-cols-7 mb-0.5">
                                                {DAYS.map((d) => (
                                                    <div key={d} className="text-center text-[9px] font-semibold text-slate-400 dark:text-slate-500 py-0.5">
                                                        {d}
                                                    </div>
                                                ))}
                                            </div>
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
                                                                w-full aspect-square flex items-center justify-center text-[11px] font-medium rounded-md transition-all duration-100
                                                                ${!day.isCurrentMonth ? "text-slate-300 dark:text-slate-600" : "text-slate-700 dark:text-slate-200"}
                                                                ${inRange && !start && !end ? "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300" : ""}
                                                                ${start || end ? "bg-teal-500 text-white shadow-sm shadow-teal-500/30" : ""}
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
                                        <motion.div key="months" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
                                            <div className="grid grid-cols-3 gap-1.5 py-1.5">
                                                {MONTHS_SHORT.map((m, idx) => (
                                                    <button
                                                        key={m}
                                                        onClick={() => handleMonthSelect(idx)}
                                                        className={`py-2 rounded-md text-xs font-medium transition-colors ${idx === month ? "bg-teal-500 text-white shadow-sm" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                            }`}
                                                    >
                                                        {m}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {view === "years" && (
                                        <motion.div key="years" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
                                            <div className="grid grid-cols-3 gap-1.5 py-1.5">
                                                {yearRange.map((y) => (
                                                    <button
                                                        key={y}
                                                        onClick={() => handleYearSelect(y)}
                                                        className={`py-2 rounded-md text-xs font-medium transition-colors ${y === year ? "bg-teal-500 text-white shadow-sm" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
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

                            <div className="flex items-center justify-between px-3 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                    {selectingEnd ? (
                                        <span className="text-teal-600 dark:text-teal-400 font-medium">Select end date...</span>
                                    ) : (
                                        tempStart && tempEnd ? (
                                            <span>{formatDisplayDate(tempStart)} -&gt; {formatDisplayDate(tempEnd)}</span>
                                        ) : (
                                            <span>All time</span>
                                        )
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={handleClear}
                                        className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
                                    >
                                        Clear
                                    </button>
                                    <button
                                        onClick={handleApply}
                                        className="px-3 py-1 rounded-md text-[10px] font-semibold bg-teal-500 text-white hover:bg-teal-600 transition-colors shadow-sm"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
