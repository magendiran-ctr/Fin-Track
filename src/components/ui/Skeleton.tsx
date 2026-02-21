"use client";

import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`skeleton rounded-lg ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 rounded-2xl card">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
      <Skeleton className="w-24 h-8 rounded-lg mb-2" />
      <Skeleton className="w-32 h-4 rounded-lg" />
    </div>
  );
}

export function ExpenseItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <div className="flex-1">
        <Skeleton className="w-32 h-5 rounded-lg mb-2" />
        <Skeleton className="w-24 h-4 rounded-lg" />
      </div>
      <Skeleton className="w-20 h-6 rounded-lg" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="p-6 rounded-2xl card">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="w-32 h-6 rounded-lg" />
        <Skeleton className="w-20 h-8 rounded-lg" />
      </div>
      <Skeleton className="w-full h-64 rounded-xl" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-800">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <div className="flex-1">
        <Skeleton className="w-40 h-4 rounded-lg mb-2" />
        <Skeleton className="w-24 h-3 rounded-lg" />
      </div>
      <Skeleton className="w-16 h-4 rounded-lg" />
    </div>
  );
}
