/**
 * AURA Event Gear — Admin Service Layer
 * Operations management for equipment stock adjustments, inventory additions, and metrics.
 */

import { apiRequest, USE_MOCK_DATA } from './apiClient';
import { MOCK_EQUIPMENT } from '../data/mockEquipment';

const INVENTORY_STORAGE_KEY = 'aura_demo_inventory';

function getStoredInventory() {
  try {
    const data = sessionStorage.getItem(INVENTORY_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read sessionStorage inventory', err);
  }
  return [...MOCK_EQUIPMENT];
}

function saveStoredInventory(items) {
  try {
    sessionStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save sessionStorage inventory', err);
  }
}

/**
 * Get all inventory items for admin management
 */
export async function getAdminInventory() {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return {
      data: getStoredInventory(),
      mode: 'mock',
    };
  }

  const response = await apiRequest('admin/inventory');
  return {
    data: response.data || response,
    mode: 'live',
  };
}

/**
 * Update stock counts for an equipment asset
 */
export async function updateEquipmentStock(id, newStock, newAvailable) {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const inventory = getStoredInventory();
    const item = inventory.find((eq) => eq.id === id);
    if (item) {
      item.stock = newStock;
      item.availableQuantity = Math.min(newAvailable, newStock);
      item.status = item.availableQuantity > 0 ? (item.availableQuantity < 4 ? 'limited' : 'available') : 'unavailable';
      saveStoredInventory(inventory);
      return { success: true, data: item, mode: 'mock' };
    }
    throw new Error('Equipment not found');
  }

  const response = await apiRequest(`admin/inventory/${id}`, {
    method: 'PATCH',
    body: { stock: newStock, availableQuantity: newAvailable },
  });
  return { success: true, data: response.data || response, mode: 'live' };
}

/**
 * Add a new equipment item into inventory
 */
export async function addEquipment(equipmentData) {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const inventory = getStoredInventory();
    const newId = `eq_custom_${Date.now()}`;
    const newItem = {
      id: newId,
      status: 'available',
      rating: 5.0,
      images: [
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      ],
      ...equipmentData,
    };
    inventory.unshift(newItem);
    saveStoredInventory(inventory);
    return { success: true, data: newItem, mode: 'mock' };
  }

  const response = await apiRequest('admin/inventory', {
    method: 'POST',
    body: equipmentData,
  });
  return { success: true, data: response.data || response, mode: 'live' };
}

/**
 * Get all customer reservations for operations oversight
 */
export async function getAdminBookings(filters = {}) {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    try {
      const stored = sessionStorage.getItem('aura_demo_bookings');
      if (stored) {
        return { data: JSON.parse(stored), mode: 'mock' };
      }
    } catch {
      // fallback
    }
    return { data: [], mode: 'mock' };
  }

  const queryParams = new URLSearchParams();
  if (filters.status && filters.status !== 'all') {
    queryParams.append('status', filters.status);
  }

  const endpoint = `admin/bookings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiRequest(endpoint);
  return {
    data: response.data || response,
    total: response.total || (response.data ? response.data.length : response.length),
    mode: 'live',
  };
}

/**
 * Update reservation status from admin dashboard
 */
export async function updateAdminBookingStatus(id, newStatus) {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    try {
      const stored = sessionStorage.getItem('aura_demo_bookings');
      if (stored) {
        const bookings = JSON.parse(stored);
        const idx = bookings.findIndex((b) => b.id === id);
        if (idx !== -1) {
          bookings[idx].status = newStatus.toLowerCase();
          sessionStorage.setItem('aura_demo_bookings', JSON.stringify(bookings));
          return { success: true, data: bookings[idx], mode: 'mock' };
        }
      }
    } catch {
      // fallback
    }
    return { success: true, mode: 'mock' };
  }

  const response = await apiRequest(`admin/bookings/${id}/status`, {
    method: 'PATCH',
    body: { status: newStatus.toUpperCase() },
  });
  return {
    success: true,
    data: response.data || response,
    mode: 'live',
  };
}

export default {
  getAdminInventory,
  updateEquipmentStock,
  addEquipment,
  getAdminBookings,
  updateAdminBookingStatus,
};
