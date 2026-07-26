/**
 * Anjani Catering & Events Enterprise API Client
 * Centralized Service layer connecting Frontend to Backend REST Endpoints
 */

const BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

function buildQueryString(params?: Record<string, any>): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      searchParams.append(key, String(val));
    }
  });
  const str = searchParams.toString();
  return str ? `?${str}` : '';
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: string }> {
  const token = localStorage.getItem('eveng_admin_token') || sessionStorage.getItem('eveng_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        error: json.message || json.error || `HTTP error! status: ${res.status}`,
      };
    }

    return {
      success: true,
      data: json.data !== undefined ? json.data : json,
      message: json.message,
    };
  } catch (err: any) {
    console.error(`[API Client Error] ${endpoint}:`, err);
    return {
      success: false,
      error: err.message || 'Network communication error',
    };
  }
}

export const api = {
  // Auth
  login: (credentials: { emailOrMobile: string; password: string }) =>
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  
  register: (userData: any) =>
    apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  
  getMe: () =>
    apiRequest('/auth/me'),

  // Contact
  submitContact: (payload: any) =>
    apiRequest('/contacts', { method: 'POST', body: JSON.stringify(payload) }),
  
  getContacts: () =>
    apiRequest('/contacts'),

  // Booking
  createBooking: (payload: any) =>
    apiRequest('/bookings', { method: 'POST', body: JSON.stringify(payload) }),
  
  getBookings: (params?: Record<string, any>) =>
    apiRequest(`/bookings${buildQueryString(params)}`),

  getBookingById: (id: string) =>
    apiRequest(`/bookings/${id}`),

  updateBooking: (id: string, payload: any) =>
    apiRequest(`/bookings/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  updateBookingStatus: (id: string, status: string, notes?: string) =>
    apiRequest(`/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, notes }) }),

  deleteBooking: (id: string) =>
    apiRequest(`/bookings/${id}`, { method: 'DELETE' }),

  // Blogs Management
  getBlogs: (params?: Record<string, any>) =>
    apiRequest(`/blogs${buildQueryString(params)}`),

  getBlogById: (id: string) =>
    apiRequest(`/blogs/id/${id}`),

  getBlogBySlug: (slug: string) =>
    apiRequest(`/blogs/${slug}`),

  createBlog: (payload: any) =>
    apiRequest('/blogs', { method: 'POST', body: JSON.stringify(payload) }),

  updateBlog: (id: string, payload: any) =>
    apiRequest(`/blogs/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  deleteBlog: (id: string) =>
    apiRequest(`/blogs/${id}`, { method: 'DELETE' }),

  // Menu Management
  getMenuItems: (params?: Record<string, any>) =>
    apiRequest(`/menu${buildQueryString(params)}`),

  getMenuItemById: (id: string) =>
    apiRequest(`/menu/${id}`),

  createMenuItem: (payload: any) =>
    apiRequest('/menu', { method: 'POST', body: JSON.stringify(payload) }),

  updateMenuItem: (id: string, payload: any) =>
    apiRequest(`/menu/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  deleteMenuItem: (id: string) =>
    apiRequest(`/menu/${id}`, { method: 'DELETE' }),

  // Packages Management
  getPackages: (params?: Record<string, any>) =>
    apiRequest(`/packages${buildQueryString(params)}`),

  getPackageById: (id: string) =>
    apiRequest(`/packages/${id}`),

  createPackage: (payload: any) =>
    apiRequest('/packages', { method: 'POST', body: JSON.stringify(payload) }),

  updatePackage: (id: string, payload: any) =>
    apiRequest(`/packages/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  deletePackage: (id: string) =>
    apiRequest(`/packages/${id}`, { method: 'DELETE' }),

  // Newsletter Management
  subscribeNewsletter: (email: string, source?: string) =>
    apiRequest('/newsletter/subscribe', { method: 'POST', body: JSON.stringify({ email, source }) }),

  getNewsletterSubscribers: (params?: Record<string, any>) =>
    apiRequest(`/newsletter${buildQueryString(params)}`),

  updateSubscriberStatus: (id: string, status: string) =>
    apiRequest(`/newsletter/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  deleteSubscriber: (id: string) =>
    apiRequest(`/newsletter/${id}`, { method: 'DELETE' }),

  bulkDeleteSubscribers: (ids: string[]) =>
    apiRequest('/newsletter/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) }),

  // Users Management
  getUsers: (params?: Record<string, any>) =>
    apiRequest(`/users${buildQueryString(params)}`),

  getUserById: (id: string) =>
    apiRequest(`/users/${id}`),

  createUser: (payload: any) =>
    apiRequest('/users', { method: 'POST', body: JSON.stringify(payload) }),

  updateUser: (id: string, payload: any) =>
    apiRequest(`/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  deleteUser: (id: string) =>
    apiRequest(`/users/${id}`, { method: 'DELETE' }),

  resetUserPassword: (id: string, newPassword: string) =>
    apiRequest(`/users/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ newPassword }) }),

  toggleUserStatus: (id: string, status: string) =>
    apiRequest(`/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Gallery Management
  getGalleryItems: (params?: Record<string, any>) =>
    apiRequest(`/gallery${buildQueryString(params)}`),

  createGalleryItem: (payload: any) =>
    apiRequest('/gallery', { method: 'POST', body: JSON.stringify(payload) }),

  updateGalleryItem: (id: string, payload: any) =>
    apiRequest(`/gallery/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  deleteGalleryItem: (id: string) =>
    apiRequest(`/gallery/${id}`, { method: 'DELETE' }),

  // File Upload
  uploadMedia: (payload: any) =>
    apiRequest('/upload', { method: 'POST', body: JSON.stringify(payload) }),

  // Chat
  sendChatMessage: (message: string, sessionId?: string) =>
    apiRequest('/chat/query', { method: 'POST', body: JSON.stringify({ message, sessionId }) }),
  
  submitChatBooking: (payload: any) =>
    apiRequest('/chat/booking', { method: 'POST', body: JSON.stringify(payload) }),

  // Dashboard Stats
  getDashboardStats: () =>
    apiRequest('/dashboard/stats'),

  // Notifications Management
  getNotifications: (params?: Record<string, any>) =>
    apiRequest(`/notifications${buildQueryString(params)}`),

  getUnreadNotificationCount: () =>
    apiRequest('/notifications/unread-count'),

  createNotification: (payload: any) =>
    apiRequest('/notifications', { method: 'POST', body: JSON.stringify(payload) }),

  markNotificationAsRead: (id: string) =>
    apiRequest(`/notifications/${id}/read`, { method: 'PATCH' }),

  markAllNotificationsAsRead: () =>
    apiRequest('/notifications/mark-all-read', { method: 'PATCH' }),

  deleteNotification: (id: string) =>
    apiRequest(`/notifications/${id}`, { method: 'DELETE' }),

  // Settings
  getSettings: () =>
    apiRequest('/settings'),
  
  updateSettings: (settings: any) =>
    apiRequest('/settings', { method: 'PUT', body: JSON.stringify(settings) }),

  // Blog Comments
  getBlogComments: (blogId: string) =>
    apiRequest(`/blogs/${blogId}/comments`),

  createComment: (blogId: string, payload: any) =>
    apiRequest(`/blogs/${blogId}/comments`, { method: 'POST', body: JSON.stringify(payload) }),

  // Blog Comment Replies
  createReply: (commentId: string, payload: any) =>
    apiRequest(`/comments/${commentId}/replies`, { method: 'POST', body: JSON.stringify(payload) }),

  getCommentReplies: (commentId: string) =>
    apiRequest(`/comments/${commentId}/replies`),

  // Admin Comment Management
  getAllComments: (params?: Record<string, any>) =>
    apiRequest(`/comments${buildQueryString(params)}`),

  getCommentById: (id: string) =>
    apiRequest(`/comments/${id}`),

  approveComment: (id: string) =>
    apiRequest(`/comments/${id}/approve`, { method: 'PATCH' }),

  rejectComment: (id: string) =>
    apiRequest(`/comments/${id}/reject`, { method: 'PATCH' }),

  deleteComment: (id: string) =>
    apiRequest(`/comments/${id}`, { method: 'DELETE' }),

  // ======== MISSING METHODS ADDED BY AUDIT ========

  // Contacts — CRUD
  getContactById: (id: string) =>
    apiRequest(`/contacts/${id}`),

  updateContactStatus: (id: string, status: string, notes?: string) =>
    apiRequest(`/contacts/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, notes }) }),

  deleteContact: (id: string) =>
    apiRequest(`/contacts/${id}`, { method: 'DELETE' }),

  // Orders — CRUD
  getOrders: (params?: Record<string, any>) =>
    apiRequest(`/orders${buildQueryString(params)}`),

  getOrderById: (id: string) =>
    apiRequest(`/orders/${id}`),

  updateOrderStatus: (id: string, status: string, paymentStatus?: string) =>
    apiRequest(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, paymentStatus }) }),

  deleteOrder: (id: string) =>
    apiRequest(`/orders/${id}`, { method: 'DELETE' }),

  // Projects
  getProjects: (params?: Record<string, any>) =>
    apiRequest(`/projects${buildQueryString(params)}`),

  getProjectBySlug: (slug: string) =>
    apiRequest(`/projects/slug/${slug}`),

  // Team
  getTeam: () =>
    apiRequest('/team'),

  // Services
  getServices: (params?: Record<string, any>) =>
    apiRequest(`/services${buildQueryString(params)}`),

  getServiceBySlug: (slug: string) =>
    apiRequest(`/services/${slug}`),

  // Testimonials
  getTestimonials: () =>
    apiRequest('/testimonials'),

  // FAQs
  getFAQs: () =>
    apiRequest('/faqs'),

  // Gemini AI
  sendGeminiChat: (payload: { messages: Array<{ role: string; content: string }>; sessionId?: string; clientName?: string }) =>
    apiRequest('/gemini/chat', { method: 'POST', body: JSON.stringify(payload) }),

  generateDescription: (prompt: string) =>
    apiRequest('/gemini/generate-description', { method: 'POST', body: JSON.stringify({ prompt }) }),

  suggestMenu: (payload: { eventType: string; guests?: number; cuisine?: string; dietary?: string }) =>
    apiRequest('/gemini/suggest-menu', { method: 'POST', body: JSON.stringify(payload) }),

  // Chatbot Booking Management
  getChatbotBookings: () =>
    apiRequest('/chatbot/bookings'),

  updateChatbotBookingStatus: (id: string, status: string) =>
    apiRequest(`/chatbot/booking/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  deleteChatbotBooking: (id: string) =>
    apiRequest(`/chatbot/booking/${id}`, { method: 'DELETE' }),

  getChatSessions: () =>
    apiRequest('/chatbot/sessions'),

  // Utility — public form submissions
  submitContactInquiry: (payload: any) =>
    apiRequest('/contact', { method: 'POST', body: JSON.stringify(payload) }),

  submitCalendarBooking: (payload: any) =>
    apiRequest('/booking', { method: 'POST', body: JSON.stringify(payload) }),

  submitCateringOrder: (payload: any) =>
    apiRequest('/order', { method: 'POST', body: JSON.stringify(payload) }),
};
