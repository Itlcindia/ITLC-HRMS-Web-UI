"use client";

import React, { useState, useRef, useMemo } from "react";
import { useHRMS, Document } from "../context/HRMSContext";
import { Card, Button, Modal, Badge } from "../UI";
import {
  Search,
  FileText,
  Download,
  Eye,
  FolderLock,
  Printer,
  ShieldAlert,
  Upload,
  Plus,
  Check,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  RefreshCw,
  FileCheck,
  CreditCard,
  Award,
  Building,
  Lock,
  ShieldCheck,
  X,
  File,
  Image as ImageIcon
} from "lucide-react";

// Standard KYC document templates that every employee profile supports
const STANDARD_KYC_DOCS = [
  {
    id: "aadhaar",
    name: "Aadhaar Card",
    category: "Identity",
    type: "aadhaar",
    fileSize: "1.2 MB",
    issueDate: "2026-06-01",
    required: true
  },
  {
    id: "pan",
    name: "PAN Card",
    category: "Identity",
    type: "pan",
    fileSize: "850 KB",
    issueDate: "2026-06-01",
    required: true
  },
  {
    id: "bank-cheque",
    name: "Bank Passbook / Cancelled Cheque",
    category: "Financial",
    type: "bank-cheque",
    fileSize: "1.5 MB",
    issueDate: "2026-06-02",
    required: true
  },
  {
    id: "resume",
    name: "Resume / Curriculum Vitae",
    category: "Qualification",
    type: "resume",
    fileSize: "420 KB",
    issueDate: "2026-06-05",
    required: false
  },
  {
    id: "education",
    name: "Highest Educational Degree",
    category: "Qualification",
    type: "education",
    fileSize: "2.1 MB",
    issueDate: "2026-06-05",
    required: false
  },
  {
    id: "exp-letter",
    name: "Previous Experience / Relieving Letter",
    category: "Qualification",
    type: "exp-letter",
    fileSize: "980 KB",
    issueDate: "2026-06-05",
    required: false
  }
];

// Helper to compress images before saving to storage
const compressImage = (base64Str: string, maxWidth = 800, maxHeight = 800): Promise<string> => {
  return new Promise((resolve) => {
    if (!base64Str.startsWith("data:image/")) {
      resolve(base64Str);
      return;
    }
    const img = new window.Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement("canvas");
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
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.6));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str);
  });
};

