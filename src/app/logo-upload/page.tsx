'use client';

import { useState } from 'react';
import LogoUploader from '@/components/LogoUploader';
import Link from 'next/link';

export default function LogoUploadPage() {
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);

  const handleLogoUpdated = (newLogoUrl: string) => {
    setUploadedLogo(newLogoUrl);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Logo Upload Demo</h1>
        <Link 
          href="/"
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          Back to Home
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <LogoUploader 
          projectId="demo-project"
          onLogoUpdated={handleLogoUpdated}
        />
      </div>

      {uploadedLogo && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Upload Result</h2>
          <p className="mb-2">Your logo has been successfully uploaded!</p>
          <div className="bg-gray-100 p-4 rounded-md">
            <p className="font-medium text-sm mb-1">URL:</p>
            <code className="text-xs block overflow-x-auto break-all">
              {uploadedLogo}
            </code>
          </div>
          <div className="mt-4">
            <p className="font-medium text-sm mb-2">Preview:</p>
            <div className="border border-gray-200 rounded-md p-4 flex justify-center">
              <img 
                src={uploadedLogo}
                alt="Uploaded logo"
                className="max-h-40 object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 