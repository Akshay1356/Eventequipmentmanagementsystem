import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  AlertTriangle
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { getBookingById, cancelBooking } from '../services/bookingService';
import './BookingDetailsPage.css';

export function BookingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchDetails() {
      setIsLoading(true);
      try {
        const response = await getBookingById(id);
        if (isMounted) setBooking(response.data);
      } catch (err) {
        if (isMounted) console.error('Failed to load booking details', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchDetails();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleConfirmCancel = async () => {
    if (!booking) return;
    setIsCancelling(true);
    try {
      await cancelBooking(booking.id);
      setCancelModalOpen(false);
      const updated = await getBookingById(id);
      setBooking(updated.data);
    } catch (err) {
      console.error('Failed to cancel booking', err);
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="aura-manifest">
        <div className="container">
          <Spinner size={40} text="Retrieving equipment manifest and reservation details..." />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="aura-manifest">
        <div className="container">
          <EmptyState
            title="Reservation Not Found"
            description="The requested booking reference could not be found in our database records."
            actionLabel="Return to My Bookings"
            onAction={() => navigate('/my-bookings')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="aura-manifest">
      <div className="container">
        {/* Navigation Breadcrumb */}
        <Link to="/my-bookings" className="aura-manifest__back-link">
          <ArrowLeft size={16} />
          <span>Back to My Bookings</span>
        </Link>

        {/* Top Header */}
        <div className="aura-manifest__top-bar">
          <div>
            <div className="aura-manifest__ref-row">
              <span className="aura-manifest__ref-id">{booking.id}</span>
              <Badge variant={booking.status}>{booking.status}</Badge>
            </div>
            <h1 className="aura-manifest__event-title">{booking.eventName}</h1>
          </div>

          <div className="aura-manifest__actions">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Printer size={15} />}
              onClick={() => window.print()}
            >
              Print Manifest / Invoice
            </Button>

            {booking.status === 'pending' && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setCancelModalOpen(true)}
              >
                Cancel Reservation
              </Button>
            )}
          </div>
        </div>

        {/* Info Grid (Venue, Schedule, Contact) */}
        <div className="aura-manifest__info-grid">
          <div className="aura-manifest__info-card">
            <div className="aura-manifest__info-label">Venue & Location</div>
            <div className="aura-manifest__info-val">{booking.venueName}</div>
            <div className="aura-manifest__info-sub">{booking.venueAddress}</div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Type: {booking.eventType}
            </div>
          </div>

          <div className="aura-manifest__info-card">
            <div className="aura-manifest__info-label">Rental Schedule</div>
            <div className="aura-manifest__info-val">
              {booking.startDate} → {booking.endDate}
            </div>
            <div className="aura-manifest__info-sub">
              Total Duration: <strong>{booking.durationDays} Event {booking.durationDays === 1 ? 'Day' : 'Days'}</strong>
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Created: {new Date(booking.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="aura-manifest__info-card">
            <div className="aura-manifest__info-label">Production Contact</div>
            <div className="aura-manifest__info-val">{booking.clientName}</div>
            <div className="aura-manifest__info-sub">{booking.company}</div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              {booking.clientEmail} • {booking.clientPhone}
            </div>
          </div>
        </div>

        {/* Itemized Manifest Table */}
        <div className="aura-manifest__table-card">
          <h2 className="aura-manifest__table-title">Allocated Equipment Manifest</h2>

          <div style={{ overflowX: 'auto' }}>
            <table className="aura-manifest__table">
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'center' }}>Units</th>
                  <th style={{ textAlign: 'right' }}>Daily Rate</th>
                  <th style={{ textAlign: 'right' }}>Duration</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {booking.items?.map((item, idx) => {
                  const itemRate = Number(item.dailyRate || item.daily_rate_at_booking || 0);
                  const days = Number(booking.durationDays || booking.duration_days || 1);
                  const itemSubtotal = Number(item.subtotal || item.line_total || (item.quantity * itemRate * days));
                  return (
                    <tr key={idx}>
                      <td className="aura-manifest__table-item-name">{item.name}</td>
                      <td style={{ textTransform: 'capitalize', color: 'var(--color-accent-primary)' }}>{item.category || item.category_name}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: '#FFF' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right' }}>₹{itemRate.toLocaleString('en-IN')}</td>
                      <td style={{ textAlign: 'right' }}>{days}d</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#FFF' }}>
                        ₹{itemSubtotal.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Special Instructions */}
          {booking.specialInstructions && (
            <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'var(--color-bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-accent-primary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Load-In & Staging Instructions
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                {booking.specialInstructions}
              </p>
            </div>
          )}

          {/* Financial Totals Breakdown */}
          <div className="aura-manifest__financial-summary">
            <div className="aura-manifest__totals-box">
              <div className="aura-manifest__totals-row">
                <span>Equipment Subtotal:</span>
                <strong>₹{Number(booking.equipmentSubtotal || booking.equipment_subtotal || booking.totalAmount || booking.total_amount || 0).toLocaleString('en-IN')}</strong>
              </div>

              {booking.needsTechnician && (
                <div className="aura-manifest__totals-row">
                  <span>Systems Technician ({booking.durationDays || booking.duration_days || 1}d):</span>
                  <strong>₹{Number(booking.technicianFee || booking.technician_fee || 0).toLocaleString('en-IN')}</strong>
                </div>
              )}

              <div className="aura-manifest__totals-row">
                <span>Pre-Flight Bench Testing:</span>
                <strong style={{ color: '#34D399' }}>Included</strong>
              </div>

              <div className="aura-manifest__totals-row">
                <span>Flight Case & Cabling Kit:</span>
                <strong style={{ color: '#34D399' }}>Included</strong>
              </div>

              <div className="aura-manifest__totals-row grand-total">
                <span>Total Amount:</span>
                <span>₹{Number(booking.totalAmount || booking.total_amount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cancellation Modal */}
        <Modal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          title="Cancel Reservation Request"
          maxWidth="460px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#F87171' }}>
              <AlertTriangle size={24} />
              <strong style={{ color: '#FFF' }}>Cancel {booking.id}?</strong>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Cancelling this reservation will release the equipment hold on our inventory database. Are you sure you wish to proceed?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button variant="secondary" onClick={() => setCancelModalOpen(false)}>
                Back
              </Button>
              <Button
                variant="destructive"
                isLoading={isCancelling}
                onClick={handleConfirmCancel}
              >
                Cancel Reservation
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default BookingDetailsPage;
