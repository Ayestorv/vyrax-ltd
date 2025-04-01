'use client';

import React, { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

interface I18nProviderProps {
  children: React.ReactNode;
}

// This is a client component that initializes i18n
export default function I18nProvider({ children }: I18nProviderProps) {
  const [isClient, setIsClient] = useState(false);

  // Initialize i18n
  useEffect(() => {
    // This ensures i18n is initialized on the client side
    if (typeof window !== 'undefined') {
      // Force a re-render after client-side hydration
      setIsClient(true);
    }
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
} 