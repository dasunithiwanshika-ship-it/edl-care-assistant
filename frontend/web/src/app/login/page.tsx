"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  UserPlus, 
  HelpCircle, 
  ArrowRight,
  Globe,
  Mail,
  ShieldCheck
} from "lucide-react";
import { EDLCareLogo } from "@/components/EDLCareLogo";
import { useApp } from "@/components/AppContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();
  const [username, setUsername] = useState("0412345678");
  const [password, setPassword] = useState("demo123");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await login(username.trim(), password.trim());
      router.push("/");
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid credentials. Please verify your demo account details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-[#0c0f14] text-slate-900 dark:text-white select-none">
      {/* LEFT PANEL: Dark Hero & Corporate Information matching Screenshot 1 */}
      <div 
        className="lg:w-[58%] min-h-[460px] lg:min-h-screen relative p-8 sm:p-14 lg:p-16 flex flex-col justify-between overflow-hidden text-white"
        style={{
          background: "linear-gradient(135deg, #13171e 0%, #1e2430 50%, #0d1117 100%)",
        }}
      >
        {/* Subtle architectural background texture */}
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: "radial-gradient(#F8BB15 1px, transparent 1px), radial-gradient(#6c002c 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            backgroundPosition: "0 0, 14px 14px",
          }}
        />

        <div className="relative z-10 space-y-6 max-w-xl">
          {/* Header Label */}
          <p className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.25em] text-[#d4af37] uppercase">
            Electricity Distribution Lanka (Private) Limited
          </p>

          {/* Trusted National Utility Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#d4af37]/60 bg-[#d4af37]/10 text-[#d4af37] text-[11px] font-bold tracking-wider uppercase">
            <span>Trusted National Utility Since 1969</span>
          </div>

          {/* Large Serif Title matching Screenshot 1 */}
          <h1 
            className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-[1.15]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Reliable Power for Every<br />Sri Lankan
          </h1>

          {/* Subtitle with gold underline accent */}
          <div>
            <p className="text-xs sm:text-sm font-bold tracking-widest text-slate-200 uppercase">
              Your Electricity Services, Digitally At Your Fingertips
            </p>
            <div className="w-12 h-1 bg-[#d4af37] mt-2 rounded-full" />
          </div>

          {/* Statutory Legislation & Restructuring Description */}
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
            Electricity Distribution Lanka (Private) Limited (EDL) is a state-owned successor company established under the Sri Lanka Electricity Act, No. 36 of 2024 and its Amendment Act, No. 14 of 2025, formed through the strategic restructuring of the Ceylon Electricity Board (CEB). As Sri Lanka's designated electricity distributor, EDL is committed to delivering reliable, continuous power to every home and business across the nation.
          </p>

          <div>
            <button 
              type="button"
              onClick={() => alert("EDL Corporate Overview (Demo)")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#d4af37]/70 text-[#d4af37] hover:bg-[#d4af37]/10 text-xs font-bold tracking-wider uppercase transition-colors"
            >
              <span>Learn More</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Social Links Footer */}
        <div className="relative z-10 flex items-center gap-4 pt-8 text-xs text-slate-400">
          <span className="font-bold tracking-wider uppercase text-[10px]">Follow Us</span>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-xs cursor-pointer">
              f
            </span>
            <span className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-xs cursor-pointer">
              𝕏
            </span>
            <span className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-xs cursor-pointer">
              in
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Sign In Form matching Screenshot 1 */}
      <div className="lg:w-[42%] min-h-screen bg-slate-50 dark:bg-[#13171d] p-6 sm:p-12 lg:p-14 flex flex-col justify-between items-center">
        <div className="w-full max-w-sm my-auto space-y-6">
          {/* Logo & Welcome Header */}
          <div className="text-center space-y-2">
            <EDLCareLogo size="md" showSubtitle={true} />
            <h2 className="text-base sm:text-lg font-bold text-[#6c002c] dark:text-[#f87171] pt-1">
              Welcome to EDLCare
            </h2>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl bg-white dark:bg-[#1a212b] border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-card space-y-5">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Sign in
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Sign in with your CEBCare/EDLCare credentials to access your EDLCare services.
              </p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4 text-xs">
              {/* Field 1: Username / Email / Mobile */}
              <div>
                <label className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Username / Email / Mobile</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="0757800822"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200 dark:border-slate-700 bg-[#f0f5ff] dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#6c002c]"
                />
              </div>

              {/* Field 2: Password */}
              <div>
                <label className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200 dark:border-slate-700 bg-[#f0f5ff] dark:bg-slate-900 text-slate-900 dark:text-white font-medium pr-10 focus:outline-none focus:ring-2 focus:ring-[#6c002c]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              {/* Quick Demo Credentials Selector */}
              <div className="pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Fast Demo Logins (Click to autofill):
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => { setUsername("0412345678"); setPassword("demo123"); }}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-[#6c002c] text-left"
                  >
                    <span className="font-bold block text-slate-800 dark:text-slate-200">Low Usage</span>
                    <span className="text-slate-500">0412345678</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUsername("0723456789"); setPassword("demo123"); }}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-[#6c002c] text-left"
                  >
                    <span className="font-bold block text-slate-800 dark:text-slate-200">High Usage</span>
                    <span className="text-slate-500">0723456789</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUsername("0134567890"); setPassword("demo123"); }}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-[#6c002c] text-left"
                  >
                    <span className="font-bold block text-slate-800 dark:text-slate-200">Solar PV</span>
                    <span className="text-slate-500">0134567890</span>
                  </button>
                </div>
              </div>

              {/* Button Row matching Screenshot 1 */}
              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#6c002c] hover:bg-[#550022] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{isLoading ? "Signing in..." : "Sign in"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => alert("Registration Portal (Demo)")}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>

              {/* Forgot password link */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => alert("Password Reset Instructions (Demo)")}
                  className="text-xs text-slate-600 dark:text-slate-400 hover:text-[#6c002c] hover:underline inline-flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Forgot your password?</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer of Right Panel matching Screenshot 1 */}
        <div className="w-full text-center text-xs text-slate-500 dark:text-slate-400 space-y-1 pt-6">
          <p className="text-[11px]">Powered by</p>
          <p className="font-black text-sm text-[#6c002c] dark:text-[#f87171] tracking-wider">
            CEBAssist™
          </p>
          <p className="text-[11px] text-slate-400">
            © 2026 Electricity Distribution Lanka (Private) Limited
          </p>
          <div className="flex items-center justify-center gap-3 text-[11px] pt-1 text-slate-500">
            <span className="hover:underline cursor-pointer flex items-center gap-1">
              <Globe className="w-3 h-3" /> www.edl.lk
            </span>
            <span>•</span>
            <span className="hover:underline cursor-pointer flex items-center gap-1">
              <Mail className="w-3 h-3" /> Contact
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
