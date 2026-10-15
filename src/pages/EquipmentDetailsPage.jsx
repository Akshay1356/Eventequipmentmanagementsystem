import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Radio,
  ArrowRight,
  AlertCircle,
  Truck
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { getEquipmentById } from '../services/equipmentService';
import './EquipmentDetailsPage.css';

// Helpers to get ISO date strings for tomorrow and 3 days from now
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

export function EquipmentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Rental calculator state
  const [startDate, setStartDate] = useState(getTomorrowDate());
  const [endDate, setEndDate] = useState(getFutureDate(3));
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let isMounted = true;
    async function loadItem() {
      setIsLoading(true);
      try {
        const response = await getEquipmentById(id);
        if (isMounted) {
          setEquipment(response.data);
          // Set safe default quantity
          if (response.data?.availableQuantity) {
            setQuantity(Math.min(2, response.data.availableQuantity));
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load equipment details', err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadItem();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Derive date error directly during render without effect
  const isDateInvalid = Boolean(startDate && endDate && new Date(endDate) <= new Date(startDate));
  const dateError = isDateInvalid ? 'End date must be after start date' : '';

  // Validate dates and calculate rental duration in days
  const calculateDurationDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return 1;
    }
    return diffDays;
  };

  const durationDays = calculateDurationDays();

  if (isLoading) {
    return (
      <div className="aura-details">
        <div className="container">
          <Spinner size={40} text="Retrieving equipment technical specifications..." />
        </div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="aura-details">
        <div className="container">
          <EmptyState
            title="Equipment Not Found"
            description="The requested equipment record could not be found or has been removed from the rental inventory."
            actionLabel="Return to Catalogue"
            onAction={() => navigate('/equipment')}
          />
        </div>
      </div>
    );
  }

  const availableMax = equipment.availableQuantity || 1;
  const subtotal = durationDays * quantity * equipment.dailyRate;

  const handleProceedToBooking = () => {
    const params = new URLSearchParams({
      startDate,
      endDate,
      qty: String(quantity),
    });
    navigate(`/book/${equipment.id}?${params.toString()}`);
  };

  return (
    <div className="aura-details">
      <div className="container">
        {/* Navigation Breadcrumb */}
        <Link to="/equipment" className="aura-details__back-link">
          <ArrowLeft size={16} />
          <span>Back to Equipment Catalogue</span>
        </Link>

        <div className="aura-details__layout">
          {/* Left Column: Visual Showcase Gallery */}
          <div className="aura-details__gallery">
            <div className="aura-details__main-image-wrap">
              {!imageError && equipment.images?.[activeImgIndex] ? (
                <img
                  src={equipment.images[activeImgIndex]}
                  alt={equipment.name}
                  className="aura-details__main-img"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="aura-details__fallback-box">
                  <Radio size={40} />
                  <span>{equipment.name}</span>
                </div>
              )}
            </div>

            {/* Thumbnail Row */}
            {equipment.images && equipment.images.length > 1 && (
              <div className="aura-details__thumbnail-row">
                {equipment.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImgIndex(idx)}
                    className={`aura-details__thumb-btn ${activeImgIndex === idx ? 'is-active' : ''}`}
                    aria-label={`View photo ${idx + 1} of ${equipment.name}`}
                  >
                    <img src={img} alt="" className="aura-details__thumb-img" />
                  </button>
                ))}
              </div>
            )}

            {/* Hardware Specifications Table */}
            <div className="aura-specs-card">
              <h3 className="aura-specs-title">Technical Specifications</h3>
              <table className="aura-specs-table">
                <tbody>
                  <tr>
                    <td className="aura-specs-label">Brand & Manufacturer</td>
                    <td className="aura-specs-value">{equipment.brand}</td>
                  </tr>
                  <tr>
                    <td className="aura-specs-label">Model Designation</td>
                    <td className="aura-specs-value">{equipment.model}</td>
                  </tr>
                  <tr>
                    <td className="aura-specs-label">Category</td>
                    <td className="aura-specs-value">{equipment.categoryLabel}</td>
                  </tr>
                  {equipment.dimensions && (
                    <tr>
                      <td className="aura-specs-label">Physical Dimensions</td>
                      <td className="aura-specs-value">{equipment.dimensions}</td>
                    </tr>
                  )}
                  {equipment.weight && (
                    <tr>
                      <td className="aura-specs-label">Unit Weight</td>
                      <td className="aura-specs-value">{equipment.weight}</td>
                    </tr>
                  )}
                  {equipment.powerRequirements && (
                    <tr>
                      <td className="aura-specs-label">Power Requirements</td>
                      <td className="aura-specs-value">{equipment.powerRequirements}</td>
                    </tr>
                  )}
                  {equipment.specs &&
                    Object.entries(equipment.specs).map(([key, val]) => (
                      <tr key={key}>
                        <td className="aura-specs-label">{key}</td>
                        <td className="aura-specs-value">{val}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Details & Dynamic Rental Calculator */}
          <div className="aura-details__info-col">
            <div className="aura-details__header">
              <div className="aura-details__tags">
                <span className="aura-details__brand-pill">{equipment.brand}</span>
                <Badge variant={equipment.status}>{equipment.status}</Badge>
              </div>

              <h1 className="aura-details__name">{equipment.name}</h1>
              <div className="aura-details__model-tag">Model: {equipment.model} • SKU: {equipment.id.toUpperCase()}</div>

              <div className="aura-details__price-row">
                <span className="aura-details__rate">₹{equipment.dailyRate?.toLocaleString('en-IN')}</span>
                <span className="aura-details__unit">{equipment.unit}</span>

                <div className="aura-details__stock-badge">
                  <Badge variant="available">
                    {equipment.availableQuantity} of {equipment.stock} Available
                  </Badge>
                </div>
              </div>

              <p className="aura-details__desc">{equipment.description}</p>
            </div>

            {/* Interactive Dynamic Rental Calculator */}
            <div className="aura-calc-card">
              <div className="aura-calc-header">
                <h3 className="aura-calc-title">Rental Period & Price Calculator</h3>
                <Badge variant="info">Live Estimate</Badge>
              </div>

              {/* Date Selectors */}
              <div className="aura-calc-grid">
                <div>
                  <label htmlFor="start-date" className="aura-input-label" style={{ marginBottom: '0.35rem' }}>
                    Event Start Date
                  </label>
                  <input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="aura-input"
                  />
                </div>
                <div>
                  <label htmlFor="end-date" className="aura-input-label" style={{ marginBottom: '0.35rem' }}>
                    Event End Date
                  </label>
                  <input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="aura-input"
                  />
                </div>
              </div>

              {dateError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-error)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                  <AlertCircle size={14} />
                  <span>{dateError}</span>
                </div>
              )}

              {/* Quantity Counter Control */}
              <div className="aura-calc-qty-row">
                <div>
                  <div style={{ fontWeight: 600, color: '#FFF', fontSize: '0.9rem' }}>Required Quantity</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Max {availableMax} units currently available
                  </div>
                </div>

                <div className="aura-calc-qty-control">
                  <button
                    type="button"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="aura-calc-qty-btn"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="aura-calc-qty-val">{quantity}</span>
                  <button
                    type="button"
                    disabled={quantity >= availableMax}
                    onClick={() => setQuantity((q) => Math.min(availableMax, q + 1))}
                    className="aura-calc-qty-btn"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Dynamic Calculation Breakdown */}
              <div className="aura-calc-breakdown">
                <div className="aura-calc-breakdown-row">
                  <span>Duration:</span>
                  <strong>{durationDays} {durationDays === 1 ? 'Event Day' : 'Event Days'}</strong>
                </div>
                <div className="aura-calc-breakdown-row">
                  <span>Rental Rate (₹/unit):</span>
                  <strong>₹{equipment.dailyRate?.toLocaleString('en-IN')} / day</strong>
                </div>
                <div className="aura-calc-breakdown-row">
                  <span>Units Reserved:</span>
                  <strong>{quantity} units</strong>
                </div>
                <div className="aura-calc-breakdown-row">
                  <span>Pre-Flight Bench Testing:</span>
                  <strong style={{ color: '#34D399' }}>Included (Acoustic / Lux Verified)</strong>
                </div>
                <div className="aura-calc-breakdown-row">
                  <span>Road Case & Cable Kit:</span>
                  <strong style={{ color: '#34D399' }}>Included</strong>
                </div>
              </div>

              {/* Total Row */}
              <div className="aura-calc-total-row">
                <span className="aura-calc-total-label">Estimated Total:</span>
                <span className="aura-calc-total-val">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {/* Booking CTA Button */}
              <Button
                variant="primary"
                size="lg"
                style={{ width: '100%' }}
                rightIcon={<ArrowRight size={18} />}
                disabled={Boolean(dateError)}
                onClick={handleProceedToBooking}
              >
                Proceed to Event Reservation
              </Button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.85rem', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                <Truck size={14} />
                <span>Central depot pickup or scheduled venue dispatch available</span>
              </div>
            </div>

            {/* Quality Assurance Strip */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
                <CheckCircle2 size={16} style={{ color: '#34D399', flexShrink: 0, marginTop: '2px' }} />
                <span>Authoritative availability and inventory hold will be validated via the DBMS backend contract.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
                <ShieldCheck size={16} style={{ color: 'var(--color-accent-primary)', flexShrink: 0, marginTop: '2px' }} />
                <span>All equipment insured against electronic fault; emergency replacement dispatch supported.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EquipmentDetailsPage;
