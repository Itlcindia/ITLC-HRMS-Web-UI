import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, 
  Sparkles, 
  GripVertical, 
  Eye, 
  EyeOff,
  ArrowUp, 
  ArrowDown, 
  Check, 
  RotateCcw, 
  ExternalLink, 
  Tv, 
  LayoutTemplate, 
  CreditCard, 
  Mail, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Megaphone, 
  Video, 
  HelpCircle, 
  Code, 
  Layers, 
  Layout, 
  MousePointer, 
  Users, 
  TrendingUp, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Palette, 
  Phone, 
  MessageCircle, 
  Building, 
  ShieldCheck, 
  RefreshCw,
  Compass,
  MoreVertical,
  Copy,
  List,
  Image as ImageIcon,
  UploadCloud,
  Play,
  Pause,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Kanban,
  Receipt,
  DollarSign,
  Briefcase,
  AlertTriangle,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { 
  getLiveLandingPageConfig, 
  saveLiveLandingPageConfig, 
  resetLandingPageConfig, 
  getLiveLandingSections, 
  saveLiveLandingSections, 
  resetLandingSections, 
  type LandingPageConfig, 
  type CustomLandingSection 
} from '../../../../types/multiTenant';
import { useDashboard } from '../context/DashboardContext';

export type CmsSubTab = 'sections' | 'showcase_images' | 'contact' | 'branding' | 'hero' | 'preview';

export const DEFAULT_SHOWCASE_MODULES = [
  { 
    id: 'hrms_dashboard', 
    label: 'HRMS Dashboard', 
    icon: Users, 
    color: '#7c3aed',
    badge: 'WORKFORCE MANAGEMENT',
    description: 'OmniStaff HRMS Command Center, biometric attendance, live radar & shifts' 
  },
  { 
    id: 'crm_kanban', 
    label: 'Sales CRM (Coming Soon)', 
    icon: Kanban, 
    color: '#0284c7',
    badge: 'COMING SOON ⏳',
    description: 'Visual Deals Kanban Pipeline & CRM Suite (Coming Soon)' 
  },
  { 
    id: 'payroll_engine', 
    label: 'Payroll & Tax', 
    icon: DollarSign, 
    color: '#059669',
    badge: 'SALARY & COMPLIANCE',
    description: '1-Click automated salary slips, PF, ESI & Indian TDS calculations' 
  },
  { 
    id: 'gst_invoicing', 
    label: 'GST Invoicing', 
    icon: Receipt, 
    color: '#d97706',
    badge: 'TAX INVOICING',
    description: 'B2B/B2C GST tax invoices, e-Way bills & client payment receipts' 
  },
  { 
    id: 'employee_directory', 
    label: 'Staff Directory', 
    icon: Briefcase, 
    color: '#ec4899',
    badge: 'PEOPLE DIRECTORY',
    description: 'Staff directory records, documents, shifts, leave & asset tracker' 
  }
];

export const DEFAULT_SHOWCASE_IMAGES: Record<string, string[]> = {
  hrms_dashboard: [
    '/dashboards/hrms_employee.png',
    '/mockup1.jpg',
    '/dashboards/team_collaboration.png',
    '/mockup2.jpg',
    '/dashboards/project_management.png',
    '/dashboards/ai_insights.png'
  ],
  crm_kanban: [
    '/dashboards/crm_analytics.png',
    '/dashboards/sales_revenue.png',
    '/mockup3.jpg',
    '/dashboards/project_management.png',
    '/dashboards/ai_insights.png'
  ],
  payroll_engine: [
    '/dashboards/sales_revenue.png',
    '/dashboards/ai_insights.png',
    '/mockup1.jpg',
    '/dashboards/hrms_employee.png',
    '/dashboards/crm_analytics.png'
  ],
  gst_invoicing: [
    '/dashboards/ai_insights.png',
    '/dashboards/sales_revenue.png',
    '/dashboards/crm_analytics.png',
    '/mockup3.jpg',
    '/dashboards/team_collaboration.png'
  ],
  employee_directory: [
    '/dashboards/project_management.png',
    '/dashboards/team_collaboration.png',
    '/mockup2.jpg',
    '/dashboards/hrms_employee.png',
    '/mockup1.jpg'
  ]
};

