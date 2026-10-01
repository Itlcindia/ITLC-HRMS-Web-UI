import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles, 
  Building2, Phone, Check, Globe, MapPin 
} from 'lucide-react';
import { api } from '../services/api';

const slides = [
  { id: 1, title: "CRM Analytics & Forecasts" },
  { id: 2, title: "HRMS Workforce Hub" },
  { id: 3, title: "Sales Revenue Performance" },
  { id: 4, title: "AI-Powered Insights" }
];

// Dark High-Tech Dashboard Mockup matching the exact design in the uploaded screenshots
const DarkDashboardMockup = () => {
  return (
    <div className="w-full rounded-2xl bg-[#0b0e24] border border-indigo-400/20 p-3 sm:p-4 text-left shadow-2xl relative overflow-hidden select-none">
      {/* Background ambient neon glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Metrics Row */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="bg-[#121638]/90 border border-indigo-500/20 rounded-lg p-1.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-semibold text-slate-400 uppercase">Rev</span>
            <span className="text-[7px] text-emerald-400 font-bold">+18%</span>
          </div>
          <span className="text-xs sm:text-sm font-extrabold text-white tracking-tight mt-0.5">$489.5K</span>
          <svg className="w-full h-3 mt-1" viewBox="0 0 50 12" fill="none">
            <path d="M0 10 Q 12 2, 25 8 T 50 2" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
          </svg>
        </div>

        <div className="bg-[#121638]/90 border border-indigo-500/20 rounded-lg p-1.5 flex flex-col justify-between">
          <span className="text-[8px] font-semibold text-slate-400 uppercase">Active</span>
          <span className="text-xs sm:text-sm font-extrabold text-white tracking-tight mt-0.5">112</span>
          <div className="w-full bg-slate-700/50 h-1 rounded-full overflow-hidden mt-1">
            <div className="bg-indigo-400 h-full w-[70%]" />
          </div>
        </div>

        <div className="bg-[#121638]/90 border border-indigo-500/20 rounded-lg p-1.5 flex flex-col justify-between">
          <span className="text-[8px] font-semibold text-slate-400 uppercase">Users</span>
          <span className="text-xs sm:text-sm font-extrabold text-white tracking-tight mt-0.5">345</span>
          <div className="w-full bg-slate-700/50 h-1 rounded-full overflow-hidden mt-1">
            <div className="bg-purple-400 h-full w-[85%]" />
          </div>
        </div>

        <div className="bg-[#121638]/90 border border-indigo-500/20 rounded-lg p-1.5 flex flex-col justify-between">
          <span className="text-[8px] font-semibold text-slate-400 uppercase">Rate</span>
          <span className="text-xs sm:text-sm font-extrabold text-white tracking-tight mt-0.5">68%</span>
          <div className="w-full bg-slate-700/50 h-1 rounded-full overflow-hidden mt-1">
            <div className="bg-cyan-400 h-full w-[68%]" />
          </div>
        </div>
      </div>

      {/* Center Spline Wave & Performance Card */}
      <div className="bg-[#121638]/95 border border-indigo-500/20 rounded-xl p-2.5 mb-3 relative">
        <div className="flex items-center justify-between text-[8px] text-slate-300 font-semibold mb-1">
          <span>REAL-TIME PERFORMANCE RADAR</span>
          <span className="text-indigo-400 flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            LIVE FORECAST
          </span>
        </div>
        <svg className="w-full h-14" viewBox="0 0 240 56" fill="none">
          <defs>
            <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d="M0 48 Q 40 10, 80 32 T 160 14 T 240 28 L 240 56 L 0 56 Z" fill="url(#curveGradient)" />
          <path d="M0 48 Q 40 10, 80 32 T 160 14 T 240 28" stroke="#818cf8" strokeWidth="2" fill="none" />
          <path d="M0 52 Q 50 25, 100 40 T 190 20 T 240 38" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
          <circle cx="80" cy="32" r="3" fill="#818cf8" />
          <circle cx="160" cy="14" r="3" fill="#38bdf8" />
          <circle cx="240" cy="28" r="3" fill="#a855f7" />
        </svg>
      </div>

      {/* Bottom Circular Gauges */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#121638]/90 border border-indigo-500/20 rounded-lg p-2 flex items-center gap-2">
          <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
            <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-cyan-400"
                strokeDasharray="72, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[8px] font-extrabold text-white">72%</span>
          </div>
          <div className="min-w-0">
            <p className="text-[7px] text-slate-400 font-bold uppercase truncate">Quarter Target</p>
            <p className="text-[9px] text-white font-extrabold truncate">72% Active</p>
          </div>
        </div>

        <div className="bg-[#121638]/90 border border-indigo-500/20 rounded-lg p-2 flex items-center gap-2">
          <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
            <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-purple-400"
                strokeDasharray="34, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[8px] font-extrabold text-white">34%</span>
          </div>
          <div className="min-w-0">
            <p className="text-[7px] text-slate-400 font-bold uppercase truncate">Growth Rate</p>
            <p className="text-[9px] text-white font-extrabold truncate">34% Pacing</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function LoginForm({
  onSuccessLogin,
  isSuperownerMode = false,
  onOpenRegister
}: {
  onSuccessLogin?: (email: string, pass: string) => void;
  isSuperownerMode?: boolean;
  onOpenRegister?: () => void;
}) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const handleCreateAccountClick = () => {
    if (onOpenRegister) {
      onOpenRegister();
    } else {
      setIsSignUp(true);
      setError('');
    }
  };

  const handleToggleMode = (signUp: boolean) => {
    setIsSignUp(signUp);
    setError('');
    setSuccess(false);
  };

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1024px)');
    setIsMobile(media.matches);
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const check = await api.checkSuperOwner();
        if (check.setupRequired) {
          setSetupRequired(true);
          setIsSignUp(true);
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkSetup();
  }, []);
  
  // Login States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Sign Up States
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [industryType, setIndustryType] = useState('IT & Software');
  const [companySize, setCompanySize] = useState('11-50 Employees');
  const [customEmployeesCount, setCustomEmployeesCount] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [country, setCountry] = useState('India');
  const [stateName, setStateName] = useState('');
  const [cityName, setCityName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signUpStep, setSignUpStep] = useState(1);

  // Status States
  const [isLoading, setIsLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState<'google' | 'apple' | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Embla Carousel settings
  const autoplayOptions = { delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true };
  const autoplayRef = useRef(Autoplay(autoplayOptions));
  
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, skipSnaps: false }, 
    [autoplayRef.current]
  );
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([0, 1, 2, 3, 4]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    const snaps = emblaApi.scrollSnapList();
    if (snaps.length > 0) setScrollSnaps(snaps);
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((index: number) => {
    if (!emblaApi) return;
    emblaApi.scrollTo(index);
  }, [emblaApi]);

  const handleNextStep = () => {
    setError('');
    if (!companyName.trim()) {
      setError('Please enter company name.');
      return;
    }
    if (!companyEmail.trim()) {
      setError('Please enter company email.');
      return;
    }
    if (!companyPhone.trim()) {
      setError('Please enter company phone.');
      return;
    }
    setSignUpStep(2);
  };

  // Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loginEmail || !loginPassword) {
      setError('Please enter both email and password.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(loginEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await api.login({
        email: loginEmail,
        password: loginPassword
      });
      if (result.otpRequired) {
        setIsLoading(false);
        setOtpRequired(true);
        setSuccessMsg(result.message || 'A secure verification OTP code has been sent to your email.');
        setError('');
        return;
      }
      setSuccess(true);
      setSuccessMsg('Welcome back! Successfully signed in. Redirecting to workspace...');
      setTimeout(() => {
        setIsLoading(false);
        if (onSuccessLogin) {
          onSuccessLogin(loginEmail, loginPassword);
        }
      }, 800);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  // Submit OTP Verification
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otpCode) {
      setError('Please enter the OTP verification code.');
      return;
    }

    setIsLoading(true);
    try {
      await api.verifyOtp({
        email: loginEmail,
        otp: otpCode
      });
      setSuccess(true);
      setSuccessMsg('OTP verified successfully! Redirecting to workspace...');
      setTimeout(() => {
        setIsLoading(false);
        if (onSuccessLogin) {
          onSuccessLogin(loginEmail, loginPassword);
        }
      }, 800);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Invalid OTP code. Please check and try again.');
    }
  };

  // Submit Registration
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (setupRequired) {
      if (!companyName || !companyEmail || !companyPhone || !password || !confirmPassword) {
        setError('Please fill in all required fields.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      setIsLoading(true);
      try {
        const result = await api.registerSuperOwner({
          name: companyName,
          email: companyEmail,
          phone: companyPhone,
          password: password
        });
        localStorage.setItem('hrms_jwt_token', result.token);
        setSuccess(true);
        setSuccessMsg('Super Owner account registered successfully! Redirecting...');
        setTimeout(() => {
          setIsLoading(false);
          if (onSuccessLogin) {
            onSuccessLogin(companyEmail, password);
          }
        }, 1500);
      } catch (err: any) {
        setIsLoading(false);
        setError(err.message || 'Registration failed.');
      }
      return;
    }

    if (!companyName || !companyEmail || !companyPhone || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(companyEmail)) {
      setError('Please enter a valid company email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await api.registerCompany({
        companyName,
        companyEmail,
        companyPhone,
        companyWebsite,
        industry: industryType,
        employeesCount: companySize === 'Custom' ? parseInt(customEmployeesCount || '50') : 50,
        address: fullAddress || 'Headquarters',
        password,
        country: country || 'India',
        stateName: stateName || 'State',
        cityName: cityName || 'City',
        ownerName: companyName + ' Admin'
      });
      setSuccess(true);
      setSuccessMsg(`Welcome! Your registration for ${companyName} has been successfully completed. You can now log in!`);
      setTimeout(() => {
        setIsLoading(false);
        setIsSignUp(false);
        setSuccess(false);
        setLoginEmail(companyEmail);
      }, 2000);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Registration failed.');
    }
  };

  const handleSSOClick = (provider: 'google' | 'apple') => {
    if (isLoading || ssoLoading) return;
    setError('');
    setSsoLoading(provider);

    setTimeout(() => {
      setSsoLoading(null);
      setSuccess(true);
      const providerName = provider === 'google' ? 'Google' : 'Apple ID';
      setSuccessMsg(`Successfully authenticated via ${providerName}. Redirecting to your panel...`);
    }, 1800);
  };

  const springTransition = { type: "spring" as const, duration: 0.65, bounce: 0.06 };

  return (
    <div 
      className="w-full max-w-[500px] lg:max-w-[1040px] min-h-[580px] lg:h-[630px] bg-white rounded-[32px] sm:rounded-[36px] relative overflow-hidden flex flex-col shadow-[0_20px_60px_-10px_rgba(0,0,0,0.07)] border border-[#e2e8f0]/80 transition-all duration-500"
      style={{ perspective: "1500px", transformStyle: "preserve-3d" }}
    >
      {success ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-grow flex flex-col justify-center items-center p-8 sm:p-12 text-center z-30"
        >
          <div className="inline-flex items-center justify-center p-4 bg-emerald-50 border border-emerald-100 rounded-full mb-4 text-emerald-600 animate-bounce">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            {isSignUp ? 'Account Created Successfully!' : 'Sign in Successful'}
          </h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm leading-relaxed">
            {successMsg}
          </p>
          <div className="w-8 h-8 border-3 border-[#3435b5] border-t-transparent rounded-full animate-spin" />
        </motion.div>
      ) : (
        <div className="flex-grow relative z-10 h-full w-full">
          
          {/* ==========================================================
              LEFT VIEW: SIGN IN FORM (EXACT MATCH TO IMAGE 2)
             ========================================================== */}
          <motion.div
            className="absolute inset-y-0 left-0 w-full lg:w-1/2 p-6 sm:p-10 lg:p-14 flex flex-col justify-center overflow-y-auto no-scrollbar z-10"
            animate={{
              opacity: isSignUp ? 0 : 1,
              x: isSignUp ? "-40px" : "0px",
              scale: isSignUp ? 0.96 : 1,
              pointerEvents: isSignUp ? "none" : "auto"
            }}
            transition={springTransition}
            style={{ display: isMobile ? (isSignUp ? 'none' : 'flex') : 'flex' }}
          >
            <div className="mb-6">
              <h2 className="text-2xl sm:text-[32px] font-extrabold text-[#0f172a] tracking-tight leading-tight">
                {isSuperownerMode ? "Superowner Login" : "Welcome back"}
              </h2>
              <p className="text-[#64748b] text-xs sm:text-[13px] mt-1.5 font-normal">
                {isSuperownerMode 
                  ? "Enter master credentials to access the Superowner platform." 
                  : "Enter your credentials to access your workspaces."
                }
              </p>
            </div>

            {error && !isSignUp && (
              <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-[14px] flex items-center gap-2">
                <span className="font-bold">Error:</span> {error}
              </div>
            )}

            {otpRequired ? (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="p-3.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs rounded-[14px] flex items-start gap-2.5 leading-relaxed">
                  <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-indigo-600" />
                  <span>A secure 6-digit verification code has been sent to <strong>{loginEmail}</strong>. Please enter the OTP to authenticate.</span>
                </div>

                <div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">
                      <ShieldCheck className="w-[18px] h-[18px]" />
                    </span>
                    <input
                      type="text"
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                      placeholder="Enter 6-Digit OTP"
                      className="w-full pl-11 pr-4 py-3 h-[48px] rounded-[14px] border border-[#cbd5e1] focus:border-[#3435b5] focus:ring-4 focus:ring-[#3435b5]/10 text-slate-900 text-sm bg-white transition-all outline-none font-mono tracking-widest text-center"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 h-[48px] py-3 px-6 bg-[#3435b5] hover:bg-[#2b2ca0] text-white font-bold text-xs sm:text-[13px] rounded-[14px] shadow-sm active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Verify & Login
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpRequired(false);
                      setOtpCode('');
                      setError('');
                    }}
                    className="flex-1 h-[48px] py-3 px-6 border border-[#cbd5e1] hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-[13px] rounded-[14px] transition-all cursor-pointer flex items-center justify-center"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Email Address Input (Matching Image 2 Box) */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">
                    <Mail className="w-[18px] h-[18px]" />
                  </span>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Email Address *"
                    className="w-full pl-11 pr-4 py-3 h-[48px] rounded-[14px] border border-[#cbd5e1] focus:border-[#3435b5] focus:ring-4 focus:ring-[#3435b5]/10 text-slate-900 text-xs sm:text-[13px] bg-white transition-all outline-none placeholder:text-slate-400 placeholder:font-medium"
                  />
                </div>

                {/* Password Input (Matching Image 2 Box) */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">
                    <Lock className="w-[18px] h-[18px]" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Password *"
                    className="w-full pl-11 pr-11 py-3 h-[48px] rounded-[14px] border border-[#cbd5e1] focus:border-[#3435b5] focus:ring-4 focus:ring-[#3435b5]/10 text-slate-900 text-xs sm:text-[13px] bg-white transition-all outline-none placeholder:text-slate-400 placeholder:font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                  </button>
                </div>

                {/* Remember me & Forgot Password */}
                <div className="flex items-center justify-between text-xs pt-1 select-none">
                  <label className="flex items-center cursor-pointer text-[#475569] font-medium">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-[#cbd5e1] text-[#3435b5] focus:ring-[#3435b5] mr-2 cursor-pointer"
                    />
                    Remember me
                  </label>
                  <a href="#forgot" className="text-xs font-semibold text-[#3435b5] hover:underline">
                    Forgot password?
                  </a>
                </div>

                {/* Two Action Buttons in One Row (Matching Image 2) */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="h-[48px] py-3 px-4 bg-[#3435b5] hover:bg-[#2b2ca0] text-white font-bold text-xs sm:text-[13px] rounded-[14px] shadow-sm active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCreateAccountClick}
                    className="h-[48px] py-3 px-4 bg-white hover:bg-slate-50 border border-[#cbd5e1] text-[#334155] font-bold text-xs sm:text-[13px] rounded-[14px] transition-all cursor-pointer flex items-center justify-center"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            )}

            {/* OR CONNECT WITH Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#e2e8f0]" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-[#94a3b8] tracking-wider">
                <span className="bg-white px-3">OR CONNECT WITH</span>
              </div>
            </div>

            {/* Social Authentication Buttons (Matching Image 2) */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSSOClick('google')}
                className="h-[46px] flex items-center justify-center gap-2 py-2.5 px-4 bg-white hover:bg-slate-50 border border-[#cbd5e1] rounded-[14px] text-xs font-semibold text-[#334155] transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                Google
              </button>

              <button
                type="button"
                onClick={() => handleSSOClick('apple')}
                className="h-[46px] flex items-center justify-center gap-2 py-2.5 px-4 bg-white hover:bg-slate-50 border border-[#cbd5e1] rounded-[14px] text-xs font-semibold text-[#334155] transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 fill-[#0f172a]" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.62.71-1.16 1.85-1.02 2.96 1.1.09 2.23-.55 2.97-1.4z" />
                </svg>
                Apple
              </button>
            </div>
          </motion.div>

          {/* ==========================================================
              RIGHT VIEW: CREATE ACCOUNT FORM (EXACT MATCH TO IMAGE 1)
             ========================================================== */}
          <motion.div
            className="absolute inset-y-0 left-0 lg:left-auto lg:right-0 w-full lg:w-1/2 p-6 sm:p-10 lg:p-14 flex flex-col justify-center overflow-y-auto no-scrollbar z-10"
            initial={{ opacity: 0 }}
            animate={{
              opacity: isSignUp ? 1 : 0,
              x: isSignUp ? "0px" : "40px",
              scale: isSignUp ? 1 : 0.96,
              pointerEvents: isSignUp ? "auto" : "none"
            }}
            transition={springTransition}
            style={{ display: isMobile ? (isSignUp ? 'flex' : 'none') : 'flex' }}
          >
            <div className="mb-4">
              <h2 className="text-2xl sm:text-[32px] font-extrabold text-[#0f172a] tracking-tight leading-tight">
                {setupRequired ? "Setup Super Owner" : "Create Account"}
              </h2>
              <p className="text-[#64748b] text-xs sm:text-[13px] mt-1 font-normal">
                {setupRequired 
                  ? "Configure the master administrative account." 
                  : "Sign up today and get onboarded to the ITLC HRMS platform."
                }
              </p>
            </div>

            {/* Stepper Progress Bar (Matching Image 1) */}
            <div className="flex items-center gap-2 py-1 mb-4 select-none">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${signUpStep === 1 ? 'text-[#3435b5]' : 'text-[#64748b]'}`}>
                1. COMPANY
              </span>
              <div className="h-[2.5px] w-16 bg-[#3435b5] rounded-full mx-1.5" />
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${signUpStep === 2 ? 'text-[#3435b5] font-bold' : 'text-[#94a3b8]'}`}>
                2. LOCATION & CREDENTIALS
              </span>
            </div>

            {error && isSignUp && (
              <div className="p-3 mb-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-[14px] flex items-center gap-2">
                <span className="font-bold">Error:</span> {error}
              </div>
            )}

            <form onSubmit={handleSignUpSubmit} className="space-y-3">
              {signUpStep === 1 ? (
                /* STEP 1: COMPANY DETAILS (2-Column Grid matching Image 1) */
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-[#334155] uppercase tracking-wider block mb-1">
                        COMPANY NAME *
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                          <Building2 className="w-[17px] h-[17px]" />
                        </span>
                        <input
                          type="text"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Company Name"
                          className="w-full pl-10 pr-3 h-[46px] rounded-[14px] border border-[#cbd5e1] focus:border-[#3435b5] focus:ring-4 focus:ring-[#3435b5]/10 text-slate-900 text-xs sm:text-[13px] bg-white transition-all outline-none font-medium placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#334155] uppercase tracking-wider block mb-1">
                        COMPANY EMAIL *
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                          <Mail className="w-[17px] h-[17px]" />
                        </span>
                        <input
                          type="email"
                          required
                          value={companyEmail}
                          onChange={(e) => setCompanyEmail(e.target.value)}
                          placeholder="name@company.com"
                          className="w-full pl-10 pr-3 h-[46px] rounded-[14px] border border-[#cbd5e1] focus:border-[#3435b5] focus:ring-4 focus:ring-[#3435b5]/10 text-slate-900 text-xs sm:text-[13px] bg-white transition-all outline-none font-medium placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-[#334155] uppercase tracking-wider block mb-1">
                        COMPANY PHONE *
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                          <Phone className="w-[17px] h-[17px]" />
                        </span>
                        <input
                          type="text"
                          required
                          value={companyPhone}
                          onChange={(e) => setCompanyPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full pl-10 pr-3 h-[46px] rounded-[14px] border border-[#cbd5e1] focus:border-[#3435b5] focus:ring-4 focus:ring-[#3435b5]/10 text-slate-900 text-xs sm:text-[13px] bg-white transition-all outline-none font-medium placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#334155] uppercase tracking-wider block mb-1">
                        COMPANY WEBSITE
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                          <Globe className="w-[17px] h-[17px]" />
                        </span>
                        <input
                          type="url"
                          value={companyWebsite}
                          onChange={(e) => setCompanyWebsite(e.target.value)}
                          placeholder="https://example.com"
                          className="w-full pl-10 pr-3 h-[46px] rounded-[14px] border border-[#cbd5e1] focus:border-[#3435b5] focus:ring-4 focus:ring-[#3435b5]/10 text-slate-900 text-xs sm:text-[13px] bg-white transition-all outline-none font-medium placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-[#334155] uppercase tracking-wider block mb-1">
                        INDUSTRY TYPE
                      </label>
                      <select
                        value={industryType}
                        onChange={(e) => setIndustryType(e.target.value)}
                        className="w-full px-3.5 h-[46px] rounded-[14px] border border-[#cbd5e1] focus:border-[#3435b5] focus:ring-4 focus:ring-[#3435b5]/10 text-slate-900 text-xs sm:text-[13px] bg-white cursor-pointer transition-all outline-none font-medium"
                      >
                        <option value="IT & Software">IT & Software</option>
                        <option value="Healthcare & Pharma">Healthcare & Pharma</option>
                        <option value="Finance & Banking">Finance & Banking</option>
                        <option value="Education & EdTech">Education & EdTech</option>
                        <option value="Retail & E-commerce">Retail & E-commerce</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Other">Other Services</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#334155] uppercase tracking-wider block mb-1">
                        COMPANY SIZE *
                      </label>
                      <select
                        value={companySize}
                        onChange={(e) => setCompanySize(e.target.value)}
                        className="w-full px-3.5 h-[46px] rounded-[14px] border border-[#cbd5e1] focus:border-[#3435b5] focus:ring-4 focus:ring-[#3435b5]/10 text-slate-900 text-xs sm:text-[13px] bg-white cursor-pointer transition-all outline-none font-medium"
                      >
                        <option value="1-10 Employees">1-10 Employees</option>
                        <option value="11-50 Employees">11-50 Employees</option>
                        <option value="51-200 Employees">51-200 Employees</option>
                        <option value="201-500 Employees">201-500 Employees</option>
                        <option value="500+ Employees">500+ Employees</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div>
                  </div>

                  {companySize === 'Custom' && (
                    <div>
                      <label className="text-[10px] font-bold text-[#334155] uppercase tracking-wider block mb-1">
                        CUSTOM EMPLOYEE COUNT *
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={customEmployeesCount}
                        onChange={(e) => setCustomEmployeesCount(e.target.value)}
                        placeholder="Enter total employees"
                        className="w-full px-3.5 h-[46px] rounded-[14px] border border-[#cbd5e1] focus:border-[#3435b5] focus:ring-4 focus:ring-[#3435b5]/10 text-slate-900 text-xs sm:text-[13px] bg-white transition-all outline-none font-medium"
                      />
                    </div>
                  )}

                  {/* Full Width Next Step Button (Matching Image 1) */}
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full h-[48px] py-3 bg-[#3435b5] hover:bg-[#2b2ca0] text-white font-bold text-xs sm:text-[13px] rounded-[14px] shadow-sm active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
                  >
                    Next Step →
                  </button>
                </div>
              ) : (
                /* STEP 2: LOCATION & CREDENTIALS */
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-[#334155] uppercase tracking-wider block mb-1">
                      FULL ADDRESS *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                        <MapPin className="w-[17px] h-[17px]" />
                      </span>
                      <input
                        type="text"
                        required
                        value={fullAddress}
                        onChange={(e) => setFullAddress(e.target.value)}
                        placeholder="HQ Address / Street / Tech Park"
                        className="w-full pl-10 pr-3 h-[46px] rounded-[14px] border border-[#cbd5e1] focus:border-[#3435b5] focus:ring-4 focus:ring-[#3435b5]/10 text-slate-900 text-xs sm:text-[13px] bg-white transition-all outline-none font-medium placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-[10px] font-bold text-[#334155] uppercase tracking-wider block mb-1">
                        COUNTRY *
                      </label>
                      <input
                        type="text"
                        required
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Country"
                        className="w-full px-3 h-[44px] rounded-[14px] border border-[#cbd5e1] focus:border-[#3435b5] focus:ring-4 focus:ring-[#3435b5]/10 text-slate-900 text-xs bg-white transition-all outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#334155] uppercase tracking-wider block mb-1">
                        STATE *
                      </label>
                      <input
                        type="text"
                        required
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        placeholder="State"
                        className="w-full px-3 h-[44px] rounded-[14px] border border-[#cbd5e1] focus:border-[#3435b5] focus:ring-4 focus:ring-[#3435b5]/10 text-slate-900 text-xs bg-white transition-all outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#334155] uppercase tracking-wider block mb-1">
                        CITY *
                      </label>
                      <input
                        type="text"
                        required
                        value={cityName}
                        onChange={(e) => setCityName(e.target.value)}
                        placeholder="City"
                        className="w-full px-3 h-[44px] rounded-[14px] border border-[#cbd5e1] focus:border-[#3435b5] focus:ring-4 focus:ring-[#3435b5]/10 text-slate-900 text-xs bg-white transition-all outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-[#334155] uppercase tracking-wider block mb-1">
                        PASSWORD *
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                          <Lock className="w-[17px] h-[17px]" />
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-9 h-[46px] rounded-[14px] border border-[#cbd5e1] focus:border-[#3435b5] focus:ring-4 focus:ring-[#3435b5]/10 text-slate-900 text-xs sm:text-[13px] bg-white transition-all outline-none font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#334155] uppercase tracking-wider block mb-1">
                        CONFIRM PASSWORD *
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                          <Lock className="w-[17px] h-[17px]" />
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-3 h-[46px] rounded-[14px] border border-[#cbd5e1] focus:border-[#3435b5] focus:ring-4 focus:ring-[#3435b5]/10 text-slate-900 text-xs sm:text-[13px] bg-white transition-all outline-none font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSignUpStep(1)}
                      className="h-[48px] py-3 px-5 border border-[#cbd5e1] hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-[14px] transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 h-[48px] py-3 px-6 bg-[#3435b5] hover:bg-[#2b2ca0] text-white font-bold text-xs sm:text-[13px] rounded-[14px] shadow-sm active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          {setupRequired ? 'Initialize Platform' : 'Create Account'}
                          <Check className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </motion.div>

          {/* ==========================================================
              DESKTOP SLIDING OVERLAY PANEL (EXACT MATCH TO BOTH IMAGES)
             ========================================================== */}
          <motion.div
            className="absolute top-0 bottom-0 left-0 w-1/2 z-20 hidden lg:flex flex-col justify-center items-center text-center p-8 sm:p-10 overflow-hidden text-white shadow-2xl"
            animate={{
              x: isSignUp ? "0%" : "100%",
              borderRadius: isSignUp ? "32px 72px 72px 32px" : "72px 32px 32px 72px"
            }}
            transition={springTransition}
            style={{
              background: "linear-gradient(145deg, #181552 0%, #1e1b64 35%, #2a258a 70%, #191654 100%)",
              transformStyle: "preserve-3d"
            }}
          >
            {/* Subtle ambient lighting */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-400/10 via-transparent to-transparent opacity-80 pointer-events-none" />
            <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-white/5 blur-2xl pointer-events-none" />
            <div className="absolute bottom-10 left-10 w-36 h-36 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

            <div className="relative z-10 w-full max-w-[390px] flex flex-col items-center">
              
              {/* Dark UI Analytics Mockup (Exact match to images) */}
              <div className="w-full overflow-hidden relative max-w-[360px] mb-2">
                <div ref={emblaRef} className="overflow-hidden w-full">
                  <div className="flex">
                    {slides.map((slide) => (
                      <div 
                        key={slide.id} 
                        className="flex-[0_0_100%] min-w-0 flex flex-col justify-center items-center relative py-1 px-1"
                      >
                        <DarkDashboardMockup />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Pagination Dots (Active Capsule + 4 Dots) */}
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  {scrollSnaps.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => scrollTo(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        index === selectedIndex 
                          ? 'w-6 bg-white' 
                          : 'w-1.5 bg-white/35 hover:bg-white/60'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Text & White Pill Switch Button */}
              <div className="w-full mt-4">
                <AnimatePresence mode="wait">
                  {isSignUp ? (
                    /* Image 1 Content (Left side in Create Account Mode) */
                    <motion.div
                      key="signup-text"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-3 flex flex-col items-center"
                    >
                      <h3 className="text-xl sm:text-[22px] font-bold tracking-tight text-white">
                        Already registered?
                      </h3>
                      <p className="text-indigo-100/90 text-xs sm:text-[13px] leading-relaxed max-w-[290px]">
                        To keep connected with your workspaces and teams, please sign in with your credentials.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleToggleMode(false)}
                        className="mt-2 py-2.5 px-9 bg-white hover:bg-slate-50 text-[#0f172a] font-bold text-xs sm:text-[13px] rounded-full shadow-lg transition-all active:scale-[0.96] cursor-pointer"
                      >
                        Sign In
                      </button>
                    </motion.div>
                  ) : (
                    /* Image 2 Content (Right side in Sign In Mode) */
                    <motion.div
                      key="login-text"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-3 flex flex-col items-center"
                    >
                      <h3 className="text-xl sm:text-[22px] font-bold tracking-tight text-white">
                        New to Apex Suite?
                      </h3>
                      <p className="text-indigo-100/90 text-xs sm:text-[13px] leading-relaxed max-w-[290px]">
                        Enter your organizational details and start managing your company analytics forecasts.
                      </p>
                      <button
                        type="button"
                        onClick={handleCreateAccountClick}
                        className="mt-2 py-2.5 px-9 bg-white hover:bg-slate-50 text-[#0f172a] font-bold text-xs sm:text-[13px] rounded-full shadow-lg transition-all active:scale-[0.96] cursor-pointer"
                      >
                        Create Account
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </motion.div>

        </div>
      )}
    </div>
  );
}
