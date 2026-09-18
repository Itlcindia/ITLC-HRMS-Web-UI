import React from 'react';

interface LandingFooterProps {
  supportEmail?: string;
  companyName?: string;
  onOpenSuperowner?: () => void;
  onNavigate?: (page: 'home' | 'workspaces' | 'security' | 'modules' | 'pricing') => void;
}

const getFooterColumns = (onOpenSuperowner?: () => void) => [
  {
    title: 'HRMS Products',
    className: 'landing-footer-col-products',
    links: [
      { label: 'Core HRMS Suite', href: '/modules' },
      { label: 'Biometric & Geo Attendance', href: '/modules' },
      { label: 'Automated 1-Click Payroll', href: '/modules' },
      { label: 'Recruitment & Onboarding', href: '/modules' },
      { label: 'Subscription Pricing', href: '/pricing' }
    ]
  },
  {
    title: 'Industry Solutions',
    className: 'landing-footer-col-use-cases',
    links: [
      { label: 'For IT & Software Firms', href: '/workspaces' },
      { label: 'For Growing Startups & SMEs', href: '/workspaces' },
      { label: 'For Large Enterprises', href: '/workspaces' },
      { label: 'For Remote & Hybrid Teams', href: '/workspaces' },
      { label: 'For Retail & Manufacturing', href: '/workspaces' }
    ]
  },
  {
    title: 'Resources',
    className: 'landing-footer-col-resources',
    links: [
      { label: 'System Documentation', href: '/modules' },
      { label: 'API & Webhook Integrations', href: '/modules' },
      { label: 'Security & Compliance', href: '/security' },
      { label: 'GST & Invoicing Guide', href: '/security' },
      { label: 'System Changelog', href: '/workspaces' }
    ]
  },
  {
    title: 'Company',
    className: 'landing-footer-col-company',
    links: [
      { label: 'About ITLC India', href: '/' },
      { label: 'Workspaces Central Hub', href: '/workspaces' },
      { label: 'Contact Support', href: 'mailto:support@itlc.in' },
      ...(onOpenSuperowner ? [{ label: '⚡ Super Owner Portal', onClick: onOpenSuperowner }] : [])
    ]
  },
  {
    title: 'Legal & Trust',
    className: 'landing-footer-col-legal',
    links: [
      { label: 'Terms of Service', href: '/security' },
      { label: 'Privacy Policy', href: '/security' },
      { label: 'Cookie Policy', href: '/security' },
      { label: 'Data Security (SOC-2)', href: '/security' }
    ]
  }
];

export const LandingFooter: React.FC<LandingFooterProps> = ({
  companyName = 'ITLC India Private Limited',
  supportEmail = 'support@itlc.in',
  onOpenSuperowner,
  onNavigate
}) => {
  const footerColumns = getFooterColumns(onOpenSuperowner);

  const handleLinkClick = (e: React.MouseEvent, href?: string, onClick?: () => void) => {
    if (onClick) {
      e.preventDefault();
      onClick();
      return;
    }
    if (!href) return;
    if (onNavigate) {
      if (href === '/' || href === '/home') {
        e.preventDefault();
        onNavigate('home');
      } else if (href === '/modules') {
        e.preventDefault();
        onNavigate('modules');
      } else if (href === '/pricing') {
        e.preventDefault();
        onNavigate('pricing');
      } else if (href === '/workspaces') {
        e.preventDefault();
        onNavigate('workspaces');
      } else if (href === '/security') {
        e.preventDefault();
        onNavigate('security');
      }
    }
  };

  return (
    <footer className="landing-footer">
      <div className="landing-footer-shell">
        <div className="landing-footer-grid">
          {footerColumns.map((col) => (
            <div key={col.title} className={`landing-footer-col ${col.className}`}>
              <h3>
                {col.title}
              </h3>
              <ul>
                {col.links.map((link) => (
                  <li key={link.label}>
                    {(link as any).onClick ? (
                      <button
                        type="button"
                        onClick={(e) => handleLinkClick(e, link.href, (link as any).onClick)}
                        className="bg-transparent border-0 p-0 text-left cursor-pointer hover:underline"
                        style={{ color: 'inherit', font: 'inherit' }}
                      >
                        {link.label}
                      </button>
                    ) : (
                      <a
                        href={link.href}
                        onClick={(e) => handleLinkClick(e, link.href)}
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="landing-footer-divider" />

        <div className="landing-footer-bottom">
          <div className="landing-footer-legal-links">
            <a href="/security" onClick={(e) => handleLinkClick(e, '/security')}>
              Privacy Policy
            </a>
            <a href="/security" onClick={(e) => handleLinkClick(e, '/security')}>
              Terms of Services
            </a>
            <a href="/security" onClick={(e) => handleLinkClick(e, '/security')}>
              Cookies
            </a>
            <a href="/security" onClick={(e) => handleLinkClick(e, '/security')}>
              Data Security
            </a>
          </div>

          <div className="landing-footer-copyright">
            Copyright © 2026 {companyName}. All rights reserved.
          </div>

          <div className="landing-footer-social">
            <a
              href="/"
              aria-label="LinkedIn"
            >
              <svg viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
            </a>

            <a
              href="/"
              aria-label="Instagram"
            >
              <svg className="landing-footer-stroke-icon" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>

            <a
              href="/"
              aria-label="X"
            >
              <svg viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>

            <a
              href="/"
              aria-label="Facebook"
            >
              <svg viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7.5v-3H10V9.5C10 7.01 11.49 5.5 13.79 5.5c1.1 0 2.25.2 2.25.2v2.47h-1.27c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 3h-2.33v6.8c4.56-.93 8-4.96 8-9.8z"/>
              </svg>
            </a>

            <a
              href="/"
              aria-label="Discord"
            >
              <svg viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .079.009c.12.098.245.195.372.288a.077.077 0 0 1-.006.128c-.598.349-1.224.646-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
