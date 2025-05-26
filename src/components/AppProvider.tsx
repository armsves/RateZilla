'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppContextProvider } from '@/app/context';

const queryClient = new QueryClient();

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContextProvider>
        {children}
      </AppContextProvider>
    </QueryClientProvider>
  );
} 