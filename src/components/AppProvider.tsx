'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiConfig } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { wagmiConfig, chains } from './EVMWalletConnect';
import '@rainbow-me/rainbowkit/styles.css';
import { AppContextProvider } from '@/app/context';

const queryClient = new QueryClient();

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains} initialChain={chains[0]}>
          <AppContextProvider>
            {children}
          </AppContextProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
} 