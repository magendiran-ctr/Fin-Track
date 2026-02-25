"use client";

// Expense list with compact search, inline filters, and pagination

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Edit2,
  Trash2,
  Plus,
  Download,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Expense, EXPENSE_CATEGORIES, ExpenseCategory, CATEGORY_COLORS } from "@/lib/types";
import { formatCurrency, formatDate, exportToCSV } from "@/lib/utils";
import { expensesApi } from "@/lib/api-client";

const ITEMS_PER_PAGE = 15;

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onAdd: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export function ExpenseList({ expenses, onEdit, onAdd, onRefresh, isLoading }: ExpenseListProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | "All">("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Apply client-side filters
  const filtered = useMemo(() => {
    const result = expenses.filter((expense) => {
      if (categoryFilter !== "All" && expense.category !== categoryFilter) return false;
      if (startDate && expense.date < startDate) return false;
      if (endDate && expense.date > endDate) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !expense.title.toLowerCase().includes(q) &&
          !expense.category.toLowerCase().includes(q) &&
          !(expense.notes && expense.notes.toLowerCase().includes(q))
        )
          return false;
      }
      return true;
    });
    return result;
  }, [expenses, categoryFilter, startDate, endDate, search]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedExpenses = filtered.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );
  const startItem = filtered.length === 0 ? 0 : (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(safeCurrentPage * ITEMS_PER_PAGE, filtered.length);

  // Reset page when filters change
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };
  const handleCategoryChange = (val: ExpenseCategory | "All") => {
    setCategoryFilter(val);
    setCurrentPage(1);
  };
  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    setCurrentPage(1);
  };
  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    setDeletingId(id);
    try {
      await expensesApi.delete(id);
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete expense");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCSV = () => {
    const csv = exportToCSV(filtered);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const categoryOptions = [
    { value: "All", label: "All Categories" },
    ...EXPENSE_CATEGORIES.map((cat) => ({
      value: cat,
      label: cat,
    })),
  ];

  const hasActiveFilters = search || categoryFilter !== "All" || startDate || endDate;

  // Page numbers to show
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safeCurrentPage > 3) pages.push("...");
      for (let i = Math.max(2, safeCurrentPage - 1); i <= Math.min(totalPages - 1, safeCurrentPage + 1); i++) {
        pages.push(i);
      }
      if (safeCurrentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Expenses</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {filtered.length} of {expenses.length} expenses
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleExportCSV}>
            <Download size={15} />
            Export CSV
          </Button>
          <Button variant="primary" size="sm" onClick={onAdd}>
            <Plus size={15} />
            Add Expense
          </Button>
        </div>
      </motion.div>

      {/* Search + Filter Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card padding="sm">
          <div className="flex items-center gap-2">
            {/* Compact Search */}
            <div className="relative w-48 sm:w-56 flex-shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              />
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Right side: Category dropdown + Filter toggle */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:block w-40">
                <select
                  value={categoryFilter}
                  onChange={(e) => handleCategoryChange(e.target.value as ExpenseCategory | "All")}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${showFilters
                    ? "bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300"
                    : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
              >
                <SlidersHorizontal size={14} />
                <span className="hidden sm:inline">Filters</span>
                {hasActiveFilters && (
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                )}
              </button>
            </div>
          </div>

          {/* Expandable filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 mt-3 border-t border-slate-200 dark:border-slate-700">
                  {/* Category on mobile */}
                  <div className="sm:hidden">
                    <Select
                      value={categoryFilter}
                      onChange={(e) => handleCategoryChange(e.target.value as ExpenseCategory | "All")}
                      options={categoryOptions}
                    />
                  </div>
                  <Input
                    type="date"
                    placeholder="Start date"
                    value={startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                  />
                  <Input
                    type="date"
                    placeholder="End date"
                    value={endDate}
                    onChange={(e) => handleEndDateChange(e.target.value)}
                  />
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCategoryFilter("All");
                        setStartDate("");
                        setEndDate("");
                        setSearch("");
                        setCurrentPage(1);
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Expense List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card padding="none" className="overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-500">Loading expenses...</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                <Filter size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium">No expenses found</p>
              <p className="text-slate-400 text-sm mt-1">
                {expenses.length === 0
                  ? "Add your first expense to get started"
                  : "Try adjusting your filters"}
              </p>
              {expenses.length === 0 && (
                <Button variant="primary" size="sm" className="mt-4" onClick={onAdd}>
                  <Plus size={15} />
                  Add First Expense
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <AnimatePresence>
                  {paginatedExpenses.map((expense, index) => (
                    <motion.div
                      key={expense.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <ExpenseRow
                        expense={expense}
                        onEdit={() => onEdit(expense)}
                        onDelete={() => handleDelete(expense.id)}
                        isDeleting={deletingId === expense.id}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Showing <span className="font-medium text-slate-700 dark:text-slate-200">{startItem}–{endItem}</span> of{" "}
                    <span className="font-medium text-slate-700 dark:text-slate-200">{filtered.length}</span>
                  </p>
                  <div className="flex items-center gap-1">
                    {/* First */}
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={safeCurrentPage === 1}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="First page"
                    >
                      <ChevronsLeft size={16} />
                    </button>
                    {/* Prev */}
                    <button
                      onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
                      disabled={safeCurrentPage === 1}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Previous page"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {/* Page numbers */}
                    {getPageNumbers().map((page, idx) =>
                      page === "..." ? (
                        <span key={`dots-${idx}`} className="px-1 text-xs text-slate-400">…</span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page as number)}
                          className={`min-w-[32px] h-8 rounded-lg text-xs font-medium transition-colors ${safeCurrentPage === page
                              ? "bg-teal-500 text-white shadow-sm"
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                        >
                          {page}
                        </button>
                      )
                    )}

                    {/* Next */}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
                      disabled={safeCurrentPage === totalPages}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Next page"
                    >
                      <ChevronRight size={16} />
                    </button>
                    {/* Last */}
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={safeCurrentPage === totalPages}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Last page"
                    >
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

interface ExpenseRowProps {
  expense: Expense;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

function ExpenseRow({ expense, onEdit, onDelete, isDeleting }: ExpenseRowProps) {
  const color = CATEGORY_COLORS[expense.category];

  return (
    <motion.div
      whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
      className="flex items-center gap-3 px-4 sm:px-6 py-4 transition-colors group"
    >
      {/* Category icon */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ backgroundColor: `${color}15` }}
      >
        <CategoryIcon category={expense.category} size={20} style={{ color }} />
      </motion.div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <p className="font-medium text-slate-800 dark:text-slate-100 truncate text-sm sm:text-base">{expense.title}</p>
          <span
            className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
            style={{
              backgroundColor: `${color}15`,
              color: color,
            }}
          >
            {expense.category}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500">{formatDate(expense.date)}</p>
          <span className="sm:hidden text-[10px] text-slate-400">•</span>
          <span className="sm:hidden text-[10px] font-medium" style={{ color }}>{expense.category}</span>
          {expense.notes && (
            <p className="hidden sm:block text-xs text-slate-400 dark:text-slate-500 truncate">· {expense.notes}</p>
          )}
        </div>
      </div>

      {/* Amount and Actions */}
      <div className="text-right flex-shrink-0">
        <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm sm:text-base">{formatCurrency(expense.amount)}</p>
      </div>

      {/* Actions */}
      <div
        className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onEdit}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          title="Edit"
        >
          <Edit2 size={14} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onDelete}
          disabled={isDeleting}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
          title="Delete"
        >
          {isDeleting ? (
            <div className="w-3.5 h-3.5 border border-red-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 size={14} />
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
