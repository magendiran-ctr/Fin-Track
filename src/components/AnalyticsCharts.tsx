"use client";

// Analytics charts using Recharts

import React from "react";
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
  Legend,
} from "recharts";
import { Card } from "@/components/ui/Card";
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
        {[1, 2].map((i) => (
          <Card key={i} className="h-72 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-4" />
            <div className="h-48 bg-slate-100 rounded-xl" />
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics || analytics.totalExpenses === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          { title: "Monthly Spending", desc: "Your spending trend over time" },
          { title: "Category Breakdown", desc: "Where your money goes" },
        ].map((item) => (
          <Card key={item.title}>
            <h3 className="text-base font-semibold text-slate-800 mb-1">{item.title}</h3>
            <p className="text-sm text-slate-500 mb-6">{item.desc}</p>
            <div className="h-48 flex items-center justify-center bg-slate-50 rounded-xl">
              <div className="text-center">
                <p className="text-3xl mb-2">📊</p>
                <p className="text-sm text-slate-500">Add expenses to see charts</p>
              </div>
            </div>
          </Card>
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
      <Card>
        <h3 className="text-base font-semibold text-slate-800 mb-1">Monthly Spending</h3>
        <p className="text-sm text-slate-500 mb-6">Your spending trend over the last 12 months</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={monthlyChartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
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
              tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                fontSize: "12px",
              }}
              formatter={(value: number | undefined) => [formatCurrency(value ?? 0), "Total"]}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#colorTotal)"
              dot={{ fill: "#10b981", strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: "#10b981" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Category Breakdown Chart */}
      <Card>
        <h3 className="text-base font-semibold text-slate-800 mb-1">Category Breakdown</h3>
        <p className="text-sm text-slate-500 mb-4">Where your money goes</p>
        {categoryChartData.length > 0 ? (
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    fontSize: "12px",
                  }}
                  formatter={(value: number | undefined) => [formatCurrency(value ?? 0), "Amount"]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {categoryChartData.slice(0, 5).map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-slate-600 flex-1 truncate">{item.name}</span>
                  <span className="text-xs font-medium text-slate-700">
                    {item.percentage.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center bg-slate-50 rounded-xl">
            <p className="text-sm text-slate-500">No data available</p>
          </div>
        )}
      </Card>
    </div>
  );
}
