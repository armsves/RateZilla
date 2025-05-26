"use client";

import { useState } from 'react';
import { toast } from 'react-toastify';

interface ProjectFormData {
  name: string;
  description: string;
  githubUrl: string;
  twitterUrl: string;
  website: string;
  logoUrl: string;
}

interface AdminProjectFormProps {
  onProjectAdded?: () => void;
}

const AdminProjectForm = ({ onProjectAdded }: AdminProjectFormProps) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    githubUrl: '',
    twitterUrl: '',
    website: '',
    logoUrl: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/admin/projects', {
        method: 'POST',
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
        throw new Error(errorData.error || 'Failed to create project');
      }

      const data = await response.json();
      toast.success('Project created successfully!');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        githubUrl: '',
        twitterUrl: '',
        website: '',
        logoUrl: '',
      });

      // Notify parent component that a project was added
      if (onProjectAdded) {
        onProjectAdded();
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create project');
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div className="flex justify-end">
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Project'}
        </button>
      </div>
    </form>
  );
};

export default AdminProjectForm; 