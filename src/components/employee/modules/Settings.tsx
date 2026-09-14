"use client";

import React, { useState } from "react";
import { useHRMS, EmployeeProfile } from "../context/HRMSContext";
import { Card, Button, Select, Modal, cn } from "../UI";
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Globe,
  BellRing,
  Lock,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  FileText,
  Search,
  Eye,
  Download,
  Printer,
  User,
  Image as ImageIcon,
} from "lucide-react";

export interface ProfileDoc {
  id: string;
  name: string;
  type: string;
  status: "Uploaded" | "Not Uploaded";
  uploadedDate: string;
  fileType: string;
  fileData: string | null;
  fileName: string | null;
  canDelete: boolean;
  canReplace: boolean;
}

export const Settings: React.FC = () => {
  const { settings, updateSettings, profile, changePassword, activeSubTab: globalSubTab, setActiveSubTab: setGlobalSubTab, documents } = useHRMS();

  // Corporate Document Center Modals & States
  const [isCorporateDocsOpen, setIsCorporateDocsOpen] = useState(false);
  const [corpDocsSearch, setCorpDocsSearch] = useState("");
  const [selectedCorpDoc, setSelectedCorpDoc] = useState<ProfileDoc | null>(null);

  const handleDownload = (doc: ProfileDoc) => {
    if (doc.fileData && !doc.fileData.startsWith("DEFAULT_")) {
      const link = document.createElement("a");
      link.href = doc.fileData;
      link.download = doc.fileName || `${doc.name.toLowerCase().replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const simulatedText = `ITLC HRMS - SECURE DOCUMENT VAULT\n\nDocument Name: ${doc.name}\nEmployee Name: ${profile.fullName}\nEmployee ID: ${profile.id}\nVerification Date: ${doc.uploadedDate}\nStatus: Verified & Verified by HR Operations\n\n* This is a simulated certificate validating the secure document presence in your profile sandbox.`;
      const blob = new Blob([simulatedText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${doc.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_validated.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Normalize subtabs
  const activeSubTab = ["settings-account", "settings-password", "settings-notifications"].includes(globalSubTab)
    ? globalSubTab
    : "settings-account";

  const setActiveSubTab = (tabId: string) => setGlobalSubTab(tabId);

  // Password fields
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  const handleLanguageChange = (lang: string) => {
    updateSettings({ language: lang as any });
  };

  const toggleThemeSetting = (theme: "light" | "dark") => {
    updateSettings({ theme });
  };

  const handleToggle = (key: "emailNotification" | "pushNotification" | "marketingEmail") => {
    updateSettings({ [key]: !settings[key] });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    if (!oldPass || !newPass || !confirmPass) {
      setPassError("All fields are required.");
      return;
    }

    if (newPass.length < 6) {
      setPassError("New password must be at least 6 characters long.");
      return;
    }

    if (newPass !== confirmPass) {
      setPassError("New passwords do not match.");
      return;
    }

    setPassLoading(true);

    try {
      const success = await changePassword(oldPass, newPass);
      if (success) {
        setPassSuccess("Password updated successfully!");
        setOldPass("");
        setNewPass("");
        setConfirmPass("");
      } else {
        setPassError("Incorrect current password.");
      }
    } catch (err) {
      setPassError("Failed to update password. Please try again.");
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Tabs navigation */}
      <div className="flex bg-card p-1 rounded-xl border border-border overflow-x-auto space-x-1 shrink-0 scrollbar-none print:hidden">
        {[
          { id: "settings-account", label: "Account Settings", icon: UserCheck },
          { id: "settings-password", label: "Change Password", icon: Lock },
          { id: "settings-notifications", label: "Notification Settings", icon: BellRing },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
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

      {/* RENDER ACCOUNT SETTINGS */}
      {activeSubTab === "settings-account" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          {/* Theme and Language Card */}
          <Card className="p-6 space-y-6 border border-border">
            <h3 className="text-sm font-bold text-foreground pb-2 border-b border-border flex items-center gap-2">
              <Globe className="h-4.5 w-4.5 text-primary" /> Visual & Localization
            </h3>

            {/* Theme selection */}
            <div className="space-y-2">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Display Theme Mode</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => toggleThemeSetting("light")}
                  className={cn(
                    "p-3 border rounded-xl flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer transition-all",
                    settings.theme === "light"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:bg-secondary/40 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Sun className="h-4 w-4" /> Light Mode
                </button>
                <button
                  type="button"
                  onClick={() => toggleThemeSetting("dark")}
                  className={cn(
                    "p-3 border rounded-xl flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer transition-all",
                    settings.theme === "dark"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:bg-secondary/40 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Moon className="h-4 w-4" /> Dark Mode
                </button>
              </div>
            </div>

            {/* Language selection */}
            <div className="space-y-2">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Default Language Selection</span>
              <Select
                value={settings.language}
                onChange={handleLanguageChange}
                options={[
                  { value: "en", label: "English (US)" },
                  { value: "es", label: "Español (ES)" },
                  { value: "fr", label: "Français (FR)" },
                  { value: "de", label: "Deutsch (DE)" },
                ]}
              />
            </div>
          </Card>

          {/* Account Profile info */}
          <Card className="p-6 space-y-6 border border-border">
            <h3 className="text-sm font-bold text-foreground pb-2 border-b border-border flex items-center gap-2">
              <UserCheck className="h-4.5 w-4.5 text-primary" /> Employee Credentials
            </h3>
            
            <div className="space-y-4 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Full Name:</span>
                <span className="font-bold text-foreground">{profile.fullName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Email Address:</span>
                <span className="font-bold text-foreground">{profile.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Employee ID:</span>
                <span className="font-mono font-bold text-primary">{profile.id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Department:</span>
                <span className="font-semibold text-foreground">{profile.department}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Job Title:</span>
                <span className="font-semibold text-foreground">{profile.designation}</span>
              </div>
              
              <div className="pt-4 border-t border-border/40 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<FileText className="h-3.5 w-3.5" />}
                  onClick={() => setIsCorporateDocsOpen(true)}
                  className="text-xs w-full sm:w-auto"
                >
                  HR Letters & Agreements
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* RENDER CHANGE PASSWORD */}
      {activeSubTab === "settings-password" && (
        <Card className="max-w-xl p-6 space-y-6 animate-fadeIn">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Lock className="h-4.5 w-4.5 text-primary" /> Update Access Password
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Change your password credentials periodically to secure your self-service portal account.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Current Password</label>
              <input
                type="password"
                placeholder="Enter current password"
                value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs md:text-sm rounded-lg border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">New Password</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs md:text-sm rounded-lg border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Re-type new password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs md:text-sm rounded-lg border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {passError && (
              <p className="text-xs font-semibold text-rose-500 flex items-center gap-1.5 bg-rose-500/10 p-2 rounded-lg border border-rose-500/10">
                <AlertCircle className="h-4 w-4 shrink-0" /> {passError}
              </p>
            )}

            {passSuccess && (
              <p className="text-xs font-semibold text-emerald-500 flex items-center gap-1.5 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/10 leading-snug">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> {passSuccess}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-border mt-6">
              <Button
                type="button"
                variant="outline"
                disabled={passLoading}
                onClick={() => {
                  setOldPass("");
                  setNewPass("");
                  setConfirmPass("");
                  setPassError("");
                  setPassSuccess("");
                }}
              >
                Clear
              </Button>
              <Button
                type="submit"
                loading={passLoading}
              >
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* RENDER NOTIFICATION SETTINGS */}
      {activeSubTab === "settings-notifications" && (
        <Card className="max-w-2xl p-6 space-y-6 animate-fadeIn">
          <h3 className="text-sm font-bold text-foreground pb-2 border-b border-border flex items-center gap-2">
            <BellRing className="h-4.5 w-4.5 text-primary" /> Notifications & Alerts
          </h3>

          <div className="space-y-4">
            
            {/* Email Checkbox */}
            <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.emailNotification}
                onChange={() => handleToggle("emailNotification")}
                className="mt-0.5 shrink-0"
              />
              <div className="text-xs">
                <span className="font-bold text-foreground block">Email Notifications</span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  Receive salary confirmations, policy updates, and leave approvals via email
                </span>
              </div>
            </label>

            {/* Push Checkbox */}
            <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.pushNotification}
                onChange={() => handleToggle("pushNotification")}
                className="mt-0.5 shrink-0"
              />
              <div className="text-xs">
                <span className="font-bold text-foreground block">Push Notifications</span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  Display real-time desktop banner notifications for check-in and breaks
                </span>
              </div>
            </label>

            {/* Marketing Checkbox */}
            <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.marketingEmail}
                onChange={() => handleToggle("marketingEmail")}
                className="mt-0.5 shrink-0"
              />
              <div className="text-xs">
                <span className="font-bold text-foreground block">Corporate Newsletters</span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  Subscribe to weekly business digests and employee benefit circulars
                </span>
              </div>
            </label>

          </div>
        </Card>
      )}

      {/* Security Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-secondary/50 border border-border flex gap-3">
        <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-foreground">ESS Portal Security Compliance</h4>
          <p className="text-[10px] text-muted-foreground mt-1 leading-snug">
            Your self-service preferences are compliant under SOC2 security and GDPR protocols. Changes to email configurations and themes are synced instantly and take effect across all session instances.
          </p>
        </div>
      </div>

      {/* 1. Corporate HR Letters Center Modal */}
      <Modal
        isOpen={isCorporateDocsOpen}
        onClose={() => setIsCorporateDocsOpen(false)}
        title="Corporate Document Center"
        size="lg"
      >
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-secondary/25 p-4 rounded-xl border border-border">
            <div>
              <h4 className="text-xs font-bold text-foreground">HR Agreements & Letters</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">Secure repository for legal and employment verifications</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search HR documents..."
                value={corpDocsSearch}
                onChange={(e) => setCorpDocsSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* List of Corporate Documents */}
          <div className="space-y-3">
            {documents
              .filter((doc) => doc.category !== "Identity") // Filter out Identity Card which has a separate button
              .filter((doc) => doc.name.toLowerCase().includes(corpDocsSearch.toLowerCase()))
              .map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3.5 border border-border rounded-xl bg-card hover:bg-secondary/15 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary/80 text-primary border border-border">
                      <FileText className="h-4.5 w-4.5 text-primary shrink-0" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground block truncate">
                        {doc.name.replace(/_/g, " ")}
                      </span>
                      <span className="text-[9px] text-muted-foreground block">
                        Issued: {doc.issueDate} | Size: {doc.fileSize}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Eye className="h-3 w-3" />}
                      onClick={() => {
                        let type = "offer-letter";
                        if (doc.name.toLowerCase().includes("appointment") || doc.name.toLowerCase().includes("agreement")) {
                          type = "appointment-letter";
                        }
                        setSelectedCorpDoc({
                          id: doc.id,
                          name: doc.name.replace(/_/g, " "),
                          type: type,
                          status: "Uploaded",
                          uploadedDate: doc.issueDate,
                          fileType: "application/pdf",
                          fileData: "DEFAULT_LETTER",
                          fileName: doc.name,
                          canDelete: false,
                          canReplace: false
                        });
                      }}
                      className="text-[10px] h-7 px-2.5"
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Download className="h-3 w-3" />}
                      onClick={() => {
                        let type = "offer-letter";
                        if (doc.name.toLowerCase().includes("appointment") || doc.name.toLowerCase().includes("agreement")) {
                          type = "appointment-letter";
                        }
                        const dummyDoc = {
                          id: doc.id,
                          name: doc.name.replace(/_/g, " "),
                          type: type,
                          status: "Uploaded" as const,
                          uploadedDate: doc.issueDate,
                          fileType: "application/pdf",
                          fileData: "DEFAULT_LETTER",
                          fileName: doc.name,
                          canDelete: false,
                          canReplace: false
                        };
                        handleDownload(dummyDoc);
                      }}
                      className="text-[10px] h-7 px-2.5"
                    >
                      Download
                    </Button>
                  </div>
                </div>
              ))}
          </div>

          {/* Privacy Disclaimer */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3 text-xs">
            <AlertCircle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-amber-500 text-[11px]">Confidentiality Notice</h5>
              <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">
                All document actions are logged. Unauthorized sharing or distribution of these employment records is strictly prohibited under the ITLC Data Privacy Agreement.
              </p>
            </div>
          </div>
        </div>
      </Modal>

      {/* 2. Corporate Letter Document Preview Modal */}
      <Modal
        isOpen={selectedCorpDoc !== null}
        onClose={() => setSelectedCorpDoc(null)}
        title={selectedCorpDoc ? `${selectedCorpDoc.name} - Viewer` : "Corporate Document"}
        size="lg"
      >
        {selectedCorpDoc && (
          <div className="space-y-6">
            <div className="flex justify-end gap-2 pb-2 border-b border-border print:hidden">
              <Button variant="outline" size="sm" icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>
                Print
              </Button>
              <Button variant="primary" size="sm" icon={<Download className="h-4 w-4" />} onClick={() => handleDownload(selectedCorpDoc)}>
                Download PDF
              </Button>
            </div>
            <div className="bg-card text-foreground rounded-xl overflow-hidden p-6 border border-border">
              <DocumentPreviewer doc={selectedCorpDoc} profile={profile} />
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

// ========================================================
// HIGH-FIDELITY CUSTOM DOCUMENT PREVIEW COMPONENT
// ========================================================
const DocumentPreviewer: React.FC<{ doc: ProfileDoc; profile: EmployeeProfile }> = ({ doc, profile }) => {
  // 1. User uploaded custom Image
  if (doc.fileData && doc.fileData.startsWith("data:image")) {
    return (
      <div className="flex justify-center items-center bg-secondary/20 p-4 rounded-xl border border-border">
        <img src={doc.fileData} alt={doc.name} className="max-h-[60vh] object-contain rounded-lg shadow-md" />
      </div>
    );
  }

  // 2. User uploaded custom PDF
  if (doc.fileData && doc.fileData.startsWith("data:application/pdf")) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-xl bg-secondary/15 space-y-4">
        <FileText className="h-16 w-16 text-primary animate-pulse" />
        <div className="text-center space-y-1">
          <h4 className="font-bold text-foreground">{doc.fileName || "uploaded_document.pdf"}</h4>
          <p className="text-xs text-muted-foreground">PDF Document Size: ~{(doc.fileData.length * 0.75 / 1024).toFixed(1)} KB</p>
        </div>
        <span className="text-xs text-muted-foreground text-center max-w-sm block">
          For sandbox compliance and security, please click the <strong>Download File</strong> option to review the full PDF.
        </span>
      </div>
    );
  }

  // 3. Fallback: High-Fidelity Simulated Document Mock templates
  switch (doc.type) {
    case "photo":
      return (
        <div className="flex justify-center items-center bg-secondary/20 p-8 rounded-xl border border-border">
          <div className="h-48 w-48 rounded-full overflow-hidden border-4 border-primary/20 bg-card shadow-lg">
            {profile.photo ? (
              <img src={profile.photo} alt={profile.fullName} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-5xl font-black text-primary">
                {profile.fullName.split(" ").map((n) => n[0]).join("")}
              </div>
            )}
          </div>
        </div>
      );
      
    case "aadhaar":
      return (
        <div className="max-w-md mx-auto border-2 border-sky-600 bg-sky-50 dark:bg-slate-900/60 p-5 rounded-xl shadow-lg font-sans relative overflow-hidden text-slate-800 dark:text-slate-200">
          <div className="flex justify-between items-start border-b border-sky-400 pb-3 mb-4">
            <div className="flex items-center gap-1.5">
              <div className="h-8 w-8 bg-amber-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold shrink-0">印</div>
              <div>
                <h4 className="text-xs font-black tracking-wide text-sky-800 dark:text-sky-400 leading-none">GOVERNMENT OF INDIA</h4>
                <span className="text-[8px] text-muted-foreground leading-none">Unique Identification Authority of India</span>
              </div>
            </div>
            <span className="text-[10px] font-black text-sky-800 dark:text-sky-400">आधार</span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1 flex flex-col items-center justify-center border border-sky-200 bg-white p-1 rounded-lg">
              <div className="h-24 w-20 bg-slate-100 flex items-center justify-center overflow-hidden rounded">
                {profile.photo ? (
                  <img src={profile.photo} alt="Aadhaar photo" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-slate-400" />
                )}
              </div>
              <span className="text-[7px] text-muted-foreground mt-1 font-bold">Verified Photo</span>
            </div>

            <div className="col-span-2 space-y-1.5 text-xs text-foreground/90 leading-tight">
              <div>Name: <strong className="font-bold text-foreground">{profile.fullName}</strong></div>
              <div>DOB: <strong>{profile.dob}</strong></div>
              <div>Gender: <strong>{profile.gender}</strong></div>
              <div className="text-[10px] text-muted-foreground pt-1 border-t border-sky-100 dark:border-slate-800">
                Address: <span className="block leading-tight mt-0.5 text-foreground/80">{profile.address}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-sky-400 mt-5 pt-3 text-center space-y-1">
            <div className="text-sm font-extrabold tracking-widest text-sky-900 dark:text-sky-300 font-mono">
              3892 4829 8293
            </div>
            <div className="text-[8px] text-sky-800 dark:text-sky-400 font-medium">
              आधार - आम आदमी का अधिकार
            </div>
          </div>
        </div>
      );

    case "pan":
      return (
        <div className="max-w-md mx-auto border-2 border-emerald-600 bg-emerald-50/20 dark:bg-slate-900/60 p-5 rounded-xl shadow-lg text-slate-800 dark:text-slate-200">
          <div className="flex justify-between items-center border-b border-emerald-400 pb-3 mb-4">
            <div>
              <h4 className="text-[10px] font-black tracking-wide text-emerald-800 dark:text-emerald-400 leading-none">INCOME TAX DEPARTMENT</h4>
              <span className="text-[8px] text-muted-foreground leading-none">GOVERNMENT OF INDIA</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-emerald-800 dark:text-emerald-400">PAN CARD</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2.5 text-xs">
              <div>
                <span className="text-[8px] text-muted-foreground uppercase font-bold block">Permanent Account Number (PAN)</span>
                <span className="font-mono font-bold text-sm tracking-wide text-foreground">AAKPT8293D</span>
              </div>
              <div>
                <span className="text-[8px] text-muted-foreground uppercase font-bold block">Name</span>
                <span className="font-bold text-foreground">{profile.fullName.toUpperCase()}</span>
              </div>
              <div>
                <span className="text-[8px] text-muted-foreground uppercase font-bold block">Date of Birth</span>
                <span className="font-bold text-foreground">{profile.dob}</span>
              </div>
            </div>

            <div className="col-span-1 flex flex-col items-center justify-between">
              <div className="h-20 w-16 bg-white border border-emerald-200 p-0.5 rounded flex items-center justify-center overflow-hidden">
                {profile.photo ? (
                  <img src={profile.photo} alt="PAN photo" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-slate-300" />
                )}
              </div>
              <div className="border border-border p-1 bg-white dark:bg-slate-900 w-full rounded text-center text-[7px] font-serif italic mt-2 text-foreground truncate">
                {profile.fullName.split(" ")[0]}
              </div>
            </div>
          </div>

          <div className="text-[8px] text-muted-foreground border-t border-emerald-400 mt-4 pt-2 text-center">
            * This card is valid throughout India for tax compliance purposes.
          </div>
        </div>
      );

    case "resume":
      return (
        <div className="max-w-lg mx-auto bg-card text-foreground border border-border p-8 rounded-xl shadow-lg space-y-6 text-xs leading-relaxed max-h-[60vh] overflow-y-auto">
          <div className="text-center space-y-1.5 pb-4 border-b border-border">
            <h2 className="text-lg font-black text-foreground">{profile.fullName}</h2>
            <p className="text-xs font-semibold text-primary">{profile.designation}</p>
            <p className="text-muted-foreground text-[10px]">{profile.email} | {profile.mobile} | {profile.address}</p>
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold uppercase text-[10px] text-primary tracking-wider border-b border-border pb-1">Professional Experience</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between font-bold">
                  <span>Software Engineer | ITLC Technologies</span>
                  <span>{profile.joiningDate} - Present</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Responsible for coding, maintaining, and shipping features for Enterprise HRMS ESS dashboards. Specialized in Next.js, React, and TypeScript.
                </p>
              </div>
              <div>
                <div className="flex justify-between font-bold">
                  <span>Associate Engineer | PrevCorp Inc</span>
                  <span>Jan 2024 - May 2026</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Assisted in designing user interfaces, writing unit tests, and optimizing database queries.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold uppercase text-[10px] text-primary tracking-wider border-b border-border pb-1">Education</h4>
            <div>
              <div className="flex justify-between font-bold">
                <span>B.Tech in Computer Science & Engineering</span>
                <span>Graduated 2023</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Global Institute of Technology - 8.9 CGPA</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold uppercase text-[10px] text-primary tracking-wider border-b border-border pb-1">Technical Skills</h4>
            <div className="flex flex-wrap gap-1.5">
              {["React", "Next.js", "TypeScript", "Tailwind CSS", "Redux Toolkit", "Framer Motion", "Node.js", "Git"].map((skill, i) => (
                <span key={i} className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-[10px] font-medium border border-border">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      );

    case "exp-letter":
      return (
        <div className="max-w-lg mx-auto bg-card text-foreground border border-border p-8 rounded-xl shadow-lg space-y-6 text-xs leading-relaxed">
          <div className="text-center pb-4 border-b border-border">
            <h3 className="font-black text-primary text-base">PREVCORP ENTERPRISES INC.</h3>
            <p className="text-[9px] text-muted-foreground mt-0.5">102 Business District, Techno Park, Phase 1</p>
          </div>
          
          <div className="text-right text-[10px] text-muted-foreground">Date: May 20, 2026</div>

          <div className="text-center font-bold uppercase tracking-wider text-foreground text-xs py-2">
            TO WHOMSOEVER IT MAY CONCERN
          </div>

          <p>
            This is to certify that <strong>{profile.fullName}</strong> was employed with PrevCorp Enterprises Inc. as an Associate Software Engineer from <strong>January 15, 2024</strong> to <strong>May 10, 2026</strong>.
          </p>

          <p>
            During their tenure with us, they demonstrated exceptional programming skills, a positive work ethic, and worked collaboratively with team members. They were key in developing internal developer tool chains and portal screens.
          </p>

          <p>
            Their conduct was excellent, and we wish them the absolute best in all their future endeavors.
          </p>

          <div className="pt-8 space-y-1">
            <div className="font-bold text-foreground">Rajesh K. Mehta</div>
            <div className="text-[10px] text-muted-foreground">Head of HR Operations, PrevCorp Enterprises</div>
          </div>
        </div>
      );

    case "bank-cheque":
      return (
        <div className="max-w-md mx-auto border-2 border-dashed border-emerald-500/60 bg-emerald-500/5 p-6 rounded-xl shadow-lg relative overflow-hidden text-xs space-y-6 text-slate-800 dark:text-slate-200">
          <div className="flex justify-between border-b border-emerald-200 pb-3">
            <div>
              <h4 className="font-extrabold text-foreground tracking-wide leading-none">GLOBAL ENTERPRISE BANK</h4>
              <span className="text-[8px] text-muted-foreground mt-0.5 block font-mono">IFSC: GEB0000382</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">DATE: DD / MM / YYYY</span>
          </div>

          <div className="flex justify-between items-center text-base font-black border border-emerald-300 rounded p-4 text-center my-6 relative bg-white/50 dark:bg-black/30">
            <div className="text-rose-500/25 text-3xl font-extrabold absolute rotate-12 inset-x-0 tracking-widest text-center select-none pointer-events-none">
              CANCELLED
            </div>
            <div className="w-full text-center tracking-wider text-muted-foreground">
              A/C NO: 982930293023
            </div>
          </div>

          <div className="flex justify-between text-[9px] text-muted-foreground pt-4 border-t border-emerald-200 font-mono">
            <span>⑈ 9829382 ⑈ 982938293 ⑈ 003829 ⑈ 10</span>
            <span className="text-right italic">Signature Not Required</span>
          </div>
        </div>
      );

    case "offer-letter":
      return (
        <div className="max-w-lg mx-auto bg-card text-foreground border border-border p-8 rounded-xl shadow-lg space-y-6 text-xs leading-relaxed max-h-[60vh] overflow-y-auto">
          <div className="flex justify-between items-center pb-4 border-b-2 border-border">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-extrabold text-xs">
                ITLC
              </div>
              <h4 className="font-black text-foreground">ITLC TECHNOLOGIES</h4>
            </div>
            <span className="text-[10px] text-muted-foreground">Ref: ITLC/OFF/2026/082</span>
          </div>

          <div className="text-right text-muted-foreground text-[10px]">Date: May 15, 2026</div>

          <div className="space-y-1">
            <div className="font-bold text-foreground">Dear {profile.fullName},</div>
            <div className="text-[10px] text-muted-foreground">{profile.address}</div>
          </div>

          <div className="text-center font-bold text-foreground uppercase tracking-wider text-xs border-b border-border pb-1">
            Offer of Employment
          </div>

          <p>
            We are pleased to offer you employment with <strong>ITLC Technologies, Inc.</strong> in the position of <strong>{profile.designation}</strong>. Your employment is scheduled to commence on <strong>{profile.joiningDate}</strong>.
          </p>

          <p>
            Your gross annual compensation will be as detailed in the salary annexure attached to this offer. You will report directly to the manager, <strong>{profile.reportingManager}</strong>.
          </p>

          <p>
            This offer is contingent upon successful verification of your educational qualifications and professional references.
          </p>

          <div className="pt-8 flex justify-between items-center">
            <div className="space-y-1">
              <div className="font-bold text-foreground">Sheela Nair</div>
              <div className="text-[10px] text-muted-foreground">VP, HR Operations</div>
            </div>
            <div className="text-right p-2 border border-dashed border-emerald-500 bg-emerald-500/5 text-emerald-500 rounded text-[9px] font-bold">
              Digitally Accepted
            </div>
          </div>
        </div>
      );

    case "appointment-letter":
      return (
        <div className="max-w-lg mx-auto bg-card text-foreground border border-border p-8 rounded-xl shadow-lg space-y-6 text-xs leading-relaxed max-h-[60vh] overflow-y-auto">
          <div className="flex justify-between items-center pb-4 border-b-2 border-border">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-extrabold text-xs">
                ITLC
              </div>
              <h4 className="font-black text-foreground">ITLC TECHNOLOGIES</h4>
            </div>
            <span className="text-[10px] text-muted-foreground">Ref: ITLC/APT/2026/082</span>
          </div>

          <div className="text-right text-muted-foreground text-[10px]">Date: May 20, 2026</div>

          <div className="space-y-1">
            <div className="font-bold text-foreground">To, {profile.fullName},</div>
            <div className="text-[10px] text-muted-foreground">{profile.address}</div>
          </div>

          <div className="text-center font-bold text-foreground uppercase tracking-wider text-xs border-b border-border pb-1">
            Letter of Appointment
          </div>

          <p>
            Further to our offer letter dated May 15, 2026, we are pleased to issue this Letter of Appointment detailing the terms and conditions of your service:
          </p>

          <div className="space-y-1.5 pl-4 list-decimal text-[11px] leading-relaxed">
            <div>1. <strong>Probation:</strong> You will be on probation for a period of six (6) months from your date of joining.</div>
            <div>2. <strong>Working Hours:</strong> The standard office hours are 9:30 AM to 6:30 PM, Monday through Friday.</div>
            <div>3. <strong>Termination:</strong> Either party can terminate employment by giving thirty (30) days written notice.</div>
          </div>

          <p>
            Please sign and return the duplicate copy of this letter as token of your acceptance of these terms.
          </p>

          <div className="pt-8 flex justify-between items-center">
            <div className="space-y-1">
              <div className="font-bold text-foreground">Sheela Nair</div>
              <div className="text-[10px] text-muted-foreground">VP, HR Operations</div>
            </div>
            <div className="text-right p-2 border border-dashed border-emerald-500 bg-emerald-500/5 text-emerald-500 rounded text-[9px] font-bold">
              Digitally Signed
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="p-8 text-center text-muted-foreground">
          No preview template available.
        </div>
      );
  }
};
