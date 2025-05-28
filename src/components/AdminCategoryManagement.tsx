"use client";
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface Category {
  id: number;
  name: string;
  description: string | null;
  _count?: {
    projects: number;
  };
}

interface AdminCategoryManagementProps {
  onCategoryChange?: () => void;
}

const AdminCategoryManagement: React.FC<AdminCategoryManagementProps> = ({ onCategoryChange }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create category');
      }

      await fetchCategories();
      setNewCategory({ name: '', description: '' });
      toast.success('Category created successfully');
      if (onCategoryChange) onCategoryChange();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/categories?id=${editingCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingCategory.name,
          description: editingCategory.description || '',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update category');
      }

      await fetchCategories();
      setEditingCategory(null);
      toast.success('Category updated successfully');
      if (onCategoryChange) onCategoryChange();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/categories?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete category');
      }

      await fetchCategories();
      setConfirmDelete(null);
      toast.success('Category deleted successfully');
      if (onCategoryChange) onCategoryChange();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete category');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && categories.length === 0) {
    return <div className="text-center py-8">Loading categories...</div>;
  }

  if (error && categories.length === 0) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-8">
      {/* Add New Category Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div>
            <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
              Category Name*
            </label>
            <input
              id="categoryName"
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label htmlFor="categoryDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="categoryDescription"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              rows={3}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : 'Add Category'}
          </button>
        </form>
      </div>

      {/* Category List */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        {categories.length === 0 ? (
          <p className="text-gray-500">No categories found. Add your first category above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">ID</th>
                  <th className="py-2 px-4 text-left">Name</th>
                  <th className="py-2 px-4 text-left">Description</th>
                  <th className="py-2 px-4 text-left">Projects</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-t">
                    <td className="py-2 px-4">{category.id}</td>
                    <td className="py-2 px-4">
                      {editingCategory?.id === category.id ? (
                        <input
                          type="text"
                          className="w-full p-1 border border-gray-300 rounded-md"
                          value={editingCategory.name}
                          onChange={(e) =>
                            setEditingCategory({ ...editingCategory, name: e.target.value })
                          }
                        />
                      ) : (
                        category.name
                      )}
                    </td>
                    <td className="py-2 px-4">
                      {editingCategory?.id === category.id ? (
                        <textarea
                          className="w-full p-1 border border-gray-300 rounded-md"
                          value={editingCategory.description || ''}
                          onChange={(e) =>
                            setEditingCategory({
                              ...editingCategory,
                              description: e.target.value,
                            })
                          }
                          rows={2}
                        />
                      ) : (
                        category.description || '-'
                      )}
                    </td>
                    <td className="py-2 px-4">{category._count?.projects || 0}</td>
                    <td className="py-2 px-4">
                      {editingCategory?.id === category.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={handleUpdateCategory}
                            disabled={isSubmitting}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCategory(null)}
                            className="px-3 py-1 bg-gray-300 text-gray-800 text-sm rounded hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : confirmDelete === category.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            disabled={isSubmitting}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="px-3 py-1 bg-gray-300 text-gray-800 text-sm rounded hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingCategory(category)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setConfirmDelete(category.id)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategoryManagement; 