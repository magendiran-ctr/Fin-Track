"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  FileText,
  FileSpreadsheet,
  File as FileIcon,
  ChevronDown,
  Receipt,
  TrendingUp,
  CheckCircle2
} from "lucide-react";
import { Expense, AnalyticsSummary } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

interface ReportsViewProps {
  expenses: Expense[];
  analytics: AnalyticsSummary | null;
}

export function ReportsView({ expenses, analytics }: ReportsViewProps) {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [autoTablePlugin, setAutoTablePlugin] = useState<any>(null);

  // Dynamically load jspdf-autotable on the client to avoid bundling issues
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("jspdf-autotable").then((module) => {
        setAutoTablePlugin(() => module.default || module);
      }).catch(err => console.error("Failed to load jspdf-autotable:", err));
    }
  }, []);

  const reportStats = {
    totalSpent: analytics?.totalAmount || 0,
    totalTransactions: analytics?.totalExpenses || expenses.length,
    averageExpense: analytics?.averageExpense || 0,
    topCategory: analytics?.topCategory || "N/A",
  };

  const insights = [
    `You recorded ${reportStats.totalTransactions} transactions in the selected period.`,
    reportStats.topCategory !== "N/A"
      ? `Your highest spending category is ${reportStats.topCategory}.`
      : "No dominant category yet. Add more expenses for stronger insights.",
    reportStats.averageExpense > 0
      ? `Your average expense is ${formatCurrency(reportStats.averageExpense)} per transaction.`
      : "Average expense will appear after your first transaction.",
  ];

  const recommendations = [
    "Set a monthly cap for your top category to keep spending controlled.",
    "Review recurring payments weekly and cancel unused subscriptions.",
    "Track daily expenses consistently to improve next month’s forecast.",
  ];

  const handleExportCSV = () => {
    setIsExporting("csv");
    try {
      const headers = ["Date", "Description", "Category", "Amount"];
      const rows = expenses.map(e => [
        new Date(e.date).toLocaleDateString("en-IN"),
        e.title,
        e.category,
        e.amount.toString()
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `expenses_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("CSV Export failed:", error);
    } finally {
      setTimeout(() => setIsExporting(null), 1000);
      setShowExportMenu(false);
    }
  };

  const handleExportExcel = () => {
    setIsExporting("excel");
    try {
      const data = expenses.map(e => ({
        Date: new Date(e.date).toLocaleDateString("en-IN"),
        Description: e.title,
        Category: e.category,
        Amount: e.amount
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");

      // Auto-size columns
      const maxWidths = data.reduce((acc, row) => {
        Object.keys(row).forEach((key, i) => {
          const val = String(row[key as keyof typeof row]);
          acc[i] = Math.max(acc[i] || 0, val.length, key.length);
        });
        return acc;
      }, [] as number[]);
      worksheet["!cols"] = maxWidths.map(w => ({ wch: w + 2 }));

      XLSX.writeFile(workbook, `expenses_report_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error("Excel Export failed:", error);
    } finally {
      setTimeout(() => setIsExporting(null), 1000);
      setShowExportMenu(false);
    }
  };

  const handleExportPDF = () => {
    if (!autoTablePlugin) {
      alert("PDF library is still loading. Please try again in a moment.");
      return;
    }

    setIsExporting("pdf");
    try {
      const doc = new jsPDF();

      // Calculate summary (matching utils.ts logic)
      const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
      const categories = new Set(expenses.map(e => e.category));

      // --- Header Section (Matching Expense Page Style) ---
      doc.setFillColor(15, 118, 110); // Teal 600
      doc.rect(0, 0, 210, 40, "F");

      // Logo: FinTracker
      doc.setFont("helvetica", "bold");
      doc.setFontSize(28);
      doc.setTextColor(255, 255, 255);
      doc.text("Fin", 14, 26);
      doc.setTextColor(134, 239, 172); // Green-300 accent for Tracker
      doc.text("Tracker", 24, 26);

      // Report Title
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text("Expense Report", 145, 26);

      // --- Summary Section ---
      doc.setFontSize(11);
      doc.setTextColor(71, 85, 105); // Slate 600
      doc.setFont("helvetica", "normal");
      doc.text(`Generated on: ${new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}`, 14, 50);
      doc.text(`Total Expenses: ${expenses.length}`, 14, 58);
      doc.text(`Categories: ${categories.size}`, 145, 58);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 118, 110);
      doc.text(`Total Amount: Rs. ${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 14, 68);

      // Line separator
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.setLineWidth(0.5);
      doc.line(14, 75, 196, 75);

      // --- Table Section ---
      const tableColumn = ["Date", "Description", "Category", "Amount"];
      const tableRows = expenses.map(e => [
        new Date(e.date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }),
        e.title,
        e.category,
        `Rs. ${e.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
      ]);

      autoTablePlugin(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 85,
        styles: {
          fontSize: 10,
          cellPadding: 5,
          textColor: [51, 65, 85], // Slate 700
          lineColor: [226, 232, 240],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [15, 118, 110], // Teal 600
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252] // Slate 50
        },
        margin: { top: 85 }
      });

      doc.save(`FinTracker-Report-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("PDF Export failed:", error);
    } finally {
      setTimeout(() => setIsExporting(null), 1000);
      setShowExportMenu(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Reports</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Snapshot of your spending performance with practical actions.
          </p>
        </div>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 text-white font-medium hover:bg-teal-600 transition-colors shadow-lg shadow-teal-500/20"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowExportMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 rounded-2xl glass card p-2 z-20 shadow-xl border border-slate-200/50"
                >
                  <button
                    onClick={handleExportPDF}
                    disabled={!!isExporting}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-red-500" />
                    <span>Download PDF</span>
                    {isExporting === "pdf" && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-3 h-3 border-2 border-teal-500 border-t-transparent rounded-full ml-auto" />}
                  </button>
                  <button
                    onClick={handleExportExcel}
                    disabled={!!isExporting}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    <span>Download Excel</span>
                    {isExporting === "excel" && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-3 h-3 border-2 border-teal-500 border-t-transparent rounded-full ml-auto" />}
                  </button>
                  <button
                    onClick={handleExportCSV}
                    disabled={!!isExporting}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <FileIcon className="w-4 h-4 text-blue-500" />
                    <span>Download CSV</span>
                    {isExporting === "csv" && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-3 h-3 border-2 border-teal-500 border-t-transparent rounded-full ml-auto" />}
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Spent", value: formatCurrency(reportStats.totalSpent) },
          { label: "Transactions", value: String(reportStats.totalTransactions) },
          { label: "Average Expense", value: formatCurrency(reportStats.averageExpense) },
          { label: "Top Category", value: reportStats.topCategory },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 * index }}
            className="glass card p-5"
          >
            <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
            <p className="mt-2 text-xl font-bold text-slate-800">{item.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Insights & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="w-5 h-5 text-teal-600" />
            <h3 className="font-semibold text-slate-800">Report Highlights</h3>
          </div>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="flex gap-3">
                <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600 leading-relaxed">
                  {insight}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-cyan-600" />
            <h3 className="font-semibold text-slate-800">Recommended Actions</h3>
          </div>
          <div className="space-y-4">
            {recommendations.map((tip, index) => (
              <div key={index} className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-cyan-50 flex items-center justify-center text-[10px] font-bold text-cyan-600 flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
