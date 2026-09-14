"use client";

import React, { useState, useEffect } from "react";
import { Card, Button, Badge, Modal, Select } from "../UI";
import {
  Laptop,
  Monitor,
  Keyboard,
  ShieldCheck,
  RotateCcw,
  Plus,
  X
} from "lucide-react";
import { api } from "../../../services/api";

export const AssetManagement: React.FC = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // New Request Form fields
  const [newAssetName, setNewAssetName] = useState("");
  const [newAssetType, setNewAssetType] = useState("Laptop");
  const [newRequestComment, setNewRequestComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const data = await api.getEmployeeAssets();
      setAssets(data || []);
    } catch (err) {
      console.error("Failed to load employee assets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleRequestAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetName.trim()) return;
    setSubmitting(true);
    try {
      await api.requestEmployeeAsset({
        assetName: newAssetName,
        assetType: newAssetType,
        requestComment: newRequestComment
      });
      alert("Asset request submitted successfully!");
      setIsRequestModalOpen(false);
      setNewAssetName("");
      setNewRequestComment("");
      fetchAssets();
    } catch (err: any) {
      alert("Failed to submit request: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInitiateReturn = async (id: string) => {
    if (!window.confirm("Are you sure you want to initiate the return process for this asset?")) return;
    try {
      await api.returnEmployeeAsset(id);
      alert("Return request submitted successfully!");
      fetchAssets();
    } catch (err: any) {
      alert("Failed to submit return request: " + err.message);
    }
  };

  const getAssetIcon = (name: string) => {
    const lowerName = (name || "").toLowerCase();
    if (lowerName.includes("macbook") || lowerName.includes("laptop")) {
      return <Laptop className="h-6 w-6 text-indigo-500" />;
    }
    if (lowerName.includes("monitor") || lowerName.includes("dell")) {
      return <Monitor className="h-6 w-6 text-emerald-500" />;
    }
    return <Keyboard className="h-6 w-6 text-amber-500" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Assigned":
      case "Allocated":
        return <Badge variant="success">Assigned</Badge>;
      case "Requested":
        return <Badge variant="info">Requested</Badge>;
      case "Return Pending":
        return <Badge variant="warning">Return Pending</Badge>;
      case "Returned":
        return <Badge variant="neutral">Returned</Badge>;
      case "Rejected":
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Information Header Card */}
      <div className="p-5 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl border border-primary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="h-4.5 w-4.5 text-primary" /> IT Asset Custody Inventory
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            View and request security asset allocations to your workspace profile
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground bg-card/65 px-3 py-1.5 rounded-lg border border-border">
            Active Devices: <strong>{assets.filter(a => a.status === "Assigned" || a.status === "Allocated").length}</strong>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setIsRequestModalOpen(true)}
            className="cursor-pointer text-xs"
          >
            Request New Asset
          </Button>
        </div>
      </div>

      {/* Grid of Devices */}
      {loading ? (
        <div className="text-center p-12 text-xs text-muted-foreground">Loading custody asset records...</div>
      ) : assets.length === 0 ? (
        <Card className="p-12 text-center text-xs text-muted-foreground">
          No assets currently assigned to your account.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <Card key={asset.id} className="flex flex-col justify-between p-5 space-y-4" hover>
              
              {/* Header info */}
              <div className="flex justify-between items-start">
                <div className="p-2.5 rounded-lg bg-secondary/60 shrink-0">
                  {getAssetIcon(asset.assetName || asset.name)}
                </div>
                {getStatusBadge(asset.status)}
              </div>

              {/* Asset details */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground leading-snug line-clamp-2" title={asset.assetName || asset.name}>
                  {asset.assetName || asset.name}
                </h4>
                
                <div className="pt-2 grid grid-cols-2 gap-2 text-[10px] text-muted-foreground border-t border-border/60">
                  <div>
                    <span className="font-bold block uppercase scale-90 origin-left">Asset Code</span>
                    <span className="font-mono font-semibold text-foreground">{asset.id}</span>
                  </div>
                  <div>
                    <span className="font-bold block uppercase scale-90 origin-left">Serial Number</span>
                    <span className="font-semibold text-foreground truncate block">{asset.serialNumber || "Pending"}</span>
                  </div>
                </div>

                {asset.requestComment && (
                  <p className="text-[10px] italic text-muted-foreground mt-2 border-t border-dashed border-border/40 pt-1.5">
                    " {asset.requestComment} "
                  </p>
                )}
              </div>

              {/* Actions */}
              {(asset.status === "Assigned" || asset.status === "Allocated") && (
                <div className="pt-2 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<RotateCcw className="h-3 w-3" />}
                    onClick={() => handleInitiateReturn(asset.id)}
                    className="w-full text-[11px] py-1.5 cursor-pointer"
                  >
                    Initiate Return Process
                  </Button>
                </div>
              )}

              {asset.status === "Return Pending" && (
                <div className="pt-2 text-center text-[10px] text-amber-500 font-semibold bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                  Return verification pending HR approval
                </div>
              )}

              {asset.status === "Requested" && (
                <div className="pt-2 text-center text-[10px] text-indigo-500 font-semibold bg-indigo-500/5 p-2 rounded-lg border border-indigo-500/10">
                  Awaiting administrator assignment & tracking serial ID
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Request Asset Modal */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Request Workstation Equipment"
      >
        <form onSubmit={handleRequestAsset} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground">Asset Category</label>
            <Select
              value={newAssetType}
              onChange={(val) => setNewAssetType(val)}
              options={[
                { value: "Laptop", label: "Laptop Workstation" },
                { value: "Monitor", label: "Desktop Monitor" },
                { value: "Phone", label: "Mobile Phone" },
                { value: "Accessories", label: "Peripherals & Keyboard" },
              ]}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground">Asset Name / Specific Model</label>
            <input
              type="text"
              required
              placeholder="e.g. MacBook Pro M3 Max 16-inch or Dell 27' 4K Display"
              value={newAssetName}
              onChange={(e) => setNewAssetName(e.target.value)}
              className="px-3 py-2 text-xs md:text-sm rounded-lg border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground">Reason / Comments</label>
            <textarea
              rows={3}
              placeholder="Provide a detailed justification for the asset allocation..."
              value={newRequestComment}
              onChange={(e) => setNewRequestComment(e.target.value)}
              className="px-3 py-2 text-xs md:text-sm rounded-lg border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRequestModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              className="text-xs"
            >
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
