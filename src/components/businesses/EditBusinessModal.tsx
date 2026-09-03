import React, { useState, useEffect } from 'react';
import {
  X,
  Building,
  Phone,
  Mail,
  MapPin,
  Clock,
  Plus,
  Trash2,
  CreditCard,
  Globe,
  Loader2,
  Check,
  Tag,
  Share2,
  AlertCircle,
  Save,
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { Business, EstateZone, OperationType } from '../../types';
import { saveCustomizedBusiness, generateBusinessSlug } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { compressImageFile, validateImageFile } from '../../lib/imageCompression';

interface EditBusinessModalProps {
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
  onBusinessUpdated: (updatedBusiness: Business) => void;
  isAdmin?: boolean;
}

const ESTATE_ZONES: EstateZone[] = [
  'Kamiti Road',
  'Roundabout',
  'Northern Bypass',
  'Congo',
  'Jacaranda Estate',
  'Jubilee Estate',
  'Bima Road',
  'Soweto',
  'Kamae',
  'Station / Railway',
  'Mahiga',
  'Kware / Quarry',
  'Kiamumbi Border',
];

const CATEGORIES = [
  'Groceries & Fresh Food',
  'Healthcare & Chemists',
  'Salons & Barbershops',
  'Automotive & Spares',
  'Home Services & Hardware',
  'Hotels, Cafes & Fast Food',
  'Education & Daycares',
  'Electronics & Repairs',
  'Professional Services',
  'Fashion & Tailoring',
  'Wines & Spirits',
  'Fitness & Gyms',
];

const formatScheduleString = (schedule: any, fallback = '8:00 AM - 8:00 PM'): string => {
  if (!schedule) return fallback;
  if (typeof schedule === 'string') return schedule;
  if (typeof schedule === 'object') {
    if (schedule.isClosed) return 'Closed';
    if ((schedule.open === '00:00' && schedule.close === '23:59') || schedule.open === '24 Hours') {
      return 'Open 24 Hours';
    }
    if (schedule.open && schedule.close) {
      return `${schedule.open} - ${schedule.close}`;
    }
    if (schedule.open) return schedule.open;
  }
  return fallback;
};

const parseScheduleObject = (input: string): { open: string; close: string; isClosed?: boolean } => {
  const str = input ? input.trim() : '';
  if (!str) return { open: '08:00', close: '20:00', isClosed: false };
  const lower = str.toLowerCase();
  if (lower.includes('closed')) {
    return { open: '00:00', close: '00:00', isClosed: true };
  }
  if (lower.includes('24')) {
    return { open: '00:00', close: '23:59', isClosed: false };
  }
  if (str.includes('-')) {
    const parts = str.split('-');
    return {
      open: parts[0]?.trim() || '08:00',
      close: parts[1]?.trim() || '20:00',
      isClosed: false,
    };
  }
  return { open: str, close: '', isClosed: false };
};

export const EditBusinessModal: React.FC<EditBusinessModalProps> = ({
  business,
  isOpen,
  onClose,
  onBusinessUpdated,
  isAdmin = false,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'contacts' | 'hours' | 'photos' | 'mpesa'>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState('');
  const [operationType, setOperationType] = useState<OperationType>('physical_shop');
  const [zone, setZone] = useState<EstateZone>('Kamiti Road');
  const [landmark, setLandmark] = useState('');
  const [addressDetails, setAddressDetails] = useState('');
  const [description, setDescription] = useState('');

  // Contacts
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');

  // Services
  const [services, setServices] = useState<string[]>([]);
  const [newServiceInput, setNewServiceInput] = useState('');

  // Hours
  const [monday, setMonday] = useState('8:00 AM - 8:00 PM');
  const [tuesday, setTuesday] = useState('8:00 AM - 8:00 PM');
  const [wednesday, setWednesday] = useState('8:00 AM - 8:00 PM');
  const [thursday, setThursday] = useState('8:00 AM - 8:00 PM');
  const [friday, setFriday] = useState('8:00 AM - 8:00 PM');
  const [saturday, setSaturday] = useState('8:00 AM - 8:00 PM');
  const [sunday, setSunday] = useState('9:00 AM - 6:00 PM');
  const [is247, setIs247] = useState(false);

  // Photos
  const [photos, setPhotos] = useState<string[]>([]);

  // M-Pesa
  const [mpesaType, setMpesaType] = useState<'Till' | 'Paybill' | 'Pochi la Biashara' | 'Send Money'>('Till');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [mpesaAccountName, setMpesaAccountName] = useState('');
  const [mpesaAccountNumber, setMpesaAccountNumber] = useState('');

  // Special Offer
  const [hasOffer, setHasOffer] = useState(false);
  const [offerTitle, setOfferTitle] = useState('');
  const [offerDescription, setOfferDescription] = useState('');
  const [offerBadgeText, setOfferBadgeText] = useState('');

  // Populate form on open
  useEffect(() => {
    if (business) {
      setName(business.name || '');
      setTagline(business.tagline || '');
      setCategory(business.category || 'Groceries & Fresh Food');
      setOperationType(business.operationType || 'physical_shop');
      setZone(business.zone || 'Kamiti Road');
      setLandmark(business.landmark || '');
      setAddressDetails(business.addressDetails || '');
      setDescription(business.description || '');

      setPhone(business.phone || '');
      setWhatsapp(business.whatsapp || '');
      setEmail(business.email || '');
      setFacebook(business.socialLinks?.facebook || '');
      setInstagram(business.socialLinks?.instagram || '');
      setTiktok(business.socialLinks?.tiktok || '');

      setServices(business.services && business.services.length > 0 ? [...business.services] : ['Customer Support', 'Local Delivery']);

      const hours = (business.openingHours || {}) as any;
      setMonday(formatScheduleString(hours.monday, '8:00 AM - 8:00 PM'));
      setTuesday(formatScheduleString(hours.tuesday, '8:00 AM - 8:00 PM'));
      setWednesday(formatScheduleString(hours.wednesday, '8:00 AM - 8:00 PM'));
      setThursday(formatScheduleString(hours.thursday, '8:00 AM - 8:00 PM'));
      setFriday(formatScheduleString(hours.friday, '8:00 AM - 8:00 PM'));
      setSaturday(formatScheduleString(hours.saturday, '8:00 AM - 8:00 PM'));
      setSunday(formatScheduleString(hours.sunday, '9:00 AM - 6:00 PM'));

      const isMonday24 =
        typeof hours.monday === 'string'
          ? hours.monday.toLowerCase().includes('24')
          : (hours.monday?.open === '00:00' && hours.monday?.close === '23:59') || hours.monday?.open === '24 Hours';
      setIs247(Boolean(isMonday24));

      const existingPhotos = (business.galleryImages && business.galleryImages.length > 0)
        ? business.galleryImages.slice(0, 5)
        : [
            business.heroImage || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80',
          ];
      
      while (existingPhotos.length < 5) {
        existingPhotos.push('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80');
      }
      setPhotos(existingPhotos);

      if (business.mpesa) {
        setMpesaType(business.mpesa.type || 'Till');
        setMpesaNumber(business.mpesa.number || '');
        setMpesaAccountName(business.mpesa.accountName || '');
        setMpesaAccountNumber(business.mpesa.accountNumber || '');
      } else {
        setMpesaType('Till');
        setMpesaNumber('');
        setMpesaAccountName('');
        setMpesaAccountNumber('');
      }

      if (business.specialOffer) {
        setHasOffer(true);
        setOfferTitle(business.specialOffer.title || '');
        setOfferDescription(business.specialOffer.description || '');
        setOfferBadgeText(business.specialOffer.badgeText || 'RESIDENT DISCOUNT');
      } else {
        setHasOffer(false);
        setOfferTitle('');
        setOfferDescription('');
        setOfferBadgeText('');
      }
    }
  }, [business, isOpen]);

  if (!isOpen || !business) return null;

  const handleAddService = () => {
    if (newServiceInput.trim() && !services.includes(newServiceInput.trim())) {
      setServices([...services, newServiceInput.trim()]);
      setNewServiceInput('');
    }
  };

  const handleRemoveService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const handlePhotoChange = (index: number, value: string) => {
    const next = [...photos];
    next[index] = value;
    setPhotos(next);
  };

  const handleFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        alert(validation.error || 'Invalid photo format');
        return;
      }
      try {
        const dataUrl = await compressImageFile(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.78 });
        handlePhotoChange(index, dataUrl);
      } catch (err) {
        console.error('Failed to compress photo in edit modal:', err);
        alert('Could not process selected image.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Business name and phone number are required.');
      return;
    }

    setIsSubmitting(true);

    const validPhotos = photos.map((p) => (p && p.trim() !== '' ? p : 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'));
    const newSlug = generateBusinessSlug(name.trim()) || business.slug;

    const updatedBusiness: Business = {
      ...business,
      slug: newSlug,
      name: name.trim(),
      tagline: tagline.trim(),
      category,
      operationType,
      zone,
      landmark: landmark.trim(),
      addressDetails: addressDetails.trim(),
      description: description.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || phone.trim(),
      email: email.trim() || undefined,
      heroImage: validPhotos[0],
      galleryImages: validPhotos,
      services: services.length > 0 ? services : ['Local Service'],
      openingHours: is247
        ? {
            monday: { open: '00:00', close: '23:59', isClosed: false },
            tuesday: { open: '00:00', close: '23:59', isClosed: false },
            wednesday: { open: '00:00', close: '23:59', isClosed: false },
            thursday: { open: '00:00', close: '23:59', isClosed: false },
            friday: { open: '00:00', close: '23:59', isClosed: false },
            saturday: { open: '00:00', close: '23:59', isClosed: false },
            sunday: { open: '00:00', close: '23:59', isClosed: false },
          }
        : {
            monday: parseScheduleObject(monday),
            tuesday: parseScheduleObject(tuesday),
            wednesday: parseScheduleObject(wednesday),
            thursday: parseScheduleObject(thursday),
            friday: parseScheduleObject(friday),
            saturday: parseScheduleObject(saturday),
            sunday: parseScheduleObject(sunday),
          },
      socialLinks: {
        facebook: facebook.trim() || undefined,
        instagram: instagram.trim() || undefined,
        tiktok: tiktok.trim() || undefined,
      },
      mpesa: mpesaNumber.trim()
        ? {
            type: mpesaType,
            number: mpesaNumber.trim(),
            accountName: mpesaAccountName.trim() || undefined,
            accountNumber: mpesaAccountNumber.trim() || undefined,
          }
        : undefined,
      specialOffer: hasOffer && offerTitle.trim()
        ? {
            title: offerTitle.trim(),
            description: offerDescription.trim(),
            badgeText: offerBadgeText.trim() || 'SPECIAL OFFER',
          }
        : undefined,
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveCustomizedBusiness(updatedBusiness);
      onBusinessUpdated(updatedBusiness);
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        setIsSubmitting(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Failed to update business:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="edit-business-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 font-sans animate-in fade-in"
    >
      <div className="bg-[#FAF8F5] text-slate-900 rounded-3xl max-w-4xl w-full border border-stone-300 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-[#4D0202] text-white flex items-center justify-between border-b border-[#630303] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#630303] border border-rose-400/30 flex items-center justify-center text-amber-300">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-lg sm:text-xl text-white">
                  Update Business Details
                </h3>
                {business.isClaimed && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/50">
                    Verified Listing
                  </span>
                )}
              </div>
              <p className="text-xs text-rose-200">
                Updating: <span className="font-bold text-white">{business.name}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-200 hover:text-white hover:bg-[#630303] transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Toast */}
        {showSuccessToast && (
          <div className="bg-emerald-700 text-white px-4 py-2.5 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>Listing updated and synchronized successfully!</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-2 bg-stone-200/80 border-b border-stone-300 overflow-x-auto shrink-0 scrollbar-none text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'details' ? 'bg-[#630303] text-white shadow-xs' : 'bg-white text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Basic & Location</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contacts')}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'contacts' ? 'bg-[#630303] text-white shadow-xs' : 'bg-white text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Contacts & Social</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hours')}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'hours' ? 'bg-[#630303] text-white shadow-xs' : 'bg-white text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Hours & Schedule</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'photos' ? 'bg-[#630303] text-white shadow-xs' : 'bg-white text-stone-700 hover:bg-stone-100'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>5 Store Photos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mpesa')}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'mpesa' ? 'bg-[#630303] text-white shadow-xs' : 'bg-white text-stone-700 hover:bg-stone-100'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
            <span>M-Pesa & Deals</span>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: BASIC & LOCATION */}
          {activeTab === 'details' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#630303]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Tagline / Catchphrase
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#630303]"
                    placeholder="e.g. Fresh organic groceries delivered daily"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2.5 text-xs text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#630303]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Estate Zone *
                  </label>
                  <select
                    value={zone}
                    onChange={(e) => setZone(e.target.value as EstateZone)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2.5 text-xs text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#630303]"
                  >
                    {ESTATE_ZONES.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Operation Type
                  </label>
                  <select
                    value={operationType}
                    onChange={(e) => setOperationType(e.target.value as OperationType)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2.5 text-xs text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#630303]"
                  >
                    <option value="physical_shop">Physical Walk-in Shop</option>
                    <option value="delivery_only">Delivery / Online Only</option>
                    <option value="both">Both Walk-in & Delivery</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Specific Landmark / Street Directions *
                </label>
                <input
                  type="text"
                  required
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#630303]"
                  placeholder="e.g. Opposite Posta, 2nd floor above QuickChem Pharmacy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  About the Business / Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#630303]"
                  placeholder="Detailed description of what you offer to Kahawa West residents..."
                />
              </div>

              {/* Services List Tag Builder */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Offered Services & Specialties
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newServiceInput}
                    onChange={(e) => setNewServiceInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddService();
                      }
                    }}
                    placeholder="Type service (e.g. Free Home Delivery, MPESA Cashout) and press Add"
                    className="flex-1 bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#630303]"
                  />
                  <button
                    type="button"
                    onClick={handleAddService}
                    className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {services.map((srv, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-200 text-stone-800 text-xs font-semibold border border-stone-300"
                    >
                      <span>{srv}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveService(idx)}
                        className="text-stone-500 hover:text-red-600 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTACTS & SOCIAL */}
          {activeTab === 'contacts' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Primary Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#630303]"
                    placeholder="0712345678 or +254712345678"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    WhatsApp Chat Number
                  </label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#630303]"
                    placeholder="0712345678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#630303]"
                  placeholder="contact@business.co.ke"
                />
              </div>

              <div className="p-4 bg-stone-100 rounded-2xl border border-stone-300 space-y-3">
                <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-emerald-700" />
                  <span>Social Media & Online Pages</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Facebook Page / URL
                    </label>
                    <input
                      type="text"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      placeholder="facebook.com/mybusiness"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#630303]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Instagram Handle
                    </label>
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="@mybusiness_ke"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#630303]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      TikTok Account
                    </label>
                    <input
                      type="text"
                      value={tiktok}
                      onChange={(e) => setTiktok(e.target.value)}
                      placeholder="@mybusiness"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#630303]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OPERATING HOURS */}
          {activeTab === 'hours' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between p-3.5 bg-amber-50 border border-amber-300 rounded-2xl">
                <div>
                  <h4 className="text-xs font-bold text-amber-950">Is this business open 24/7?</h4>
                  <p className="text-[11px] text-amber-800">Toggle for emergency chemists, petrol stations, or 24hr services.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={is247}
                    onChange={(e) => setIs247(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {!is247 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-stone-300">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Monday</label>
                    <input
                      type="text"
                      value={monday}
                      onChange={(e) => setMonday(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Tuesday</label>
                    <input
                      type="text"
                      value={tuesday}
                      onChange={(e) => setTuesday(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Wednesday</label>
                    <input
                      type="text"
                      value={wednesday}
                      onChange={(e) => setWednesday(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Thursday</label>
                    <input
                      type="text"
                      value={thursday}
                      onChange={(e) => setThursday(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Friday</label>
                    <input
                      type="text"
                      value={friday}
                      onChange={(e) => setFriday(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Saturday</label>
                    <input
                      type="text"
                      value={saturday}
                      onChange={(e) => setSaturday(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Sunday</label>
                    <input
                      type="text"
                      value={sunday}
                      onChange={(e) => setSunday(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: 5 STORE PHOTOS */}
          {activeTab === 'photos' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 bg-stone-100 rounded-2xl border border-stone-300 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-stone-900">5 Photo Storefront Gallery</h4>
                  <p className="text-[11px] text-stone-600">
                    Slot 1 is your Main Hero photo displayed on search cards. Upload local files or paste image URLs.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {photos.map((p, idx) => {
                  const displayImg = p && p.trim() !== '' ? p : 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';
                  return (
                    <div key={idx} className="bg-white p-2 rounded-2xl border border-stone-300 shadow-2xs space-y-2 flex flex-col justify-between">
                      <div className="relative h-24 rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                        <img
                          src={displayImg}
                          alt={name ? `${name} photo slot ${idx + 1} - Kahawa West` : `Business photo slot ${idx + 1}`}
                          title={`Photo slot ${idx + 1}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${idx === 0 ? 'bg-emerald-600 text-white' : 'bg-black/75 text-white'}`}>
                          {idx === 0 ? '★ Hero' : `Slot #${idx + 1}`}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <input
                          type="url"
                          value={p.startsWith('data:') ? '' : p}
                          onChange={(e) => handlePhotoChange(idx, e.target.value)}
                          placeholder="Image URL"
                          className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2 py-1 text-[10px] text-stone-900"
                        />

                        <label className="block text-center py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 text-[10px] font-bold cursor-pointer transition active:scale-95">
                          <span>Upload File</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(idx, e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: M-PESA & DISCOUNTS */}
          {activeTab === 'mpesa' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Mpesa Section */}
              <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-300 space-y-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-700" />
                  <h4 className="text-xs font-bold text-emerald-950">Lipa Na M-Pesa Integration</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                      Payment Channel Type
                    </label>
                    <select
                      value={mpesaType}
                      onChange={(e) => setMpesaType(e.target.value as any)}
                      className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs font-semibold text-emerald-950"
                    >
                      <option value="Till">Buy Goods (Till Number)</option>
                      <option value="Paybill">Paybill Business Number</option>
                      <option value="Pochi la Biashara">Pochi la Biashara</option>
                      <option value="Send Money">Send Money Phone</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                      Till / Paybill / Phone Number
                    </label>
                    <input
                      type="text"
                      value={mpesaNumber}
                      onChange={(e) => setMpesaNumber(e.target.value)}
                      placeholder="e.g. 543210"
                      className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                      Registered Account Name
                    </label>
                    <input
                      type="text"
                      value={mpesaAccountName}
                      onChange={(e) => setMpesaAccountName(e.target.value)}
                      placeholder="e.g. FRESH GREENS ENTERPRISES"
                      className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                    />
                  </div>

                  {mpesaType === 'Paybill' && (
                    <div>
                      <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                        Default Account Number
                      </label>
                      <input
                        type="text"
                        value={mpesaAccountNumber}
                        onChange={(e) => setMpesaAccountNumber(e.target.value)}
                        placeholder="e.g. Your Name or Item ID"
                        className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Special Resident Offer */}
              <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-300 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-700" />
                    <h4 className="text-xs font-bold text-amber-950">Special Resident Offer / Discount</h4>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasOffer}
                      onChange={(e) => setHasOffer(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                {hasOffer && (
                  <div className="space-y-3 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-amber-900 mb-1">Offer Title</label>
                        <input
                          type="text"
                          value={offerTitle}
                          onChange={(e) => setOfferTitle(e.target.value)}
                          placeholder="e.g. 10% Off All Fresh Veggies on Weekends"
                          className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-amber-900 mb-1">Badge Text</label>
                        <input
                          type="text"
                          value={offerBadgeText}
                          onChange={(e) => setOfferBadgeText(e.target.value)}
                          placeholder="e.g. RESIDENT SPECIAL"
                          className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-amber-900 mb-1">Discount Details & Terms</label>
                      <textarea
                        rows={2}
                        value={offerDescription}
                        onChange={(e) => setOfferDescription(e.target.value)}
                        placeholder="Mention KWEST Directory when ordering to claim this deal!"
                        className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-xs text-stone-900"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-stone-300 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-200 text-xs font-bold transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#630303] hover:bg-[#7D0404] text-white text-xs font-bold shadow-md transition flex items-center gap-2 disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Business Updates</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
