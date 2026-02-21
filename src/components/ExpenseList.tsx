"use client";

// Expense list with filters and actions - Fintech-inspired design

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Edit2, Trash2, Plus, Download, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ExpenseItemSkeleton } from "@/components/ui/Skeleton";
import { Expense, EXPENSE_CATEGORIES, ExpenseCategory, CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/types";
import { formatCurrency, formatDate, exportToCSV } from "@/lib/utils";
import { expensesApi } from "@/lib/api-client";

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

  // Apply client-side filters
  const filtered = expenses.filter((expense) => {
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
      label: `${CATEGORY_ICONS[cat]} ${cat}`,
    })),
  ];

  const hasActiveFilters = search || categoryFilter !== "All" || startDate || endDate;

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

      {/* Filters toggle and search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card padding="sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              />
            </div>
            <Button
              variant={showFilters ? "primary" : "secondary"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "" : "sm:hidden"}
            >
              <SlidersHorizontal size={15} />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 w-2 h-2 rounded-full bg-teal-500" />
              )}
            </Button>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 mt-3 border-t border-slate-200 dark:border-slate-700">
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as ExpenseCategory | "All")}
                    options={categoryOptions}
                  />
                  <Input
                    type="date"
                    placeholder="Start date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <Input
                    type="date"
                    placeholder="End date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  {(hasActiveFilters) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCategoryFilter("All");
                        setStartDate("");
                        setEndDate("");
                        setSearch("");
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
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <AnimatePresence>
                {filtered.map((expense, index) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.03 }}
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
      className="flex items-center gap-4 px-6 py-4 transition-colors group"
    >
      {/* Category icon */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ backgroundColor: `${color}15` }}
      >
        <span style={{ color }}>{CATEGORY_ICONS[expense.category]}</span>
      </motion.div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-slate-800 dark:text-slate-100 truncate">{expense.title}</p>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
            style={{
              backgroundColor: `${color}15`,
              color: color,
            }}
          >
            {expense.category}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs text-slate-400 dark:text-slate-500">{formatDate(expense.date)}</p>
          {expense.notes && (
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate">· {expense.notes}</p>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <p className="font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(expense.amount)}</p>
      </div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
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
      </motion.div>
    </motion.div>
  );
}
