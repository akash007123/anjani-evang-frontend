import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNotifications, NotificationItem } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Search, Bell, User as UserIcon, Settings, LogOut, Menu, Globe,
  Calendar, Mail, ShoppingCart, Bot, Send, CheckCheck, X, ArrowRight 
} from 'lucide-react';

interface HeaderProps {
  title: string;
  setIsMobileOpen: (open: boolean) => void;
}

function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return 'Just now';
  const ms = new Date().getTime() - new Date(dateStr).getTime();
  const mins = Math.floor(ms / (1000 * 60));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

export default function AdminHeader({ title, setIsMobileOpen }: HeaderProps) {
  const { currentUser, logout } = useAdminAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, toast, dismissToast } = useNotifications();
  const { language, setLanguage, t } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setIsNotifDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    logout();
    navigate('/admin-login');
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    const id = notif._id || notif.id;
    if (id && !notif.readStatus) {
      await markAsRead(id);
    }
    setIsNotifDropdownOpen(false);
    navigate(notif.actionUrl || '/admin/notifications');
  };

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'booking':
        return <Calendar className="w-4 h-4 text-emerald-600" />;
      case 'contact':
        return <Mail className="w-4 h-4 text-amber-600" />;
      case 'order':
        return <ShoppingCart className="w-4 h-4 text-indigo-600" />;
      case 'chatbot':
        return <Bot className="w-4 h-4 text-purple-600" />;
      case 'newsletter':
        return <Send className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 shadow-xs">
      {/* Realtime Toast Banner */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 max-w-sm w-full bg-secondary text-white p-4 rounded-2xl shadow-2xl border border-primary/30 flex items-start gap-3 animate-slide-in">
          <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 text-primary">
            <Bell className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold font-serif text-primary truncate">{toast.title}</p>
            <p className="text-[11px] text-slate-300 font-medium font-sans mt-0.5 line-clamp-2">{toast.message}</p>
            <div className="mt-2 flex items-center gap-3">
              <button
                onClick={() => {
                  dismissToast();
                  navigate('/admin/notifications');
                }}
                className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
              >
                View Details
              </button>
              <button
                onClick={dismissToast}
                className="text-[10px] text-slate-400 hover:text-white cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button onClick={dismissToast} className="text-slate-400 hover:text-white p-1 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Page Title & Mobile Toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-1.5 text-slate-500 hover:text-secondary hover:bg-slate-50 rounded-xl lg:hidden shrink-0"
        >
          <Menu className="w-5.5 h-5.5" />
        </button>
        <h2 className="font-serif text-lg sm:text-xl font-bold text-secondary tracking-tight">
          {title}
        </h2>
      </div>

      {/* Top Bar Actions */}
      <div className="flex items-center gap-4">
        {/* Language Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold font-sans">
          <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-1" />
          <button
            onClick={() => setLanguage('EN')}
            className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
              language === 'EN' ? 'bg-primary text-secondary shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('HI')}
            className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
              language === 'HI' ? 'bg-primary text-secondary shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            HI
          </button>
        </div>

        {/* Mock Search Bar (Desktop) */}
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('searchPlaceholder') || "Search system records..."}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary text-secondary placeholder-slate-400"
          />
        </div>

        {/* Real-time Notifications Bell with Dropdown */}
        <div className="relative" ref={notifDropdownRef}>
          <button
            onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
            className="relative p-2 text-slate-500 hover:text-secondary hover:bg-slate-50 rounded-xl transition-all cursor-pointer focus:outline-none"
            title="System Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <>
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full animate-ping" />
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center bg-rose-600 text-white font-extrabold text-[9px] rounded-full border-2 border-white shadow-xs">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              </>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotifDropdownOpen && (
            <div className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-2xl bg-white border border-slate-100 shadow-2xl z-50 animate-fade-in overflow-hidden text-left">
              {/* Header */}
              <div className="p-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-sm font-bold text-secondary">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-[11px] font-bold text-primary hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 font-sans text-xs">
                    <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2 opacity-50" />
                    <p>No new notifications right now.</p>
                  </div>
                ) : (
                  notifications.slice(0, 10).map((notif) => {
                    const id = notif._id || notif.id || '';
                    return (
                      <div
                        key={id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer hover:bg-slate-50 ${
                          !notif.readStatus ? 'bg-amber-50/40 border-l-2 border-l-primary' : ''
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                          {getTypeIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center justify-between gap-1">
                            <p className={`text-xs font-serif ${!notif.readStatus ? 'font-bold text-secondary' : 'font-semibold text-slate-700'} truncate`}>
                              {notif.title}
                            </p>
                            <span className="text-[10px] text-slate-400 font-sans shrink-0">
                              {formatTimeAgo(notif.createdAt)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-sans line-clamp-2 mt-0.5">
                            {notif.message}
                          </p>
                        </div>
                        {!notif.readStatus && (
                          <div className="w-2 h-2 rounded-full bg-primary shrink-0 self-center" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                <Link
                  to="/admin/notifications"
                  onClick={() => setIsNotifDropdownOpen(false)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary hover:text-primary font-sans transition-colors"
                >
                  <span>View All Notifications</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200" />

        {/* User Account Dropdown Trigger */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 transition-all cursor-pointer focus:outline-none"
          >
            {currentUser?.profilePicture ? (
              <img
                src={currentUser.profilePicture}
                alt={currentUser.firstName}
                className="w-8.5 h-8.5 rounded-xl object-cover ring-2 ring-primary/20 shadow-sm"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8.5 h-8.5 rounded-xl bg-primary text-secondary font-bold font-sans flex items-center justify-center shadow-sm">
                {currentUser?.firstName[0] || 'A'}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold font-sans text-secondary leading-none">
                {currentUser?.firstName} {currentUser?.lastName}
              </p>
              <span className="inline-block text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-sans mt-0.5">
                {currentUser?.role || 'Admin Partner'}
              </span>
            </div>
          </button>

          {/* User Profile Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2.5 w-60 rounded-2xl bg-white border border-slate-100 shadow-xl p-2.5 space-y-1 z-50 animate-fade-in text-left">
              {/* Dropdown Header */}
              <div className="px-3.5 py-2.5 border-b border-slate-50">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-secondary font-sans">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </p>
                  <span className="text-[9px] font-bold bg-primary/20 text-secondary px-1.5 py-0.5 rounded uppercase">
                    {currentUser?.role || 'Admin'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium font-sans mt-0.5 truncate">
                  {currentUser?.email}
                </p>
              </div>

              {/* Items */}
              <Link
                to="/admin/settings"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-secondary hover:bg-slate-50 transition-all font-sans"
              >
                <UserIcon className="w-4 h-4 text-slate-400" />
                <span>My Profile</span>
              </Link>
              <Link
                to="/admin/settings"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-secondary hover:bg-slate-50 transition-all font-sans"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Console Settings</span>
              </Link>
              
              <div className="border-t border-slate-50 my-1.5" />

              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50/50 transition-all font-sans text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out Console</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
