import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Edit3,
  Calendar,
  MapPin,
  Camera,
  Info,
  Loader2,
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Minus,
  FileText,
} from 'lucide-react';
import { CommunityStory, EstateZone, StoryCategory } from '../../../types';
import { Button } from '../../ui/Button';
import { StoryMarkdownRenderer } from './StoryMarkdownRenderer';

interface SubmitStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStorySubmitted: (story: CommunityStory) => void;
}

const SPOTLIGHT_ZONES: EstateZone[] = [
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

const STORY_CATEGORIES: StoryCategory[] = [
  'Community Initiative',
  'Local Business & Artisan',
  'Youth & Sports',
  'Schools & Education',
  'Socio-Economic Development',
  'Environment & Clean-up',
  'Neighborhood Events',
];

export const SubmitStoryModal: React.FC<SubmitStoryModalProps> = ({
  isOpen,
  onClose,
  onStorySubmitted,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<StoryCategory>('Community Initiative');
  const [zone, setZone] = useState<EstateZone>('Jacaranda Estate');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [authorPhone, setAuthorPhone] = useState('');
  const [isRealPhotoConfirmed, setIsRealPhotoConfirmed] = useState(true);
  const [isNonPoliticalConfirmed, setIsNonPoliticalConfirmed] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  if (!isOpen) return null;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInsertFormat = (prefix: string, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((prev) => prev + `\n${prefix}${suffix}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousText = content;
    const selectedText = previousText.substring(start, end) || 'Sample text';

    const replacement = `${prefix}${selectedText}${suffix}`;
    const newContent =
      previousText.substring(0, start) + replacement + previousText.substring(end);

    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 50);
  };

  const handleLoadSampleTemplate = () => {
    if (!title) {
      setTitle('How Kahawa West Youth Built a Clean Neighborhood Corridor');
      setSubtitle('Over 50 volunteers cleaned up the railway corridor and planted 120 fruit trees.');
    }
    if (!authorName) setAuthorName('Kevin Mwangi');
    if (!authorRole) setAuthorRole('Youth Leader & Resident at Congo Stage');
    if (!authorEmail) setAuthorEmail('kevin.kwest@gmail.com');
    if (!authorPhone) setAuthorPhone('+254721001122');
    
    setContent(`# Transforming Our Estate Together

What started as a spontaneous Saturday morning clean-up with a dozen young residents around Congo Stage has evolved into one of Kahawa West's most impactful green corridors.

## The Grassroots Initiative
Local shopkeepers and compound caretakers noticed that unpaved feeder roads were accumulating packaging waste. Within four weeks, neighbors organized a weekly weekend patrol.

> "When we take collective pride in our immediate surrounding, the entire estate benefits." - Estate Elder

### Concrete Community Impact
1. Over 120 avocado and indigenous tree seedlings planted.
2. Two designated metal waste bins fabricated by local welders.
3. 24 high-school volunteers trained in urban horticulture and composting.

---

## How to Get Involved
Residents interested in joining our upcoming Saturday clean-ups can meet at the Bima Road junction every Saturday morning at 8:00 AM.`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !isNonPoliticalConfirmed || !authorName.trim() || !authorRole.trim() || !authorEmail.trim() || !authorPhone.trim()) {
      return;
    }

    setIsSubmitting(true);

    const newStory: CommunityStory = {
      id: `story-${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      category,
      zone,
      content: content.trim(),
      excerpt: content.slice(0, 160).replace(/[#*`_]/g, '') + '...',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
      imageCaption: imageCaption.trim() || `${title} in ${zone}`,
      isRealPhotoConfirmed: true,
      authorName: authorName.trim(),
      authorRole: authorRole.trim(),
      authorEmail: authorEmail.trim(),
      authorPhone: authorPhone.trim(),
      date: new Date().toISOString().split('T')[0],
      readTimeMinutes: Math.max(2, Math.ceil(content.split(/\s+/).length / 180)),
      featured: false,
      status: 'pending_review', // Reviewed before full publication
      likes: 1,
      submittedAt: new Date().toISOString(),
    };

    setTimeout(() => {
      onStorySubmitted(newStory);
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const handleResetAndClose = () => {
    setTitle('');
    setSubtitle('');
    setContent('');
    setImageUrl('');
    setImageCaption('');
    setAuthorName('');
    setAuthorRole('');
    setAuthorEmail('');
    setAuthorPhone('');
    setIsNonPoliticalConfirmed(false);
    setShowLivePreview(false);
    setSubmitted(false);
    onClose();
  };

  return (
    <div
      id="submit-story-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-sans animate-in fade-in duration-200"
    >
      <div
        className="bg-[#FAF8F5] w-full max-w-3xl rounded-3xl shadow-2xl border border-stone-300 overflow-hidden my-auto max-h-[92vh] flex flex-col text-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="bg-[#1D0C06] text-white px-5 sm:px-7 py-4 flex items-center justify-between border-b border-[#3D1A0E] flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-600/50">
                📰 Community Spotlight Submission
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-display text-white mt-1">
              Submit a Kahawa West Story
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {!submitted && (
              <button
                type="button"
                onClick={() => setShowLivePreview(!showLivePreview)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#34160C] hover:bg-[#4A2012] text-xs font-semibold text-emerald-300 transition"
              >
                {showLivePreview ? (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Form</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Live Preview</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleResetAndClose}
              className="p-2 rounded-xl bg-[#34160C] text-stone-300 hover:text-white transition active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7">
          {submitted ? (
            <div className="text-center py-10 px-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-bold font-display text-[#1D0C06] mb-2">
                Asante Sana for Sharing Your Story!
              </h4>
              <p className="text-stone-600 text-sm max-w-md mx-auto mb-6 leading-relaxed">
                Your story <strong>"{title}"</strong> has been received by the KWEST Community Editorial team. Every article is reviewed for safety and community guidelines before appearing on the public spotlight.
              </p>
              <div className="p-4 rounded-2xl bg-white border border-stone-200 max-w-md mx-auto text-left text-xs text-stone-700 space-y-1.5 mb-6">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Real Photo & Non-Political Verification In Progress</span>
                </div>
                <p className="text-stone-500 pl-6">
                  Approved stories will be showcased across the Kahawa West website and highlighted in the weekly spotlight.
                </p>
              </div>
              <Button variant="primary" onClick={handleResetAndClose} className="bg-emerald-700 hover:bg-emerald-600 text-white">
                Done & View Spotlight
              </Button>
            </div>
          ) : showLivePreview ? (
            /* Live Interactive Story Preview */
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
                <span className="font-bold flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-emerald-700" />
                  Story Preview Mode (How neighbors will see your story)
                </span>
                <button
                  onClick={() => setShowLivePreview(false)}
                  className="font-bold underline text-emerald-800 hover:text-emerald-950"
                >
                  Back to Editing
                </button>
              </div>

              <div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-900 text-emerald-200">
                  {category}
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1D0C06] mt-2 mb-1">
                  {title || 'Your Story Title Here'}
                </h2>
                {subtitle && <p className="text-stone-600 font-medium text-sm">{subtitle}</p>}
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-stone-600 py-2.5 border-y border-stone-200 bg-stone-100/70 px-3 rounded-xl">
                <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  📍 {zone}
                </span>
                <span>•</span>
                <span className="font-semibold text-stone-900">
                  ✍️ By {authorName || 'Author Name'} {authorRole ? `(${authorRole})` : ''}
                </span>
                <span>•</span>
                <span className="text-stone-500">📞 {authorPhone || 'Phone'} | ✉️ {authorEmail || 'Email'}</span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Authentic Photo
                </span>
              </div>

              {imageUrl ? (
                <div className="rounded-2xl overflow-hidden shadow-md bg-stone-900 max-h-[350px]">
                  <img src={imageUrl} alt="Story preview" className="w-full h-full object-cover max-h-[350px]" />
                </div>
              ) : (
                <div className="h-48 rounded-2xl bg-stone-200 flex flex-col items-center justify-center text-stone-500 text-xs border border-dashed border-stone-400">
                  <Camera className="w-6 h-6 mb-1 text-stone-400" />
                  <span>No photo selected yet (Real photo recommended)</span>
                </div>
              )}

              <div className="py-2 border-t border-stone-200">
                <StoryMarkdownRenderer
                  content={
                    content ||
                    '# Your Story Heading (H1)\n\nStart writing your article... Use **## Section (H2)** or **### Subtitle (H3)** to structure your narrative!'
                  }
                />
              </div>
            </div>
          ) : (
            /* Story Submission Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Guidelines Notice */}
              <div className="p-4 rounded-2xl bg-[#1D0C06] text-white border border-[#3D1A0E] space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <Info className="w-4 h-4" />
                  <span>Kahawa West Spotlight Guidelines</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-300">
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Socio-Economic Focus:</strong> Clean-ups, youth achievements, local sports, artisans & inspiring initiatives.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Strictly Non-Political:</strong> Partisan campaigns, political rallies or divisive commentary are not permitted.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-sky-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Authentic Photos Only:</strong> Real camera photos from the ground (No AI generated visuals).</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Editorial Review:</strong> Every article is reviewed by KWEST admins before publication.</span>
                  </div>
                </div>
              </div>

              {/* Story Title & Subtitle */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Story Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., How Mahiga Youth Cleaned Up the Railway Siding"
                    className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    One-Line Summary / Subtitle (Optional)
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g., Over 40 youth volunteered to plant 300 tree seedlings this weekend."
                    className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm bg-white"
                  />
                </div>
              </div>

              {/* Category & Zone Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as StoryCategory)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm bg-white"
                  >
                    {STORY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Estate Zone in Kahawa West *
                  </label>
                  <select
                    value={zone}
                    onChange={(e) => setZone(e.target.value as EstateZone)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm bg-white"
                  >
                    {SPOTLIGHT_ZONES.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Story Content & Formatting Toolbar */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Full Article / Story Content (Supports H1, H2, H3, Lists & Quotes) *
                  </label>

                  <button
                    type="button"
                    onClick={handleLoadSampleTemplate}
                    className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 bg-emerald-100/70 hover:bg-emerald-200/80 px-2.5 py-1 rounded-xl transition"
                    title="Insert a complete pre-formatted template with headings, quotes, and numbered impact lists"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Insert Sample Template</span>
                  </button>
                </div>

                {/* Markdown Formatting Toolbar */}
                <div className="flex flex-wrap items-center gap-1 p-1.5 bg-stone-200/90 rounded-t-2xl border-t border-x border-stone-300 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 px-1">
                    Format:
                  </span>

                  {/* Heading 1 */}
                  <button
                    type="button"
                    onClick={() => handleInsertFormat('# ')}
                    className="px-2 py-1 rounded-lg bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-stone-300 font-bold transition flex items-center gap-1"
                    title="Heading 1 (# Title)"
                  >
                    <Heading1 className="w-3.5 h-3.5" />
                    <span>H1</span>
                  </button>

                  {/* Heading 2 */}
                  <button
                    type="button"
                    onClick={() => handleInsertFormat('## ')}
                    className="px-2 py-1 rounded-lg bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-stone-300 font-bold transition flex items-center gap-1"
                    title="Heading 2 (## Section)"
                  >
                    <Heading2 className="w-3.5 h-3.5" />
                    <span>H2</span>
                  </button>

                  {/* Heading 3 */}
                  <button
                    type="button"
                    onClick={() => handleInsertFormat('### ')}
                    className="px-2 py-1 rounded-lg bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-stone-300 font-bold transition flex items-center gap-1"
                    title="Heading 3 (### Subtitle)"
                  >
                    <Heading3 className="w-3.5 h-3.5" />
                    <span>H3</span>
                  </button>

                  <div className="w-[1px] h-4 bg-stone-300 mx-0.5" />

                  {/* Bold */}
                  <button
                    type="button"
                    onClick={() => handleInsertFormat('**', '**')}
                    className="p-1.5 rounded-lg bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-stone-300 transition"
                    title="Bold (**text**)"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>

                  {/* Italic */}
                  <button
                    type="button"
                    onClick={() => handleInsertFormat('*', '*')}
                    className="p-1.5 rounded-lg bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-stone-300 transition"
                    title="Italic (*text*)"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>

                  <div className="w-[1px] h-4 bg-stone-300 mx-0.5" />

                  {/* Bullet List */}
                  <button
                    type="button"
                    onClick={() => handleInsertFormat('- ')}
                    className="p-1.5 rounded-lg bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-stone-300 transition"
                    title="Bullet List (- item)"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>

                  {/* Numbered List */}
                  <button
                    type="button"
                    onClick={() => handleInsertFormat('1. ')}
                    className="p-1.5 rounded-lg bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-stone-300 transition"
                    title="Numbered List (1. item)"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>

                  {/* Blockquote */}
                  <button
                    type="button"
                    onClick={() => handleInsertFormat('> ')}
                    className="p-1.5 rounded-lg bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-stone-300 transition"
                    title="Quote Block (> quote)"
                  >
                    <Quote className="w-3.5 h-3.5" />
                  </button>

                  {/* Divider */}
                  <button
                    type="button"
                    onClick={() => handleInsertFormat('\n---\n')}
                    className="p-1.5 rounded-lg bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-stone-300 transition"
                    title="Horizontal Line (---)"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <textarea
                  ref={textareaRef}
                  required
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share the full story: Use # for Main Title, ## for Section Titles, ### for Subheadings, - for bullet points, 1. for numbered milestones, and > for resident quotes..."
                  className="w-full px-4 py-3 rounded-b-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm bg-white leading-relaxed font-mono"
                />
              </div>

              {/* Real Photo Upload Section */}
              <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                    Real Photo (Required - No AI Images)
                  </label>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5" /> Authentic Photo Only
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* File Upload Box */}
                  <label className="border-2 border-dashed border-stone-300 hover:border-emerald-600 bg-white p-4 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition text-center group">
                    <Upload className="w-6 h-6 text-stone-400 group-hover:text-emerald-600 mb-1.5 transition" />
                    <span className="text-xs font-bold text-stone-700 group-hover:text-emerald-800">
                      Upload from Phone / Computer
                    </span>
                    <span className="text-[10px] text-stone-400 mt-0.5">JPG, PNG, WebP</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>

                  {/* Direct Image URL input */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-stone-600 mb-1 block">
                        Or enter direct photo URL:
                      </span>
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>

                    <input
                      type="text"
                      value={imageCaption}
                      onChange={(e) => setImageCaption(e.target.value)}
                      placeholder="Photo caption (e.g. Tree planting at Congo)"
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-[11px] bg-white mt-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {imageUrl && (
                  <div className="relative rounded-xl overflow-hidden h-36 bg-stone-900 border border-stone-300">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 p-1 rounded-lg bg-black/70 text-white hover:bg-black"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Mandatory Author Information & Role */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-300 shadow-2xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="text-emerald-700">👤</span>
                    <span>Author Identity & Contacts (Mandatory for Verification) *</span>
                  </label>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Required for editorial review
                  </span>
                </div>

                <p className="text-xs text-stone-600">
                  To protect community credibility and confirm story authenticity before publishing, full contact information and your role in Kahawa West are required.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Full Name / Group Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="e.g. Kevin Mwangi / Kahawa West Runners"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Who you are / What you do in Kahawa West *
                    </label>
                    <input
                      type="text"
                      required
                      value={authorRole}
                      onChange={(e) => setAuthorRole(e.target.value)}
                      placeholder="e.g. Youth Leader, Mahiga Primary Teacher, Local Grocer"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={authorEmail}
                      onChange={(e) => setAuthorEmail(e.target.value)}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Phone / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={authorPhone}
                      onChange={(e) => setAuthorPhone(e.target.value)}
                      placeholder="e.g. +254 712 345 678"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Checkboxes for Guidelines Compliance */}
              <div className="space-y-2 pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={isNonPoliticalConfirmed}
                    onChange={(e) => setIsNonPoliticalConfirmed(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-stone-300"
                  />
                  <span className="text-xs text-stone-700 leading-snug">
                    I confirm that this story is <strong>strictly non-political</strong> and focuses on genuine community, socio-economic, youth, sports, or local neighborhood achievements in Kahawa West.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isRealPhotoConfirmed}
                    onChange={(e) => setIsRealPhotoConfirmed(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-stone-300"
                  />
                  <span className="text-xs text-stone-700 leading-snug">
                    I confirm the image provided is an <strong>authentic real photo</strong> taken in our community (not AI generated).
                  </span>
                </label>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
                <Button type="button" variant="outline" onClick={handleResetAndClose} disabled={isSubmitting}>
                  Cancel
                </Button>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowLivePreview(true)}
                    disabled={!title.trim() || !content.trim()}
                    icon={<Eye className="w-4 h-4 text-emerald-700" />}
                  >
                    Preview Story
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    disabled={
                      !isNonPoliticalConfirmed ||
                      !title.trim() ||
                      !content.trim() ||
                      !authorName.trim() ||
                      !authorRole.trim() ||
                      !authorEmail.trim() ||
                      !authorPhone.trim()
                    }
                    className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold"
                    icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  >
                    Submit Story for Review
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
