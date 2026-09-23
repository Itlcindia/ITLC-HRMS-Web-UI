import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles, 
  Building2, Phone, Check, Globe, MapPin 
} from 'lucide-react';
import { api } from '../services/api';
import { paymentService } from '../services/paymentService';

const slides = [
  { id: 2, title: "HRMS Employee Hub", image: "/dashboards/hrms_employee.png" },
  { id: 1, title: "CRM Dashboard Analytics", image: "/dashboards/crm_analytics.png" },
  { id: 3, title: "Project Management Board", image: "/dashboards/project_management.png" },
  { id: 4, title: "Sales & Revenue Forecasts", image: "/dashboards/sales_revenue.png" },
  { id: 5, title: "Team Collaboration Channels", image: "/dashboards/team_collaboration.png" },
  { id: 6, title: "AI-Powered Insights", image: "/dashboards/ai_insights.png" }
];

// Floating input component for login visual excellence
const FloatingInput = ({ 
  id, label, type, value, onChange, icon: Icon, required = false 
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: any;
  required?: boolean;
}) => {
  const [focused, setFocused] = useState(false);
  const active = focused || !!value;
  return (
    <div className="relative w-full">
      {!active && (
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
          <Icon className="w-4 h-4" />
        </span>
      )}
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full pr-4 py-2.5 premium-input rounded-xl text-slate-900 text-xs peer placeholder-transparent focus:ring-4 focus:ring-indigo-500/10"
        style={{ paddingLeft: active ? '12px' : '40px' }}
        placeholder={label}
      />
      <label
        htmlFor={id}
        className={`absolute transition-all duration-200 pointer-events-none text-slate-400 text-xs select-none
          ${active 
            ? '-top-2 left-3 bg-white px-1.5 text-[9px] font-bold text-indigo-650 rounded shadow-sm border border-indigo-100' 
            : 'top-3 left-10 text-xs'
          }`}
      >
        {label} {required && '*'}
      </label>
    </div>
  );
};

