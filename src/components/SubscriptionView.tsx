"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Check,
    Zap,
    ShieldCheck,
    Users,
    Star,
    Download,
    ArrowRight,
    Loader2,
    FileText
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const plans = [
    {
        id: "free",
        name: "Free",
        price: "₹0",
        description: "Perfect for tracking basic personal expenses.",
        features: [
            "Up to 50 expenses/month",
            "Basic analytics",
            "Standard categories",
            "Single device sync"
        ],
        color: "slate"
    },
    {
        id: "pro",
        name: "Pro",
        price: "₹199",
        period: "/month",
        description: "Advanced tools for power users and small projects.",
        features: [
            "Unlimited expenses",
            "Advanced AI reports",
            "Custom categories",
            "Multi-device sync",
            "Export to CSV/PDF"
        ],
        popular: true,
        color: "teal"
    },
    {
        id: "business",
        name: "Business",
        price: "₹999",
        period: "/month",
        description: "Complete solution for teams and small businesses.",
        features: [
            "Everything in Pro",
            "Team collaboration",
            "Role-based access",
            "Priority support",
            "Custom branding"
        ],
        color: "indigo"
    }
];

export function SubscriptionView() {
    const [currentPlanId, setCurrentPlanId] = useState("free");
    const [upgradingTo, setUpgradingTo] = useState<string | null>(null);

    const handleUpgrade = async (planId: string) => {
        setUpgradingTo(planId);
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setCurrentPlanId(planId);
        setUpgradingTo(null);
    };

    const handleDownloadInvoice = (id: number) => {
        alert(`Downloading invoice #${id}...`);
    };

    return (
        <div className="space-y-10 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto flex flex-col gap-2">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 font-outfit">Choose Your Plan</h2>
                <p className="text-slate-500 dark:text-slate-400">
                    Unlock advanced features and take full control of your finances with our premium plans.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan, idx) => {
                    const isCurrent = currentPlanId === plan.id;
                    const isUpgrading = upgradingTo === plan.id;

                    return (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`glass card p-8 flex flex-col relative transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-2 ${plan.popular
                                    ? "border-teal-500/50 shadow-xl shadow-teal-500/10"
                                    : "border-transparent"
                                } ${isCurrent ? "bg-teal-50/10 dark:bg-teal-900/5" : ""}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-teal-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-current" />
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{plan.name}</h3>
                                <div className="mt-4 flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                                    {plan.period && <span className="text-slate-500 text-sm">{plan.period}</span>}
                                </div>
                                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                                    {plan.description}
                                </p>
                            </div>

                            <div className="space-y-4 mb-10 flex-grow">
                                {plan.features.map((feature) => (
                                    <div key={feature} className="flex items-start gap-3">
                                        <div className="mt-1 w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                                        </div>
                                        <span className="text-sm text-slate-600 dark:text-slate-300">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                variant={isCurrent ? "secondary" : "primary"}
                                className={`w-full justify-center group ${isCurrent ? "opacity-50 cursor-default" : ""}`}
                                disabled={isCurrent || isUpgrading}
                                onClick={() => handleUpgrade(plan.id)}
                            >
                                {isUpgrading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : isCurrent ? (
                                    "Current Plan"
                                ) : (
                                    <>
                                        Upgrade Plan
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    );
                })}
            </div>

            {/* Billing history mockup */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass card p-6 overflow-hidden"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Billing History</h3>
                    <Button variant="secondary" size="sm" onClick={() => handleDownloadInvoice(0)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download All
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">Date</th>
                                <th className="text-left py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">Description</th>
                                <th className="text-left py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">Amount</th>
                                <th className="text-left py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="text-right py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">Invoice</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {[
                                { id: 101, date: "Oct 24, 2023", desc: "Monthly Subscription - Free", amount: "₹0.00", status: "Paid" },
                                { id: 102, date: "Sep 24, 2023", desc: "Monthly Subscription - Free", amount: "₹0.00", status: "Paid" },
                                { id: 103, date: "Aug 24, 2023", desc: "Monthly Subscription - Free", amount: "₹0.00", status: "Paid" },
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="py-4 text-sm text-slate-600 dark:text-slate-300">{row.date}</td>
                                    <td className="py-4 text-sm font-medium text-slate-800 dark:text-slate-100">{row.desc}</td>
                                    <td className="py-4 text-sm text-slate-600 dark:text-slate-300 font-mono">{row.amount}</td>
                                    <td className="py-4">
                                        <span className="px-2 py-1 rounded-full bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 text-[10px] font-bold uppercase">
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="py-4 text-right">
                                        <button
                                            onClick={() => handleDownloadInvoice(row.id)}
                                            className="text-teal-600 hover:text-teal-700 dark:text-teal-400 text-sm font-medium flex items-center gap-1 ml-auto"
                                        >
                                            <FileText className="w-4 h-4" />
                                            PDF
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
