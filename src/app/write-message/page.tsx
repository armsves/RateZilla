"use client";
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import * as Client from '../../../packages/stellarContract/dist/index.js';
import { useAppContext } from '@/app/context';
import { StellarWalletsKit, WalletNetwork, FREIGHTER_ID, allowAllModules } from '@creit.tech/stellar-wallets-kit';
import { TransactionBuilder, Networks, SorobanRpc, BASE_FEE, Contract, Transaction, xdr, Address } from '@stellar/stellar-sdk';

const kit = new StellarWalletsKit({
    network: WalletNetwork.TESTNET,
    selectedWalletId: FREIGHTER_ID,
    modules: allowAllModules(),
});

const rpc = new SorobanRpc.Server('https://soroban-testnet.stellar.org:443');

const WriteMessage = () => {
    const { activePubKey } = useAppContext();
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activePubKey) {
            toast.error('Please connect your wallet first');
            return;
        }
        if (!title.trim() || !text.trim()) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            setLoading(true);
            
            const contract = new Client.Client({
                ...Client.networks.testnet,
                rpcUrl: 'https://soroban-testnet.stellar.org:443'
            });

            // Prepare the transaction
            const transaction = await contract.write_message({
                author: activePubKey,
                title: title.trim(),
                text: text.trim()
            });

            // Get the transaction XDR
            const txXDR = transaction.toXDR();
            console.log('Transaction XDR:', txXDR);

            // Sign the transaction with the wallet
            const signedXDR = await kit.signTransaction(txXDR);
            console.log('Signed XDR:', signedXDR);

            // Parse the signed transaction
            const tx = TransactionBuilder.fromXDR(signedXDR.signedTxXdr, Networks.TESTNET);

            // Submit the signed transaction
            const result = await rpc.sendTransaction(tx);
            console.log('Transaction result:', result);

            const CONTRACT_ID = "CAZH5SRKC6S5K7KW4IXXYPMIXDDT33VS6JPXHHCDPLBMUEQ7O2523ZCS";
            const NETWORK_PASSPHRASE = Networks.TESTNET;
            const SOROBAN_URL = "https://soroban-testnet.stellar.org:443";
            const author = new Address(activePubKey);
            const server = new SorobanRpc.Server(SOROBAN_URL);
            const account = await server.getAccount(activePubKey);
      
            const contract2 = new Contract(CONTRACT_ID);
            // const instance = contract.getFootprint();
      
            const tx2 = new TransactionBuilder(account, {
              fee: BASE_FEE,
              networkPassphrase: NETWORK_PASSPHRASE,
            })
            .addOperation(
                contract2.call(
                  "write_message",
                  author.toScVal(),               // Address
                  xdr.ScVal.scvString(title),     // title
                  xdr.ScVal.scvString(text)       // text
                )
              )
              .setTimeout(30)
              .build();

              const preparedTx = await server.prepareTransaction(tx2);

              const signedXdr = await kit.signTransaction(
                preparedTx.toEnvelope().toXDR("base64"),
                {
                  networkPassphrase: NETWORK_PASSPHRASE,
                },
              );
        
              const signedTx = TransactionBuilder.fromXDR(
                signedXdr.signedTxXdr,
                NETWORK_PASSPHRASE,
              ) as Transaction;
        
              const txResult = await server.sendTransaction(signedTx);
        
              if (txResult.status !== "PENDING") {
                throw new Error("Something went Wrong");
              }
              const hash = txResult.hash;
              const getResponse = await server.getTransaction(hash);
              console.log(getResponse);

            toast.success('Message written successfully!');
            setTitle('');
            setText('');
        } catch (error) {
            console.error('Error writing message:', error);
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('Failed to write message');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Write Message</h1>
            
            {!activePubKey ? (
                <div className="text-center py-8 text-gray-600">
                    Please connect your wallet to write a message
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="max-w-lg">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Author (Wallet Address)
                        </label>
                        <div className="px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-600">
                            {activePubKey}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Message title"
                            disabled={loading}
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                            Message
                        </label>
                        <textarea
                            id="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            rows={4}
                            placeholder="Enter your message..."
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Writing...
                            </div>
                        ) : (
                            'Write Message'
                        )}
                    </button>
                </form>
            )}
        </div>
    );
};

export default WriteMessage; 