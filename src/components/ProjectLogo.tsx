"use client";
import React, { useState } from 'react';
import Image from 'next/image';

interface ProjectLogoProps {
  logoUrl?: string | null;
  name: string;
  size?: number;
  className?: string;
}

export default function ProjectLogo({ 
  logoUrl, 
  name, 
  size = 40, 
  className = '' 
}: ProjectLogoProps) {
  const [imageError, setImageError] = useState(false);
  
  // Helper function to check if string is an emoji
  const isEmoji = (str?: string | null): boolean => {
    if (!str) return false;
    
    // Simple check for emoji pattern
    const emojiRegex = /[\p{Emoji}]/u;
    return emojiRegex.test(str) && str.length <= 2;
  };
  
  // Helper to determine if the logoUrl is a valid URL
  const isUrl = (str?: string | null): boolean => {
    if (!str) return false;
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };
  
  // Handle errors when loading image
  const handleImageError = () => {
    setImageError(true);
  };
  
  // Get first letter of project name for fallback
  const getInitial = () => {
    return name.charAt(0).toUpperCase();
  };
  
  // Check if the logo is an emoji
  if (isEmoji(logoUrl) && !imageError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-full overflow-hidden ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.6 }}
      >
        {logoUrl}
      </div>
    );
  }
  
  // Check if the logo is a URL and not errored
  if (isUrl(logoUrl) && !imageError) {
    return (
      <div 
        className={`relative bg-gray-100 rounded-full overflow-hidden ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src={logoUrl || ''}
          alt={`${name} logo`}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      </div>
    );
  }
  
  // Fallback to initial
  return (
    <div 
      className={`flex items-center justify-center bg-blue-100 text-blue-800 font-semibold rounded-full ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {getInitial()}
    </div>
  );
} 