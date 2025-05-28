'use client';

import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import Image from 'next/image';

interface ImageUploaderProps {
  onImageUploaded?: (imageUrl: string) => void;
  onFileSelected?: (hasFile: boolean) => void;
  className?: string;
}

export interface ImageUploaderRef {
  uploadFile: () => Promise<string | null>;
}

const ImageUploader = forwardRef<ImageUploaderRef, ImageUploaderProps>(
  ({ onImageUploaded, onFileSelected, className = '' }, ref) => {
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Store the file for later upload
      setSelectedFile(file);
      
      // Notify parent about file selection
      if (onFileSelected) {
        onFileSelected(true);
      }
      
      // Create local preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    };

    // Method to be called by parent component on form submit
    const uploadFile = async (): Promise<string | null> => {
      if (!selectedFile) {
        console.log('No file selected for upload');
        return null;
      }

      console.log('Starting file upload process...');
      setIsUploading(true);
      try {
        // Create a unique filename with timestamp
        const fileExtension = selectedFile.name.split('.').pop();
        const timestamp = new Date().getTime();
        const uniqueFilename = `${selectedFile.name.split('.')[0]}_${timestamp}.${fileExtension}`;
        
        console.log('Sending file directly to API with unique filename:', uniqueFilename);
        
        const response = await fetch(
          `/api/upload?filename=${uniqueFilename}`,
          { 
            method: 'POST', 
            body: selectedFile 
          }
        );

        console.log('Upload response status:', response.status);
        if (!response.ok) {
          console.error('Upload response not OK:', response.status, response.statusText);
          
          // Try to get more detailed error information
          try {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(errorData.error || 'Upload failed');
          } catch (jsonError) {
            throw new Error(`Upload failed with status ${response.status}`);
          }
        }

        console.log('Parsing response JSON...');
        const blob = await response.json();
        console.log('Upload successful, received blob URL:', blob.url);
        setUploadedUrl(blob.url);
        
        if (onImageUploaded) {
          console.log('Calling onImageUploaded callback with URL');
          onImageUploaded(blob.url);
        }
        
        return blob.url;
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image. Please try again. Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
        return null;
      } finally {
        console.log('Upload process finished');
        setIsUploading(false);
      }
    };

    // Expose the uploadFile method via ref
    useImperativeHandle(ref, () => ({
      uploadFile
    }));

    const triggerFileInput = () => {
      fileInputRef.current?.click();
    };

    return (
      <div className={`flex flex-col items-center ${className}`}>
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        <div 
          onClick={triggerFileInput}
          className="relative w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors mb-2"
        >
          {previewUrl ? (
            <div className="relative w-full h-full">
              <Image 
                src={previewUrl} 
                alt="Preview" 
                fill
                style={{ objectFit: 'contain' }}
                className="rounded-lg"
              />
            </div>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p className="mt-2 text-sm text-gray-500">Click to upload an image</p>
            </>
          )}
        </div>

        <button
          onClick={triggerFileInput}
          type="button"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {isUploading ? 'Uploading...' : selectedFile ? 'Change Image' : 'Select Image'}
        </button>
      </div>
    );
  }
);

ImageUploader.displayName = 'ImageUploader';

export default ImageUploader; 