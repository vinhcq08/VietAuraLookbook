import React, { useState, useEffect } from 'react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  className = '',
  fallbackTitle = 'Di Sản Việt Phục',
  fallbackSubtitle = ' Tư liệu hình ảnh phục dựng',
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-zinc-100 text-zinc-900 p-6 text-center select-none ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center mb-2.5 shadow-2xs">
          <span className="text-sm font-bold text-zinc-950">VP</span>
        </div>
        <p className="text-sm font-semibold text-zinc-900">{fallbackTitle}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{fallbackSubtitle}</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};
