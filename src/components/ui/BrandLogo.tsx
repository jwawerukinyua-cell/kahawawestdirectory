import React, { useState } from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  theme?: 'dark' | 'light';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  theme = 'dark',
}) => {
  const [imgError, setImgError] = useState(false);

  const iconDimensions = {
    sm: { width: 40, height: 40 },
    md: { width: 50, height: 50 },
    lg: { width: 68, height: 68 },
    xl: { width: 90, height: 90 },
  }[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Brand Icon / Logo */}
      <div
        className="relative rounded-2xl flex items-center justify-center overflow-hidden border border-emerald-500/40 shadow-md flex-shrink-0 bg-black"
        style={{
          width: `${iconDimensions.width}px`,
          height: `${iconDimensions.height}px`,
        }}
      >
        <picture>
          <source srcSet="/kwest-logo.webp" type="image/webp" />
          <img
            src="/kwest-logo.png"
            alt="Kahawa West Directory"
            className="w-full h-full object-contain"
            width={iconDimensions.width}
            height={iconDimensions.height}
            decoding="async"
            onError={(e) => {
              if (!imgError) {
                setImgError(true);
                (e.target as HTMLImageElement).src = '/kwest-icon.png';
              }
            }}
          />
        </picture>
      </div>

      {/* Brand Text: Prominent 'Kahawa West' */}
      {showText && (
        <div className="flex flex-col justify-center leading-tight">
          <span
            className={`font-display font-black tracking-tight transition text-lg sm:text-xl md:text-2xl ${
              theme === 'dark' ? 'text-white' : 'text-[#630303]'
            }`}
          >
            Kahawa West
          </span>
        </div>
      )}
    </div>
  );
};