// Floating password input with toggle button
const FloatingPasswordInput = ({ 
  id, label, value, onChange, showPassword, setShowPassword, required = false 
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  required?: boolean;
}) => {
  const [focused, setFocused] = useState(false);
  const active = focused || !!value;
  return (
    <div className="relative w-full">
      {!active && (
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
          <Lock className="w-4 h-4" />
        </span>
      )}
      <input
        id={id}
        type={showPassword ? 'text' : 'password'}
        required={required}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full pr-10 py-2.5 premium-input rounded-xl text-slate-900 text-xs peer placeholder-transparent focus:ring-4 focus:ring-indigo-500/10"
        style={{ paddingLeft: active ? '12px' : '40px' }}
        placeholder={label}
      />
      <label
        htmlFor={id}
        className={`absolute transition-all duration-200 pointer-events-none text-slate-400 text-xs select-none
          ${active 
            ? '-top-2 left-3 bg-white px-1.5 text-[9px] font-bold text-indigo-650 rounded shadow-sm border border-indigo-100' 
            : 'top-3 left-10 text-xs'
          }`}
      >
        {label} {required && '*'}
      </label>
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-indigo-500 hover:text-indigo-700 transition-colors"
      >
        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};

export default function LoginForm({
  onSuccessLogin,
  isSuperownerMode = false,
  onOpenRegister,
  initialPlanId,
  initialSignUp = false
}: {
  onSuccessLogin?: (email: string, pass: string) => void;
  isSuperownerMode?: boolean;
  onOpenRegister?: () => void;
  initialPlanId?: string;
  initialSignUp?: boolean;
}) {
  const [isSignUp, setIsSignUp] = useState(() => {
    if (initialSignUp) return true;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const hash = window.location.hash.toLowerCase();
      return urlParams.get('mode') === 'signup' || urlParams.get('mode') === 'register' || hash === '#signup' || hash === '#register';
    } catch {
      return false;
    }
  });
  const [setupRequired, setSetupRequired] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Live Subscription Plans from Super Owner
  const [availablePlans, setAvailablePlans] = useState<any[]>([
    { id: 'starter', name: 'STARTER', priceMonthly: 499, seatLimit: 50 },
    { id: 'premium', name: 'PREMIUM', priceMonthly: 999, seatLimit: 100 },
    { id: 'demo', name: 'DEMO', priceMonthly: 199, seatLimit: 10 }
  ]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(() => {
    if (initialPlanId) return initialPlanId;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('plan') || localStorage.getItem('itlc_selected_onboarding_plan') || 'starter';
    } catch {
      return 'starter';
    }
  });
  const [registeredCompanyData, setRegisteredCompanyData] = useState<any>(null);
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);

  useEffect(() => {
    if (initialPlanId) setSelectedPlanId(initialPlanId);
  }, [initialPlanId]);

  useEffect(() => {
    if (initialSignUp !== undefined) setIsSignUp(initialSignUp);
  }, [initialSignUp]);

  useEffect(() => {
    api.getPlans().then((plans: any) => {
      if (Array.isArray(plans) && plans.length > 0) {
        setAvailablePlans(plans);
        if (!initialPlanId) {
          const pop = plans.find((p: any) => p.badge?.toLowerCase().includes('popular') || p.id === 'starter');
          if (pop) setSelectedPlanId(pop.id);
        }
      }
    }).catch(() => {});
  }, [initialPlanId]);

  const handleCreateAccountClick = () => {
    if (onOpenRegister) {
      onOpenRegister();
    } else {
      handleToggleMode(true);
    }
  };

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1024px)');
    setIsMobile(media.matches);
    const listener = (e) => setIsMobile(e.matches);
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
  const [industryType, setIndustryType] = useState('IT');
  const [companySize, setCompanySize] = useState('11-50 Employees');
  const [customEmployeesCount, setCustomEmployeesCount] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [country, setCountry] = useState('');
  const [stateName, setStateName] = useState('');
  const [cityName, setCityName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signUpStep, setSignUpStep] = useState(1);

  // Focus States for Sign Up Inputs
  const [focusCompanyName, setFocusCompanyName] = useState(false);
  const [focusCompanyEmail, setFocusCompanyEmail] = useState(false);
  const [focusCompanyPhone, setFocusCompanyPhone] = useState(false);
  const [focusCompanyWebsite, setFocusCompanyWebsite] = useState(false);
  const [focusAddress, setFocusAddress] = useState(false);
  const [focusPassword, setFocusPassword] = useState(false);
  const [focusConfirmPassword, setFocusConfirmPassword] = useState(false);

  // Status States
  const [isLoading, setIsLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState<'google' | 'apple' | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [focusOtp, setFocusOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);

  // Embla Carousel settings for background slider in the sliding overlay
  const autoplayOptions = { delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true };
  const autoplayRef = useRef(Autoplay(autoplayOptions));
  
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, skipSnaps: false }, 
    [autoplayRef.current]
  );
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
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

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
    if (autoplayRef.current) {
      autoplayRef.current.play();
    }
  };

  const resetSignUpState = () => {
    setCompanyName('');
    setCompanyEmail('');
    setCompanyPhone('');
    setCompanyWebsite('');
    setIndustryType('IT');
    setCompanySize('11-50 Employees');
    setCustomEmployeesCount('');
    setFullAddress('');
    setCountry('');
    setStateName('');
    setCityName('');
    setPassword('');
    setConfirmPassword('');
    setSignUpStep(1);
  };

  const handleNextStep = () => {
    if (!companyName || !companyEmail || !companyPhone) {
      setError('Please fill in all required (*) fields.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(companyEmail)) {
      setError('Please enter a valid company email address.');
      return;
    }
    setError('');
    setSignUpStep(2);
  };

  const handleToggleMode = (signUpMode: boolean) => {
    setIsSignUp(signUpMode);
    resetSignUpState();
    setError('');
  };

  // Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loginEmail || !loginPassword) {
      setError('Please fill in all fields.');
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
      const result = await api.verifyOtp({
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

    if (!companyName || !companyEmail || !companyPhone || !country || !stateName || !cityName || !password || !confirmPassword) {
      setError('Please fill in all fields.');
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
      const selectedPlan = availablePlans.find((p: any) => p.id === selectedPlanId);
      const planPrice = Number(selectedPlan?.priceMonthly || selectedPlan?.price || 499);

      // Direct registration without subscription plan: created as unpaid preview
      const regRes = await api.registerCompany({
        companyName,
        companyEmail,
        companyPhone,
        password,
        country,
        stateName,
        cityName,
        ownerName: companyName + ' Admin',
        subscriptionPlanId: 'none',
        planId: 'none',
        plan: null,
        seatLimit: 10,
        maxEmployees: 10,
        storageLimitGb: 10,
        email: companyEmail,
        subscriptionStatus: 'unpaid',
        status: 'active'
      });

      setSuccess(true);
      setSuccessMsg(`Workspace "${companyName}" created successfully! Logging you into your dashboard...`);
      setTimeout(() => {
        if (onSuccessLogin) onSuccessLogin(companyEmail, password);
      }, 1000);
      setIsLoading(false);
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

  const springTransition = { type: "spring" as const, duration: 0.65, bounce: 0.12 };

  return (
    <div 
      className="w-full max-w-[480px] lg:max-w-[960px] h-auto lg:h-[580px] min-h-[520px] py-8 lg:py-0 rounded-3xl glass-panel relative overflow-hidden flex flex-col group border-indigo-100 shadow-[0_20px_50px_-12px_rgba(79,70,229,0.06)] hover:shadow-[0_24px_60px_-10px_rgba(79,70,229,0.09)] transition-all duration-500"
      style={{ perspective: "1500px", transformStyle: "preserve-3d" }}
    >
      <div className="absolute -top-24 -left-20 w-52 h-52 bg-gradient-to-tr from-indigo-500/10 to-violet-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-20 w-52 h-52 bg-gradient-to-tr from-purple-500/10 to-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {success ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-grow flex flex-col justify-center items-center p-6 sm:p-12 text-center z-10"
        >
          <div className="inline-flex items-center justify-center p-3 bg-emerald-50 border border-emerald-100 rounded-full mb-4 text-emerald-600 animate-bounce">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-fluid-title font-semibold text-slate-900 mb-2">
            {isSignUp ? 'Account Created Successfully!' : 'Sign in Successful'}
          </h3>
          <p className="text-slate-550 text-fluid-body mb-6 max-w-sm leading-relaxed">
            {successMsg}
          </p>
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </motion.div>
      ) : (
        <div className="flex-grow relative z-10 h-full">
          
          <motion.div
            className="absolute inset-y-0 left-0 w-full lg:w-1/2 p-4 sm:p-6 lg:p-8 flex flex-col justify-center space-y-2.5 overflow-y-auto no-scrollbar"
            animate={{
              opacity: isSignUp ? 0 : 1,
              x: isSignUp ? "-30px" : "0px",
              scale: isSignUp ? 0.96 : 1,
              pointerEvents: isSignUp ? "none" : "auto"
            }}
            transition={springTransition}
            style={{ display: isMobile ? (isSignUp ? 'none' : 'flex') : 'flex' }}
          >
            <div>
              <div className="inline-flex items-center justify-center p-2.5 bg-gradient-to-tr from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl text-indigo-650 shadow-sm mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight">
                {isSuperownerMode ? (
                  <>Superowner <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">Login</span></>
                ) : (
                  <>Welcome <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">back</span></>
                )}
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                {isSuperownerMode ? "Enter credentials for Superowner Dashboard access." : "Enter your credentials to access your workspaces."}
              </p>
            </div>

            {error && !isSignUp && (
              <div className="p-2.5 my-2.5 bg-rose-50 border border-rose-100 text-rose-600 text-[10px] rounded-lg">
                {error}
              </div>
            )}

            {otpRequired ? (
              <form onSubmit={handleOtpSubmit} className="space-y-4 mt-2">
                <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] rounded-xl flex items-start gap-2 leading-relaxed">
                  <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>A secure 6-digit verification code has been sent to <strong>{loginEmail}</strong>. Please enter the OTP to authenticate.</span>
                </div>

                <FloatingInput 
                  id="login-otp"
                  label="Enter 6-Digit OTP Code"
                  type="text"
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                  icon={ShieldCheck}
                />

                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-slate-500 text-[11px]">Didn't receive code?</span>
                  <button
                    type="button"
                    disabled={isResendingOtp}
                    onClick={async () => {
                      setIsResendingOtp(true);
                      setError('');
                      try {
                        const res = await api.resendOtp(loginEmail);
                        setSuccessMsg(res.message || 'A fresh OTP has been sent to your email.');
                      } catch (err: any) {
                        setError(err.message || 'Failed to resend OTP.');
                      } finally {
                        setIsResendingOtp(false);
                      }
                    }}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                  >
                    {isResendingOtp ? 'Sending...' : 'Resend Code'}
                  </button>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-500 hover:to-violet-600 text-white font-semibold text-xs rounded-xl shadow-[0_4px_12px_rgba(79,70,229,0.22)] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    {isLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Verify & Login
                        <ArrowRight className="w-3 h-3" />
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
                    className="flex-1 py-2.5 px-3 border border-slate-200 hover:border-slate-350 bg-white text-slate-600 hover:bg-slate-50 font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLoginSubmit} className="space-y-3 mt-2">
                <FloatingInput 
                  id="login-email"
                  label="Email Address"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  icon={Mail}
                />

                <FloatingPasswordInput 
                  id="login-password"
                  label="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  required
                />

                <div className="flex items-center justify-between text-xs pt-1 select-none">
                  <label className="flex items-center cursor-pointer text-slate-500">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-3.5 w-3.5 rounded bg-white border-indigo-200/80 text-indigo-600 focus:ring-0 cursor-pointer mr-1.5"
                    />
                    Remember me
                  </label>
                  <a href="#forgot" className="text-indigo-600 hover:underline font-semibold">Forgot password?</a>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-500 hover:to-violet-600 text-white font-semibold text-xs rounded-xl shadow-[0_4px_12px_rgba(79,70,229,0.22)] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    {isLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateAccountClick}
                    className="flex-1 py-2.5 px-3 border border-indigo-200 hover:border-indigo-400 bg-white text-indigo-600 hover:bg-indigo-50/30 font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            )}

            <div className="mt-3.5">
              <div className="relative my-1.5">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-[9px] uppercase font-bold text-slate-400">
                  <span className="bg-white px-1.5">Or connect with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSSOClick('google')}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-semibold text-slate-600 transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
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
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-semibold text-slate-600 transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.62.71-1.16 1.85-1.02 2.96 1.1.09 2.23-.55 2.97-1.4z" />
                  </svg>
                  Apple
                </button>
              </div>




            </div>
          </motion.div>

          <motion.div
            className="absolute inset-y-0 left-0 lg:left-auto lg:right-0 w-full lg:w-1/2 p-4 sm:p-6 lg:p-8 flex flex-col justify-center space-y-2.5 overflow-y-auto no-scrollbar"
            initial={{ opacity: 0 }}
            animate={{
              opacity: isSignUp ? 1 : 0,
              x: isSignUp ? "0px" : "30px",
              scale: isSignUp ? 1 : 0.96,
              pointerEvents: isSignUp ? "auto" : "none"
            }}
            transition={springTransition}
            style={{ display: isMobile ? (isSignUp ? 'flex' : 'none') : 'flex' }}
          >
            <div>
              <div className="inline-flex items-center justify-center p-1.5 bg-gradient-to-tr from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl mb-1.5 text-indigo-655 shadow-sm">
                <Sparkles className="w-4 h-4 animate-pulse text-indigo-600" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900 tracking-tight">
                {setupRequired ? (
                  <>Setup <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">Super Owner</span></>
                ) : (
                  <>Create <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">Account</span></>
                )}
              </h2>
              <p className="text-slate-400 text-[11px] mt-0.5">
                {setupRequired ? 'First-time setup detected. Configure the platform master administrator.' : 'Sign up today and get onboarded to the Apex Suite platform.'}
              </p>
            </div>

            {/* Step progress bar */}
            <div className="w-full flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-slate-450 select-none py-1">
              <span className={signUpStep === 1 ? 'text-indigo-600' : ''}>1. Company</span>
              <div className="flex-1 mx-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-300" 
                  style={{ width: signUpStep === 1 ? '50%' : '100%' }}
                />
              </div>
              <span className={signUpStep === 2 ? 'text-indigo-600' : ''}>2. Location & Credentials</span>
            </div>

            {error && isSignUp && (
              <div className="p-2.5 my-2 bg-rose-50 border border-rose-100 text-rose-600 text-[10px] rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSignUpSubmit} className="space-y-3 mt-1.5">
              {signUpStep === 1 ? (
                /* STEP 1 FIELDS */
                <div className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-0.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{setupRequired ? 'Full Name *' : 'Company Name *'}</label>
                      <div className="relative">
                        {!(focusCompanyName || companyName) && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-500 pointer-events-none">
                            <Building2 className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <input
                          type="text"
                          required
                          value={companyName}
                          onFocus={() => setFocusCompanyName(true)}
                          onBlur={() => setFocusCompanyName(false)}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full pr-3 py-1.5 premium-input rounded-xl text-slate-900 text-xs focus:ring-4 focus:ring-indigo-500/10"
                          style={{ paddingLeft: (focusCompanyName || companyName) ? '12px' : '36px' }}
                        />
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{setupRequired ? 'Email Address *' : 'Company Email *'}</label>
                      <div className="relative">
                        {!(focusCompanyEmail || companyEmail) && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-500 pointer-events-none">
                            <Mail className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <input
                          type="email"
                          required
                          value={companyEmail}
                          onFocus={() => setFocusCompanyEmail(true)}
                          onBlur={() => setFocusCompanyEmail(false)}
                          onChange={(e) => setCompanyEmail(e.target.value)}
                          className="w-full pr-3 py-1.5 premium-input rounded-xl text-slate-900 text-xs focus:ring-4 focus:ring-indigo-500/10"
                          style={{ paddingLeft: (focusCompanyEmail || companyEmail) ? '12px' : '36px' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-0.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{setupRequired ? 'Mobile Number *' : 'Company Phone *'}</label>
                      <div className="relative">
                        {!(focusCompanyPhone || companyPhone) && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-500 pointer-events-none">
                            <Phone className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <input
                          type="text"
                          required
                          value={companyPhone}
                          onFocus={() => setFocusCompanyPhone(true)}
                          onBlur={() => setFocusCompanyPhone(false)}
                          onChange={(e) => setCompanyPhone(e.target.value)}
                          className="w-full pr-3 py-1.5 premium-input rounded-xl text-slate-900 text-xs focus:ring-4 focus:ring-indigo-500/10"
                          style={{ paddingLeft: (focusCompanyPhone || companyPhone) ? '12px' : '36px' }}
                        />
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Company Website</label>
                      <div className="relative">
                        {!(focusCompanyWebsite || companyWebsite) && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-500 pointer-events-none">
                            <Globe className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <input
                          type="url"
                          value={companyWebsite}
                          onFocus={() => setFocusCompanyWebsite(true)}
                          onBlur={() => setFocusCompanyWebsite(false)}
                          onChange={(e) => setCompanyWebsite(e.target.value)}
                          className="w-full pr-3 py-1.5 premium-input rounded-xl text-slate-900 text-xs focus:ring-4 focus:ring-indigo-500/10"
                          style={{ paddingLeft: (focusCompanyWebsite || companyWebsite) ? '12px' : '36px' }}
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-0.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Industry Type</label>
                      <select
                        value={industryType}
                        onChange={(e) => setIndustryType(e.target.value)}
                        className="w-full px-2.5 py-1.5 premium-input rounded-xl text-slate-900 text-xs cursor-pointer focus:ring-4 focus:ring-indigo-500/10"
                      >
                        <option value="IT">IT & Software</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Education">Education</option>
                        <option value="Finance">Finance & Banking</option>
                        <option value="Other">Other Services</option>
                      </select>
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Company Size *</label>
                      <select
                        value={companySize}
                        onChange={(e) => setCompanySize(e.target.value)}
                        className="w-full px-2.5 py-1.5 premium-input rounded-xl text-slate-900 text-xs cursor-pointer focus:ring-4 focus:ring-indigo-500/10"
                      >
                        <option value="1-10 Employees">1-10 Employees</option>
                        <option value="11-50 Employees">11-50 Employees</option>
                        <option value="51-200 Employees">51-200 Employees</option>
                        <option value="200+ Employees">200+ Employees</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div>
                  </div>

                  {companySize === 'Custom' && (
                    <div className="space-y-0.5 animate-fade-in">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Employee Count *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={customEmployeesCount}
                        onChange={(e) => setCustomEmployeesCount(e.target.value)}
                        className="w-full px-3 py-1.5 premium-input rounded-xl text-slate-900 text-xs focus:ring-4 focus:ring-indigo-500/10"
                        placeholder="Enter custom employees count"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2.5 pt-1.5">
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="flex-grow py-2 px-4 bg-gradient-to-r from-indigo-650 to-indigo-700 hover:from-indigo-600 hover:to-indigo-650 text-white font-semibold text-xs rounded-xl shadow-[0_3px_10px_rgba(79,70,229,0.18)] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      Next Step
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleMode(false)}
                      className="py-2 px-4 border border-indigo-200 hover:border-indigo-400 bg-white text-indigo-600 hover:bg-indigo-50/20 font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center"
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              ) : (
                /* STEP 2 FIELDS */
                <div className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-0.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Full Address *</label>
                      <div className="relative">
                        {!(focusAddress || fullAddress) && (
                          <span className="absolute top-2 left-3 text-indigo-500 pointer-events-none">
                            <MapPin className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <textarea
                          rows={1}
                          required
                          value={fullAddress}
                          onFocus={() => setFocusAddress(true)}
                          onBlur={() => setFocusAddress(false)}
                          onChange={(e) => setFullAddress(e.target.value)}
                          className="w-full pr-3 py-1 premium-input rounded-xl text-slate-900 text-xs resize-none focus:ring-4 focus:ring-indigo-500/10"
                          style={{ paddingLeft: (focusAddress || fullAddress) ? '12px' : '36px' }}
                          placeholder="Street details..."
                        />
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Country *</label>
                      <input
                        type="text"
                        required
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-3 py-1.5 premium-input rounded-xl text-slate-900 text-xs focus:ring-4 focus:ring-indigo-500/10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-0.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">State *</label>
                      <input
                        type="text"
                        required
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className="w-full px-3 py-1.5 premium-input rounded-xl text-slate-900 text-xs focus:ring-4 focus:ring-indigo-500/10"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">City *</label>
                      <input
                        type="text"
                        required
                        value={cityName}
                        onChange={(e) => setCityName(e.target.value)}
                        className="w-full px-3 py-1.5 premium-input rounded-xl text-slate-900 text-xs focus:ring-4 focus:ring-indigo-500/10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-0.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Password *</label>
                      <div className="relative">
                        {!(focusPassword || password) && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-indigo-500 pointer-events-none">
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onFocus={() => setFocusPassword(true)}
                          onBlur={() => setFocusPassword(false)}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pr-9 py-1.5 premium-input rounded-xl text-slate-900 text-xs focus:ring-4 focus:ring-indigo-500/10"
                          style={{ paddingLeft: (focusPassword || password) ? '14px' : '38px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-indigo-500 hover:text-indigo-700"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Confirm Password *</label>
                      <div className="relative">
                        {!(focusConfirmPassword || confirmPassword) && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-indigo-500 pointer-events-none">
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onFocus={() => setFocusConfirmPassword(true)}
                          onBlur={() => setFocusConfirmPassword(false)}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pr-3 py-1.5 premium-input rounded-xl text-slate-900 text-xs focus:ring-4 focus:ring-indigo-500/10"
                          style={{ paddingLeft: (focusConfirmPassword || confirmPassword) ? '14px' : '38px' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 pt-1.5">
                    <button
                      type="button"
                      onClick={() => setSignUpStep(1)}
                      className="py-2 px-3 border border-slate-200 hover:border-slate-400 bg-white text-slate-600 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-grow py-2 px-4 bg-gradient-to-r from-indigo-650 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs rounded-xl shadow-[0_3px_10px_rgba(79,70,229,0.18)] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isLoading ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          {setupRequired ? 'Initialize Platform' : 'Create Account'}
                          <Check className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>

          </motion.div>

          {/* ==========================================================
              DESKTOP SLIDING OVERLAY PANEL (Only visible on desktop)
             ========================================================== */}
          <motion.div
            className="absolute top-0 bottom-0 left-0 w-1/2 z-20 hidden lg:flex flex-col justify-center items-center text-center p-8 overflow-hidden text-white shadow-2xl border-l border-white/10"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{
              x: isSignUp ? "0%" : "100%",
              borderRadius: isSignUp ? "0px 120px 120px 0px" : "120px 0px 0px 120px"
            }}
            transition={springTransition}
            style={{
              background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
              transformStyle: "preserve-3d"
            }}
          >
            {/* Background design accents in the overlay panel */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-60 z-0 pointer-events-none" />
            <div className="absolute top-10 right-10 w-24 h-24 rounded-full bg-white/5 blur-xl pointer-events-none" />
            <div className="absolute bottom-10 left-10 w-32 h-32 rounded-full bg-indigo-300/10 blur-2xl pointer-events-none" />

            <div className="relative z-10 w-full max-w-[370px] flex flex-col items-center space-y-6">
              
              {/* Blue Image Slideshow inside the overlay */}
              <div className="w-full overflow-hidden relative max-w-[360px]">
                <div ref={emblaRef} className="overflow-hidden w-full">
                  <div className="flex">
                    {slides.map((slide) => (
                      <div 
                        key={slide.id} 
                        className="flex-[0_0_100%] min-w-0 flex flex-col justify-center items-center relative"
                      >
                        <div className="relative w-full py-2 px-1">
                          {/* 3D Perspective Card Container */}
                          <div 
                            className="w-full transition-transform duration-300 ease-out"
                            style={{ perspective: '1200px' }}
                          >
                            <motion.div
                              animate={{
                                rotateY: mousePosition.x * 12,
                                rotateX: mousePosition.y * -12,
                                z: 20
                              }}
                              transition={{ type: "spring", stiffness: 200, damping: 25 }}
                              className="relative w-full rounded-2xl glass-card overflow-hidden border border-white shadow-xl"
                            >
                              {/* Shadow depth effect */}
                              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/20 via-transparent to-purple-50/10 pointer-events-none" />
                              
                              {/* Screen reflection highlight */}
                              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

                              <img 
                                src={slide.image} 
                                alt={slide.title} 
                                loading="lazy"
                                className="w-full h-auto aspect-[16/10] object-cover select-none pointer-events-none rounded-xl filter saturate-[0.7] contrast-[1.05] brightness-[0.95]"
                              />

                              {/* Premium Blue Tint Overlay */}
                              <div className="absolute inset-0 bg-blue-600/30 mix-blend-color pointer-events-none rounded-xl" />
                              <div className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay pointer-events-none rounded-xl" />

                              {/* Glowing highlight ring */}
                              <div className="absolute inset-0 border border-indigo-500/10 rounded-2xl pointer-events-none" />
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Pagination Dots centered below image */}
                <div className="flex justify-center gap-1.5 mt-2">
                  {scrollSnaps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => scrollTo(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        index === selectedIndex 
                          ? 'w-4 bg-white' 
                          : 'w-1.5 bg-white/40 hover:bg-white/60'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Text content below slideshow */}
              <div className="w-full">
                <AnimatePresence mode="wait">
                  {isSignUp ? (
                    <motion.div
                      key="signup-text"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <h3 className="text-xl font-bold font-display tracking-tight">Already registered?</h3>
                      <p className="text-indigo-100 text-xs leading-relaxed">
                        To keep connected with your workspaces and teams, please sign in with your credentials.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleToggleMode(false)}
                        className="py-2.5 px-6 border border-white hover:bg-white hover:text-indigo-900 font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.96] cursor-pointer"
                      >
                        Sign In
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="login-text"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <h3 className="text-xl font-bold font-display tracking-tight">New to Apex Suite?</h3>
                      <p className="text-indigo-100 text-xs leading-relaxed">
                        Enter your organizational details and start managing your company analytics forecasts.
                      </p>
                      <button
                        type="button"
                        onClick={handleCreateAccountClick}
                        className="py-2.5 px-6 border border-white hover:bg-white hover:text-indigo-900 font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.96] cursor-pointer"
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

