"use client";
import React, { useEffect, useState } from 'react';
import {
  StellarWalletsKit,
  WalletNetwork,
  FREIGHTER_ID,
  allowAllModules,
} from '@creit.tech/stellar-wallets-kit';
import { useAppContext } from '@/app/context';
import { Horizon } from '@stellar/stellar-sdk';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const kit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: FREIGHTER_ID,
  modules: allowAllModules(),
});

export interface ISupportedWallet {
  id: string;
  name: string;
  type: string;
  isAvailable: boolean;
  icon: string;
  url: string;
}

const WalletConnect = () => {
  const { activePubKey, setActivePubKey, setBalance } = useAppContext();
  const [isConnecting, setIsConnecting] = useState(false);

  const getBalance = async () => {
    if (activePubKey) {
      try {
        const server = new Horizon.Server('https://horizon-testnet.stellar.org');
        const account = await server.accounts().accountId(activePubKey).call();
        const balance = await account.balances;
        setBalance(balance);
      } catch (error) {
        console.error('An error occurred:', error);
      }
    }
  };

  useEffect(() => {
    getBalance();
  }, [activePubKey]);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      await kit.openModal({
        modalDialogStyles: {
          backgroundColor: "#ffffff",
          color: '#fff',
        },
        onWalletSelected: async (wallet: ISupportedWallet) => {
          try {
            kit.setWallet(wallet.id);
            const { address } = await kit.getAddress();
            console.log('Wallet address:', address);
            if (address) {
              setActivePubKey(address);
              window.localStorage.setItem('starloomAddress', address);
              toast.success('Wallet connected successfully!');
            }
          } catch (error) {
            console.error('Error getting public key:', error);
            toast.error('Failed to get public key from wallet. Please try again.');
          }
        }
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to connect wallet. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setActivePubKey(null);
    setBalance(null);
    window.localStorage.removeItem('starloomAddress');
    toast.info('Wallet disconnected');
  };

  return (
    <div>
      {!activePubKey ? (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {activePubKey.slice(0, 6)}...{activePubKey.slice(-4)}
          </span>
          <button
            onClick={disconnectWallet}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnect; 