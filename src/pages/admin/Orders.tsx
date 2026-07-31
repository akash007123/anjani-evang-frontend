import { useState, useEffect, useMemo } from 'react';
import { api } from '../../lib/api';
import { 
  Search, Eye, ShoppingBag, CheckCircle2, Clock, 
  XCircle, Filter, Trash2, ShieldCheck, RefreshCw 
} from 'lucide-react';
import { TableSkeleton } from '../../components/ui/Skeleton';
import SEO from '../../components/SEO';

export default function Orders() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getOrders();
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : res.data.orders || [];
        setOrders(list);
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
    }
    setLoading(false);
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.updateOrderStatus(id, status);
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder(prev => prev ? { ...prev, status } : null);
      }
    } catch (err) {
      console.error('Failed to update order status', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this catering order record?')) {
      try {
        await api.deleteOrder(id);
        setOrders(prev => prev.filter(o => o._id !== id));
        if (selectedOrder && selectedOrder._id === id) {
          setSelectedOrder(null);
        }
      } catch (err) {
        console.error('Failed to delete order', err);
      }
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const searchStr = searchQuery.toLowerCase();
      const matchSearch = o.customerName.toLowerCase().includes(searchStr) ||
                          o.email.toLowerCase().includes(searchStr) ||
                          (o.items?.[0]?.title || o.deliveryAddress || '').toLowerCase().includes(searchStr) ||
                          (o.orderNumber || '').toLowerCase().includes(searchStr);
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      <SEO title="Catering Orders - Admin Panel" description="Track and manage active catering orders, delivery status, and order fulfillment." urlPath="/admin/orders" />
      {/* Page Title Header */}
      <div>
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-secondary">
          Catering Orders & Financials
        </h3>
        <p className="text-xs text-slate-400 font-semibold mt-0.5 font-sans">
          Track revenue pipelines, kitchen preparation milestones, and delivery logistics.
        </p>
      </div>

      {/* Control Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer, package, or invoice..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary text-secondary placeholder-slate-400"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          {['all', 'pending', 'processing', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-secondary text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Orders Table Column */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden xl:col-span-2 p-4">
          {loading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-3 font-sans">
              <ShoppingBag className="w-12 h-12 text-slate-200 stroke-1" />
              <div>
                <p className="text-sm font-bold">No catering orders found.</p>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">Try widening search criteria or reset filters.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-5">Invoice</th>
                    <th className="py-4 px-5">Customer</th>
                    <th className="py-4 px-5">Catering Details</th>
                    <th className="py-4 px-5">Price Amount</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-secondary">
                  {filteredOrders.map((o) => (
                    <tr 
                      key={o._id} 
                      className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${
                        selectedOrder?._id === o._id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                      }`}
                      onClick={() => setSelectedOrder(o)}
                    >
                      <td className="py-4 px-5 font-bold font-mono text-slate-400">
                        {o.orderNumber || o._id}
                      </td>
                      <td className="py-4 px-5">
                        <p className="font-bold">{o.customerName}</p>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">{o.email}</span>
                      </td>
                      <td className="py-4 px-5 font-bold text-slate-600 max-w-xs truncate">
                        {o.items?.[0]?.title || o.deliveryAddress || '—'}
                      </td>
                      <td className="py-4 px-5 font-extrabold text-secondary">
                        ₹{(o.totalAmount ?? 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          o.status === 'pending' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                          o.status === 'processing' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          o.status === 'delivered' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {o.status === 'pending' && <Clock className="w-2.5 h-2.5" />}
                          {o.status === 'processing' && <RefreshCw className="w-2.5 h-2.5" />}
                          {o.status === 'delivered' && <CheckCircle2 className="w-2.5 h-2.5" />}
                          {o.status === 'cancelled' && <XCircle className="w-2.5 h-2.5" />}
                          <span>{o.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1.5">
                          <button 
                            onClick={() => setSelectedOrder(o)}
                            className="p-2 border border-slate-100 hover:bg-slate-50 rounded-xl text-slate-500 cursor-pointer"
                            title="Inspect Order Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(o._id)}
                            className="p-2 border border-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                            title="Delete Record"
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

        {/* Detail Panel */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm text-left">
          {selectedOrder ? (
            <div className="space-y-6 animate-fade-in font-sans">
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Invoice: {selectedOrder.orderNumber || selectedOrder._id}</span>
                  <h4 className="font-serif text-lg font-bold text-secondary mt-1">Catering Order Panel</h4>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 rounded-lg hover:bg-slate-50 text-slate-400"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Order Info */}
              <div className="space-y-3">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer & Bill Info</h5>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div>
                    <p className="font-bold text-secondary text-sm">{selectedOrder.customerName}</p>
                    <p className="text-xs text-primary font-semibold underline mt-0.5">
                      <a href={`mailto:${selectedOrder.email}`}>{selectedOrder.email}</a>
                    </p>
                  </div>
                  <div className="border-t border-slate-200/50 pt-2.5 flex justify-between text-xs font-bold text-slate-600">
                    <span>Order Date:</span>
                    <span>{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>Catering Pack:</span>
                    <span className="text-slate-800 text-right max-w-[120px] truncate">{selectedOrder.items?.[0]?.title || selectedOrder.deliveryAddress || '—'}</span>
                  </div>
                  <div className="flex justify-between text-xs font-extrabold text-secondary border-t border-dashed border-slate-200 pt-2.5">
                    <span>Total Amount:</span>
                    <span className="text-primary text-sm font-sans font-extrabold">₹{(selectedOrder.totalAmount ?? 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {selectedOrder.paymentStatus === 'Paid' && (
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                <div className="text-left font-sans text-xs">
                  <p className="font-bold text-emerald-800">Secure Payment Captured</p>
                  <p className="text-emerald-600 font-semibold mt-0.5">The invoice holds a guaranteed clearance badge.</p>
                </div>
              </div>
              )}

              {/* Status Update Dropdown */}
              <div className="space-y-3">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Configure Preparation Status</h5>
                <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold">
                  <button
                    onClick={() => handleStatusChange(selectedOrder._id, 'pending')}
                    className={`py-2 px-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      selectedOrder.status === 'pending' 
                        ? 'bg-slate-600 border-slate-600 text-white font-bold shadow-xs' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Pending</span>
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedOrder._id, 'processing')}
                    className={`py-2 px-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      selectedOrder.status === 'processing' 
                        ? 'bg-amber-500 border-amber-500 text-white font-bold shadow-xs' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Processing</span>
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedOrder._id, 'delivered')}
                    className={`py-2 px-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      selectedOrder.status === 'delivered' 
                        ? 'bg-blue-500 border-blue-500 text-white font-bold shadow-xs' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Delivered</span>
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedOrder._id, 'cancelled')}
                    className={`py-2 px-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      selectedOrder.status === 'cancelled' 
                        ? 'bg-rose-500 border-rose-500 text-white font-bold shadow-xs' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel Order</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-slate-400 space-y-3.5">
              <ShoppingBag className="w-10 h-10 text-slate-200 mx-auto stroke-1" />
              <div className="font-sans">
                <p className="text-xs font-bold text-secondary">No order selected</p>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Click any order in the ledger list to analyze financial records and kitchen status.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
