"use client";

import React, { useState, useEffect, useRef } from "react";
import { useHRMS, EmployeeProfile } from "../context/HRMSContext";
import { api } from "../../../services/api";
import { Card, Button, Modal, Select } from "../UI";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building2,
  Briefcase,
  UserCheck,
  Award,
  Camera,
  KeyRound,
  Edit2,
  Lock,
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Printer,
  Image as ImageIcon,
  Search,
  CreditCard,
} from "lucide-react";
import { cn } from "../UI";

interface ProfileDoc {
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

const DEFAULT_DOCUMENTS: ProfileDoc[] = [
  {
    id: "profile-photo",
    name: "Profile Photo",
    type: "photo",
    status: "Uploaded",
    uploadedDate: "2026-06-01",
    fileType: "image/png",
    fileData: "DEFAULT_PHOTO",
    fileName: "profile_photo.png",
    canDelete: false,
    canReplace: true
  },
  {
    id: "aadhaar",
    name: "Aadhaar Card",
    type: "aadhaar",
    status: "Uploaded",
    uploadedDate: "2026-06-01",
    fileType: "image/jpeg",
    fileData: "DEFAULT_AADHAAR",
    fileName: "aadhaar_card.jpg",
    canDelete: false,
    canReplace: true
  },
  {
    id: "pan",
    name: "PAN Card",
    type: "pan",
    status: "Uploaded",
    uploadedDate: "2026-06-01",
    fileType: "image/jpeg",
    fileData: "DEFAULT_PAN",
    fileName: "pan_card.jpg",
    canDelete: false,
    canReplace: true
  },
  {
    id: "resume",
    name: "Resume / CV",
    type: "resume",
    status: "Uploaded",
    uploadedDate: "2026-06-05",
    fileType: "application/pdf",
    fileData: "DEFAULT_RESUME",
    fileName: "resume_cv.pdf",
    canDelete: true,
    canReplace: true
  },
  {
    id: "exp-letter",
    name: "Experience Letter",
    type: "exp-letter",
    status: "Not Uploaded",
    uploadedDate: "-",
    fileType: "-",
    fileData: null,
    fileName: null,
    canDelete: true,
    canReplace: true
  },
  {
    id: "bank-cheque",
    name: "Bank Passbook / Cancelled Cheque",
    type: "bank-cheque",
    status: "Uploaded",
    uploadedDate: "2026-06-02",
    fileType: "image/png",
    fileData: "DEFAULT_CHEQUE",
    fileName: "cancelled_cheque.png",
    canDelete: true,
    canReplace: true
  },
  {
    id: "offer-letter",
    name: "Offer Letter",
    type: "offer-letter",
    status: "Uploaded",
    uploadedDate: "2026-05-15",
    fileType: "application/pdf",
    fileData: "DEFAULT_OFFER",
    fileName: "offer_letter.pdf",
    canDelete: false,
    canReplace: false
  },
  {
    id: "appointment-letter",
    name: "Appointment Letter",
    type: "appointment-letter",
    status: "Uploaded",
    uploadedDate: "2026-05-20",
    fileType: "application/pdf",
    fileData: "DEFAULT_APPOINTMENT",
    fileName: "appointment_letter.pdf",
    canDelete: false,
    canReplace: false
  }
];

const compressImage = (base64Str: string, maxWidth = 800, maxHeight = 800): Promise<string> => {
  return new Promise((resolve) => {
    if (!base64Str.startsWith('data:image/')) {
      resolve(base64Str);
      return;
    }
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
};

export const MyProfile: React.FC = () => {
  const { profile, updateProfile, changePassword, documents, activeSubTab: globalSubTab, setActiveSubTab: setGlobalSubTab, addNotification } = useHRMS();

  // Navigation tab state (Secondary navigation inside profile view)
  const activeProfileTab = ["info-personal", "info-employment", "documents", "info-bank", "info-emergency"].includes(globalSubTab)
    ? (globalSubTab as "info-personal" | "info-employment" | "documents" | "info-bank" | "info-emergency")
    : "info-personal";

  const setActiveProfileTab = (tabId: string) => setGlobalSubTab(tabId);

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<ProfileDoc | null>(null);

  // Digital ID Badge state
  const [isIdBadgeOpen, setIsIdBadgeOpen] = useState(false);

  const [performanceReviews, setPerformanceReviews] = useState<any[]>([]);
  const [loadingPerformance, setLoadingPerformance] = useState(false);

  useEffect(() => {
    const loadPerformance = async () => {
      setLoadingPerformance(true);
      try {
        const data = await api.getEmployeePerformance();
        setPerformanceReviews(data || []);
      } catch (err) {
        console.error("Failed to load performance reviews:", err);
      } finally {
        setLoadingPerformance(false);
      }
    };
    loadPerformance();
  }, []);

  // Profile Edit fields
  const [editName, setEditName] = useState(profile.fullName);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editMobile, setEditMobile] = useState(profile.mobile);
  const [editAddress, setEditAddress] = useState(profile.address);
  const [editDob, setEditDob] = useState(profile.dob);
  const [editGender, setEditGender] = useState(profile.gender);

  // Password fields
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  // Bank Details State
  const [bankDetails, setBankDetails] = useState({
    bankName: "ITLC Silicon Bank, NA",
    accountNumber: "982930293023",
    ifscCode: "ISB000492",
    accountType: "Corporate Salary Account",
    branchLocation: "Silicon Valley Corporate Hub, CA",
    paymentMethod: "Direct Bank Wire (ACH)"
  });

  const [isBankEditOpen, setIsBankEditOpen] = useState(false);
  const [bankEditRequest, setBankEditRequest] = useState<{
    status: "Pending" | "Approved";
    requestedDetails: typeof bankDetails;
    reason: string;
    requestedDate: string;
  } | null>(null);

  // Bank Form fields
  const [editBankName, setEditBankName] = useState("");
  const [editBankAccountNumber, setEditBankAccountNumber] = useState("");
  const [editBankIfscCode, setEditBankIfscCode] = useState("");
  const [editBankAccountType, setEditBankAccountType] = useState("");
  const [editBankBranchLocation, setEditBankBranchLocation] = useState("");
  const [editBankPaymentMethod, setEditBankPaymentMethod] = useState("");
  const [bankReason, setBankReason] = useState("");

  // Load bank details and edit request on mount
  useEffect(() => {
    const savedDetails = localStorage.getItem("hrms_bank_details");
    if (savedDetails) {
      try {
        setBankDetails(JSON.parse(savedDetails));
      } catch (e) {}
    }
    const savedRequest = localStorage.getItem("hrms_bank_edit_request");
    if (savedRequest) {
      try {
        setBankEditRequest(JSON.parse(savedRequest));
      } catch (e) {}
    }
  }, []);

  // Simulated auto-approval for bank details edit requests
  useEffect(() => {
    if (bankEditRequest && bankEditRequest.status === "Pending") {
      const timer = setTimeout(() => {
        const approvedRequest = {
          ...bankEditRequest,
          status: "Approved" as const
        };
        setBankEditRequest(null);
        localStorage.removeItem("hrms_bank_edit_request");

        setBankDetails(approvedRequest.requestedDetails);
        localStorage.setItem("hrms_bank_details", JSON.stringify(approvedRequest.requestedDetails));

        if (addNotification) {
          addNotification({
            title: "Bank Details Approved",
            message: `Your request to update bank details to ${approvedRequest.requestedDetails.bankName} has been approved by HR.`,
            category: "payroll"
          });
        }
      }, 8000); // 8 seconds auto approval
      return () => clearTimeout(timer);
    }
  }, [bankEditRequest, addNotification]);

  const simulateApproval = () => {
    if (bankEditRequest && bankEditRequest.status === "Pending") {
      const approvedRequest = {
        ...bankEditRequest,
        status: "Approved" as const
      };
      setBankEditRequest(null);
      localStorage.removeItem("hrms_bank_edit_request");

      setBankDetails(approvedRequest.requestedDetails);
      localStorage.setItem("hrms_bank_details", JSON.stringify(approvedRequest.requestedDetails));

      if (addNotification) {
        addNotification({
          title: "Bank Details Approved (Demo)",
          message: `Your request to update bank details to ${approvedRequest.requestedDetails.bankName} was instantly approved via demo action.`,
          category: "payroll"
        });
      }
    }
  };

  // Documents state
  const [documentsVault, setDocumentsVault] = useState<ProfileDoc[]>([]);
  const [dragOverCardId, setDragOverCardId] = useState<string | null>(null);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docFileInputRef = useRef<HTMLInputElement>(null);
  const [activeDocUploadId, setActiveDocUploadId] = useState<string | null>(null);

  useEffect(() => {
    if (profile.documents && profile.documents.length > 0) {
      setDocumentsVault(profile.documents);
    } else {
      const saved = localStorage.getItem("hrms_profile_vault_docs");
      if (saved) {
        try {
          setDocumentsVault(JSON.parse(saved));
        } catch (e) {
          setDocumentsVault(DEFAULT_DOCUMENTS);
        }
      } else {
        setDocumentsVault(DEFAULT_DOCUMENTS);
      }
    }
  }, [profile.documents]);

  useEffect(() => {
    if (globalSubTab) {
      const el = document.getElementById(globalSubTab);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, [globalSubTab]);

  const saveDocs = (newDocs: ProfileDoc[]) => {
    setDocumentsVault(newDocs);
    localStorage.setItem("hrms_profile_vault_docs", JSON.stringify(newDocs));
    updateProfile({ documents: newDocs });
  };

  // Trigger file upload dialog for main avatar
  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  // Convert uploaded image to Base64 and update profile photo
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (typeof reader.result === "string") {
          const compressed = await compressImage(reader.result);
          updateProfile({ photo: compressed });
          
          // Also sync with the Documents list
          const updated = documentsVault.map((doc) => {
            if (doc.id === "profile-photo") {
              return {
                ...doc,
                status: "Uploaded" as const,
                uploadedDate: new Date().toISOString().split("T")[0],
                fileType: "image/jpeg",
                fileData: compressed,
                fileName: file.name,
              };
            }
            return doc;
          });
          saveDocs(updated);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Process Document Vault File Uploads
  const processUploadedFile = (docId: string, file: File) => {
    // Validate file type (Images or PDF)
    const isValidType = file.type.startsWith("image/") || file.type === "application/pdf" || file.name.endsWith(".pdf") || file.name.endsWith(".jpg") || file.name.endsWith(".jpeg") || file.name.endsWith(".png");
    if (!isValidType) {
      alert("Invalid file format. Please upload an image (PNG, JPEG, JPG) or PDF file.");
      return;
    }

    setUploadingDocId(docId);

    // Simulate loader state
    setTimeout(() => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (typeof reader.result === "string") {
          const compressed = await compressImage(reader.result);
          const todayStr = new Date().toISOString().split("T")[0];
          const updated = documentsVault.map((doc) => {
            if (doc.id === docId) {
              return {
                ...doc,
                status: "Uploaded" as const,
                uploadedDate: todayStr,
                fileType: file.type.startsWith("image/") ? "image/jpeg" : file.type || (file.name.endsWith(".pdf") ? "application/pdf" : "image/jpeg"),
                fileData: compressed,
                fileName: file.name,
              };
            }
            return doc;
          });
          saveDocs(updated);

          // If updating profile photo card, keep in sync with context profile photo
          if (docId === "profile-photo") {
            updateProfile({ photo: compressed });
          }
        }
        setUploadingDocId(null);
      };
      reader.readAsDataURL(file);
    }, 1000);
  };

  const handleDocFilePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeDocUploadId) {
      processUploadedFile(activeDocUploadId, file);
    }
    setActiveDocUploadId(null);
  };

  const triggerDocUploadPicker = (docId: string) => {
    setActiveDocUploadId(docId);
    // Short timeout to let state update before click
    setTimeout(() => {
      docFileInputRef.current?.click();
    }, 50);
  };

  const handleDeleteDoc = (docId: string) => {
    if (window.confirm("Are you sure you want to delete this document from your vault?")) {
      const updated = documentsVault.map((doc) => {
        if (doc.id === docId) {
          return {
            ...doc,
            status: "Not Uploaded" as const,
            uploadedDate: "-",
            fileType: "-",
            fileData: null,
            fileName: null,
          };
        }
        return doc;
      });
      saveDocs(updated);
    }
  };

  const handleDownload = (doc: ProfileDoc) => {
    // If it's a real base64 file uploaded
    if (doc.fileData && !doc.fileData.startsWith("DEFAULT_")) {
      const link = document.createElement("a");
      link.href = doc.fileData;
      link.download = doc.fileName || `${doc.name.toLowerCase().replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // If it is a default placeholder document, download a certificate validating the document in sandbox
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

  // Profile Edit Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName: editName,
      email: editEmail,
      mobile: editMobile,
      address: editAddress,
      dob: editDob,
      gender: editGender,
    });
    setIsEditOpen(false);
  };

  // Submit Bank Details Change Request
  const handleSaveBankRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const requested = {
      bankName: editBankName,
      accountNumber: editBankAccountNumber,
      ifscCode: editBankIfscCode,
      accountType: editBankAccountType,
      branchLocation: editBankBranchLocation,
      paymentMethod: editBankPaymentMethod
    };

    const newRequest = {
      status: "Pending" as const,
      requestedDetails: requested,
      reason: bankReason,
      requestedDate: new Date().toISOString().split("T")[0]
    };

    setBankEditRequest(newRequest);
    localStorage.setItem("hrms_bank_edit_request", JSON.stringify(newRequest));
    setIsBankEditOpen(false);

    if (addNotification) {
      addNotification({
        title: "Bank Update Request Submitted",
        message: `Your request to update payroll bank details has been submitted for HR approval.`,
        category: "payroll"
      });
    }
  };

  // Password Change Save
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    if (!oldPass || !newPass || !confirmPass) {
      setPassError("All password fields are required.");
      return;
    }

    if (newPass !== confirmPass) {
      setPassError("New password and confirm password do not match.");
      return;
    }

    if (newPass.length < 6) {
      setPassError("New password must be at least 6 characters long.");
      return;
    }

    setPassLoading(true);
    try {
      const success = await changePassword(oldPass, newPass);
      if (success) {
        setPassSuccess("Password updated successfully.");
        setOldPass("");
        setNewPass("");
        setConfirmPass("");
        setTimeout(() => setIsPasswordOpen(false), 1500);
      } else {
        setPassError("Invalid current password.");
      }
    } catch (err) {
      setPassError("An error occurred. Please try again.");
    } finally {
      setPassLoading(false);
    }
  };

  const downloadIdCard = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawAndSave = (imgObj?: HTMLImageElement) => {
      // 1. Draw Card Background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, 400, 600);

      // Border & Rounded corners simulated
      ctx.strokeStyle = "#4F46E5";
      ctx.lineWidth = 12;
      ctx.strokeRect(6, 6, 388, 588);

      // Gradient Top Bar
      const grad = ctx.createLinearGradient(0, 0, 400, 0);
      grad.addColorStop(0, "#4F46E5");
      grad.addColorStop(1, "#06B6D4");
      ctx.fillStyle = grad;
      ctx.fillRect(12, 12, 376, 130);

      // 2. Draw Company Title
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 22px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("ITLC TECHNOLOGIES", 200, 65);

      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText("ENTERPRISE SAAS PORTAL", 200, 92);

      // 3. Draw Profile Avatar Circle
      const avatarX = 200;
      const avatarY = 240;
      const avatarRadius = 65;

      // Draw circular clipping path for photo or fallback initials
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      if (imgObj) {
        ctx.drawImage(imgObj, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
      } else {
        // Draw initials fallback
        ctx.fillStyle = "#F1F5F9";
        ctx.fillRect(avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
        
        ctx.fillStyle = "#4F46E5";
        ctx.font = "bold 44px sans-serif";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        const initials = profile.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase();
        ctx.fillText(initials, avatarX, avatarY);
      }
      ctx.restore();

      // Draw avatar border
      ctx.strokeStyle = "#4F46E5";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
      ctx.stroke();

      // 4. Draw Employee Details
      ctx.fillStyle = "#0F172A";
      ctx.font = "bold 24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(profile.fullName, 200, 365);

      ctx.fillStyle = "#4F46E5";
      ctx.font = "bold 15px sans-serif";
      ctx.fillText(profile.designation || "EMPLOYEE", 200, 395);

      ctx.fillStyle = "#64748B";
      ctx.font = "13px sans-serif";
      ctx.fillText(profile.department || "Operations", 200, 420);

      // 5. Draw Barcode & ID Number
      const barcodeY = 475;
      const barcodeHeight = 35;
      ctx.fillStyle = "#0F172A";
      // Draw simulated barcode lines
      const linePattern = [4,2,8,2,4,6,2,8,4,2,6,4,8,2,4,6,2,8,4];
      let currentX = 110;
      for (let i = 0; i < linePattern.length; i++) {
        const width = linePattern[i];
        if (i % 2 === 0) {
          ctx.fillRect(currentX, barcodeY, width, barcodeHeight);
        }
        currentX += width + 2;
      }

      // Draw ID text under barcode
      ctx.fillStyle = "#0F172A";
      ctx.font = "bold 14px monospace";
      ctx.fillText(`ID: ${profile.id}`, 200, 545);

      // 6. Trigger Download
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `id_card_${profile.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    if (profile.photo) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => drawAndSave(img);
      img.onerror = () => drawAndSave();
      img.src = profile.photo;
    } else {
      drawAndSave();
    }
  };

  const profileGridItems = [
    { label: "Employee ID", value: profile.id, icon: UserCheck, category: "Employment" },
    { label: "Department", value: profile.department, icon: Building2, category: "Employment" },
    { label: "Designation", value: profile.designation, icon: Briefcase, category: "Employment" },
    { label: "Employment Type", value: profile.employmentType, icon: Briefcase, category: "Employment" },
    { label: "Joining Date", value: profile.joiningDate, icon: Calendar, category: "Employment" },
    { label: "Reporting Manager", value: profile.reportingManager, icon: User, category: "Employment" },
    
    { label: "Full Name", value: profile.fullName, icon: User, category: "Personal" },
    { label: "Email Address", value: profile.email, icon: Mail, category: "Personal" },
    { label: "Mobile Number", value: profile.mobile, icon: Phone, category: "Personal" },
    { label: "Date of Birth", value: profile.dob, icon: Calendar, category: "Personal" },
    { label: "Gender", value: profile.gender, icon: User, category: "Personal" },
    { label: "Residential Address", value: profile.address, icon: MapPin, category: "Personal" },
  ];

  return (
    <div className="space-y-6">
      
      {/* Profile Header Card */}
      <Card className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center border border-border">
        {/* Photo Container */}
        <div className="relative group shrink-0">
          <div className="h-28 w-28 rounded-full overflow-hidden border-2 border-primary/20 bg-secondary flex items-center justify-center relative">
            {profile.photo ? (
              <img src={profile.photo} alt={profile.fullName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-3xl font-extrabold text-primary">
                {profile.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            )}
          </div>
          {/* Overlay to trigger upload */}
          <button
            onClick={triggerImageUpload}
            className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer duration-200"
            title="Upload Photo"
          >
            <Camera className="h-6 w-6 text-white" />
          </button>
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Text and Primary Actions */}
        <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start gap-2.5">
          <h2 className="text-2xl font-extrabold text-foreground">{profile.fullName}</h2>
          <p className="text-xs font-mono font-bold text-muted-foreground">
            Employee ID: {profile.id}
          </p>
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25 shadow-sm transition-all duration-300 hover:bg-indigo-500/20 hover:scale-105 select-none cursor-default font-sans">
            {profile.designation}
          </div>
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
            {profile.department}
          </span>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
            <Button
              variant="outline"
              size="sm"
              icon={<Edit2 className="h-3.5 w-3.5" />}
              onClick={() => {
                setEditName(profile.fullName);
                setEditEmail(profile.email);
                setEditMobile(profile.mobile);
                setEditAddress(profile.address);
                setEditDob(profile.dob);
                setEditGender(profile.gender);
                setIsEditOpen(true);
              }}
              className="text-xs"
            >
              Edit Profile
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<KeyRound className="h-3.5 w-3.5" />}
              onClick={() => setIsPasswordOpen(true)}
              className="text-xs"
            >
              Change Password
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={<UserCheck className="h-3.5 w-3.5" />}
              onClick={() => setIsIdBadgeOpen(true)}
              className="text-xs"
            >
              Digital ID Card
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs navigation */}
      <div className="flex bg-card p-1 rounded-xl border border-border overflow-x-auto space-x-1 shrink-0 scrollbar-none print:hidden">
        {[
          { id: "info-personal", label: "Personal Info", icon: User },
          { id: "info-employment", label: "Employment Details", icon: Briefcase },
          { id: "documents", label: "Documents Vault", icon: FileText },
          { id: "info-bank", label: "Bank Details", icon: CreditCard },
          { id: "performance-reviews", label: "Performance & Appraisals", icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = globalSubTab === tab.id || (tab.id === "info-personal" && (!globalSubTab || globalSubTab === "profile" || globalSubTab === "info-emergency"));
          return (
            <button
              key={tab.id}
              onClick={() => {
                setGlobalSubTab(tab.id);
                const el = document.getElementById(tab.id);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
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

      {/* RENDER PROFILE PERSONAL INFO */}
      <Card id="info-personal" className="scroll-mt-20 space-y-4 bg-card">
        <h3 className="text-sm font-bold text-foreground pb-2 border-b border-border flex items-center gap-2">
          <User className="h-4.5 w-4.5 text-primary" /> Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-2">
          {profileGridItems
            .filter((item) => item.category === "Personal")
            .map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
                    <Icon className="h-3 w-3" /> {item.label}
                  </span>
                  <p className="text-xs font-semibold text-foreground">
                    {item.label === "Email Address" ? (
                      <a href={`mailto:${item.value}`} className="hover:underline text-indigo-600 dark:text-indigo-400">{item.value}</a>
                    ) : item.label === "Mobile Number" ? (
                      <a href={`tel:${item.value}`} className="hover:underline text-indigo-600 dark:text-indigo-400 font-mono">{item.value}</a>
                    ) : (
                      item.value
                    )}
                  </p>
                </div>
              );
            })}

          {/* Embedded Emergency Contacts */}
          <div className="col-span-1 sm:col-span-2 pt-4 mt-2 border-t border-border/60 space-y-4">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-primary" /> Emergency Contacts
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 border border-border rounded-xl bg-secondary/15 space-y-1">
                <span className="text-[9px] text-muted-foreground uppercase font-bold">Primary Contact</span>
                <p className="text-xs font-bold text-foreground">Jane Wright (Spouse)</p>
                <p className="text-[11px] font-bold text-primary font-mono mt-0.5">
                  <a href="tel:+15553829029" className="hover:underline text-indigo-600 dark:text-indigo-400">+1 (555) 382-9029</a>
                </p>
              </div>
              <div className="p-3 border border-border rounded-xl bg-secondary/15 space-y-1">
                <span className="text-[9px] text-muted-foreground uppercase font-bold">Secondary Contact</span>
                <p className="text-xs font-bold text-foreground">Robert Wright (Father)</p>
                <p className="text-[11px] font-bold text-primary font-mono mt-0.5">
                  <a href="tel:+15554920210" className="hover:underline text-indigo-600 dark:text-indigo-400">+1 (555) 492-0210</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* RENDER PROFILE EMPLOYMENT INFO */}
      <Card id="info-employment" className="scroll-mt-20 space-y-4 bg-card">
        <h3 className="text-sm font-bold text-foreground pb-2 border-b border-border flex items-center gap-2">
          <Briefcase className="h-4.5 w-4.5 text-primary" /> Employment Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-2">
          {profileGridItems
            .filter((item) => item.category === "Employment")
            .map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
                    <Icon className="h-3 w-3" /> {item.label}
                  </span>
                  <p className="text-xs font-semibold text-foreground">{item.value}</p>
                </div>
              );
            })}
        </div>
      </Card>

      {/* RENDER DOCUMENTS TAB */}
      <div id="documents" className="scroll-mt-20 space-y-6">
        
        {/* Hidden doc picker input */}
        <input
          type="file"
          ref={docFileInputRef}
          onChange={handleDocFilePickerChange}
          accept="image/*,application/pdf"
          className="hidden"
        />

        <div className="space-y-3">
          <div className="pb-1 border-b border-border flex justify-between items-center">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-primary" /> Document Verification Center
            </h3>
          </div>
          {documentsVault.map((doc) => {
            const isDragActive = dragOverCardId === doc.id;
            const isUploading = uploadingDocId === doc.id;
            const isExpanded = expandedDocId === doc.id;

            return (
              <div
                key={doc.id}
                className={cn(
                  "border border-border rounded-xl overflow-hidden bg-card transition-all duration-200",
                  isExpanded ? "ring-1 ring-primary shadow-md border-primary/30" : "hover:border-primary/20 hover:shadow-xs",
                  isUploading && "opacity-75 pointer-events-none"
                )}
              >
                {/* Google Drive styled Row Header */}
                <div
                  onClick={() => setExpandedDocId(isExpanded ? null : doc.id)}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 cursor-pointer select-none transition-colors",
                    isExpanded ? "bg-secondary/25" : "hover:bg-secondary/15",
                    isDragActive && "bg-primary/5 border-2 border-dashed border-primary"
                  )}
                >
                  {/* Col 1: Doc Type Icon & Name */}
                  <div className="flex items-center gap-3 min-w-0 sm:w-2/5">
                    <div className={cn(
                      "p-2 rounded-lg border shrink-0",
                      doc.status === "Uploaded"
                        ? (doc.fileType.startsWith("image/") ? "bg-primary/10 text-primary border-primary/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20")
                        : "bg-secondary text-muted-foreground border-border"
                    )}>
                      {doc.status === "Uploaded" && doc.fileType.startsWith("image/") ? (
                        <ImageIcon className="h-4 w-4 shrink-0" />
                      ) : (
                        <FileText className="h-4 w-4 shrink-0" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-foreground block truncate">{doc.name}</span>
                      {doc.status === "Uploaded" && doc.fileName && (
                        <span className="text-[10px] text-muted-foreground truncate block max-w-xs mt-0.5">
                          {doc.fileName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Col 2: Upload Status */}
                  <div className="flex items-center sm:w-1/5 shrink-0">
                    <span className={cn(
                      "text-[9px] px-2 py-0.5 font-bold rounded-full border tracking-wide uppercase",
                      doc.status === "Uploaded"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    )}>
                      {doc.status === "Uploaded" ? "Uploaded" : "Pending"}
                    </span>
                  </div>

                  {/* Col 3: Upload Date */}
                  <div className="text-[10px] text-muted-foreground sm:w-1/5 shrink-0">
                    {doc.status === "Uploaded" ? `Uploaded: ${doc.uploadedDate}` : "No Date Available"}
                  </div>

                  {/* Col 4: Quick Actions & Toggle Chevron */}
                  <div className="flex items-center gap-1.5 sm:w-1/5 sm:justify-end shrink-0" onClick={(e) => e.stopPropagation()}>
                    {doc.status === "Uploaded" ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewDoc(doc)}
                          icon={<Eye className="h-3.5 w-3.5" />}
                          className="text-[10px] h-7 px-2 shrink-0 hidden md:inline-flex"
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(doc)}
                          icon={<Download className="h-3.5 w-3.5" />}
                          className="text-[10px] h-7 px-2 shrink-0 hidden md:inline-flex"
                        >
                          Download
                        </Button>
                      </>
                    ) : (
                      doc.canReplace && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => triggerDocUploadPicker(doc.id)}
                          icon={<Upload className="h-3.5 w-3.5" />}
                          className="text-[10px] h-7 px-2.5 shrink-0"
                        >
                          Upload
                        </Button>
                      )
                    )}

                    <button
                      onClick={() => setExpandedDocId(isExpanded ? null : doc.id)}
                      className="p-1 rounded-lg hover:bg-secondary text-muted-foreground ml-auto sm:ml-0 transition-colors cursor-pointer shrink-0"
                    >
                      <svg
                        className={cn("h-4 w-4 transition-transform duration-200", isExpanded && "rotate-180")}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Accordion Expandable Area */}
                {isExpanded && (
                  <div className="p-5 bg-secondary/10 border-t border-border space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                      {/* Drag and Drop Zone / Restrictions box */}
                      <div>
                        {doc.canReplace ? (
                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              setDragOverCardId(doc.id);
                            }}
                            onDragLeave={() => setDragOverCardId(null)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setDragOverCardId(null);
                              const file = e.dataTransfer.files?.[0];
                              if (file) {
                                processUploadedFile(doc.id, file);
                              }
                            }}
                            onClick={() => triggerDocUploadPicker(doc.id)}
                            className={cn(
                              "border-2 border-dashed border-border hover:border-primary/50 hover:bg-secondary/35 p-6 rounded-xl text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 min-h-[140px]",
                              isDragActive && "border-primary bg-primary/5"
                            )}
                          >
                            <Upload className="h-6 w-6 text-muted-foreground" />
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-primary block">
                                {doc.status === "Uploaded" ? "Drag & Drop to Replace" : "Drag & Drop to Upload"}
                              </span>
                              <span className="text-[10px] text-muted-foreground block">
                                Supports PDF or Images (PNG, JPG, JPEG) up to 5MB
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-card border border-border p-4 rounded-xl text-xs space-y-1.5 text-muted-foreground">
                            <div className="flex items-center gap-1.5 text-foreground font-bold text-[11px] mb-1">
                              <AlertCircle className="h-4.5 w-4.5 text-primary" /> Company Issued Record
                            </div>
                            <p>This document is issued by the ITLC HR Operations department.</p>
                            <p>Employees cannot edit, replace, or delete company-issued contracts.</p>
                          </div>
                        )}
                      </div>

