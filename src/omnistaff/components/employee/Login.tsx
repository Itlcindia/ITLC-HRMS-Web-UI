"use client";

import React, { useState } from "react";
import { useHRMS } from "./context/HRMSContext";
import { Card, Button } from "./UI";
import { ShieldCheck, Mail, Lock, Eye, EyeOff, AlertCircle, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export const Login: React.FC = () => {
  const { login, profile, settings, updateSettings } = useHRMS();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleTheme = () => {
    const nextTheme = settings.theme === "dark" ? "light" : "dark";
    updateSettings({ theme: nextTheme });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError("Invalid email address or password. Try the demo credentials.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const autofillDemo = () => {
    setEmail(profile.email);
    setPassword("password123");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden transition-all duration-300">
      
      {/* Abstract background glow details */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 h-82 w-82 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none -z-10" />

      {/* Theme Toggle Button top-right */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2 rounded-xl border border-border bg-card/60 text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-xs"
        title="Toggle Theme"
      >
        {settings.theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      {/* Login Card Panel */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 shadow-2xl border border-border glass-panel relative">
          
          {/* Brand Identity */}
          <div className="flex flex-col items-center text-center space-y-2 mb-8">
            <div className="p-3 bg-primary/15 text-primary rounded-2xl flex items-center justify-center shrink-0">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground tracking-tight">ITLC HRMS</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Employee Self Service Dashboard</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Work Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-xs md:text-sm rounded-xl border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-muted-foreground">Portal Password</label>
                <a href="#" className="text-[10px] text-primary hover:underline font-bold" onClick={(e) => e.preventDefault()}>
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 text-xs md:text-sm rounded-xl border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Remember Me checkbox */}
            <label className="flex items-center gap-2 select-none cursor-pointer">
              <input type="checkbox" className="rounded-md border border-border" defaultChecked />
              <span className="text-[11px] text-muted-foreground font-semibold">Keep me signed in on this device</span>
            </label>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-xs flex items-start gap-2 leading-relaxed">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              loading={loading}
              className="w-full py-3 text-sm font-bold rounded-xl h-11"
            >
              Sign In to Dashboard
            </Button>

          </form>

          {/* Demo Credentials Box */}
          <div className="mt-8 pt-6 border-t border-border/80 text-xs">
            <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-2">
              <span className="font-bold text-foreground block">🔑 Mock Demo Credentials</span>
              <p className="text-[11px] text-muted-foreground leading-normal">
                To test the restricted Employee Role permissions:
              </p>
              <div className="text-[10px] font-mono text-muted-foreground space-y-1 bg-card p-2 rounded-lg border border-border">
                <div>Email: <strong className="text-primary select-all">{profile.email}</strong></div>
                <div>Pass: <strong className="text-foreground select-all">password123</strong></div>
              </div>
              <button
                type="button"
                onClick={autofillDemo}
                className="w-full text-center text-[10px] text-primary hover:underline font-bold block pt-1 cursor-pointer"
              >
                Autofill Credentials
              </button>
            </div>
          </div>

        </Card>
      </motion.div>

    </div>
  );
};
