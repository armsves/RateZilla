"use client";
import React from 'react';
import Link from 'next/link';

interface Contract {
  id: number;
  name: string;
  address: string;
  type: string;
  interactions: number;
  lastInteraction: Date | string;
}

interface ContractListProps {
  contracts: Contract[];
}

const ContractList: React.FC<ContractListProps> = ({ contracts }) => {
  return (
    <div className="space-y-4">
      {contracts.map((contract) => (
        <div key={contract.id} className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-lg">{contract.name}</h3>
              <p className="text-sm text-gray-500 font-mono break-all">
                {contract.address}
              </p>
              <div className="flex space-x-4 mt-2">
                <span className="text-sm text-gray-600">
                  Type: <span className="font-medium">{contract.type}</span>
                </span>
                <span className="text-sm text-gray-600">
                  Interactions: <span className="font-medium">{contract.interactions}</span>
                </span>
              </div>
            </div>
            <Link
              href={`https://stellar.expert/explorer/public/contract/${contract.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              View on Explorer
            </Link>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Last interaction: {new Date(contract.lastInteraction).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContractList; 