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
} from 'lucide-react';
import { Business, EstateZone, BusinessApplication } from '../../types';
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
  const [category, setCategory] = useState('food-dining');
  const [subCategory, setSubCategory] = useState('');
  const [zone, setZone] = useState<EstateZone>('Congo Stage');
  const [landmark, setLandmark] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
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
    'Congo Stage',
    'Roundabout',
    'Jacaranda Estate',
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
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
                kwestdirectory.co.ke • Merchant Portal
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                List Your Business in Kahawa West
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMode ? (
          <div className="p-8 sm:p-12 text-center my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Business Listed Successfully!</h3>
            <p className="text-slate-600 text-sm max-w-md mx-auto mb-4">
              <strong>{name}</strong> is now live on the Kahawa West directory and accessible to estate neighbors.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Live on kwestdirectory.co.ke
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1 text-sm">
            {/* Applicant identity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                  className="w-full p-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  <option value="Owner">Owner / Proprietor</option>
                  <option value="Manager">Manager</option>
                  <option value="Representative">Authorized Representative</option>
                </select>
              </div>
            </div>

            {/* Business Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Business Name *
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jacaranda Clean Water & Gas"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Estate Zone in Kahawa West *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <select
                    value={zone}
                    onChange={(e) => setZone(e.target.value as EstateZone)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    {zones.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Specific Sub-Specialty
                </label>
                <input
                  type="text"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  placeholder="e.g. Chemist, Nyama Choma, Electrician"
                  className="w-full p-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Landmark & Building Spot *
              </label>
              <input
                type="text"
                required
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Opposite Congo Shell, next to Equity agent"
                className="w-full p-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Contacts & WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number for Direct Calls *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+254712345678"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 font-mono text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                  placeholder="254712345678"
                  className="w-full p-2 rounded-xl border border-slate-300 font-mono text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* M-Pesa Setup */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-emerald-950 text-xs uppercase tracking-wider">
                  Lipa na M-Pesa (Optional)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

            {/* 5 Photos */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    5 Photos (Photo #1 is Main Card Hero)
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {photos.map((p, idx) => (
                  <div key={idx} className="space-y-1">
                    <img src={p} alt="thumb" className="w-full h-16 object-cover rounded-lg border border-slate-300" />
                    <input
                      type="text"
                      value={p}
                      onChange={(e) => handlePhotoChange(idx, e.target.value)}
                      placeholder={`URL ${idx + 1}`}
                      className="w-full p-1 text-[10px] font-mono rounded border border-slate-300"
                    />
                  </div>
                ))}
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
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>

              <Button
                id="publish-business-btn"
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitting}
                icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              >
                {isSubmitting ? 'Publishing Listing...' : 'Publish Listing to kwestdirectory.co.ke'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
