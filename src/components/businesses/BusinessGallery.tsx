import React, { useState } from 'react';
import { Camera, ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
import { Business } from '../../types';
import { ListingImage } from '../ui/ListingImage';
import { generateBusinessAltText } from '../../lib/seoAltUtils';
import { sanitizeBusinessPhotos } from '../../lib/imageCompression';

interface BusinessGalleryProps {
  images: string[];
  businessName: string;
  business?: Partial<Business>;
}

export const BusinessGallery: React.FC<BusinessGalleryProps> = ({ images, businessName, business }) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const rawList = Array.isArray(images) && images.length > 0
    ? images
    : (business?.galleryImages && business.galleryImages.length > 0)
    ? business.galleryImages
    : [business?.heroImage].filter((x): x is string => typeof x === 'string' && x.trim() !== '');

  const gallery = sanitizeBusinessPhotos(rawList, 3);
  const mainPhoto = gallery[0] || business?.heroImage || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';
  const additionalPhotos = gallery.slice(1, 3);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIdx === null) return;
    setSelectedIdx((selectedIdx - 1 + gallery.length) % gallery.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIdx === null) return;
    setSelectedIdx((selectedIdx + 1) % gallery.length);
  };

  const bizObj = business || { name: businessName };

  return (
    <div id="business-gallery-section" className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-base sm:text-lg">
            Verified Photos &amp; Premises ({gallery.length} {gallery.length === 1 ? 'Photo' : 'Photos'})
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">Click any photo to enlarge</span>
      </div>

      {/* Gallery Grid: Adapts cleanly to 1, 2, or 3 photos */}
      {additionalPhotos.length === 0 ? (
        <div
          className="relative group overflow-hidden rounded-2xl cursor-pointer bg-stone-100 h-64 sm:h-80 md:h-96"
          onClick={() => setSelectedIdx(0)}
        >
          <ListingImage
            src={mainPhoto}
            business={bizObj}
            imageType="hero"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/30 transition flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 text-white text-xs font-semibold backdrop-blur-sm">
              <Maximize2 className="w-3.5 h-3.5" /> View Photo
            </span>
          </div>
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[11px] font-semibold backdrop-blur-sm">
            Primary Cover
          </span>
        </div>
      ) : additionalPhotos.length === 1 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            className="relative group overflow-hidden rounded-2xl cursor-pointer bg-stone-100 h-60 sm:h-72"
            onClick={() => setSelectedIdx(0)}
          >
            <ListingImage
              src={mainPhoto}
              business={bizObj}
              imageType="hero"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[11px] font-semibold backdrop-blur-sm">
              Primary Cover
            </span>
          </div>
          <div
            className="relative group overflow-hidden rounded-2xl cursor-pointer bg-stone-100 h-60 sm:h-72"
            onClick={() => setSelectedIdx(1)}
          >
            <ListingImage
              src={additionalPhotos[0]}
              business={bizObj}
              imageType="gallery"
              index={2}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-medium backdrop-blur-sm">
              #2
            </span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Main Hero Photo (Takes 3 columns) */}
          <div
            className="md:col-span-3 relative group overflow-hidden rounded-2xl cursor-pointer bg-stone-100 h-60 md:h-[288px]"
            onClick={() => setSelectedIdx(0)}
          >
            <ListingImage
              src={mainPhoto}
              business={bizObj}
              imageType="hero"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/30 transition flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 text-white text-xs font-semibold backdrop-blur-sm">
                <Maximize2 className="w-3.5 h-3.5" /> View Main Photo
              </span>
            </div>
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[11px] font-semibold backdrop-blur-sm">
              Primary Cover
            </span>
          </div>

          {/* 2 Additional Grid Photos (Stacked in 2 columns) */}
          <div className="md:col-span-2 flex flex-col gap-3">
            {additionalPhotos.map((img, idx) => (
              <div
                key={idx}
                className="relative group overflow-hidden rounded-xl cursor-pointer bg-stone-100 h-[138px]"
                onClick={() => setSelectedIdx(idx + 1)}
              >
                <ListingImage
                  src={img}
                  business={bizObj}
                  imageType="gallery"
                  index={idx + 2}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/30 transition flex items-center justify-center">
                  <Maximize2 className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition" />
                </div>
                <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-medium backdrop-blur-sm">
                  #{idx + 2}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {selectedIdx !== null && (
        <div
          id="photo-lightbox-modal"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedIdx(null)}
        >
          <button
            onClick={() => setSelectedIdx(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={handlePrev}
            className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition hidden sm:flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div
            className="max-w-4xl max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <ListingImage
              src={gallery[selectedIdx]}
              business={{ name: businessName }}
              imageType="gallery"
              index={selectedIdx + 1}
              className="max-w-full max-h-[72vh] object-contain rounded-xl shadow-2xl"
            />
            <div className="flex items-center justify-between w-full mt-3 text-white text-sm">
              <span className="font-medium">{businessName}</span>
              <span className="text-slate-400">Photo {selectedIdx + 1} of {gallery.length}</span>
            </div>

            {/* Thumbnail navigation */}
            <div className="flex gap-2 mt-2 overflow-x-auto py-1">
              {gallery.map((thumb, tIdx) => (
                <button
                  key={tIdx}
                  onClick={() => setSelectedIdx(tIdx)}
                  className={`w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${
                    selectedIdx === tIdx ? 'border-emerald-400 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <ListingImage
                    src={thumb}
                    business={{ name: businessName }}
                    imageType="thumbnail"
                    index={tIdx + 1}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleNext}
            className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition hidden sm:flex items-center justify-center"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};
