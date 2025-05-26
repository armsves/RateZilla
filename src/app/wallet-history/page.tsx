"use client";
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { xdr, StrKey } from '@stellar/stellar-sdk';
import * as Client from '../../../packages/stellarContract/dist/index.js';

interface ContractInteraction {
    contract_address: string;
    interaction_count: number;
    last_interaction: string;
}

interface Transaction {
    id: string;
    created_at: string;
    source_account: string;
    envelope_xdr: string;
    decoded_xdr?: string;
    hasInvokeHostFunction: boolean;
}

interface TransactionRecord {
    id: string;
    created_at: string;
    source_account: string;
    envelope_xdr: string;
}

const HARDCODED_WALLET = 'GDFYPJS27GCY3EPHZZX5BGLEAW2UZ5EEAA3AZEPVD6VSFLWTJ4FHOPDV';

const WalletHistory = () => {
    const [contractInteractions, setContractInteractions] = useState<ContractInteraction[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [processedIds] = useState<Set<string>>(new Set());

    // Simplified function that just checks if a transaction has invokeHostFunction operations
    const hasInvokeHostFunction = (envelopeXDR: string): boolean => {
        try {
            const txEnvelope = xdr.TransactionEnvelope.fromXDR(Buffer.from(envelopeXDR, 'base64'));
            
            let operations;
            const switchValue = txEnvelope.switch();
            
            if (switchValue === xdr.EnvelopeType.envelopeTypeTx()) {
                operations = txEnvelope.v1().tx().operations();
            } else if (switchValue === xdr.EnvelopeType.envelopeTypeTxV0()) {
                operations = txEnvelope.v0().tx().operations();
            } else if (switchValue === xdr.EnvelopeType.envelopeTypeTxFeeBump()) {
                const feeBumpTx = txEnvelope.feeBump();
                const innerTx = feeBumpTx.tx().innerTx();
                if (innerTx.switch() === xdr.EnvelopeType.envelopeTypeTx()) {
                    operations = innerTx.v1().tx().operations();
                } else {
                    return false;
                }
            } else {
                return false;
            }

            return operations.some((op: xdr.Operation) => 
                op.body().switch() === xdr.OperationType.invokeHostFunction()
            );
        } catch (err) {
            console.error('Error checking for invokeHostFunction:', err);
            return false;
        }
    };

    const fetchTransactions = async (cursor?: string, page: number = 1) => {
        if (page > 1) return;

        try {
            setLoading(true);
            const baseUrl = 'https://horizon.stellar.org/accounts';
            const url = cursor
                ? `${baseUrl}/${HARDCODED_WALLET}/transactions?cursor=${cursor}&limit=100&order=asc`
                : `${baseUrl}/${HARDCODED_WALLET}/transactions?limit=100&order=asc`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch transactions: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (!data || !data._embedded || !data._embedded.records) {
                return;
            }

            const newTransactions = data._embedded.records
                .filter((tx: { id: string }) => !processedIds.has(tx.id))
                .map((tx: TransactionRecord) => {
                    processedIds.add(tx.id);
                    const hasHostFunction = hasInvokeHostFunction(tx.envelope_xdr);
                    
                    return {
                        id: tx.id,
                        created_at: tx.created_at,
                        source_account: tx.source_account,
                        envelope_xdr: tx.envelope_xdr,
                        decoded_xdr: hasHostFunction ? 'Has invoke host function' : '',
                        hasInvokeHostFunction: hasHostFunction
                    };
                })
                .filter((tx: Transaction) => tx.hasInvokeHostFunction);

            setTransactions(prev => [...prev, ...newTransactions]);

            // TODO: Extract contract addresses and update interactions
            // This part is complex due to Stellar SDK type issues
            // Will be implemented in a future update

            if (data._links && data._links.next) {
                const nextCursor = data._links.next.href.split('cursor=')[1].split('&')[0];
                await fetchTransactions(nextCursor, page + 1);
            }
        } catch (err) {
            console.error('Error fetching transactions:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
            toast.error('Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    useEffect(() => {
        const readContract = async () => {
            try {
                const contract = new Client.Client({
                    ...Client.networks.testnet,
                    rpcUrl: 'https://soroban-testnet.stellar.org:443'
                });
                
                const { result } = await contract.read_latest({});
                console.log('result: ', result);
            } catch (error) {
                console.error('Error reading contract:', error);
            }
        };

        readContract();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Wallet History</h1>
            <p className="text-gray-600 mb-4">Wallet: {HARDCODED_WALLET}</p>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center">
                    <p>Loading transactions...</p>
                </div>
            ) : (
                <>
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">Contract Interactions</h2>
                        {contractInteractions.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border border-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 border-b">Contract Address</th>
                                            <th className="px-4 py-2 border-b">Interaction Count</th>
                                            <th className="px-4 py-2 border-b">Last Interaction</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {contractInteractions.map((interaction, index) => (
                                            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                                <td className="px-4 py-2 border-b">{interaction.contract_address}</td>
                                                <td className="px-4 py-2 border-b text-center">{interaction.interaction_count}</td>
                                                <td className="px-4 py-2 border-b">
                                                    {new Date(interaction.last_interaction).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500">No contract interactions found.</p>
                        )}
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
                        {transactions.length > 0 ? (
                            <div className="space-y-4">
                                {transactions.map(tx => (
                                    <div key={tx.id} className="border border-gray-200 rounded p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium">ID: {tx.id}</p>
                                                <p className="text-sm text-gray-600">
                                                    {new Date(tx.created_at).toLocaleString()}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Source: {tx.source_account}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No transactions found.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default WalletHistory; 