"use client";

import React, { useState } from "react";
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
} from "lucide-react";

export const DocumentCenter: React.FC = () => {
  const { documents, profile } = useHRMS();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  const filteredDocs = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  const getDocIcon = (category: string) => {
    switch (category) {
      case "Contract":
        return <FolderLock className="h-6 w-6 text-indigo-500" />;
      case "Identity":
        return <FolderLock className="h-6 w-6 text-emerald-500" />;
      case "Compensation":
        return <FolderLock className="h-6 w-6 text-amber-500" />;
      default:
        return <FileText className="h-6 w-6 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Header panel */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-card p-4 rounded-xl border border-border">
        <div>
          <h3 className="text-sm font-bold text-foreground">Corporate Document Center</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Secure repository for legal and employment verifications</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search documents by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs md:text-sm rounded-lg border border-border bg-secondary/50 text-foreground focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Grid of Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDocs.length > 0 ? (
          filteredDocs.map((doc) => (
            <Card key={doc.id} className="flex flex-col justify-between p-5 space-y-4" hover>
              <div className="flex justify-between items-start">
                <div className="p-2.5 rounded-lg bg-secondary/60 shrink-0">
                  {getDocIcon(doc.category)}
                </div>
                <Badge variant={doc.category === "Contract" ? "info" : doc.category === "Identity" ? "success" : "warning"} className="text-[9px]">
                  {doc.category}
                </Badge>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-bold text-foreground line-clamp-1" title={doc.name}>
                  {doc.name.replace(/_/g, " ")}
                </h4>
                <p className="text-[10px] text-muted-foreground">
                  Issued: {doc.issueDate} | Size: {doc.fileSize}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Eye className="h-3 w-3" />}
                  onClick={() => setSelectedDoc(doc)}
                  className="text-[11px] py-1.5"
                >
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Download className="h-3 w-3" />}
                  onClick={() => {
                    setSelectedDoc(doc);
                    setTimeout(() => window.print(), 300);
                  }}
                  className="text-[11px] py-1.5"
                >
                  Download
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground text-xs">
            No corporate documents found matching your search.
          </div>
        )}
      </div>

      {/* Policy Disclaimer Alert */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3">
        <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-amber-500">Important Privacy Notice</h4>
          <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
            All document actions are logged for compliance audits. These files contain confidential employment records. Unauthorized sharing or distribution is strictly prohibited under the ITLC Data Privacy Agreement.
          </p>
        </div>
      </div>

      {/* Document Viewer Modal */}
      <Modal
        isOpen={selectedDoc !== null}
        onClose={() => setSelectedDoc(null)}
        title={selectedDoc ? selectedDoc.name.replace(/_/g, " ") : "Document Preview"}
        size={selectedDoc?.category === "Identity" ? "sm" : "lg"}
      >
        {selectedDoc && (
          <div className="space-y-6">
            
            {/* Action panel */}
            <div className="flex justify-end gap-2 pb-4 border-b border-border print:hidden">
              <Button variant="outline" size="sm" icon={<Printer className="h-4 w-4" />} onClick={handlePrint}>
                Print Document
              </Button>
              <Button variant="primary" size="sm" icon={<Download className="h-4 w-4" />} onClick={handlePrint}>
                Download PDF
              </Button>
            </div>

            {/* Document Render Layout */}
            <div className="p-6 bg-card border border-border rounded-xl print:border-0 print:p-0">
              
              {/* Conditional rendering for Identity Card */}
              {selectedDoc.category === "Identity" ? (
                <div className="flex justify-center py-6">
                  {/* Corporate ID Badge */}
                  <div className="w-64 border border-border rounded-2xl overflow-hidden bg-card text-foreground shadow-xl flex flex-col items-center p-6 space-y-4">
                    {/* Header */}
                    <div className="text-center">
                      <div className="font-extrabold text-sm tracking-widest text-primary">ITLC TECHNOLOGIES</div>
                      <span className="text-[8px] text-muted-foreground tracking-wider block mt-0.5">Enterprise SaaS</span>
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

                    {/* Info */}
                    <div className="text-center space-y-1">
                      <h3 className="text-sm font-extrabold">{profile.fullName}</h3>
                      <p className="text-[10px] text-primary font-semibold">{profile.designation}</p>
                      <p className="text-[9px] text-muted-foreground">{profile.department}</p>
                    </div>

                    {/* Barcode & ID */}
                    <div className="w-full pt-4 border-t border-border flex flex-col items-center space-y-1">
                      {/* Mock Barcode */}
                      <div className="h-8 w-44 bg-foreground flex items-center justify-between px-2 text-background font-mono text-[8px] tracking-wide select-none">
                        ||| | |||| | || ||||| | |||
                      </div>
                      <span className="text-[9px] font-bold font-mono text-foreground mt-1">ID: {profile.id}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Standard Letter PDF Preview */
                <div className="space-y-6 text-xs text-foreground/80 leading-relaxed font-sans">
                  {/* Letterhead */}
                  <div className="flex justify-between items-start pb-4 border-b border-border">
                    <div>
                      <h1 className="font-extrabold text-sm text-foreground">ITLC Technologies Private Limited</h1>
                      <span className="text-[9px] text-muted-foreground block mt-0.5">100 Pine Street, San Francisco, CA 94111</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">{selectedDoc.id}</span>
                  </div>

                  {/* Letter Details */}
                  <div className="space-y-4 pt-4">
                    <div className="text-right text-[10px]">Date: {selectedDoc.issueDate}</div>
                    
                    <div className="space-y-1">
                      <div>To,</div>
                      <div className="font-bold text-foreground">{profile.fullName}</div>
                      <div>Employee ID: {profile.id}</div>
                      <div>{profile.address}</div>
                    </div>

                    <div className="text-center font-bold text-foreground py-2 border-y border-border">
                      SUBJECT: OFFICIAL RELEASE OF {selectedDoc.name.replace(/_/g, " ").replace(".pdf", "").toUpperCase()}
                    </div>

                    <div>Dear {profile.fullName.split(" ")[0]},</div>

                    <p>
                      This letter serves to confirm your employment status and formal documents registration at ITLC Technologies. You were hired as a <strong>{profile.designation}</strong> in the <strong>{profile.department}</strong> department, starting on <strong>{profile.joiningDate}</strong>.
                    </p>

                    <p>
                      Your employment type is listed as <strong>{profile.employmentType}</strong>. All terms, conditions, and benefit allowances remain governed by the employee handbook and original execution contracts.
                    </p>

                    <p>
                      Should you require any additional information or have further questions regarding your salary components, corporate designations, or other legal declarations, please feel free to reach out to the HR Operations desk by opening a support ticket in this portal.
                    </p>

                    {/* Signatures */}
                    <div className="pt-8 flex justify-between">
                      <div className="space-y-1">
                        <div>Sincerely,</div>
                        <div className="font-bold text-foreground">Sarah Jenkins</div>
                        <div className="text-muted-foreground text-[10px]">Director of Operations</div>
                      </div>
                      <div className="text-center">
                        <div className="h-8 w-24 border border-dashed border-border flex items-center justify-center text-[9px] text-muted-foreground italic rounded-lg">
                          Corporate Stamp
                        </div>
                        <span className="text-[9px] text-muted-foreground block mt-1">ITLC HR Seal</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}
      </Modal>

    </div>
  );
};
