import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';

import { pool } from '../src/config/database.js';

test('Health Route - GET /api/health returns operational status', async () => {
  const server = app.listen(0);
  const address = server.address();
  const port = address.port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/health`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'UP');
    assert.ok(body.data.timestamp);
    assert.ok('database' in body.data);
  } finally {
    server.close();
    await pool.end();
  }
});
