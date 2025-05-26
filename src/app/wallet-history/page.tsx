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

const HARDCODED_WALLET = 'GDFYPJS27GCY3EPHZZX5BGLEAW2UZ5EEAA3AZEPVD6VSFLWTJ4FHOPDV';

const WalletHistory = () => {
    const [contractInteractions, setContractInteractions] = useState<ContractInteraction[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [processedIds] = useState<Set<string>>(new Set());

    const decodeXDR = (envelopeXDR: string) => {
        try {
            //console.log('Raw XDR:', envelopeXDR);
            const txEnvelope = xdr.TransactionEnvelope.fromXDR(Buffer.from(envelopeXDR, 'base64'));
            //console.log('Decoded XDR envelope:', txEnvelope);
            let tx;
            const switchValue = txEnvelope.switch();
            //console.log('Envelope type:', switchValue.name);

            if (switchValue === xdr.EnvelopeType.envelopeTypeTx()) {
                tx = txEnvelope.v1().tx();
            } else if (switchValue === xdr.EnvelopeType.envelopeTypeTxV0()) {
                tx = txEnvelope.v0().tx();
            } else if (switchValue === xdr.EnvelopeType.envelopeTypeTxFeeBump()) {
                const feeBumpTx = txEnvelope.feeBump();
                const innerTx = feeBumpTx.tx().innerTx();
                if (innerTx.switch() === xdr.EnvelopeType.envelopeTypeTx()) {
                    tx = innerTx.v1().tx();
                } else {
                    tx = innerTx.v0().tx();
                }
            } else {
                return;
            }

            const operations = tx.operations();
            //console.log('Number of operations:', operations.length);

            operations.forEach((op: xdr.Operation, index: number) => {
                //console.log(`Processing operation ${index + 1}:`, op);
                const operationBody = op.body();
                //console.log('Operation body:', operationBody);

                if (operationBody.switch() === xdr.OperationType.invokeHostFunction()) {
                    //console.log('Found invokeHostFunction operation');
                    const invokeHostFunctionOp = operationBody.value() as xdr.InvokeHostFunctionOp;
                    const hostFunction = invokeHostFunctionOp.hostFunction();
                    //console.log('Host function:', hostFunction);

                    if (hostFunction.switch() === xdr.HostFunctionType.hostFunctionTypeInvokeContract()) {
                        //console.log('Found invokeContract host function');
                        const invokeContract = hostFunction.invokeContract();
                        const contractAddress = invokeContract.contractAddress();
                        const contractId = `C${Buffer.from(contractAddress.contractId().value().data).toString('hex').toUpperCase()}`;
                        //console.log('Contract ID:', contractId);

                        if (contractId) {
                            setContractInteractions(prev => {
                                const existing = prev.find(c => c.contract_address === contractId);
                                if (existing) {
                                    return prev.map(c =>
                                        c.contract_address === contractId
                                            ? { ...c, interaction_count: c.interaction_count + 1 }
                                            : c
                                    );
                                } else {
                                    return [...prev, {
                                        contract_address: contractId,
                                        interaction_count: 1,
                                        last_interaction: new Date().toISOString()
                                    }];
                                }
                            });
                        }
                    }
                }
            });
        } catch (err) {
            console.error('Error decoding XDR:', err);
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
                .map((tx: {
                    id: string;
                    created_at: string;
                    source_account: string;
                    envelope_xdr: string;
                }) => {
                    processedIds.add(tx.id);
                    let decodedXdr = '';
                    let hasInvokeHostFunction = false;
                    try {
                        const txEnvelope = xdr.TransactionEnvelope.fromXDR(Buffer.from(tx.envelope_xdr, 'base64'));
                        const switchValue = txEnvelope.switch();
                        //console.log('Envelope type:', switchValue.name);

                        let operations;
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
                                operations = innerTx.v0().tx().operations();
                            }
                        }

                        if (operations) {
                            hasInvokeHostFunction = operations.some((op: xdr.Operation) =>
                                op.body().switch() === xdr.OperationType.invokeHostFunction()
                            );
                            if (hasInvokeHostFunction) {
                                decodedXdr = JSON.stringify(txEnvelope.value().tx(), null, 2);

                                const contractIdBytes = txEnvelope
                                    .value()                         // FeeBumpTransaction
                                    .tx()                            // Access inner transaction
                                    ._attributes.innerTx             // EnvelopeTypeTx
                                    ._value._attributes.tx           // TransactionV1
                                    ._attributes.operations[0]       // First operation
                                    ._attributes.body                // OperationBody
                                    ._value._attributes.hostFunction // HostFunction
                                    ._value._attributes.contractAddress // SCAddress
                                    ._value;
                                const contractIdBuffer = Buffer.from(contractIdBytes);
                                const contractId = StrKey.encodeContract(contractIdBuffer);
                                //console.log('Contract ID (StrKey):', contractId);

                                setContractInteractions(prev => {
                                    const existing = prev.find(c => c.contract_address === contractId);
                                    if (existing) {
                                        return prev.map(c =>
                                            c.contract_address === contractId
                                                ? { ...c, interaction_count: c.interaction_count + 1 }
                                                : c
                                        );
                                    } else {
                                        return [...prev, {
                                            contract_address: contractId,
                                            interaction_count: 1,
                                            last_interaction: new Date().toISOString()
                                        }];
                                    }
                                });
                            }
                        }
                    } catch (err) {
                        console.error('Error decoding XDR:', err);
                    }
                    return {
                        id: tx.id,
                        created_at: tx.created_at,
                        source_account: tx.source_account,
                        envelope_xdr: tx.envelope_xdr,
                        decoded_xdr: decodedXdr,
                        hasInvokeHostFunction
                    };
                })
                .filter(tx => tx.hasInvokeHostFunction);

            setTransactions(prev => [...prev, ...newTransactions]);

            if (data._links.next) {
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

            {loading && (
                <div className="flex justify-center mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            )}

            <div className="space-y-8">
                <div>
                    <h2 className="text-xl font-semibold mb-4">Contract Interactions</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contract Address
                                    </th>
                                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Interactions
                                    </th>
                                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Last Interaction
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {contractInteractions.map((interaction) => (
                                    <tr key={interaction.contract_address}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {interaction.contract_address}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {interaction.interaction_count}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(interaction.last_interaction).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletHistory; 