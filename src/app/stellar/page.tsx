"use client";
import { useState } from 'react';
import ProjectList from '@/components/ProjectList';
import WalletConnect from '@/components/WalletConnect';

export default function StellarPage() {
  const [sortOption, setSortOption] = useState('newest');

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Stellar Projects</h1>
          <p className="text-xl text-gray-600 mt-2">
            Discover the best projects built on the Stellar blockchain
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            className="px-3 py-2 border border-gray-300 rounded-md"
            value={sortOption}
            onChange={handleSortChange}
          >
            <option value="newest">Newest</option>
            <option value="trending">Trending</option>
            <option value="top">Top Rated</option>
          </select>
          <WalletConnect />
        </div>
      </div>

      <ProjectList blockchain="stellar" />
    </main>
  );
} 