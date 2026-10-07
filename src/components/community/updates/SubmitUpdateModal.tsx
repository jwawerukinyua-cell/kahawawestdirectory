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
  Search,
  Baby,
  Package,
  HelpCircle,
} from 'lucide-react';
import { CommunityUpdate, EstateZone, UpdateType, LostFoundDetails } from '../../../types';
import { Button } from '../../ui/Button';
import { compressImageFile, validateImageFile } from '../../../lib/imageCompression';
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

  // Dedicated Lost & Found / Missing Person Specific State
  const [lostCategory, setLostCategory] = useState<'lost_child' | 'missing_person' | 'lost_item' | 'found_item'>('lost_child');
  const [lostName, setLostName] = useState('');
  const [lostAge, setLostAge] = useState('');
  const [lastSeenLocation, setLastSeenLocation] = useState('');
  const [lastSeenTime, setLastSeenTime] = useState('');
  const [physicalDescription, setPhysicalDescription] = useState('');
  const [policeStation, setPoliceStation] = useState('Kahawa West Police Post');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [reward, setReward] = useState('');

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    setIsProcessingImage(true);
    setError(null);
    try {
      const dataUrl = await compressImageFile(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.78 });
      setImageUrl(dataUrl);
    } catch (err) {
      console.error('Failed to compress update image:', err);
      setError('Failed to process image. Please try another image.');
    } finally {
      setIsProcessingImage(false);
    }
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

    // If Lost & Found type is active, validate lost & found specific essentials
    if (type === 'lost_found') {
      if (!lostName.trim()) {
        setError(
          lostCategory === 'lost_child'
            ? 'Please enter the name of the missing child.'
            : lostCategory === 'missing_person'
            ? 'Please enter the name of the missing person.'
            : 'Please describe the lost or found item (e.g. National ID for Kelvin Ochieng or Brown Wallet).'
        );
        return;
      }
      if (!lastSeenLocation.trim() && !location.trim()) {
        setError('Please specify the location where the person/child was last seen, or where the item was lost/found.');
        return;
      }
    } else {
      if (!title.trim()) {
        setError('Please provide a clear update title (e.g., Scheduled Water Interruption or Sports Event).');
        return;
      }
    }

    const resolvedLocation = location.trim() || lastSeenLocation.trim() || 'Kahawa West';
    const resolvedTimeInfo = timeInfo.trim() || lastSeenTime.trim() || 'Today • Recent';

    // Auto-construct title for lost & found if left blank
    let resolvedTitle = title.trim();
    if (!resolvedTitle && type === 'lost_found') {
      const prefix =
        lostCategory === 'lost_child'
          ? '🚨 MISSING CHILD'
          : lostCategory === 'missing_person'
          ? '🚨 MISSING PERSON'
          : lostCategory === 'found_item'
          ? '📦 FOUND ITEM'
          : '🔍 LOST ITEM';
      resolvedTitle = `${prefix}: ${lostName.trim()} (${resolvedLocation})`;
    }

    // Auto-construct content for lost & found if left blank
    let resolvedContent = content.trim();
    if (!resolvedContent && type === 'lost_found') {
      const categoryHeading =
        lostCategory === 'lost_child'
          ? '🚨 URGENT MISSING CHILD NOTICE'
          : lostCategory === 'missing_person'
          ? '🚨 URGENT MISSING PERSON NOTICE'
          : lostCategory === 'found_item'
          ? '📦 FOUND ITEM NOTICE'
          : '🔍 LOST PROPERTY REPORT';

      resolvedContent = `${categoryHeading}
Subject / Name: ${lostName.trim()}
${lostAge.trim() ? `Age / Details: ${lostAge.trim()}\n` : ''}Last Seen / Found: ${resolvedLocation} (${resolvedTimeInfo})
${physicalDescription.trim() ? `Description & Identifying Features: ${physicalDescription.trim()}\n` : ''}${obNumber.trim() ? `Police Occurrence Book (OB): ${obNumber.trim()} [${policeStation.trim() || 'Kahawa West Police Post'}]\n` : ''}Contact Person: ${contactPerson.trim() || authorName.trim()}
Emergency Phone: ${contactPhone.trim() || authorPhone.trim()}${altPhone.trim() ? ` / ${altPhone.trim()}` : ''}
${reward.trim() ? `Token / Reward Notice: ${reward.trim()}\n` : ''}Please share widely with neighbors across Kahawa West.`;
    }

    if (!resolvedContent || resolvedContent.length < 15) {
      setError('Please provide detailed information for this notice (at least 15 characters).');
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

    const lostFoundDetails: LostFoundDetails | undefined =
      type === 'lost_found'
        ? {
            category: lostCategory,
            name: lostName.trim() || resolvedTitle,
            age: lostAge.trim() || undefined,
            lastSeenLocation: resolvedLocation,
            lastSeenTime: resolvedTimeInfo,
            physicalDescription: physicalDescription.trim() || undefined,
            policeObNumber: obNumber.trim() || undefined,
            policeStation: policeStation.trim() || undefined,
            contactPerson: contactPerson.trim() || authorName.trim(),
            contactPhone: contactPhone.trim() || authorPhone.trim(),
            altPhone: altPhone.trim() || undefined,
            reward: reward.trim() || undefined,
          }
        : undefined;

    const computedUrgency =
      type === 'lost_found'
        ? lostCategory === 'lost_child' || lostCategory === 'missing_person'
          ? 'critical'
          : 'high'
        : type === 'alert'
        ? urgencyLevel
        : 'standard';

    const newUpdate: CommunityUpdate = {
      id: `up-${Date.now()}`,
      title: resolvedTitle,
      type,
      timeInfo: resolvedTimeInfo,
      location: resolvedLocation,
      zone,
      content: resolvedContent,
      author: authorName.trim(),
      authorPhone: authorPhone.trim(),
      authorEmail: authorEmail.trim() || undefined,
      authorRole,
      obNumber: obNumber.trim() || undefined,
      lostFoundDetails,
      imageUrl: imageUrl.trim() || undefined,
      imageCaption: imageCaption.trim() || undefined,
      isAccountabilityConfirmed: true,
      urgencyLevel: computedUrgency,
      contact: (contact.trim() || contactPhone.trim() || authorPhone.trim()),
      date: resolvedTimeInfo.split('•')[0].trim() || 'Today',
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
    setLostCategory('lost_child');
    setLostName('');
    setLostAge('');
    setLastSeenLocation('');
    setLastSeenTime('');
    setPhysicalDescription('');
    setPoliceStation('Kahawa West Police Post');
    setContactPerson('');
    setContactPhone('');
    setAltPhone('');
    setReward('');
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
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'lost_found', label: '🔍 Lost & Found', dot: 'bg-amber-400', desc: 'Missing child, person, item' },
                  { id: 'alert', label: '🚨 Emergency', dot: 'bg-red-500', desc: 'Utility cut, hazard, safety' },
                  { id: 'event', label: '🔵 Event', dot: 'bg-blue-500', desc: 'Tournament, civic gathering' },
                  { id: 'business', label: '🟢 Public Notice', dot: 'bg-emerald-500', desc: 'Voter reg, blood drive' },
                  { id: 'community', label: '💖 Welfare', dot: 'bg-rose-500', desc: 'Estate initiative' },
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

            {/* DEDICATED FEATURE FOR LOST CHILDREN / PERSONS / ITEMS */}
            {type === 'lost_found' && (
              <div className="p-4 sm:p-5 bg-gradient-to-b from-amber-950/40 via-[#181C22] to-[#14171D] rounded-2xl border border-amber-500/50 space-y-4 shadow-xl shadow-amber-950/20">
                <div className="flex items-center justify-between pb-3 border-b border-amber-800/40">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/40">
                      <Search className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                        <span>Lost Child / Missing Person / Property Report</span>
                      </h4>
                      <p className="text-[11px] text-amber-300/80">
                        Kahawa West Rapid Trace &amp; Re-unification Notice Desk
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-sm">
                    Priority Alert
                  </span>
                </div>

                {/* Subcategory selector */}
                <div>
                  <label className="block text-[11px] font-bold text-amber-200 uppercase tracking-wider mb-1.5">
                    Report Type *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'lost_child', label: '👶 Lost Child', desc: 'Minor / Pupil / Toddler' },
                      { id: 'missing_person', label: '👤 Missing Person', desc: 'Adult / Teen / Elder' },
                      { id: 'lost_item', label: '🎒 Lost Item / Pet', desc: 'ID, Wallet, Phone, Keys' },
                      { id: 'found_item', label: '📦 Found Item', desc: 'Item picked up in area' },
                    ].map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setLostCategory(sub.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-0.5 ${
                          lostCategory === sub.id
                            ? 'bg-amber-600/30 border-amber-400 text-white ring-1 ring-amber-400/60 shadow-sm'
                            : 'bg-[#15181E] border-stone-800 text-stone-300 hover:border-stone-700'
                        }`}
                      >
                        <span className="text-xs font-bold">{sub.label}</span>
                        <span className="text-[10px] text-stone-400">{sub.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject Name / Item Description & Age */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className={lostCategory === 'lost_child' || lostCategory === 'missing_person' ? 'sm:col-span-2' : 'sm:col-span-3'}>
                    <label className="block text-[11px] font-bold text-stone-200 uppercase tracking-wider mb-1">
                      {lostCategory === 'lost_child'
                        ? 'Full Name & Nickname of Lost Child *'
                        : lostCategory === 'missing_person'
                        ? 'Full Name of Missing Person *'
                        : lostCategory === 'found_item'
                        ? 'Description of Found Item *'
                        : 'Name / Description of Lost Item *'}
                    </label>
                    <input
                      type="text"
                      value={lostName}
                      onChange={(e) => setLostName(e.target.value)}
                      placeholder={
                        lostCategory === 'lost_child'
                          ? 'e.g. Brian Mwangi (6-year-old pupil, responds to "Junior")'
                          : lostCategory === 'missing_person'
                          ? 'e.g. Mzee Peter Karanja (74-year-old elder with mild memory loss)'
                          : lostCategory === 'found_item'
                          ? 'e.g. Black leather wallet with National ID for Kelvin Ochieng & Equity ATM card'
                          : 'e.g. Kenyan National ID Card & Driver\'s License for Kelvin Ochieng'
                      }
                      className="w-full bg-[#14171D] border border-amber-700/60 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-stone-500 focus:outline-none"
                    />
                  </div>

                  {(lostCategory === 'lost_child' || lostCategory === 'missing_person') && (
                    <div>
                      <label className="block text-[11px] font-bold text-stone-200 uppercase tracking-wider mb-1">
                        Age / School / Class
                      </label>
                      <input
                        type="text"
                        value={lostAge}
                        onChange={(e) => setLostAge(e.target.value)}
                        placeholder="e.g. 6 years old, PP2 / Class 1"
                        className="w-full bg-[#14171D] border border-stone-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-stone-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Last seen location & time in 2 cols */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-200 uppercase tracking-wider mb-1">
                      {lostCategory === 'found_item' ? 'Where was it found? (Landmark) *' : 'Last Seen Location / Landmark *'}
                    </label>
                    <input
                      type="text"
                      value={lastSeenLocation}
                      onChange={(e) => {
                        setLastSeenLocation(e.target.value);
                        if (!location) setLocation(e.target.value);
                      }}
                      placeholder="e.g. Near Stage 44 / Jacaranda Primary Gate or Congo Stage"
                      className="w-full bg-[#14171D] border border-stone-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-stone-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-200 uppercase tracking-wider mb-1">
                      {lostCategory === 'found_item' ? 'Date & Time Picked Up' : 'Date & Time Last Seen'}
                    </label>
                    <input
                      type="text"
                      value={lastSeenTime}
                      onChange={(e) => {
                        setLastSeenTime(e.target.value);
                        if (!timeInfo) setTimeInfo(e.target.value);
                      }}
                      placeholder="e.g. Today Monday around 3:45 PM after school"
                      className="w-full bg-[#14171D] border border-stone-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-stone-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Physical Description & Clothing Worn */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-200 uppercase tracking-wider mb-1">
                    {lostCategory === 'lost_child' || lostCategory === 'missing_person'
                      ? 'Clothing Worn, Physical Description & Distinguishing Marks *'
                      : 'Distinguishing Identifiers / Serial Numbers / Markings'}
                  </label>
                  <textarea
                    rows={2}
                    value={physicalDescription}
                    onChange={(e) => setPhysicalDescription(e.target.value)}
                    placeholder={
                      lostCategory === 'lost_child' || lostCategory === 'missing_person'
                        ? 'e.g. Wearing navy blue school sweater, khaki shorts, black Bata shoes, red backpack with dinosaur print, birthmark under right eye...'
                        : 'e.g. Brown bi-fold wallet, national ID ending with 987, black Samsung Galaxy A14 with cracked camera glass...'
                    }
                    className="w-full bg-[#14171D] border border-stone-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-stone-500 focus:outline-none leading-relaxed"
                  />
                </div>

                {/* POLICE OCCURRENCE BOOK (OB) DETAILS */}
                <div className="p-3.5 bg-stone-900/90 rounded-xl border border-stone-800 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Official Police Occurrence Book (OB) Reference (Highly Recommended)</span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Entering a police OB reference helps estate elders, nyumba kumi leaders, and moderators quickly confirm authenticity with local authorities.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                        Police Station / Post Reported At
                      </label>
                      <input
                        type="text"
                        value={policeStation}
                        onChange={(e) => setPoliceStation(e.target.value)}
                        placeholder="e.g. Kahawa West Police Post (or Kasarani Police Station)"
                        className="w-full bg-[#181B20] border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                        Police OB Number / Incident Reference
                      </label>
                      <input
                        type="text"
                        value={obNumber}
                        onChange={(e) => setObNumber(e.target.value)}
                        placeholder="e.g. OB 28/05/10/2026"
                        className="w-full bg-[#181B20] border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact & Optional Reward */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-300 uppercase tracking-wider mb-1">
                      Family / Contact Person *
                    </label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="e.g. Esther Wanjiku (Mother)"
                      className="w-full bg-[#14171D] border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-300 uppercase tracking-wider mb-1">
                      Emergency Direct Phone *
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => {
                        setContactPhone(e.target.value);
                        if (!authorPhone) setAuthorPhone(e.target.value);
                      }}
                      placeholder="e.g. 0712 345 678"
                      className="w-full bg-[#14171D] border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-300 uppercase tracking-wider mb-1">
                      Alt Phone / Relative
                    </label>
                    <input
                      type="tel"
                      value={altPhone}
                      onChange={(e) => setAltPhone(e.target.value)}
                      placeholder="e.g. 0733 987 654 (Father / Uncle)"
                      className="w-full bg-[#14171D] border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-300 uppercase tracking-wider mb-1">
                    Reward / Token of Appreciation (Optional)
                  </label>
                  <input
                    type="text"
                    value={reward}
                    onChange={(e) => setReward(e.target.value)}
                    placeholder="e.g. Ksh 10,000 cash token offered for positive recovery lead"
                    className="w-full bg-[#14171D] border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}

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
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>
                  {type === 'lost_found'
                    ? 'Notice Title (Optional — auto-generated from report details above)'
                    : 'Notice Title *'}
                </span>
                {type === 'lost_found' && (
                  <span className="text-[10px] text-amber-400 font-normal">Auto-filled if left blank</span>
                )}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  type === 'lost_found'
                    ? 'e.g. URGENT TRACE: 6-Yr-Old Boy (Brian) Last Seen Near Stage 44'
                    : type === 'alert'
                    ? 'e.g. Scheduled Water Interruption or Emergency Road Closure'
                    : 'e.g. Kahawa West Youth Football Tournament or Estate Clean-up Day'
                }
                className="w-full bg-[#181B20] border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* Date/Time and Location in 2 cols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-sky-400" />
                  <span>
                    {type === 'lost_found' ? 'Date & Time Notice (Optional)' : 'Time / When *'}
                  </span>
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
                  <span>
                    {type === 'lost_found' ? 'General Area / Landmark' : 'Location / Specific Spot *'}
                  </span>
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
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>
                  {type === 'lost_found'
                    ? 'Additional Notes / Message (Optional override — auto-assembled from above)'
                    : 'Notice Full Details *'}
                </span>
                {type === 'lost_found' && (
                  <span className="text-[10px] text-amber-400 font-normal">Auto-formatted if left blank</span>
                )}
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                placeholder={
                  type === 'lost_found'
                    ? 'Optional extra instructions, additional contact names, or specific warnings to neighbors...'
                    : type === 'alert'
                    ? 'Provide full physical description, circumstances, last seen location, who to contact or immediate instructions...'
                    : 'Provide key information residents should know, schedule, requirements, or how to participate...'
                }
                className="w-full bg-[#181B20] border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition leading-relaxed min-h-[100px]"
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

