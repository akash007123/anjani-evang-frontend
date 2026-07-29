import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, Users, Mail, Calendar, ShoppingBag, 
  FileText, MessageSquare, UtensilsCrossed, Package, Send, Image as ImageIcon, Settings, 
  ChevronLeft, ChevronRight, X, Sparkles, ShieldCheck, Bell, Briefcase
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { AdminRole } from '../../types/admin';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

interface NavItem {
  key: string;
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: (AdminRole | string)[];
}

export default function AdminSidebar({ 
  isCollapsed, 
  setIsCollapsed, 
  isMobileOpen, 
  setIsMobileOpen 
}: SidebarProps) {
  const { currentUser, hasRole } = useAdminAuth();
  const { unreadCount } = useNotifications();
  const { t } = useLanguage();

  const navItems: NavItem[] = [
    { key: 'admin:dashboard', name: t('admin:dashboard'), path: '/admin/dashboard', icon: LayoutDashboard, roles: ['Super Admin', 'Admin', 'Manager', 'Employee'] },
    { key: 'admin:notifications', name: t('admin:notifications'), path: '/admin/notifications', icon: Bell, roles: ['Super Admin', 'Admin', 'Manager'] },
    { key: 'admin:users', name: t('admin:users'), path: '/admin/users', icon: Users, roles: ['Super Admin', 'Admin'] },
    { key: 'admin:contacts', name: t('admin:contacts'), path: '/admin/contacts', icon: Mail, roles: ['Super Admin', 'Admin', 'Manager', 'Employee'] },
    { key: 'admin:bookings', name: t('admin:bookings'), path: '/admin/bookings', icon: Calendar, roles: ['Super Admin', 'Admin', 'Manager'] },
    { key: 'admin:orders', name: t('admin:orders'), path: '/admin/orders', icon: ShoppingBag, roles: ['Super Admin', 'Admin', 'Manager', 'Employee'] },
    { key: 'admin:blogs', name: t('admin:blogs'), path: '/admin/blogs', icon: FileText, roles: ['Super Admin', 'Admin'] },
    { key: 'admin:comments', name: t('admin:comments'), path: '/admin/comments', icon: MessageSquare, roles: ['Super Admin', 'Admin'] },
    { key: 'admin:services', name: t('admin:services'), path: '/admin/services', icon: Briefcase, roles: ['Super Admin', 'Admin', 'Manager'] },
    { key: 'admin:menu', name: t('admin:menu'), path: '/admin/menu', icon: UtensilsCrossed, roles: ['Super Admin', 'Admin', 'Manager'] },
    { key: 'admin:packages', name: t('admin:packages'), path: '/admin/packages', icon: Package, roles: ['Super Admin', 'Admin', 'Manager'] },
    { key: 'admin:newsletter', name: t('admin:newsletter'), path: '/admin/newsletter', icon: Send, roles: ['Super Admin', 'Admin'] },
    { key: 'admin:gallery', name: t('admin:gallery'), path: '/admin/gallery', icon: ImageIcon, roles: ['Super Admin', 'Admin'] },
    { key: 'admin:settings', name: t('admin:settings'), path: '/admin/settings', icon: Settings, roles: ['Super Admin', 'Admin'] },
    { key: 'chatbot:headerTitle', name: t('chatbot:headerTitle'), path: '/admin/ai-bookings', icon: Sparkles, roles: ['Super Admin', 'Admin', 'Manager'] },
  ];

  const visibleNavItems = navItems.filter((item) => hasRole(item.roles));

  const sidebarContent = (
    <div className="flex flex-col h-full bg-secondary text-white relative">
      {/* Sidebar Header / Brand Logo */}
      <div className="p-5 flex items-center justify-between border-b border-white/10">
        <NavLink to="/admin/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-secondary shadow-md shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-left"
            >
              <h1 className="font-serif text-lg font-bold tracking-tight text-white leading-none">
                Anjani
              </h1>
              <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-primary">
                Admin Console
              </span>
            </motion.div>
          )}
        </NavLink>

        {/* Mobile Close Button */}
        {isMobileOpen && (
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="p-1 text-white/70 hover:text-white lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Role Badge Header info */}
      {(!isCollapsed || isMobileOpen) && currentUser && (
        <div className="px-4 py-2.5 mx-3 mt-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
          <div className="text-left overflow-hidden">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider leading-none">Role Authorization</p>
            <p className="text-xs font-bold text-primary truncate mt-0.5">{currentUser.role || 'Admin Partner'}</p>
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => setIsMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-xs sm:text-sm font-semibold transition-all group relative cursor-pointer ${
                isActive 
                  ? 'bg-primary text-secondary font-bold shadow-sm' 
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-secondary' : 'text-white/60 group-hover:text-white'
                }`} />
                {(!isCollapsed || isMobileOpen) && (
                  <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="font-sans truncate flex-1 flex items-center justify-between"
                  >
                    <span>{item.name}</span>
                    {item.name === 'Notifications' && unreadCount > 0 && (
                      <span className={`ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                        isActive ? 'bg-secondary text-primary' : 'bg-rose-500 text-white'
                      }`}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </motion.span>
                )}

                {/* Tooltip on Collapsed Hover */}
                {isCollapsed && !isMobileOpen && (
                  <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-secondary text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-md font-sans border border-white/10 z-50 whitespace-nowrap">
                    {item.name}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer - Collapsible button (Desktop only) */}
      <div className="p-4 border-t border-white/10 hidden lg:block">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : (
            <div className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs font-bold font-sans">Collapse Menu</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Layout */}
      <aside 
        className={`fixed inset-y-0 left-0 hidden lg:block border-r border-slate-200 bg-secondary transition-all duration-300 z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Overlay and Menu Panel) */}
      <div className="lg:hidden">
        {isMobileOpen && (
          <div 
            className="fixed inset-0 bg-secondary/45 backdrop-blur-xs z-40"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
        <div 
          className={`fixed inset-y-0 left-0 w-64 bg-secondary z-50 transform transition-transform duration-300 ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </div>
      </div>
    </>
  );
}
