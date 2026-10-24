// scripts/dev/smoke-validator.mjs
// Factored validation logic and failure-case rules for Plan 02 static smoke testing.

import net from 'node:net';
import path from 'node:path';
import fs from 'node:fs';

/**
 * Checks if a given TCP host:port is currently in use.
 * Resolves to true if occupied, false if free.
 */
export async function isPortInUse(host, port, timeoutMs = 800) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let status = false;

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => {
      status = true;
      socket.destroy();
    });
    socket.once('timeout', () => {
      socket.destroy();
    });
    socket.once('error', () => {
      status = false;
    });
    socket.once('close', () => {
      resolve(status);
    });

    socket.connect(port, host);
  });
}

/**
 * Asserts that a host:port is free before launching a child process.
 * Throws if the port is already occupied.
 */
export async function assertPortFree(host, port) {
  const inUse = await isPortInUse(host, port);
  if (inUse) {
    throw new Error(`Port collision error: ${host}:${port} is already occupied by a preexisting process.`);
  }
}

/**
 * Validates a list of recorded HTTP requests for strict compliance with
 * Hard Constraint #2 (no external calls/telemetry) and subpath constraints.
 */
export function validateRequests(requests, options = {}) {
  const {
    expectedOrigin,
    expectedSubpath = '/Quackpot/',
    isReload = false,
  } = options;

  if (!expectedOrigin) {
    throw new Error('validateRequests requires expectedOrigin (e.g. "http://127.0.0.1:4173")');
  }

  if (!Array.isArray(requests) || requests.length === 0) {
    throw new Error('validateRequests received empty or invalid requests array');
  }

  for (const req of requests) {
    const parsed = new URL(req.url);

    // 1. Origin check: must match expected local host & port exactly
    if (parsed.origin !== expectedOrigin) {
      throw new Error(`External/unexpected origin violation: "${req.url}" (expected origin: "${expectedOrigin}")`);
    }

    // 2. Subpath check: pathname must strictly start with configured subpath
    // Root paths like "/assets/..." must NOT satisfy this check.
    if (!parsed.pathname.startsWith(expectedSubpath)) {
      throw new Error(
        `Subpath violation: "${parsed.pathname}" does not begin with configured subpath "${expectedSubpath}"`
      );
    }

    // 3. Status check: must not be null/failed
    if (req.status === null || req.status === undefined) {
      throw new Error(`Request has uncompleted/null status: ${req.url}`);
    }

    // 4. Allowed status codes
    const allowedStatuses = isReload ? [200, 304] : [200];
    if (!allowedStatuses.includes(req.status)) {
      throw new Error(`Unexpected HTTP status ${req.status} for ${req.url} (allowed: ${allowedStatuses.join(', ')})`);
    }

    // 5. App-authored telemetry / unexpected endpoints check
    // In our static spike, allowed resources are HTML document, bundled JS/CSS, and SVG assets
    const validExtensions = ['.html', '.js', '.css', '.svg', ''];
    const ext = path.extname(parsed.pathname).toLowerCase();
    if (!validExtensions.includes(ext) && !parsed.pathname.endsWith('/')) {
      throw new Error(`Disallowed resource type or unexpected endpoint requested: ${req.url}`);
    }
  }

  return { valid: true, count: requests.length };
}

/**
 * Validates DOM state and rendered image integrity for both initial load and reload.
 */
export function validateDomState(dom, options = {}) {
  const { expectedOrigin, expectedSubpath = '/Quackpot/' } = options;

  if (!dom || typeof dom !== 'object') {
    throw new Error('validateDomState received invalid DOM evaluation result');
  }

  if (!dom.hasApp) {
    throw new Error('DOM assertion failed: #app element is not mounted');
  }

  if (dom.h1 !== 'Quackpot Static Spike') {
    throw new Error(`DOM assertion failed: h1 text is "${dom.h1}", expected "Quackpot Static Spike"`);
  }

  if (!dom.duckSrc) {
    throw new Error('DOM assertion failed: duck image src is missing');
  }

  const expectedAssetPrefix = `${expectedOrigin}${expectedSubpath}assets/duck-placeholder`;
  if (!dom.duckSrc.startsWith(expectedAssetPrefix)) {
    throw new Error(`DOM assertion failed: duck image src "${dom.duckSrc}" does not start with "${expectedAssetPrefix}"`);
  }

  if (!dom.duckComplete) {
    throw new Error('DOM assertion failed: duck image complete attribute is false');
  }

  if (typeof dom.duckNaturalWidth !== 'number' || dom.duckNaturalWidth <= 0) {
    throw new Error(`DOM assertion failed: duck image failed to decode (naturalWidth=${dom.duckNaturalWidth})`);
  }

  if (typeof dom.duckNaturalHeight !== 'number' || dom.duckNaturalHeight <= 0) {
    throw new Error(`DOM assertion failed: duck image naturalHeight is invalid (${dom.duckNaturalHeight})`);
  }

  return { valid: true };
}

/**
 * Validates console messages and runtime exceptions.
 */
export function validateConsoleAndErrors(consoleLogs = [], runtimeExceptions = []) {
  if (runtimeExceptions.length > 0) {
    const details = runtimeExceptions.map((e) => e.text || JSON.stringify(e)).join('; ');
    throw new Error(`Runtime exception detected: ${details}`);
  }

  const errors = consoleLogs.filter((l) => l.type === 'error');
  if (errors.length > 0) {
    const details = errors.map((e) => e.text).join('; ');
    throw new Error(`Console error detected: ${details}`);
  }

  return { valid: true };
}

/**
 * Safely removes a temporary browser profile directory only if it resolves
 * strictly within the expected parent directory. Retries briefly to allow
 * OS file locks (especially on Windows) to release after child process termination.
 */
export async function safeCleanupTempDir(targetDir, expectedParentDir, maxRetries = 6, retryDelayMs = 250) {
  if (!targetDir || !expectedParentDir) {
    throw new Error('safeCleanupTempDir requires targetDir and expectedParentDir');
  }

  const resolvedTarget = path.resolve(targetDir);
  const resolvedParent = path.resolve(expectedParentDir);

  // Ensure resolvedTarget starts with resolvedParent + path.sep
  if (!resolvedTarget.startsWith(resolvedParent + path.sep)) {
    throw new Error(`Safety violation: Refusing to delete directory "${resolvedTarget}" outside of "${resolvedParent}"`);
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (fs.existsSync(resolvedTarget)) {
        fs.rmSync(resolvedTarget, { recursive: true, force: true });
      }
      return;
    } catch (err) {
      if (attempt === maxRetries) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }
}
