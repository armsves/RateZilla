import ProjectList from '@/components/ProjectList';
import { EVMWalletConnect } from '@/components/EVMWalletConnect';

export default function PolkadotPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Polkadot Ecosystem Projects</h1>
        <div className="flex items-center space-x-4">
          <select className="input max-w-xs">
            <option value="trending">Trending</option>
            <option value="newest">Newest</option>
            <option value="top">Top Rated</option>
          </select>
          <EVMWalletConnect />
        </div>
      </div>
      
      <ProjectList blockchain="polkadot" />
    </div>
  );
} 