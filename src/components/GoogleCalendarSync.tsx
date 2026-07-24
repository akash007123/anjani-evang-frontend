import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  ExternalLink,
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck,
  CalendarDays
} from 'lucide-react';
import {
  googleSignIn,
  logoutCalendar,
  fetchGoogleCalendarEvents,
  createGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  getAccessToken,
  initCalendarAuth,
  GoogleCalendarEvent
} from '../services/googleCalendar';
import { User } from 'firebase/auth';

interface GoogleCalendarSyncProps {
  initialBookingData?: {
    summary: string;
    description?: string;
    location?: string;
    eventDate?: string;
    eventTime?: string;
  };
  onEventCreated?: (event: GoogleCalendarEvent) => void;
  className?: string;
}

export default function GoogleCalendarSync({
  initialBookingData,
  onEventCreated,
  className = ''
}: GoogleCalendarSyncProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Event Creation Form state
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [title, setTitle] = useState(initialBookingData?.summary || '');
  const [description, setDescription] = useState(initialBookingData?.description || '');
  const [location, setLocation] = useState(initialBookingData?.location || '');
  
  // Default start date time
  const defaultDate = initialBookingData?.eventDate || new Date().toISOString().split('T')[0];
  const defaultTime = initialBookingData?.eventTime || '12:00';
  const [startDateStr, setStartDateStr] = useState(defaultDate);
  const [startTimeStr, setStartTimeStr] = useState(defaultTime);
  const [durationHours, setDurationHours] = useState<number>(3);

  // Delete Confirmation state (Mandatory safeguard before deletion)
  const [eventToDelete, setEventToDelete] = useState<GoogleCalendarEvent | null>(null);

  useEffect(() => {
    const unsubscribe = initCalendarAuth(
      (user) => {
        setCurrentUser(user);
        setIsConnected(true);
        loadEvents();
      },
      () => {
        setCurrentUser(null);
        setIsConnected(false);
        setEvents([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const loadEvents = async () => {
    if (!getAccessToken()) return;
    setLoading(true);
    setError(null);
    try {
      const now = new Date();
      // Fetch events from beginning of current month to 3 months in future
      const minDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const maxDate = new Date(now.getFullYear(), now.getMonth() + 3, 1).toISOString();
      
      const eventList = await fetchGoogleCalendarEvents(minDate, maxDate);
      setEvents(eventList);
    } catch (err: any) {
      console.error('Error loading Google Calendar events:', err);
      setError(err.message || 'Failed to fetch Google Calendar events.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setIsConnected(true);
        setSuccessMsg('Successfully connected to Google Calendar!');
        setTimeout(() => setSuccessMsg(null), 4000);
        await loadEvents();
      }
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      setError(err.message || 'Google Calendar connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await logoutCalendar();
      setCurrentUser(null);
      setIsConnected(false);
      setEvents([]);
      setSuccessMsg('Disconnected from Google Calendar.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect.');
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDateStr) return;

    setLoading(true);
    setError(null);

    try {
      const startDateTime = new Date(`${startDateStr}T${startTimeStr}:00`);
      const endDateTime = new Date(startDateTime.getTime() + durationHours * 60 * 60 * 1000);

      const newEvent: GoogleCalendarEvent = {
        summary: title,
        description: description || undefined,
        location: location || undefined,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };

      const created = await createGoogleCalendarEvent(newEvent);
      setSuccessMsg(`Event "${created.summary}" added to your Google Calendar!`);
      setTimeout(() => setSuccessMsg(null), 4000);

      if (onEventCreated) {
        onEventCreated(created);
      }

      setShowAddForm(false);
      setTitle('');
      setDescription('');
      setLocation('');
      await loadEvents();
    } catch (err: any) {
      console.error('Create Google Calendar event error:', err);
      setError(err.message || 'Failed to create Google Calendar event.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete?.id) return;
    setLoading(true);
    setError(null);
    try {
      await deleteGoogleCalendarEvent(eventToDelete.id);
      setSuccessMsg(`Event "${eventToDelete.summary}" removed from Google Calendar.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      setEventToDelete(null);
      await loadEvents();
    } catch (err: any) {
      console.error('Delete Google Calendar event error:', err);
      setError(err.message || 'Failed to delete event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-6 sm:p-8 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-secondary flex items-center gap-2">
              <span>Google Calendar Integration</span>
              {isConnected && (
                <span className="inline-flex items-center gap-1 text-[10px] font-sans font-bold bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> Connected
                </span>
              )}
            </h3>
            <p className="font-sans text-xs text-slate-500 mt-0.5">
              Sync catering reservations & schedule consults directly with your Google account.
            </p>
          </div>
        </div>

        {isConnected ? (
          <div className="flex items-center gap-3">
            {currentUser && (
              <div className="hidden md:flex items-center gap-2 text-xs font-sans text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                {currentUser.photoURL && (
                  <img src={currentUser.photoURL} alt="User avatar" className="w-5 h-5 rounded-full" />
                )}
                <span className="font-medium truncate max-w-[150px]">{currentUser.email}</span>
              </div>
            )}
            <button
              onClick={handleDisconnect}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Disconnect</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-sans font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z"
                />
              </svg>
            )}
            <span>Connect Google Calendar</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-500 font-bold hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Content Area */}
      {!isConnected ? (
        <div className="bg-slate-50/60 rounded-2xl p-8 border border-slate-100 text-center flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-sm">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="max-w-md">
            <h4 className="font-serif text-lg font-bold text-secondary">Sync Events with Google Calendar</h4>
            <p className="font-sans text-xs text-slate-500 mt-1 leading-relaxed">
              Connect your Google account to automatically add catering reservations, consults, and menu tasting sessions directly to your personal Google Calendar.
            </p>
          </div>
          <button
            onClick={handleConnect}
            disabled={loading}
            className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-secondary hover:bg-secondary/90 text-white font-sans font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <CalendarIcon className="w-4 h-4 text-primary" />
            <span>Sign In & Sync Google Calendar</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Clock className="w-4 h-4 text-primary" />
              <span>{events.length} Events Synced</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadEvents}
                disabled={loading}
                className="p-2 bg-white hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                title="Refresh Events"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-secondary font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{showAddForm ? 'Close Form' : 'Add Calendar Event'}</span>
              </button>
            </div>
          </div>

          {/* Add Event Form Modal / Expandable Box */}
          {showAddForm && (
            <form onSubmit={handleCreateEvent} className="bg-blue-50/40 p-6 rounded-2xl border border-blue-100 space-y-4 animate-fade-in">
              <h4 className="font-serif text-base font-bold text-secondary flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                <span>Create New Google Calendar Event</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Buffet Catering Reservation - Ananya Roy"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500 text-secondary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDateStr}
                    onChange={(e) => setStartDateStr(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500 text-secondary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTimeStr}
                    onChange={(e) => setStartTimeStr(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500 text-secondary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Duration (Hours)
                  </label>
                  <select
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500 text-secondary"
                  >
                    <option value={1}>1 Hour (Tasting / Consultation)</option>
                    <option value={2}>2 Hours</option>
                    <option value={3}>3 Hours (Standard Party)</option>
                    <option value={5}>5 Hours (Grand Reception / Wedding)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Venue Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Grand Lotus Banquet, Mumbai"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500 text-secondary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Description / Menu Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Guest count, multi-cuisine selections, contact numbers..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500 text-secondary resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-sans font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Add to Google Calendar</span>
                </button>
              </div>
            </form>
          )}

          {/* Events List */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-secondary uppercase tracking-wider flex items-center justify-between">
              <span>Upcoming Google Calendar Schedule</span>
              <span className="text-[11px] text-slate-400 font-sans font-normal">Primary Calendar</span>
            </h4>

            {loading && events.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                <span>Loading Google Calendar events...</span>
              </div>
            ) : events.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-2xl text-center text-slate-500 text-xs border border-slate-100">
                No upcoming events found on your Google Calendar. Click "Add Calendar Event" above to create one.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/40">
                {events.slice(0, 10).map((evt) => {
                  const startDate = evt.start?.dateTime ? new Date(evt.start.dateTime) : evt.start?.date ? new Date(evt.start.date) : null;
                  const dateFormatted = startDate ? startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'All Day';
                  const timeFormatted = evt.start?.dateTime ? new Date(evt.start.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'All Day';

                  return (
                    <div key={evt.id || Math.random()} className="p-4 hover:bg-white transition-colors flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-sm text-secondary">{evt.summary}</span>
                          {evt.htmlLink && (
                            <a
                              href={evt.htmlLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-blue-600 transition-colors"
                              title="Open in Google Calendar"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-sans">
                          <span className="flex items-center gap-1 font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                            <Clock className="w-3 h-3" />
                            {dateFormatted} • {timeFormatted}
                          </span>

                          {evt.location && (
                            <span className="flex items-center gap-1 text-slate-600">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[200px]">{evt.location}</span>
                            </span>
                          )}
                        </div>

                        {evt.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                            {evt.description}
                          </p>
                        )}
                      </div>

                      {/* Explicit Delete Button */}
                      <button
                        onClick={() => setEventToDelete(evt)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
                        title="Delete from Google Calendar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Explicit Confirmation Dialog before deleting an event */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-serif text-lg font-bold text-secondary">Remove Event from Google Calendar?</h4>
              <p className="font-sans text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-secondary">"{eventToDelete.summary}"</strong> from your Google Calendar?
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <div><strong>Summary:</strong> {eventToDelete.summary}</div>
              {eventToDelete.start?.dateTime && (
                <div><strong>Start:</strong> {new Date(eventToDelete.start.dateTime).toLocaleString()}</div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setEventToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteEvent}
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-sans font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-blue-600" />
        <span>Authenticated via Google OAuth 2.0 with minimal calendar permissions.</span>
      </div>
    </div>
  );
}
