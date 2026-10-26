// scripts/dev/smoke-validator.test.mjs
// Unit tests for smoke validation logic and failure-case boundaries.

import test from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

import {
  isPortInUse,
  assertPortFree,
  validateRequests,
  validateDomState,
  validateConsoleAndErrors,
  safeCleanupTempDir,
  fetchWithTimeout,
  waitForEndpoint,
  waitForCdpEvent,
} from './smoke-validator.mjs';

const VALID_ORIGIN = 'http://127.0.0.1:4173';
const VALID_SUBPATH = '/Quackpot/';

test('assertPortFree: throws when port is already occupied', async () => {
  const server = net.createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const occupiedPort = server.address().port;

  try {
    const inUse = await isPortInUse('127.0.0.1', occupiedPort);
    assert.equal(inUse, true);

    await assert.rejects(
      async () => assertPortFree('127.0.0.1', occupiedPort),
      /Port collision error: 127\.0\.0\.1:\d+ is already occupied/
    );
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('validateRequests: accepts valid local subpath requests with 200', () => {
  const requests = [
    { url: `${VALID_ORIGIN}/Quackpot/`, status: 200 },
    { url: `${VALID_ORIGIN}/Quackpot/assets/index.js`, status: 200 },
    { url: `${VALID_ORIGIN}/Quackpot/assets/index.css`, status: 200 },
    { url: `${VALID_ORIGIN}/Quackpot/assets/duck.svg`, status: 200 },
  ];

  const result = validateRequests(requests, {
    expectedOrigin: VALID_ORIGIN,
    expectedSubpath: VALID_SUBPATH,
    isReload: false,
  });

  assert.equal(result.valid, true);
  assert.equal(result.count, 4);
});

test('validateRequests: rejects external origin requests (Constraint #2)', () => {
  const requests = [
    { url: `${VALID_ORIGIN}/Quackpot/`, status: 200 },
    { url: 'https://cdn.example.com/lib.js', status: 200 },
  ];

  assert.throws(
    () =>
      validateRequests(requests, {
        expectedOrigin: VALID_ORIGIN,
        expectedSubpath: VALID_SUBPATH,
      }),
    /External\/unexpected origin violation: "https:\/\/cdn\.example\.com\/lib\.js"/
  );
});

test('validateRequests: root /assets/... does NOT satisfy /Quackpot/ subpath', () => {
  const requests = [
    { url: `${VALID_ORIGIN}/Quackpot/`, status: 200 },
    { url: `${VALID_ORIGIN}/assets/index.js`, status: 200 }, // ROOT PATH
  ];

  assert.throws(
    () =>
      validateRequests(requests, {
        expectedOrigin: VALID_ORIGIN,
        expectedSubpath: VALID_SUBPATH,
      }),
    /Subpath violation: "\/assets\/index\.js" does not begin with configured subpath "\/Quackpot\/"/
  );
});

test('validateRequests: rejects uncompleted or null status requests', () => {
  const requests = [
    { url: `${VALID_ORIGIN}/Quackpot/`, status: 200 },
    { url: `${VALID_ORIGIN}/Quackpot/assets/duck.svg`, status: null },
  ];

  assert.throws(
    () =>
      validateRequests(requests, {
        expectedOrigin: VALID_ORIGIN,
        expectedSubpath: VALID_SUBPATH,
      }),
    /Request has uncompleted\/null status/
  );
});

test('validateRequests: rejects failed HTTP responses (404/500)', () => {
  const requests = [
    { url: `${VALID_ORIGIN}/Quackpot/`, status: 200 },
    { url: `${VALID_ORIGIN}/Quackpot/assets/missing.js`, status: 404 },
  ];

  assert.throws(
    () =>
      validateRequests(requests, {
        expectedOrigin: VALID_ORIGIN,
        expectedSubpath: VALID_SUBPATH,
      }),
    /Unexpected HTTP status 404/
  );
});

test('validateRequests: reload accepts 304, rejects 500', () => {
  const reloadRequests = [
    { url: `${VALID_ORIGIN}/Quackpot/`, status: 200 },
    { url: `${VALID_ORIGIN}/Quackpot/assets/index.js`, status: 304 },
  ];

  const result = validateRequests(reloadRequests, {
    expectedOrigin: VALID_ORIGIN,
    expectedSubpath: VALID_SUBPATH,
    isReload: true,
  });
  assert.equal(result.valid, true);

  const badReload = [
    { url: `${VALID_ORIGIN}/Quackpot/`, status: 200 },
    { url: `${VALID_ORIGIN}/Quackpot/assets/index.js`, status: 500 },
  ];
  assert.throws(
    () =>
      validateRequests(badReload, {
        expectedOrigin: VALID_ORIGIN,
        expectedSubpath: VALID_SUBPATH,
        isReload: true,
      }),
    /Unexpected HTTP status 500/
  );
});

test('validateDomState: validates rendered elements and decoded SVG', () => {
  const validDom = {
    hasApp: true,
    h1: 'Quackpot',
    duckSrc: `${VALID_ORIGIN}/Quackpot/assets/duck-placeholder-abc.svg`,
    duckComplete: true,
    duckNaturalWidth: 120,
    duckNaturalHeight: 120,
  };

  const res = validateDomState(validDom, {
    expectedOrigin: VALID_ORIGIN,
    expectedSubpath: VALID_SUBPATH,
  });
  assert.equal(res.valid, true);
});

test('validateDomState: rejects missing #app or wrong title', () => {
  assert.throws(
    () => validateDomState({ hasApp: false }),
    /DOM assertion failed: #app element is not mounted/
  );

  assert.throws(
    () => validateDomState({ hasApp: true, h1: 'Wrong Title' }),
    /DOM assertion failed: h1 text is "Wrong Title"/
  );
});

test('validateDomState: rejects undecoded or broken SVG image (naturalWidth = 0)', () => {
  const brokenImgDom = {
    hasApp: true,
    h1: 'Quackpot',
    duckSrc: `${VALID_ORIGIN}/Quackpot/assets/duck-placeholder-abc.svg`,
    duckComplete: true,
    duckNaturalWidth: 0,
    duckNaturalHeight: 0,
  };

  assert.throws(
    () =>
      validateDomState(brokenImgDom, {
        expectedOrigin: VALID_ORIGIN,
        expectedSubpath: VALID_SUBPATH,
      }),
    /DOM assertion failed: duck image failed to decode \(naturalWidth=0\)/
  );
});

test('validateDomState: rejects image src referencing wrong subpath', () => {
  const wrongSubpathDom = {
    hasApp: true,
    h1: 'Quackpot',
    duckSrc: `${VALID_ORIGIN}/wrong-path/assets/duck-placeholder-abc.svg`,
    duckComplete: true,
    duckNaturalWidth: 120,
    duckNaturalHeight: 120,
  };

  assert.throws(
    () =>
      validateDomState(wrongSubpathDom, {
        expectedOrigin: VALID_ORIGIN,
        expectedSubpath: VALID_SUBPATH,
      }),
    /DOM assertion failed: duck image src .* does not start with/
  );
});

test('validateConsoleAndErrors: catches console errors and runtime exceptions', () => {
  assert.throws(
    () => validateConsoleAndErrors([], [{ text: 'Uncaught TypeError: something is undefined' }]),
    /Runtime exception detected: Uncaught TypeError/
  );

  assert.throws(
    () => validateConsoleAndErrors([{ type: 'error', text: 'Failed to load resource' }], []),
    /Console error detected: Failed to load resource/
  );

  const clean = validateConsoleAndErrors([{ type: 'info', text: 'App mounted' }], []);
  assert.equal(clean.valid, true);
});

test('safeCleanupTempDir: refuses deletion outside parent directory', async () => {
  const parent = os.tmpdir();
  const dangerousTarget = path.resolve(parent, '..', 'should_not_delete');

  await assert.rejects(
    async () => await safeCleanupTempDir(dangerousTarget, parent),
    /Safety violation: Refusing to delete directory/
  );
});

test('safeCleanupTempDir: successfully removes directory inside parent', async () => {
  const parent = os.tmpdir();
  const testSubdir = fs.mkdtempSync(path.join(parent, 'quackpot-test-'));
  assert.equal(fs.existsSync(testSubdir), true);

  await safeCleanupTempDir(testSubdir, parent);
  assert.equal(fs.existsSync(testSubdir), false);
});

test('waitForCdpEvent: resolves when event arrives within timeout', async () => {
  const emitter = {
    handlers: new Map(),
    on(event, fn) {
      if (!this.handlers.has(event)) this.handlers.set(event, []);
      this.handlers.get(event).push(fn);
    },
    off(event, fn) {
      if (this.handlers.has(event)) {
        const list = this.handlers.get(event);
        const idx = list.indexOf(fn);
        if (idx !== -1) list.splice(idx, 1);
      }
    },
    emit(event, data) {
      for (const fn of this.handlers.get(event) || []) fn(data);
    },
  };

  const waitPromise = waitForCdpEvent(emitter, 'Page.loadEventFired', 1000);
  emitter.emit('Page.loadEventFired', { timestamp: 12345 });
  const result = await waitPromise;
  assert.deepEqual(result, { timestamp: 12345 });
});

test('waitForCdpEvent: rejects when event does not arrive before timeout', async () => {
  const emitter = {
    handlers: new Map(),
    on(event, fn) {},
    off(event, fn) {},
  };

  await assert.rejects(
    async () => await waitForCdpEvent(emitter, 'Page.loadEventFired', 150),
    /Timed out waiting for CDP event "Page\.loadEventFired" after 150ms/
  );
});

test('waitForCdpEvent: rejects promptly when connection closes before event', async () => {
  const emitter = {
    handlers: new Map(),
    on(event, fn) {
      if (!this.handlers.has(event)) this.handlers.set(event, []);
      this.handlers.get(event).push(fn);
    },
    off(event, fn) {
      if (this.handlers.has(event)) {
        const list = this.handlers.get(event);
        const idx = list.indexOf(fn);
        if (idx !== -1) list.splice(idx, 1);
      }
    },
    emit(event, data) {
      for (const fn of this.handlers.get(event) || []) fn(data);
    },
  };

  const waitPromise = waitForCdpEvent(emitter, 'Page.loadEventFired', 2000);
  emitter.emit('close');
  await assert.rejects(
    async () => await waitPromise,
    /CDP session closed while waiting for event "Page\.loadEventFired"/
  );
});

test('fetchWithTimeout / waitForEndpoint: bounds request and rejects promptly on nonresponding local HTTP endpoint', async () => {
  // Spin up a server that accepts TCP connection but sends no response
  const sockets = new Set();
  const hungServer = net.createServer((socket) => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
  });
  await new Promise((resolve) => hungServer.listen(0, '127.0.0.1', resolve));
  const port = hungServer.address().port;
  const targetUrl = `http://127.0.0.1:${port}/hung`;

  try {
    const start = Date.now();
    await assert.rejects(
      async () => await fetchWithTimeout(targetUrl, {}, 250),
      /HTTP request to http:\/\/127\.0\.0\.1:\d+\/hung timed out after 250ms/
    );
    const elapsed = Date.now() - start;
    assert.ok(elapsed < 1200, `Expected timeout in ~250ms, took ${elapsed}ms`);

    // Also test waitForEndpoint loop bounding
    const loopStart = Date.now();
    await assert.rejects(
      async () =>
        await waitForEndpoint(targetUrl, {
          totalTimeoutMs: 600,
          perRequestTimeoutMs: 200,
          retryDelayMs: 50,
        }),
      /failed to respond within 600ms/
    );
    const loopElapsed = Date.now() - loopStart;
    assert.ok(loopElapsed < 1800, `Expected loop timeout in ~600ms, took ${loopElapsed}ms`);
  } finally {
    for (const s of sockets) {
      try { s.destroy(); } catch {}
    }
    await new Promise((resolve) => hungServer.close(resolve));
  }
});
