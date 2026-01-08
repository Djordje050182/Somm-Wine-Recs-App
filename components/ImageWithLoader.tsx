
import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ImageWithLoaderProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string; // e.g. "aspect-video", "aspect-square"
}

const ImageWithLoader: React.FC<ImageWithLoaderProps> = ({ src, alt, className = "", aspectRatio }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className} ${aspectRatio || ''}`}>
      {/* Skeleton Loader */}
      {!loaded && !error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-200 animate-pulse">
          <ImageIcon className="w-8 h-8 text-gray-300 opacity-50" />
        </div>
      )}

      {/* Actual Image */}
      {!error ? (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      ) : (
        /* Fallback for Broken Images */
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#f8f4f0] text-gray-400 p-4 text-center">
           <Wine className="w-8 h-8 mb-2 opacity-50" />
           <span className="text-[10px] font-bold uppercase tracking-widest">Image Unavailable</span>
        </div>
      )}
    </div>
  );
};

// Simple icon for fallback
const Wine = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M8 22h8"/><path d="M7 10h10"/><path d="M12 15v7"/><path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z"/></svg>
);

export default ImageWithLoader;
