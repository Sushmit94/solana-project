// dashboard/src/polyfills.ts
// Polyfills for Node.js modules in browser

import { Buffer } from 'buffer';

// Make Buffer available globally
(window as any).Buffer = Buffer;

// Polyfill for process
if (typeof (window as any).process === 'undefined') {
  (window as any).process = {
    env: {},
    version: '',
    versions: {},
    browser: true,
  };
}

// Polyfill for global
if (typeof (window as any).global === 'undefined') {
  (window as any).global = window;
}