"use client";
import { useState, useEffect } from 'react';
import { FaGithub, FaXTwitter } from 'react-icons/fa6';
import { FaGlobe, FaCode, FaHashtag, FaStar } from 'react-icons/fa';

interface Project {
  id: string;
  name: string;
  description: string;
  website: string;
  githubUrl: string;
  twitterUrl: string;
  logoUrl: string;
  blockchain: string;
  averageRating: number;
  metrics: {
    githubStars: number;
    twitterFollowers: number;
    githubForks: number;
    projectFreshness: number;
  };
}

interface SocialData {
  githubLastUpdate?: string;
  twitterLastUpdate?: string;
  mostRecentRepo?: string;
  repoCount?: number;
}

interface ProjectListProps {
  blockchain?: string;
}

// VoteModal component
function VoteModal({ open, onClose, onSubmit, currentRating }: {
  open: boolean;
  onClose: () => void;
  onSubmit: (rating: number) => void;
  currentRating?: number;
}) {
  const [selected, setSelected] = useState(currentRating || 0);
  useEffect(() => {
    setSelected(currentRating || 0);
  }, [currentRating, open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg p-6 w-full max-w-xs shadow-lg relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose}>&times;</button>
        <h2 className="text-lg font-semibold mb-4 text-center">Rate this project</h2>
        <div className="flex justify-center mb-4">
          {[1,2,3,4,5].map(star => (
            <FaStar
              key={star}
              className={`h-8 w-8 cursor-pointer transition-colors ${star <= selected ? 'text-yellow-400' : 'text-gray-300'}`}
              onClick={() => setSelected(star)}
              data-testid={`star-${star}`}
            />
          ))}
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={selected === 0}
          onClick={() => { onSubmit(selected); onClose(); }}
        >
          Submit Rating
        </button>
      </div>
    </div>
  );
}

