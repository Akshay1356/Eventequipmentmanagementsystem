import test from 'node:test';
import assert from 'node:assert/strict';
import { BookingService } from '../src/services/booking.service.js';

test('Booking Logic - Correctly calculates duration in days', () => {
  const days1 = BookingService.calculateDays('2026-11-01', '2026-11-02');
  assert.equal(days1, 1);

  const days3 = BookingService.calculateDays('2026-11-01', '2026-11-04');
  assert.equal(days3, 3);

  // Throws if end date is equal or before start date
  assert.throws(() => {
    BookingService.calculateDays('2026-11-04', '2026-11-01');
  });
});

test('Booking Logic - Generates unique reference code', () => {
  const ref1 = BookingService.generateReference();
  const ref2 = BookingService.generateReference();
  assert.ok(ref1.startsWith('BK-'));
  assert.notEqual(ref1, ref2);
});
