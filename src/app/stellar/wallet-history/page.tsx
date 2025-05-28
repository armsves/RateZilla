"use client";
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import * as StellarSdk from '@stellar/stellar-sdk';
import { useAppContext } from '@/app/context';

interface ContractInteraction {
    contract_address: string;
    interaction_count: number;
    last_interaction: string;
    methods: Map<string, number>;
    contract_name?: string;
}

interface Transaction {
    id: string;
    created_at: string;
    source_account: string;
    envelope_xdr: string;
    decoded_xdr?: string;
    hasInvokeHostFunction: boolean;
    contractAddress?: string;
    methodName?: string;
}

interface TransactionRecord {
    id: string;
    created_at: string;
    source_account: string;
    envelope_xdr: string;
}

// Map to store known contract names
const knownContracts: Record<string, string> = {
    // Add known contract addresses and their names here
    // Example: "CAABCDEF123456789": "Soroswap Token Swap"
};

const WalletHistory = () => {
    const { activePubKey } = useAppContext();
    const walletToUse = activePubKey || 'GDFYPJS27GCY3EPHZZX5BGLEAW2UZ5EEAA3AZEPVD6VSFLWTJ4FHOPDV'; // Use connected wallet or fallback to hardcoded
    
    const [contractInteractions, setContractInteractions] = useState<ContractInteraction[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());
    const [isMainnet, setIsMainnet] = useState(true); // Default to mainnet

    // Extract contract information including address and method name
    const extractContractInfo = (envelopeXDR: string): { address?: string, methodName?: string } => {
        try {
            const txEnvelope = StellarSdk.xdr.TransactionEnvelope.fromXDR(Buffer.from(envelopeXDR, 'base64'));
            
            let operations;
            const switchValue = txEnvelope.switch();
            
            if (switchValue === StellarSdk.xdr.EnvelopeType.envelopeTypeTx()) {
                operations = txEnvelope.v1().tx().operations();
            } else if (switchValue === StellarSdk.xdr.EnvelopeType.envelopeTypeTxV0()) {
                operations = txEnvelope.v0().tx().operations();
            } else if (switchValue === StellarSdk.xdr.EnvelopeType.envelopeTypeTxFeeBump()) {
                const feeBumpTx = txEnvelope.feeBump();
                const innerTx = feeBumpTx.tx().innerTx();
                if (innerTx.switch() === StellarSdk.xdr.EnvelopeType.envelopeTypeTx()) {
                    operations = innerTx.v1().tx().operations();
                } else {
                    return {};
                }
            } else {
                return {};
            }

            // Find the first invokeHostFunction operation
            for (let i = 0; i < operations.length; i++) {
                const op = operations[i];
                if (op.body().switch() === StellarSdk.xdr.OperationType.invokeHostFunction()) {
                    const invokeHostFunctionOp = op.body().invokeHostFunctionOp();
                    const hostFunction = invokeHostFunctionOp.hostFunction();
                    
                    // Check if it's a contract invocation
                    if (hostFunction.switch() === StellarSdk.xdr.HostFunctionType.hostFunctionTypeInvokeContract()) {
                        const contractInvocation = hostFunction.invokeContract();
                        const contractAddress = contractInvocation.contractAddress();
                        
                        // Extract method and parameters
                        const functionName = contractInvocation.functionName().toString();
                        
                        // Convert contract address to string format
                        let address;
                        if (contractAddress.switch() === StellarSdk.xdr.ScAddressType.scAddressTypeContract()) {
                            address = contractAddress.contractId().toString('hex');
                        }
                        
                        return {
                            address,
                            methodName: functionName
                        };
                    }
                }
            }
            
            return {};
        } catch (err) {
            console.error('Error extracting contract info:', err);
            return {};
        }
    };

    // Simplified function that just checks if a transaction has invokeHostFunction operations
    const hasInvokeHostFunction = (envelopeXDR: string): boolean => {
        try {
            const txEnvelope = StellarSdk.xdr.TransactionEnvelope.fromXDR(Buffer.from(envelopeXDR, 'base64'));
            
            let operations;
            const switchValue = txEnvelope.switch();
            
            if (switchValue === StellarSdk.xdr.EnvelopeType.envelopeTypeTx()) {
                operations = txEnvelope.v1().tx().operations();
            } else if (switchValue === StellarSdk.xdr.EnvelopeType.envelopeTypeTxV0()) {
                operations = txEnvelope.v0().tx().operations();
            } else if (switchValue === StellarSdk.xdr.EnvelopeType.envelopeTypeTxFeeBump()) {
                const feeBumpTx = txEnvelope.feeBump();
                const innerTx = feeBumpTx.tx().innerTx();
                if (innerTx.switch() === StellarSdk.xdr.EnvelopeType.envelopeTypeTx()) {
                    operations = innerTx.v1().tx().operations();
                } else {
                    return false;
                }
            } else {
                return false;
            }

            return operations.some((op: StellarSdk.xdr.Operation) => 
                op.body().switch() === StellarSdk.xdr.OperationType.invokeHostFunction()
            );
        } catch (err) {
            console.error('Error checking for invokeHostFunction:', err);
            return false;
        }
    };

    const toggleNetwork = () => {
        setIsMainnet(!isMainnet);
    };

    const fetchTransactions = async (cursor?: string, page: number = 1) => {
        if (page > 1) return;

        try {
            setLoading(true);
            // Use mainnet Horizon server for production
            const baseUrl = isMainnet 
                ? 'https://horizon.stellar.org/accounts' 
                : 'https://horizon-testnet.stellar.org/accounts';
                
            const url = cursor
                ? `${baseUrl}/${walletToUse}/transactions?cursor=${cursor}&limit=100&order=desc`
                : `${baseUrl}/${walletToUse}/transactions?limit=100&order=desc`;

            console.log("Fetching transactions from:", url);
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch transactions: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (!data || !data._embedded || !data._embedded.records) {
                return;
            }

            console.log(`Found ${data._embedded.records.length} transactions`);
            
            const newTransactions = data._embedded.records
                .filter((tx: { id: string }) => !processedIds.has(tx.id))
                .map((tx: TransactionRecord) => {
                    processedIds.add(tx.id);
                    const hasHostFunction = hasInvokeHostFunction(tx.envelope_xdr);
                    
                    let contractAddress, methodName;
                    if (hasHostFunction) {
                        const contractInfo = extractContractInfo(tx.envelope_xdr);
                        contractAddress = contractInfo.address;
                        methodName = contractInfo.methodName;
                        
                        console.log("Found transaction with host function:", tx.id);
                        if (contractAddress) {
                            console.log("Contract address:", contractAddress, "Method:", methodName || "unknown");
                        } else {
                            console.log("No contract address found in transaction");
                        }
                    }
                    
                    return {
                        id: tx.id,
                        created_at: tx.created_at,
                        source_account: tx.source_account,
                        envelope_xdr: tx.envelope_xdr,
                        decoded_xdr: hasHostFunction ? 'Has invoke host function' : '',
                        hasInvokeHostFunction: hasHostFunction,
                        contractAddress,
                        methodName
                    };
                });
                
            // Don't filter out non-invoke host function transactions yet
            // We'll process them all and add them to the list
            setTransactions(prev => [...prev, ...newTransactions]);
            
            // Extract contract addresses from operations
            const contractInteractionsFromTx: ContractInteraction[] = [];
            
            // Process each transaction
            for (const tx of newTransactions) {
                if (tx.contractAddress) {
                    // See if we already have this contract interaction
                    const existing = contractInteractionsFromTx.find(
                        ci => ci.contract_address === tx.contractAddress
                    );
                    
                    if (existing) {
                        // Update existing
                        existing.interaction_count += 1;
                        if (new Date(tx.created_at) > new Date(existing.last_interaction)) {
                            existing.last_interaction = tx.created_at;
                        }
                        
                        // Track method usage
                        if (tx.methodName) {
                            const currentCount = existing.methods.get(tx.methodName) || 0;
                            existing.methods.set(tx.methodName, currentCount + 1);
                        }
                    } else {
                        // Add new
                        const methods = new Map<string, number>();
                        if (tx.methodName) {
                            methods.set(tx.methodName, 1);
                        }
                        
                        contractInteractionsFromTx.push({
                            contract_address: tx.contractAddress,
                            interaction_count: 1,
                            last_interaction: tx.created_at,
                            methods,
                            contract_name: knownContracts[tx.contractAddress]
                        });
                    }
                }
            }
            
            console.log(`Found ${contractInteractionsFromTx.length} contract interactions`);
            
            // Merge with existing contract interactions
            if (contractInteractionsFromTx.length > 0) {
                const mergedInteractions = [...contractInteractions];
                
                contractInteractionsFromTx.forEach(newInteraction => {
                    const existingIndex = mergedInteractions.findIndex(
                        i => i.contract_address === newInteraction.contract_address
                    );
                    
                    if (existingIndex >= 0) {
                        // Update existing
                        mergedInteractions[existingIndex].interaction_count += newInteraction.interaction_count;
                        if (new Date(newInteraction.last_interaction) > new Date(mergedInteractions[existingIndex].last_interaction)) {
                            mergedInteractions[existingIndex].last_interaction = newInteraction.last_interaction;
                        }
                        
                        // Merge methods
                        newInteraction.methods.forEach((count, method) => {
                            const existingMethodCount = mergedInteractions[existingIndex].methods.get(method) || 0;
                            mergedInteractions[existingIndex].methods.set(method, existingMethodCount + count);
                        });
                    } else {
                        // Add new
                        mergedInteractions.push(newInteraction);
                    }
                });
                
                // Sort by most interactions first
                mergedInteractions.sort((a, b) => b.interaction_count - a.interaction_count);
                
                setContractInteractions(mergedInteractions);
            }

            if (data._links && data._links.next) {
                const nextCursor = data._links.next.href.split('cursor=')[1]?.split('&')[0];
                if (nextCursor) {
                    await fetchTransactions(nextCursor, page + 1);
                }
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
        // Clear existing data when network or wallet changes
        setTransactions([]);
        setContractInteractions([]);
        setError(null);
        setProcessedIds(new Set());
        
        fetchTransactions();
    }, [walletToUse, isMainnet]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Wallet History</h1>
            <div className="flex justify-between items-center mb-4">
                <p className="text-gray-600">Wallet: {walletToUse}</p>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Network:</span>
                    <button
                        onClick={toggleNetwork}
                        className={`px-3 py-1 text-sm rounded-md ${
                            isMainnet 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 text-gray-700'
                        }`}
                    >
                        Mainnet
                    </button>
                    <button
                        onClick={toggleNetwork}
                        className={`px-3 py-1 text-sm rounded-md ${
                            !isMainnet 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 text-gray-700'
                        }`}
                    >
                        Testnet
                    </button>
                </div>
            </div>

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
                            <>
                                <div className="overflow-x-auto mb-6">
                                    <table className="min-w-full bg-white border border-gray-200">
                                        <thead>
                                            <tr>
                                                <th className="px-4 py-2 border-b">Contract</th>
                                                <th className="px-4 py-2 border-b">Interaction Count</th>
                                                <th className="px-4 py-2 border-b">Methods Called</th>
                                                <th className="px-4 py-2 border-b">Last Interaction</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {contractInteractions.map((interaction, index) => (
                                                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                                    <td className="px-4 py-2 border-b">
                                                        {interaction.contract_name ? (
                                                            <div>
                                                                <div className="font-medium">{interaction.contract_name}</div>
                                                                <div className="font-mono text-xs text-gray-500 mt-1">{interaction.contract_address}</div>
                                                            </div>
                                                        ) : (
                                                            <div className="font-mono text-sm">{interaction.contract_address}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2 border-b text-center">{interaction.interaction_count}</td>
                                                    <td className="px-4 py-2 border-b">
                                                        <div className="flex flex-wrap gap-1">
                                                            {Array.from(interaction.methods.entries())
                                                                .sort((a, b) => b[1] - a[1]) // Sort by count (highest first)
                                                                .map(([method, count], idx) => (
                                                                    <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                        {method} ({count})
                                                                    </span>
                                                                ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2 border-b">
                                                        {new Date(interaction.last_interaction).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                <h3 className="text-lg font-semibold mb-3">Interaction Summary</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                        <h4 className="font-medium text-gray-700 mb-2">Most Active Contracts</h4>
                                        <div className="space-y-2">
                                            {[...contractInteractions]
                                                .sort((a, b) => b.interaction_count - a.interaction_count)
                                                .slice(0, 5)
                                                .map((interaction, index) => (
                                                    <div key={index} className="flex items-center">
                                                        <div className="w-full bg-gray-200 rounded-full h-4 mr-2">
                                                            <div 
                                                                className="bg-blue-600 h-4 rounded-full" 
                                                                style={{ 
                                                                    width: `${Math.min(100, (interaction.interaction_count / contractInteractions[0].interaction_count) * 100)}%` 
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-sm font-medium w-8 text-right">{interaction.interaction_count}</span>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500">
                                            {contractInteractions[0].contract_name || 
                                             `${contractInteractions[0].contract_address.slice(0, 8)}...`}
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                        <h4 className="font-medium text-gray-700 mb-2">Popular Methods</h4>
                                        <div className="space-y-3">
                                            {contractInteractions
                                                .flatMap(interaction => 
                                                    Array.from(interaction.methods.entries())
                                                        .map(([method, count]) => ({ 
                                                            method, 
                                                            count, 
                                                            contract: interaction.contract_name || interaction.contract_address
                                                        }))
                                                )
                                                .sort((a, b) => b.count - a.count)
                                                .slice(0, 5)
                                                .map((item, index) => (
                                                    <div key={index} className="flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <span className="w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-full text-xs mr-2">
                                                                {index + 1}
                                                            </span>
                                                            <div>
                                                                <span className="font-medium text-sm">{item.method}</span>
                                                                <span className="text-xs text-gray-500 block">
                                                                    {typeof item.contract === 'string' && item.contract.length > 16 
                                                                        ? `${item.contract.slice(0, 8)}...${item.contract.slice(-8)}`
                                                                        : item.contract}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
                                                            {item.count} calls
                                                        </span>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <h4 className="font-medium text-gray-700 mb-3">Detailed Interaction Counts</h4>
                                    <ul className="space-y-2">
                                        {contractInteractions.map((interaction, index) => (
                                            <li key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                                                <div className="flex items-center mb-2 sm:mb-0">
                                                    <span className="w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-full text-xs mr-2">
                                                        {index + 1}
                                                    </span>
                                                    <div>
                                                        {interaction.contract_name && (
                                                            <span className="font-medium block">
                                                                {interaction.contract_name}
                                                            </span>
                                                        )}
                                                        <span className="font-mono text-xs text-gray-600">
                                                            {interaction.contract_address.slice(0, 12)}...{interaction.contract_address.slice(-8)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
                                                        {interaction.interaction_count} {interaction.interaction_count === 1 ? 'interaction' : 'interactions'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(interaction.last_interaction).toLocaleDateString()}
                                                    </div>
                                                    <div className="flex flex-wrap gap-1 mt-1 sm:mt-0">
                                                        {Array.from(interaction.methods.entries())
                                                            .sort((a, b) => b[1] - a[1])
                                                            .slice(0, 3)
                                                            .map(([method, count], idx) => (
                                                                <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                                    {method.length > 12 ? `${method.slice(0, 10)}...` : method}
                                                                </span>
                                                            ))}
                                                        {interaction.methods.size > 3 && (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                                +{interaction.methods.size - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        ) : (
                            <p className="text-gray-500">No contract interactions found. Try interacting with a smart contract first.</p>
                        )}
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
                        {transactions.filter(tx => tx.hasInvokeHostFunction).length > 0 ? (
                            <div className="space-y-4">
                                {transactions
                                    .filter(tx => tx.hasInvokeHostFunction)
                                    .map(tx => (
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
                                                    {tx.contractAddress && (
                                                        <p className="text-sm text-blue-600 mt-1">
                                                            Contract: {knownContracts[tx.contractAddress] || tx.contractAddress}
                                                        </p>
                                                    )}
                                                    {tx.methodName && (
                                                        <p className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded mt-1 inline-block">
                                                            Method: {tx.methodName}
                                                        </p>
                                                    )}
                                                </div>
                                                <a 
                                                    href={`https://${isMainnet ? '' : 'testnet.'}stellarexpert.io/tx/${tx.id}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline text-sm"
                                                >
                                                    View on Explorer
                                                </a>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        ) : (
                            <p className="text-gray-500">No smart contract transactions found for this wallet.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default WalletHistory; 