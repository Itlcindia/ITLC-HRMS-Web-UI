import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Play, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Zap, 
  Users, 
  Activity, 
  ExternalLink,
  MessageCircle,
  Layers,
  Code
} from 'lucide-react';
import { getLiveLandingPageConfig, type CustomLandingSection } from '../types/multiTenant';

interface CustomLandingSectionRendererProps {
  section: CustomLandingSection;
  lang?: 'en' | 'hi';
  onOpenOnboarding: () => void;
  onExploreCrm: () => void;
  onExploreHrms: () => void;
}

export const CustomLandingSectionRenderer: React.FC<CustomLandingSectionRendererProps> = ({
  section,
  lang = 'en',
  onOpenOnboarding,
  onExploreCrm,
  onExploreHrms
}) => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const title = lang === 'hi' && section.nameHi ? section.nameHi : section.name;
  const description = lang === 'hi' && section.descriptionHi ? section.descriptionHi : section.description;
  const accentColor = section.color || '#2563eb';

  const handleActionClick = () => {
    if (!section.buttonUrl || section.buttonUrl === '#onboarding') {
      onOpenOnboarding();
      return;
    }
    if (section.buttonUrl.startsWith('#')) {
      const el = document.querySelector(section.buttonUrl);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    if (section.buttonUrl.startsWith('http') || section.buttonUrl.startsWith('mailto:') || section.buttonUrl.startsWith('tel:')) {
      window.open(section.buttonUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    onOpenOnboarding();
  };

  // Convert YouTube / Vimeo URLs to Embed URLs
  const getEmbedUrl = (url?: string) => {
    if (!url) return '';
    try {
      if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url);
        const v = urlObj.searchParams.get('v');
        return v ? `https://www.youtube.com/embed/${v}?autoplay=0&rel=0` : url;
      }
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return id ? `https://www.youtube.com/embed/${id}?autoplay=0&rel=0` : url;
      }
      if (url.includes('vimeo.com/')) {
        const id = url.split('vimeo.com/')[1]?.split('?')[0];
        return id ? `https://player.vimeo.com/video/${id}` : url;
      }
    } catch {}
    return url;
  };

  // 1. CTA BANNER
  if (section.type === 'cta_banner') {
    return (
      <section 
        id={section.id}
        style={{ 
          maxWidth: '1240px', 
          margin: '0 auto 60px', 
          width: '100%', 
          padding: '0 24px', 
          position: 'relative', 
          zIndex: 10 
        }}
      >
        <div 
          style={{ 
            borderRadius: '24px',
            background: `linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.98))`,
            border: `1px solid ${accentColor}44`,
            padding: '48px 36px',
            boxShadow: `0 20px 50px rgba(0, 0, 0, 0.25), 0 0 40px ${accentColor}22`,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          {/* Ambient Glow Orb */}
          <div 
            style={{
              position: 'absolute',
              top: '-50%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '500px',
              height: '300px',
              background: `radial-gradient(circle, ${accentColor}33 0%, transparent 70%)`,
              pointerEvents: 'none'
            }}
          />

          {section.badgeText && (
            <div 
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 16px',
                borderRadius: '999px',
                background: `${accentColor}22`,
                border: `1px solid ${accentColor}66`,
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
                marginBottom: '18px',
                position: 'relative',
                zIndex: 2
              }}
            >
              <Sparkles size={13} color={accentColor} />
              <span>{section.badgeText}</span>
            </div>
          )}

          <h2 
            style={{ 
              fontSize: 'clamp(24px, 4vw, 36px)', 
              fontWeight: 900, 
              color: '#ffffff', 
              margin: '0 0 14px',
              maxWidth: '850px',
              lineHeight: 1.25,
              position: 'relative',
              zIndex: 2
            }}
          >
            {title}
          </h2>

          {description && (
            <p 
              style={{ 
                fontSize: '16px', 
                color: '#94a3b8', 
                margin: '0 0 28px',
                maxWidth: '700px',
                lineHeight: 1.6,
                position: 'relative',
                zIndex: 2
              }}
            >
              {description}
            </p>
          )}

          <div 
            style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '14px', 
              justifyContent: 'center',
              position: 'relative',
              zIndex: 2 
            }}
          >
            <button
              onClick={handleActionClick}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${accentColor}, #0284c7)`,
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer',
                boxShadow: `0 8px 24px ${accentColor}44`,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span>{section.buttonText || 'Get Started Now'}</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => {
                const liveConfig = getLiveLandingPageConfig();
                const waNum = liveConfig.whatsappSalesNumber || '919532341000';
                const waUrl = `https://wa.me/${waNum}?text=` + encodeURIComponent('Hello ITLC Team, I want to learn more about enterprise plans.');
                window.open(waUrl, '_blank');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 24px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
            >
              <MessageCircle size={16} color="#22c55e" />
              <span>Talk on WhatsApp</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  // 2. VIDEO EMBED SECTION
  if (section.type === 'video_embed') {
    const embedUrl = getEmbedUrl(section.mediaUrl);
    const isDirectVideo = section.mediaUrl?.match(/\.(mp4|webm|ogg)$/i);

    return (
      <section 
        id={section.id}
        style={{ 
          maxWidth: '1240px', 
          margin: '0 auto 60px', 
          width: '100%', 
          padding: '0 24px', 
          position: 'relative', 
          zIndex: 10 
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          {section.badgeText && (
            <span style={{ 
              display: 'inline-block',
              padding: '4px 14px',
              borderRadius: '20px',
              background: `${accentColor}18`,
              color: accentColor,
              fontSize: '12px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              marginBottom: '10px'
            }}>
              {section.badgeText}
            </span>
          )}
          <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>
            {title}
          </h2>
          {description && (
            <p style={{ fontSize: '15px', color: '#64748b', margin: 0, maxWidth: '680px', marginInline: 'auto' }}>
              {description}
            </p>
          )}
        </div>

        <div 
          style={{ 
            borderRadius: '20px', 
            overflow: 'hidden', 
            background: '#090d16', 
            border: `2px solid ${accentColor}44`,
            boxShadow: `0 20px 45px rgba(0, 0, 0, 0.2), 0 0 30px ${accentColor}22`,
            position: 'relative',
            paddingBottom: '56.25%', // 16:9 ratio
            height: 0
          }}
        >
          {section.mediaUrl ? (
            isDirectVideo ? (
              <video 
                src={section.mediaUrl}
                controls
                autoPlay
                loop
                muted
                playsInline
                style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover' 
                }}
              />
            ) : (
              <iframe 
                src={embedUrl}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  width: '100%', 
                  height: '100%' 
                }}
              />
            )
          ) : (
            <div 
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#ffffff',
                background: 'linear-gradient(135deg, #0f172a, #1e293b)'
              }}
            >
              <div 
                style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '50%', 
                  background: `${accentColor}33`, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '16px',
                  border: `2px solid ${accentColor}`
                }}
              >
                <Play size={28} color="#ffffff" style={{ marginLeft: '4px' }} />
              </div>
              <p style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 6px' }}>Interactive Video Presentation</p>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Configure Media URL in Super Owner Settings</p>
            </div>
          )}
        </div>

        {section.buttonText && (
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button
              onClick={handleActionClick}
              className="btn btn-primary"
              style={{ 
                padding: '12px 28px', 
                borderRadius: '10px', 
                fontSize: '14px',
                fontWeight: 700,
                background: accentColor,
                borderColor: accentColor,
                color: '#ffffff'
              }}
            >
              <span>{section.buttonText}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </section>
    );
  }

  // 3. FEATURE GRID SECTION
  if (section.type === 'feature_grid') {
    const defaultFeatures = [
      {
        icon: <ShieldCheck size={24} color={accentColor} />,
        title: 'Enterprise Grade Security',
        desc: 'SOC-2 compliant multi-tenant role isolation and continuous audit logging.'
      },
      {
        icon: <Activity size={24} color="#06b6d4" />,
        title: 'Real-Time Telemetry & Radar',
        desc: 'Live 24-cell biometric attendance sync and GPS verified client meetings.'
      },
      {
        icon: <Zap size={24} color="#eab308" />,
        title: '1-Click Instant Payroll',
        desc: 'Automated tax calculations, statutory compliance & 1-click batch payouts.'
      },
      {
        icon: <Users size={24} color="#10b981" />,
        title: 'Visual Sales CRM & GST Suite',
        desc: 'Interactive Kanban deal forecasting, WhatsApp broadcasts & GST compliant invoicing.'
      }
    ];

    const displayFeatures = section.customFeatures && section.customFeatures.length > 0
      ? section.customFeatures.map(f => ({
          icon: <CheckCircle2 size={24} color={accentColor} />,
          title: f.title,
          desc: f.desc
        }))
      : defaultFeatures;

    return (
      <section 
        id={section.id}
        style={{ 
          maxWidth: '1240px', 
          margin: '0 auto 60px', 
          width: '100%', 
          padding: '0 24px', 
          position: 'relative', 
          zIndex: 10 
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          {section.badgeText && (
            <span style={{ 
              display: 'inline-block',
              padding: '4px 14px',
              borderRadius: '20px',
              background: `${accentColor}18`,
              color: accentColor,
              fontSize: '12px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              marginBottom: '10px'
            }}>
              {section.badgeText}
            </span>
          )}
          <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>
            {title}
          </h2>
          {description && (
            <p style={{ fontSize: '15px', color: '#64748b', margin: 0, maxWidth: '680px', marginInline: 'auto' }}>
              {description}
            </p>
          )}
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
          gap: '24px' 
        }}>
          {displayFeatures.map((item, idx) => (
            <div 
              key={idx}
              className="itlc-glass-module-card"
              style={{ 
                padding: '28px 24px',
                borderRadius: '16px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 12px 30px ${accentColor}18`;
                e.currentTarget.style.borderColor = accentColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.04)';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <div 
                style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: `${accentColor}14`, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                {item.icon}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // 4. FAQ ACCORDION
  if (section.type === 'faq_accordion') {
    const defaultFaqs = [
      {
        q: 'How quickly can our organization onboard employees and setup CRM pipelines?',
        a: 'Setup takes under 2 minutes. The instant onboarding wizard provisions your company database, configures roles, and invites team members immediately.'
      },
      {
        q: 'Is data synchronized in real-time between OmniStaff HRMS and ITLC CRM?',
        a: 'Yes! Both suites operate on the unified multi-tenant engine. Biometric punches, GPS field visits, and deal updates sync in under 5 milliseconds.'
      },
      {
        q: 'Can we integrate biometric fingerprint scanners and GPS geofenced attendance?',
        a: 'Absolutely. OmniStaff includes seamless WebUSB/TCP biometric scanner listeners and automated mobile GPS radius verification.'
      },
      {
        q: 'What payment options and discounts are available?',
        a: 'We support UPI, Net Banking, corporate cards, and GST invoices via Razorpay. Annual subscriptions receive an instant 20% discount.'
      }
    ];

    return (
      <section 
        id={section.id}
        style={{ 
          maxWidth: '900px', 
          margin: '0 auto 60px', 
          width: '100%', 
          padding: '0 24px', 
          position: 'relative', 
          zIndex: 10 
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          {section.badgeText && (
            <span style={{ 
              display: 'inline-block',
              padding: '4px 14px',
              borderRadius: '20px',
              background: `${accentColor}18`,
              color: accentColor,
              fontSize: '12px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              marginBottom: '10px'
            }}>
              {section.badgeText}
            </span>
          )}
          <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>
            {title}
          </h2>
          {description && (
            <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
              {description}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {defaultFaqs.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div 
                key={idx}
                style={{ 
                  borderRadius: '14px',
                  background: '#ffffff',
                  border: isOpen ? `1.5px solid ${accentColor}` : '1px solid #e2e8f0',
                  boxShadow: isOpen ? `0 8px 24px ${accentColor}14` : '0 2px 8px rgba(0, 0, 0, 0.03)',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease'
                }}
              >
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '18px 22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                    {faq.q}
                  </span>
                  <div 
                    style={{ 
                      width: '28px', 
                      height: '28px', 
                      borderRadius: '50%', 
                      background: isOpen ? `${accentColor}18` : '#f1f5f9', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: isOpen ? accentColor : '#64748b'
                    }}
                  >
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>
                {isOpen && (
                  <div 
                    style={{ 
                      padding: '0 22px 18px', 
                      fontSize: '14px', 
                      color: '#475569', 
                      lineHeight: 1.6,
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: '14px'
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  // 5. HOW IT WORKS SECTION
  if (section.type === 'how_it_works') {
    const steps = [
      {
        num: '01',
        title: 'Create Your Workspace',
        desc: 'Sign up in 30 seconds. Choose your plan, customize branding, and invite administrators.'
      },
      {
        num: '02',
        title: 'Connect Biometrics & CRM',
        desc: 'Import employee directories, connect hardware biometric scanners, and customize deal pipelines.'
      },
      {
        num: '03',
        title: 'Run 1-Click Operations',
        desc: 'Automate attendance tracking, 1-click payroll slips, GPS field logs, and GST invoices seamlessly.'
      }
    ];

    return (
      <section 
        id={section.id}
        style={{ 
          maxWidth: '1240px', 
          margin: '0 auto 60px', 
          width: '100%', 
          padding: '0 24px', 
          position: 'relative', 
          zIndex: 10 
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          {section.badgeText && (
            <span style={{ 
              display: 'inline-block',
              padding: '4px 14px',
              borderRadius: '20px',
              background: `${accentColor}18`,
              color: accentColor,
              fontSize: '12px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              marginBottom: '10px'
            }}>
              {section.badgeText}
            </span>
          )}
          <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>
            {title}
          </h2>
          {description && (
            <p style={{ fontSize: '15px', color: '#64748b', margin: 0, maxWidth: '680px', marginInline: 'auto' }}>
              {description}
            </p>
          )}
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '24px' 
        }}>
          {steps.map((step, idx) => (
            <div 
              key={idx}
              className="itlc-glass-module-card"
              style={{ 
                padding: '32px 24px',
                borderRadius: '20px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                position: 'relative'
              }}
            >
              <div 
                style={{ 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: '12px', 
                  background: `${accentColor}18`, 
                  color: accentColor,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '16px'
                }}
              >
                {step.num}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {step.title}
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // 6. TESTIMONIALS SECTION
  if (section.type === 'testimonials') {
    const reviews = [
      {
        name: 'Aarav Mehta',
        role: 'Director of HR, FinTech Labs',
        text: 'Switching to this unified platform saved our HR team 18 hours every month on biometric attendance and payroll calculations.',
        rating: 5
      },
      {
        name: 'Neha Sharma',
        role: 'Head of Sales, CloudScale Tech',
        text: 'The visual CRM pipeline combined with field GPS tracking gave us complete clarity over our distributed sales team.',
        rating: 5
      },
      {
        name: 'Vikram Joshi',
        role: 'Founder & CEO, Nexa Enterprises',
        text: 'Flawless 1-click GST invoicing and instant employee onboarding. Best SaaS decision we made this year.',
        rating: 5
      }
    ];

    return (
      <section 
        id={section.id}
        style={{ 
          maxWidth: '1240px', 
          margin: '0 auto 60px', 
          width: '100%', 
          padding: '0 24px', 
          position: 'relative', 
          zIndex: 10 
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          {section.badgeText && (
            <span style={{ 
              display: 'inline-block',
              padding: '4px 14px',
              borderRadius: '20px',
              background: `${accentColor}18`,
              color: accentColor,
              fontSize: '12px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              marginBottom: '10px'
            }}>
              {section.badgeText}
            </span>
          )}
          <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>
            {title}
          </h2>
          {description && (
            <p style={{ fontSize: '15px', color: '#64748b', margin: 0, maxWidth: '680px', marginInline: 'auto' }}>
              {description}
            </p>
          )}
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '24px' 
        }}>
          {reviews.map((rev, idx) => (
            <div 
              key={idx}
              className="itlc-glass-module-card"
              style={{ 
                padding: '28px 24px',
                borderRadius: '20px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px'
              }}
            >
              <div>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '12px', color: '#f59e0b', fontSize: '16px' }}>
                  {'★'.repeat(rev.rating)}
                </div>
                <p style={{ fontSize: '14px', color: '#334155', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>
                  "{rev.text}"
                </p>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>{rev.name}</strong>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{rev.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // 7. CUSTOM HTML CONTAINER
  if (section.type === 'custom_html') {
    return (
      <section 
        id={section.id}
        style={{ 
          maxWidth: '1240px', 
          margin: '0 auto 60px', 
          width: '100%', 
          padding: '0 24px', 
          position: 'relative', 
          zIndex: 10 
        }}
      >
        {(section.name || section.badgeText) && (
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            {section.badgeText && (
              <span style={{ 
                display: 'inline-block',
                padding: '4px 14px',
                borderRadius: '20px',
                background: `${accentColor}18`,
                color: accentColor,
                fontSize: '12px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                marginBottom: '10px'
              }}>
                {section.badgeText}
              </span>
            )}
            {section.name && (
              <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>
                {title}
              </h2>
            )}
            {description && (
              <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
                {description}
              </p>
            )}
          </div>
        )}

        <div 
          className="itlc-custom-html-wrapper"
          style={{
            borderRadius: '18px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            padding: '28px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
          }}
          dangerouslySetInnerHTML={{ __html: section.customHtml || '<p style="color: #64748b; text-align: center;">No custom HTML content configured.</p>' }}
        />
      </section>
    );
  }

  // 6. DEFAULT FALLBACK FOR ANY OTHER CUSTOM SECTION
  return (
    <section 
      id={section.id}
      style={{ 
        maxWidth: '1240px', 
        margin: '0 auto 60px', 
        width: '100%', 
        padding: '0 24px', 
        position: 'relative', 
        zIndex: 10 
      }}
    >
      <div 
        className="itlc-glass-module-card"
        style={{ 
          padding: '36px 32px',
          borderRadius: '20px',
          background: '#ffffff',
          border: `1px solid ${accentColor}33`,
          boxShadow: `0 10px 30px rgba(0, 0, 0, 0.05)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        {section.badgeText && (
          <span style={{ 
            display: 'inline-block',
            padding: '4px 14px',
            borderRadius: '20px',
            background: `${accentColor}18`,
            color: accentColor,
            fontSize: '12px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            marginBottom: '12px'
          }}>
            {section.badgeText}
          </span>
        )}
        <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', margin: '0 0 10px' }}>
          {title}
        </h2>
        {description && (
          <p style={{ fontSize: '15px', color: '#64748b', margin: '0 0 24px', maxWidth: '680px' }}>
            {description}
          </p>
        )}
        {section.buttonText && (
          <button
            onClick={handleActionClick}
            className="btn btn-primary"
            style={{ 
              padding: '12px 28px', 
              borderRadius: '10px', 
              fontSize: '14px',
              fontWeight: 700,
              background: accentColor,
              borderColor: accentColor,
              color: '#ffffff'
            }}
          >
            <span>{section.buttonText}</span>
            <ArrowRight size={15} />
          </button>
        )}
      </div>
    </section>
  );
};
