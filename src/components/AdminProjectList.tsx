"use client";

import { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

interface Project {
  id: string;
  name: string;
  description: string;
  githubUrl?: string;
  twitterUrl?: string;
  website?: string;
  logoUrl?: string;
  blockchain: string;
  votes: Array<{ value: number }>;
  socialMetrics: {
    githubStars: number;
    twitterFollowers: number;
    githubForks: number;
    projectFreshness: number;
  };
}

interface ProjectFormData {
  name: string;
  description: string;
  githubUrl: string;
  twitterUrl: string;
  website: string;
  logoUrl: string;
}

interface AdminProjectListProps {
  refreshTrigger?: number;
}

const AdminProjectList = ({ refreshTrigger = 0 }: AdminProjectListProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    githubUrl: '',
    twitterUrl: '',
    website: '',
    logoUrl: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [refreshTrigger]); // Re-fetch when refreshTrigger changes

  const handleEdit = (project: Project) => {
    setCurrentProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      githubUrl: project.githubUrl || '',
      twitterUrl: project.twitterUrl || '',
      website: project.website || '',
      logoUrl: project.logoUrl || '',
    });
    setEditModalOpen(true);
  };

  const handleDelete = (project: Project) => {
    setCurrentProject(project);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!currentProject) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/projects?id=${currentProject.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
      
      // Remove the project from the state
      setProjects(projects.filter(p => p.id !== currentProject.id));
      toast.success('Project deleted successfully');
      setDeleteModalOpen(false);
    } catch (err) {
      console.error('Error deleting project:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/projects?id=${currentProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          blockchain: 'stellar', // Always set to stellar since we're focusing only on Stellar
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update project');
      }

      const updatedProject = await response.json();
      
      // Update the project in the state
      setProjects(projects.map(p => p.id === currentProject.id ? {...p, ...updatedProject} : p));
      
      toast.success('Project updated successfully');
      setEditModalOpen(false);
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading projects...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  }

  if (projects.length === 0) {
    return <div className="text-center py-4 text-gray-500">No projects found. Add your first project!</div>;
  }

  const calculateAverageRating = (project: Project) => {
    if (!project.votes || project.votes.length === 0) return 0;
    return project.votes.reduce((sum, vote) => sum + vote.value, 0) / project.votes.length;
  };

  return (
    <>
      <div className="space-y-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex items-center justify-between p-4 bg-background rounded-lg border border-border"
          >
            <div className="flex-1">
              <h3 className="font-medium">{project.name}</h3>
              <p className="text-sm text-foreground/60 mt-1">{project.description}</p>
              <div className="flex mt-2 gap-4 text-xs text-gray-500">
                <span>Stars: {project.socialMetrics?.githubStars || 0}</span>
                <span>Rating: {calculateAverageRating(project).toFixed(1)}/5</span>
                <span>Votes: {project.votes?.length || 0}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleEdit(project)}
                className="p-2 text-foreground/60 hover:text-primary"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDelete(project)}
                className="p-2 text-foreground/60 hover:text-red-500"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
            <button 
              onClick={() => setEditModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-semibold mb-4">Edit Project</h2>
            
            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                  required
                />
              </div>

              <div>
                <label htmlFor="githubUrl" className="block text-sm font-medium mb-1">
                  GitHub URL
                </label>
                <input
                  type="url"
                  id="githubUrl"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://github.com/username/repo"
                />
              </div>

              <div>
                <label htmlFor="twitterUrl" className="block text-sm font-medium mb-1">
                  Twitter URL
                </label>
                <input
                  type="url"
                  id="twitterUrl"
                  name="twitterUrl"
                  value={formData.twitterUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://twitter.com/username"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label htmlFor="logoUrl" className="block text-sm font-medium mb-1">
                  Logo URL
                </label>
                <input
                  type="url"
                  id="logoUrl"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button 
                  type="button" 
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-2">Confirm Deletion</h2>
            <p className="mb-4">
              Are you sure you want to delete <span className="font-semibold">{currentProject?.name}</span>? This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminProjectList; 