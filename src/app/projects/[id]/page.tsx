"use client";

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ContractList from '@/components/ContractList';
import ProjectRating from '@/components/ProjectRating';
import ProjectSocialMetrics from '@/components/ProjectSocialMetrics';
import ProjectLogo from '@/components/ProjectLogo';

interface Category {
  id: number;
  name: string;
}

interface Contract {
  id: number;
  name: string;
  address: string;
  type: string;
  interactions: number;
  lastInteraction: string;
}

interface Project {
  id: number;
  name: string;
  description: string | null;
  website: string | null;
  githubUrl: string | null;
  twitterUrl: string | null;
  logoUrl: string | null;
  blockchain: string;
  createdAt: string;
  contracts: Contract[];
  categories: Category[];
  socialMetrics: {
    githubStars: number;
    twitterFollowers: number;
    githubForks: number;
    projectFreshness: number;
  } | null;
}

interface Props {
  params: {
    id: string;
  };
}

export default function ProjectPage({ params }: Props) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/projects/${params.id}`);
        
        if (response.status === 404) {
          notFound();
        }
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setProject(data.project);
      } catch (err) {
        console.error('Failed to fetch project:', err);
        setError('Failed to load project. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [params.id]);

  if (loading) {
    return (
      <main className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <p className="text-xl">Loading project details...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <p className="text-xl text-red-500">{error}</p>
        </div>
      </main>
    );
  }

  if (!project) {
    return notFound();
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center space-x-4">
            <ProjectLogo logoUrl={project.logoUrl} name={project.name} size={80} />
            <div>
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {project.blockchain}
                </span>
                
                {project.categories.map(category => (
                  <span 
                    key={category.id}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="prose max-w-none">
            <p>{project.description}</p>
          </div>

          {project.contracts.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Contracts</h2>
              <ContractList contracts={project.contracts} />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Project Rating</h2>
            <ProjectRating projectId={project.id} />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Project Stats</h2>
            <ProjectSocialMetrics metrics={project.socialMetrics} />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Links</h2>
            <div className="space-y-3">
              {project.website && (
                <div className="flex items-center">
                  <span className="text-gray-600 w-20">Website:</span>
                  <Link
                    href={project.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate"
                  >
                    {project.website}
                  </Link>
                </div>
              )}
              {project.githubUrl && (
                <div className="flex items-center">
                  <span className="text-gray-600 w-20">GitHub:</span>
                  <Link
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate"
                  >
                    {project.githubUrl}
                  </Link>
                </div>
              )}
              {project.twitterUrl && (
                <div className="flex items-center">
                  <span className="text-gray-600 w-20">X (Twitter):</span>
                  <Link
                    href={project.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate"
                  >
                    {project.twitterUrl}
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {project.categories.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Categories</h2>
              <div className="flex flex-wrap gap-2">
                {project.categories.map(category => (
                  <div 
                    key={category.id}
                    className="px-3 py-2 bg-green-50 text-green-800 rounded-lg text-sm"
                  >
                    {category.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 