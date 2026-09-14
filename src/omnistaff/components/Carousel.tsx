import React, { useState, useEffect, useCallback, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { motion } from 'framer-motion';
import { TrendingUp, Users, CheckCircle, BarChart3, MessageSquare, Brain } from 'lucide-react';

interface SlideItem {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  icon: React.ReactNode;
  badge: string;
  metric: string;
  metricLabel: string;
}

const slides: SlideItem[] = [
  {
    id: 2,
    title: "HRMS Employee Hub",
    subtitle: "Coordinate employee records, automate leave requests, and track org-wide performance feedback systems.",
    image: "/dashboards/hrms_employee.png",
    icon: <Users className="w-5 h-5 text-purple-600" />,
    badge: "Engagement",
    metric: "94.2%",
    metricLabel: "Active users"
  },
  {
    id: 1,
    title: "CRM Dashboard Analytics",
    subtitle: "Accelerate growth and manage sales pipelines with intelligent leads scoring and real-time activity metrics.",
    image: "/dashboards/crm_analytics.png",
    icon: <TrendingUp className="w-5 h-5 text-indigo-600" />,
    badge: "Sales Growth",
    metric: "+28.4%",
    metricLabel: "vs last month"
  },
  {
    id: 3,
    title: "Project Management Board",
    subtitle: "Organize Kanban boards, track task issues, and monitor sprint velocities with unified team dashboards.",
    image: "/dashboards/project_management.png",
    icon: <CheckCircle className="w-5 h-5 text-sky-600" />,
    badge: "Sprint Status",
    metric: "14/15",
    metricLabel: "Tasks completed"
  },
  {
    id: 4,
    title: "Sales & Revenue Forecasts",
    subtitle: "Deep dive into financial reports, examine monthly recurring revenues, and calculate sales forecasts.",
    image: "/dashboards/sales_revenue.png",
    icon: <BarChart3 className="w-5 h-5 text-emerald-600" />,
    badge: "Revenues",
    metric: "$42.8K",
    metricLabel: "MRR generated"
  },
  {
    id: 5,
    title: "Team Collaboration Channels",
    subtitle: "Centralize project discussions, customize notification feeds, and share code documentation effortlessly.",
    image: "/dashboards/team_collaboration.png",
    icon: <MessageSquare className="w-5 h-5 text-pink-600" />,
    badge: "Collaboration",
    metric: "1.2K+",
    metricLabel: "Daily messages"
  },
  {
    id: 6,
    title: "AI-Powered Insights",
    subtitle: "Extract instant analytical summaries and execute natural language queries via neural recommendations.",
    image: "/dashboards/ai_insights.png",
    icon: <Brain className="w-5 h-5 text-amber-600" />,
    badge: "Co-Pilot AI",
    metric: "99.8%",
    metricLabel: "Prediction precision"
  }
];

export default function Carousel() {
  const autoplayOptions = { delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true };
  const autoplayRef = useRef(Autoplay(autoplayOptions));
  
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, skipSnaps: false }, 
    [autoplayRef.current]
  );
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Parallax mouse movements
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // range: -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // range: -0.5 to 0.5
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
    // Resume autoplay in case hover paused it
    if (autoplayRef.current) {
      autoplayRef.current.play();
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-full flex items-center justify-center p-6 sm:p-10 rounded-2xl glass-panel overflow-hidden group select-none"
    >
      {/* Dynamic ambient glowing circles */}
      <div 
        className="absolute w-[450px] h-[450px] rounded-full bg-indigo-400/15 blur-[120px] transition-transform duration-700 pointer-events-none"
        style={{
          top: '15%',
          left: '10%',
          transform: `translate(${mousePosition.x * -35}px, ${mousePosition.y * -35}px)`
        }}
      />
      <div 
        className="absolute w-[400px] h-[400px] rounded-full bg-purple-400/10 blur-[100px] transition-transform duration-700 pointer-events-none"
        style={{
          bottom: '20%',
          right: '5%',
          transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px)`
        }}
      />

      {/* Vertically Centered Column Box aligning with Left Side Login Card */}
      <div className="w-full max-w-[440px] lg:max-w-[480px] xl:max-w-[520px] flex flex-col justify-between py-2 space-y-6 relative z-10">

        {/* Top Brand Logo / Meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8.5 h-8.5 rounded-lg bg-indigo-600 flex items-center justify-center font-display font-bold text-white shadow-md shadow-indigo-600/20">
              Ic
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-slate-800">
              HRMS
            </span>
          </div>
          <span className="text-[10px] font-semibold px-2.5 py-0.5 bg-indigo-50 border border-indigo-100/50 rounded-full text-indigo-600 backdrop-blur-sm">
            v4.8 Suite
          </span>
        </div>

        {/* Middle Slider Showcase (centered images) */}
        <div className="w-full overflow-hidden cursor-grab active:cursor-grabbing relative">
          <div ref={emblaRef} className="overflow-hidden w-full">
            <div className="flex">
              {slides.map((slide) => (
                <div 
                  key={slide.id} 
                  className="flex-[0_0_100%] min-w-0 flex flex-col justify-center items-center relative"
                >
                  {/* Centered Relative Parent for Card + Floating Badge */}
                  <div className="relative w-full py-4 px-1">
                    {/* 3D Perspective Card Container */}
                    <div 
                      className="w-full transition-transform duration-300 ease-out"
                      style={{
                        perspective: '1200px',
                      }}
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
                          className="w-full h-40 sm:h-48 md:h-64 lg:h-auto aspect-[16/10] object-cover select-none pointer-events-none rounded-xl filter saturate-[0.7] contrast-[1.05] brightness-[0.95]"
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
        </div>

        {/* Bottom Description & Pagination section */}
        <div className="w-full flex flex-col gap-4">
          {/* Carousel Pagination Dots */}
          <div className="flex items-center justify-center border-t border-slate-100 pt-4">
            <div className="flex gap-1.5">
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    index === selectedIndex 
                      ? 'w-5 bg-blue-600' 
                      : 'w-2 bg-slate-200 hover:bg-slate-300'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

