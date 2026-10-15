import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Plus,
  Layers,
  Calendar,
  CheckCircle2,
  Edit
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../hooks/useAuth';
import { getMyBookings, updateBookingStatus } from '../services/bookingService';
import { getAdminInventory, updateEquipmentStock, addEquipment } from '../services/adminService';
import './AdminDashboardPage.css';

export function AdminDashboardPage() {
  const { currentUser, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'inventory'

  const [bookings, setBookings] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingFilter, setBookingFilter] = useState('all');

  // Edit stock modal state
  const [editStockModalOpen, setEditStockModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [editTotalStock, setEditTotalStock] = useState(0);
  const [editAvailableStock, setEditAvailableStock] = useState(0);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

  // Add equipment modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemBrand, setNewItemBrand] = useState('');
  const [newItemModel, setNewItemModel] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('audio');
  const [newItemRate, setNewItemRate] = useState(150);
  const [newItemStock, setNewItemStock] = useState(8);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Status update message
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const reloadData = async () => {
    setIsLoading(true);
    try {
      const [bookingsRes, inventoryRes] = await Promise.all([
        getMyBookings(),
        getAdminInventory(),
      ]);
      setBookings(bookingsRes.data || []);
      setInventory(inventoryRes.data || []);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const [bookingsRes, inventoryRes] = await Promise.all([
          getMyBookings(),
          getAdminInventory(),
        ]);
        if (!ignore) {
          setBookings(bookingsRes.data || []);
          setInventory(inventoryRes.data || []);
        }
      } catch (err) {
        if (!ignore) console.error('Failed to load admin data', err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateBookingStatus(id, newStatus);
      setFeedbackMessage(`Reservation ${id} updated to ${newStatus.toUpperCase()}`);
      setTimeout(() => setFeedbackMessage(''), 4000);
      await reloadData();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleOpenEditStock = (item) => {
    setItemToEdit(item);
    setEditTotalStock(item.stock);
    setEditAvailableStock(item.availableQuantity);
    setEditStockModalOpen(true);
  };

  const handleSaveStock = async (e) => {
    e.preventDefault();
    if (!itemToEdit) return;
    setIsUpdatingStock(true);
    try {
      await updateEquipmentStock(itemToEdit.id, parseInt(editTotalStock, 10), parseInt(editAvailableStock, 10));
      setEditStockModalOpen(false);
      setItemToEdit(null);
      setFeedbackMessage(`Inventory stock updated for ${itemToEdit.name}`);
      setTimeout(() => setFeedbackMessage(''), 4000);
      await reloadData();
    } catch (err) {
      console.error('Failed to update stock', err);
    } finally {
      setIsUpdatingStock(false);
    }
  };

  const handleAddEquipmentSubmit = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    setIsAddingItem(true);
    try {
      await addEquipment({
        name: newItemName,
        brand: newItemBrand || 'ProStage',
        model: newItemModel || 'Series 1',
        category: newItemCategory,
        categoryLabel: newItemCategory.toUpperCase(),
        shortDesc: newItemDesc || 'Professional event rental gear.',
        description: newItemDesc || 'Professional grade touring equipment.',
        dailyRate: parseInt(newItemRate, 10),
        unit: 'per unit/day',
        stock: parseInt(newItemStock, 10),
        availableQuantity: parseInt(newItemStock, 10),
        status: 'available',
      });
      setAddModalOpen(false);
      setNewItemName('');
      setNewItemBrand('');
      setNewItemModel('');
      setNewItemDesc('');
      setFeedbackMessage('New equipment item registered successfully into inventory.');
      setTimeout(() => setFeedbackMessage(''), 4000);
      await reloadData();
    } catch (err) {
      console.error('Failed to add equipment', err);
    } finally {
      setIsAddingItem(false);
    }
  };

  // Metrics
  const totalFleetUnits = inventory.reduce((acc, eq) => acc + (eq.stock || 0), 0);
  const pendingApprovalsCount = bookings.filter((b) => b.status === 'pending').length;
  const confirmedRevenue = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((acc, b) => acc + (b.totalAmount || 0), 0);
  const totalAvailableUnits = inventory.reduce((acc, eq) => acc + (eq.availableQuantity || 0), 0);
  const utilizationRate = totalFleetUnits > 0
    ? Math.round(((totalFleetUnits - totalAvailableUnits) / totalFleetUnits) * 100)
    : 0;

  const filteredBookings = bookingFilter === 'all'
    ? bookings
    : bookings.filter((b) => b.status.toLowerCase() === bookingFilter.toLowerCase());

  return (
    <div className="aura-admin">
      <div className="container">
        {/* If user is not admin, show warning & quick switch button */}
        {!isAdmin && (
          <div className="aura-admin__auth-banner">
            <div>
              <strong style={{ color: '#FFF', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={18} style={{ color: '#C4B5FD' }} />
                Administrative Privilege Notice
              </strong>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem', margin: 0 }}>
                You are currently viewing as <strong>{currentUser?.name || 'Guest'}</strong>. In production, this portal is protected by backend role authentication.
              </p>
            </div>
            <Link to="/login">
              <Button
                variant="primary"
                size="sm"
                style={{ background: '#7C3AED', borderColor: '#A78BFA' }}
              >
                Log In as Admin
              </Button>
            </Link>
          </div>
        )}

        {/* Feedback Alert Toast */}
        {feedbackMessage && (
          <div style={{ padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34D399', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <CheckCircle2 size={16} />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="aura-admin__header">
          <div>
            <div className="aura-admin__eyebrow">
              <Shield size={14} />
              <span>Operations Console</span>
            </div>
            <h1 className="aura-admin__title">Admin Inventory & Dispatch Manager</h1>
            <p className="aura-admin__desc">
              Logged in as <strong>Sarah Chen</strong> (Inventory & Operations). Authorize equipment reservations and maintain fleet stock levels.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button
              variant="primary"
              leftIcon={<Plus size={16} />}
              onClick={() => setAddModalOpen(true)}
            >
              Add Equipment Item
            </Button>
          </div>
        </div>

        {/* Operational Metrics Cards */}
        <div className="aura-admin__metrics">
          <div className="aura-admin-metric">
            <span className="aura-admin-metric__label">Fleet Total Inventory</span>
            <span className="aura-admin-metric__val">{totalFleetUnits} Units</span>
            <span className="aura-admin-metric__sub">{inventory.length} distinct equipment assets</span>
          </div>

          <div className="aura-admin-metric">
            <span className="aura-admin-metric__label">Pending Approvals</span>
            <span className="aura-admin-metric__val" style={{ color: '#FBBF24' }}>
              {pendingApprovalsCount} Request{pendingApprovalsCount !== 1 ? 's' : ''}
            </span>
            <span className="aura-admin-metric__sub">Requires supervisor authorization</span>
          </div>

          <div className="aura-admin-metric">
            <span className="aura-admin-metric__label">Confirmed Revenue</span>
            <span className="aura-admin-metric__val" style={{ color: 'var(--color-accent-bright)' }}>
              ₹{confirmedRevenue.toLocaleString('en-IN')}
            </span>
            <span className="aura-admin-metric__sub">Approved dispatch contracts</span>
          </div>

          <div className="aura-admin-metric">
            <span className="aura-admin-metric__label">Fleet Utilization</span>
            <span className="aura-admin-metric__val" style={{ color: '#34D399' }}>
              {utilizationRate}%
            </span>
            <span className="aura-admin-metric__sub">{totalFleetUnits - totalAvailableUnits} units deployed on stages</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="aura-admin__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'bookings'}
            className={`aura-admin__tab-btn ${activeTab === 'bookings' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <Calendar size={16} />
            <span>Reservation Requests ({bookings.length})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'inventory'}
            className={`aura-admin__tab-btn ${activeTab === 'inventory' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            <Layers size={16} />
            <span>Equipment Inventory & Stock ({inventory.length})</span>
          </button>
        </div>

        {isLoading ? (
          <Spinner size={36} text="Loading operational data..." />
        ) : activeTab === 'bookings' ? (
          /* ==========================================================================
             TAB 1: RESERVATION REQUESTS
             ========================================================================== */
          <div>
            {/* Filter buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              {['all', 'pending', 'confirmed', 'rejected', 'cancelled'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setBookingFilter(st)}
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-subtle)',
                    background: bookingFilter === st ? 'rgba(139, 92, 246, 0.2)' : 'var(--color-bg-surface-elevated)',
                    color: bookingFilter === st ? '#C4B5FD' : 'var(--color-text-secondary)',
                    borderColor: bookingFilter === st ? '#8B5CF6' : 'var(--border-subtle)',
                    fontSize: '0.8rem',
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="aura-admin__table-card">
              <table className="aura-admin__table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Client / Agency</th>
                    <th>Event Title</th>
                    <th>Dates</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b) => (
                    <tr key={b.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent-primary)', fontWeight: 600 }}>
                        {b.id}
                      </td>
                      <td>
                        <div className="aura-admin__table-primary-text">{b.clientName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{b.company}</div>
                      </td>
                      <td>
                        <div className="aura-admin__table-primary-text">{b.eventName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{b.venueName}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', color: '#FFF' }}>{b.startDate} → {b.endDate}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{b.durationDays}d duration</div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#FFF' }}>
                        ₹{b.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <Badge variant={b.status}>{b.status}</Badge>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="aura-admin__table-actions">
                          {b.status === 'pending' ? (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                                onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                                onClick={() => handleUpdateStatus(b.id, 'rejected')}
                              >
                                Reject
                              </Button>
                            </>
                          ) : (
                            <Link to={`/my-bookings/${b.id}`}>
                              <Button variant="outline" size="sm" style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}>
                                View Manifest
                              </Button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ==========================================================================
             TAB 2: INVENTORY & STOCK LEVELS
             ========================================================================== */
          <div className="aura-admin__table-card">
            <table className="aura-admin__table">
              <thead>
                <tr>
                  <th>Asset ID</th>
                  <th>Equipment Item</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'center' }}>Total Stock</th>
                  <th style={{ textAlign: 'center' }}>Available</th>
                  <th style={{ textAlign: 'right' }}>Daily Rate</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent-primary)' }}>
                       {item.id}
                    </td>
                    <td>
                      <div className="aura-admin__table-primary-text">{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {item.brand} • {item.model}
                      </div>
                    </td>
                    <td style={{ textTransform: 'capitalize', color: 'var(--color-text-secondary)' }}>
                      {item.category}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: '#FFF' }}>
                      {item.stock}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: item.availableQuantity > 0 ? '#34D399' : '#F87171' }}>
                      {item.availableQuantity}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#FFF' }}>
                      ₹{item.dailyRate?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Badge variant={item.status}>{item.status}</Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Edit size={13} />}
                        onClick={() => handleOpenEditStock(item)}
                      >
                        Edit Stock
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal: Edit Stock Counts */}
        <Modal
          isOpen={editStockModalOpen}
          onClose={() => setEditStockModalOpen(false)}
          title={`Edit Stock: ${itemToEdit?.name || ''}`}
          maxWidth="460px"
        >
          <form onSubmit={handleSaveStock} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              Adjust total warehouse fleet units and currently unallocated available units for this equipment asset.
            </p>

            <Input
              label="Total Warehouse Stock (Units)"
              type="number"
              min="0"
              required
              value={editTotalStock}
              onChange={(e) => setEditTotalStock(e.target.value)}
            />

            <Input
              label="Currently Available for Rent (Units)"
              type="number"
              min="0"
              max={editTotalStock}
              required
              value={editAvailableStock}
              onChange={(e) => setEditAvailableStock(e.target.value)}
              helperText="Cannot exceed total warehouse stock"
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button variant="secondary" onClick={() => setEditStockModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isUpdatingStock}>
                Save Stock Levels
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Add New Equipment Asset */}
        <Modal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          title="Register New Equipment Asset"
          maxWidth="520px"
        >
          <form onSubmit={handleAddEquipmentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <Input
              label="Equipment Name"
              required
              placeholder="e.g. DiGiCo SD12 Digital Audio Console"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Manufacturer / Brand"
                placeholder="e.g. DiGiCo"
                value={newItemBrand}
                onChange={(e) => setNewItemBrand(e.target.value)}
              />
              <Input
                label="Model Number"
                placeholder="e.g. SD12-96"
                value={newItemModel}
                onChange={(e) => setNewItemModel(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Select
                label="Category"
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                options={[
                  { value: 'audio', label: 'Audio Equipment' },
                  { value: 'lighting', label: 'Lighting Equipment' },
                  { value: 'projection', label: 'Projection & Displays' },
                  { value: 'stage', label: 'Stage & Trussing' },
                  { value: 'furniture', label: 'Furniture & Decor' },
                  { value: 'dj', label: 'DJ Equipment' },
                  { value: 'accessories', label: 'Event Accessories' },
                ]}
              />
              <Input
                label="Daily Rental Rate (₹)"
                type="number"
                min="100"
                required
                value={newItemRate}
                onChange={(e) => setNewItemRate(e.target.value)}
              />
            </div>

            <Input
              label="Initial Warehouse Stock Units"
              type="number"
              min="1"
              required
              value={newItemStock}
              onChange={(e) => setNewItemStock(e.target.value)}
            />

            <div>
              <label htmlFor="new-desc" className="aura-input-label" style={{ marginBottom: '0.35rem' }}>
                Description & Specifications
              </label>
              <textarea
                id="new-desc"
                rows={3}
                value={newItemDesc}
                onChange={(e) => setNewItemDesc(e.target.value)}
                placeholder="Key technical capabilities, connectors, and touring features..."
                className="aura-input"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button variant="secondary" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isAddingItem}>
                Add to Inventory
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
