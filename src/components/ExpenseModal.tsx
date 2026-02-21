"use client";

// Modal for adding and editing expenses

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Expense, EXPENSE_CATEGORIES, ExpenseCategory, CATEGORY_ICONS } from "@/lib/types";
import { expensesApi } from "@/lib/api-client";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expense?: Expense | null; // If provided, we're editing
}

export function ExpenseModal({ isOpen, onClose, onSuccess, expense }: ExpenseModalProps) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Food");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Populate form when editing
  useEffect(() => {
    if (expense) {
      setTitle(expense.title);
      setAmount(expense.amount.toString());
      setCategory(expense.category);
      setDate(expense.date);
      setNotes(expense.notes || "");
    } else {
      setTitle("");
      setAmount("");
      setCategory("Food");
      setDate(new Date().toISOString().split("T")[0]);
      setNotes("");
    }
    setError("");
  }, [expense, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = {
        title,
        amount: parseFloat(amount),
        category,
        date,
        notes: notes || undefined,
      };

      if (expense) {
        await expensesApi.update(expense.id, data);
      } else {
        await expensesApi.create(data);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save expense");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const categoryOptions = EXPENSE_CATEGORIES.map((cat) => ({
    value: cat,
    label: `${CATEGORY_ICONS[cat]} ${cat}`,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              {expense ? "Edit Expense" : "Add Expense"}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {expense ? "Update the expense details" : "Track a new expense"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <Input
            label="Title"
            placeholder="e.g., Lunch at restaurant"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={100}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0.01"
              step="0.01"
              icon={<span className="text-sm font-medium">$</span>}
            />

            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            options={categoryOptions}
            required
          />

          <Textarea
            label="Notes (optional)"
            placeholder="Add any additional details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={500}
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={isLoading}
            >
              {expense ? "Update" : "Add Expense"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
