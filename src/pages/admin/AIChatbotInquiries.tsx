import { useState, useEffect, useMemo } from "react";
import { api } from "../../lib/api";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { 
  Search, SlidersHorizontal, Trash2, CheckCircle, Clock, XCircle, 
  Eye, Calendar, Check, AlertCircle, Sparkles, Filter, MessageSquare, Bot, User, Clipboard, FileText, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AIChatbotInquiry {
  id: string;
  name: string;
  mobile: string;
  email: string;
  eventType: string;
  eventDate: string;
  guests: number | string;
  preferredCuisine: string;
  cateringPackage?: string;
  budget: number | string;
  venueAddress: string;
  city: string;
  specialRequirements?: string;
  status: "New Inquiry" | "Reviewed" | "Responded" | "Cancelled";
  source: string;
  createdAt: string;
}

interface ChatMessage {
  role: "user" | "model";
  content: string;
  timestamp: string;
}

interface ChatSessionLog {
  id: string;
  sessionId: string;
  clientName?: string;
  messages: ChatMessage[];
  bookingCreated: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AIChatbotInquiries() {
  const [activeTab, setActiveTab] = useState<"inquiries" | "logs">("inquiries");
  
  // Data lists
  const [inquiries, setInquiries] = useState<AIChatbotInquiry[]>([]);
  const [sessions, setSessions] = useState<ChatSessionLog[]>([]);
  
  // Loading & error
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & selection
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInquiry, setSelectedInquiry] = useState<AIChatbotInquiry | null>(null);
  const [selectedSession, setSelectedSession] = useState<ChatSessionLog | null>(null);

  // Fetch all bookings and logged sessions
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    let bookingsData: AIChatbotInquiry[] = [];
    let sessionsData: ChatSessionLog[] = [];

    // 1. Try fetching from remote endpoints
    try {
      const [bookingsRes, sessionsRes] = await Promise.all([
        api.getChatbotBookings(),
        api.getChatSessions()
      ]);

      if (bookingsRes.success && bookingsRes.data) {
        bookingsData = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];
      }
      if (sessionsRes.success && sessionsRes.data) {
        sessionsData = Array.isArray(sessionsRes.data) ? sessionsRes.data : [];
      }
    } catch (err) {
      console.warn("Could not retrieve remote records, relying on client-side state merge.", err);
    }

    // 2. Always retrieve and merge local storage fallbacks (dual-persistence / frontend-only support)
    try {
      const localBookingsStr = localStorage.getItem("eveng_local_bookings");
      const localBookings: AIChatbotInquiry[] = localBookingsStr ? JSON.parse(localBookingsStr) : [];
      
      const localSessionsStr = localStorage.getItem("eveng_local_sessions");
      const localSessions: ChatSessionLog[] = localSessionsStr ? JSON.parse(localSessionsStr) : [];

      // Merge & de-duplicate bookings
      const bookingMap = new Map<string, AIChatbotInquiry>();
      bookingsData.forEach(b => bookingMap.set(b.id, b));
      localBookings.forEach(b => {
        if (!bookingMap.has(b.id)) {
          bookingMap.set(b.id, b);
        }
      });
      bookingsData = Array.from(bookingMap.values());

      // Merge & de-duplicate sessions
      const sessionMap = new Map<string, ChatSessionLog>();
      sessionsData.forEach(s => sessionMap.set(s.sessionId, s));
      localSessions.forEach(s => {
        if (!sessionMap.has(s.sessionId)) {
          sessionMap.set(s.sessionId, s);
        } else {
          const existing = sessionMap.get(s.sessionId)!;
          if (s.messages.length > existing.messages.length) {
            sessionMap.set(s.sessionId, s);
          }
        }
      });
      sessionsData = Array.from(sessionMap.values());
    } catch (e) {
      console.error("Failed to parse local backup storage:", e);
    }

    // Sort by newest first
    bookingsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    sessionsData.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    setInquiries(bookingsData);
    setSessions(sessionsData);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update Status
  const handleStatusChange = async (id: string, newStatus: AIChatbotInquiry["status"]) => {
    // 1. Try sending status modification to backend
    try {
      await api.updateChatbotBookingStatus(id, newStatus);
    } catch (err) {
      console.warn("Could not sync status with remote server, modifying local-only.", err);
    }

    // 2. Always update local visual state
    setInquiries(prev => 
      prev.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq)
    );

    if (selectedInquiry?.id === id) {
      setSelectedInquiry(prev => prev ? { ...prev, status: newStatus } : null);
    }

    // 3. Update the local storage array
    try {
      const localBookingsStr = localStorage.getItem("eveng_local_bookings");
      if (localBookingsStr) {
        const localBookings: AIChatbotInquiry[] = JSON.parse(localBookingsStr);
        const updated = localBookings.map(b => b.id === id ? { ...b, status: newStatus } : b);
        localStorage.setItem("eveng_local_bookings", JSON.stringify(updated));
      }
    } catch (e) {
      console.error("Failed to update local status storage:", e);
    }
  };

  // Delete Record
  const handleDeleteInquiry = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this chatbot reservation inquiry? This action is irreversible.")) {
      return;
    }

    // 1. Try sending delete command to backend
    try {
      await api.deleteChatbotBooking(id);
    } catch (err) {
      console.warn("Could not sync deletion with remote server, discarding local-only.", err);
    }

    // 2. Always update local visual state
    setInquiries(prev => prev.filter(inq => inq.id !== id));
    if (selectedInquiry?.id === id) {
      setSelectedInquiry(null);
    }

    // 3. Update local storage list
    try {
      const localBookingsStr = localStorage.getItem("eveng_local_bookings");
      if (localBookingsStr) {
        const localBookings: AIChatbotInquiry[] = JSON.parse(localBookingsStr);
        const filtered = localBookings.filter(b => b.id !== id);
        localStorage.setItem("eveng_local_bookings", JSON.stringify(filtered));
      }
    } catch (e) {
      console.error("Failed to delete local inquiry from storage:", e);
    }
  };

  // Filter inquiries
  const filteredInquiries = useMemo(() => {
    return inquiries.filter(inq => {
      const matchSearch = 
        inq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inq.mobile.includes(searchQuery) ||
        inq.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inq.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "all" || inq.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [inquiries, searchQuery, statusFilter]);

  // Filter logs
  const filteredSessions = useMemo(() => {
    return sessions.filter(sess => {
      const nameMatch = sess.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
      const idMatch = sess.sessionId.toLowerCase().includes(searchQuery.toLowerCase());
      return nameMatch || idMatch;
    });
  }, [sessions, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-secondary flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span>AI Concierge Center</span>
          </h3>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Audit automatic chatbot bookings and review client conversation transcripts recorded via Google Gemini.
          </p>
        </div>
        <button 
          onClick={fetchData} 
          className="px-4 py-2 bg-secondary text-primary hover:bg-[#122418] text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Database</span>
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => {
            setActiveTab("inquiries");
            setSearchQuery("");
            setSelectedSession(null);
          }}
          className={`px-5 py-3 text-sm font-bold tracking-wide border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "inquiries"
              ? "border-primary text-secondary"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>AI Chatbot Inquiries ({inquiries.length})</span>
        </button>
        <button
          onClick={() => {
            setActiveTab("logs");
            setSearchQuery("");
            setSelectedInquiry(null);
          }}
          className={`px-5 py-3 text-sm font-bold tracking-wide border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "logs"
              ? "border-primary text-secondary"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>AI Conversation Logging ({sessions.length})</span>
        </button>
      </div>

      {/* Toolbar Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === "inquiries" ? "Search lead name, city, email..." : "Search session ID, client name..."}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary text-secondary placeholder-slate-400"
          />
        </div>

        {/* Filters for Inquiries */}
        {activeTab === "inquiries" && (
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
            </div>
            {["all", "New Inquiry", "Reviewed", "Responded", "Cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === status
                    ? "bg-secondary text-white shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-100"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
          <TableSkeleton rows={6} cols={5} />
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 flex flex-col items-center gap-3 p-6 text-rose-500">
          <AlertCircle className="w-12 h-12 stroke-1" />
          <p className="text-sm font-bold">Failed to load records</p>
          <p className="text-xs text-slate-400 font-semibold max-w-md">{error}</p>
        </div>
      ) : activeTab === "inquiries" ? (
        /* ======================================================== */
        /* INQUIRIES TAB */
        /* ======================================================== */
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          {/* List Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden xl:col-span-2">
            {filteredInquiries.length === 0 ? (
              <div className="text-center py-24 text-slate-400 flex flex-col items-center gap-3">
                <Clipboard className="w-12 h-12 text-slate-200 stroke-1" />
                <p className="text-sm font-bold">No chatbot inquiries found.</p>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Check spelling or change status filter flags.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50/55 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-4 px-5">Lead Name</th>
                      <th className="py-4 px-5">Event Type</th>
                      <th className="py-4 px-5">Date & Guests</th>
                      <th className="py-4 px-5">Status</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium text-secondary">
                    {filteredInquiries.map((inq) => (
                      <tr 
                        key={inq.id} 
                        className={`hover:bg-slate-50/30 transition-colors cursor-pointer ${
                          selectedInquiry?.id === inq.id ? "bg-primary/5 border-l-4 border-l-primary" : ""
                        }`}
                        onClick={() => setSelectedInquiry(inq)}
                      >
                        <td className="py-4 px-5">
                          <p className="font-bold">{inq.name}</p>
                          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">{inq.mobile}</span>
                        </td>
                        <td className="py-4 px-5">
                          <span className="font-bold text-slate-700">{inq.eventType}</span>
                          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">{inq.city}</span>
                        </td>
                        <td className="py-4 px-5">
                          <p className="font-bold">{inq.eventDate}</p>
                          <span className="text-[10px] text-primary font-bold block mt-0.5">{inq.guests} guests</span>
                        </td>
                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            inq.status === "New Inquiry" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                            inq.status === "Reviewed" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                            inq.status === "Responded" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                            "bg-slate-50 text-slate-600 border border-slate-200"
                          }`}>
                            {inq.status === "New Inquiry" && <AlertCircle className="w-3 h-3 animate-pulse" />}
                            {inq.status === "Reviewed" && <Clock className="w-3 h-3" />}
                            {inq.status === "Responded" && <CheckCircle className="w-3 h-3" />}
                            {inq.status === "Cancelled" && <XCircle className="w-3 h-3" />}
                            <span>{inq.status}</span>
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-1.5">
                            <button 
                              onClick={() => setSelectedInquiry(inq)}
                              className="p-2 border border-slate-100 hover:bg-slate-50 rounded-xl text-slate-500 cursor-pointer"
                              title="Inspect Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteInquiry(inq.id)}
                              className="p-2 border border-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                              title="Discard Lead"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Detailed Inquiry Inspection Side Panel */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm text-left">
            {selectedInquiry ? (
              <div className="space-y-6 font-sans">
                <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Lead Source: {selectedInquiry.source}</span>
                    <h4 className="font-serif text-lg font-bold text-secondary mt-1">Lead Details</h4>
                  </div>
                  <button 
                    onClick={() => setSelectedInquiry(null)}
                    className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 cursor-pointer"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                {/* Lead Contact Info */}
                <div className="space-y-3">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Client Profile</h5>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <p className="font-bold text-secondary text-sm">{selectedInquiry.name}</p>
                    <div className="space-y-1 text-xs font-semibold text-slate-600">
                      <p>📞 Phone: <span className="text-secondary">{selectedInquiry.mobile}</span></p>
                      <p>✉️ Email: <a href={`mailto:${selectedInquiry.email}`} className="text-primary hover:underline">{selectedInquiry.email}</a></p>
                    </div>
                  </div>
                </div>

                {/* Event Banquet Parameters */}
                <div className="space-y-3">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Banquet Parameters</h5>
                  <div className="p-4 bg-amber-50/20 border border-amber-100/60 rounded-2xl space-y-2 text-xs font-semibold text-slate-700">
                    <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Event Type</span>
                        <span className="font-bold text-secondary text-sm">{selectedInquiry.eventType}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Event Date</span>
                        <span className="font-bold text-secondary text-sm">{selectedInquiry.eventDate}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Guests Count</span>
                        <span className="font-bold text-secondary text-sm">{selectedInquiry.guests} Guests</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Preferred Cuisine</span>
                        <span className="font-bold text-secondary text-sm">{selectedInquiry.preferredCuisine}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Package Chosen</span>
                        <span className="font-bold text-slate-600">{selectedInquiry.cateringPackage || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Lead Budget</span>
                        <span className="font-bold text-emerald-700 text-sm">₹{Number(selectedInquiry.budget).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="pt-1">
                      <span className="text-[10px] text-slate-400 block uppercase">Venue & City</span>
                      <span className="font-bold text-slate-700 block mt-0.5">{selectedInquiry.venueAddress}, {selectedInquiry.city}</span>
                    </div>
                  </div>
                </div>

                {/* Special Requirements */}
                <div className="space-y-3">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Client Remarks</h5>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <p className="text-xs text-slate-600 leading-relaxed font-semibold italic">
                      {selectedInquiry.specialRequirements ? `"${selectedInquiry.specialRequirements}"` : "No special requests specified."}
                    </p>
                  </div>
                </div>

                {/* Lead Status Manager */}
                <div className="space-y-3">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Manage Status</h5>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold">
                    <button
                      onClick={() => handleStatusChange(selectedInquiry.id, "Responded")}
                      className={`py-2 px-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        selectedInquiry.status === "Responded" 
                          ? "bg-emerald-500 border-emerald-500 text-white shadow-xs" 
                          : "border-slate-200 hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Responded</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedInquiry.id, "Reviewed")}
                      className={`py-2 px-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        selectedInquiry.status === "Reviewed" 
                          ? "bg-amber-500 border-amber-500 text-white shadow-xs" 
                          : "border-slate-200 hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Reviewed</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedInquiry.id, "New Inquiry")}
                      className={`py-2 px-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        selectedInquiry.status === "New Inquiry" 
                          ? "bg-blue-500 border-blue-500 text-white shadow-xs" 
                          : "border-slate-200 hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>New Inquiry</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedInquiry.id, "Cancelled")}
                      className={`py-2 px-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        selectedInquiry.status === "Cancelled" 
                          ? "bg-rose-500 border-rose-500 text-white shadow-xs" 
                          : "border-slate-200 hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center text-slate-400 space-y-3">
                <AlertCircle className="w-10 h-10 text-slate-200 mx-auto stroke-1" />
                <p className="text-xs font-bold text-secondary">No inquiry selected</p>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Click any lead in the table rows to inspect complete banquet layouts and edit statuses.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* LOGS TAB */
        /* ======================================================== */
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          {/* List Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden xl:col-span-1">
            {filteredSessions.length === 0 ? (
              <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-3">
                <MessageSquare className="w-11 h-11 text-slate-200 stroke-1" />
                <p className="text-sm font-bold">No conversation sessions logged.</p>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Start a session with the chatbot widget first!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                <div className="bg-slate-50/50 p-4 border-b border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Chat Sessions ({filteredSessions.length})</span>
                </div>
                {filteredSessions.map((sess) => (
                  <div
                    key={sess.sessionId}
                    onClick={() => setSelectedSession(sess)}
                    className={`p-4 hover:bg-slate-50/30 transition-colors cursor-pointer text-left space-y-2 ${
                      selectedSession?.sessionId === sess.sessionId ? "bg-primary/5 border-l-4 border-l-primary" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] font-mono font-bold text-slate-400">
                        {sess.sessionId.substr(0, 16)}...
                      </span>
                      {sess.bookingCreated ? (
                        <span className="bg-emerald-50 text-emerald-700 text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-md border border-emerald-100 uppercase tracking-wider">
                          Booking Created
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-500 text-[8.5px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                          Inquiry Idle
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-secondary">
                        {sess.clientName || "Anonymous Diner"}
                      </p>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                        {sess.messages.length} exchanges • Active {new Date(sess.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Conversation Transcript Panel */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm text-left xl:col-span-2 min-h-[400px] flex flex-col">
            {selectedSession ? (
              <div className="flex-grow flex flex-col space-y-4 font-sans h-full">
                {/* Header info */}
                <div className="flex items-center justify-between border-b border-slate-50 pb-4 shrink-0">
                  <div className="text-left">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-mono">Session ID: {selectedSession.sessionId}</span>
                    <h4 className="font-serif text-lg font-bold text-secondary mt-1">Chat Logs Audit</h4>
                  </div>
                  <button 
                    onClick={() => setSelectedSession(null)}
                    className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 cursor-pointer"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                {/* Message list rendering */}
                <div className="flex-grow overflow-y-auto space-y-4 max-h-[500px] bg-slate-50/30 p-4 rounded-2xl border border-slate-100">
                  {selectedSession.messages.map((m, idx) => {
                    const isUser = m.role === "user";
                    const isSystemAlert = m.content.startsWith("[System Notification:");
                    
                    if (isSystemAlert) {
                      return (
                        <div key={idx} className="text-center py-2">
                          <span className="inline-block px-3 py-1 bg-primary/10 text-[9.5px] font-extrabold text-secondary rounded-lg border border-primary/25">
                            {m.content}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div key={idx} className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border text-[9px] font-bold ${
                          isUser ? "bg-primary/15 border-primary/20 text-secondary" : "bg-secondary border-primary/20 text-primary"
                        }`}>
                          {isUser ? <User className="w-3 h-3 text-secondary" /> : <Bot className="w-3 h-3 text-primary" />}
                        </div>
                        <div className="flex flex-col gap-1 text-left">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            {isUser ? "User Client" : "Gemini AI Assistant"}
                          </span>
                          <div className={`p-3 rounded-2xl text-[12px] whitespace-pre-wrap leading-relaxed shadow-xs ${
                            isUser ? "bg-secondary text-white rounded-tr-none" : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                          }`}>
                            {m.content}
                          </div>
                          <span className={`text-[8.5px] text-slate-400 font-semibold px-1 ${isUser ? "text-right" : "text-left"}`}>
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="my-auto py-24 text-center text-slate-400 space-y-3">
                <MessageSquare className="w-12 h-12 text-slate-200 mx-auto stroke-1" />
                <p className="text-xs font-bold text-secondary">No chat session selected</p>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Click any active chat session log row on the left to review client conversation transcripts.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
