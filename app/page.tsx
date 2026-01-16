"use client";

import { useState, FormEvent } from "react";
import { isSupabaseConfigured } from "@/lib/supabaseClient";

export default function Home() {
  const [totalCapitalCall, setTotalCapitalCall] = useState<string>("");
  const [ownershipPercentage, setOwnershipPercentage] = useState<string>("");
  const [result, setResult] = useState<{
    lpAmount: number;
    totalAmount: number;
    percentage: number;
  } | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const total = parseFloat(totalCapitalCall);
    const ownership = parseFloat(ownershipPercentage);

    if (isNaN(total) || isNaN(ownership)) {
      return;
    }

    const lpCapitalCall = (total * ownership) / 100;

    setResult({
      lpAmount: lpCapitalCall,
      totalAmount: total,
      percentage: ownership,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-5">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            💰 Capital Call Calculator
          </h1>
          <p className="text-gray-600 text-sm">
            Calculate LP contributions based on ownership percentage
          </p>

          {/* Supabase Connection Check */}
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured() ? 'bg-green-500' : 'bg-red-500'}`}></span>
            Supabase env: {isSupabaseConfigured() ? 'OK' : 'MISSING'}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Total Capital Call */}
          <div>
            <label
              htmlFor="totalCapitalCall"
              className="block text-gray-800 font-semibold mb-2 text-sm"
            >
              Total Capital Call Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">
                $
              </span>
              <input
                type="number"
                id="totalCapitalCall"
                value={totalCapitalCall}
                onChange={(e) => setTotalCapitalCall(e.target.value)}
                placeholder="1000000"
                required
                step="0.01"
                min="0"
                className="w-full px-12 py-4 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <p className="text-gray-500 text-xs mt-2">
              Enter the total amount being called from all LPs
            </p>
          </div>

          {/* Ownership Percentage */}
          <div>
            <label
              htmlFor="ownershipPercentage"
              className="block text-gray-800 font-semibold mb-2 text-sm"
            >
              LP Ownership Percentage
            </label>
            <div className="relative">
              <input
                type="number"
                id="ownershipPercentage"
                value={ownershipPercentage}
                onChange={(e) => setOwnershipPercentage(e.target.value)}
                placeholder="25"
                required
                step="0.01"
                min="0"
                max="100"
                className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-purple-500 transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">
                %
              </span>
            </div>
            <p className="text-gray-500 text-xs mt-2">
              Enter the LP&apos;s ownership percentage in the fund
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl font-semibold text-base hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 active:translate-y-0"
          >
            Calculate Capital Call
          </button>
        </form>

        {/* Result */}
        {result && (
          <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="text-gray-600 text-sm mb-3">
              LP Capital Call Amount:
            </div>
            <div className="text-gray-900 text-4xl font-bold mb-4">
              {formatCurrency(result.lpAmount)}
            </div>
            <div className="text-gray-600 text-xs leading-relaxed pt-4 border-t-2 border-white/50">
              <strong>Calculation:</strong>
              <br />
              Total Capital Call: {formatCurrency(result.totalAmount)}
              <br />
              LP Ownership: {result.percentage}%
              <br />
              LP Capital Call: {formatCurrency(result.totalAmount)} ×{" "}
              {result.percentage}% = {formatCurrency(result.lpAmount)}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
