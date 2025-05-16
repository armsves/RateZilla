import ProjectList from '@/components/ProjectList';
import WalletConnect from '@/components/WalletConnect';

export default function StellarPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Stellar Ecosystem Projects</h1>
        <div className="flex items-center space-x-4">
          <select className="input max-w-xs">
            <option value="trending">Trending</option>
            <option value="newest">Newest</option>
            <option value="top">Top Rated</option>
          </select>
          <WalletConnect />
        </div>
      </div>
      
      <ProjectList />
    </div>
  );
} 