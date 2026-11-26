"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus, 
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Zap,
  ShieldCheck,
  BarChart3,
  Globe,
  Sparkles
} from "lucide-react";
import { EDLCareLogo } from "@/components/EDLCareLogo";
import { useApp } from "@/components/AppContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useApp();

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Validation Helpers
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // 1. Full Name
    if (!fullName.trim()) {
      errors.fullName = "Full name is required.";
    } else if (fullName.trim().length < 2) {
      errors.fullName = "Full name must be at least 2 characters long.";
    }

    // 2. Email Address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errors.email = "Email address is required.";
    } else if (!emailRegex.test(email.trim())) {
      errors.email = "Please enter a valid email address (e.g. name@example.com).";
    }

    // 3. Phone Number
    const phoneClean = phone.replace(/[\s\-\(\)]/g, "");
    if (!phoneClean) {
      errors.phone = "Phone number is required.";
    } else if (!/^(\+?\d{9,15})$/.test(phoneClean)) {
      errors.phone = "Please enter a valid phone number (e.g. 0771234567).";
    }

    // 4. Password
    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
    }

    // 5. Confirm Password
    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: password,
      });

      setSuccessMessage(
        `Registration successful! Welcome, ${result.full_name || fullName.trim()}. Your account (#${result.account_number}) is ready.`
      );

      // Redirect to dashboard after brief moment
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err: any) {
      const msg = err.message || "Registration failed. Please check your details and try again.";
      setErrorMessage(msg);
      // Highlight field if duplicate email
      if (msg.toLowerCase().includes("email")) {
        setFieldErrors((prev) => ({
          ...prev,
          email: "This email address is already in use. Please sign in or use another email.",
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Password Strength Indicators
  const hasMinLength = password.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-[#0c0f14] text-slate-900 dark:text-white select-none">
      {/* LEFT PANEL: Dark Hero & Corporate Information matching EDL Brand */}
      <div 
        className="lg:w-[50%] min-h-[460px] lg:min-h-screen relative p-8 sm:p-14 lg:p-16 flex flex-col justify-between overflow-hidden text-white"
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
            <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Digital Consumer Portal Registration</span>
          </div>

          {/* Large Serif Title */}
          <h1 
            className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-[1.15]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Join Sri Lanka&apos;s Next-Gen Utility Portal
          </h1>

          {/* Subtitle with gold underline accent */}
          <div>
            <p className="text-xs sm:text-sm font-bold tracking-widest text-slate-200 uppercase">
              Instant Access to Your Personalized Energy Dashboard
            </p>
            <div className="w-12 h-1 bg-[#d4af37] mt-2 rounded-full" />
          </div>

          {/* Feature Highlights List */}
          <div className="space-y-3 pt-2 text-xs text-slate-300">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-[#6c002c]/50 text-[#d4af37] flex items-center justify-center shrink-0 mt-0.5 border border-[#d4af37]/30">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-bold text-white">Instant Online Bill Settlements</p>
                <p className="text-[11px] text-slate-400">Pay securely with LankaQR or cards with real-time balance deductions.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-[#6c002c]/50 text-[#d4af37] flex items-center justify-center shrink-0 mt-0.5 border border-[#d4af37]/30">
                <BarChart3 className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-bold text-white">12-Month Consumption & Solar Telemetry</p>
                <p className="text-[11px] text-slate-400">Visualize month-by-month kWh trends and net-metering solar statistics.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-[#6c002c]/50 text-[#d4af37] flex items-center justify-center shrink-0 mt-0.5 border border-[#d4af37]/30">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-bold text-white">Trilingual AI Assistant</p>
                <p className="text-[11px] text-slate-400">24/7 AI-driven support in English, Sinhala (සිංහල), and Tamil (தமிழ்).</p>
              </div>
            </div>
          </div>

          {/* CEB Restructuring notice */}
          <p className="text-[11px] text-slate-400 leading-relaxed border-t border-white/10 pt-4">
            Established under the Sri Lanka Electricity Act No. 36 of 2024 and Amendment Act No. 14 of 2025. Demonstrates live integration with EDL customer databases.
          </p>
        </div>

        {/* Social Links Footer */}
        <div className="relative z-10 flex items-center gap-4 pt-6 text-xs text-slate-400">
          <span className="font-bold tracking-wider uppercase text-[10px]">EDL Care Hotline</span>
          <span className="font-mono font-bold text-[#d4af37]">1987</span>
          <span className="text-slate-600">•</span>
          <span className="hover:underline cursor-pointer">info@edl.lk</span>
        </div>
      </div>

      {/* RIGHT PANEL: Registration Form */}
      <div className="lg:w-[50%] min-h-screen bg-slate-50 dark:bg-[#13171d] p-6 sm:p-10 lg:p-12 flex flex-col justify-between items-center overflow-y-auto">
        <div className="w-full max-w-md my-auto space-y-5 py-6">
          {/* Logo & Header */}
          <div className="text-center space-y-2">
            <EDLCareLogo size="md" showSubtitle={true} />
            <h2 className="text-base sm:text-lg font-bold text-[#6c002c] dark:text-[#f87171] pt-1">
              Create Your EDLCare Account
            </h2>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl bg-white dark:bg-[#1a212b] border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-card space-y-4">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Register
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your details to create an account and access personalized utility services.
              </p>
            </div>

            {/* Global Error Banner */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Global Success Banner */}
            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p>{successMessage}</p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-normal mt-1">
                    Redirecting to your dashboard...
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Field 1: Full Name */}
              <div>
                <label className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Full Name *</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (fieldErrors.fullName) setFieldErrors((prev) => ({ ...prev, fullName: "" }));
                  }}
                  placeholder="e.g. Dasuni Thiwanshika Premawardana"
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${
                    fieldErrors.fullName 
                      ? "border-red-400 dark:border-red-500 bg-red-50/30" 
                      : "border-blue-200 dark:border-slate-700 bg-[#f0f5ff] dark:bg-slate-900"
                  } text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#6c002c] transition-all`}
                />
                {fieldErrors.fullName && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">
                    {fieldErrors.fullName}
                  </p>
                )}
              </div>

              {/* Field 2: Email Address */}
              <div>
                <label className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>Email Address *</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  placeholder="name@example.com"
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${
                    fieldErrors.email 
                      ? "border-red-400 dark:border-red-500 bg-red-50/30" 
                      : "border-blue-200 dark:border-slate-700 bg-[#f0f5ff] dark:bg-slate-900"
                  } text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#6c002c] transition-all`}
                />
                {fieldErrors.email && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Field 3: Phone Number */}
              <div>
                <label className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>Phone Number *</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: "" }));
                  }}
                  placeholder="0771234567"
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${
                    fieldErrors.phone 
                      ? "border-red-400 dark:border-red-500 bg-red-50/30" 
                      : "border-blue-200 dark:border-slate-700 bg-[#f0f5ff] dark:bg-slate-900"
                  } text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#6c002c] transition-all`}
                />
                {fieldErrors.phone && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">
                    {fieldErrors.phone}
                  </p>
                )}
              </div>

              {/* Field 4: Password */}
              <div>
                <label className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Password *</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    placeholder="At least 6 characters"
                    required
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${
                      fieldErrors.password 
                        ? "border-red-400 dark:border-red-500 bg-red-50/30" 
                        : "border-blue-200 dark:border-slate-700 bg-[#f0f5ff] dark:bg-slate-900"
                    } text-slate-900 dark:text-white font-medium pr-10 focus:outline-none focus:ring-2 focus:ring-[#6c002c] transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">
                    {fieldErrors.password}
                  </p>
                )}

                {/* Password Strength Indicators */}
                <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-500 dark:text-slate-400">
                  <span className={`flex items-center gap-1 ${hasMinLength ? "text-emerald-600 dark:text-emerald-400 font-semibold" : ""}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`} />
                    6+ chars
                  </span>
                  <span className={`flex items-center gap-1 ${hasLetter ? "text-emerald-600 dark:text-emerald-400 font-semibold" : ""}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${hasLetter ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`} />
                    Letters
                  </span>
                  <span className={`flex items-center gap-1 ${hasNumber ? "text-emerald-600 dark:text-emerald-400 font-semibold" : ""}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${hasNumber ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`} />
                    Numbers
                  </span>
                </div>
              </div>

              {/* Field 5: Confirm Password */}
              <div>
                <label className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Confirm Password *</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
                    }}
                    placeholder="Re-type your password"
                    required
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${
                      fieldErrors.confirmPassword 
                        ? "border-red-400 dark:border-red-500 bg-red-50/30" 
                        : "border-blue-200 dark:border-slate-700 bg-[#f0f5ff] dark:bg-slate-900"
                    } text-slate-900 dark:text-white font-medium pr-10 focus:outline-none focus:ring-2 focus:ring-[#6c002c] transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
                {passwordsMatch && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Passwords match</span>
                  </p>
                )}
              </div>

              {/* Terms notice */}
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug pt-1">
                By registering, you agree to EDL&apos;s Terms of Electricity Consumer Service and Privacy Policy under the Sri Lanka Electricity Act.
              </p>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#6c002c] hover:bg-[#550022] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isLoading ? "Creating Account..." : "Create Account"}</span>
                </button>
              </div>

              {/* Already have an account */}
              <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-bold text-[#6c002c] dark:text-[#f87171] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Sign in</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full text-center text-xs text-slate-500 dark:text-slate-400 space-y-1 pt-4 pb-2">
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
            <Link href="/login" className="hover:underline">Customer Sign In</Link>
            <span>•</span>
            <Link href="/" className="hover:underline">Guest Portal</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
