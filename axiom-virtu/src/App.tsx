/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider } from './context/AppContext';
import { MobileContainer } from './components/MobileContainer';

export default function App() {
  return (
    <AppProvider>
      <MobileContainer />
    </AppProvider>
  );
}

