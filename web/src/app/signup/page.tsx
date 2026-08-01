"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMenuStore } from "@/store/useMenuStore";
import { Sparkles, Mail, Lock, User, Phone, Store, MapPin, FileText, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function SignUp() {
  const router = useRouter();
  const { signup, checkSession, isLoading, error: storeError } = useMenuStore();

  const [formData, setFormData] = useState({
    name: "",
    ownerName: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    address: "",
    gstNumber: "",
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    checkSession().then((isLoggedIn) => {
      if (isLoggedIn) {
        router.push("/dashboard");
      }
    });
  }, [checkSession, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const { name, ownerName, email, mobileNumber, password, confirmPassword, address } = formData;

    // Client-side validations
    if (!name || !ownerName || !email || !mobileNumber || !password || !confirmPassword || !address) {
      setValidationError("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters.");
      return;
    }

    const success = await signup(formData);
    if (success) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="bg-[#0A0A0C] text-[#EDEDF2] font-sans min-h-screen flex flex-col justify-center items-center py-12 px-6 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-2xl w-full z-10">
        {/* Branding Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-4 group hover:scale-105 transition-transform">
            <div className="h-10 w-10 bg-gradient-to-tr from-rose-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-rose-400 bg-clip-text text-transparent">
              DIGIDISH
            </span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-white">Create restaurant account</h2>
          <p className="text-slate-400 text-xs mt-1">Get started with digitizing physical menu cards instantly</p>
        </div>

        {/* Auth Card */}
        <div className="rounded-3xl border border-[#23232C] bg-[#121218]/80 p-8 backdrop-blur-xl shadow-2xl">
          {/* Error Message Box */}
          {(validationError || storeError) && (
            <div className="mb-6 p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs flex items-start space-x-2.5">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{validationError || storeError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Restaurant Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Restaurant Name *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Store className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Gourmet Delights"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#2D2D38] bg-[#0E0E14] text-white text-sm placeholder-slate-650 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>

              {/* Owner Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Owner Full Name *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    name="ownerName"
                    required
                    placeholder="John Doe"
                    value={formData.ownerName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#2D2D38] bg-[#0E0E14] text-white text-sm placeholder-slate-650 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="manager@gourmet.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#2D2D38] bg-[#0E0E14] text-white text-sm placeholder-slate-650 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mobile Number *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Phone className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="tel"
                    name="mobileNumber"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#2D2D38] bg-[#0E0E14] text-white text-sm placeholder-slate-650 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#2D2D38] bg-[#0E0E14] text-white text-sm placeholder-slate-650 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Confirm Password *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#2D2D38] bg-[#0E0E14] text-white text-sm placeholder-slate-650 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Restaurant Address *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none text-slate-500">
                  <MapPin className="h-4.5 w-4.5" />
                </span>
                <textarea
                  name="address"
                  required
                  rows={2}
                  placeholder="Street No. 4, Gourmet District, City"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#2D2D38] bg-[#0E0E14] text-white text-sm placeholder-slate-650 focus:outline-none focus:border-rose-500 transition-colors resize-none"
                />
              </div>
            </div>

            {/* GST Number (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">GST Number (Optional)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <FileText className="h-4.5 w-4.5" />
                </span>
                <input
                  type="text"
                  name="gstNumber"
                  placeholder="22AAAAA0000A1Z5"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#2D2D38] bg-[#0E0E14] text-white text-sm placeholder-slate-650 focus:outline-none focus:border-rose-500 transition-colors uppercase"
                />
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-semibold text-sm transition-all shadow-lg hover:shadow-rose-500/10 flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4.5 w-4.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Navigation */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Already have a restaurant account?{" "}
          <Link href="/signin" className="text-rose-400 hover:text-rose-300 font-semibold transition-colors">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
}
