'use client';

import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { PetraWallet } from 'petra-plugin-wallet-adapter';
import { PontemWallet } from '@pontem/wallet-adapter-plugin';
import { RiseWallet } from '@rise-wallet/wallet-adapter';
import { FewchaWallet } from 'fewcha-plugin-wallet-adapter';
import { MartianWallet } from '@martianwallet/aptos-wallet-adapter';
import { MSafeWalletAdapter } from 'msafe-plugin-wallet-adapter';
import { NightlyWallet } from '@nightlylabs/aptos-wallet-adapter-plugin';
import { OpenBlockWallet } from '@openblockhq/aptos-wallet-adapter';
import { TokenPocketWallet } from '@tp-lab/aptos-wallet-adapter';
import { TrustWallet } from '@trustwallet/aptos-wallet-adapter';
import { WelldoneWallet } from '@welldone-studio/aptos-wallet-adapter';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';

const wallets = [
  new PetraWallet(),
  new PontemWallet(),
  new RiseWallet(),
  new FewchaWallet(),
  new MartianWallet(),
  new MSafeWalletAdapter(),
  new NightlyWallet(),
  new OpenBlockWallet(),
  new TokenPocketWallet(),
  new TrustWallet(),
  new WelldoneWallet(),
];

export function AptosWalletConnect() {
  const { connect, account, connected, disconnect } = useWallet();

  return (
    <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
      <div className="flex items-center space-x-4">
        {!connected ? (
          <button
            onClick={() => connect()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Connect Aptos Wallet
          </button>
        ) : (
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">
              {account?.address.slice(0, 6)}...{account?.address.slice(-4)}
            </span>
            <button
              onClick={() => disconnect()}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    </AptosWalletAdapterProvider>
  );
} 