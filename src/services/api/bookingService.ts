import axios, { AxiosInstance } from 'axios';

// ==========================================
// 1. Booking Interfaces & Types
// ==========================================

export type BookingStatus =
  | 'New Booking'
  | 'Contacted'
  | 'Quotation Sent'
  | 'Payment Pending'
  | 'Confirmed'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled'
  | 'pending'
  | 'approved';

export interface Booking {
  _id?: string;
  id?: string;
  bookingReference?: string;
  fullName: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  eventTime?: string;
  guestCount: number;
  preferredCuisine?: string;
  cateringPackage?: string;
  budget?: number;
  venueAddress: string;
  city?: string;
  state?: string;
  pincode?: string;
  specialRequirements?: string;
  attachment?: string;
  status: BookingStatus | string;
  notes?: string;
  source?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBookingDTO {
  fullName: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  eventTime?: string;
  guestCount: number;
  preferredCuisine?: string;
  cateringPackage?: string;
  budget?: number;
  venueAddress: string;
  city?: string;
  state?: string;
  pincode?: string;
  specialRequirements?: string;
  attachment?: string;
}

export interface FetchBookingsParams {
  search?: string;
  status?: string;
  eventType?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface FetchBookingsResponse {
  success: boolean;
  message?: string;
  data: {
    bookings: Booking[];
    total: number;
    page: number;
    totalPages: number;
  } | Booking[];
}

export interface SingleBookingResponse {
  success: boolean;
  message?: string;
  data: Booking;
}

// ==========================================
// 2. Axios Instance Configuration
// ==========================================

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

export const bookingApiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization Token if present in LocalStorage
bookingApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export interface TimeSlot {
  id: string;
  time: string;
  label: string;
  isBooked: boolean;
  status: 'available' | 'booked';
}

export interface DateSlotsResponse {
  success: boolean;
  message?: string;
  data: {
    date: string;
    totalSlots: number;
    availableCount: number;
    isFullyBooked: boolean;
    slots: TimeSlot[];
  };
}

export interface MonthlyAvailabilityResponse {
  success: boolean;
  message?: string;
  data: {
    year: number;
    month: number;
    availabilityByDate: Record<string, number>;
  };
}

// ==========================================
// 3. API Service Methods
// ==========================================

/**
 * Fetch availability data for a specific year and month.
 */
export async function getBookingAvailability(
  year: number,
  month: number
): Promise<MonthlyAvailabilityResponse> {
  const response = await bookingApiClient.get<MonthlyAvailabilityResponse>('/bookings/availability', {
    params: { year, month }
  });
  return response.data;
}

/**
 * Fetch time slots for a specific date (YYYY-MM-DD) to check availability and prevent double bookings.
 */
export async function getAvailableSlotsForDate(
  date: string
): Promise<DateSlotsResponse> {
  const response = await bookingApiClient.get<DateSlotsResponse>('/bookings/slots', {
    params: { date }
  });
  return response.data;
}

/**
 * Fetch list of bookings with optional filtering, sorting, and pagination.
 */
export async function fetchBookings(
  params?: FetchBookingsParams
): Promise<FetchBookingsResponse> {
  const response = await bookingApiClient.get<FetchBookingsResponse>('/bookings', {
    params,
  });
  return response.data;
}

/**
 * Fetch a single booking record by ID or booking reference.
 */
export async function getBookingById(id: string): Promise<SingleBookingResponse> {
  const response = await bookingApiClient.get<SingleBookingResponse>(`/bookings/${id}`);
  return response.data;
}

/**
 * Create a new booking request.
 */
export async function createBooking(
  bookingData: CreateBookingDTO
): Promise<SingleBookingResponse> {
  const response = await bookingApiClient.post<SingleBookingResponse>('/bookings', bookingData);
  return response.data;
}

/**
 * Update an existing booking record.
 */
export async function updateBooking(
  id: string,
  bookingData: Partial<Booking>
): Promise<SingleBookingResponse> {
  const response = await bookingApiClient.put<SingleBookingResponse>(
    `/bookings/${id}`,
    bookingData
  );
  return response.data;
}

/**
 * Update the status and/or admin notes for a specific booking.
 */
export async function updateBookingStatus(
  id: string,
  status: string,
  notes?: string
): Promise<SingleBookingResponse> {
  const response = await bookingApiClient.patch<SingleBookingResponse>(
    `/bookings/${id}/status`,
    { status, notes }
  );
  return response.data;
}

/**
 * Delete a booking record by ID.
 */
export async function deleteBooking(
  id: string
): Promise<{ success: boolean; message: string }> {
  const response = await bookingApiClient.delete<{ success: boolean; message: string }>(
    `/bookings/${id}`
  );
  return response.data;
}

// Default export object aggregating all service functions
export default {
  bookingApiClient,
  fetchBookings,
  getBookingById,
  createBooking,
  updateBooking,
  updateBookingStatus,
  deleteBooking,
};