const ProjectList = ({ blockchain = 'stellar' }: ProjectListProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [socialData, setSocialData] = useState<Record<string, SocialData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const [votingProject, setVotingProject] = useState<Project | null>(null);

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
      
      console.warn('Could not extract GitHub repo from URL:', url);
      return null;
    } catch (error) {
      console.error('Error extracting GitHub repo:', error);
      return null;
    }
  };

  const extractTwitterUsername = (url: string) => {
    if (!url) return null;
    
    try {
      // Handle twitter.com and x.com URLs
      const match = url.match(/(?:twitter|x)\.com\/([^/?#]+)/);
      return match ? match[1] : null;
    } catch (error) {
      console.error('Error extracting Twitter username:', error);
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
      // Examples:
      // https://github.com/organization - match
      // https://github.com/organization/ - match
      // https://github.com/organization/repo - no match
      const match = url.match(/github\.com\/([^/]+)\/?$/);
      return !!match;
    } catch (error) {
      return false;
    }
  };

  const fetchSocialData = async (project: Project) => {
    const githubRepo = extractGithubRepo(project.githubUrl);
    const twitterUsername = extractTwitterUsername(project.twitterUrl);
    const data: SocialData = {};

    try {
      if (githubRepo) {
        console.log(`Fetching GitHub data for project ${project.name}, repo: ${githubRepo}`);
        
        // Determine if this is an organization or a specific repo
        const isOrg = isGithubOrg(project.githubUrl);
        
        const endpoint = isOrg 
          ? `/api/github/org/${encodeURIComponent(githubRepo)}` 
          : `/api/github/${encodeURIComponent(githubRepo)}`;
        
        const response = await fetch(endpoint);
        
        if (response.ok) {
          const githubData = await response.json();
          data.githubLastUpdate = githubData.lastUpdate;
          
          // For organizations, store the most recent repo and repo count
          if (isOrg) {
            data.mostRecentRepo = githubData.mostRecentRepo;
            data.repoCount = githubData.repoCount;
          }
          
          console.log(`GitHub data fetched successfully for ${project.name}`);
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error(`Failed to fetch GitHub data for ${project.name}:`, errorData.error);
        }
      }

      if (twitterUsername) {
        console.log(`Fetching Twitter data for project ${project.name}, username: ${twitterUsername}`);
        const response = await fetch(`/api/twitter/${encodeURIComponent(twitterUsername)}`);
        
        if (response.ok) {
          const twitterData = await response.json();
          data.twitterLastUpdate = twitterData.lastUpdate;
          console.log(`Twitter data fetched successfully for ${project.name}`);
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error(`Failed to fetch Twitter data for ${project.name}:`, errorData.error);
        }
      }

      setSocialData(prev => ({
        ...prev,
        [project.id]: data
      }));
    } catch (error) {
      console.error(`Error fetching social data for project ${project.name}:`, error);
    }
  };

  const isCodeActive = (project: Project) => {
    if (!socialData[project.id]?.githubLastUpdate) return null;
    
    const now = new Date();
    const lastUpdate = new Date(socialData[project.id]?.githubLastUpdate || '');
    
    // Calculate months since last update
    const monthsSinceUpdate = (now.getFullYear() - lastUpdate.getFullYear()) * 12 + 
                             (now.getMonth() - lastUpdate.getMonth());
    
    // Return color code based on freshness
    if (monthsSinceUpdate < 6) {
      return 'green'; // Less than 6 months - green
    } else if (monthsSinceUpdate < 12) {
      return 'blue'; // 6-12 months - blue
    } else {
      return 'red'; // More than 1 year - red
    }
  };

  const isSocialActive = (project: Project) => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const twitterDate = new Date(socialData[project.id]?.twitterLastUpdate || '');
    return twitterDate > threeMonthsAgo;
  };

  // Voting handler
  const handleVote = async (project: Project, rating: number) => {
    // For demo, use the first dummy user
    const userId = 'GUSERDUMMYADDRESS0';
    await fetch(`/api/projects?projectId=${project.id}&userId=${userId}&value=${rating}`, {
      method: 'POST',
    });
    // Refresh projects
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects?blockchain=${blockchain}`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`/api/projects?blockchain=${blockchain}`);
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        setProjects(data);
        
        // Fetch social data for each project
        data.forEach((project: Project) => {
          fetchSocialData(project);
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [blockchain]);

  if (loading) {
    return <div className="text-center py-8">Loading projects...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Vote Modal */}
      <VoteModal
        open={voteModalOpen}
        onClose={() => setVoteModalOpen(false)}
        onSubmit={rating => votingProject && handleVote(votingProject, rating)}
        currentRating={0}
      />
      {projects.map((project) => (
        <div key={project.id} className="bg-white rounded-lg shadow-md p-6 relative">
          <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
            {/* Star Rating Display */}
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(project.averageRating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-sm text-gray-600 ml-1">
                {project.averageRating.toFixed(1)}
              </span>
            </div>
            {/* Code Activity Indicator */}
            <div className="relative group">
              {isCodeActive(project) === 'green' ? (
                <FaCode 
                  className="h-5 w-5 text-green-500"
                  title={socialData[project.id]?.mostRecentRepo 
                    ? `Organization active: ${socialData[project.id].repoCount} repos, most recent update in ${socialData[project.id].mostRecentRepo}`
                    : "Recently active (updated in last 6 months)"}
                />
              ) : isCodeActive(project) === 'blue' ? (
                <FaCode 
                  className="h-5 w-5 text-blue-500" 
                  title={socialData[project.id]?.mostRecentRepo 
                    ? `Organization semi-active: ${socialData[project.id].repoCount} repos, most recent update in ${socialData[project.id].mostRecentRepo}`
                    : "Semi-active (updated in last 6-12 months)"}
                />
              ) : isCodeActive(project) === 'red' ? (
                <FaCode 
                  className="h-5 w-5 text-red-500" 
                  title={socialData[project.id]?.mostRecentRepo 
                    ? `Organization inactive: ${socialData[project.id].repoCount} repos, most recent update in ${socialData[project.id].mostRecentRepo}`
                    : "Inactive (no updates in over a year)"}
                />
              ) : (
                <FaCode className="h-5 w-5 text-gray-400" title="No update information available" />
              )}
              <div className="absolute -top-2 right-6 hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded-md w-48 z-10">
                {socialData[project.id]?.mostRecentRepo 
                  ? `Organization with ${socialData[project.id].repoCount} repos. Most recent activity in ${socialData[project.id].mostRecentRepo}` 
                  : isCodeActive(project) === 'green'
                    ? "Updated in the last 6 months"
                    : isCodeActive(project) === 'blue'
                      ? "Updated 6-12 months ago"
                      : isCodeActive(project) === 'red'
                        ? "Not updated in over a year"
                        : "No update information available"}
              </div>
            </div>
            {/* Social Media Activity Indicator */}
            <div className="relative group">
              {isSocialActive(project) ? (
                <FaHashtag className="h-5 w-5 text-blue-500" title="Active social media (updated in last 3 months)" />
              ) : (
                <FaHashtag className="h-5 w-5 text-gray-400" title="Inactive social media (no updates in last 3 months)" />
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4 mb-4">
            {project.logoUrl ? (
              project.logoUrl === '🥬' ? (
                <span className="text-4xl">{project.logoUrl}</span>
              ) : (
                <img
                  src={project.logoUrl}
                  alt={`${project.name} logo`}
                  className="w-20 h-20 object-contain"
                />
              )
            ) : (
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-500 text-xl">{project.name[0]}</span>
              </div>
            )}
            <h2 className="text-xl font-semibold">{project.name}</h2>
          </div>
          <p className="mt-2 text-sm text-foreground/80">{project.description}</p>
          
          <div className="mt-4 flex justify-between items-center">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              onClick={() => { setVotingProject(project); setVoteModalOpen(true); }}
            >
              Vote
            </button>
            <div className="flex items-center space-x-4">
              {project.website && (
                <a
                  href={project.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                  title="Visit Website"
                >
                  <FaGlobe className="h-5 w-5" />
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                  title={`${project.metrics?.githubStars || 0} GitHub Stars`}
                >
                  <FaGithub className="h-5 w-5" />
                </a>
              )}
              {project.twitterUrl && (
                <a
                  href={project.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                  title={`${project.metrics?.twitterFollowers || 0} Twitter Followers`}
                >
                  <FaXTwitter className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectList; 