export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  eventDate?: string;
  guests?: string;
  message: string;
  status: 'new' | 'reviewed' | 'responded';
  createdAt: string;
}

export interface BookingRequest {
  id: string;
  bookingReference?: string;
  name: string;
  fullName?: string;
  email: string;
  phone?: string;
  mobile?: string;
  eventType?: string;
  eventDate?: string;
  date?: string;
  eventTime?: string;
  guestCount?: number;
  guests?: string;
  preferredCuisine?: string;
  cateringPackage?: string;
  budget?: number;
  venueAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
  specialRequirements?: string;
  attachment?: string;
  notes?: string;
  status: 'New Booking' | 'Contacted' | 'Quotation Sent' | 'Payment Pending' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled' | 'pending' | 'approved';
  createdAt: string;
}

const STORAGE_KEYS = {
  CONTACTS: 'eveng_admin_contacts',
  BOOKINGS: 'eveng_admin_bookings',
  ADMIN_TOKEN: 'eveng_admin_logged_in'
};

const DEFAULT_CONTACTS: ContactInquiry[] = [
  {
    id: 'c-1',
    name: 'Samantha Thorne',
    email: 'samantha.t@gmail.com',
    phone: '+1 (310) 555-0192',
    eventDate: '2026-09-12',
    guests: '150',
    message: 'We are looking for a fully-serviced plated wedding dinner near Malibu. We loved your seafood selection and would like to schedule a private tasting session.',
    status: 'new',
    createdAt: '2026-07-19T14:32:00.000Z'
  },
  {
    id: 'c-2',
    name: 'Marcus Brody',
    email: 'mbrody@oracle.com',
    phone: '+1 (415) 555-9988',
    eventDate: '2026-11-04',
    guests: '350',
    message: 'Need corporate catering for Oracle\'s western regional annual banquet. We want a multi-station layout including live carving, interactive tapas, and premium desserts.',
    status: 'reviewed',
    createdAt: '2026-07-18T09:15:00.000Z'
  },
  {
    id: 'c-3',
    name: 'Elena Rostova',
    email: 'elena.ros@yahoo.com',
    phone: '+1 (626) 555-3412',
    eventDate: '2026-08-20',
    guests: '45',
    message: 'Planning an intimate family birthday brunch. Would love to see your custom vegan and organic menu options, and understand if server staffing is included.',
    status: 'responded',
    createdAt: '2026-07-15T16:45:00.000Z'
  }
];

const DEFAULT_BOOKINGS: BookingRequest[] = [
  {
    id: 'b-1',
    bookingReference: 'EVG-84920',
    name: 'Sophia Montgomery',
    fullName: 'Sophia Montgomery',
    email: 'sophia@luxeevents.com',
    phone: '+91-9685533878',
    eventType: 'Wedding',
    eventDate: '2026-08-15',
    date: '2026-08-15',
    eventTime: '06:00 PM',
    guestCount: 250,
    guests: '250',
    preferredCuisine: 'North Indian',
    cateringPackage: 'Royal Buffet',
    budget: 250000,
    venueAddress: 'The Grand Ballroom, Oberoi Hotel',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    specialRequirements: 'Sugar-free dessert options for VIP table.',
    notes: 'Advance deposit paid.',
    status: 'Confirmed',
    createdAt: '2026-07-19T10:11:00.000Z'
  },
  {
    id: 'b-2',
    bookingReference: 'EVG-84921',
    name: 'Alexander Wright',
    fullName: 'Alexander Wright',
    email: 'alex.wright@techcorp.io',
    phone: '+91-9685533878',
    eventType: 'Corporate Event',
    eventDate: '2026-09-01',
    date: '2026-09-01',
    eventTime: '07:30 PM',
    guestCount: 120,
    guests: '120',
    preferredCuisine: 'Multi Cuisine',
    cateringPackage: 'Corporate Platter',
    budget: 120000,
    venueAddress: 'Tech Park Convention Center',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    specialRequirements: 'Live pasta counter required.',
    notes: '',
    status: 'New Booking',
    createdAt: '2026-07-20T01:14:00.000Z'
  },
  {
    id: 'b-3',
    bookingReference: 'EVG-84922',
    name: 'Priya Sharma',
    fullName: 'Priya Sharma',
    email: 'priya.sharma@gmail.com',
    phone: '+91 98123 45678',
    eventType: 'Birthday Party',
    eventDate: '2026-08-20',
    date: '2026-08-20',
    eventTime: '01:00 PM',
    guestCount: 80,
    guests: '80',
    preferredCuisine: 'South Indian',
    cateringPackage: 'Silver Buffet',
    budget: 75000,
    venueAddress: 'Green Acres Lawn',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110001',
    specialRequirements: 'Jain food options required for 15 guests.',
    notes: 'Shared sample menu options.',
    status: 'Contacted',
    createdAt: '2026-06-28T08:22:00.000Z'
  }
];

// Helper to generate unique IDs
function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getContacts(): ContactInquiry[] {
  const data = localStorage.getItem(STORAGE_KEYS.CONTACTS);
  if (!data) return [];
  return JSON.parse(data);
}

export function saveContacts(contacts: ContactInquiry[]): void {
  localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
}

export function addContact(contact: Omit<ContactInquiry, 'id' | 'createdAt' | 'status'>): void {
  const contacts = getContacts();
  const newContact: ContactInquiry = {
    ...contact,
    id: generateId('c'),
    status: 'new',
    createdAt: new Date().toISOString()
  };
  contacts.unshift(newContact);
  saveContacts(contacts);
}

export function updateContactStatus(id: string, status: ContactInquiry['status']): void {
  const contacts = getContacts();
  const updated = contacts.map(c => c.id === id ? { ...c, status } : c);
  saveContacts(updated);
}

export function deleteContact(id: string): void {
  const contacts = getContacts();
  const filtered = contacts.filter(c => c.id !== id);
  saveContacts(filtered);
}

export function getBookings(): BookingRequest[] {
  const data = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
  if (!data) return [];
  return JSON.parse(data);
}

export function saveBookings(bookings: BookingRequest[]): void {
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
}

export function addBooking(booking: Omit<BookingRequest, 'id' | 'createdAt' | 'status'>): void {
  const bookings = getBookings();
  const newBooking: BookingRequest = {
    ...booking,
    id: generateId('b'),
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  bookings.unshift(newBooking);
  saveBookings(bookings);
}

export function updateBookingStatus(id: string, status: BookingRequest['status']): void {
  const bookings = getBookings();
  const updated = bookings.map(b => b.id === id ? { ...b, status } : b);
  saveBookings(updated);
}

export function deleteBooking(id: string): void {
  const bookings = getBookings();
  const filtered = bookings.filter(b => b.id !== id);
  saveBookings(filtered);
}

export function loginAdmin(password: string): boolean {
  return false;
}

export function logoutAdmin(): void {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
}

export function isAdminLoggedIn(): boolean {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN) === 'true';
}
