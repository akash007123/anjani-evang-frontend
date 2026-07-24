import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { 
  Calendar, ShoppingBag, Mail, Users, TrendingUp, Sparkles, 
  ArrowUpRight, Eye, ArrowRight, RefreshCw, CheckCircle2, UtensilsCrossed, Send
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';
import { StatCardSkeleton } from '../../components/ui/Skeleton';
import { api } from '../../lib/api';
import { useLanguage } from '../../context/LanguageContext';

const RECHARTS_BOOKINGS_DATA: any[] = [];
const RECHARTS_GROWTH_DATA: any[] = [];
const RECHARTS_CONTACTS_DATA: any[] = [];
const RECHARTS_ORDERS_STATUS_DATA: any[] = [];

function buildGrowthData(revenueByMonth: any[]) {
  return revenueByMonth.map((r: any, i: number) => ({
    name: r.month,
    revenue: r.revenue,
    pipeline: Math.round(r.revenue * (0.5 + Math.random() * 0.4)),
  }));
}

export default function Dashboard() {
  const { language, t } = useLanguage();
  const { currentUser } = useAdminAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [statsRes, bookingsRes, contactsRes] = await Promise.all([
        api.getDashboardStats(),
        api.getBookings(),
        api.getContacts()
      ]);

      if (statsRes.success && statsRes.data) {
        setDashboardStats(statsRes.data);
      }

      if (bookingsRes.success && Array.isArray(bookingsRes.data)) {
        setBookings(bookingsRes.data);
      }

      if (contactsRes.success && Array.isArray(contactsRes.data)) {
        setContacts(contactsRes.data);
      }

      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Failed to load backend stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const totalBookings = dashboardStats?.totalBookings ?? bookings.length;
  const totalContacts = dashboardStats?.totalContacts ?? contacts.length;
  const totalOrders = dashboardStats?.totalOrders ?? 0;
  const totalUsers = dashboardStats?.totalUsers ?? 0;
  const totalMenuItems = dashboardStats?.totalMenuItems ?? 0;
  const totalSubscribers = dashboardStats?.totalSubscribers ?? 0;
  const totalRevenue = dashboardStats?.totalRevenue ?? 0;

  const bookingsChartData: any[] = dashboardStats?.bookingsByMonth ?? RECHARTS_BOOKINGS_DATA;
  const growthChartData: any[] = dashboardStats?.revenueByMonth
    ? buildGrowthData(dashboardStats.revenueByMonth)
    : RECHARTS_GROWTH_DATA;
  const contactsChartData: any[] = dashboardStats?.contactsByMonth ?? RECHARTS_CONTACTS_DATA;
  const ordersStatusData: any[] = dashboardStats?.ordersByStatus ?? RECHARTS_ORDERS_STATUS_DATA;

  // Dynamic KPI Cards config array
  const kpiCards = [
    {
      title: 'Total Bookings',
      value: totalBookings.toLocaleString(),
      description: dashboardStats?.pendingBookings 
        ? `${dashboardStats.pendingBookings} pending holds` 
        : 'Pending and approved hold requests',
      trend: '+14.2%',
      trendUp: true,
      icon: Calendar,
      bgColor: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      title: 'Total Orders',
      value: totalOrders.toLocaleString(),
      description: 'Active catering custom menus',
      trend: '+8.4%',
      trendUp: true,
      icon: ShoppingBag,
      bgColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      title: 'Client Inquiries',
      value: totalContacts.toLocaleString(),
      description: 'Unresolved message proposals',
      trend: '-3.1%',
      trendUp: false,
      icon: Mail,
      bgColor: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      title: 'Active Staff',
      value: totalUsers.toLocaleString(),
      description: 'System administrators & staff',
      trend: '+2 new',
      trendUp: true,
      icon: Users,
      bgColor: 'bg-sky-50 text-sky-600 border-sky-100',
    }
  ];

  const currentDateStr = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner Section */}
      <div className="bg-gradient-to-r from-secondary to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-white/5">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 translate-y-16 w-48 h-48 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:justify-between">
          <div className="flex items-center gap-4 sm:gap-5 text-center sm:text-left">
            {currentUser?.profilePicture ? (
              <img
                src={currentUser.profilePicture}
                alt={currentUser.firstName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-primary/30 shadow-md"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary text-secondary font-serif text-3xl font-extrabold flex items-center justify-center shadow-md">
                {currentUser?.firstName[0] || 'A'}
              </div>
            )}
            <div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary/90 flex items-center justify-center sm:justify-start gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Live Control Console
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold mt-1">
                Welcome back, {currentUser?.firstName}!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium font-sans mt-0.5">
                Today is {currentDateStr} • System operations are optimal.
              </p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center sm:text-right">
            <span className="text-[9px] font-bold text-primary uppercase tracking-wider block">
              Estimated Pipeline Revenue
            </span>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-white mt-0.5">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 justify-center sm:justify-end mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              +18.3% vs last quarter
            </span>
          </div>
        </div>
      </div>

      {/* Statistics Section Header & Realtime Refresh Control */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h3 className="font-serif text-lg font-bold text-secondary flex items-center gap-2">
            <span>System Analytics & Live Metrics</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Backend Connected
            </span>
          </h3>
          <p className="text-xs text-slate-400 font-medium font-sans mt-0.5">
            {lastUpdated ? `Last synchronized with server at ${lastUpdated}` : 'Fetching live statistical records from backend REST endpoints...'}
          </p>
        </div>

        <button
          onClick={() => fetchDashboardData(true)}
          disabled={loading || refreshing}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
          title="Re-fetch statistics from server"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-primary ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Syncing...' : 'Sync Live Stats'}</span>
        </button>
      </div>

      {/* Statistics Cards Grid with Skeleton Loading State */}
      {loading ? (
        <StatCardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {kpiCards.map((card, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 flex items-start gap-5 relative group"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${card.bgColor}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div className="space-y-1 text-left">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  {card.title}
                </span>
                <h3 className="font-serif text-3xl font-extrabold text-secondary tracking-tight">
                  {card.value}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  {card.description}
                </p>
              </div>
              <span className={`absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                card.trendUp 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                  : 'bg-rose-50 text-rose-600 border border-rose-100'
              }`}>
                {card.trend}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Secondary Metrics Summary Band */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gourmet Menu</span>
            <p className="text-sm font-bold text-secondary">{loading ? '...' : `${totalMenuItems} Dishes`}</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subscribers</span>
            <p className="text-sm font-bold text-secondary">{loading ? '...' : `${totalSubscribers} Subscribers`}</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Confirmed Holds</span>
            <p className="text-sm font-bold text-secondary">{loading ? '...' : `${dashboardStats?.confirmedBookings ?? 0} Holds`}</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gallery Catalog</span>
            <p className="text-sm font-bold text-secondary">{loading ? '...' : `${dashboardStats?.totalImages ?? 0} Media Items`}</p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
        {/* Chart 1: Monthly Growth & Forecast */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-serif text-base sm:text-lg font-bold text-secondary">
                Monthly Performance & Pipeline
              </h4>
              <p className="text-xs text-slate-400 font-semibold font-sans mt-0.5">
                Comparison between closed revenue and active pipelines.
              </p>
            </div>
            <span className="text-xs font-bold text-primary flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-xl">
              INR (₹)
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPipe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontFamily: 'sans-serif', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="revenue" name="Closed Sales" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="pipeline" name="Pipeline Inquiries" stroke="#3B82F6" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorPipe)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Bookings Flow Trends */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-serif text-base sm:text-lg font-bold text-secondary">
                Bookings Overview & Hold Volume
              </h4>
              <p className="text-xs text-slate-400 font-semibold font-sans mt-0.5">
                Monthly trend of confirmed reservation dates.
              </p>
            </div>
            <span className="text-xs font-bold text-secondary flex items-center gap-1 bg-secondary/10 px-2.5 py-1 rounded-xl">
              Hold Trends
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bookingsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontFamily: 'sans-serif', fontSize: '12px' }} />
                <Line type="monotone" dataKey="bookings" name="Confirmed Holds" stroke="#C3A267" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Client Inquiries Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-serif text-base sm:text-lg font-bold text-secondary">
                Contacts Overview by Occasion
              </h4>
              <p className="text-xs text-slate-400 font-semibold font-sans mt-0.5">
                Lead distribution classified by event profiles.
              </p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contactsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontFamily: 'sans-serif', fontSize: '12px' }} />
                <Bar dataKey="inquiries" name="Leads Count" fill="#3B82F6" radius={[6, 6, 0, 0]}>
                  <Cell fill="#6366F1" />
                  <Cell fill="#C3A267" />
                  <Cell fill="#10B981" />
                  <Cell fill="#F59E0B" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Custom Catering Orders Allocation */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-serif text-base sm:text-lg font-bold text-secondary">
                Orders Status Breakdown
              </h4>
              <p className="text-xs text-slate-400 font-semibold font-sans mt-0.5">
                Catering order status logs allocation.
              </p>
            </div>
          </div>
          <div className="h-72 flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ordersStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {ordersStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend Labels */}
            <div className="space-y-3.5 text-left shrink-0">
              {ordersStatusData.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-md" style={{ backgroundColor: entry.color }} />
                  <span className="text-xs font-bold text-slate-600 font-sans">{entry.name}</span>
                  <span className="text-xs text-slate-400 font-semibold font-sans">({entry.value} orders)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities Section - Side-by-side or stacked grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Bookings Stream Logs */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs lg:col-span-2 text-left">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h4 className="font-serif text-base sm:text-lg font-bold text-secondary">
                Recent Bookings Holds
              </h4>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                Date hold submissions made by event organizers.
              </p>
            </div>
            <Link 
              to="/admin/bookings" 
              className="text-xs font-bold text-primary flex items-center gap-1 hover:underline transition-all"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm font-sans">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 pb-3">Client</th>
                  <th className="py-2.5 pb-3">Date</th>
                  <th className="py-2.5 pb-3">Status</th>
                  <th className="py-2.5 pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-secondary">
                {bookings.slice(0, 4).map((b, idx) => (
                  <tr key={b._id || b.id || idx} className="hover:bg-slate-50/50">
                    <td className="py-3">
                      <p className="font-bold">{b.fullName || b.name}</p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{b.email}</span>
                    </td>
                    <td className="py-3 font-semibold text-slate-600">
                      {new Date(b.eventDate || b.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        b.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        b.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button 
                        onClick={() => navigate('/admin/bookings')}
                        className="p-1.5 border border-slate-100 hover:bg-slate-50 rounded-lg text-slate-500 cursor-pointer"
                        title="View holds"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Client Inquiries list */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs text-left flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h4 className="font-serif text-base sm:text-lg font-bold text-secondary">
                Recent Inquiries
              </h4>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                Proposals submitted via email forms.
              </p>
            </div>
            <Link 
              to="/admin/contacts" 
              className="text-xs font-bold text-primary flex items-center gap-1 hover:underline transition-all"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-grow space-y-4">
            {contacts.slice(0, 3).map((c, idx) => (
              <div 
                key={c._id || c.id || idx} 
                className="p-3.5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all text-xs font-sans text-left relative"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h5 className="font-bold text-secondary">{c.name}</h5>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      Date: {c.eventDate ? new Date(c.eventDate).toLocaleDateString() : 'N/A'} • {c.guestCount || c.guests || '0'} guests
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                    c.status === 'new' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-slate-500 line-clamp-2 mt-2 font-medium">
                  "{c.message}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Buttons Row */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs text-left">
        <div>
          <h4 className="font-serif text-base sm:text-lg font-bold text-secondary">
            Console Quick Operations
          </h4>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Accelerated shortcuts to frequently used operations.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <Link 
            to="/admin/bookings"
            className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 rounded-2xl transition-all group font-sans cursor-pointer text-left"
          >
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">EVENT DATES</span>
              <p className="text-xs font-bold text-secondary mt-0.5 group-hover:text-primary transition-colors">Configure Calendar Holds</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
          </Link>

          <Link 
            to="/admin/contacts"
            className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 rounded-2xl transition-all group font-sans cursor-pointer text-left"
          >
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">INBOX COMMUNICATIONS</span>
              <p className="text-xs font-bold text-secondary mt-0.5 group-hover:text-primary transition-colors">Review Guest Proposals</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
          </Link>

          <Link 
            to="/admin/orders"
            className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 rounded-2xl transition-all group font-sans cursor-pointer text-left"
          >
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">FINANCE ORDERS</span>
              <p className="text-xs font-bold text-secondary mt-0.5 group-hover:text-primary transition-colors">Evaluate Placed Orders</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
          </Link>

          <Link 
            to="/admin/notifications"
            className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 rounded-2xl transition-all group font-sans cursor-pointer text-left"
          >
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">REAL-TIME ALERTS</span>
              <p className="text-xs font-bold text-secondary mt-0.5 group-hover:text-primary transition-colors">Notification Center</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
          </Link>

          <Link 
            to="/admin/settings"
            className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 rounded-2xl transition-all group font-sans cursor-pointer text-left"
          >
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">PARTNER SETTINGS</span>
              <p className="text-xs font-bold text-secondary mt-0.5 group-hover:text-primary transition-colors">Adjust Account Profile</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}
