"use client";

import { useState, useEffect, FormEvent } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

export default function Home() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");
  const [authSuccess, setAuthSuccess] = useState<string>("");
  const [isSignupMode, setIsSignupMode] = useState<boolean>(false);

  // Calculator state
  const [totalCapitalCall, setTotalCapitalCall] = useState<string>("");
  const [ownershipPercentage, setOwnershipPercentage] = useState<string>("");
  const [result, setResult] = useState<{
    lpAmount: number;
    totalAmount: number;
    percentage: number;
  } | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setAuthSuccess("");

    // Validate password length
    if (password.length < 8) {
      setAuthError("Password must be at least 8 characters long");
      setAuthLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
      } else {
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      setAuthError("An unexpected error occurred");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setAuthSuccess("");

    // Validate password length
    if (password.length < 8) {
      setAuthError("Password must be at least 8 characters long");
      setAuthLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
      } else {
        setAuthSuccess(
          "Account created! Check your email to confirm (if confirmations are enabled). Then log in."
        );
        setEmail("");
        setPassword("");
        setIsSignupMode(false);
      }
    } catch (error) {
      setAuthError("An unexpected error occurred");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setAuthLoading(true);
    await supabase.auth.signOut();
    setAuthLoading(false);
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

        {/* Authentication Section */}
        {isSupabaseConfigured() && (
          <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-purple-100">
            {user ? (
              // Logged in state
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Logged in as
                    </p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={authLoading}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {authLoading ? "Logging out..." : "Logout"}
                </button>
              </div>
            ) : (
              // Login/Signup form
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {isSignupMode ? "Create Account" : "Login"}
                  </h3>
                </div>

                <form
                  onSubmit={isSignupMode ? handleSignup : handleLogin}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Password {isSignupMode && "(min. 8 characters)"}
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>

                  {/* Error Message */}
                  {authError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{authError}</p>
                    </div>
                  )}

                  {/* Success Message */}
                  {authSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-600">{authSuccess}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-semibold text-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {authLoading
                        ? isSignupMode
                          ? "Creating account..."
                          : "Logging in..."
                        : isSignupMode
                        ? "Create account"
                        : "Login"}
                    </button>
                  </div>
                </form>

                {/* Toggle between Login and Signup */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignupMode(!isSignupMode);
                      setAuthError("");
                      setAuthSuccess("");
                    }}
                    className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
                  >
                    {isSignupMode
                      ? "Already have an account? Log in"
                      : "Need an account? Create one"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Calculator Section - Only visible when logged in */}
        {isSupabaseConfigured() && !user ? (
          // Message for logged out users
          <div className="text-center py-12">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Authentication Required
            </h3>
            <p className="text-gray-600 text-sm">
              Please log in to access this tool.
            </p>
          </div>
        ) : (
          <>
            {/* Calculator Divider */}
            <div className="mb-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-xs font-medium text-gray-500 uppercase">
                Calculator
              </span>
              <div className="flex-1 h-px bg-gray-200"></div>
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
          </>
        )}
      </div>
    </main>
  );
}
