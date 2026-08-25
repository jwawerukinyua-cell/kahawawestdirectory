import React, { useState } from 'react';
import { Camera, ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';

interface BusinessGalleryProps {
  images: string[];
  businessName: string;
}

export const BusinessGallery: React.FC<BusinessGalleryProps> = ({ images, businessName }) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const gallery = images && images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80',
  ];

  const mainPhoto = gallery[0];
  const additionalPhotos = gallery.slice(1, 5);

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

  return (
    <div id="business-gallery-section" className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-lg">Verified Photos & Premises ({gallery.length} Photos)</h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">Click any photo to enlarge</span>
      </div>

      {/* 5-Photo Bento Mosaic */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 h-auto md:h-72">
        {/* Main Large Photo (Takes 2 cols & 2 rows on desktop) */}
        <div
          className="md:col-span-2 relative group overflow-hidden rounded-xl cursor-pointer bg-slate-100 min-h-[200px]"
          onClick={() => setSelectedIdx(0)}
        >
          <img
            src={mainPhoto}
            alt={`${businessName} primary photo`}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/30 transition flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 text-white text-xs font-semibold backdrop-blur-sm">
              <Maximize2 className="w-3.5 h-3.5" /> View Main Photo
            </span>
          </div>
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[11px] font-semibold backdrop-blur-sm">
            Primary
          </span>
        </div>

        {/* 4 Additional Grid Photos */}
        <div className="md:col-span-2 grid grid-cols-2 gap-3">
          {additionalPhotos.map((img, idx) => (
            <div
              key={idx}
              className="relative group overflow-hidden rounded-xl cursor-pointer bg-slate-100 h-32 md:h-[138px]"
              onClick={() => setSelectedIdx(idx + 1)}
            >
              <img
                src={img}
                alt={`${businessName} photo ${idx + 2}`}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                referrerPolicy="no-referrer"
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
            <img
              src={gallery[selectedIdx]}
              alt={`${businessName} full view ${selectedIdx + 1}`}
              className="max-w-full max-h-[72vh] object-contain rounded-xl shadow-2xl"
              referrerPolicy="no-referrer"
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
                  <img src={thumb} alt="thumb" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
