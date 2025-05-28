"use client";

import { useState } from 'react';
import AdminProjectList from '@/components/AdminProjectList';
import AdminProjectForm from '@/components/AdminProjectForm';
import AdminCategoryManagement from '@/components/AdminCategoryManagement';
import { toast } from 'react-toastify';

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

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'projects' | 'categories'>('projects');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleProjectAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
    toast.success('Project added successfully!');
  };

  const handleCategoryChange = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSubmitProject = async (formData: ProjectFormData) => {
    try {
      const response = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }

      handleProjectAdded();
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create project');
      throw error; // Re-throw to be handled by the form
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'projects'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'categories'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Categories
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <AdminProjectList refreshTrigger={refreshTrigger} />
          </div>

        </div>
      )}

      {activeTab === 'categories' && (
        <AdminCategoryManagement onCategoryChange={handleCategoryChange} />
      )}
    </div>
  );
} 