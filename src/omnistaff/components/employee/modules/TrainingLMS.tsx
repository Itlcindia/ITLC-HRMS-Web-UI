"use client";

import React, { useState, useEffect } from "react";
import { useHRMS, Course } from "../context/HRMSContext";
import { Card, Button, Modal, Badge } from "../UI";
import {
  GraduationCap,
  Play,
  Award,
  Video,
  ClipboardList,
  CheckCircle,
  HelpCircle,
  Download,
  Printer,
  ChevronRight,
  Search,
  Calendar,
  Layers,
  BarChart,
  Clock,
  ExternalLink,
  BookOpen,
  CalendarDays,
  Eye,
} from "lucide-react";
import { cn } from "../UI";
import { api } from "../../../services/api";

interface CalendarEvent {
  id: string;
  title: string;
  type: "Webinar" | "Workshop" | "Live Session" | "Event";
  date: string; // YYYY-MM-DD
  time: string;
  instructor: string;
  duration: string;
  description: string;
}

const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: "evt-101",
    title: "Webinar: SaaS Security compliance audits",
    type: "Webinar",
    date: "2026-06-12",
    time: "10:30 AM - 11:30 AM",
    instructor: "Sarah Jenkins",
    duration: "60 mins",
    description: "Deep dive into SOC2 compliance parameters, vulnerability scanning pipelines, and access management in SaaS architecture."
  },
  {
    id: "evt-102",
    title: "Workshop: Tailwind CSS v4 migration walkthrough",
    type: "Workshop",
    date: "2026-06-18",
    time: "02:00 PM - 03:30 PM",
    instructor: "Dan Abramov",
    duration: "90 mins",
    description: "Hands-on session moving from Tailwind v3 to v4 using the new @theme syntax, cleaning up tailwind.config files."
  },
  {
    id: "evt-103",
    title: "Live Session: React 19 state hook transitions",
    type: "Live Session",
    date: "2026-06-25",
    time: "04:00 PM - 05:00 PM",
    instructor: "Brad Traversy",
    duration: "60 mins",
    description: "Reviewing React 19's useActionState, useFormStatus, and direct support for async functions in form controls."
  },
  {
    id: "evt-104",
    title: "Company Learning Event: Agile best practices",
    type: "Event",
    date: "2026-06-29",
    time: "11:00 AM - 12:00 PM",
    instructor: "HR Enablement Team",
    duration: "60 mins",
    description: "Refining scrum loops, sprint planning metrics, and task Estimation patterns inside ITLC Project Management."
  }
];

