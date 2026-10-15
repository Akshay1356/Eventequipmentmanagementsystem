import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Eye,
  Plus,
  AlertTriangle,
  Building,
  CheckCircle2
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { getMyBookings, cancelBooking } from '../services/bookingService';
import { useAuth } from '../hooks/useAuth';
import './CustomerDashboardPage.css';

export function CustomerDashboardPage() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Cancel dialog state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const reloadBookings = async () => {
    setIsLoading(true);
    try {
      const response = await getMyBookings();
      setBookings(response.data || []);
    } catch (err) {
      console.error('Failed to load bookings', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const response = await getMyBookings();
        if (!ignore) {
          setBookings(response.data || []);
        }
      } catch (err) {
        if (!ignore) console.error('Failed to load bookings', err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const handleOpenCancelModal = (booking) => {
    setBookingToCancel(booking);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;
    setIsCancelling(true);
    try {
      await cancelBooking(bookingToCancel.id);
      setCancelModalOpen(false);
      setBookingToCancel(null);
      await reloadBookings();
    } catch (err) {
      console.error('Failed to cancel booking', err);
    } finally {
      setIsCancelling(false);
    }
  };

  const filteredBookings = statusFilter === 'all'
    ? bookings
    : bookings.filter((b) => b.status.toLowerCase() === statusFilter.toLowerCase());

  // Metrics
  const totalCount = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;

  return (
    <div className="aura-customer-dash">
      <div className="container">
        {/* Top Header */}
        <div className="aura-customer-dash__header">
          <div>
            <div className="aura-customer-dash__eyebrow">
              <Calendar size={14} />
              <span>Customer Portal</span>
            </div>
            <h1 className="aura-customer-dash__title">My Reservations & Stage Bookings</h1>
            <p className="aura-customer-dash__desc">
              Welcome back, <strong>{currentUser?.name || 'Valued Organizer'}</strong> ({currentUser?.company || 'Independent Production'}). Monitor event hardware allocations and dispatch schedules.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link to="/equipment">
              <Button variant="primary" leftIcon={<Plus size={16} />}>
                Reserve Additional Gear
              </Button>
            </Link>
          </div>
        </div>

        {/* Metric Cards Banner */}
        <div className="aura-customer-dash__stats">
          <div className="aura-stat-box">
            <span className="aura-stat-box__label">Total Reservations</span>
            <span className="aura-stat-box__val">{totalCount}</span>
            <span className="aura-stat-box__detail">Historical & Active</span>
          </div>

          <div className="aura-stat-box">
            <span className="aura-stat-box__label">Pending Approval</span>
            <span className="aura-stat-box__val" style={{ color: '#FBBF24' }}>{pendingCount}</span>
            <span className="aura-stat-box__detail">Awaiting supervisor review</span>
          </div>

          <div className="aura-stat-box">
            <span className="aura-stat-box__label">Confirmed / Scheduled</span>
            <span className="aura-stat-box__val" style={{ color: '#34D399' }}>{confirmedCount}</span>
            <span className="aura-stat-box__detail">Inventory allocated in depot</span>
          </div>

          <div className="aura-stat-box">
            <span className="aura-stat-box__label">Completed Events</span>
            <span className="aura-stat-box__val" style={{ color: 'var(--color-accent-bright)' }}>{completedCount}</span>
            <span className="aura-stat-box__detail">Returned & inspected</span>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="aura-customer-dash__tabs" role="tablist" aria-label="Filter bookings by status">
          {[
            { id: 'all', label: `All Bookings (${totalCount})` },
            { id: 'pending', label: `Pending (${pendingCount})` },
            { id: 'confirmed', label: `Confirmed (${confirmedCount})` },
            { id: 'completed', label: `Completed (${completedCount})` },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={statusFilter === tab.id}
              className={`aura-customer-dash__tab-btn ${statusFilter === tab.id ? 'is-active' : ''}`}
              onClick={() => setStatusFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bookings List / Empty State */}
        {isLoading ? (
          <Spinner size={36} text="Loading your reservations..." />
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            title="No Bookings Found"
            description={
              statusFilter === 'all'
                ? 'You have not submitted any equipment reservations yet. Browse the catalogue to book gear for your upcoming show.'
                : `No reservations currently match the "${statusFilter}" filter status.`
            }
            actionLabel={statusFilter === 'all' ? 'Explore Equipment' : 'View All Bookings'}
            onAction={() => (statusFilter === 'all' ? null : setStatusFilter('all'))}
          />
        ) : (
          <div className="aura-booking-list">
            {filteredBookings.map((b) => (
              <article key={b.id} className="aura-booking-card">
                {/* Top Row: Ref ID, Status, Created date */}
                <div className="aura-booking-card__top">
                  <div className="aura-booking-card__ref-group">
                    <span className="aura-booking-card__ref">{b.id}</span>
                    <Badge variant={b.status}>{b.status}</Badge>
                  </div>
                  <div className="aura-booking-card__date-created">
                    Submitted: {new Date(b.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="aura-booking-card__main">
                  {/* Event & Venue */}
                  <div>
                    <h3 className="aura-booking-card__event-title">{b.eventName}</h3>
                    <div className="aura-booking-card__event-meta">
                      <div className="aura-booking-card__meta-row">
                        <Building size={14} style={{ color: 'var(--color-accent-primary)' }} />
                        <span>{b.eventType}</span>
                      </div>
                      <div className="aura-booking-card__meta-row">
                        <MapPin size={14} style={{ color: 'var(--color-accent-primary)' }} />
                        <span>{b.venueName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dates & Reserved Items */}
                  <div className="aura-booking-card__items-preview">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-accent-bright)', fontWeight: 600 }}>
                      <Calendar size={15} />
                      <span>{b.startDate} → {b.endDate}</span>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>({b.durationDays}d)</span>
                    </div>

                    <div className="aura-booking-card__items-count" style={{ marginTop: '0.35rem' }}>
                      {b.items?.length || 1} Equipment Item{b.items?.length !== 1 ? 's' : ''} Allocated
                    </div>
                    <div className="aura-booking-card__items-names">
                      {b.items?.map((it) => `${it.name} (×${it.quantity})`).join(', ') || 'Event Production Hardware'}
                    </div>
                    {b.needsTechnician && (
                      <div style={{ fontSize: '0.75rem', color: '#34D399', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                        <CheckCircle2 size={12} />
                        <span>On-site technician included</span>
                      </div>
                    )}
                  </div>

                  {/* Total & Action Buttons */}
                  <div className="aura-booking-card__pricing-actions">
                    <div className="aura-booking-card__total">
                      ${b.totalAmount.toLocaleString()}.00
                    </div>

                    <div className="aura-booking-card__btn-group">
                      <Link to={`/my-bookings/${b.id}`}>
                        <Button variant="outline" size="sm" leftIcon={<Eye size={14} />}>
                          Manifest
                        </Button>
                      </Link>

                      {b.status === 'pending' && (
                        <Button
                          variant="tertiary"
                          size="sm"
                          style={{ color: '#F87171' }}
                          onClick={() => handleOpenCancelModal(b)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Cancellation Confirmation Modal */}
        <Modal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          title="Confirm Reservation Cancellation"
          maxWidth="480px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#F87171' }}>
              <AlertTriangle size={24} />
              <strong style={{ fontSize: '1rem', color: '#FFF' }}>
                Cancel Booking {bookingToCancel?.id}?
              </strong>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Are you sure you want to cancel the reservation request for{' '}
              <strong style={{ color: '#FFF' }}>"{bookingToCancel?.eventName}"</strong>?
              This will release all allocated gear back into the available rental pool.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
              <Button variant="secondary" onClick={() => setCancelModalOpen(false)}>
                Keep Reservation
              </Button>
              <Button
                variant="destructive"
                isLoading={isCancelling}
                onClick={handleConfirmCancel}
              >
                Yes, Cancel Reservation
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default CustomerDashboardPage;
