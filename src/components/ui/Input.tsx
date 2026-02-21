"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-800
            placeholder:text-slate-400 transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            ${error ? "border-red-400 focus:ring-red-400" : "border-slate-200 hover:border-slate-300"}
            ${icon ? "pl-10" : ""}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = "", ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={`
          w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-800
          transition-all duration-200 cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
          disabled:bg-slate-50 disabled:cursor-not-allowed
          ${error ? "border-red-400 focus:ring-red-400" : "border-slate-200 hover:border-slate-300"}
          ${className}
        `}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = "", ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        className={`
          w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-800
          placeholder:text-slate-400 transition-all duration-200 resize-none
          focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
          ${error ? "border-red-400 focus:ring-red-400" : "border-slate-200 hover:border-slate-300"}
          ${className}
        `}
        rows={3}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
