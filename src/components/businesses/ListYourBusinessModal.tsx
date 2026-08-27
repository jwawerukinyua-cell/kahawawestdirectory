import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  Camera,
  CheckCircle2,
  Globe,
  CreditCard,
  Loader2,
  Upload,
  UploadCloud,
} from 'lucide-react';
import { Business, EstateZone, BusinessApplication, OperationType } from '../../types';
import { saveBusinessApplication, saveCustomizedBusiness } from '../../lib/supabase';
import { DEFAULT_OPENING_HOURS } from '../../data/defaultOpeningHours';
import { Button } from '../ui/Button';

interface ListYourBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBusinessAdded: (newBusiness: Business) => void;
}

export const ListYourBusinessModal: React.FC<ListYourBusinessModalProps> = ({
  isOpen,
  onClose,
  onBusinessAdded,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMode, setSuccessMode] = useState(false);

  // Form State
  const [applicantName, setApplicantName] = useState('');
  const [applicantRole, setApplicantRole] = useState('Owner');
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [operationType, setOperationType] = useState<OperationType>('physical_shop');
  const [category, setCategory] = useState('food-dining');
  const [subCategory, setSubCategory] = useState('');
  const [zone, setZone] = useState<EstateZone>('Congo');
  const [landmark, setLandmark] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [mpesaType, setMpesaType] = useState<'Till' | 'Paybill' | 'Pochi la Biashara' | 'Send Money'>('Till');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [mpesaAccountName, setMpesaAccountName] = useState('');

  // 5 Photos
  const [photos, setPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80',
  ]);

  if (!isOpen) return null;

  const handlePhotoChange = (index: number, val: string) => {
    const updated = [...photos];
    updated[index] = val;
    setPhotos(updated);
  };

  const compressAndReadFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleDeviceFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const updatedPhotos = [...photos];
      const maxToLoad = Math.min(files.length, 5);

      for (let i = 0; i < maxToLoad; i++) {
        const dataUrl = await compressAndReadFile(files[i]);
        updatedPhotos[i] = dataUrl;
      }
      setPhotos(updatedPhotos);
    } catch (err) {
      console.error('Error reading files:', err);
      alert('Could not process selected image files.');
    }
  };

  const handleSingleSlotUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const dataUrl = await compressAndReadFile(files[0]);
      handlePhotoChange(index, dataUrl);
    } catch (err) {
      console.error('Error reading file for slot:', err);
      alert('Could not process selected image file.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !landmark) {
      alert('Please provide the business name, phone number, and location landmark.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newId = `kw-custom-${Date.now()}`;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const newBusinessRecord: Business = {
        id: newId,
        slug: slug,
        name: name,
        tagline: tagline || `${name} in ${zone}, Kahawa West`,
        category: category,
        subCategory: subCategory || undefined,
        operationType: operationType,
        zone: zone,
        landmark: landmark,
        phone: phone,
        whatsapp: whatsapp ? whatsapp.replace(/[^0-9]/g, '') : phone.replace(/[^0-9]/g, ''),
        email: email || undefined,
        isVerified: true,
        isClaimed: true,
        claimedBy: `${applicantName || 'Proprietor'} (${applicantRole})`,
        claimedAt: new Date().toISOString().split('T')[0],
        rating: 5.0,
        reviewCount: 1,
        priceLevel: 'Moderate',
        heroImage: photos[0],
        galleryImages: photos,
        socialLinks: website ? {
          website: website.startsWith('http') ? website : `https://${website}`,
        } : undefined,
        description: description || `Welcome to ${name}, serving residents in ${zone}, Kahawa West.`,
        services: ['Local Service in Kahawa West', 'Direct Resident Support'],
        mpesa: mpesaNumber
          ? {
              type: mpesaType,
              number: mpesaNumber,
              accountName: mpesaAccountName || name.toUpperCase(),
            }
          : undefined,
        openingHours: DEFAULT_OPENING_HOURS,
        createdAt: new Date().toISOString(),
      };

      const application: BusinessApplication = {
        name,
        category,
        operationType,
        zone,
        landmark,
        phone,
        whatsapp: whatsapp || phone,
        email,
        description,
        services: newBusinessRecord.services,
        mpesaType,
        mpesaNumber,
        heroImage: photos[0],
        galleryImages: photos,
        applicantName,
        applicantPhone: phone,
        applicantRole,
        created_at: new Date().toISOString(),
      };

      await saveBusinessApplication(application);
      await saveCustomizedBusiness(newBusinessRecord);

      setSuccessMode(true);
      setTimeout(() => {
        setIsSubmitting(false);
        onBusinessAdded(newBusinessRecord);
        onClose();
      }, 1800);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      alert('Error creating listing.');
    }
  };

  const zones: EstateZone[] = [
    'Congo',
    'Roundabout',
    'Jacaranda Estate',
    'Jubilee Estate',
    'Northern Bypass',
    'Kware / Quarry',
    'Bima Road',
    'Soweto',
    'Kamae',
    'Station / Railway',
    'Mahiga',
    'Kamiti Road',
    'Kiamumbi Border',
  ];

  return (
    <div
      id="list-business-modal"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        className="bg-white w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#2E0202] text-white p-4 sm:p-6 flex items-center justify-between flex-shrink-0 border-b border-[#4D0202]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-extrabold text-emerald-400">
                Merchant Registration Portal
              </span>
              <h2 className="text-base sm:text-xl font-bold text-white leading-snug">
                List Your Business in Kahawa West
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMode ? (
          <div className="p-6 sm:p-12 text-center my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Business Listed Successfully!</h3>
            <p className="text-slate-600 text-sm max-w-md mx-auto mb-4">
              <strong>{name}</strong> is now live on the Kahawa West directory and accessible to estate neighbors.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Live on KWEST Directory
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 text-sm">
            {/* Applicant identity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Your Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="e.g. Grace Wambui"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Your Role in Business
                </label>
                <select
                  value={applicantRole}
                  onChange={(e) => setApplicantRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-xs sm:text-sm"
                >
                  <option value="Owner">Owner / Proprietor</option>
                  <option value="Manager">Manager</option>
                  <option value="Representative">Authorized Representative</option>
                </select>
              </div>
            </div>

            {/* Business Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Business / Brand / Trade Name *
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jacaranda Clean Water & Gas, or Kevin Electricals"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Operating Model / Work Type *
                </label>
                <select
                  value={operationType}
                  onChange={(e) => setOperationType(e.target.value as OperationType)}
                  className="w-full p-2.5 rounded-xl border border-emerald-300 bg-emerald-50/50 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs sm:text-sm font-semibold text-emerald-950"
                >
                  <option value="physical_shop">🏢 Physical Store / Commercial Shop / Office</option>
                  <option value="home_based">🏠 Home-Based (Operates from Home / Residential Base)</option>
                  <option value="mobile_service">🚗 Mobile Service (Moves from Place to Place / Doorstep)</option>
                  <option value="freelancer">💻 Freelancer / Independent Professional</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {operationType === 'physical_shop' 
                    ? 'Estate Zone in Kahawa West *' 
                    : 'Residential Base Zone in Kahawa West *'}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <select
                    value={zone}
                    onChange={(e) => setZone(e.target.value as EstateZone)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-xs sm:text-sm"
                  >
                    {zones.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>
                {operationType !== 'physical_shop' && (
                  <p className="text-[11px] text-emerald-700 font-medium mt-1">
                    💡 Freelancers & home-based providers: select the zone where you live/operate from.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs sm:text-sm"
                >
                  <option value="food-dining">Food & Dining</option>
                  <option value="health-medical">Health & Medical</option>
                  <option value="beauty-grooming">Beauty & Grooming</option>
                  <option value="shopping-groceries">Shopping & Groceries</option>
                  <option value="fundis-trades">Fundis & Artisan Trades</option>
                  <option value="auto-transport">Auto & Transport</option>
                  <option value="tech-cyber">Tech, Cyber & Printing</option>
                  <option value="financial-mpesa">Financial & M-Pesa</option>
                  <option value="education-daycare">Schools & Daycare</option>
                  <option value="home-rentals">Housing & Property</option>
                  <option value="events-leisure">Events & Entertainment</option>
                  <option value="laundry-cleaning">Laundry & Cleaning</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Specific Sub-Specialty
                </label>
                <input
                  type="text"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  placeholder="e.g. Chemist, Plumber, Graphic Designer, Tutor"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {operationType === 'physical_shop'
                    ? 'Landmark & Physical Building Spot *'
                    : 'Landmark / Service Area Description *'}
                </label>
                <input
                  type="text"
                  required
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder={
                    operationType === 'physical_shop'
                      ? 'e.g. Opposite Congo Shell, next to Equity agent'
                      : operationType === 'home_based'
                      ? 'e.g. Jacaranda Court 4 (Pick-up or doorstep delivery)'
                      : operationType === 'mobile_service'
                      ? 'e.g. Mobile across all Kahawa West zones, based in Bima'
                      : 'e.g. Remote / client site visits across Kahawa West'
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Contacts & Online Presence */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number for Direct Calls *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0712 345 678"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-mono text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  WhatsApp Contact Number
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="0712 345 678"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Official Website / Page (Optional)
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourbusiness.co.ke"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@business.co.ke"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* M-Pesa Setup */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-emerald-950 text-xs uppercase tracking-wider">
                  Lipa na M-Pesa (Optional)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                <select
                  value={mpesaType}
                  onChange={(e) => setMpesaType(e.target.value as any)}
                  className="p-2 rounded-lg border border-emerald-300 bg-white text-xs font-semibold"
                >
                  <option value="Till">Buy Goods (Till Number)</option>
                  <option value="Paybill">Paybill</option>
                  <option value="Pochi la Biashara">Pochi la Biashara</option>
                </select>
                <input
                  type="text"
                  value={mpesaNumber}
                  onChange={(e) => setMpesaNumber(e.target.value)}
                  placeholder="Till or Paybill No."
                  className="p-2 rounded-lg border border-emerald-300 bg-white text-xs font-mono font-bold"
                />
                <input
                  type="text"
                  value={mpesaAccountName}
                  onChange={(e) => setMpesaAccountName(e.target.value)}
                  placeholder="Account Name"
                  className="p-2 rounded-lg border border-emerald-300 bg-white text-xs uppercase"
                />
              </div>
            </div>

            {/* 5 Photos Section - Clean Mobile Optimized */}
            <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      5 Business Photos (Photo #1 is Main Card Hero)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Select photos from your phone gallery or take new pictures.
                  </p>
                </div>

                <label className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs cursor-pointer transition shadow-sm w-full sm:w-auto">
                  <UploadCloud className="w-4 h-4" />
                  <span>Choose from Gallery / Camera</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleDeviceFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* 5 Responsive Photo Slots Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
                {photos.map((p, idx) => {
                  const photoSrc =
                    p && p.trim() !== ''
                      ? p
                      : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80';
                  return (
                  <div key={idx} className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs space-y-1.5 flex flex-col justify-between">
                    <div className="relative h-20 sm:h-24 rounded-lg overflow-hidden border border-slate-300 bg-slate-100 group">
                      <img src={photoSrc} alt="thumb" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <span className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${idx === 0 ? 'bg-emerald-600 text-white' : 'bg-black/70 text-white'}`}>
                        {idx === 0 ? '★ Main' : `#${idx + 1}`}
                      </span>

                      <label className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center gap-1 cursor-pointer opacity-0 hover:opacity-100 sm:group-hover:opacity-100 transition-opacity">
                        <Upload className="w-4 h-4" />
                        <span className="text-[10px] font-bold">Replace</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleSingleSlotUpload(idx, e)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <label className="block w-full text-center py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold text-[11px] cursor-pointer transition border border-slate-300">
                      <span>Change</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleSingleSlotUpload(idx, e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                );
              })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Description of Services & Products
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell your Kahawa West neighbors what you sell or specialize in..."
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs sm:text-sm"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition order-2 sm:order-1"
              >
                Cancel
              </button>

              <Button
                id="publish-business-btn"
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-600 text-white font-bold order-1 sm:order-2"
                icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              >
                {isSubmitting ? 'Submitting Listing...' : 'Submit Business Listing'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
