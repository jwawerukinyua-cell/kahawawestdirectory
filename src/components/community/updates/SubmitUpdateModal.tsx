import React, { useState } from 'react';
import {
  X,
  Megaphone,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { CommunityUpdate, EstateZone, UpdateType } from '../../../types';
import { Button } from '../../ui/Button';

interface SubmitUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateSubmitted: (newUpdate: CommunityUpdate) => void;
}

const ESTATE_ZONES: EstateZone[] = [
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

export const SubmitUpdateModal: React.FC<SubmitUpdateModalProps> = ({
  isOpen,
  onClose,
  onUpdateSubmitted,
}) => {
  const [type, setType] = useState<UpdateType>('event');
  const [title, setTitle] = useState('');
  const [timeInfo, setTimeInfo] = useState('');
  const [location, setLocation] = useState('');
  const [zone, setZone] = useState<EstateZone>('Roundabout');
  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorPhone, setAuthorPhone] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a clear update title.');
      return;
    }
    if (!timeInfo.trim()) {
      setError('Please specify the date or time (e.g., Saturday • 10:00 AM).');
      return;
    }
    if (!location.trim()) {
      setError('Please provide the location or venue.');
      return;
    }
    if (!content.trim() || content.trim().length < 20) {
      setError('Please provide details for the update (at least 20 characters).');
      return;
    }
    if (!authorName.trim() || !authorPhone.trim()) {
      setError('Please enter your name and phone number for editorial verification.');
      return;
    }

    const newUpdate: CommunityUpdate = {
      id: `up-${Date.now()}`,
      title: title.trim(),
      type,
      timeInfo: timeInfo.trim(),
      location: location.trim(),
      zone,
      content: content.trim(),
      author: authorName.trim(),
      authorPhone: authorPhone.trim(),
      authorEmail: authorEmail.trim() || undefined,
      contact: contact.trim() || authorPhone.trim(),
      date: timeInfo.split('•')[0].trim() || 'This Week',
      status: 'pending_review',
      submittedAt: new Date().toISOString(),
    };

    onUpdateSubmitted(newUpdate);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setTitle('');
    setTimeInfo('');
    setLocation('');
    setContent('');
    setContact('');
    setAuthorName('');
    setAuthorPhone('');
    setAuthorEmail('');
    setIsSubmitted(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 font-sans animate-in fade-in">
      <div className="bg-[#121417] text-white rounded-3xl max-w-xl w-full border border-stone-800 shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-[#181B20] border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-600/50 flex items-center justify-center text-emerald-400">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg sm:text-xl text-white">
                Post a Community Update
              </h3>
              <p className="text-xs text-stone-400">
                Share alerts, events, business openings or community initiatives
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-950/90 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-display font-bold text-2xl text-white">
              Update Received!
            </h4>
            <p className="text-stone-300 text-sm max-w-md mx-auto leading-relaxed">
              Thank you for keeping Kahawa West informed. Your update has been sent to our community editorial desk for rapid review and will appear live once confirmed.
            </p>
            <div className="pt-4">
              <Button onClick={handleReset} variant="primary" className="px-8 py-2.5 rounded-xl font-bold">
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Type selector */}
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                Update Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'alert', label: 'Alert', dot: 'bg-orange-500', icon: '🚨' },
                  { id: 'event', label: 'Event', dot: 'bg-blue-500', icon: '🔵' },
                  { id: 'business', label: 'Business', dot: 'bg-emerald-500', icon: '🟢' },
                  { id: 'community', label: 'Community', dot: 'bg-rose-500', icon: '💖' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id as UpdateType)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                      type === item.id
                        ? 'bg-stone-800 border-emerald-500 text-white shadow-sm'
                        : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${item.dot}`} />
                    <span className="capitalize">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                Update Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Scheduled Water Interruption or Youth Football Tournament"
                className="w-full bg-[#181B20] border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* Date/Time and Location in 2 cols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-stone-400" />
                  <span>Time / Schedule *</span>
                </label>
                <input
                  type="text"
                  value={timeInfo}
                  onChange={(e) => setTimeInfo(e.target.value)}
                  placeholder="e.g. Tomorrow • 9:00 AM - 4:00 PM"
                  className="w-full bg-[#181B20] border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  <span>Location / Venue *</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Kahawa West Grounds or Kamiti Road"
                  className="w-full bg-[#181B20] border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* Estate Zone */}
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                Estate Zone
              </label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value as EstateZone)}
                className="w-full bg-[#181B20] border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
              >
                {ESTATE_ZONES.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>

            {/* Content / Announcement */}
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                Announcement Details *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                placeholder="Provide key information residents should know, advice, or how to participate..."
                className="w-full bg-[#181B20] border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* Contact Information */}
            <div className="pt-2 border-t border-stone-800">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                Your Contact Information (For Verification)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Your Name *"
                  className="w-full bg-[#181B20] border border-stone-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition"
                />
                <input
                  type="tel"
                  value={authorPhone}
                  onChange={(e) => setAuthorPhone(e.target.value)}
                  placeholder="Phone / WhatsApp Number *"
                  className="w-full bg-[#181B20] border border-stone-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-stone-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-2"
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>Submit for Editorial Review</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
