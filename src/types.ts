export interface OpeningHours {
  monday: { open: string; close: string; isClosed?: boolean };
  tuesday: { open: string; close: string; isClosed?: boolean };
  wednesday: { open: string; close: string; isClosed?: boolean };
  thursday: { open: string; close: string; isClosed?: boolean };
  friday: { open: string; close: string; isClosed?: boolean };
  saturday: { open: string; close: string; isClosed?: boolean };
  sunday: { open: string; close: string; isClosed?: boolean };
}

export type EstateZone =
  | 'Congo'
  | 'Roundabout'
  | 'Jacaranda Estate'
  | 'Jubilee Estate'
  | 'Northern Bypass'
  | 'Kware / Quarry'
  | 'Bima Road'
  | 'Soweto'
  | 'Kamae'
  | 'Station / Railway'
  | 'Mahiga'
  | 'Kamiti Road'
  | 'Kiamumbi Border';

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  twitter?: string;
  website?: string;
  whatsapp?: string;
}

export interface MpesaDetails {
  type: 'Till' | 'Paybill' | 'Pochi la Biashara' | 'Send Money';
  number: string;
  accountName?: string;
  accountNumber?: string;
}

export interface ReviewItem {
  id: string;
  businessId: string;
  authorName: string;
  rating: number;
  date: string;
  comment: string;
  verifiedCustomer?: boolean;
  avatarUrl?: string;
}

export type OperationType =
  | 'physical_shop'
  | 'home_based'
  | 'mobile_service'
  | 'freelancer';

export interface Business {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  subCategory?: string;
  operationType?: OperationType;
  zone: EstateZone;
  landmark: string;
  addressDetails?: string;
  phone: string;
  whatsapp: string;
  email?: string;
  isVerified: boolean;
  isClaimed: boolean;
  claimedBy?: string;
  claimedAt?: string;
  rating: number;
  reviewCount: number;
  priceLevel: 'Budget' | 'Moderate' | 'Premium';
  heroImage: string; // Main image shown on cards
  galleryImages: string[]; // Up to 5 photos for gallery
  description: string;
  services: string[];
  features?: string[];
  mpesa?: MpesaDetails;
  socialLinks?: SocialLinks;
  openingHours: OpeningHours;
  specialOffer?: {
    title: string;
    description: string;
    validUntil?: string;
    badgeText?: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  isContactGated?: boolean;
  isContactUnlocked?: boolean;
  contactUnlockFee?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Matches the user's Supabase 'claims' table schema:
// business_id, full_name, phone_number, email, business_role, status, created_at
export interface BusinessClaim {
  id?: string;
  business_id: string;
  business_name?: string;
  full_name: string;
  phone_number: string;
  email: string;
  business_role:
    | 'Owner'
    | 'Manager'
    | 'Authorized Representative'
    | 'Partner'
    | 'Agent / On Behalf of Owner'
    | 'Agent / Listing on Behalf of Owner'
    | 'Listing on Behalf of Owner'
    | string;
  status: 'pending' | 'verified' | 'rejected';
  notes?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  count?: number;
}

export interface BusinessFeedbackResponse {
  respondedBy: string;
  responseDate: string;
  message: string;
}

export interface CommunityFeedback {
  id: string;
  businessId: string;
  businessName: string;
  authorName: string;
  serviceOrProduct?: string; // Service, product, or experience transacted e.g. "Laundry 10kg", "5-Seater Sofa Set", "Brake Pad Replacement"
  phoneOrEmail?: string;
  experience: 'Better' | 'Good' | 'Improve' | 'Bad' | 'Great' | 'Fair' | 'Poor';
  rating: number;
  tags?: string[];
  comment: string;
  businessResponse?: BusinessFeedbackResponse;
  created_at: string;
}

export type UpdateType = 'alert' | 'event' | 'business' | 'community' | 'notice';

export interface CommunityUpdate {
  id: string;
  title: string;
  type: UpdateType;
  timeInfo: string; // e.g. "Tomorrow • 9:00 AM - 4:00 PM", "Saturday • 10:00 AM", "This Friday", "Sunday • 8:00 AM"
  location: string; // e.g. "Kahawa West", "Kahawa West Grounds", "Kamiti Road", "PCEA Kahawa West"
  zone?: EstateZone | string;
  date: string;
  author: string;
  authorPhone?: string;
  authorEmail?: string;
  authorRole?: string; // e.g. "Parent / Guardian", "Estate Welfare / Elder", "Resident", "Eyewitness", "Public Official"
  obNumber?: string; // Police OB number / Reference if reporting lost child, missing person or security incident
  content: string;
  contact?: string;
  badge?: string;
  imageUrl?: string;
  imageCaption?: string;
  isAccountabilityConfirmed?: boolean;
  urgencyLevel?: 'standard' | 'high' | 'critical';
  status?: 'published' | 'pending_review' | 'rejected';
  rejectionReason?: string;
  submittedAt?: string;
}

export type StoryCategory =
  | 'Community Initiative'
  | 'Local Business & Artisan'
  | 'Youth & Sports'
  | 'Schools & Education'
  | 'Socio-Economic Development'
  | 'Environment & Clean-up'
  | 'Neighborhood Events';

export interface CommunityStory {
  id: string;
  slug?: string;
  title: string;
  subtitle?: string;
  category: StoryCategory;
  zone: EstateZone;
  content: string;
  excerpt: string;
  imageUrl?: string;
  imageCaption?: string;
  isRealPhotoConfirmed: boolean;
  authorName: string;
  authorEmail: string;
  authorPhone: string;
  authorRole: string; // What they do or who they are in Kahawa West (e.g., Youth Leader, Teacher, Resident)
  date: string;
  readTimeMinutes?: number;
  featured?: boolean;
  status: 'published' | 'pending_review' | 'archived' | 'rejected';
  likes?: number;
  dislikes?: number;
  commentsCount?: number;
  submittedAt?: string;
  rejectionReason?: string;
}

export interface StoryComment {
  id: string;
  storyId: string;
  authorName: string;
  authorRole?: string;
  content: string;
  createdAt: string;
  likes?: number;
}

export interface BusinessApplication {
  name: string;
  category: string;
  operationType?: OperationType;
  zone: EstateZone;
  landmark: string;
  phone: string;
  whatsapp: string;
  email?: string;
  description: string;
  services: string[];
  mpesaType?: string;
  mpesaNumber?: string;
  heroImage?: string;
  galleryImages?: string[];
  applicantName: string;
  applicantPhone: string;
  applicantRole: string;
  notes?: string;
  created_at: string;
}

export type AdCampaignStatus = 'in_review' | 'active' | 'changes_requested' | 'rejected' | 'completed' | 'expired';

export interface BusinessAdCampaign {
  id: string;
  businessId: string;
  businessName: string;
  format: string;
  headline: string;
  description: string;
  ctaText: string;
  badgeText: string;
  targetZone: string;
  imageUrl?: string;
  requestCustomDesign: boolean;
  packageDuration: '7_days' | '15_days' | '30_days';
  placementPriceKsh: number;
  creativeFeeKsh: number;
  totalPriceKsh: number;
  status: AdCampaignStatus;
  createdAt: string;
  approvedAt?: string;
  expiresAt?: string;
  editorNotes?: string;
  feedbackReason?: string;
}

// Backwards compatibility aliases
export type BusinessListing = any;
export type CommunityNotice = any;
export type CategoryId = string;
export type FilterState = any;
export type Review = any;
