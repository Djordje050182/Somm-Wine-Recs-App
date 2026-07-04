import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { ImageAsset } from '../types';

interface ImageWithLoaderProps {
  asset?: ImageAsset;
  src?: string; // legacy — prefer `asset`
  alt?: string;
  className?: string;
  aspectRatio?: string; // e.g. "aspect-video", "aspect-square"
  showCredit?: boolean;
}

const ImageWithLoader: React.FC<ImageWithLoaderProps> = ({ asset, src, alt, className = '', aspectRatio, showCredit = false }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const url = asset?.url ?? src ?? '';
  const altText = asset?.alt ?? alt ?? '';

  return (
    <div className={`relative overflow-hidden bg-ink/5 ${className} ${aspectRatio || ''}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-hairline/50 animate-pulse">
          <ImageIcon className="w-8 h-8 text-ink/20" />
        </div>
      )}

      {!error ? (
        <img
          src={url}
          alt={altText}
          loading="lazy"
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      ) : (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-parchment text-ink/30 p-4 text-center">
          <WineGlyph className="w-8 h-8 mb-2 opacity-50" />
          <span className="font-ui text-[10px] font-semibold uppercase tracking-kicker">Image unavailable</span>
        </div>
      )}

      {showCredit && asset?.credit && loaded && !error && (
        <span className="absolute bottom-1 right-2 font-ui text-[9px] text-parchment/70 z-10">{asset.credit}</span>
      )}
    </div>
  );
};

const WineGlyph = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M8 22h8"/><path d="M7 10h10"/><path d="M12 15v7"/><path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z"/></svg>
);

export default ImageWithLoader;
