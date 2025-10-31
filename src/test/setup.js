import dotenv from 'dotenv';
dotenv.config();

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import * as React from 'react';
import { act as domAct } from 'react-dom/test-utils';

// React 19 exposes act via react-dom/test-utils, provide compatibility shim
if (typeof React.act !== 'function') {
  try {
    Object.defineProperty(React, 'act', {
      value: domAct,
      configurable: true,
      writable: true
    });
  } catch (error) {
    // Ignore if the property cannot be redefined (React versions may provide their own implementation)
  }
}

// Inform Testing Library that act environment is available
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Cleanup after each test
afterEach(() => {
  cleanup();
});
