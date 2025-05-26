'use client';

import { useState, useEffect } from 'react';

export default function TestPage() {
  const [githubTestResult, setGithubTestResult] = useState<any>(null);
  const [githubRepoResult, setGithubRepoResult] = useState<any>(null);
  const [repoInput, setRepoInput] = useState('kalepail/KALE-sc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testGithubAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/github/test');
      const data = await response.json();
      
      setGithubTestResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const testGithubRepo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/github/${encodeURIComponent(repoInput)}`);
      const data = await response.json();
      
      setGithubRepoResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">API Testing Page</h1>
      
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">GitHub API Test</h2>
        <button 
          onClick={testGithubAPI}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors mb-4"
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Test GitHub API'}
        </button>
        
        {githubTestResult && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Test Results:</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
              {JSON.stringify(githubTestResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Test Specific GitHub Repo</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={repoInput}
            onChange={(e) => setRepoInput(e.target.value)}
            className="flex-1 border rounded px-2 py-1"
            placeholder="owner/repo"
          />
          <button 
            onClick={testGithubRepo}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            disabled={loading}
          >
            Test Repo
          </button>
        </div>
        
        {githubRepoResult && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Repo Results:</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
              {JSON.stringify(githubRepoResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      {error && (
        <div className="text-red-500 mt-4">
          Error: {error}
        </div>
      )}
    </div>
  );
} 