export const LandingSettingsTab: React.FC<{ 
  onOpenIntroHub?: () => void;
  initialSubTab?: CmsSubTab;
}> = ({ onOpenIntroHub, initialSubTab = 'sections' }) => {
  const { addToast } = useDashboard();

  // Active Sub-Tab Navigation
  const [activeSubTab, setActiveSubTab] = useState<CmsSubTab>(initialSubTab);

  // Sync initialSubTab if passed from parent navigation
  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // CMS Config & Sections State
  const [cmsConfig, setCmsConfig] = useState<LandingPageConfig>(getLiveLandingPageConfig());
  const [sections, setSections] = useState<CustomLandingSection[]>(getLiveLandingSections());

  // Showcase Images State
  const [showcaseImages, setShowcaseImages] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem('itlc_showcase_custom_images');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load showcase images from localStorage', e);
    }
    return DEFAULT_SHOWCASE_IMAGES;
  });

  const [selectedShowcaseModule, setSelectedShowcaseModule] = useState<string>('hrms_dashboard');
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [sliderSpeed, setSliderSpeed] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('itlc_showcase_slider_interval');
      if (saved) return Number(saved);
    } catch (e) {}
    return 3500;
  });

  // Showcase Preview Simulator
  const [previewSlideIndex, setPreviewSlideIndex] = useState<number>(0);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState<boolean>(true);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const filePickerRef = useRef<HTMLInputElement>(null);

  // Device Switcher for Live Preview ('desktop' | 'tablet' | 'mobile')
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewKey, setPreviewKey] = useState<number>(1);

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingSection, setEditingSection] = useState<CustomLandingSection | null>(null);
  const [deleteConfirmSection, setDeleteConfirmSection] = useState<CustomLandingSection | null>(null);

  // Active 3-dots dropdown menu state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // New Section Form State
  const [newSecType, setNewSecType] = useState<CustomLandingSection['type']>('cta_banner');
  const [newSecName, setNewSecName] = useState('');
  const [newSecDesc, setNewSecDesc] = useState('');

  // Drag and Drop States
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Sync state on external update
  useEffect(() => {
    const handleCmsUpdate = (e: any) => {
      setCmsConfig(e.detail || getLiveLandingPageConfig());
      setSections(getLiveLandingSections());
    };
    const handleShowcaseUpdate = () => {
      try {
        const saved = localStorage.getItem('itlc_showcase_custom_images');
        if (saved) setShowcaseImages(JSON.parse(saved));
      } catch (e) {}
    };
    window.addEventListener('landing_page_config_updated', handleCmsUpdate);
    window.addEventListener('showcase_images_updated', handleShowcaseUpdate);
    return () => {
      window.removeEventListener('landing_page_config_updated', handleCmsUpdate);
      window.removeEventListener('showcase_images_updated', handleShowcaseUpdate);
    };
  }, []);

  // Close 3-dots menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.action-menu-container')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Auto-play slideshow preview in admin
  useEffect(() => {
    const currentList = showcaseImages[selectedShowcaseModule] || [];
    if (!isPreviewPlaying || currentList.length <= 1) return;

    const timer = setInterval(() => {
      setPreviewSlideIndex(prev => (prev + 1) % currentList.length);
    }, sliderSpeed);

    return () => clearInterval(timer);
  }, [isPreviewPlaying, selectedShowcaseModule, showcaseImages, sliderSpeed]);

  // Reset preview index when switching modules
  useEffect(() => {
    setPreviewSlideIndex(0);
  }, [selectedShowcaseModule]);

  // Save Config Handlers
  const handleSaveConfig = () => {
    saveLiveLandingPageConfig(cmsConfig);
    addToast('Landing page settings published! Live home page updated.', 'success');
  };

  const handleResetConfig = () => {
    if (window.confirm('Reset all landing page content and settings to factory defaults?')) {
      const defConfig = resetLandingPageConfig();
      const defSections = resetLandingSections();
      setCmsConfig(defConfig);
      setSections(defSections);
      addToast('Reset to default landing page settings.', 'info');
    }
  };

  const handleSaveSections = (updated: CustomLandingSection[]) => {
    setSections(updated);
    saveLiveLandingSections(updated);
  };

  // Showcase Image Handlers
  const handleSaveShowcaseImages = (updated: Record<string, string[]>, showToastAlert = true) => {
    setShowcaseImages(updated);
    try {
      localStorage.setItem('itlc_showcase_custom_images', JSON.stringify(updated));
      localStorage.setItem('itlc_showcase_slider_interval', String(sliderSpeed));
      window.dispatchEvent(new CustomEvent('showcase_images_updated', { detail: updated }));
      if (showToastAlert) {
        addToast('Showcase images published to live landing page!', 'success');
      }
    } catch (e) {
      console.error('Error saving showcase images:', e);
      addToast('Failed to save showcase images to browser storage', 'error');
    }
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) {
      addToast('Please enter a valid image URL or path', 'error');
      return;
    }
    const currentList = showcaseImages[selectedShowcaseModule] || [];
    if (currentList.length >= 10) {
      addToast('Maximum 10 images allowed per module', 'warning');
      return;
    }
    const updatedList = [...currentList, newImageUrl.trim()];
    const updatedObj = { ...showcaseImages, [selectedShowcaseModule]: updatedList };
    handleSaveShowcaseImages(updatedObj);
    setNewImageUrl('');
    addToast('Image added to slider successfully!', 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (PNG, JPG, WebP)', 'error');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      addToast('Image file size must be under 8MB', 'error');
      return;
    }

    const currentList = showcaseImages[selectedShowcaseModule] || [];
    if (currentList.length >= 10) {
      addToast('Maximum 10 images allowed per module', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      if (dataUrl) {
        const updatedList = [...currentList, dataUrl];
        const updatedObj = { ...showcaseImages, [selectedShowcaseModule]: updatedList };
        handleSaveShowcaseImages(updatedObj);
        addToast(`Uploaded "${file.name}" from your computer into ${selectedShowcaseModule}!`, 'success');
      }
    };
    reader.readAsDataURL(file);

    // Reset file input so user can re-select same file if desired
    if (filePickerRef.current) {
      filePickerRef.current.value = '';
    }
  };

  const handleDeleteImage = (indexToDelete: number) => {
    const currentList = showcaseImages[selectedShowcaseModule] || [];
    if (currentList.length <= 1) {
      addToast('At least 1 image is required for the showcase slide.', 'warning');
      return;
    }
    const updatedList = currentList.filter((_, idx) => idx !== indexToDelete);
    const updatedObj = { ...showcaseImages, [selectedShowcaseModule]: updatedList };
    handleSaveShowcaseImages(updatedObj);
    if (previewSlideIndex >= updatedList.length) {
      setPreviewSlideIndex(0);
    }
    addToast('Image removed from slider.', 'info');
  };

  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    const currentList = [...(showcaseImages[selectedShowcaseModule] || [])];
    if (toIndex < 0 || toIndex >= currentList.length) return;
    const [moved] = currentList.splice(fromIndex, 1);
    currentList.splice(toIndex, 0, moved);
    const updatedObj = { ...showcaseImages, [selectedShowcaseModule]: currentList };
    handleSaveShowcaseImages(updatedObj);
    setPreviewSlideIndex(toIndex);
  };

  const handleResetCurrentModuleImages = () => {
    if (window.confirm(`Reset images for ${selectedShowcaseModule} to factory default mockups?`)) {
      const defaultList = DEFAULT_SHOWCASE_IMAGES[selectedShowcaseModule] || [];
      const updatedObj = { ...showcaseImages, [selectedShowcaseModule]: defaultList };
      handleSaveShowcaseImages(updatedObj);
      setPreviewSlideIndex(0);
      addToast(`Reset ${selectedShowcaseModule} to default images.`, 'info');
    }
  };

  const handleResetAllModuleImages = () => {
    if (window.confirm('Reset ALL 5 module showcase image sliders to factory default mockups?')) {
      handleSaveShowcaseImages(DEFAULT_SHOWCASE_IMAGES);
      setPreviewSlideIndex(0);
      addToast('Reset all showcase images to factory default mockups.', 'info');
    }
  };

  // Visibility Toggle
  const toggleVisibility = (id: string) => {
    const updated = sections.map(s => {
      if (s.id === id) {
        const nextState = !s.enabled;
        addToast(nextState ? `Section "${s.name}" is now visible on landing page.` : `Section "${s.name}" is now hidden.`, 'info');
        return { ...s, enabled: nextState };
      }
      return s;
    });
    handleSaveSections(updated);
  };

  // Reordering functions
  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    handleSaveSections(updated);
    addToast(`Moved "${temp.name}" up.`, 'info');
  };

  const moveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    handleSaveSections(updated);
    addToast(`Moved "${temp.name}" down.`, 'info');
  };

  // Drag & Drop
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedId && draggedId !== id) {
      setDragOverId(id);
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverId(null);
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    const fromIndex = sections.findIndex(s => s.id === draggedId);
    const toIndex = sections.findIndex(s => s.id === targetId);
    if (fromIndex !== -1 && toIndex !== -1) {
      const updated = [...sections];
      const [movedItem] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, movedItem);
      handleSaveSections(updated);
      addToast(`Reordered "${movedItem.name}" to position ${toIndex + 1}.`, 'success');
    }
    setDraggedId(null);
  };

  // Duplicate Section
  const handleDuplicate = (sec: CustomLandingSection) => {
    setActiveMenuId(null);
    const duplicate: CustomLandingSection = {
      ...sec,
      id: 'custom_' + Date.now(),
      name: `${sec.name} (Copy)`,
      isSystem: false,
      enabled: true
    };
    const updated = [...sections, duplicate];
    handleSaveSections(updated);
    addToast(`Duplicated "${sec.name}".`, 'success');
  };

  // Delete Section
  const confirmDelete = () => {
    if (!deleteConfirmSection) return;
    const updated = sections.filter(s => s.id !== deleteConfirmSection.id);
    handleSaveSections(updated);
    addToast(`Deleted section "${deleteConfirmSection.name}".`, 'info');
    setDeleteConfirmSection(null);
  };

  // Add Section Handler
  const handleAddSection = () => {
    if (!newSecName.trim()) {
      addToast('Please enter a section name', 'error');
      return;
    }

    const newId = 'custom_' + Date.now();
    let color = '#2563eb';
    if (newSecType === 'video_embed') color = '#dc2626';
    if (newSecType === 'feature_grid') color = '#0284c7';
    if (newSecType === 'testimonials') color = '#f59e0b';
    if (newSecType === 'faq_accordion') color = '#8b5cf6';
    if (newSecType === 'custom_html') color = '#10b981';

    const newSection: CustomLandingSection = {
      id: newId,
      name: newSecName.trim(),
      description: newSecDesc.trim() || 'Modern interactive component powered by ITLC Engine.',
      previewNote: 'Custom section added to public landing page',
      type: newSecType,
      enabled: true,
      badgeText: 'NEW SECTION',
      buttonText: 'Explore More',
      buttonUrl: '#contact',
      color: color,
      customFeatures: newSecType === 'feature_grid' ? [
        { title: 'Lightning Fast Deployment', desc: 'Instant enterprise cloud setup in under 2 minutes.' },
        { title: '100% Data Security', desc: 'SOC-2 compliant multi-tenant database architecture.' },
        { title: 'Full API Webhooks', desc: 'Plug into WhatsApp, ERP and custom biometrics effortlessly.' }
      ] : undefined,
      customHtml: newSecType === 'custom_html' ? '<div style="padding: 40px 20px; text-align: center; background: linear-gradient(135deg, #1e293b, #0f172a); color: #fff; border-radius: 20px;">\n  <h2 style="font-size: 28px; font-weight: 800; margin-bottom: 12px;">Custom Experience</h2>\n  <p style="color: #94a3b8; max-width: 600px; margin: 0 auto;">Design custom interactive widgets or embeds with full HTML/CSS.</p>\n</div>' : undefined
    };

    const updated = [...sections, newSection];
    handleSaveSections(updated);
    addToast(`Added new section "${newSecName}".`, 'success');
    setIsAddModalOpen(false);
    setNewSecName('');
    setNewSecDesc('');
  };

  // Section Type Icons
  const getSectionIcon = (type: string, isSystem?: boolean) => {
    switch(type) {
      case 'system_navbar': return <Layout size={18} className="text-blue-500" />;
      case 'system_hero': return <Tv size={18} className="text-indigo-500" />;
      case 'system_orbit': return <Sparkles size={18} className="text-purple-500" />;
      case 'system_showcase': return <LayoutTemplate size={18} className="text-sky-500" />;
      case 'system_pricing': return <CreditCard size={18} className="text-emerald-500" />;
      case 'system_footer': return <Globe size={18} className="text-slate-500" />;
      case 'cta_banner': return <Megaphone size={18} className="text-amber-500" />;
      case 'video_embed': return <Video size={18} className="text-rose-500" />;
      case 'feature_grid': return <Layers size={18} className="text-cyan-500" />;
      case 'faq_accordion': return <HelpCircle size={18} className="text-violet-500" />;
      case 'testimonials': return <Users size={18} className="text-orange-500" />;
      case 'custom_html': return <Code size={18} className="text-emerald-500" />;
      default: return <Sparkles size={18} className="text-blue-500" />;
    }
  };

  const getSectionTypeLabel = (type: string) => {
    switch(type) {
      case 'system_navbar': return 'Navigation Bar';
      case 'system_hero': return 'Hero Showcase';
      case 'system_orbit': return 'Ecosystem Orbit';
      case 'system_showcase': return 'Product Showcase';
      case 'system_pricing': return 'Pricing Matrix';
      case 'system_footer': return 'Footer & Links';
      case 'cta_banner': return 'Call to Action Banner';
      case 'video_embed': return 'Video Demo Embed';
      case 'feature_grid': return 'Interactive Features Grid';
      case 'faq_accordion': return 'FAQ Accordion';
      case 'testimonials': return 'Customer Testimonials';
      case 'custom_html': return 'Custom HTML Block';
      default: return 'Custom Section';
    }
  };

  const currentModuleDef = DEFAULT_SHOWCASE_MODULES.find(m => m.id === selectedShowcaseModule) || DEFAULT_SHOWCASE_MODULES[0];
  const activeModuleImages = showcaseImages[selectedShowcaseModule] || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Globe size={13} className="animate-spin text-indigo-400" />
              Live Landing CMS Engine
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Landing Page Studio & Media Manager
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl font-medium">
              Upload and manage showcase slider images (1 to 10 photos per module), configure layout order, contact touchpoints, brand styling, and headlines in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleResetConfig}
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              <RotateCcw size={14} />
              Reset Defaults
            </button>
            <button
              onClick={() => window.open('/', '_blank')}
              className="px-4 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 hover:text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              <ExternalLink size={14} />
              Open Live Site
            </button>
            <button
              onClick={handleSaveConfig}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 transform active:scale-95"
            >
              <Check size={16} strokeWidth={2.5} />
              Publish Changes
            </button>
          </div>
        </div>

        {/* CMS Tab Bar Navigation */}
        <div className="mt-8 flex items-center gap-2 border-b border-slate-800/80 overflow-x-auto pb-1 scrollbar-none">
          {/* 🖼️ Showcase Images Tab */}
          <button
            onClick={() => setActiveSubTab('showcase_images')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
              activeSubTab === 'showcase_images'
                ? 'border-indigo-400 text-white bg-indigo-500/20 shadow-inner'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <ImageIcon size={15} className={activeSubTab === 'showcase_images' ? 'text-indigo-400' : 'text-slate-400'} />
            🖼️ Showcase Images (1-10 Slides)
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/30 text-indigo-200 font-black border border-indigo-400/30">
              Admin Exclusive
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('sections')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
              activeSubTab === 'sections'
                ? 'border-indigo-400 text-white bg-indigo-500/20 shadow-inner'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Layers size={15} className={activeSubTab === 'sections' ? 'text-indigo-400' : 'text-slate-400'} />
            Sections & Layout Order
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-indigo-300 font-black border border-slate-700">
              {sections.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('contact')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
              activeSubTab === 'contact'
                ? 'border-indigo-400 text-white bg-indigo-500/20 shadow-inner'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Phone size={15} className={activeSubTab === 'contact' ? 'text-emerald-400' : 'text-slate-400'} />
            Contact & Touchpoints
          </button>

          <button
            onClick={() => setActiveSubTab('branding')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
              activeSubTab === 'branding'
                ? 'border-indigo-400 text-white bg-indigo-500/20 shadow-inner'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Palette size={15} className={activeSubTab === 'branding' ? 'text-pink-400' : 'text-slate-400'} />
            Brand & Styling
          </button>

          <button
            onClick={() => setActiveSubTab('hero')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
              activeSubTab === 'hero'
                ? 'border-indigo-400 text-white bg-indigo-500/20 shadow-inner'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Tv size={15} className={activeSubTab === 'hero' ? 'text-amber-400' : 'text-slate-400'} />
            Hero & Headlines
          </button>

          <button
            onClick={() => setActiveSubTab('preview')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
              activeSubTab === 'preview'
                ? 'border-indigo-400 text-white bg-indigo-500/20 shadow-inner'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Monitor size={15} className={activeSubTab === 'preview' ? 'text-cyan-400' : 'text-slate-400'} />
            Live Device Simulator
          </button>
        </div>
      </div>

      {/* SUB-TAB: SHOWCASE IMAGES & SLIDERS (SUPEROWNER EXCLUSIVE) */}
      {activeSubTab === 'showcase_images' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Info Banner */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black border border-indigo-200 dark:border-indigo-800/60 shadow-sm">
                <ImageIcon size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Landing Page Showcase Media Studio
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                    SUPEROWNER ONLY
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Upload images directly from your PC or paste URLs. Supports 1 to 10 auto-advancing slides for each product category on the public website.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <button
                onClick={handleResetAllModuleImages}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5"
              >
                <RotateCcw size={14} />
                Reset All 5 Modules
              </button>
              <button
                onClick={() => handleSaveShowcaseImages(showcaseImages, true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
              >
                <CheckCircle2 size={15} />
                Publish to Live Landing Page
              </button>
            </div>
          </div>

          {/* Module Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {DEFAULT_SHOWCASE_MODULES.map((mod) => {
              const IconComp = mod.icon;
              const isSelected = selectedShowcaseModule === mod.id;
              const imgCount = (showcaseImages[mod.id] || []).length;

              return (
                <button
                  key={mod.id}
                  onClick={() => setSelectedShowcaseModule(mod.id)}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm"
                      style={{ backgroundColor: mod.color }}
                    >
                      <IconComp size={16} />
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      isSelected 
                        ? 'bg-indigo-600 text-white border-indigo-500' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}>
                      {imgCount} / 10
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {mod.label}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {mod.badge}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main Control Grid for Selected Module */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Image Management & Uploaders (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Uploader Card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                      style={{ backgroundColor: currentModuleDef.color }}
                    >
                      {React.createElement(currentModuleDef.icon, { size: 18 })}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {currentModuleDef.label} Slides ({activeModuleImages.length}/10)
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {currentModuleDef.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleResetCurrentModuleImages}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw size={12} />
                    Reset
                  </button>
                </div>

                {/* Upload Options */}
                <div className="space-y-4">
                  {/* Browse PC Button */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                      1. Upload Image from Your Computer (Browse PC)
                    </label>
                    <input 
                      type="file" 
                      ref={filePickerRef}
                      accept="image/png,image/jpeg,image/webp,image/jpg,image/svg+xml"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => filePickerRef.current?.click()}
                      disabled={activeModuleImages.length >= 10}
                      className="w-full py-3.5 px-4 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-100/60 dark:hover:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group shadow-xs"
                    >
                      <UploadCloud size={18} className="group-hover:-translate-y-0.5 transition-transform text-indigo-600 dark:text-indigo-400" />
                      <span>Choose Image from Laptop/PC (PNG, JPG, WebP)</span>
                    </button>
                  </div>

                  {/* URL / Path Input */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                      2. Or Add via URL / File Path
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="e.g. /dashboards/my_custom_screenshot.png or https://..."
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddImageUrl();
                          }
                        }}
                      />
                      <button
                        onClick={handleAddImageUrl}
                        disabled={activeModuleImages.length >= 10 || !newImageUrl.trim()}
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
                      >
                        <Plus size={15} />
                        Add Slide
                      </button>
                    </div>
                  </div>

                  {/* Slider Timing Setting */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Sliders size={14} className="text-slate-400" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Slide Transition Interval:
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {[
                        { label: '2.5s (Fast)', val: 2500 },
                        { label: '3.5s (Default)', val: 3500 },
                        { label: '5.0s (Relaxed)', val: 5000 },
                      ].map(speed => (
                        <button
                          key={speed.val}
                          onClick={() => {
                            setSliderSpeed(speed.val);
                            localStorage.setItem('itlc_showcase_slider_interval', String(speed.val));
                            addToast(`Slider transition speed set to ${speed.label}`, 'info');
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                            sliderSpeed === speed.val
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {speed.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Slides List Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Configured Slides ({activeModuleImages.length} Active)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Use Up/Down arrows to reorder slide sequence
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[420px] overflow-y-auto">
                  {activeModuleImages.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No slides configured for this module. Please upload or add an image above.
                    </div>
                  ) : (
                    activeModuleImages.map((imgSrc, idx) => {
                      const isFirst = idx === 0;
                      const isLast = idx === activeModuleImages.length - 1;
                      const isDataUrl = imgSrc.startsWith('data:');

                      return (
                        <div 
                          key={idx}
                          className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          {/* Left: Index badge & Thumbnail */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-black flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
                              #{idx + 1}
                            </span>

                            <div 
                              onClick={() => setZoomImage(imgSrc)}
                              className="w-16 h-11 rounded-lg bg-slate-950 overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer relative group"
                              title="Click to zoom preview"
                            >
                              <img 
                                src={imgSrc} 
                                alt={`Slide ${idx + 1}`} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                <Maximize2 size={12} />
                              </div>
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                {isDataUrl ? `Uploaded Custom Image ${idx + 1} (Local PC)` : imgSrc.split('/').pop() || imgSrc}
                              </p>
                              <p className="text-[10px] font-mono text-slate-400 truncate">
                                {isDataUrl ? 'Direct Base64 Image' : imgSrc}
                              </p>
                            </div>
                          </div>

                          {/* Right: Reorder & Delete controls */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleMoveImage(idx, idx - 1)}
                              disabled={isFirst}
                              title="Move Up"
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                              <ArrowUp size={13} />
                            </button>
                            <button
                              onClick={() => handleMoveImage(idx, idx + 1)}
                              disabled={isLast}
                              title="Move Down"
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                              <ArrowDown size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteImage(idx)}
                              title="Delete Slide"
                              className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition-all ml-1"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Slider Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Live Carousel Preview Simulator
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPreviewPlaying(!isPreviewPlaying)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border transition-all ${
                        isPreviewPlaying
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                          : 'bg-amber-950/60 text-amber-400 border-amber-800'
                      }`}
                    >
                      {isPreviewPlaying ? <Pause size={12} /> : <Play size={12} />}
                      <span>{isPreviewPlaying ? 'Playing' : 'Paused'}</span>
                    </button>
                  </div>
                </div>

                {/* Display Screen Preview Frame */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video shadow-2xl group">
                  {activeModuleImages.length > 0 ? (
                    <img 
                      src={activeModuleImages[previewSlideIndex % activeModuleImages.length]} 
                      alt="Slider Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 text-xs gap-2">
                      <ImageIcon size={32} />
                      <span>No images available</span>
                    </div>
                  )}

                  {/* Chevrons overlay */}
                  {activeModuleImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setPreviewSlideIndex(prev => (prev - 1 + activeModuleImages.length) % activeModuleImages.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-sm transition-all"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => setPreviewSlideIndex(prev => (prev + 1) % activeModuleImages.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-sm transition-all"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </>
                  )}

                  {/* Top Badge */}
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-200 border border-white/10">
                    Slide {previewSlideIndex + 1} of {activeModuleImages.length}
                  </div>

                  {/* Bottom Dots */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    {activeModuleImages.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        onClick={() => setPreviewSlideIndex(dotIdx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          dotIdx === previewSlideIndex % activeModuleImages.length
                            ? 'bg-indigo-400 w-5'
                            : 'bg-white/40 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                  <div className="text-[11px] font-bold text-slate-300 flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    Live Website Integration Active
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Whenever you add or delete photos here, the public landing page showcase slider updates instantly with smooth animations, auto-advancement, and full lightbox zoom.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 1: SECTIONS & LAYOUT ORDER */}
      {activeSubTab === 'sections' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Action Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-sm">
                {sections.filter(s => s.enabled).length}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Visible Sections</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Drag or use arrow buttons to rearrange section order on the landing page.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus size={16} strokeWidth={2.5} />
                Add Custom Section
              </button>
            </div>
          </div>

          {/* Section List / Reorder Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {sections.map((section, index) => {
                const isFirst = index === 0;
                const isLast = index === sections.length - 1;
                const isDragged = draggedId === section.id;
                const isOver = dragOverId === section.id;

                return (
                  <div
                    key={section.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, section.id)}
                    onDragOver={(e) => handleDragOver(e, section.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, section.id)}
                    className={`p-4 md:p-5 flex items-center justify-between gap-4 transition-all ${
                      isDragged ? 'opacity-40 bg-indigo-50/50 dark:bg-indigo-950/30' : ''
                    } ${
                      isOver ? 'border-t-2 border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                    } ${
                      !section.enabled ? 'bg-slate-50/80 dark:bg-slate-900/40 opacity-70' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Left: Drag Handle & Order Badge */}
                    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                      <div 
                        className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Drag to reorder"
                      >
                        <GripVertical size={18} />
                      </div>

                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-slate-600 dark:text-slate-300 flex-shrink-0">
                        {index + 1}
                      </div>

                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-slate-700">
                        {getSectionIcon(section.type, section.isSystem)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {section.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            {getSectionTypeLabel(section.type)}
                          </span>
                          {section.isSystem ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                              System Core
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                              Custom Block
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {section.description || section.previewNote}
                        </p>
                      </div>
                    </div>

                    {/* Right: Controls & Visibility */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Up / Down Reorder Buttons */}
                      <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                        <button
                          onClick={() => moveUp(index)}
                          disabled={isFirst}
                          title="Move Up"
                          className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-slate-700 transition-all"
                        >
                          <ArrowUp size={15} />
                        </button>
                        <button
                          onClick={() => moveDown(index)}
                          disabled={isLast}
                          title="Move Down"
                          className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-slate-700 transition-all"
                        >
                          <ArrowDown size={15} />
                        </button>
                      </div>

                      {/* Visibility Toggle Switch */}
                      <button
                        onClick={() => toggleVisibility(section.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                          section.enabled
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {section.enabled ? (
                          <>
                            <Eye size={14} className="text-emerald-600 dark:text-emerald-400" />
                            <span className="hidden md:inline">Visible</span>
                          </>
                        ) : (
                          <>
                            <EyeOff size={14} className="text-slate-400" />
                            <span className="hidden md:inline">Hidden</span>
                          </>
                        )}
                      </button>

                      {/* Action Menu (3 Dots) */}
                      <div className="relative action-menu-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === section.id ? null : section.id);
                          }}
                          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {activeMenuId === section.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-fadeIn">
                            <button
                              onClick={() => {
                                setEditingSection(section);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                            >
                              <Edit2 size={14} className="text-indigo-500" />
                              Edit Section Content
                            </button>
                            <button
                              onClick={() => handleDuplicate(section)}
                              className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                            >
                              <Copy size={14} className="text-sky-500" />
                              Duplicate Section
                            </button>
                            {!section.isSystem && (
                              <button
                                onClick={() => {
                                  setDeleteConfirmSection(section);
                                  setActiveMenuId(null);
                                daylight: true
                                }}
                                className="w-full px-4 py-2 text-left text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700"
                              >
                                <Trash2 size={14} />
                                Delete Section
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CONTACT & TOUCHPOINTS */}
      {activeSubTab === 'contact' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          {/* WhatsApp Settings Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                <MessageCircle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Sales WhatsApp Number</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Direct instant chat button on landing navbar and floating badge.</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                WhatsApp Phone Number (with Country Code)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cmsConfig.whatsappSalesNumber}
                  onChange={(e) => setCmsConfig({ ...cmsConfig, whatsappSalesNumber: e.target.value.replace(/[^0-9]/g, '') })}
                  placeholder="e.g. 919532341000"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">digits only</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                When visitors click "Contact Sales via WhatsApp", it directly opens WhatsApp web or app targeting this number.
              </p>

              <div className="pt-2">
                <a
                  href={`https://wa.me/${cmsConfig.whatsappSalesNumber}?text=${encodeURIComponent('Hello ITLC Team, I would like a product demo.')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-all"
                >
                  <ExternalLink size={13} />
                  Test Live WhatsApp Link
                </a>
              </div>
            </div>
          </div>

          {/* Support Email Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
                <Mail size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Support & Sales Email</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Target email address for landing inquiries and contact form.</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Official Support Email Address
              </label>
              <input
                type="email"
                value={cmsConfig.supportEmail}
                onChange={(e) => setCmsConfig({ ...cmsConfig, supportEmail: e.target.value })}
                placeholder="e.g. support@itlcindia.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Displayed in the footer, contact section, and modal lead generation dispatches.
              </p>

              <div className="pt-2">
                <a
                  href={`mailto:${cmsConfig.supportEmail}`}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold hover:bg-blue-100 transition-all"
                >
                  <ExternalLink size={13} />
                  Send Test Email
                </a>
              </div>
            </div>
          </div>

          {/* Company Identity & Tagline */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-800">
                <Building size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Company Identity & Tagline</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Brand representation across the top navbar and footer.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Company Name (Brand Header)
                </label>
                <input
                  type="text"
                  value={cmsConfig.companyName}
                  onChange={(e) => setCmsConfig({ ...cmsConfig, companyName: e.target.value })}
                  placeholder="e.g. ITLC INDIA PVT LTD"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Company Tagline
                </label>
                <input
                  type="text"
                  value={cmsConfig.companyTagline}
                  onChange={(e) => setCmsConfig({ ...cmsConfig, companyTagline: e.target.value })}
                  placeholder="e.g. Unified Business & Workforce Operating System"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: BRAND & STYLING */}
      {activeSubTab === 'branding' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          {/* Primary Brand Color Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 flex items-center justify-center border border-pink-200 dark:border-pink-800">
                <Palette size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Primary Theme Accent</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Gradients, primary buttons, and highlight glow colors.</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={cmsConfig.primaryColor || '#2563eb'}
                  onChange={(e) => setCmsConfig({ ...cmsConfig, primaryColor: e.target.value })}
                  className="w-12 h-12 rounded-xl cursor-pointer border-0 p-1 bg-transparent"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={cmsConfig.primaryColor || '#2563eb'}
                    onChange={(e) => setCmsConfig({ ...cmsConfig, primaryColor: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              {/* Color Presets */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Palette Presets</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { name: 'Royal Blue', hex: '#2563eb' },
                    { name: 'Sky Cyan', hex: '#0284c7' },
                    { name: 'Electric Purple', hex: '#7c3aed' },
                    { name: 'Emerald Green', hex: '#059669' },
                    { name: 'Crimson Rose', hex: '#e11d48' },
                    { name: 'Amber Gold', hex: '#d97706' }
                  ].map(preset => (
                    <button
                      key={preset.hex}
                      onClick={() => setCmsConfig({ ...cmsConfig, primaryColor: preset.hex })}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.hex }}></span>
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Typography & Assets */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-200 dark:border-violet-800">
                <Code size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Typography & Favicon</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">System font styling and browser tab icon.</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Global Font Family
                </label>
                <select
                  value={cmsConfig.fontFamily || 'Inter, sans-serif'}
                  onChange={(e) => setCmsConfig({ ...cmsConfig, fontFamily: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="Inter, sans-serif">Inter (Modern Clean UI - Default)</option>
                  <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans (High-Tech Enterprise)</option>
                  <option value="'Outfit', sans-serif">Outfit (Geometric Modern)</option>
                  <option value="'Roboto', sans-serif">Roboto (Material Standard)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Brand Logo Path / URL
                </label>
                <input
                  type="text"
                  value={cmsConfig.logoUrl || '/itlc_logo.png'}
                  onChange={(e) => setCmsConfig({ ...cmsConfig, logoUrl: e.target.value })}
                  placeholder="/itlc_logo.png"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: HERO & HEADLINES */}
      {activeSubTab === 'hero' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800">
              <Tv size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Hero Value Proposition & Headlines</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configure high-converting headline, subtitle, and trust metrics.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Primary Hero Headline (English)
              </label>
              <input
                type="text"
                value={cmsConfig.heroHeadlineEn}
                onChange={(e) => setCmsConfig({ ...cmsConfig, heroHeadlineEn: e.target.value })}
                placeholder="e.g. Streamline Your HR & Sales Operations"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Hero Subtitle (English)
              </label>
              <textarea
                rows={3}
                value={cmsConfig.heroSubtitleEn}
                onChange={(e) => setCmsConfig({ ...cmsConfig, heroSubtitleEn: e.target.value })}
                placeholder="Modern HRMS & CRM platform to manage your people, payroll, attendance, and business growth — all in one place."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-indigo-900/50 relative overflow-hidden">
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-2">Live Headline Preview</div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-3">
              {cmsConfig.heroHeadlineEn}
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              {cmsConfig.heroSubtitleEn}
            </p>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: LIVE DEVICE SIMULATOR */}
      {activeSubTab === 'preview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Simulator Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Device Simulator:</span>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    previewDevice === 'desktop'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Monitor size={14} />
                  Desktop (100%)
                </button>
                <button
                  onClick={() => setPreviewDevice('tablet')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    previewDevice === 'tablet'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Tablet size={14} />
                  Tablet (768px)
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    previewDevice === 'mobile'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Smartphone size={14} />
                  Mobile (375px)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewKey(prev => prev + 1)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5"
              >
                <RefreshCw size={13} />
                Reload Preview
              </button>
              <button
                onClick={() => window.open('/', '_blank')}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <ExternalLink size={13} />
                Open In Tab
              </button>
            </div>
          </div>

          {/* Iframe Viewport Container */}
          <div className="flex justify-center bg-slate-100 dark:bg-slate-950 p-4 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 min-h-[680px]">
            <div 
              style={{
                width: previewDevice === 'desktop' ? '100%' : previewDevice === 'tablet' ? '768px' : '375px',
                transition: 'width 0.3s ease-in-out'
              }}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-300 dark:border-slate-700 flex flex-col"
            >
              {/* Fake Browser Chrome */}
              <div className="bg-slate-200 dark:bg-slate-800 px-4 py-2.5 flex items-center gap-2 border-b border-slate-300 dark:border-slate-700">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                </div>
                <div className="flex-1 max-w-sm mx-auto bg-white dark:bg-slate-900 rounded-lg px-3 py-1 text-[11px] font-mono text-slate-500 dark:text-slate-400 text-center truncate border border-slate-300 dark:border-slate-700">
                  https://itlc.in/
                </div>
              </div>

              {/* Live Iframe */}
              <iframe
                key={previewKey}
                src="/"
                title="Live Landing Page Preview"
                className="w-full flex-1 min-h-[600px] border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* ADD SECTION MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scaleIn">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Plus size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Custom Section</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Select section template and enter display details.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Section Type Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Choose Section Type</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-200 dark:border-slate-700 rounded-xl">
                  {[
                    { type: 'cta_banner' as const, label: 'CTA Banner', icon: <Megaphone size={16} /> },
                    { type: 'feature_grid' as const, label: 'Feature Grid', icon: <Layers size={16} /> },
                    { type: 'faq_accordion' as const, label: 'FAQ Accordion', icon: <HelpCircle size={16} /> },
                    { type: 'video_embed' as const, label: 'Video Demo', icon: <Video size={16} /> },
                    { type: 'testimonials' as const, label: 'Testimonials', icon: <Users size={16} /> },
                    { type: 'custom_html' as const, label: 'Custom HTML', icon: <Code size={16} /> }
                  ].map(t => (
                    <button
                      key={t.type}
                      type="button"
                      onClick={() => setNewSecType(t.type)}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                        newSecType === t.type
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {t.icon}
                      <span className="text-xs">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Section Title / Name
                </label>
                <input
                  type="text"
                  value={newSecName}
                  onChange={(e) => setNewSecName(e.target.value)}
                  placeholder="e.g. Enterprise Security & SLA"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Section Subtitle / Description
                </label>
                <textarea
                  rows={2}
                  value={newSecDesc}
                  onChange={(e) => setNewSecDesc(e.target.value)}
                  placeholder="e.g. Bank-grade 256-bit encryption with 99.9% uptime SLA guarantee."
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSection}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25"
              >
                Create Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT SECTION MODAL */}
      {editingSection && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scaleIn">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Edit2 size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Section: {editingSection.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Configure content properties and display parameters.</p>
                </div>
              </div>
              <button
                onClick={() => setEditingSection(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Section Name
                </label>
                <input
                  type="text"
                  value={editingSection.name}
                  onChange={(e) => setEditingSection({ ...editingSection, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Description / Subtitle
                </label>
                <textarea
                  rows={2}
                  value={editingSection.description || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Badge Pill Text
                  </label>
                  <input
                    type="text"
                    value={editingSection.badgeText || ''}
                    onChange={(e) => setEditingSection({ ...editingSection, badgeText: e.target.value })}
                    placeholder="e.g. FEATURED"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={editingSection.buttonText || ''}
                    onChange={(e) => setEditingSection({ ...editingSection, buttonText: e.target.value })}
                    placeholder="e.g. Get Started"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Button Action URL / Anchor Target
                </label>
                <input
                  type="text"
                  value={editingSection.buttonUrl || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, buttonUrl: e.target.value })}
                  placeholder="e.g. #contact or /login"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              {editingSection.type === 'custom_html' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Custom HTML / CSS Code
                  </label>
                  <textarea
                    rows={6}
                    value={editingSection.customHtml || ''}
                    onChange={(e) => setEditingSection({ ...editingSection, customHtml: e.target.value })}
                    className="w-full font-mono text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-900 text-emerald-400"
                  />
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setEditingSection(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const updated = sections.map(s => s.id === editingSection.id ? editingSection : s);
                  handleSaveSections(updated);
                  addToast(`Updated section "${editingSection.name}".`, 'success');
                  setEditingSection(null);
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmSection && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-scaleIn">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto border border-red-200 dark:border-red-800">
              <Trash2 size={24} />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Section?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to permanently delete <span className="font-bold text-slate-700 dark:text-slate-200">"{deleteConfirmSection.name}"</span>? This cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmSection(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-500/25"
              >
                Yes, Delete Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ZOOM LIGHTBOX MODAL */}
      {zoomImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center">
            <img 
              src={zoomImage} 
              alt="Expanded Preview" 
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/20"
            />
            <button
              onClick={() => setZoomImage(null)}
              className="absolute top-3 right-3 p-3 rounded-full bg-black/70 hover:bg-black text-white transition-all shadow-xl"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingSettingsTab;
