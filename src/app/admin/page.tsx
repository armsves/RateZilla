"use client";

import { useState } from 'react';
import AdminProjectForm from '@/components/AdminProjectForm';
import AdminProjectList from '@/components/AdminProjectList';

export default function AdminPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleProjectAdded = () => {
    // Increment refresh trigger to cause a refresh in the AdminProjectList
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Add New Project</h2>
          <AdminProjectForm onProjectAdded={handleProjectAdded} />
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Manage Projects</h2>
          <AdminProjectList refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
} 