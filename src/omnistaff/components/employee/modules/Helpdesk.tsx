"use client";

import React, { useState } from "react";
import { useHRMS, HelpdeskTicket } from "../context/HRMSContext";
import { Card, Button, Modal, Badge, Select, cn } from "../UI";
import {
  LifeBuoy,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldQuestion,
} from "lucide-react";

export const Helpdesk: React.FC = () => {
  const { tickets, createTicket, activeSubTab: globalSubTab, setActiveSubTab: setGlobalSubTab } = useHRMS();

  // Normalize subtabs
  const activeSubTab = ["helpdesk-create", "helpdesk-list"].includes(globalSubTab)
    ? globalSubTab
    : "helpdesk-create";

  const setActiveSubTab = (tabId: string) => setGlobalSubTab(tabId);

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"IT Support" | "HR Support" | "Payroll Support" | "Asset Issue">("IT Support");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [description, setDescription] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Selected Ticket for Timeline tracking
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
    tickets.length > 0 ? tickets[0].id : null
  );

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

  // Tab filtering: Active vs Resolved/Closed
  const [ticketTab, setTicketTab] = useState<"Active" | "Closed">("Active");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    createTicket({
      title,
      category,
      priority,
      description,
    });

    setFormSuccess("Support ticket created successfully!");
    setTitle("");
    setDescription("");

    // Auto navigate to list tab after a brief delay so the user sees the ticket in log
    setTimeout(() => {
      setFormSuccess("");
      setActiveSubTab("helpdesk-list");
      // Select the newest ticket
      if (tickets.length > 0) {
        setSelectedTicketId(tickets[0].id);
      }
    }, 1500);
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "High":
        return <Badge variant="danger">High</Badge>;
      case "Medium":
        return <Badge variant="warning">Medium</Badge>;
      case "Low":
        return <Badge variant="neutral">Low</Badge>;
      default:
        return <Badge variant="neutral">{p}</Badge>;
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "Open":
        return <Badge variant="info">Open</Badge>;
      case "Assigned":
        return <Badge variant="warning">Assigned</Badge>;
      case "In Progress":
        return <Badge variant="warning">In Progress</Badge>;
      case "Resolved":
        return <Badge variant="success">Resolved</Badge>;
      case "Closed":
        return <Badge variant="neutral">Closed</Badge>;
      default:
        return <Badge variant="neutral">{s}</Badge>;
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const isClosedStatus = t.status === "Closed" || t.status === "Resolved";
    if (ticketTab === "Closed") return isClosedStatus;
    return !isClosedStatus; // Active: Open, Assigned, In Progress
  });

  // Timeline Step Generator for selected ticket
  const renderTicketTimeline = (t: HelpdeskTicket) => {
    const stages = [
      { key: "Open", label: "Ticket Created", desc: `Registered in helpdesk on ${t.createdAt.split(" ")[0]}` },
      { key: "Assigned", label: "Agent Assigned", desc: "Allocated to support technician" },
      { key: "In Progress", label: "Investigating", desc: "Work in progress to resolve" },
      { key: "Resolved", label: "Resolved", desc: "Fix deployed, pending verification" },
      { key: "Closed", label: "Closed", desc: "Ticket closed successfully" },
    ];

    const currentIdx = stages.findIndex((st) => st.key === t.status);

    return (
      <div className="relative border-l-2 border-border ml-3 pl-6 space-y-6">
        {stages.map((st, idx) => {
          const isCompleted = idx <= currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <div key={idx} className="relative">
              {/* Connector Dot */}
              <span
                className={`absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border transition-all ${
                  isCompleted
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-500"
                    : isCurrent
                    ? "bg-primary/20 border-primary text-primary animate-pulse"
                    : "bg-card border-border text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <Clock className="h-3 w-3" />
                )}
              </span>

              {/* Text Content */}
              <div>
                <h4 className={`text-xs font-bold leading-none ${isCompleted ? "text-emerald-500" : "text-foreground"}`}>
                  {st.label}
                </h4>
                <p className="text-[10px] text-muted-foreground mt-1 leading-normal max-w-md">
                  {isCurrent ? st.desc : isCompleted ? "Completed" : "Pending Action"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Tabs navigation */}
      <div className="flex bg-card p-1 rounded-xl border border-border overflow-x-auto space-x-1 shrink-0 scrollbar-none print:hidden">
        {[
          { id: "helpdesk-create", label: "Create Ticket", icon: Plus },
          { id: "helpdesk-list", label: "My Tickets", icon: LifeBuoy },
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

      {/* RENDER CREATE TICKET FORM */}
      {activeSubTab === "helpdesk-create" && (
        <Card className="max-w-2xl p-6 space-y-6 animate-fadeIn">
          <div>
            <h3 className="text-sm font-bold text-foreground">Open a Support Ticket</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Submit details about biometric entry errors, IT support licenses, HR queries, or salary dispute clarifications.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Ticket Title</label>
              <input
                type="text"
                placeholder="e.g. Broken keyboard replacement request"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="px-3 py-2 text-xs md:text-sm rounded-lg border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Support Category</label>
                <Select
                  value={category}
                  onChange={(val) => setCategory(val as any)}
                  options={[
                    { value: "IT Support", label: "IT Support" },
                    { value: "HR Support", label: "HR Support" },
                    { value: "Payroll Support", label: "Payroll Support" },
                    { value: "Asset Issue", label: "Asset Allocation" },
                  ]}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Urgency Priority</label>
                <Select
                  value={priority}
                  onChange={(val) => setPriority(val as any)}
                  options={[
                    { value: "High", label: "High Urgency" },
                    { value: "Medium", label: "Medium Urgency" },
                    { value: "Low", label: "Low Urgency" },
                  ]}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Detailed Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your issue with specifications (e.g. device model, error logs, specific months)..."
                required
                rows={4}
                className="px-3 py-2 text-xs md:text-sm rounded-lg border border-border bg-secondary/35 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            {formSuccess && (
              <p className="text-xs font-semibold text-emerald-500 flex items-center gap-1.5 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/10 animate-fadeIn">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> {formSuccess}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-border mt-6">
              <Button type="button" variant="outline" onClick={() => {
                setTitle("");
                setDescription("");
                setActiveSubTab("helpdesk-list");
              }}>
                Cancel
              </Button>
              <Button type="submit">
                Submit Ticket
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* RENDER TICKETS LOG LIST VIEW */}
      {activeSubTab === "helpdesk-list" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Visual statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-4 border border-border flex items-center gap-4">
              <div className="p-3 rounded-xl shrink-0 bg-primary/10 text-primary">
                <LifeBuoy className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Total Open Issues</span>
                <span className="text-xl font-extrabold text-foreground mt-1 block">
                  {tickets.filter((t) => t.status !== "Closed" && t.status !== "Resolved").length} Tickets
                </span>
              </div>
            </Card>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Tickets List Column (2 cols) */}
            <Card className="xl:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pb-2 border-b border-border">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Service Tickets Log</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Submit questions regarding asset damage, IT software licenses, or payroll discrepancies</p>
                </div>
                
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus className="h-3.5 w-3.5" />}
                  onClick={() => setActiveSubTab("helpdesk-create")}
                  className="text-xs shrink-0"
                >
                  Open Support Ticket
                </Button>
              </div>

              {/* Tabs Filter */}
              <div className="flex bg-secondary/50 p-0.5 rounded-lg border border-border w-56">
                {["Active", "Closed"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setTicketTab(tab as any)}
                    className={`flex-1 text-center py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                      ticketTab === tab ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                    }`}
                  >
                    {tab} Tickets ({tickets.filter((t) => {
                      const isClosed = t.status === "Closed" || t.status === "Resolved";
                      return tab === "Closed" ? isClosed : !isClosed;
                    }).length})
                  </button>
                ))}
              </div>

              {/* Tickets Log */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicketId(t.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-start text-xs ${
                        selectedTicketId === t.id
                          ? "border-primary bg-primary/5"
                          : "border-border bg-secondary/15 hover:bg-secondary/25"
                      }`}
                    >
                      <div className="space-y-1.5 min-w-0 pr-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-[10px] text-primary font-mono">{t.id}</span>
                          <span className="text-[10px] text-muted-foreground uppercase font-bold">{t.category}</span>
                          {getPriorityBadge(t.priority)}
                        </div>
                        <h4 className="font-bold text-foreground truncate max-w-sm">{t.title}</h4>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{t.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[9px] text-muted-foreground block mb-2">{t.createdAt.split(" ")[0]}</span>
                        {getStatusBadge(t.status)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground text-xs">
                    No support tickets found in this tab.
                  </div>
                )}
              </div>
            </Card>

            {/* Live Timeline Tracker (1 col) */}
            <Card className="flex flex-col space-y-4">
              <div className="pb-2 border-b border-border">
                <h3 className="text-sm font-bold text-foreground">Resolution Path</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Track real-time progress steps for this ticket</p>
              </div>

              {selectedTicket ? (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  
                  {/* Selected ticket summary */}
                  <div className="p-3 bg-secondary/50 border border-border rounded-lg space-y-1.5 text-xs">
                    <div className="flex justify-between items-start font-semibold">
                      <span className="text-foreground font-bold">{selectedTicket.title}</span>
                      <span className="font-mono text-[10px] text-primary shrink-0">{selectedTicket.id}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      {selectedTicket.description}
                    </p>
                  </div>

                  {/* Timeline */}
                  <div className="py-2 flex-1">
                    {renderTicketTimeline(selectedTicket)}
                  </div>

                  {/* Closure button simulator */}
                  {selectedTicket.status === "Resolved" && (
                    <div className="pt-2 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs py-2 cursor-pointer"
                        onClick={() => {
                          alert("Ticket closure simulated. Refreshing timeline status!");
                          // Status update is automatically simulated by context timers
                        }}
                      >
                        Accept Resolution & Close Ticket
                      </Button>
                    </div>
                  )}

                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center p-8 text-xs text-muted-foreground">
                  Select a service ticket from the log list to inspect the resolution stages.
                </div>
              )}
            </Card>

          </div>
        </div>
      )}

    </div>
  );
};
