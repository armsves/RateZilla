"use client";

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import LogoUploader from './LogoUploader';

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

interface Category {
  id: number;
  name: string;
}

interface AdminProjectFormProps {
  onSubmit: (formData: ProjectFormData) => Promise<void>;
  initialData?: ProjectFormData;
  isEditing?: boolean;
}

const AdminProjectForm: React.FC<AdminProjectFormProps> = ({
  onSubmit,
  initialData,
  isEditing = false,
}) => {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const logoUploaderRef = useRef<{ uploadLogo: () => Promise<string | null> }>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
    fetchCategories();
  }, [initialData]);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('Name and description are required');
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload the logo first if there's a pending upload
      if (logoUploaderRef.current) {
        const logoUrl = await logoUploaderRef.current.uploadLogo();
        if (logoUrl) {
          // Update the form data with the new logo URL
          setFormData(prev => ({
            ...prev,
            logoUrl
          }));
        }
      }

      // Submit the form with updated logo URL
      await onSubmit({
        ...formData,
        logoUrl: formData.logoUrl // This will have been updated if a logo was uploaded
      });
      
      if (!isEditing) {
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
      }
    } catch (error) {
      // Error is handled by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Project Name*
        </label>
        <input
          id="name"
          name="name"
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description*
        </label>
        <textarea
          id="description"
          name="description"
          className="w-full p-2 border border-gray-300 rounded-md"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          required
        />
      </div>

      <div>
        <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
          Website URL
        </label>
        <input
          id="website"
          name="website"
          type="url"
          className="w-full p-2 border border-gray-300 rounded-md"
          value={formData.website}
          onChange={handleChange}
          placeholder="https://example.com"
        />
      </div>

      <div>
        <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700 mb-1">
          GitHub URL
        </label>
        <input
          id="githubUrl"
          name="githubUrl"
          type="url"
          className="w-full p-2 border border-gray-300 rounded-md"
          value={formData.githubUrl}
          onChange={handleChange}
          placeholder="https://github.com/username/repo"
        />
      </div>

      <div>
        <label htmlFor="twitterUrl" className="block text-sm font-medium text-gray-700 mb-1">
          X (Twitter) URL
        </label>
        <input
          id="twitterUrl"
          name="twitterUrl"
          type="url"
          className="w-full p-2 border border-gray-300 rounded-md"
          value={formData.twitterUrl}
          onChange={handleChange}
          placeholder="https://x.com/username"
        />
      </div>

      <div>
        <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-1">
          Logo
        </label>
        <div className="space-y-2">
          <LogoUploader 
            // @ts-ignore - adding ref to access uploadLogo
            ref={logoUploaderRef}
            projectId={isEditing && initialData?.name ? initialData.name : 'new-project'} 
            initialLogoUrl={formData.logoUrl}
            onLogoUpdated={handleLogoUploaded}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categories
        </label>
        {loadingCategories ? (
          <p className="text-sm text-gray-500">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-gray-500">No categories available</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`category-${category.id}`}
                  checked={formData.categoryIds.includes(category.id)}
                  onChange={() => handleCategoryChange(category.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor={`category-${category.id}`}
                  className="ml-2 block text-sm text-gray-700"
                >
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting
          ? isEditing
            ? 'Updating...'
            : 'Creating...'
          : isEditing
          ? 'Update Project'
          : 'Create Project'}
      </button>
    </form>
  );
};

export default AdminProjectForm; 