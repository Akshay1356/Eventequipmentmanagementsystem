import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Calendar,
  MapPin,
  Building,
  User,
  Mail,
  Phone,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import { getEquipmentById } from '../services/equipmentService';
import { createBooking } from '../services/bookingService';
import { useAuth } from '../hooks/useAuth';
import './BookingPage.css';

// Date helper
const getTomorrowDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const getFutureDate = (daysAhead = 3) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
};

export function BookingPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();

  const [equipment, setEquipment] = useState(null);
  const [isLoadingItem, setIsLoadingItem] = useState(true);

  // Form Fields
  const [eventName, setEventName] = useState('ElectroVibe Music Festival 2026');
  const [eventType, setEventType] = useState('concert');
  const [venueName, setVenueName] = useState('Metropolis Arena Hall B');
  const [venueAddress, setVenueAddress] = useState('450 Exhibition Blvd, Tech City, TC 94016');

  // Dates & Quantity from search params with safe fallbacks
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || getTomorrowDate());
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || getFutureDate(3));
  const [quantity, setQuantity] = useState(parseInt(searchParams.get('qty') || '2', 10));

  // Client Details
  const [clientName, setClientName] = useState(currentUser?.name || 'Alex Rivera');
  const [clientEmail, setClientEmail] = useState(currentUser?.email || 'alex.rivera@example.com');
  const [clientPhone, setClientPhone] = useState('+1 (555) 349-8291');
  const [company, setCompany] = useState(currentUser?.company || 'Apex Productions');
  const [specialInstructions, setSpecialInstructions] = useState('Dock load-in required at 08:00 AM. 3-Phase Camlock available stage left.');

  // Add-ons
  const [needsTechnician, setNeedsTechnician] = useState(true);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    let isMounted = true;
    async function loadItem() {
      setIsLoadingItem(true);
      try {
        const response = await getEquipmentById(id);
        if (isMounted && response?.data) {
          setEquipment(response.data);
        }
      } catch (err) {
        if (isMounted) console.error('Failed to load equipment for booking', err);
      } finally {
        if (isMounted) setIsLoadingItem(false);
      }
    }
    loadItem();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Duration calculation
  const calculateDurationDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const durationDays = calculateDurationDays();
  const rate = equipment ? equipment.dailyRate : 5500;
  const maxStock = equipment?.availableQuantity || 16;
  const equipmentSubtotal = durationDays * quantity * rate;
  const technicianDailyRate = 2500;
  const technicianFee = needsTechnician ? durationDays * technicianDailyRate : 0;
  const totalAmount = equipmentSubtotal + technicianFee;

  const validateForm = () => {
    const errors = {};
    if (!eventName.trim()) errors.eventName = 'Event name is required';
    if (!venueName.trim()) errors.venueName = 'Venue name is required';
    if (!venueAddress.trim()) errors.venueAddress = 'Venue address is required';
    if (!clientName.trim()) errors.clientName = 'Contact name is required';
    if (!clientEmail.trim() || !clientEmail.includes('@')) errors.clientEmail = 'Valid email is required';
    if (!clientPhone.trim()) errors.clientPhone = 'Phone number is required';

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      errors.dates = 'End date must be after start date';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        userId: currentUser?.id || 'usr_demo_101',
        clientName,
        clientEmail,
        clientPhone,
        company,
        eventName,
        eventType,
        venueName,
        venueAddress,
        startDate,
        endDate,
        durationDays,
        items: [
          {
            equipmentId: equipment?.id || id,
            name: equipment?.name || 'Professional Event Gear',
            category: equipment?.category || 'audio',
            dailyRate: rate,
            quantity,
            subtotal: equipmentSubtotal,
          },
        ],
        needsTechnician,
        technicianFee,
        equipmentSubtotal,
        totalAmount,
        specialInstructions,
      };

      const result = await createBooking(payload);
      setConfirmedBooking(result.data);
    } catch (err) {
      console.error('Booking failed', err);
      setFormErrors({ submit: 'Failed to submit booking request. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingItem) {
    return (
      <div className="aura-booking">
        <div className="container">
          <Spinner size={40} text="Preparing reservation summary..." />
        </div>
      </div>
    );
  }

  // Confirmation Success View
  if (confirmedBooking) {
    return (
      <div className="aura-confirmation">
        <div className="container">
          <div className="aura-confirmation__card">
            <div className="aura-confirmation__icon-wrap">
              <CheckCircle2 size={36} />
            </div>

            <Badge variant="pending" size="md">Pending Operations Confirmation</Badge>
            <h1 className="aura-confirmation__title">Booking Request Received</h1>
            <p className="aura-confirmation__desc">
              Your reservation has been logged into our inventory system under reference{' '}
              <strong style={{ color: 'var(--color-accent-bright)', fontFamily: 'var(--font-mono)' }}>
                {confirmedBooking.id}
              </strong>. Our dispatch team is reviewing your schedule and equipment availability.
            </p>

            <div className="aura-confirmation__details-box">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Event:</span>
                <strong style={{ color: '#FFF' }}>{confirmedBooking.eventName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Venue:</span>
                <span style={{ color: '#FFF' }}>{confirmedBooking.venueName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Rental Window:</span>
                <span style={{ color: 'var(--color-accent-primary)' }}>
                  {confirmedBooking.startDate} → {confirmedBooking.endDate} ({confirmedBooking.durationDays} Days)
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Equipment Reserved:</span>
                <span style={{ color: '#FFF' }}>{confirmedBooking.items[0]?.name} (×{confirmedBooking.items[0]?.quantity})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-medium)', paddingTop: '0.65rem' }}>
                <span style={{ fontWeight: 600, color: '#FFF' }}>Estimated Total:</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--color-accent-bright)' }}>
                  ₹{confirmedBooking.totalAmount.toLocaleString('en-IN')}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/my-bookings">
                <Button variant="primary" size="lg">
                  View in My Bookings
                </Button>
              </Link>
              <Link to="/equipment">
                <Button variant="secondary" size="lg">
                  Browse More Equipment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="aura-booking">
      <div className="container">
        {/* Navigation Breadcrumb */}
        <Link to={`/equipment/${equipment?.id || id}`} className="aura-booking__back-link">
          <ArrowLeft size={16} />
          <span>Back to Equipment Details</span>
        </Link>

        {/* Page Heading */}
        <div className="aura-booking__header">
          <div className="aura-booking__eyebrow">
            <Calendar size={14} />
            <span>Reservation Checkout</span>
          </div>
          <h1 className="aura-booking__title">Complete Equipment Reservation</h1>
          <p className="aura-booking__desc">
            Submit your event schedule, venue logistics, and staging requirements for administrative authorization.
          </p>
        </div>

        {formErrors.submit && (
          <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--color-error-bg)', border: '1px solid var(--color-error-border)', color: '#F87171', marginBottom: '2rem' }}>
            {formErrors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="aura-booking__layout">
          {/* Left Column: Multi-Section Form */}
          <div className="aura-booking__form-cols">
            {/* Section 1: Event Information */}
            <div className="aura-booking__section-card">
              <h2 className="aura-booking__section-title">
                <span className="number">01.</span> Event Information
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <Input
                  label="Official Event Title"
                  required
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  error={formErrors.eventName}
                  placeholder="e.g. Future Tech Summit 2026"
                />

                <Select
                  label="Event Production Type"
                  required
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  options={[
                    { value: 'concert', label: 'Concert / Live Music Tour' },
                    { value: 'corporate', label: 'Corporate Conference / Keynote' },
                    { value: 'festival', label: 'Outdoor Music / Arts Festival' },
                    { value: 'wedding', label: 'Gala / Formal Reception' },
                    { value: 'broadcast', label: 'Film & Broadcast Production' },
                    { value: 'exhibition', label: 'Trade Show / Brand Exhibition' },
                  ]}
                />
              </div>
            </div>

            {/* Section 2: Venue Logistics & Dates */}
            <div className="aura-booking__section-card">
              <h2 className="aura-booking__section-title">
                <span className="number">02.</span> Venue Schedule & Location
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="aura-booking__grid-2">
                  <Input
                    label="Rental Start Date"
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <Input
                    label="Rental End Date"
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                {formErrors.dates && (
                  <p style={{ color: 'var(--color-error)', fontSize: '0.825rem' }}>
                    {formErrors.dates}
                  </p>
                )}

                <Input
                  label="Venue / Facility Name"
                  required
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  error={formErrors.venueName}
                  placeholder="e.g. Metropolis Arena Hall B"
                  leftIcon={<Building size={16} />}
                />

                <Input
                  label="Venue Street Address & City"
                  required
                  value={venueAddress}
                  onChange={(e) => setVenueAddress(e.target.value)}
                  error={formErrors.venueAddress}
                  placeholder="Street address, City, State, Postal code"
                  leftIcon={<MapPin size={16} />}
                />
              </div>
            </div>

            {/* Section 3: Contact Details */}
            <div className="aura-booking__section-card">
              <h2 className="aura-booking__section-title">
                <span className="number">03.</span> Organizer Contact Information
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="aura-booking__grid-2">
                  <Input
                    label="Contact Full Name"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    error={formErrors.clientName}
                    leftIcon={<User size={16} />}
                  />
                  <Input
                    label="Company / Agency"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Production Co. or Agency name"
                  />
                </div>

                <div className="aura-booking__grid-2">
                  <Input
                    label="Work Email Address"
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    error={formErrors.clientEmail}
                    leftIcon={<Mail size={16} />}
                  />
                  <Input
                    label="Mobile / Phone Number"
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    error={formErrors.clientPhone}
                    leftIcon={<Phone size={16} />}
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Production Add-Ons & Special Notes */}
            <div className="aura-booking__section-card">
              <h2 className="aura-booking__section-title">
                <span className="number">04.</span> Technical Support & Add-Ons
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Technician Add-on */}
                <label className={`aura-addon-card ${needsTechnician ? 'is-selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={needsTechnician}
                    onChange={(e) => setNeedsTechnician(e.target.checked)}
                    className="aura-addon-checkbox"
                  />
                  <div className="aura-addon-info">
                    <div className="aura-addon-title">Certified On-Site Systems Technician</div>
                    <div className="aura-addon-desc">
                      Certified audio/lighting engineer for on-site load-in supervision, Dante/DMX network routing, and live sound/lighting operation.
                    </div>
                  </div>
                  <div className="aura-addon-price">+₹{technicianDailyRate.toLocaleString('en-IN')}/day</div>
                </label>

                {/* Staging Notes */}
                <div>
                  <label htmlFor="notes" className="aura-input-label" style={{ marginBottom: '0.4rem' }}>
                    Staging Requirements & Load-in Instructions (Optional)
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Specify dock access hours, freight elevator dimensions, Camlock power location, or audio channel requirements..."
                    className="aura-input"
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Summary & Confirmation Box */}
          <div className="aura-summary-card">
            <div className="aura-summary-title">
              <span>Reservation Summary</span>
              <Badge variant="available">In Stock</Badge>
            </div>

            {/* Reserved Item Mini Card */}
            {equipment && (
              <div className="aura-summary-item">
                <img
                  src={equipment.images?.[0] || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'}
                  alt={equipment.name}
                  className="aura-summary-item__img"
                />
                <div className="aura-summary-item__info">
                  <h3 className="aura-summary-item__name">{equipment.name}</h3>
                  <div className="aura-summary-item__rate">
                    ₹{equipment.dailyRate?.toLocaleString('en-IN')} / day
                  </div>
                </div>
              </div>
            )}

            {/* Quantity Stepper in Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--color-bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Reserved Units:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="aura-calc-qty-btn"
                  style={{ width: '26px', height: '26px', fontSize: '0.9rem' }}
                >
                  -
                </button>
                <span style={{ fontWeight: 700, minWidth: '20px', textAlign: 'center', color: '#FFF' }}>{quantity}</span>
                <button
                  type="button"
                  disabled={quantity >= maxStock}
                  onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                  className="aura-calc-qty-btn"
                  style={{ width: '26px', height: '26px', fontSize: '0.9rem' }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="aura-summary-breakdown">
              <div className="aura-summary-row">
                <span>Rental Duration:</span>
                <strong>{durationDays} {durationDays === 1 ? 'Day' : 'Days'}</strong>
              </div>
              <div className="aura-summary-row">
                <span>Quantity Reserved:</span>
                <strong>{quantity} units</strong>
              </div>
              <div className="aura-summary-row">
                <span>Equipment Rental Subtotal:</span>
                <strong>₹{equipmentSubtotal.toLocaleString('en-IN')}</strong>
              </div>
              {needsTechnician && (
                <div className="aura-summary-row">
                  <span>On-Site Technician ({durationDays}d):</span>
                  <strong>₹{technicianFee.toLocaleString('en-IN')}</strong>
                </div>
              )}
              <div className="aura-summary-row">
                <span>Pre-Flight Bench Testing:</span>
                <strong style={{ color: '#34D399' }}>Included</strong>
              </div>
              <div className="aura-summary-row">
                <span>Protective Flight Cases:</span>
                <strong style={{ color: '#34D399' }}>Included</strong>
              </div>
            </div>

            {/* Total Estimated Cost */}
            <div className="aura-summary-total">
              <span className="aura-summary-total-label">Estimated Total:</span>
              <span className="aura-summary-total-val">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>

            {/* Submit Reservation Action */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              style={{ width: '100%' }}
              isLoading={isSubmitting}
              rightIcon={<ArrowRight size={18} />}
            >
              Submit Reservation Request
            </Button>

            <p className="aura-summary-notice">
              No immediate card billing required. Placing a reservation creates a temporary hold in our SQL database pending dispatcher review.
            </p>

            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
              <ShieldCheck size={16} style={{ color: 'var(--color-accent-primary)', flexShrink: 0 }} />
              <span>Academic DBMS Prototype • Syncs with Customer Dashboard</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookingPage;
