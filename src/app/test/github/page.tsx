"use client";

import { useState } from 'react';
import { FaGithub } from 'react-icons/fa';

export default function GitHubTestPage() {
  const [githubUrl, setGithubUrl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractGithubRepo = (url: string) => {
    if (!url) return null;
    
    try {
      // Handle different GitHub URL formats
      let match;
      
      // Format: https://github.com/username/repo
      match = url.match(/github\.com\/([^/]+)\/([^/#?]+)/);
      if (match) {
        return `${match[1]}/${match[2]}`;
      }
      
      // If it's already in owner/repo format
      if (url.split('/').length === 2 && !url.includes('://')) {
        return url;
      }
      
      // If it's an organization URL: https://github.com/organization
      match = url.match(/github\.com\/([^/#?]+)/);
      if (match && match[1]) {
        return match[1];
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting GitHub repo:', error);
      return null;
    }
  };

  const isGithubOrg = (url: string) => {
    if (!url) return false;
    
    try {
      // Check if it's a direct organization name (no specific repo)
      if (!url.includes('/')) return true;
      
      // Check if URL has a specific repo or just an organization
      // This regex matches organization URLs (those ending without another path segment)
      const match = url.match(/github\.com\/([^/]+)\/?$/);
      return !!match;
    } catch (error) {
      return false;
    }
  };

  const handleTest = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const repo = extractGithubRepo(githubUrl);
      const isOrg = isGithubOrg(githubUrl);
      
      if (!repo) {
        setError('Could not extract repository or organization from URL');
        return;
      }
      
      const endpoint = isOrg 
        ? `/api/github/org/${encodeURIComponent(repo)}` 
        : `/api/github/${encodeURIComponent(repo)}`;
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      setResult({
        repo,
        isOrg,
        endpoint,
        data
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">GitHub API Test</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Test GitHub URL Parser</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="Enter GitHub URL or owner/repo"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          />
          <button
            onClick={handleTest}
            disabled={loading || !githubUrl}
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300"
          >
            {loading ? 'Testing...' : 'Test'}
          </button>
        </div>
        
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md mb-4">
            {error}
          </div>
        )}
        
        {result && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-md">
              <h3 className="font-semibold mb-2">Parsed Result:</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>Extracted:</div>
                <div className="font-mono">{result.repo}</div>
                <div>Type:</div>
                <div>{result.isOrg ? 'Organization' : 'Repository'}</div>
                <div>Endpoint:</div>
                <div className="font-mono text-sm break-all">{result.endpoint}</div>
              </div>
            </div>
            
            <div className="p-3 bg-green-50 rounded-md">
              <h3 className="font-semibold mb-2">API Response:</h3>
              <pre className="bg-gray-900 text-green-400 p-3 rounded-md overflow-auto text-sm">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">Sample Repository URLs:</h3>
          <ul className="space-y-2">
            <li>
              <button 
                onClick={() => setGithubUrl('https://github.com/stellar/js-stellar-sdk')}
                className="flex items-center gap-2 text-blue-600 hover:underline"
              >
                <FaGithub /> stellar/js-stellar-sdk
              </button>
            </li>
            <li>
              <button 
                onClick={() => setGithubUrl('stellar/stellar-core')}
                className="flex items-center gap-2 text-blue-600 hover:underline"
              >
                <FaGithub /> stellar/stellar-core
              </button>
            </li>
          </ul>
        </div>
        
        <div className="p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">Sample Organization URLs:</h3>
          <ul className="space-y-2">
            <li>
              <button 
                onClick={() => setGithubUrl('https://github.com/stellar')}
                className="flex items-center gap-2 text-blue-600 hover:underline"
              >
                <FaGithub /> https://github.com/stellar
              </button>
            </li>
            <li>
              <button 
                onClick={() => setGithubUrl('stellar')}
                className="flex items-center gap-2 text-blue-600 hover:underline"
              >
                <FaGithub /> stellar (org name only)
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
} 