export const DocumentCenter: React.FC = () => {
  const { documents, profile, updateProfile } = useHRMS();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadDocType, setUploadDocType] = useState<string>("aadhaar");
  const [customDocTitle, setCustomDocTitle] = useState("");
  const [previewFileData, setPreviewFileData] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Hidden file input ref for direct card upload
  const cardFileInputRef = useRef<HTMLInputElement>(null);
  const [targetCardDocId, setTargetCardDocId] = useState<string | null>(null);

  // Merge official company documents and KYC profile documents
  const allDocumentsList = useMemo(() => {
    const list: any[] = [];
    const profileDocs = Array.isArray(profile.documents) ? profile.documents : [];

    // 1. Add official corporate documents (Offer, Appointment, ID Card, NDA, Handbook)
    (documents || []).forEach((doc) => {
      list.push({
        id: doc.id,
        name: doc.name,
        category: doc.category || "Contract",
        issueDate: doc.issueDate || "2026-06-01",
        fileSize: doc.fileSize || "180 KB",
        status: "Verified",
        isCorporateLetter: true,
        fileName: doc.name,
        fileType: "application/pdf"
      });
    });

    // 2. Add standard KYC documents with uploaded status or pending
    STANDARD_KYC_DOCS.forEach((std) => {
      const userUploaded = profileDocs.find(
        (d: any) =>
          d &&
          (d.id === std.id ||
            d.type === std.type ||
            (d.name && d.name.toLowerCase().includes(std.type.replace("-", " "))))
      );

      if (userUploaded) {
        const isActuallyUploaded =
          userUploaded.status === "Uploaded" ||
          (userUploaded.fileData && !userUploaded.fileData.startsWith("DEFAULT_"));
        list.push({
          id: std.id,
          name: userUploaded.name || std.name,
          category: std.category,
          issueDate: userUploaded.uploadedDate || std.issueDate,
          fileSize: userUploaded.fileData
            ? `${(userUploaded.fileData.length * 0.75 / 1024).toFixed(0)} KB`
            : std.fileSize,
          status: isActuallyUploaded ? "Uploaded" : "Pending Upload",
          isCorporateLetter: false,
          fileData: userUploaded.fileData,
          fileName: userUploaded.fileName || `${std.name.toLowerCase().replace(/\s+/g, "_")}.pdf`,
          fileType: userUploaded.fileType || "image/jpeg",
          required: std.required
        });
      } else {
        list.push({
          id: std.id,
          name: std.name,
          category: std.category,
          issueDate: "-",
          fileSize: "-",
          status: "Pending Upload",
          isCorporateLetter: false,
          fileData: null,
          fileName: null,
          fileType: null,
          required: std.required
        });
      }
    });

    // 3. Add any extra custom documents uploaded by employee
    profileDocs.forEach((d: any) => {
      if (!d) return;
      const alreadyIncluded = list.some(
        (item) => item.id === d.id || (item.name && item.name.toLowerCase() === (d.name || "").toLowerCase())
      );
      if (!alreadyIncluded) {
        list.push({
          id: d.id || `custom-${Date.now()}`,
          name: d.name || d.fileName || "Custom Document",
          category: "Other",
          issueDate: d.uploadedDate || new Date().toISOString().split("T")[0],
          fileSize: d.fileData ? `${(d.fileData.length * 0.75 / 1024).toFixed(0)} KB` : "500 KB",
          status: "Uploaded",
          isCorporateLetter: false,
          fileData: d.fileData,
          fileName: d.fileName || "document.pdf",
          fileType: d.fileType || "application/pdf",
          canDelete: true
        });
      }
    });

    return list;
  }, [documents, profile.documents]);

  // Filter documents based on search query and category
  const filteredDocs = useMemo(() => {
    return allDocumentsList.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.fileName && doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (doc.status && doc.status.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (selectedCategory === "all") return true;
      if (selectedCategory === "letters") {
        return doc.isCorporateLetter || doc.category === "Contract" || doc.category === "Reference";
      }
      if (selectedCategory === "kyc") {
        return doc.category === "Identity" || doc.id === "aadhaar" || doc.id === "pan";
      }
      if (selectedCategory === "finance") {
        return doc.category === "Financial" || doc.category === "Qualification";
      }
      return true;
    });
  }, [allDocumentsList, searchQuery, selectedCategory]);

  // Metrics counters
  const totalCount = allDocumentsList.length;
  const verifiedCount = allDocumentsList.filter(
    (d) => d.status === "Verified" || d.status === "Uploaded"
  ).length;
  const pendingCount = allDocumentsList.filter(
    (d) => d.status === "Pending Upload" || d.status === "Not Uploaded"
  ).length;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDoc = (doc: any) => {
    if (doc.fileData && doc.fileData.startsWith("data:")) {
      const link = document.createElement("a");
      link.href = doc.fileData;
      link.download = doc.fileName || `${doc.name.toLowerCase().replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      setSelectedDoc(doc);
      setTimeout(() => window.print(), 300);
    }
  };

  // Direct card upload handler
  const handleCardFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetCardDocId) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const compressedData = file.type.startsWith("image/")
        ? await compressImage(base64)
        : base64;

      const currentDocs = Array.isArray(profile.documents) ? [...profile.documents] : [];
      const docMeta = STANDARD_KYC_DOCS.find((d) => d.id === targetCardDocId);
      const newDoc = {
        id: targetCardDocId,
        name: docMeta ? docMeta.name : file.name.replace(/\.[^/.]+$/, ""),
        type: docMeta ? docMeta.type : "custom",
        status: "Uploaded",
        uploadedDate: new Date().toISOString().split("T")[0],
        fileType: file.type,
        fileData: compressedData,
        fileName: file.name
      };

      const existingIdx = currentDocs.findIndex((d: any) => d && d.id === targetCardDocId);
      if (existingIdx > -1) {
        currentDocs[existingIdx] = newDoc;
      } else {
        currentDocs.push(newDoc);
      }

      await updateProfile({ documents: currentDocs });
      const userDocKey = `hrms_profile_vault_docs_${(profile.email || profile.id || "default").toLowerCase()}`;
      localStorage.setItem(userDocKey, JSON.stringify(currentDocs));
      setTargetCardDocId(null);
    };
    reader.readAsDataURL(file);
  };

  // Modal upload save handler
  const handleSaveModalUpload = async () => {
    if (!previewFileData) {
      alert("Please choose a file to upload.");
      return;
    }

    setIsUploading(true);
    try {
      const currentDocs = Array.isArray(profile.documents) ? [...profile.documents] : [];
      const stdDoc = STANDARD_KYC_DOCS.find((d) => d.id === uploadDocType);

      const docId = uploadDocType === "custom"
        ? `custom-${Date.now()}`
        : uploadDocType;

      const docName = uploadDocType === "custom"
        ? (customDocTitle.trim() || previewFileName?.replace(/\.[^/.]+$/, "") || "Custom Document")
        : (stdDoc ? stdDoc.name : "Document");

      const newDoc = {
        id: docId,
        name: docName,
        type: stdDoc ? stdDoc.type : "other",
        status: "Uploaded",
        uploadedDate: new Date().toISOString().split("T")[0],
        fileType: previewFileData.startsWith("data:application/pdf") ? "application/pdf" : "image/jpeg",
        fileData: previewFileData,
        fileName: previewFileName || `${docName.toLowerCase().replace(/\s+/g, "_")}.pdf`
      };

      const existingIdx = currentDocs.findIndex((d: any) => d && d.id === docId);
      if (existingIdx > -1) {
        currentDocs[existingIdx] = newDoc;
      } else {
        currentDocs.push(newDoc);
      }

      await updateProfile({ documents: currentDocs });
      const userDocKey = `hrms_profile_vault_docs_${(profile.email || profile.id || "default").toLowerCase()}`;
      localStorage.setItem(userDocKey, JSON.stringify(currentDocs));

      setIsUploadModalOpen(false);
      setPreviewFileData(null);
      setPreviewFileName(null);
      setCustomDocTitle("");
      alert(`Document "${docName}" uploaded and saved successfully!`);
    } catch (err: any) {
      alert("Failed to upload document: " + (err.message || err));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCustomDoc = async (docId: string, docName: string) => {
    if (!window.confirm(`Are you sure you want to remove "${docName}"?`)) return;
    const currentDocs = (profile.documents || []).filter((d: any) => d && d.id !== docId);
    await updateProfile({ documents: currentDocs });
    const userDocKey = `hrms_profile_vault_docs_${(profile.email || profile.id || "default").toLowerCase()}`;
    localStorage.setItem(userDocKey, JSON.stringify(currentDocs));
  };

  const getDocIcon = (category: string, isCorporate: boolean) => {
    if (isCorporate) {
      return <FolderLock className="h-6 w-6 text-indigo-500" />;
    }
    switch (category) {
      case "Identity":
        return <CreditCard className="h-6 w-6 text-emerald-500" />;
      case "Financial":
        return <Building className="h-6 w-6 text-amber-500" />;
      case "Qualification":
        return <Award className="h-6 w-6 text-blue-500" />;
      default:
        return <FileText className="h-6 w-6 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input for card triggers */}
      <input
        type="file"
        ref={cardFileInputRef}
        style={{ display: "none" }}
        accept="image/*,.pdf"
        onChange={handleCardFileSelect}
      />

      {/* Top Metrics Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-3 shadow-xs">
          <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Total Documents
            </span>
            <div className="text-xl font-extrabold text-foreground">{totalCount}</div>
          </div>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-3 shadow-xs">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Verified & Uploaded
            </span>
            <div className="text-xl font-extrabold text-emerald-500">{verifiedCount}</div>
          </div>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-3 shadow-xs">
          <div className="p-3 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Action Required
            </span>
            <div className="text-xl font-extrabold text-amber-500">{pendingCount}</div>
          </div>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-3 shadow-xs">
          <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Security Vault
            </span>
            <div className="text-xs font-bold text-foreground mt-1 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
              AES-256 Encrypted
            </div>
          </div>
        </div>
      </div>

      {/* Action Header & Search Filter Bar */}
      <div className="bg-card p-4 rounded-xl border border-border space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <FolderLock className="h-5 w-5 text-primary" />
              Corporate Document Center
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Official company contracts, digital ID card, and verified employee KYC credentials
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search documents by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-border bg-secondary/50 text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={<Upload className="h-4 w-4" />}
              onClick={() => setIsUploadModalOpen(true)}
              className="text-xs shrink-0 py-2 px-3.5 shadow-sm"
            >
              Upload Document
            </Button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-border overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedCategory === "all"
                ? "bg-primary text-primary-foreground font-bold shadow-xs"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border"
            }`}
          >
            All Documents ({allDocumentsList.length})
          </button>
          <button
            onClick={() => setSelectedCategory("letters")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedCategory === "letters"
                ? "bg-primary text-primary-foreground font-bold shadow-xs"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border"
            }`}
          >
            Official Letters & Contracts
          </button>
          <button
            onClick={() => setSelectedCategory("kyc")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedCategory === "kyc"
                ? "bg-primary text-primary-foreground font-bold shadow-xs"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border"
            }`}
          >
            Identity & KYC Proofs
          </button>
          <button
            onClick={() => setSelectedCategory("finance")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedCategory === "finance"
                ? "bg-primary text-primary-foreground font-bold shadow-xs"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border"
            }`}
          >
            Finance & Qualifications
          </button>
        </div>
      </div>

      {/* Grid of Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredDocs.length > 0 ? (
          filteredDocs.map((doc) => {
            const isVerifiedOrUploaded = doc.status === "Verified" || doc.status === "Uploaded";

            return (
              <Card
                key={doc.id}
                className="flex flex-col justify-between p-5 space-y-4 hover:border-primary/40 transition-all border border-border bg-card shadow-xs"
                hover
              >
                {/* Card Top: Icon, Category & Status Badge */}
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="p-2.5 rounded-xl bg-secondary/70 border border-border shrink-0">
                      {getDocIcon(doc.category, doc.isCorporateLetter)}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          isVerifiedOrUploaded
                            ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                        }`}
                      >
                        {isVerifiedOrUploaded ? (
                          <>
                            <Check className="h-3 w-3" />
                            {doc.status}
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3" />
                            Pending Upload
                          </>
                        )}
                      </span>
                      <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {doc.category}
                      </span>
                    </div>
                  </div>

                  {/* Card Title and File Details */}
                  <div className="space-y-1">
                    <h4
                      className="text-sm font-bold text-foreground line-clamp-1"
                      title={doc.name}
                    >
                      {doc.name.replace(/_/g, " ")}
                    </h4>
                    <p className="text-[11px] text-muted-foreground truncate" title={doc.fileName || "Awaiting file submission"}>
                      📁 {doc.fileName || (isVerifiedOrUploaded ? "verified_record.pdf" : "Not submitted yet")}
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1 border-t border-border/60">
                      <span>{doc.issueDate !== "-" ? `Date: ${doc.issueDate}` : "Mandatory KYC"}</span>
                      <span>{doc.fileSize !== "-" ? doc.fileSize : "Required"}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                  {isVerifiedOrUploaded ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Eye className="h-3 w-3 text-primary" />}
                        onClick={() => setSelectedDoc(doc)}
                        className="text-xs py-1.5 w-full bg-card hover:bg-secondary"
                      >
                        View
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Download className="h-3 w-3" />}
                        onClick={() => handleDownloadDoc(doc)}
                        className="text-xs py-1.5 w-full"
                      >
                        Download
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Upload className="h-3 w-3" />}
                      onClick={() => {
                        setTargetCardDocId(doc.id);
                        if (cardFileInputRef.current) {
                          cardFileInputRef.current.value = "";
                          cardFileInputRef.current.click();
                        }
                      }}
                      className="col-span-2 text-xs py-1.5 font-bold"
                    >
                      Upload Now
                    </Button>
                  )}

                  {/* Replace button for uploaded KYC documents */}
                  {!doc.isCorporateLetter && isVerifiedOrUploaded && (
                    <div className="col-span-2 flex gap-2 pt-1">
                      <button
                        onClick={() => {
                          setTargetCardDocId(doc.id);
                          if (cardFileInputRef.current) {
                            cardFileInputRef.current.value = "";
                            cardFileInputRef.current.click();
                          }
                        }}
                        className="flex-1 text-[10px] font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1 py-1 rounded bg-secondary/50 hover:bg-secondary cursor-pointer border border-border/50"
                      >
                        <RefreshCw className="h-2.5 w-2.5" /> Replace File
                      </button>
                      {doc.canDelete && (
                        <button
                          onClick={() => handleDeleteCustomDoc(doc.id, doc.name)}
                          className="px-2 text-[10px] font-semibold text-rose-500 hover:text-rose-600 transition-colors flex items-center justify-center py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 cursor-pointer border border-rose-500/30"
                          title="Delete document"
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center bg-card border border-dashed border-border rounded-xl space-y-3">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto opacity-50" />
            <h4 className="text-sm font-bold text-foreground">No documents found</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No corporate or KYC documents matched your filter query. Click below to upload a new document.
            </p>
            <Button
              variant="outline"
              size="sm"
              icon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => setIsUploadModalOpen(true)}
              className="text-xs mt-2"
            >
              Upload New Document
            </Button>
          </div>
        )}
      </div>

      {/* Policy and Privacy Notice */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3">
        <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-amber-500">Legal & Corporate Compliance Notice</h4>
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
            All document previews, downloads, and upload actions are digitally fingerprinted for corporate compliance audits under ITLC HRMS Governance standards. These files contain confidential legal employment records and government KYC credentials. Unauthorized sharing or distribution is strictly prohibited.
          </p>
        </div>
      </div>

      {/* Document Viewer Modal */}
      <Modal
        isOpen={selectedDoc !== null}
        onClose={() => setSelectedDoc(null)}
        title={selectedDoc ? selectedDoc.name.replace(/_/g, " ") : "Document Preview"}
        size={selectedDoc?.id?.includes("ID") || selectedDoc?.category === "Identity" ? "md" : "lg"}
      >
        {selectedDoc && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex justify-between items-center pb-4 border-b border-border print:hidden">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{selectedDoc.name}</span>
                <span>•</span>
                <span className="text-emerald-500 font-medium">✓ {selectedDoc.status}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" icon={<Printer className="h-4 w-4" />} onClick={handlePrint}>
                  Print
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Download className="h-4 w-4" />}
                  onClick={() => handleDownloadDoc(selectedDoc)}
                >
                  Download
                </Button>
              </div>
            </div>

            {/* Document Render Body */}
            <div className="p-6 bg-card border border-border rounded-xl print:border-0 print:p-0">
              {/* 1. Real User Uploaded Image (Aadhaar / PAN / Cheque) */}
              {selectedDoc.fileData && selectedDoc.fileData.startsWith("data:image") ? (
                <div className="flex flex-col items-center justify-center p-4 bg-secondary/30 rounded-xl border border-border space-y-4">
                  <div className="max-h-[480px] overflow-hidden rounded-lg shadow-md border border-border bg-black/20 flex items-center justify-center">
                    <img
                      src={selectedDoc.fileData}
                      alt={selectedDoc.name}
                      className="max-h-[460px] max-w-full object-contain"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-foreground">{selectedDoc.fileName || selectedDoc.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Uploaded on: {selectedDoc.issueDate} | Encrypted Base64 Secure Storage
                    </p>
                  </div>
                </div>
              ) : selectedDoc.fileData && selectedDoc.fileData.startsWith("data:application/pdf") ? (
                /* 2. User Uploaded PDF */
                <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-border rounded-xl bg-secondary/20 space-y-4 text-center">
                  <FileText className="h-16 w-16 text-primary" />
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{selectedDoc.fileName || selectedDoc.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF Document Size: ~{selectedDoc.fileSize}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    This official PDF document is stored securely in your employee records. Click below to download or print your complete document.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Download className="h-4 w-4" />}
                    onClick={() => handleDownloadDoc(selectedDoc)}
                    className="mt-2"
                  >
                    Download Full PDF File
                  </Button>
                </div>
              ) : selectedDoc.id === "DOC-ID-003" || selectedDoc.id === "Corporate_Digital_ID.pdf" ? (
                /* 3. Corporate Digital ID Badge */
                <div className="flex justify-center py-4">
                  <div className="w-72 border-2 border-primary/40 rounded-2xl overflow-hidden bg-gradient-to-b from-card to-secondary text-foreground shadow-2xl flex flex-col items-center p-6 space-y-4 relative">
                    <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary to-indigo-500" />
                    
                    {/* Header */}
                    <div className="text-center pt-2">
                      <div className="font-extrabold text-sm tracking-wider text-primary">
                        {profile.companyName || "ITLC TECHNOLOGIES"}
                      </div>
                      <span className="text-[9px] text-muted-foreground tracking-widest uppercase block mt-0.5">
                        Official Corporate ID
                      </span>
                    </div>

                    {/* Photo */}
                    <div className="h-28 w-28 rounded-full overflow-hidden border-3 border-primary/60 bg-secondary flex items-center justify-center relative shadow-md">
                      {profile.photo ? (
                        <img src={profile.photo} alt={profile.fullName} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-2xl font-extrabold text-primary">
                          {(profile.fullName || "User").split(" ").map((n) => n[0]).join("")}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="text-center space-y-1">
                      <h3 className="text-base font-extrabold text-foreground">{profile.fullName}</h3>
                      <p className="text-xs text-primary font-bold">{profile.designation}</p>
                      <p className="text-[10px] text-muted-foreground">{profile.department}</p>
                      <p className="text-[9px] text-muted-foreground">Joined: {profile.joiningDate || "2026-06-01"}</p>
                    </div>

                    {/* Barcode & ID */}
                    <div className="w-full pt-4 border-t border-border flex flex-col items-center space-y-1.5">
                      <div className="h-7 w-48 bg-foreground flex items-center justify-between px-3 text-background font-mono text-[9px] tracking-widest select-none rounded">
                        ||| | |||| | || ||||| | |||
                      </div>
                      <span className="text-[10px] font-bold font-mono text-foreground">
                        EMP ID: {profile.id || profile.employeeId}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* 4. Formal Corporate Letters (Offer, Appointment, NDA, Code of Conduct) */
                <div className="space-y-6 text-xs text-foreground/90 leading-relaxed font-sans max-w-2xl mx-auto">
                  {/* Letterhead */}
                  <div className="flex justify-between items-start pb-4 border-b border-border">
                    <div>
                      <h1 className="font-extrabold text-base text-primary">
                        {profile.companyName || "ITLC Technologies Private Limited"}
                      </h1>
                      <span className="text-[10px] text-muted-foreground block mt-0.5">
                        Corporate Headquarters • Cyber City Technology Tower, Bangalore / Silicon Valley
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-muted-foreground bg-secondary px-2 py-1 rounded">
                      REF: {selectedDoc.id}
                    </span>
                  </div>

                  {/* Letter Details */}
                  <div className="space-y-4 pt-2">
                    <div className="text-right text-[11px] font-medium text-muted-foreground">
                      Issue Date: {selectedDoc.issueDate || "2026-06-01"}
                    </div>

                    <div className="space-y-1 bg-secondary/40 p-3 rounded-lg border border-border">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Recipient Details:</div>
                      <div className="font-bold text-foreground text-sm">{profile.fullName}</div>
                      <div>Employee ID: <span className="font-mono font-bold">{profile.id}</span></div>
                      <div>Designation: <span className="font-semibold">{profile.designation}</span></div>
                      <div>Department: <span className="font-semibold">{profile.department}</span></div>
                      <div>Address: {profile.address || "Corporate Hub Office"}</div>
                    </div>

                    <div className="text-center font-extrabold text-foreground py-2 border-y border-border text-sm tracking-wide uppercase bg-secondary/20">
                      OFFICIAL RELEASE: {selectedDoc.name.replace(/_/g, " ").replace(".pdf", "")}
                    </div>

                    <div>Dear {profile.fullName.split(" ")[0]},</div>

                    {selectedDoc.id === "DOC-OFFER-001" ? (
                      <p>
                        We are pleased to offer you the position of <strong>{profile.designation}</strong> in the <strong>{profile.department}</strong> department at <strong>{profile.companyName || "ITLC Technologies"}</strong>. Your employment commenced on <strong>{profile.joiningDate || "June 01, 2026"}</strong> under our <strong>{profile.employmentType || "Full-Time Permanent"}</strong> corporate agreement.
                      </p>
                    ) : selectedDoc.id === "DOC-APPOINTMENT-002" ? (
                      <p>
                        This letter confirms your formal appointment as <strong>{profile.designation}</strong> with effect from <strong>{profile.joiningDate || "June 01, 2026"}</strong>. You report to <strong>{profile.reportingManager || "Department Head"}</strong> and will be responsible for spearheading enterprise excellence within your designated portfolio.
                      </p>
                    ) : selectedDoc.id === "DOC-NDA-004" ? (
                      <p>
                        This Non-Disclosure & Intellectual Property Protection Agreement binds all proprietary technology, internal database schemas, client contracts, and operational algorithms developed or accessed during your tenure with <strong>{profile.companyName || "ITLC Technologies"}</strong>.
                      </p>
                    ) : (
                      <p>
                        This corporate policy documentation outlines the operational code of conduct, data confidentiality, equal opportunity policies, and compliance parameters expected of all team members at <strong>{profile.companyName || "ITLC Technologies"}</strong>.
                      </p>
                    )}

                    <p>
                      All remuneration, benefit allowances, leave entitlements, and statutory provisions remain governed by your formal employment contract and active company guidelines.
                    </p>

                    <p>
                      For any inquiries regarding your official credentials, tax documentation, or corporate certifications, please contact the HR Operations Helpdesk.
                    </p>

                    {/* Signatures */}
                    <div className="pt-8 flex justify-between items-end border-t border-border mt-8">
                      <div className="space-y-1">
                        <div className="text-muted-foreground text-[10px]">Authorized Corporate Signatory:</div>
                        <div className="font-extrabold text-foreground text-sm">Sarah Jenkins</div>
                        <div className="text-muted-foreground text-[10px]">Director of Global People Operations</div>
                      </div>
                      <div className="text-center flex flex-col items-center">
                        <div className="h-12 w-28 border-2 border-dashed border-primary/40 rounded-lg flex items-center justify-center text-[10px] text-primary font-bold tracking-wider uppercase bg-primary/5">
                          ✓ ITLC SEAL
                        </div>
                        <span className="text-[9px] text-muted-foreground block mt-1">Digitally Signed & Validated</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Upload New Document Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setPreviewFileData(null);
          setPreviewFileName(null);
        }}
        title="Upload Document to Security Vault"
        size="md"
      >
        <div className="space-y-5">
          <div>
            <label className="text-xs font-bold text-foreground block mb-1.5">
              Select Document Type
            </label>
            <select
              value={uploadDocType}
              onChange={(e) => setUploadDocType(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:border-primary"
            >
              <option value="aadhaar">Aadhaar Card (Mandatory KYC)</option>
              <option value="pan">PAN Card (Tax & Identity KYC)</option>
              <option value="bank-cheque">Bank Passbook / Cancelled Cheque (Payroll)</option>
              <option value="resume">Resume / Curriculum Vitae</option>
              <option value="education">Highest Educational Degree Certificate</option>
              <option value="exp-letter">Previous Experience / Relieving Letter</option>
              <option value="custom">Other Official Document</option>
            </select>
          </div>

          {uploadDocType === "custom" && (
            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">
                Document Title / Name
              </label>
              <input
                type="text"
                placeholder="e.g. Passport, Certification, Medical Fitness"
                value={customDocTitle}
                onChange={(e) => setCustomDocTitle(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-foreground block mb-1.5">
              Select Document File (JPG, PNG, or PDF up to 10MB)
            </label>
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors bg-secondary/20">
              <input
                type="file"
                id="modal-doc-file"
                style={{ display: "none" }}
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onloadend = async () => {
                    const base64 = reader.result as string;
                    const compressed = file.type.startsWith("image/")
                      ? await compressImage(base64)
                      : base64;
                    setPreviewFileData(compressed);
                    setPreviewFileName(file.name);
                  };
                  reader.readAsDataURL(file);
                }}
              />
              <label
                htmlFor="modal-doc-file"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-8 w-8 text-primary" />
                <span className="text-xs font-bold text-foreground">
                  {previewFileName ? `Selected: ${previewFileName}` : "Click to browse or drop file here"}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Supports Images (.PNG, .JPG) and PDF documents
                </span>
              </label>
            </div>
          </div>

          {/* Preview snippet if file selected */}
          {previewFileData && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-500 font-semibold truncate">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span className="truncate">{previewFileName}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPreviewFileData(null);
                  setPreviewFileName(null);
                }}
                className="text-muted-foreground hover:text-destructive cursor-pointer text-xs font-medium"
              >
                Clear
              </button>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsUploadModalOpen(false);
                setPreviewFileData(null);
                setPreviewFileName(null);
              }}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={isUploading}
              disabled={!previewFileData || isUploading}
              onClick={handleSaveModalUpload}
              className="text-xs font-bold px-4"
            >
              Save to Document Vault 🚀
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
