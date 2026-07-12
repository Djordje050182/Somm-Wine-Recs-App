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
  priority?: boolean; // heroes load eagerly; everything else waits its turn
}

// Hotlinked estate photography is often multi-megabyte originals — brutal on
// a phone in a vineyard. Serve everything through the wsrv.nl image CDN
// (same source image, resized and re-encoded server-side); if the CDN ever
// fails, fall back to the original URL before giving up.
export const optimised = (url: string, width = 800): string => {
  if (!url || url.startsWith('data:') || url.startsWith('blob:')) return url;
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${width}&q=82&output=webp`;
};

const ImageWithLoader: React.FC<ImageWithLoaderProps> = ({ asset, src, alt, className = '', aspectRatio, showCredit = false, priority = false }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [useOriginal, setUseOriginal] = useState(false);

  const url = asset?.url ?? src ?? '';
  const displayUrl = useOriginal ? url : optimised(url, priority ? 1600 : 800);
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
          src={displayUrl}
          alt={altText}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          decoding="async"
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (useOriginal) setError(true);
            else { setLoaded(false); setUseOriginal(true); }
          }}
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
