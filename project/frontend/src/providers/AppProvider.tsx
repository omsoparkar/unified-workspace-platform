'use client';

import React from 'react';
import { QueryProvider } from './QueryProvider';
import { AuthProvider } from '../contexts/AuthContext';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  );
}
