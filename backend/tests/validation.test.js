import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';

test('Auth Validation - Rejects registration with invalid email or short password', async () => {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'A', // too short
        email: 'invalid-email',
        password: '123', // < 6 chars
      }),
    });

    assert.equal(res.status, 422);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.ok(Array.isArray(body.details));
    assert.ok(body.details.length >= 2);
  } finally {
    server.close();
  }
});

test('Auth Validation - Rejects login with missing credentials', async () => {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    assert.equal(res.status, 422);
    const body = await res.json();
    assert.equal(body.success, false);
  } finally {
    server.close();
  }
});

test('Booking Validation - Rejects unauthenticated booking creation', async () => {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ equipmentId: 1, quantity: 2 }],
        startDate: '2026-11-01',
        endDate: '2026-11-03',
      }),
    });

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
  } finally {
    server.close();
  }
});
