import { CommunityStory } from '../types';

export const INITIAL_COMMUNITY_STORIES: CommunityStory[] = [
  {
    id: 'story-01',
    slug: 'congo-stage-youth-urban-nursery',
    title: 'How Congo Stage Youth Turned an Abandoned Plot into a Thriving Urban Nursery',
    subtitle: 'Over 4,500 tree seedlings distributed across Bima Road and Jacaranda Estate in six months.',
    category: 'Environment & Clean-up',
    zone: 'Congo',
    excerpt: 'A grassroots team of twelve young residents collaborated with neighborhood shopkeepers to green local avenues, reduce roadside dust, and train high schoolers in horticulture.',
    content: `What started as an informal Saturday morning clean-up by a dozen youth around Congo Stage has evolved into one of Kahawa West's most impactful green corridors.

In early 2026, the group approached local estate elders and business operators with a practical proposal: instead of letting the open ground near the bypass accumulate packaging waste, they would cultivate indigenous acacia, eucalyptus, and fruit seedlings suited to Nairobi's soil.

"We noticed that during the dry season, dust from unpaved feeder roads was affecting both shopkeepers and pedestrians," explains Kevin Mwangi, 24, one of the founding members. "By planting ground cover and distributing fruit tree saplings to compound owners in Jacaranda and Soweto, we created a tangible environmental shield."

### Concrete Community Impact
1. **4,500+ Seedlings Distributed:** Free saplings provided to over 60 compound landlords and 4 local primary schools.
2. **Weekly Dust Reduction Patrols:** Water harvesting from roadside runoff diverted to maintain urban flower beds along Congo and Bima Road.
3. **Youth Skills Workshop:** 18 high school students on school break trained in grafting, composting organic vegetable waste from nearby grocery stalls, and basic bookkeeping.

Local business owners have enthusiastically backed the initiative, with hardware stores providing wheelbarrows and watering cans. The group plans to expand their tree-canopy drive toward Mahiga and the Railway siding in coming months.`,
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Youth volunteers preparing organic compost and indigenous tree saplings near Congo Stage.',
    isRealPhotoConfirmed: true,
    authorName: 'Kevin Mwangi & Congo Greening Team',
    authorEmail: 'congo.green@kwest.org',
    authorPhone: '+254721334455',
    authorRole: 'Youth Environmental Leader & Resident',
    date: '2026-08-22',
    readTimeMinutes: 3,
    featured: false,
    status: 'published',
    likes: 42,
  },
  {
    id: 'story-02',
    slug: 'kahawa-pride-fc',
    title: "Kahawa Pride FC: From a Grassroots Soccer Academy to Kahawa West's Football Pride",
    subtitle: "How dedicated local coaches, community elders and neighborhood shopkeepers turned a dusty pitch into a beacon of youth football talent and academic mentorship.",
    category: 'Youth & Sports',
    zone: 'Mahiga',
    excerpt: 'Every weekend, hundreds of families gather at the Mahiga grounds to cheer on Kahawa Pride FC, fostering youth discipline, athletic excellence, and academic support across the sub-county.',
    content: `Sports have long been the beating heart of weekend social life in Kahawa West. Among the estate teams lighting up our neighborhood, **Kahawa Pride FC** stands out as a shining example of grassroots passion transforming lives.

Founded on the dusty grounds near Mahiga and Bima Road, the academy started with just 14 young boys and two second-hand leather balls. Today, Kahawa Pride FC has grown into a structured youth talent hub featuring Under-13, Under-17, and Senior squads competing across the Nairobi County League.

### Building Discipline On and Off the Pitch
Coach Baba Brian and the technical bench recognized early on that football is a catalyst for life skills and community unity:

1. **Mandatory Academic Study Hall:** Before Saturday training sessions, senior players and volunteer university students run a 90-minute homework clinic and mentorship circle for primary and secondary schoolers.
2. **Community Kit & Equipment Support:** Local pharmacies, hardware stores, and barber shops across Kahawa West have generously sponsored match jerseys, shin guards, and first aid kits.
3. **Talent Pathway & High School Scholarships:** Over the past two years, six academy graduates have secured academic and sports bursaries in prestigious national secondary schools.

### Estate Unity on Match Days
"When Kahawa Pride FC steps onto the pitch, our entire community stands united," says Coach Baba Brian. "Mothers selling boiled maize and water, elders sharing stories on the sidelines, and youth channeling their energy into positive sportsmanship."

The club is currently preparing for the upcoming Nairobi North Inter-Subcounty Championship, carrying the hopes and pride of all Kahawa West residents.`,
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Kahawa Pride FC squad during intensive weekend tactical training at Mahiga Grounds.',
    isRealPhotoConfirmed: true,
    authorName: 'Coach Baba Brian & Technical Bench',
    authorEmail: 'kahawapridefc@kwest.org',
    authorPhone: '+254712998877',
    authorRole: 'Head Youth Coach & Sports Mentor',
    date: '2026-08-28',
    readTimeMinutes: 4,
    featured: true,
    status: 'published',
    likes: 58,
  },
  {
    id: 'story-03',
    slug: 'jacaranda-women-artisans',
    title: 'Jacaranda Estate Women Artisans Expand Woven Baskets to Regional Markets',
    subtitle: 'A self-help group of 28 mothers turns sisal and recycled materials into sustainable livelihoods.',
    category: 'Local Business & Artisan',
    zone: 'Jacaranda Estate',
    excerpt: 'Combining traditional weaving heritage with contemporary designs, the Jacaranda Weavers Collective is putting Kahawa West craftmanship on the regional trade map.',
    content: `Tucked inside Jacaranda Court 3, a circle of vibrant women meet every Wednesday to weave high-grade sisal shopping bags (kiondo), decorative storage baskets, and table runners.

What began as a small table-banking group has now grown into a registered cooperative that supplies eco-friendly shopping bags to bakeries and boutique stores across Nairobi.

"We wanted to provide durable alternatives to single-use plastics while earning a respectable household income," says Mama Faith, the group chairlady. "Through the KWEST directory, neighboring residents have hired us for custom wedding gifts and bulk corporate orders."`,
    imageUrl: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Handcrafted sisal products woven by the Jacaranda Weavers Collective.',
    isRealPhotoConfirmed: true,
    authorName: 'Mama Faith',
    authorEmail: 'jacaranda.weavers@gmail.com',
    authorPhone: '+254733445566',
    authorRole: 'Chairlady, Jacaranda Weavers Self-Help Group',
    date: '2026-08-15',
    readTimeMinutes: 3,
    featured: false,
    status: 'published',
    likes: 35,
  },
];

