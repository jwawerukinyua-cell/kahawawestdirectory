import React, { useState, useRef } from 'react';
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
  Camera,
  Upload,
  Image as ImageIcon,
  ShieldAlert,
  ShieldCheck,
  FileText,
  AlertOctagon,
  Trash2,
  MessageSquare,
  Copy,
  Check,
  ExternalLink,
  Share2,
} from 'lucide-react';
import { CommunityUpdate, EstateZone, UpdateType } from '../../../types';
import { Button } from '../../ui/Button';
import {
  getModeratorEmergencyPhone,
  getWhatsAppChatUrl,
  generateEmergencyWhatsAppAlertCard,
  formatPhoneForDisplay,
} from '../../../lib/phoneUtils';
import { copyToClipboard } from '../../../lib/clipboard';

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

const SUBMITTER_ROLES = [
  'Local Resident / Neighbor',
  'Parent / Legal Guardian',
  'Estate Welfare / Nyumba Kumi Elder',
  'Eyewitness / Community Reporter',
  'Public Utility / Civic Liaison',
  'Community Volunteer / Organizer',
  'Faith-Based / Youth Leader',
];

export const SubmitUpdateModal: React.FC<SubmitUpdateModalProps> = ({
  isOpen,
  onClose,
  onUpdateSubmitted,
}) => {
  const [type, setType] = useState<UpdateType>('alert');
  const [title, setTitle] = useState('');
  const [timeInfo, setTimeInfo] = useState('');
  const [location, setLocation] = useState('');
  const [zone, setZone] = useState<EstateZone>('Roundabout');
  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');
  
  // Submitter Verification & Accountability Fields
  const [authorName, setAuthorName] = useState('');
  const [authorPhone, setAuthorPhone] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [authorRole, setAuthorRole] = useState(SUBMITTER_ROLES[0]);
  const [obNumber, setObNumber] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState<'standard' | 'high' | 'critical'>('standard');
  const [isAccountabilityConfirmed, setIsAccountabilityConfirmed] = useState(false);

  // Photo Attachment State
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedUpdate, setSubmittedUpdate] = useState<CommunityUpdate | null>(null);
  const [hasCopiedCard, setHasCopiedCard] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB.');
      return;
    }

    setIsProcessingImage(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setImageUrl(event.target.result);
      }
      setIsProcessingImage(false);
    };
    reader.onerror = () => {
      setError('Failed to read image file. Please try another image.');
      setIsProcessingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setImageCaption('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide a clear update title (e.g., Missing Child Alert or Power Interruption).');
      return;
    }
    if (!timeInfo.trim()) {
      setError('Please specify the date or time (e.g., Today • 2:30 PM or Saturday • 10:00 AM).');
      return;
    }
    if (!location.trim()) {
      setError('Please provide the specific location or venue in Kahawa West.');
      return;
    }
    if (!content.trim() || content.trim().length < 25) {
      setError('Please provide detailed information for the update (at least 25 characters).');
      return;
    }
    if (!authorName.trim()) {
      setError('Please enter your full legal name for editorial verification.');
      return;
    }
    if (!authorPhone.trim() || authorPhone.trim().length < 9) {
      setError('Please enter a valid phone or WhatsApp number where moderators can reach you.');
      return;
    }
    if (!isAccountabilityConfirmed) {
      setError('You must check the accountability confirmation acknowledging anti-spam and truthful reporting terms.');
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
      authorRole,
      obNumber: obNumber.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      imageCaption: imageCaption.trim() || undefined,
      isAccountabilityConfirmed: true,
      urgencyLevel: type === 'alert' ? urgencyLevel : 'standard',
      contact: contact.trim() || authorPhone.trim(),
      date: timeInfo.split('•')[0].trim() || 'This Week',
      status: 'pending_review',
      submittedAt: new Date().toISOString(),
    };

    onUpdateSubmitted(newUpdate);
    setSubmittedUpdate(newUpdate);
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
    setAuthorRole(SUBMITTER_ROLES[0]);
    setObNumber('');
    setImageUrl('');
    setImageCaption('');
    setIsAccountabilityConfirmed(false);
    setSubmittedUpdate(null);
    setHasCopiedCard(false);
    setIsSubmitted(false);
    setError(null);
    onClose();
  };

  const handleCopyAlertCard = async () => {
    if (!submittedUpdate) return;
    const cardText = generateEmergencyWhatsAppAlertCard(submittedUpdate);
    await copyToClipboard(cardText);
    setHasCopiedCard(true);
    setTimeout(() => setHasCopiedCard(false), 3000);
  };

  const moderatorPhone = getModeratorEmergencyPhone();
  const alertCardText = submittedUpdate ? generateEmergencyWhatsAppAlertCard(submittedUpdate) : '';
  const waChatUrl = submittedUpdate ? getWhatsAppChatUrl(moderatorPhone, alertCardText) : '';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 font-sans animate-in fade-in">
      <div className="bg-[#121417] text-white rounded-3xl max-w-2xl w-full border border-stone-800 shadow-2xl overflow-hidden my-4 sm:my-6 max-h-[94vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-[#181B20] border-b border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950/90 border border-emerald-600/50 flex items-center justify-center text-emerald-400">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg sm:text-xl text-white">
                Post a Community Notice & Update
              </h3>
              <p className="text-xs text-stone-400">
                Verified neighborhood alerts, lost child/person notices, utility cuts & civic events
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
          <div className="p-5 sm:p-7 overflow-y-auto space-y-5">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-950/90 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-display font-bold text-xl sm:text-2xl text-white">
                Notice Submitted to Editorial Desk
              </h4>
              <p className="text-stone-300 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                Thank you for keeping Kahawa West informed and safe. For public safety, our editorial desk verifies submitter contact details before publishing.
              </p>
            </div>

            {/* INSTANT WHATSAPP EMERGENCY DISPATCH RELAY */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#181B20] border-2 border-emerald-500/50 space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-emerald-300 uppercase tracking-wider">
                    ⚡ Instant WhatsApp Emergency Dispatch
                  </span>
                </div>
                <span className="text-[11px] font-mono text-stone-400">
                  Moderator: {formatPhoneForDisplay(moderatorPhone)}
                </span>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed">
                Need this published immediately (e.g. lost child, security or urgent alert)? Dispatch the pre-formatted alert card directly to the <strong>KWEST Duty Moderator</strong> on WhatsApp:
              </p>

              {/* Pre-formatted Card Preview */}
              <div className="p-3.5 bg-stone-950/90 rounded-xl border border-stone-800 text-[11px] sm:text-xs font-mono text-stone-200 whitespace-pre-line leading-relaxed selection:bg-emerald-800">
                {alertCardText}
              </div>

              {/* Dispatch Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <a
                  href={waChatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 text-center"
                >
                  <MessageSquare className="w-4 h-4 fill-white/20 shrink-0" />
                  <span>Send Direct via WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70 shrink-0" />
                </a>

                <button
                  type="button"
                  onClick={handleCopyAlertCard}
                  className="py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs sm:text-sm border border-stone-700 transition flex items-center justify-center gap-2 text-center"
                >
                  {hasCopiedCard ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-emerald-300">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-stone-400 shrink-0" />
                      <span>Copy WhatsApp Alert Card</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-center">
              <Button onClick={handleReset} variant="primary" className="px-8 py-2.5 rounded-xl font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700">
                Done & Return to Notices
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
            {/* STRICT ANTI-PROMOTION WARNING BANNER */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs space-y-1.5 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-amber-300 text-xs sm:text-sm">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span>COMMUNITY INTEGRITY POLICY: NO SELF-PROMOTION OR COMMERCIAL ADS</span>
              </div>
              <p className="text-amber-200/90 leading-relaxed">
                Community Updates & Spotlight are strictly reserved for <strong>public welfare, emergency alerts (e.g. lost child/person, safety hazards, utility disruptions)</strong>, and non-commercial community events.
              </p>
              <p className="text-[11px] text-amber-300/80 font-medium">
                ⛔ Commercial product sales or business ads will be rejected and the submitter account flagged. To promote a shop, please use <strong>&quot;List Business&quot;</strong> or <strong>&quot;Promote on Billboard&quot;</strong>.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Type selector */}
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                Notice Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'alert', label: '🚨 Emergency / Alert', dot: 'bg-amber-500', desc: 'Lost child, utility, hazard' },
                  { id: 'event', label: '🔵 Community Event', dot: 'bg-blue-500', desc: 'Tournament, gathering' },
                  { id: 'business', label: '🟢 Public Notice', dot: 'bg-emerald-500', desc: 'Civic, health, blood drive' },
                  { id: 'community', label: '💖 Estate Welfare', dot: 'bg-rose-500', desc: 'Neighborhood initiative' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id as UpdateType)}
                    className={`py-2.5 px-3 rounded-2xl border text-left transition flex flex-col gap-1 ${
                      type === item.id
                        ? 'bg-stone-800/90 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/50'
                        : 'bg-[#181B20] border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                    }`}
                  >
                    <span className="text-xs font-bold capitalize flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${item.dot}`} />
                      {item.label}
                    </span>
                    <span className="text-[10px] text-stone-400 line-clamp-1">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* If Alert is selected, show urgency selector */}
            {type === 'alert' && (
              <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-red-200 block">Alert Priority Level</span>
                    <span className="text-[10px] text-red-300/70">Critical alerts receive expedited priority review</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {[
                    { id: 'standard', label: 'Standard Notice' },
                    { id: 'high', label: 'High Priority' },
                    { id: 'critical', label: '⚠️ Urgent Emergency' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setUrgencyLevel(lvl.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                        urgencyLevel === lvl.id
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                Notice Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  type === 'alert'
                    ? 'e.g. URGENT: Missing Child / Lost 6-Yr-Old Boy near Jacaranda or Scheduled Water Interruption'
                    : 'e.g. Kahawa West Youth Football Tournament or Estate Clean-up Day'
                }
                className="w-full bg-[#181B20] border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* Date/Time and Location in 2 cols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-sky-400" />
                  <span>Time / When *</span>
                </label>
                <input
                  type="text"
                  value={timeInfo}
                  onChange={(e) => setTimeInfo(e.target.value)}
                  placeholder="e.g. Today • 2:30 PM or Saturday • 10:00 AM"
                  className="w-full bg-[#181B20] border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-400" />
                  <span>Location / Specific Spot *</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Congo Stage / Near TotalEnergies"
                  className="w-full bg-[#181B20] border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* Estate Zone & Police OB Reference (if emergency) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                  Estate Zone *
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

              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3 text-stone-400" />
                    <span>Police OB / Incident Ref (Optional)</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={obNumber}
                  onChange={(e) => setObNumber(e.target.value)}
                  placeholder="e.g. OB 45/14/09/2026 (Kahawa West Police Post)"
                  className="w-full bg-[#181B20] border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* Content / Announcement */}
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                Notice Full Details *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                placeholder={
                  type === 'alert'
                    ? 'Provide full physical description, clothing worn (for lost child/person), circumstances, last seen location, who to contact or immediate instructions...'
                    : 'Provide key information residents should know, schedule, requirements, or how to participate...'
                }
                className="w-full bg-[#181B20] border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* PHOTO ATTACHMENT SECTION */}
            <div className="p-4 bg-[#16191E] rounded-2xl border border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Attach Photo / Poster (Optional but recommended)</span>
                </label>

                <div className="flex items-center gap-1 bg-stone-900 p-0.5 rounded-lg border border-stone-800 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setImageMode('upload')}
                    className={`px-2 py-0.5 rounded font-bold transition ${
                      imageMode === 'upload' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('url')}
                    className={`px-2 py-0.5 rounded font-bold transition ${
                      imageMode === 'url' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Image URL
                  </button>
                </div>
              </div>

              {imageUrl ? (
                <div className="flex items-start gap-3 bg-[#1D2128] p-3 rounded-xl border border-stone-700/80">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-stone-900 border border-stone-700 shrink-0 group">
                    <img
                      src={imageUrl}
                      alt="Attachment Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute inset-0 bg-black/70 text-red-300 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[10px] font-bold transition"
                    >
                      <Trash2 className="w-4 h-4 mb-0.5" />
                      Remove
                    </button>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-stone-300 font-bold">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Photo attached successfully</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-stone-400 hover:text-red-400 text-xs"
                      >
                        Change
                      </button>
                    </div>
                    <input
                      type="text"
                      value={imageCaption}
                      onChange={(e) => setImageCaption(e.target.value)}
                      placeholder="Photo caption (e.g. Last seen wearing navy uniform or Photo taken at Congo Stage)"
                      className="w-full bg-[#14161A] border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              ) : imageMode === 'upload' ? (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="update-image-upload"
                  />
                  <label
                    htmlFor="update-image-upload"
                    className="cursor-pointer border-2 border-dashed border-stone-700 hover:border-emerald-500/70 rounded-xl p-4 flex flex-col items-center justify-center text-center transition bg-[#181B20] hover:bg-[#1C2026]"
                  >
                    <Upload className="w-5 h-5 text-emerald-400 mb-1.5" />
                    <span className="text-xs font-bold text-stone-200">
                      {isProcessingImage ? 'Loading photo...' : 'Click to select or drag photo here'}
                    </span>
                    <span className="text-[10px] text-stone-400 mt-0.5">
                      Ideal for child/person photo, poster, road hazard snapshot (PNG, JPG up to 5MB)
                    </span>
                  </label>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full bg-[#181B20] border border-stone-700 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}
            </div>

            {/* STRICT SUBMITTER ACCOUNTABILITY & CONTACT DETAILS */}
            <div className="p-4 bg-[#16191E] rounded-2xl border border-stone-800 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-stone-200 uppercase tracking-wider">
                  Submitter Identity & Verification (Required for Moderation)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-stone-400 mb-1">
                    Your Full Legal Name *
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Grace Wambui Kariuki"
                    className="w-full bg-[#181B20] border border-stone-700 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-400 mb-1">
                    WhatsApp / Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={authorPhone}
                    onChange={(e) => setAuthorPhone(e.target.value)}
                    placeholder="e.g. +254 712 345 678"
                    className="w-full bg-[#181B20] border border-stone-700 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-400 mb-1">
                    Your Role / Relationship *
                  </label>
                  <select
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value)}
                    className="w-full bg-[#181B20] border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {SUBMITTER_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Public emergency contact number */}
              <div className="pt-1">
                <label className="block text-[11px] font-bold text-stone-400 mb-1">
                  Public Contact Number to Display on Update (If different from personal phone)
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="e.g. 0722 000 000 (Family Emergency Line or Chairman)"
                  className="w-full bg-[#181B20] border border-stone-700 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Mandatory Accountability Checkbox */}
              <div className="pt-2 border-t border-stone-800">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAccountabilityConfirmed}
                    onChange={(e) => setIsAccountabilityConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-emerald-600 bg-stone-900 border-stone-700 focus:ring-emerald-500 shrink-0"
                  />
                  <span className="text-[11px] text-stone-300 leading-snug">
                    <strong className="text-white">Accountability & Truthfulness Guarantee:</strong> I confirm that this update is genuine, truthful, and non-commercial. I understand that submitting false alerts, commercial spam, or defamation will lead to an immediate blacklist and escalation to Kahawa West community authorities.
                  </span>
                </label>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center justify-between gap-3">
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

