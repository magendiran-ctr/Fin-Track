"use client";

// Analytics charts using Recharts - Fintech-inspired design

import React from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { ChartSkeleton } from "@/components/ui/Skeleton";
import { AnalyticsSummary, CATEGORY_COLORS } from "@/lib/types";
import { formatCurrency, formatMonth } from "@/lib/utils";

interface AnalyticsChartsProps {
  analytics: AnalyticsSummary | null;
  isLoading: boolean;
}

export function AnalyticsCharts({ analytics, isLoading }: AnalyticsChartsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  if (!analytics || analytics.totalExpenses === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          { title: "Monthly Spending", desc: "Your spending trend over time" },
          { title: "Category Breakdown", desc: "Where your money goes" },
        ].map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">{item.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{item.desc}</p>
              <div className="h-48 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="text-center">
                  <p className="text-3xl mb-2">📊</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Add expenses to see charts</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  }

  const monthlyChartData = analytics.monthlyData.map((d) => ({
    month: formatMonth(d.month),
    total: d.total,
    count: d.count,
  }));

  const categoryChartData = analytics.categoryData.map((d) => ({
    name: d.category,
    value: d.total,
    percentage: d.percentage,
    color: CATEGORY_COLORS[d.category],
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Spending Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card padding="lg">
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">Monthly Spending</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Your spending trend over the last 12 months</p>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyChartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(226, 232, 240, 0.8)",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    fontSize: "12px",
                  }}
                  formatter={(value: number | undefined) => [formatCurrency(value ?? 0), "Total"]}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#14b8a6"
                  strokeWidth={2.5}
                  fill="url(#colorTotal)"
                  dot={{ fill: "#14b8a6", strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: "#14b8a6", strokeWidth: 2, stroke: "#fff" }}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* Category Breakdown Chart */}
      <motion.div
        initial={{ opacity: 0, y: 30, rotateX: 10 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        whileHover={{ 
          rotateX: 4, 
          rotateY: -4, 
          scale: 1.01,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
        }}
        transition={{ 
          duration: 0.8, 
          delay: 0.1,
          rotateX: { type: "spring", stiffness: 100, damping: 20 },
          rotateY: { type: "spring", stiffness: 100, damping: 20 }
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <Card padding="lg" className="h-full overflow-hidden">
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">Category Breakdown</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Where your money goes</p>
          {categoryChartData.length > 0 ? (
            <div className="flex items-center gap-4">
              <motion.div 
                className="chart-container w-[55%]"
                initial={{ scale: 0.8, rotate: -45, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                style={{ transform: "translateZ(30px)" }}
              >
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                      animationDuration={1800}
                      animationEasing="ease-out"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          style={{ filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.1))" }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.98)",
                        backdropFilter: "blur(12px)",
                        border: "none",
                        borderRadius: "16px",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        fontSize: "12px",
                        padding: "10px 14px",
                      }}
                      itemStyle={{ color: "#334155", fontWeight: "600" }}
                      formatter={(value: number | undefined) => [formatCurrency(value ?? 0), "Amount"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
              <div className="flex-1 space-y-2.5">
                {categoryChartData.slice(0, 5).map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center gap-2 group cursor-default"
                    style={{ transform: "translateZ(20px)" }}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 flex-1 truncate group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      {item.name}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 group-hover:text-teal-600 transition-colors">
                      {item.percentage.toFixed(0)}%
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <p className="text-sm text-slate-500">No data available</p>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
