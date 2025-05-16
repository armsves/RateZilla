"use client";

import { useState } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Project {
  id: string;
  name: string;
  description: string;
  githubUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  metrics: {
    githubStars: number;
    twitterFollowers: number;
    totalVotes: number;
    averageRating: number;
  };
}

const AdminProjectList = () => {
  // This will be replaced with actual data fetching
  const [projects] = useState<Project[]>([
    {
      id: '1',
      name: 'Example Project',
      description: 'A sample project in the Stellar ecosystem',
      githubUrl: 'https://github.com/example',
      twitterUrl: 'https://twitter.com/example',
      websiteUrl: 'https://example.com',
      metrics: {
        githubStars: 100,
        twitterFollowers: 500,
        totalVotes: 50,
        averageRating: 4.5,
      },
    },
  ]);

  const handleEdit = (projectId: string) => {
    // TODO: Implement edit functionality
    console.log('Edit project:', projectId);
  };

  const handleDelete = (projectId: string) => {
    // TODO: Implement delete functionality
    console.log('Delete project:', projectId);
  };

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <div
          key={project.id}
          className="flex items-center justify-between p-4 bg-background rounded-lg border border-border"
        >
          <div className="flex-1">
            <h3 className="font-medium">{project.name}</h3>
            <p className="text-sm text-foreground/60 mt-1">{project.description}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleEdit(project.id)}
              className="p-2 text-foreground/60 hover:text-primary"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleDelete(project.id)}
              className="p-2 text-foreground/60 hover:text-red-500"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminProjectList; 