export const TrainingLMS: React.FC = () => {
  const { courses, updateCourseProgress, passCourseExam, profile, activeSubTab: globalSubTab, setActiveSubTab: setGlobalSubTab } = useHRMS();

  // Loading and Navigation states
  const [loading, setLoading] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(MOCK_CALENDAR_EVENTS);
  const activeSubTab = ["courses", "assigned", "progress", "certifications", "exams", "calendar", "completed"].includes(globalSubTab) ? globalSubTab : "courses";
  const setActiveSubTab = (tabId: string) => setGlobalSubTab(tabId);

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const list = await api.getAdminTrainings();
        if (list && list.length > 0) {
          const events: CalendarEvent[] = list.map((t: any) => ({
            id: t.id,
            title: t.name,
            type: "Workshop",
            date: t.startDate || new Date().toISOString().split('T')[0],
            time: "10:00 AM - 12:00 PM",
            instructor: t.trainer || "Staff Trainer",
            duration: "2 Hours",
            description: t.description || "Training session for company workforce."
          }));
          setCalendarEvents(events);
        }
      } catch (err) {
        console.error("Failed to load training events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrainings();
  }, []);

  // Search and Category filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Track active course details view
  const [selectedCourseDetails, setSelectedCourseDetails] = useState<Course | null>(null);

  // Active states for Modals
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [examModalOpen, setExamModalOpen] = useState(false);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Exam States
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examPassedState, setExamPassedState] = useState(false);

  // Calendar States
  const [calendarViewMode, setCalendarViewMode] = useState<"month" | "week">("month");
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 24)); // June 24, 2026

  // Calculations
  const completedCount = courses.filter((c) => c.completed).length;
  const ongoingCount = courses.filter((c) => c.progress > 0 && c.progress < 100).length;
  const notStartedCount = courses.filter((c) => c.progress === 0).length;
  const certificatesCount = courses.filter((c) => c.examPassed).length;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Sub-Navigation tabs skeleton */}
        <div className="flex bg-card p-1 rounded-xl border border-border space-x-1 overflow-x-auto">
          {Array.from({ length: 7 }).map((_, idx) => (
            <div key={idx} className="h-8 w-28 bg-secondary/50 rounded-lg shrink-0" />
          ))}
        </div>

        {/* Content Area skeleton */}
        <div className="space-y-6">
          {/* Header/Filter row skeleton */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between bg-card p-4 rounded-xl border border-border">
            <div className="h-9 w-full sm:w-72 bg-secondary/50 rounded-lg" />
            <div className="h-9 w-40 bg-secondary/50 rounded-lg" />
          </div>

          {/* Cards Grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="border border-border rounded-xl bg-card overflow-hidden flex flex-col justify-between min-h-[300px]">
                <div className="p-6 bg-secondary/40 h-32 flex flex-col justify-end space-y-2">
                  <div className="h-3 w-16 bg-secondary/60 rounded" />
                  <div className="h-4 w-48 bg-secondary/60 rounded" />
                  <div className="h-3 w-32 bg-secondary/60 rounded pt-2" />
                </div>
                <div className="p-5 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="h-3 w-16 bg-secondary/50 rounded" />
                      <div className="h-3 w-8 bg-secondary/50 rounded" />
                    </div>
                    <div className="w-full bg-secondary h-1.5 rounded-full" />
                  </div>
                  <div className="h-8 bg-secondary/60 rounded-lg w-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Mock Exam Questions per course
  const examQuestions = [
    {
      q: "What is the recommended approach to store secret environment variables in a Next.js application?",
      options: [
        "Commit them directly to your public Git repository in .env files",
        "Add prefix NEXT_PUBLIC_ to make them server-side safe only",
        "Keep them in standard .env.local without the NEXT_PUBLIC_ prefix to secure them on server-side",
        "Expose them via client-side cookie declarations"
      ],
      correct: 2,
    },
    {
      q: "Which protocol is standard for federated single sign-on (SSO) in enterprise SaaS environments?",
      options: [
        "SAML 2.0 / OIDC",
        "SMTP / POP3",
        "FTP over SSL",
        "JSON Web Tokens without Signature verification"
      ],
      correct: 0,
    },
    {
      q: "In Tailwind CSS v4, how are custom colors and utility tokens extended?",
      options: [
        "By modifying tailwind.config.js export objects",
        "Directly inside the @theme block in the CSS entrypoint file",
        "Using theme() javascript functions inside next.config.mjs",
        "By adding inline inline-styles in HTML variables"
      ],
      correct: 1,
    },
  ];

  const handleExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isAllCorrect =
      selectedAnswers[0] === examQuestions[0].correct &&
      selectedAnswers[1] === examQuestions[1].correct &&
      selectedAnswers[2] === examQuestions[2].correct;

    setExamSubmitted(true);
    setExamPassedState(isAllCorrect);

    if (isAllCorrect && activeCourse) {
      passCourseExam(activeCourse.id, 100);
      // Update selected course details state if open
      if (selectedCourseDetails && selectedCourseDetails.id === activeCourse.id) {
        setSelectedCourseDetails({ ...selectedCourseDetails, examPassed: true, completed: true, progress: 100 });
      }
    }
  };

  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.duration && activeCourse) {
      const pct = Math.min(100, Math.floor((video.currentTime / video.duration) * 100));
      if (pct > activeCourse.progress) {
        updateCourseProgress(activeCourse.id, pct);
        // Update selected course details state if open
        if (selectedCourseDetails && selectedCourseDetails.id === activeCourse.id) {
          setSelectedCourseDetails({ ...selectedCourseDetails, progress: pct, completed: pct === 100 });
        }
      }
    }
  };

  const startExam = (course: Course) => {
    setActiveCourse(course);
    setSelectedAnswers({});
    setExamSubmitted(false);
    setExamPassedState(false);
    setExamModalOpen(true);
  };

  // Filtered Courses for My Courses
  const filteredCourses = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === "All" || c.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Calendar Calculation Helpers (June 2026 starts on Monday, 30 days)
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    
    // Fill padding days for start of month (Monday start in June 2026, Monday = index 1)
    const firstDayIndex = date.getDay(); // Sunday = 0, Monday = 1
    const paddingCount = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    
    for (let i = 0; i < paddingCount; i++) {
      days.push(null);
    }
    
    // Fill actual days of month
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    
    return days;
  };

  const daysGrid = getDaysInMonth();
  const calendarMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="space-y-6">

      {/* Sub-Navigation tabs */}
      <div className="flex bg-card p-1 rounded-xl border border-border overflow-x-auto space-x-1 shrink-0 scrollbar-none print:hidden">
        {[
          { id: "courses", label: "My Courses", icon: BookOpen },
          { id: "assigned", label: "Assigned Trainings", icon: GraduationCap },
          { id: "progress", label: "Learning Progress", icon: BarChart },
          { id: "certifications", label: "Certifications", icon: Award },
          { id: "exams", label: "Exams & Assessments", icon: ClipboardList },
          { id: "calendar", label: "Training Calendar", icon: Calendar },
          { id: "completed", label: "Completed Courses", icon: CheckCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id);
                setSelectedCourseDetails(null);
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Render Subtabs Content */}
      <div className="w-full">

        {/* ========================================================
            TAB 1: MY COURSES & COURSE DETAILS PAGE
            ======================================================== */}
        {activeSubTab === "courses" && (
          selectedCourseDetails ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Back to courses header */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <button
                  onClick={() => setSelectedCourseDetails(null)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold cursor-pointer border border-border bg-card hover:bg-secondary/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                  Back to Course List
                </button>
                <Badge
                  variant={selectedCourseDetails.completed ? "success" : "warning"}
                  className="text-[10px] font-extrabold uppercase tracking-wide"
                >
                  {selectedCourseDetails.completed ? "Completed" : "Active"}
                </Badge>
              </div>

              {/* Course details header card */}
              <div className={cn(
                "p-6 text-white rounded-xl relative space-y-4 shadow-md",
                selectedCourseDetails.category === "Security" ? "bg-gradient-to-br from-indigo-600 to-violet-800" :
                selectedCourseDetails.category === "Engineering" ? "bg-gradient-to-br from-blue-600 to-sky-800" :
                "bg-gradient-to-br from-teal-600 to-emerald-800"
              )}>
                <span className="text-[10px] uppercase font-black tracking-wider opacity-75">{selectedCourseDetails.category}</span>
                <h2 className="text-xl md:text-2xl font-extrabold leading-snug">{selectedCourseDetails.title}</h2>
                <p className="text-xs opacity-90 max-w-2xl leading-relaxed">
                  {selectedCourseDetails.id === "CRS-101" ? "Learn the foundational and advanced practices for securing cloud and SaaS architectures, meeting strict compliance frameworks (SOC2, ISO27001), and managing vulnerability scanning pipelines." :
                   selectedCourseDetails.id === "CRS-102" ? "Master the next generation of web development with Next.js 15, learning the details of React Server Components, Server Actions, partial rendering, hydration mechanics, and app router setups." :
                   "Deep dive into utility-first CSS using Tailwind CSS v4, including theme overrides, extending HSL tokens directly in CSS, responsive styling, and building scalable enterprise design systems."}
                </p>
                <div className="flex flex-wrap gap-4 text-xs opacity-90 pt-3 border-t border-white/20">
                  <div>Duration: <strong>{selectedCourseDetails.duration}</strong></div>
                  <div>Instructor: <strong>Sarah Jenkins (Principal Architect)</strong></div>
                  <div>ID: <strong>{selectedCourseDetails.id}</strong></div>
                  {selectedCourseDetails.examPassed && (
                    <div>Verification Code: <strong>{selectedCourseDetails.certificationCode}</strong></div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Curriculum / Syllabus */}
                <Card className="lg:col-span-2 space-y-4">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider pb-2 border-b border-border">Course Syllabus</h3>
                  <div className="space-y-3">
                    {(selectedCourseDetails.id === "CRS-101" ? [
                      { title: "Module 1: Introduction to SaaS Security Architecture", desc: "Key security parameters, physical vs logical network isolation, tenant data boundaries.", time: "30 mins" },
                      { title: "Module 2: SOC2 Compliance Standards and Key Frameworks", desc: "Understanding the trust services criteria, setting up audit guardrails.", time: "45 mins" },
                      { title: "Module 3: Access Control Models (RBAC, ABAC) & SSO", desc: "Implementing secure identity federation, SAML, OIDC protocols, and OAuth2 authorization flows.", time: "45 mins" },
                      { title: "Module 4: Vulnerability Management & Secure Code Audits", desc: "CI/CD scanning pipelines, static code review setups, and hotfix patching schedules.", time: "30 mins" },
                    ] : selectedCourseDetails.id === "CRS-102" ? [
                      { title: "Module 1: App Router Conventions and Layout Structure", desc: "File-based routing rules, parallel routes, intercepting routes, and layout scoping.", time: "60 mins" },
                      { title: "Module 2: React Server Components (RSC) vs Client Components", desc: "Understanding server boundaries, client directives, and serialization.", time: "60 mins" },
                      { title: "Module 3: Data Fetching, Caching, and Server Actions", desc: "Optimizing request fetch pipelines, Next.js cache revalidations, and secure mutation loops.", time: "60 mins" },
                      { title: "Module 4: Hydration Boundaries & Async State Handling", desc: "Error boundaries, suspense fallback patterns, and state transitions using React 19 hooks.", time: "60 mins" },
                    ] : [
                      { title: "Module 1: Anatomy of Modern Design Systems", desc: "Token variables, component libraries, typography scale, and consistency guidelines.", time: "45 mins" },
                      { title: "Module 2: Migrating to Tailwind CSS v4 & The New @theme Syntax", desc: "Moving from config files to CSS custom properties, theme overrides, and asset management.", time: "45 mins" },
                      { title: "Module 3: Customizing Utility Tokens & HSL Tailwind Colors", desc: "Defining custom colors, responsive typography sizes, and semantic class names.", time: "45 mins" },
                      { title: "Module 4: Micro-animations, Hover States, and CSS Layouts", desc: "Implementing high-fidelity transitions, keyframe animation hooks, and glassmorphic designs.", time: "45 mins" },
                    ]).map((chapter, idx) => (
                      <div key={idx} className="flex gap-4 p-3 border border-border rounded-xl bg-secondary/15">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {idx + 1}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-foreground leading-snug">{chapter.title}</h4>
                          <p className="text-[11px] text-muted-foreground leading-normal">{chapter.desc}</p>
                          <span className="text-[10px] text-muted-foreground font-semibold block pt-1">{chapter.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Progress Card & Actions */}
                <div className="space-y-6">
                  <Card className="space-y-4">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider pb-2 border-b border-border">Progress Metrics</h3>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-muted-foreground">Course Watched</span>
                          <span className="text-foreground">{selectedCourseDetails.progress}%</span>
                        </div>
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${selectedCourseDetails.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground pt-2 border-t border-border">
                        <div>Syllabus: <strong className="text-foreground">{selectedCourseDetails.progress === 100 ? "4/4 Modules" : "In Progress"}</strong></div>
                        <div>Exam Status: <strong className={selectedCourseDetails.examPassed ? "text-emerald-500" : "text-muted-foreground"}>{selectedCourseDetails.examPassed ? "Passed" : "Not Attempted"}</strong></div>
                      </div>

                      <div className="pt-2 border-t border-border space-y-2">
                        {selectedCourseDetails.progress < 100 ? (
                          <Button
                            variant="primary"
                            icon={<Play className="h-4 w-4" />}
                            onClick={() => {
                              setActiveCourse(selectedCourseDetails);
                              setVideoModalOpen(true);
                            }}
                            className="w-full text-xs py-2"
                          >
                            Resume Learning
                          </Button>
                        ) : !selectedCourseDetails.examPassed ? (
                          <Button
                            variant="primary"
                            icon={<ClipboardList className="h-4 w-4" />}
                            onClick={() => startExam(selectedCourseDetails)}
                            className="w-full text-xs py-2 bg-amber-500 text-white hover:bg-amber-600 border-none"
                          >
                            Take Assessment Exam
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            icon={<Award className="h-4 w-4" />}
                            onClick={() => {
                              setActiveCourse(selectedCourseDetails);
                              setCertModalOpen(true);
                            }}
                            className="w-full text-xs py-2 bg-emerald-500 text-white hover:bg-emerald-600 border-none"
                          >
                            View Certificate
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* Instructor card */}
                  <Card className="space-y-3">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider pb-2 border-b border-border">Instructor Bio</h3>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                        SJ
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-foreground leading-snug">Sarah Jenkins</h4>
                        <span className="text-[10px] text-muted-foreground block">Principal Architect & Security Director</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Sarah has over 12 years of experience building secure software architectures at scales crossing millions of tenants. She oversees curriculum benchmarks at ITLC Academy.
                    </p>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fadeIn">
              {/* Search and filter header */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-card p-4 rounded-xl border border-border">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search enrolled courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs md:text-sm rounded-lg border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground font-medium">Category:</span>
                  <div className="flex bg-secondary p-1 rounded-lg border border-border gap-1">
                    {["All", "Security", "Engineering", "Design"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={cn(
                          "px-2.5 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-all",
                          categoryFilter === cat
                            ? "bg-card text-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Courses grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <Card key={course.id} className="flex flex-col justify-between p-0 overflow-hidden border border-border hover:shadow-lg transition-all" hover>
                      {/* Course Header Thumbnail Block */}
                      <div className={cn(
                        "p-6 text-white relative space-y-2 select-none",
                        course.category === "Security" ? "bg-gradient-to-br from-indigo-600 to-violet-800" :
                        course.category === "Engineering" ? "bg-gradient-to-br from-blue-600 to-sky-800" :
                        "bg-gradient-to-br from-teal-600 to-emerald-800"
                      )}>
                        <Badge variant={course.completed ? "success" : "warning"} className="absolute top-4 right-4 text-[9px] font-extrabold uppercase">
                          {course.completed ? "Completed" : "Active"}
                        </Badge>
                        <span className="text-[9px] uppercase font-black tracking-wider opacity-75">{course.category}</span>
                        <h4 className="text-sm font-extrabold line-clamp-2 leading-snug h-10">{course.title}</h4>
                        <div className="flex justify-between items-center text-[10px] opacity-90 pt-3 border-t border-white/20">
                          <span>Instructor: Sarah Jenkins</span>
                          <span>{course.duration}</span>
                        </div>
                      </div>

                      {/* Course Progress & Actions */}
                      <div className="p-5 space-y-4 bg-card">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-muted-foreground">Course Progress</span>
                            <span className="text-foreground">{course.progress}% Completed</span>
                          </div>
                          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-300"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="pt-2 border-t border-border flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCourseDetails(course)}
                            className="flex-1 text-[11px] py-1.5"
                          >
                            Details
                          </Button>
                          {course.progress < 100 ? (
                            <Button
                              variant="primary"
                              size="sm"
                              icon={<Play className="h-3 w-3" />}
                              onClick={() => {
                                setActiveCourse(course);
                                setVideoModalOpen(true);
                              }}
                              className="flex-1 text-[11px] py-1.5"
                            >
                              Resume
                            </Button>
                          ) : !course.examPassed ? (
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<ClipboardList className="h-3.5 w-3.5" />}
                              onClick={() => startExam(course)}
                              className="flex-1 text-[11px] py-1.5 bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20"
                            >
                              Test
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<Award className="h-3.5 w-3.5" />}
                              onClick={() => {
                                setActiveCourse(course);
                                setCertModalOpen(true);
                              }}
                              className="flex-1 text-[11px] py-1.5 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                            >
                              Certificate
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="col-span-full py-16 text-center border border-border bg-card">
                    <div className="h-12 w-12 rounded-full bg-secondary/50 text-muted-foreground flex items-center justify-center mx-auto mb-4">
                      <Search className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">No enrolled courses found</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto leading-normal">
                      We couldn't find any courses matching your search query or selected category filter.
                    </p>
                    <div className="mt-5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchQuery("");
                          setCategoryFilter("All");
                        }}
                      >
                        Reset Search & Filters
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )
        )}


        {/* ========================================================
            TAB 2: ASSIGNED TRAININGS
            ======================================================== */}
        {activeSubTab === "assigned" && (
          <Card className="space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <div>
                <h3 className="text-sm font-bold text-foreground">Assigned Mandatory Trainings</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Assigned certifications that must be completed by the due dates</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground uppercase font-bold text-[9px] tracking-wider bg-secondary/35">
                    <th className="p-3">Training Name</th>
                    <th className="p-3">Assigned Date</th>
                    <th className="p-3">Due Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {courses.map((c, i) => {
                    const isOverdue = i === 1 && !c.completed; // Simulate one overdue item
                    const statusText = c.completed
                      ? "Completed"
                      : isOverdue
                      ? "Overdue"
                      : c.progress > 0
                      ? "In Progress"
                      : "Not Started";

                    return (
                      <tr key={c.id} className="hover:bg-secondary/25 transition-colors">
                        <td className="p-3">
                          <span className="font-semibold text-foreground block">{c.title}</span>
                          <span className="text-[10px] text-muted-foreground mt-0.5 uppercase font-bold">{c.category} | {c.duration}</span>
                        </td>
                        <td className="p-3 text-muted-foreground">Jun 01, 2026</td>
                        <td className="p-3 text-muted-foreground">
                          {isOverdue ? <span className="text-rose-500 font-bold">Jun 10, 2026</span> : "Jul 15, 2026"}
                        </td>
                        <td className="p-3">
                          <span className={cn(
                            "text-[9px] px-2 py-0.5 font-bold rounded-full border tracking-wide uppercase",
                            statusText === "Completed" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                            statusText === "Overdue" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                            statusText === "In Progress" ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" :
                            "bg-secondary text-secondary-foreground border-border"
                          )}>
                            {statusText}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {c.completed ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Award className="h-3 w-3" />}
                              onClick={() => {
                                setActiveCourse(c);
                                setCertModalOpen(true);
                              }}
                              className="text-[10px] h-7"
                            >
                              Certificate
                            </Button>
                          ) : c.progress === 100 ? (
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<ClipboardList className="h-3 w-3" />}
                              onClick={() => startExam(c)}
                              className="text-[10px] h-7 bg-amber-500/10 text-amber-500 border-amber-500/20"
                            >
                              Test
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<Play className="h-3 w-3" />}
                              onClick={() => {
                                setActiveCourse(c);
                                setVideoModalOpen(true);
                              }}
                              className="text-[10px] h-7"
                            >
                              Resume
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* ========================================================
            TAB 3: LEARNING PROGRESS
            ======================================================== */}
        {activeSubTab === "progress" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Calculations */}
            {(() => {
              const avgProgress = Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length);
              return (
                <>
                  {/* Metrics cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="p-4 border border-border space-y-1 bg-card">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Total Courses</span>
                      <span className="text-2xl font-black text-foreground block">{courses.length}</span>
                    </Card>
                    <Card className="p-4 border border-border space-y-1 bg-card">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Completed Courses</span>
                      <span className="text-2xl font-black text-emerald-500 block">{completedCount}</span>
                    </Card>
                    <Card className="p-4 border border-border space-y-1 bg-card">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Ongoing Courses</span>
                      <span className="text-2xl font-black text-indigo-500 block">{ongoingCount}</span>
                    </Card>
                    <Card className="p-4 border border-border space-y-1 bg-card">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Certificates Earned</span>
                      <span className="text-2xl font-black text-primary block">{certificatesCount}</span>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* SVG Learning Progress Chart (Weekly) */}
                    <Card className="space-y-4 bg-card">
                      <div className="pb-2 border-b border-border">
                        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Weekly Training Hours</h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Average watch times accumulated over the past week</p>
                      </div>
                      <div className="h-60 flex flex-col justify-between pt-4">
                        <div className="flex-1 flex items-end justify-between px-4 gap-3 relative">
                          {/* Horizontal gridlines */}
                          <div className="absolute inset-x-0 bottom-0 h-1/4 border-b border-border border-dashed pointer-events-none" />
                          <div className="absolute inset-x-0 bottom-0 h-2/4 border-b border-border border-dashed pointer-events-none" />
                          <div className="absolute inset-x-0 bottom-0 h-3/4 border-b border-border border-dashed pointer-events-none" />
                          <div className="absolute inset-x-0 bottom-0 h-full border-b border-border border-dashed pointer-events-none" />
                          
                          {[
                            { label: "Mon", hrs: 1.2 },
                            { label: "Tue", hrs: 2.8 },
                            { label: "Wed", hrs: 0.5 },
                            { label: "Thu", hrs: 3.2 },
                            { label: "Fri", hrs: 1.5 },
                            { label: "Sat", hrs: 0 },
                            { label: "Sun", hrs: 0.8 }
                          ].map((bar, i) => {
                            const maxHrs = 4.0;
                            const heightPercent = bar.hrs > 0 ? (bar.hrs / maxHrs) * 100 : 3;

                            return (
                              <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative z-10">
                                <div className="absolute -top-7 scale-0 group-hover:scale-100 bg-foreground text-background text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md transition-all duration-150 whitespace-nowrap">
                                  {bar.hrs} hrs
                                </div>
                                <div
                                  className={cn(
                                    "w-full rounded-t-md transition-all duration-500",
                                    bar.hrs > 2 ? "bg-primary" : "bg-primary/50"
                                  )}
                                  style={{ height: `${heightPercent}%` }}
                                />
                                <span className="text-[9px] text-muted-foreground font-semibold">{bar.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </Card>

                    {/* SVG Monthly Course Completion Chart */}
                    <Card className="space-y-4 bg-card">
                      <div className="pb-2 border-b border-border">
                        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Monthly Completions</h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Completions recorded over the past 6 months</p>
                      </div>
                      <div className="h-60 flex flex-col justify-between pt-4">
                        <div className="flex-1 relative z-10 px-2">
                          <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                            <defs>
                              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>

                            {/* Grid Lines */}
                            <line x1="40" y1="20" x2="460" y2="20" stroke="var(--color-border)" strokeDasharray="3,3" />
                            <line x1="40" y1="66.6" x2="460" y2="66.6" stroke="var(--color-border)" strokeDasharray="3,3" />
                            <line x1="40" y1="113.3" x2="460" y2="113.3" stroke="var(--color-border)" strokeDasharray="3,3" />
                            <line x1="40" y1="160" x2="460" y2="160" stroke="var(--color-border)" />

                            {/* Area Fill */}
                            <path
                              d="M 40 113.3 L 124 160 L 208 66.6 L 292 113.3 L 376 66.6 L 460 20 L 460 160 L 40 160 Z"
                              fill="url(#areaGrad)"
                            />

                            {/* Line Stroke */}
                            <path
                              d="M 40 113.3 L 124 160 L 208 66.6 L 292 113.3 L 376 66.6 L 460 20"
                              fill="none"
                              stroke="var(--color-primary)"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />

                            {/* Data points */}
                            {[
                              { x: 40, y: 113.3, val: 1 },
                              { x: 124, y: 160, val: 0 },
                              { x: 208, y: 66.6, val: 2 },
                              { x: 292, y: 113.3, val: 1 },
                              { x: 376, y: 66.6, val: 2 },
                              { x: 460, y: 20, val: 3 }
                            ].map((pt, idx) => (
                              <g key={idx} className="group cursor-pointer">
                                <circle
                                  cx={pt.x}
                                  cy={pt.y}
                                  r="4"
                                  className="fill-card stroke-primary"
                                  strokeWidth="2.5"
                                />
                                <circle
                                  cx={pt.x}
                                  cy={pt.y}
                                  r="8"
                                  className="fill-primary/20 opacity-0 hover:opacity-100 transition-opacity"
                                />
                              </g>
                            ))}
                          </svg>

                          {/* X-Axis labels */}
                          <div className="flex justify-between px-2 text-[9px] text-muted-foreground font-semibold mt-2">
                            <span>Jan</span>
                            <span>Feb</span>
                            <span>Mar</span>
                            <span>Apr</span>
                            <span>May</span>
                            <span>Jun</span>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Progress bars & skill caps */}
                    <Card className="space-y-4 bg-card">
                      <div className="pb-2 border-b border-border">
                        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Overall Metrics</h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Calculated based on course completions and certifications</p>
                      </div>
                      <div className="space-y-4 py-1">
                        <div className="space-y-1.5 p-3 rounded-lg bg-primary/5 border border-primary/10">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-primary">Course Completion %</span>
                            <span className="text-primary font-black">{avgProgress}%</span>
                          </div>
                          <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${avgProgress}%` }} />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-foreground">Enterprise Security</span>
                            <span className="text-muted-foreground">90%</span>
                          </div>
                          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: "90%" }} />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-foreground">Next.js Framework</span>
                            <span className="text-muted-foreground">65%</span>
                          </div>
                          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: "65%" }} />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-foreground">Tailwind CSS tokens</span>
                            <span className="text-muted-foreground">40%</span>
                          </div>
                          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: "40%" }} />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* ========================================================
            TAB 4: CERTIFICATIONS
            ======================================================== */}
        {activeSubTab === "certifications" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.filter((c) => c.examPassed).map((c) => (
                <Card key={c.id} className="p-6 border border-border flex items-start gap-4 relative overflow-hidden" hover>
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl shrink-0">
                    <Award className="h-7 w-7" />
                  </div>
                  <div className="space-y-3 flex-1 min-w-0">
                    <div>
                      <h4 className="text-xs font-extrabold text-foreground leading-snug line-clamp-1">{c.title}</h4>
                      <p className="text-[9px] text-muted-foreground uppercase font-black tracking-wider mt-1">{c.category}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-y-1 text-[10px] text-muted-foreground font-medium pt-2 border-t border-border">
                      <div>ID: <strong className="font-mono text-foreground">{c.certificationCode}</strong></div>
                      <div>Status: <strong className="text-emerald-500">Active</strong></div>
                      <div>Issued: <strong className="text-foreground">Jun 2026</strong></div>
                      <div>Expires: <strong className="text-foreground">Never</strong></div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Eye className="h-3.5 w-3.5" />}
                        onClick={() => {
                          setActiveCourse(c);
                          setCertModalOpen(true);
                        }}
                        className="text-[11px] h-8 px-3"
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Download className="h-3.5 w-3.5" />}
                        onClick={() => {
                          setActiveCourse(c);
                          setCertModalOpen(true);
                        }}
                        className="text-[11px] h-8 px-3"
                      >
                        Download PDF
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {certificatesCount === 0 && (
                <div className="col-span-full py-12 text-center text-muted-foreground text-xs">
                  No certifications earned yet. Complete watched courses and pass assessments to unlock certificates.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: EXAMS & ASSESSMENTS
            ======================================================== */}
        {activeSubTab === "exams" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Exam cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((c) => {
                const isLocked = c.progress < 100;
                return (
                  <Card key={c.id} className="flex flex-col justify-between p-0 overflow-hidden border border-border bg-card" hover>
                    <div className="p-5 border-b border-border bg-secondary/15 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded border tracking-wide uppercase",
                          c.examPassed ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                          isLocked ? "bg-secondary text-muted-foreground border-border" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        )}>
                          {c.examPassed ? "Passed" : isLocked ? "Locked" : "Available"}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold">100 Marks</span>
                      </div>
                      <h4 className="text-xs font-bold text-foreground leading-snug line-clamp-2 min-h-8">
                        {c.title} Assessment Exam
                      </h4>
                    </div>

                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-2 gap-y-1.5 text-[10px] text-muted-foreground font-medium">
                        <div>Total Marks: <strong className="text-foreground">100</strong></div>
                        <div>Passing Score: <strong className="text-foreground">100%</strong></div>
                        <div>Obtained Marks: <strong className="text-foreground">{c.examPassed ? "100" : "--"}</strong></div>
                        <div>Percentage: <strong className="text-foreground">{c.examPassed ? "100%" : "--"}</strong></div>
                      </div>

                      <div className="pt-2 border-t border-border flex gap-2">
                        {isLocked ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled
                            className="w-full text-[10px] py-1.5 opacity-60"
                          >
                            Locked - Complete Course
                          </Button>
                        ) : c.examPassed ? (
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Award className="h-3 w-3" />}
                            onClick={() => {
                              setActiveCourse(c);
                              setCertModalOpen(true);
                            }}
                            className="w-full text-[10px] py-1.5 bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          >
                            View Certificate
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<ClipboardList className="h-3 w-3" />}
                            onClick={() => startExam(c)}
                            className="w-full text-[10px] py-1.5 bg-amber-500 text-white hover:bg-amber-600 border-none"
                          >
                            Start Assessment
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Exam results history table */}
            <Card className="space-y-4 bg-card">
              <div className="pb-2 border-b border-border">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Exam Results History</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Verified test scores and certification statuses</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground uppercase font-bold text-[9px] tracking-wider bg-secondary/35">
                      <th className="p-3">Exam Name</th>
                      <th className="p-3">Total Marks</th>
                      <th className="p-3">Obtained Marks</th>
                      <th className="p-3">Percentage</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Pass/Fail Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {courses.map((c) => {
                      const hasAttempted = c.examPassed;
                      return (
                        <tr key={c.id} className="hover:bg-secondary/25 transition-colors">
                          <td className="p-3">
                            <span className="font-semibold text-foreground block">{c.title} Certification Exam</span>
                            <span className="text-[9px] text-muted-foreground block mt-0.5">{c.category} Module</span>
                          </td>
                          <td className="p-3 text-muted-foreground">100</td>
                          <td className="p-3 text-muted-foreground">{hasAttempted ? "100" : "--"}</td>
                          <td className="p-3 text-muted-foreground">{hasAttempted ? "100%" : "--"}</td>
                          <td className="p-3">
                            <span className={cn(
                              "text-[9px] px-2 py-0.5 font-bold rounded-full border tracking-wide uppercase",
                              hasAttempted ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-secondary text-secondary-foreground border-border"
                            )}>
                              {hasAttempted ? "Completed" : "Not Started"}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={cn(
                              "text-[9px] px-2 py-0.5 font-bold rounded-full uppercase tracking-wide",
                              hasAttempted ? "text-emerald-500" : "text-muted-foreground"
                            )}>
                              {hasAttempted ? "Pass" : "Pending"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ========================================================
            TAB 6: TRAINING CALENDAR
            ======================================================== */}
        {activeSubTab === "calendar" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* Calendar grid */}
            <Card className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <div>
                  <h3 className="text-sm font-bold text-foreground">ITLC Learning Calendar</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {calendarViewMode === "month" ? `${calendarMonths[currentDate.getMonth()]} 2026` : "Weekly Schedule: Jun 22 - Jun 28, 2026"}
                  </p>
                </div>

                <div className="flex bg-secondary p-1 rounded-lg border border-border">
                  <button
                    onClick={() => setCalendarViewMode("month")}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-all",
                      calendarViewMode === "month" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                    )}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setCalendarViewMode("week")}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-all",
                      calendarViewMode === "week" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                    )}
                  >
                    Week
                  </button>
                </div>
              </div>

              {calendarViewMode === "month" ? (
                <>
                  {/* Calendar grid days */}
                  <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-muted-foreground uppercase border-b border-border pb-2">
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                    <div>Sun</div>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5 min-h-[260px] items-stretch mt-3">
                    {daysGrid.map((day, idx) => {
                      if (day === null) {
                        return <div key={`padding-${idx}`} className="bg-secondary/15 rounded-lg border border-transparent" />;
                      }

                      const dayNum = day.getDate();
                      const dayStr = day.toISOString().split("T")[0];
                      
                      // Filter events for this specific day
                      const dayEvents = calendarEvents.filter((evt) => evt.date === dayStr);

                      return (
                        <div
                          key={`day-${dayNum}`}
                          className={cn(
                            "bg-card border border-border p-1.5 rounded-lg flex flex-col justify-between min-h-[56px] text-left transition-colors relative hover:border-primary/50",
                            dayNum === 24 && "ring-1 ring-primary border-primary bg-primary/5"
                          )}
                        >
                          <span className={cn(
                            "text-[9px] font-bold",
                            dayNum === 24 ? "text-primary font-black" : "text-muted-foreground"
                          )}>{dayNum}</span>
                          
                          <div className="space-y-0.5 mt-1 flex-1 flex flex-col justify-end">
                            {dayEvents.map((evt) => (
                              <div
                                key={evt.id}
                                onClick={() => setSelectedEvent(evt)}
                                className={cn(
                                  "text-[7px] p-0.5 rounded font-bold leading-tight cursor-pointer truncate max-w-full text-white",
                                  evt.type === "Webinar" ? "bg-indigo-600" :
                                  evt.type === "Workshop" ? "bg-amber-600" :
                                  "bg-emerald-600"
                                )}
                                title={evt.title}
                              >
                                {evt.title.split(":")[0]}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="space-y-3 mt-2">
                  {[
                    { name: "Monday", dateStr: "2026-06-22", label: "Jun 22" },
                    { name: "Tuesday", dateStr: "2026-06-23", label: "Jun 23" },
                    { name: "Wednesday", dateStr: "2026-06-24", label: "Jun 24" },
                    { name: "Thursday", dateStr: "2026-06-25", label: "Jun 25" },
                    { name: "Friday", dateStr: "2026-06-26", label: "Jun 26" },
                    { name: "Saturday", dateStr: "2026-06-27", label: "Jun 27" },
                    { name: "Sunday", dateStr: "2026-06-28", label: "Jun 28" }
                  ].map((day) => {
                    const isToday = day.dateStr === "2026-06-24";
                    const dayEvents = calendarEvents.filter(evt => evt.date === day.dateStr);

                    return (
                      <div key={day.dateStr} className={cn(
                        "flex items-start p-3 border rounded-xl gap-4 bg-card transition-colors",
                        isToday ? "border-primary ring-1 ring-primary bg-primary/5" : "border-border"
                      )}>
                        <div className="w-14 shrink-0 text-center">
                          <span className="text-[9px] text-muted-foreground uppercase font-bold block">{day.name.substring(0, 3)}</span>
                          <span className={cn(
                            "text-base font-black block mt-0.5",
                            isToday ? "text-primary" : "text-foreground"
                          )}>{day.label.split(" ")[1]}</span>
                        </div>
                        <div className="flex-1 space-y-2">
                          {dayEvents.length > 0 ? (
                            dayEvents.map(evt => (
                              <div
                                key={evt.id}
                                onClick={() => setSelectedEvent(evt)}
                                className={cn(
                                  "p-2.5 rounded-lg border text-xs cursor-pointer flex justify-between items-center hover:bg-secondary/40 transition-colors",
                                  evt.type === "Webinar" ? "border-indigo-500/25 bg-indigo-500/5 text-indigo-500" :
                                  evt.type === "Workshop" ? "border-amber-500/25 bg-amber-500/5 text-amber-500" :
                                  "border-emerald-500/25 bg-emerald-500/5 text-emerald-500"
                                )}
                              >
                                <div>
                                  <h5 className="font-bold text-foreground line-clamp-1">{evt.title}</h5>
                                  <span className="text-[10px] text-muted-foreground mt-0.5 block">{evt.time} • Host: {evt.instructor}</span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                            ))
                          ) : (
                            <div className="text-[10px] text-muted-foreground/60 py-1.5 italic">
                              No learning sessions scheduled
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
            {/* Upcoming webinars & workshops list */}
            <Card className="space-y-4">
              <div className="pb-2 border-b border-border">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Upcoming Sessions</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Mandatory live learning & webinars</p>
              </div>

              <div className="space-y-3">
                {calendarEvents.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className="p-3 border border-border bg-secondary/25 hover:bg-secondary/45 transition-colors rounded-xl cursor-pointer space-y-1.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className={cn(
                        "text-[8px] font-bold px-1.5 py-0.5 rounded border tracking-wide uppercase",
                        evt.type === "Webinar" ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" :
                        evt.type === "Workshop" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                        "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      )}>
                        {evt.type}
                      </span>
                      <span className="text-[9px] text-muted-foreground font-semibold font-mono">{evt.date}</span>
                    </div>
                    <h4 className="text-xs font-bold text-foreground leading-snug line-clamp-2">{evt.title}</h4>
                    <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground pt-1.5 border-t border-border/50">
                      <Clock className="h-3 w-3" />
                      <span>{evt.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ========================================================
            TAB 7: COMPLETED COURSES
            ======================================================== */}
        {activeSubTab === "completed" && (
          <Card className="space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <div>
                <h3 className="text-sm font-bold text-foreground">Completed Courses</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Archive list of certifications earned during employment</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground uppercase font-bold text-[9px] tracking-wider bg-secondary/35">
                    <th className="p-3">Course Name</th>
                    <th className="p-3">Completion Date</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Certificate</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {courses.filter((c) => c.completed).map((c) => (
                    <tr key={c.id} className="hover:bg-secondary/25 transition-colors">
                      <td className="p-3">
                        <span className="font-semibold text-foreground block">{c.title}</span>
                        <span className="text-[10px] text-muted-foreground mt-0.5 uppercase font-bold">{c.category}</span>
                      </td>
                      <td className="p-3 text-muted-foreground">Jun 15, 2026</td>
                      <td className="p-3 text-muted-foreground">{c.duration}</td>
                      <td className="p-3">
                        <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold rounded-full uppercase tracking-wide">
                          Issued
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Award className="h-3 w-3" />}
                          onClick={() => {
                            setActiveCourse(c);
                            setCertModalOpen(true);
                          }}
                          className="text-[10px] h-7"
                        >
                          View Certificate
                        </Button>
                      </td>
                    </tr>
                  ))}

                  {completedCount === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground text-xs">
                        No courses completed yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

      </div>

      {/* 1. Video Course Player Modal */}
      <Modal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        title={activeCourse ? `Video Lesson - ${activeCourse.title}` : "LMS Video Player"}
        size="lg"
      >
        {activeCourse && (
          <div className="space-y-4 animate-fadeIn">
            <div className="aspect-video bg-black rounded-xl overflow-hidden border border-border">
              <video
                src={activeCourse.videoUrl}
                controls
                onTimeUpdate={handleVideoTimeUpdate}
                className="h-full w-full object-contain"
                autoPlay
              />
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-semibold">Watching Segment 1 of 1</span>
              <span className="font-bold text-primary">Progress: {activeCourse.progress}%</span>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed bg-secondary/35 p-3 rounded-lg border border-border">
              <strong>Interactive Simulation Tip:</strong> Let the video play for a few seconds or seek closer to the end of the video timeline to mock the 100% course watched milestone. Once completed, exit the video player to take the certification assessment.
            </p>
          </div>
        )}
      </Modal>

      {/* 2. Exam Quiz Modal */}
      <Modal
        isOpen={examModalOpen}
        onClose={() => setExamModalOpen(false)}
        title={activeCourse ? `Certification Exam - ${activeCourse.title}` : "Exam Quiz"}
        size="lg"
      >
        {activeCourse && (
          <form onSubmit={handleExamSubmit} className="space-y-6">
            <div className="space-y-4">
              {examQuestions.map((eq, qIdx) => (
                <div key={qIdx} className="space-y-2 p-4 bg-secondary/15 border border-border rounded-xl">
                  <h4 className="text-xs font-bold text-foreground flex gap-1.5 leading-snug">
                    <span className="text-primary">{qIdx + 1}.</span> {eq.q}
                  </h4>
                  
                  <div className="space-y-2 pt-2">
                    {eq.options.map((opt, oIdx) => (
                      <label
                        key={oIdx}
                        className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                          selectedAnswers[qIdx] === oIdx
                            ? "border-primary bg-primary/5 font-semibold text-foreground"
                            : "border-border hover:bg-secondary/40 text-muted-foreground"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${qIdx}`}
                          checked={selectedAnswers[qIdx] === oIdx}
                          onChange={() =>
                            setSelectedAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))
                          }
                          disabled={examSubmitted}
                          className="mt-0.5 shrink-0"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {examSubmitted && (
              <div className={`p-4 rounded-xl border text-xs flex gap-2 ${
                examPassedState
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-500"
              }`}>
                {examPassedState ? (
                  <div>
                    <h4 className="font-extrabold flex items-center gap-1"><CheckCircle className="h-4 w-4 text-emerald-500" /> Certification Unlocked!</h4>
                    <p className="mt-1 leading-normal scale-95 origin-left">
                      Excellent! You scored 100% and have earned your certificate. Click "View Certificate" in the course card to see it.
                    </p>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-extrabold flex items-center gap-1"><HelpCircle className="h-4 w-4 text-rose-500" /> Exam Failed (Score &lt; 100%)</h4>
                    <p className="mt-1 leading-normal scale-95 origin-left">
                      You must answer all questions correctly to receive a certification. Review the questions and try again.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-border mt-6">
              <Button type="button" variant="outline" onClick={() => setExamModalOpen(false)}>
                Exit Quiz
              </Button>
              {!examSubmitted ? (
                <Button type="submit" disabled={Object.keys(selectedAnswers).length < 3}>
                  Submit Answers
                </Button>
              ) : (
                !examPassedState && (
                  <Button
                    type="button"
                    onClick={() => {
                      setSelectedAnswers({});
                      setExamSubmitted(false);
                    }}
                  >
                    Retake Exam
                  </Button>
                )
              )}
            </div>
          </form>
        )}
      </Modal>

      {/* 3. Certification Diploma Viewer Modal */}
      <Modal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        title="Certification Achieved"
        size="lg"
      >
        {activeCourse && activeCourse.examPassed && (
          <div className="space-y-6">
            <div className="flex justify-end gap-2 pb-4 border-b border-border print:hidden">
              <Button variant="outline" size="sm" icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>
                Print Certificate
              </Button>
              <Button variant="primary" size="sm" icon={<Download className="h-4 w-4" />} onClick={() => window.print()}>
                Download Certificate
              </Button>
            </div>

            <div className="p-8 border-4 border-double border-primary/30 rounded-2xl bg-card text-foreground text-center space-y-6 relative overflow-hidden print:border-0 print:p-0">
              <div className="absolute top-2 right-2 text-primary/10">
                <Award className="h-32 w-32" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-primary uppercase font-bold tracking-widest block">Certificate of Excellence</span>
                <h1 className="font-serif text-2xl font-extrabold text-foreground">ITLC ACADEMY & LMS</h1>
              </div>

              <div className="text-xs text-muted-foreground max-w-md mx-auto pt-4 leading-normal">
                This document certifies that employee
                <div className="text-xl font-serif font-extrabold text-foreground my-3 border-b border-border pb-1 w-64 mx-auto">
                  {profile.fullName}
                </div>
                has successfully reviewed all course lessons and passed the standard examination benchmarks for the certification course:
                <div className="text-sm font-bold text-foreground my-3 leading-snug">
                  {activeCourse.title}
                </div>
                with a final verification test score of <strong>100%</strong>.
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-6 text-[10px] text-muted-foreground border-t border-border">
                <div className="text-left leading-normal">
                  Date: <strong>June 2026</strong>
                  <br />
                  Issuer: <strong>ITLC HR Academy</strong>
                </div>
                <div className="text-right leading-normal">
                  Code: <strong className="font-mono">{activeCourse.certificationCode}</strong>
                  <br />
                  Status: <strong>Electronically Verified</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 4. Calendar Event Details Modal */}
      <Modal
        isOpen={selectedEvent !== null}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent ? `${selectedEvent.type}: Details` : "Session Details"}
        size="md"
      >
        {selectedEvent && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex justify-between items-start gap-4">
              <h4 className="text-sm font-bold text-foreground leading-snug">{selectedEvent.title}</h4>
              <Badge variant={selectedEvent.type === "Webinar" ? "info" : selectedEvent.type === "Workshop" ? "warning" : "success"} className="text-[9px] font-bold uppercase shrink-0">
                {selectedEvent.type}
              </Badge>
            </div>

            <div className="bg-secondary/25 border border-border p-4 rounded-xl space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Host / Instructor:</span>
                <span className="font-bold text-foreground">{selectedEvent.instructor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-semibold text-foreground font-mono">{selectedEvent.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Session Time:</span>
                <span className="font-semibold text-foreground font-mono">{selectedEvent.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium text-foreground">{selectedEvent.duration}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Description</span>
              <p className="text-xs text-muted-foreground leading-relaxed">{selectedEvent.description}</p>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border mt-6">
              <Button variant="outline" size="sm" onClick={() => setSelectedEvent(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<ExternalLink className="h-4 w-4" />}
                onClick={() => {
                  alert("Redirecting to the live virtual lobby... Please ensure your camera and microphone are configured.");
                  setSelectedEvent(null);
                }}
              >
                Join Live Lobby
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};
