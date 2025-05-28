'use client';

import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import ImageUploader from './ImageUploader';
import ProjectLogo from './ProjectLogo';

interface LogoUploaderProps {
  initialLogoUrl?: string;
  projectId: string;
  onLogoUpdated?: (newLogoUrl: string) => void;
  onFileSelected?: (hasFile: boolean) => void;
  projectName?: string; // Added for logo display
}

export interface LogoUploaderRef {
  uploadLogo: () => Promise<string | null>;
}

const LogoUploader = forwardRef<LogoUploaderRef, LogoUploaderProps>(
  ({ initialLogoUrl, projectId, projectName = 'Project', onLogoUpdated, onFileSelected }, ref) => {
    const [logoUrl, setLogoUrl] = useState<string | undefined>(initialLogoUrl);
    const imageUploaderRef = useRef<{ uploadFile: () => Promise<string | null> }>(null);
    
    // Function to upload the file, called by parent form on submit
    const uploadLogo = async (): Promise<string | null> => {
      console.log('LogoUploader: uploadLogo method called');
      if (imageUploaderRef.current) {
        console.log('LogoUploader: Calling uploadFile on ImageUploader ref');
        const url = await imageUploaderRef.current.uploadFile();
        console.log('LogoUploader: Got URL from ImageUploader:', url);
        if (url && onLogoUpdated) {
          console.log('LogoUploader: Calling onLogoUpdated callback');
          onLogoUpdated(url);
        }
        return url;
      }
      console.log('LogoUploader: No ImageUploader ref available, returning existing logoUrl:', logoUrl);
      return logoUrl || null;
    };

    // Expose the uploadLogo method via ref
    useImperativeHandle(ref, () => ({
      uploadLogo
    }));

    // Handle file selection notification
    const handleFileSelected = (hasFile: boolean) => {
      console.log('LogoUploader: File selected, hasFile:', hasFile);
      if (onFileSelected) {
        onFileSelected(hasFile);
      }
    };

    return (
      <div className="w-full">
        {initialLogoUrl && (
          <div className="mb-2">
            <p className="text-xs font-medium text-gray-700 mb-1">Current Logo:</p>
            <div className="flex items-center">
              <ProjectLogo 
                logoUrl={initialLogoUrl} 
                name={projectName} 
                size={40}
              />
              <span className="ml-2 text-xs text-gray-500 truncate max-w-[120px]">
                {initialLogoUrl.startsWith('data:') 
                  ? 'Embedded logo' 
                  : initialLogoUrl.length > 20 
                    ? `${initialLogoUrl.substring(0, 20)}...` 
                    : initialLogoUrl}
              </span>
            </div>
          </div>
        )}
        
        <p className="text-xs font-medium text-gray-700 mb-1">
          {initialLogoUrl ? 'Upload new logo:' : 'Upload logo:'}
        </p>
        
        <ImageUploader 
          ref={imageUploaderRef}
          onFileSelected={handleFileSelected}
          className="w-full"
        />
      </div>
    );
  }
);

LogoUploader.displayName = 'LogoUploader';

export default LogoUploader; 