const LOCAL_STORAGE_STORIES_KEY = 'kwest_community_stories_v1';

export function getStoredCommunityStories(): CommunityStory[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_STORIES_KEY);
    if (!raw) return INITIAL_COMMUNITY_STORIES;
    const parsed = JSON.parse(raw) as CommunityStory[];
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_COMMUNITY_STORIES;

    // Merge updated initial stories (like Kahawa Pride FC) with any locally added stories
    const initialMap = new Map(INITIAL_COMMUNITY_STORIES.map((s) => [s.id, s]));
    const result: CommunityStory[] = [];
    const seenIds = new Set<string>();

    // First add parsed stories with updated initial fields if they are seed stories
    for (const p of parsed) {
      if (initialMap.has(p.id)) {
        const seed = initialMap.get(p.id)!;
        result.push({
          ...seed,
          ...p,
          title: seed.title, // Keep canonical updated title for seed stories
          subtitle: seed.subtitle,
          slug: seed.slug || p.slug,
          category: seed.category,
          content: seed.content,
          featured: seed.featured,
          status: 'published',
          imageUrl: seed.imageUrl || p.imageUrl,
          likes: Math.max(seed.likes || 0, p.likes || 0),
        });
      } else {
        result.push(p);
      }
      seenIds.add(p.id);
    }

    // Ensure all seed stories exist
    for (const init of INITIAL_COMMUNITY_STORIES) {
      if (!seenIds.has(init.id)) {
        result.push(init);
      }
    }

    return result;
  } catch (err) {
    console.warn('Error reading stored community stories:', err);
    return INITIAL_COMMUNITY_STORIES;
  }
}

export function saveCommunityStory(story: CommunityStory): void {
  try {
    const current = getStoredCommunityStories();
    const filtered = current.filter((s) => s.id !== story.id);
    const updated = [story, ...filtered];
    localStorage.setItem(LOCAL_STORAGE_STORIES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Error saving community story:', err);
  }
}

export function updateStoryModerationStatus(
  storyId: string,
  status: 'published' | 'pending_review' | 'archived' | 'rejected',
  featured?: boolean,
  rejectionReason?: string
): CommunityStory[] {
  try {
    const current = getStoredCommunityStories();
    const updated = current.map((s) => {
      if (s.id === storyId) {
        return {
          ...s,
          status,
          featured: featured !== undefined ? featured : s.featured,
          rejectionReason: rejectionReason !== undefined ? rejectionReason : s.rejectionReason,
        };
      }
      // If setting featured, un-feature other stories if needed
      if (featured && s.id !== storyId) {
        return { ...s, featured: false };
      }
      return s;
    });
    localStorage.setItem(LOCAL_STORAGE_STORIES_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Error updating story moderation:', err);
    return getStoredCommunityStories();
  }
}

export const updateStoryModeration = updateStoryModerationStatus;

export function deleteCommunityStory(storyId: string): CommunityStory[] {
  try {
    const current = getStoredCommunityStories();
    const updated = current.filter((s) => s.id !== storyId);
    localStorage.setItem(LOCAL_STORAGE_STORIES_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Error deleting community story:', err);
    return getStoredCommunityStories();
  }
}
