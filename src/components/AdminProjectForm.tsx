"use client";

import { useState } from 'react';

interface ProjectFormData {
  name: string;
  description: string;
  githubUrl: string;
  twitterUrl: string;
  websiteUrl: string;
}

const AdminProjectForm = () => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    githubUrl: '',
    twitterUrl: '',
    websiteUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement project creation/update logic
    console.log('Form submitted:', formData);
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
          className="input"
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
          className="input min-h-[100px]"
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
          className="input"
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
          className="input"
          placeholder="https://twitter.com/username"
        />
      </div>

      <div>
        <label htmlFor="websiteUrl" className="block text-sm font-medium mb-1">
          Website URL
        </label>
        <input
          type="url"
          id="websiteUrl"
          name="websiteUrl"
          value={formData.websiteUrl}
          onChange={handleChange}
          className="input"
          placeholder="https://example.com"
        />
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary">
          Add Project
        </button>
      </div>
    </form>
  );
};

export default AdminProjectForm; 