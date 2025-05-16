import ProjectList from '@/components/ProjectList';

export default function AptosPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Aptos Ecosystem Projects</h1>
        <div className="flex items-center space-x-4">
          <select className="input max-w-xs">
            <option value="trending">Trending</option>
            <option value="newest">Newest</option>
            <option value="top">Top Rated</option>
          </select>
        </div>
      </div>
      
      <ProjectList blockchain="aptos" />
    </div>
  );
} 