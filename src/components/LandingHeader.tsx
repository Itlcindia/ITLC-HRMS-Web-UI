import React, { useState } from 'react';
import { ArrowRight, ChevronRight, LayoutDashboard, Menu, X } from 'lucide-react';

interface LandingHeaderProps {
  logoUrl?: string;
  loggedIn?: boolean;
  onHome: () => void;
  onFeatures: () => void;
  onPricing: () => void;
  onSolutions: () => void;
  onSecurity?: () => void;
  onLogin: () => void;
  onGetStarted: () => void;
  onDashboard?: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  logoUrl = '/itlc_logo.png',
  loggedIn = false,
  onHome,
  onFeatures,
  onPricing,
  onSolutions,
  onSecurity,
  onLogin,
  onGetStarted,
  onDashboard
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogoError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = '/itlc_logo.png';
  };

  const handleNavClick = (action: () => void) => {
    setIsMobileMenuOpen(false);
    action();
  };

  return (
    <>
      <header className="itlc-reference-nav">
        <button className="itlc-reference-brand" type="button" onClick={onHome}>
          <img src={logoUrl || '/itlc_logo.png'} alt="ITLC India" onError={handleLogoError} />
        </button>

        <nav className="itlc-reference-menu" aria-label="Primary navigation">
          <button type="button" onClick={onFeatures}>Features</button>
          <button type="button" onClick={onPricing}>Pricing</button>
          <button type="button" onClick={onSolutions}>Workspaces</button>
          {onSecurity && <button type="button" onClick={onSecurity}>Security</button>}
        </nav>

        <div className="itlc-reference-actions flex items-center gap-2 md:gap-3">
          {loggedIn && onDashboard ? (
            <button className="itlc-reference-login hidden sm:inline-flex" type="button" onClick={onDashboard}>
              <LayoutDashboard size={15} />
              Dashboard
            </button>
          ) : (
            <button className="itlc-reference-login hidden sm:inline-flex" type="button" onClick={onLogin}>
              Login
            </button>
          )}

          <button className="itlc-reference-get-started hidden sm:inline-flex" type="button" onClick={onGetStarted}>
            Get Started <ArrowRight size={17} />
          </button>

          {/* Responsive Mobile Hamburger Side Menu Toggle */}
          <button
            type="button"
            className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer border border-slate-200/80 bg-slate-50/80"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile side menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-over Drawer Side Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity animate-in fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Side Menu Drawer Panel */}
          <div className="fixed inset-y-0 right-0 z-[110] w-full max-w-[290px] bg-white shadow-2xl p-6 flex flex-col justify-between overflow-y-auto transform transition-transform duration-300 ease-out border-l border-slate-200">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                <button
                  type="button"
                  className="border-0 bg-transparent p-0 cursor-pointer text-left"
                  onClick={() => handleNavClick(onHome)}
                >
                  <img
                    src={logoUrl || '/itlc_logo.png'}
                    alt="ITLC India"
                    className="h-12 w-auto max-w-[180px] object-contain"
                    onError={handleLogoError}
                  />
                </button>

                <button
                  type="button"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X size={22} />
                </button>
              </div>

              {/* Drawer Nav Links */}
              <div className="py-6 space-y-2">
                <button
                  type="button"
                  onClick={() => handleNavClick(onFeatures)}
                  className="w-full text-left px-4 py-3.5 rounded-xl font-bold text-slate-800 hover:bg-sky-50 hover:text-sky-600 flex items-center justify-between transition-colors text-sm"
                >
                  <span>Features</span>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick(onPricing)}
                  className="w-full text-left px-4 py-3.5 rounded-xl font-bold text-slate-800 hover:bg-sky-50 hover:text-sky-600 flex items-center justify-between transition-colors text-sm"
                >
                  <span>Pricing</span>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick(onSolutions)}
                  className="w-full text-left px-4 py-3.5 rounded-xl font-bold text-slate-800 hover:bg-sky-50 hover:text-sky-600 flex items-center justify-between transition-colors text-sm"
                >
                  <span>Workspaces & Hub</span>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>

                {onSecurity && (
                  <button
                    type="button"
                    onClick={() => handleNavClick(onSecurity)}
                    className="w-full text-left px-4 py-3.5 rounded-xl font-bold text-slate-800 hover:bg-sky-50 hover:text-sky-600 flex items-center justify-between transition-colors text-sm"
                  >
                    <span>Security & Compliance</span>
                    <ChevronRight size={16} className="text-slate-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-5 border-t border-slate-100 space-y-3">
              {loggedIn && onDashboard ? (
                <button
                  type="button"
                  onClick={() => handleNavClick(onDashboard)}
                  className="w-full py-3 px-4 rounded-xl border border-sky-600 text-sky-600 font-bold flex items-center justify-center gap-2 hover:bg-sky-50 transition-colors text-sm cursor-pointer"
                >
                  <LayoutDashboard size={18} />
                  <span>Go to Dashboard</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleNavClick(onLogin)}
                  className="w-full py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors text-sm cursor-pointer"
                >
                  Login to Account
                </button>
              )}

              <button
                type="button"
                onClick={() => handleNavClick(onGetStarted)}
                className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold flex items-center justify-center gap-2 transition-colors text-sm cursor-pointer shadow-lg shadow-sky-500/20"
              >
                <span>Get Started Free</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
