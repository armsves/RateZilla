"use client";
import React from 'react';
import Link from 'next/link';
import ProjectLogo from './ProjectLogo';
import { FaGithub, FaTwitter } from 'react-icons/fa';
import { FaGlobe } from 'react-icons/fa';

interface Category {
  id: number;
  name: string;
}

interface Project {
  id: number;
  name: string;
  description: string | null;
  logoUrl: string | null;
  website: string | null;
  githubUrl: string | null;
  twitterUrl: string | null;
  blockchain: string;
  categories: Category[];
  votes: { value: number }[];
  socialMetrics?: {
    githubStars: number;
    twitterFollowers: number;
    githubForks: number;
    projectFreshness: number;
  } | null;
}

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  // Calculate average rating
  const avgRating = project.votes.length
    ? project.votes.reduce((sum, vote) => sum + vote.value, 0) / project.votes.length
    : 0;

  const handleLinkClick = (e: React.MouseEvent) => {
    // Stop the click from bubbling up to the parent Link component
    e.stopPropagation();
  };

  // Get the primary category (first one)
  const primaryCategory = project.categories.length > 0 ? project.categories[0] : null;

  return (
    <Link href={`/projects/${project.id}`} passHref legacyBehavior>
      <a className="block">
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white h-full flex flex-col">
          {/* Add primary category as a badge at the top */}
          {primaryCategory && (
            <div className="bg-blue-600 text-white px-4 py-2 text-sm font-bold">
              {primaryCategory.name}
            </div>
          )}
          
          <div className="p-4 flex items-center space-x-3">
            <ProjectLogo logoUrl={project.logoUrl} name={project.name} size={48} />
            <div>
              <h3 className="text-lg font-semibold line-clamp-1">{project.name}</h3>
              <div className="flex flex-wrap gap-1 mt-1">
                {/* Show additional categories (skipping the primary one) */}
                {project.categories.slice(1, 3).map(category => (
                  <span 
                    key={category.id}
                    className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-green-100 text-green-800"
                  >
                    {category.name}
                  </span>
                ))}
                
                {project.categories.length > 3 && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                    +{project.categories.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-4 pt-0 flex-grow">
            <p className="text-gray-600 line-clamp-3 text-sm">
              {project.description || 'No description available'}
            </p>
          </div>
          
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                {project.socialMetrics && (
                  <>
                    <div className="flex items-center text-gray-600" title="GitHub Stars">
                      <span className="mr-1">⭐</span>
                      <span>{project.socialMetrics.githubStars}</span>
                    </div>
                    <div className="flex items-center text-gray-600" title="Twitter Followers">
                      <span className="mr-1">🐦</span>
                      <span>{project.socialMetrics.twitterFollowers}</span>
                    </div>
                    {project.socialMetrics.projectFreshness !== undefined && (
                      <div className="flex items-center text-gray-600" title="Code Freshness">
                        <span className="mr-1">🔄</span>
                        <span>{project.socialMetrics.projectFreshness}d</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="flex items-center">
                <span className="text-yellow-500 mr-1">★</span>
                <span>{avgRating ? avgRating.toFixed(1) : 'N/A'}</span>
                <span className="text-gray-500 ml-1">({project.votes.length})</span>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              {project.website && (
                <a 
                  href={project.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleLinkClick}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                  title="Visit Website"
                >
                  <FaGlobe className="h-4 w-4" />
                </a>
              )}
              
              {project.githubUrl && (
                <a 
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleLinkClick}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                  title="GitHub Repository"
                >
                  <FaGithub className="h-4 w-4" />
                </a>
              )}
              
              {project.twitterUrl && (
                <a 
                  href={project.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleLinkClick}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                  title="Twitter Profile"
                >
                  <FaTwitter className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </a>
    </Link>
  );
};

export default ProjectCard; 