                      {/* File Details & Core Actions */}
                      <div className="space-y-4 text-xs">
                        <div className="bg-card border border-border rounded-xl p-4 space-y-2">
                          <h5 className="font-bold text-foreground border-b border-border pb-1">Vault Metadata</h5>
                          <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-[10px]">
                            <div>
                              <span className="text-muted-foreground block uppercase font-bold tracking-wider">File Name</span>
                              <span className="font-semibold text-foreground truncate block">{doc.fileName || "No file uploaded"}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block uppercase font-bold tracking-wider">Format</span>
                              <span className="font-semibold text-foreground block">{doc.status === "Uploaded" ? doc.fileType.toUpperCase() : "N/A"}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block uppercase font-bold tracking-wider">Verification Date</span>
                              <span className="font-semibold text-foreground block">{doc.uploadedDate}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block uppercase font-bold tracking-wider">HR Audit Status</span>
                              <span className="font-semibold text-foreground block">
                                {doc.status === "Uploaded" ? "Verified & Locked" : "Awaiting Upload"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Full Action row */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {doc.status === "Uploaded" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPreviewDoc(doc)}
                                icon={<Eye className="h-3.5 w-3.5" />}
                                className="text-xs h-8 px-3"
                              >
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(doc)}
                                icon={<Download className="h-3.5 w-3.5" />}
                                className="text-xs h-8 px-3"
                              >
                                Download
                              </Button>
                            </>
                          )}

                          {doc.canReplace && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => triggerDocUploadPicker(doc.id)}
                              icon={<RefreshCw className="h-3.5 w-3.5" />}
                              className="text-xs h-8 px-3"
                            >
                              Replace
                            </Button>
                          )}

                          {doc.status === "Uploaded" && doc.canDelete && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteDoc(doc.id)}
                              icon={<Trash2 className="h-3.5 w-3.5" />}
                              className="text-xs h-8 px-3 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 border-rose-500/25 ml-auto"
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        </div>

      {/* RENDER PROFILE BANK INFO */}
      <Card id="info-bank" className="scroll-mt-20 space-y-4 bg-card">
        <div className="pb-2 border-b border-border flex justify-between items-center">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <CreditCard className="h-4.5 w-4.5 text-primary" /> Bank Details
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditBankName(bankDetails.bankName);
              setEditBankAccountNumber(bankDetails.accountNumber);
              setEditBankIfscCode(bankDetails.ifscCode);
              setEditBankAccountType(bankDetails.accountType);
              setEditBankBranchLocation(bankDetails.branchLocation);
              setEditBankPaymentMethod(bankDetails.paymentMethod);
              setBankReason("");
              setIsBankEditOpen(true);
            }}
            disabled={bankEditRequest?.status === "Pending"}
            icon={<Edit2 className="h-3 w-3" />}
            className="text-[10px] h-7 px-2.5 font-bold"
          >
            {bankEditRequest?.status === "Pending" ? "Pending Approval" : "Request Edit"}
          </Button>
        </div>

        {bankEditRequest?.status === "Pending" && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row gap-3 text-xs text-amber-500 mb-4 sm:items-center">
            <div className="flex gap-2 items-center flex-1">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <div>
                <span className="font-bold">Update Request Pending:</span> Changes to your bank information are awaiting HR approval (Submitted {bankEditRequest.requestedDate}).
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-[9px] h-6 border-amber-500/25 hover:bg-amber-500/10 text-amber-500 self-end sm:self-center font-bold px-2 py-0"
              onClick={simulateApproval}
            >
              Auto Approve (Demo)
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-2">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold">Bank Name</span>
            <p className="text-xs font-semibold text-foreground">{bankDetails.bankName}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold">Account Number</span>
            <p className="text-xs font-semibold text-foreground">
              {bankDetails.accountNumber.startsWith("****") 
                ? bankDetails.accountNumber 
                : "**** **** **** " + bankDetails.accountNumber.slice(-4)}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold">IFSC / Routing Code</span>
            <p className="text-xs font-semibold text-foreground font-mono">{bankDetails.ifscCode}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold">Account Type</span>
            <p className="text-xs font-semibold text-foreground">{bankDetails.accountType}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold">Branch Location</span>
            <p className="text-xs font-semibold text-foreground">{bankDetails.branchLocation}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold">Payment Method</span>
            <p className="text-xs font-semibold text-foreground">{bankDetails.paymentMethod}</p>
          </div>
        </div>

        {/* Delete lock warning */}
        <div className="pt-2 text-[9px] text-muted-foreground italic border-t border-border/40">
          * Payroll Compliance Lock: Bank details are verified and cannot be deleted or cleared. Please use the change request form to update account information.
        </div>
      </Card>

      {/* PERFORMANCE REVIEWS SECTION */}
      <Card id="performance-reviews" className="scroll-mt-20 space-y-4 bg-card">
        <h3 className="text-sm font-bold text-foreground pb-2 border-b border-border flex items-center gap-2">
          <Award className="h-4.5 w-4.5 text-primary" /> Performance Appraisals & Goals
        </h3>
        {loadingPerformance ? (
          <div className="text-xs text-muted-foreground p-4 text-center">Loading performance reviews...</div>
        ) : performanceReviews.length === 0 ? (
          <div className="text-xs text-muted-foreground p-4 text-center">No performance appraisals recorded by manager yet.</div>
        ) : (
          <div className="space-y-4">
            {performanceReviews.map((rev: any, idx: number) => {
              return (
                <div key={rev.id || idx} className="p-4 border border-border rounded-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{rev.reviewPeriod} Review Cycle</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Manager ID: {rev.managerId}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1 rounded-lg">
                      <span className="text-xs font-black">{rev.rating} / 5.0</span>
                    </div>
                  </div>

                  {rev.appreciation && (
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block uppercase">Appreciation & Achievements</span>
                      <p className="text-xs text-foreground mt-1">{rev.appreciation}</p>
                    </div>
                  )}

                  {rev.warning && (
                    <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-lg">
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block uppercase">Area of Improvement / Notes</span>
                      <p className="text-xs text-foreground mt-1">{rev.warning}</p>
                    </div>
                  )}

                  {rev.promotionRecommendation && (
                    <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block uppercase">Promotion Recommendation</span>
                      <p className="text-xs text-foreground mt-1">{rev.promotionRecommendation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Edit Bank Details Request Modal */}
      <Modal isOpen={isBankEditOpen} onClose={() => setIsBankEditOpen(false)} title="Request Bank Details Update">
        <form onSubmit={handleSaveBankRequest} className="space-y-4">
          <div className="p-3 rounded-lg bg-secondary/25 border border-border text-xs text-muted-foreground">
            ⚠️ <strong>Payroll Lock notice:</strong> All bank account changes require HR verification. Once submitted, your request will be reviewed and updated upon approval.
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Bank Name</label>
              <input
                type="text"
                value={editBankName}
                onChange={(e) => setEditBankName(e.target.value)}
                required
                className="px-3 py-2 text-xs md:text-sm rounded-lg border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Account Number</label>
              <input
                type="text"
                value={editBankAccountNumber}
                onChange={(e) => setEditBankAccountNumber(e.target.value)}
                required
                className="px-3 py-2 text-xs md:text-sm rounded-lg border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">IFSC / Routing Code</label>
              <input
                type="text"
                value={editBankIfscCode}
                onChange={(e) => setEditBankIfscCode(e.target.value)}
                required
                className="px-3 py-2 text-xs md:text-sm rounded-lg border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Account Type</label>
              <input
                type="text"
                value={editBankAccountType}
                onChange={(e) => setEditBankAccountType(e.target.value)}
                required
                className="px-3 py-2 text-xs md:text-sm rounded-lg border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Branch Location</label>
              <input
                type="text"
                value={editBankBranchLocation}
                onChange={(e) => setEditBankBranchLocation(e.target.value)}
                required
                className="px-3 py-2 text-xs md:text-sm rounded-lg border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Payment Method</label>
              <Select
                value={editBankPaymentMethod}
                onChange={(val) => setEditBankPaymentMethod(val)}
                options={[
                  { value: "Direct Bank Wire (ACH)", label: "Direct Bank Wire (ACH)" },
                  { value: "Check", label: "Check" },
                  { value: "Cash", label: "Cash / Direct Deposit" },
                ]}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Reason for Change</label>
            <textarea
              value={bankReason}
              onChange={(e) => setBankReason(e.target.value)}
              required
              rows={2}
              placeholder="e.g. Switched payroll banks, correcting account type, etc."
              className="px-3 py-2 text-xs md:text-sm rounded-lg border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border mt-6">
            <Button type="button" variant="outline" onClick={() => setIsBankEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Submit Edit Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Profile Details">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Full Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="px-3 py-2 text-xs md:text-sm rounded-lg border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Email Address</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
                className="px-3 py-2 text-xs md:text-sm rounded-lg border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Mobile Number</label>
              <input
                type="text"
                value={editMobile}
                onChange={(e) => setEditMobile(e.target.value)}
                required
                className="px-3 py-2 text-xs md:text-sm rounded-lg border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Date of Birth</label>
              <input
                type="date"
                value={editDob}
                onChange={(e) => setEditDob(e.target.value)}
                required
                className="px-3 py-2 text-xs md:text-sm rounded-lg border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Gender</label>
            <Select
              value={editGender}
              onChange={(val) => setEditGender(val)}
              options={[
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
                { value: "Other", label: "Other" },
              ]}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Residential Address</label>
            <textarea
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
              required
              rows={3}
              className="px-3 py-2 text-xs md:text-sm rounded-lg border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border mt-6">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={isPasswordOpen} onClose={() => setIsPasswordOpen(false)} title="Change Account Password">
        <form onSubmit={handleSavePassword} className="space-y-4">
          
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
              <input
                type="password"
                value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
                placeholder="Enter current password"
                className="w-full pl-10 pr-4 py-2 text-xs md:text-sm rounded-lg border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-4 py-2 text-xs md:text-sm rounded-lg border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
              <input
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Repeat new password"
                className="w-full pl-10 pr-4 py-2 text-xs md:text-sm rounded-lg border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {passError && (
            <p className="text-xs font-semibold text-rose-500 flex items-center gap-1.5 bg-rose-500/10 p-2 rounded-lg border border-rose-500/10">
              {passError}
            </p>
          )}

          {passSuccess && (
            <p className="text-xs font-semibold text-emerald-500 flex items-center gap-1.5 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/10">
              {passSuccess}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-border mt-6">
            <Button type="button" variant="outline" onClick={() => setIsPasswordOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={passLoading}>
              Update Password
            </Button>
          </div>
        </form>
      </Modal>

      {/* Document Vault Detail Preview Modal (Image Preview & Custom PDF Renderers) */}
      <Modal
        isOpen={previewDoc !== null}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc ? `${previewDoc.name} - Viewer` : "Document Preview"}
        size={previewDoc?.type === "aadhaar" || previewDoc?.type === "pan" || previewDoc?.type === "bank-cheque" ? "md" : "lg"}
      >
        {previewDoc && (
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="flex justify-end gap-2 pb-2 border-b border-border print:hidden">
              <Button
                variant="outline"
                size="sm"
                icon={<Printer className="h-4 w-4" />}
                onClick={() => window.print()}
              >
                Print Document
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<Download className="h-4 w-4" />}
                onClick={() => handleDownload(previewDoc)}
              >
                Download File
              </Button>
            </div>

            {/* Custom High-Fidelity Previews */}
            <div className="bg-card text-foreground rounded-xl overflow-hidden print:p-0">
              <DocumentPreviewer doc={previewDoc} profile={profile} />
            </div>
          </div>
        )}
      </Modal>



      {/* 2. Digital ID Card Modal */}
      <Modal
        isOpen={isIdBadgeOpen}
        onClose={() => setIsIdBadgeOpen(false)}
        title="Corporate ID Badge"
        size="sm"
      >
        <div className="space-y-6">
          <div className="flex justify-end gap-2 pb-2 border-b border-border print:hidden">
            <Button variant="outline" size="sm" icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>
              Print ID
            </Button>
            <Button variant="primary" size="sm" icon={<Download className="h-4 w-4" />} onClick={downloadIdCard}>
              Download Card
            </Button>
          </div>

          {/* Corporate ID Badge Visual */}
          <div className="flex justify-center py-4 bg-secondary/5 border border-border rounded-xl">
            <div className="w-64 border border-border rounded-2xl overflow-hidden bg-card text-foreground shadow-xl flex flex-col items-center p-6 space-y-4">
              <div className="text-center">
                <div className="font-extrabold text-xs tracking-widest text-primary">ITLC TECHNOLOGIES</div>
                <span className="text-[8px] text-muted-foreground tracking-wider block mt-0.5">Enterprise SaaS Portal</span>
              </div>

              {/* Photo */}
              <div className="h-24 w-24 rounded-full overflow-hidden border border-border bg-secondary flex items-center justify-center relative">
                {profile.photo ? (
                  <img src={profile.photo} alt={profile.fullName} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-extrabold text-primary">
                    {profile.fullName.split(" ").map((n) => n[0]).join("")}
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="text-center space-y-0.5">
                <h3 className="text-sm font-extrabold text-foreground">{profile.fullName}</h3>
                <p className="text-[10px] text-primary font-semibold">{profile.designation}</p>
                <p className="text-[9px] text-muted-foreground">{profile.department}</p>
              </div>

              {/* Barcode */}
              <div className="w-full pt-4 border-t border-border flex flex-col items-center space-y-1">
                <div className="h-8 w-44 bg-foreground flex items-center justify-between px-2 text-background font-mono text-[8px] tracking-wide select-none">
                  ||| | |||| | || ||||| | |||
                </div>
                <span className="text-[9px] font-bold font-mono text-foreground mt-1">ID: {profile.id}</span>
              </div>
            </div>
          </div>
        </div>
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
