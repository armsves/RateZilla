"use client";

import { useState, useEffect, useRef } from 'react';
import { PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash } from 'react-icons/fa';
import ProjectLogo from './ProjectLogo';
import LogoUploader from './LogoUploader';

interface Project {
  id: number;
  name: string;
  description: string | null;
  website: string | null;
  githubUrl: string | null;
  twitterUrl: string | null;
  logoUrl: string | null;
  blockchain: string;
  categories: Category[];
  createdAt: string;
  averageRating?: number;
}

interface Category {
  id: number;
  name: string;
}

interface ProjectFormData {
  name: string;
  description: string;
  githubUrl: string;
  twitterUrl: string;
  website: string;
  logoUrl: string;
  blockchain: string;
  categoryIds: number[];
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
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    githubUrl: '',
    twitterUrl: '',
    website: '',
    logoUrl: '',
    blockchain: 'stellar',
    categoryIds: [],
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add a ref to access the LogoUploader component
  const logoUploaderRef = useRef<{ uploadLogo: () => Promise<string | null> }>(null);

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

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch('/api/admin/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchCategories();
  }, [refreshTrigger]); // Re-fetch when refreshTrigger changes

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      githubUrl: project.githubUrl || '',
      twitterUrl: project.twitterUrl || '',
      website: project.website || '',
      logoUrl: project.logoUrl || '',
      blockchain: project.blockchain,
      categoryIds: project.categories.map(cat => cat.id),
    });
    setEditModalOpen(true);
  };

  const handleAddProject = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      githubUrl: '',
      twitterUrl: '',
      website: '',
      logoUrl: '',
      blockchain: 'stellar',
      categoryIds: [],
    });
    setAddModalOpen(true);
  };

  const handleDelete = (project: Project) => {
    setEditingProject(project);
    setDeleteModalOpen(true);
  };

  const handleUpdateProject = async () => {
    if (!editingProject) return;

    console.log('AdminProjectList: Starting project update...');
    setIsSubmitting(true);
    try {
      // Create a copy of the current form data
      let updatedFormData = { ...formData };
      console.log('AdminProjectList: Initial form data:', updatedFormData);
      
      // Upload the logo first if there's a new one
      if (logoUploaderRef.current) {
        console.log('AdminProjectList: Logo uploader ref found, attempting to upload logo...');
        
        // Create a promise with timeout for the logo upload
        const uploadLogoWithTimeout = async () => {
          return new Promise<string | null>(async (resolve) => {
            // Set a timeout for the upload
            const timeoutId = setTimeout(() => {
              console.error('AdminProjectList: Logo upload timed out after 60 seconds');
              resolve(null);
            }, 60000); // 60 second timeout
            
            try {
              // Attempt to upload the logo
              const result = await logoUploaderRef.current!.uploadLogo();
              clearTimeout(timeoutId);
              resolve(result);
            } catch (error) {
              console.error('AdminProjectList: Error in logo upload:', error);
              clearTimeout(timeoutId);
              resolve(null);
            }
          });
        };
        
        // Call the upload with timeout
        const uploadedLogoUrl = await uploadLogoWithTimeout();
        console.log('AdminProjectList: Logo upload result:', uploadedLogoUrl);
        
        if (uploadedLogoUrl) {
          console.log('AdminProjectList: Got new logo URL, updating form data');
          updatedFormData = {
            ...updatedFormData,
            logoUrl: uploadedLogoUrl
          };
          
          // Update the state as well for future reference
          setFormData(updatedFormData);
          console.log('AdminProjectList: Updated form data with new logo:', updatedFormData);
        } else {
          console.log('AdminProjectList: Logo upload failed or timed out, continuing with existing logo URL');
          // Continue with the existing logoUrl, don't update it
        }
      } else {
        console.log('AdminProjectList: No logo uploader ref found');
      }

      console.log('AdminProjectList: Sending project update to API...');
      const response = await fetch(`/api/admin/projects?id=${editingProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFormData),
      });

      console.log('AdminProjectList: API response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('AdminProjectList: API error response:', errorData);
        throw new Error(errorData.error || 'Failed to update project');
      }

      const updatedProject = await response.json();
      console.log('AdminProjectList: Project updated successfully:', updatedProject);
      
      toast.success('Project updated successfully');
      setEditModalOpen(false);
      fetchProjects();
    } catch (err) {
      console.error('AdminProjectList: Error updating project:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update project');
    } finally {
      console.log('AdminProjectList: Update process completed');
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!editingProject) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/projects?id=${editingProject.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete project');
      }

      toast.success('Project deleted successfully');
      setDeleteModalOpen(false);
      fetchProjects();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (categoryId: number) => {
    setFormData((prev) => {
      const currentCategories = [...prev.categoryIds];
      if (currentCategories.includes(categoryId)) {
        return {
          ...prev,
          categoryIds: currentCategories.filter((id) => id !== categoryId),
        };
      } else {
        return {
          ...prev,
          categoryIds: [...currentCategories, categoryId],
        };
      }
    });
  };

  const handleLogoUploaded = (imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      logoUrl: imageUrl,
    }));
  };

  const handleCreateProject = async () => {
    console.log('AdminProjectList: Starting project creation...');
    setIsSubmitting(true);
    try {
      // Create a copy of the current form data
      let updatedFormData = { ...formData };
      console.log('AdminProjectList: Initial form data:', updatedFormData);
      
      // Upload the logo first if there's a new one
      if (logoUploaderRef.current) {
        console.log('AdminProjectList: Logo uploader ref found, attempting to upload logo...');
        
        // Create a promise with timeout for the logo upload
        const uploadLogoWithTimeout = async () => {
          return new Promise<string | null>(async (resolve) => {
            // Set a timeout for the upload
            const timeoutId = setTimeout(() => {
              console.error('AdminProjectList: Logo upload timed out after 60 seconds');
              resolve(null);
            }, 60000); // 60 second timeout
            
            try {
              // Attempt to upload the logo
              const result = await logoUploaderRef.current!.uploadLogo();
              clearTimeout(timeoutId);
              resolve(result);
            } catch (error) {
              console.error('AdminProjectList: Error in logo upload:', error);
              clearTimeout(timeoutId);
              resolve(null);
            }
          });
        };
        
        // Call the upload with timeout
        const uploadedLogoUrl = await uploadLogoWithTimeout();
        console.log('AdminProjectList: Logo upload result:', uploadedLogoUrl);
        
        if (uploadedLogoUrl) {
          console.log('AdminProjectList: Got new logo URL, updating form data');
          updatedFormData = {
            ...updatedFormData,
            logoUrl: uploadedLogoUrl
          };
          
          // Update the state as well for future reference
          setFormData(updatedFormData);
          console.log('AdminProjectList: Updated form data with new logo:', updatedFormData);
        } else {
          console.log('AdminProjectList: Logo upload failed or timed out, continuing with existing logo URL');
          // Continue with the existing logoUrl, don't update it
        }
      } else {
        console.log('AdminProjectList: No logo uploader ref found');
      }

      console.log('AdminProjectList: Sending project creation to API...');
      const response = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFormData),
      });

      console.log('AdminProjectList: API response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('AdminProjectList: API error response:', errorData);
        throw new Error(errorData.error || 'Failed to create project');
      }

      const newProject = await response.json();
      console.log('AdminProjectList: Project created successfully:', newProject);
      
      toast.success('Project created successfully');
      setAddModalOpen(false);
      fetchProjects();
    } catch (err) {
      console.error('AdminProjectList: Error creating project:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      console.log('AdminProjectList: Creation process completed');
      setIsSubmitting(false);
    }
  };

  if (loading && projects.length === 0) {
    return <div className="text-center py-8">Loading projects...</div>;
  }

  if (error && projects.length === 0) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Projects</h2>
        <button
          onClick={handleAddProject}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No projects found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">ID</th>
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Categories</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-t">
                  <td className="py-2 px-4">{project.id}</td>
                  <td className="py-2 px-4">{project.name}</td>
                  <td className="py-2 px-4">
                    <div className="flex flex-wrap gap-1">
                      {project.categories.length > 0 ? (
                        project.categories.map(category => (
                          <span 
                            key={category.id} 
                            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                          >
                            {category.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-sm">No categories</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(project)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(project)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Project</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description*</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">GitHub URL</label>
                  <input
                    type="text"
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Twitter URL</label>
                  <input
                    type="text"
                    name="twitterUrl"
                    value={formData.twitterUrl}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Website</label>
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Logo</label>
                  <div className="space-y-2">
                    <LogoUploader 
                      // @ts-ignore - adding the ref to access uploadLogo
                      ref={logoUploaderRef}
                      projectId={String(editingProject?.id || 'editing')} 
                      initialLogoUrl={formData.logoUrl}
                      projectName={formData.name}
                      onLogoUpdated={handleLogoUploaded}
                      onFileSelected={(hasFile) => console.log('File selected in AdminProjectList', hasFile)}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Categories</label>
                {loadingCategories ? (
                  <p className="text-sm text-gray-500">Loading categories...</p>
                ) : categories.length === 0 ? (
                  <p className="text-sm text-gray-500">No categories available</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 max-h-32 overflow-y-auto p-1 border border-gray-200 rounded-md">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`edit-category-${category.id}`}
                          checked={formData.categoryIds.includes(category.id)}
                          onChange={() => handleCategoryChange(category.id)}
                          className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`edit-category-${category.id}`}
                          className="ml-1 block text-xs text-gray-700 truncate"
                        >
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProject}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p>
              Are you sure you want to delete the project "{editingProject?.name}"? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add New Project</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description*</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">GitHub URL</label>
                  <input
                    type="text"
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Twitter URL</label>
                  <input
                    type="text"
                    name="twitterUrl"
                    value={formData.twitterUrl}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Website</label>
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Logo</label>
                  <div className="space-y-2">
                    <LogoUploader 
                      // @ts-ignore - adding the ref to access uploadLogo
                      ref={logoUploaderRef}
                      projectId="new-project" 
                      initialLogoUrl={formData.logoUrl}
                      projectName={formData.name || "New Project"}
                      onLogoUpdated={handleLogoUploaded}
                      onFileSelected={(hasFile) => console.log('File selected in AdminProjectList', hasFile)}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Categories</label>
                {loadingCategories ? (
                  <p className="text-sm text-gray-500">Loading categories...</p>
                ) : categories.length === 0 ? (
                  <p className="text-sm text-gray-500">No categories available</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 max-h-32 overflow-y-auto p-1 border border-gray-200 rounded-md">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`add-category-${category.id}`}
                          checked={formData.categoryIds.includes(category.id)}
                          onChange={() => handleCategoryChange(category.id)}
                          className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`add-category-${category.id}`}
                          className="ml-1 block text-xs text-gray-700 truncate"
                        >
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setAddModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProjectList; 