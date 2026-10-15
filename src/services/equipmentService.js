/**
 * AURA Event Gear — Equipment Service Layer
 * Abstracts data retrieval so pages seamlessly work in mock mode or live HTTP API mode.
 */

import { apiRequest, USE_MOCK_DATA } from './apiClient';
import { MOCK_EQUIPMENT, MOCK_CATEGORIES } from '../data/mockEquipment';

/**
 * Fetch equipment list with optional search, category, and sorting filters
 */
export async function getEquipment(filters = {}) {
  const { category = 'all', search = '', sortBy = 'default', status = 'all' } = filters;

  if (USE_MOCK_DATA) {
    // Simulate brief network latency for realistic loading experience
    await new Promise((resolve) => setTimeout(resolve, 120));

    let results = [...MOCK_EQUIPMENT];

    // Filter by Category
    if (category && category !== 'all') {
      results = results.filter(
        (item) => item.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by Search Query
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      results = results.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q) ||
          item.model.toLowerCase().includes(q) ||
          item.shortDesc.toLowerCase().includes(q) ||
          item.categoryLabel.toLowerCase().includes(q)
      );
    }

    // Filter by Status
    if (status && status !== 'all') {
      results = results.filter((item) => item.status === status);
    }

    // Apply Sorting
    switch (sortBy) {
      case 'price_asc':
        results.sort((a, b) => a.dailyRate - b.dailyRate);
        break;
      case 'price_desc':
        results.sort((a, b) => b.dailyRate - a.dailyRate);
        break;
      case 'name_asc':
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating_desc':
        results.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Featured first, then default
        results.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return {
      data: results,
      total: results.length,
      mode: 'mock',
    };
  }

  // Live HTTP API Request
  const queryParams = new URLSearchParams();
  if (category && category !== 'all') queryParams.append('category', category);
  if (search) queryParams.append('search', search);
  if (sortBy) queryParams.append('sort', sortBy);
  if (status && status !== 'all') queryParams.append('status', status);

  const endpoint = `equipment?${queryParams.toString()}`;
  const response = await apiRequest(endpoint);
  return {
    data: response.data || response,
    total: response.total || (response.data ? response.data.length : response.length),
    mode: 'live',
  };
}

/**
 * Fetch single equipment item by ID
 */
export async function getEquipmentById(id) {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 80));
    const found = MOCK_EQUIPMENT.find((item) => item.id === id);
    if (!found) {
      // Fallback to first item for demo links if arbitrary ID passed
      return {
        data: MOCK_EQUIPMENT[0],
        mode: 'mock',
        isFallback: true,
      };
    }
    return {
      data: found,
      mode: 'mock',
    };
  }

  const response = await apiRequest(`equipment/${id}`);
  return {
    data: response.data || response,
    mode: 'live',
  };
}

/**
 * Retrieve list of all equipment categories
 */
export async function getCategories() {
  if (USE_MOCK_DATA) {
    return MOCK_CATEGORIES;
  }
  const response = await apiRequest('categories');
  return response.data || response;
}

export default {
  getEquipment,
  getEquipmentById,
  getCategories,
};
