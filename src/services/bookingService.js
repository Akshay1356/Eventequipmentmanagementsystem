/**
 * AURA Event Gear — Booking Service Layer
 * Supports mock mode (sessionStorage state) and real HTTP API integration.
 */

import { apiRequest, USE_MOCK_DATA } from './apiClient';
import { INITIAL_MOCK_BOOKINGS } from '../data/mockBookings';

const STORAGE_KEY = 'aura_demo_bookings';

function getStoredBookings() {
  try {
    const data = sessionStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read sessionStorage bookings', err);
  }
  return [...INITIAL_MOCK_BOOKINGS];
}

function saveStoredBookings(bookings) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  } catch (err) {
    console.error('Failed to save sessionStorage bookings', err);
  }
}

/**
 * Create a new booking request
 */
export async function createBooking(bookingPayload) {
  if (USE_MOCK_DATA) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const bookings = getStoredBookings();
    const newId = `BK-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newBooking = {
      id: newId,
      createdAt: new Date().toISOString(),
      status: 'pending',
      ...bookingPayload,
    };

    bookings.unshift(newBooking);
    saveStoredBookings(bookings);

    return {
      success: true,
      data: newBooking,
      mode: 'mock',
    };
  }

  // Live HTTP API request
  const response = await apiRequest('bookings', {
    method: 'POST',
    body: bookingPayload,
  });

  return {
    success: true,
    data: response.data || response,
    mode: 'live',
  };
}

/**
 * Fetch bookings for current customer
 */
export async function getMyBookings() {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const bookings = getStoredBookings();
    return {
      data: bookings,
      total: bookings.length,
      mode: 'mock',
    };
  }

  const response = await apiRequest('bookings/my-bookings');
  return {
    data: response.data || response,
    total: response.total || (response.data ? response.data.length : response.length),
    mode: 'live',
  };
}

/**
 * Fetch single booking details by reference ID
 */
export async function getBookingById(id) {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const bookings = getStoredBookings();
    const found = bookings.find((b) => b.id.toLowerCase() === id.toLowerCase());

    if (!found) {
      // Fallback to first booking for demo links
      return {
        data: bookings[0],
        mode: 'mock',
        isFallback: true,
      };
    }

    return {
      data: found,
      mode: 'mock',
    };
  }

  const response = await apiRequest(`bookings/${id}`);
  return {
    data: response.data || response,
    mode: 'live',
  };
}

/**
 * Cancel an existing reservation (if in pending state)
 */
export async function cancelBooking(id) {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const bookings = getStoredBookings();
    const index = bookings.findIndex((b) => b.id.toLowerCase() === id.toLowerCase());

    if (index !== -1) {
      bookings[index].status = 'cancelled';
      saveStoredBookings(bookings);
      return {
        success: true,
        data: bookings[index],
        mode: 'mock',
      };
    }

    throw new Error('Booking not found');
  }

  const response = await apiRequest(`bookings/${id}/cancel`, {
    method: 'PATCH',
  });

  return {
    success: true,
    data: response.data || response,
    mode: 'live',
  };
}

/**
 * Update booking status (Admin privilege: 'pending' -> 'confirmed' | 'rejected')
 */
export async function updateBookingStatus(id, newStatus) {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const bookings = getStoredBookings();
    const index = bookings.findIndex((b) => b.id.toLowerCase() === id.toLowerCase());

    if (index !== -1) {
      bookings[index].status = newStatus;
      saveStoredBookings(bookings);
      return {
        success: true,
        data: bookings[index],
        mode: 'mock',
      };
    }

    throw new Error('Booking not found');
  }

  const response = await apiRequest(`bookings/${id}/status`, {
    method: 'PATCH',
    body: { status: newStatus },
  });

  return {
    success: true,
    data: response.data || response,
    mode: 'live',
  };
}

export default {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  updateBookingStatus,
};
