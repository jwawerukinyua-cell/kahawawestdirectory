import { CommunityStory } from '../types';

export const INITIAL_COMMUNITY_STORIES: CommunityStory[] = [
  {
    id: 'story-01',
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
    featured: true,
    status: 'published',
    likes: 42,
  },
  {
    id: 'story-02',
    title: 'Kahawa West Inter-Estate Football League Unites Hundreds of Youths Every Weekend',
    subtitle: 'Sixteen local teams battle for the community trophy while fostering discipline and talent scouting.',
    category: 'Youth & Sports',
    zone: 'Mahiga',
    excerpt: 'Every Saturday afternoon, residents gather at the Mahiga grounds to cheer on local youth squads, bringing families and local food vendors together in high spirits.',
    content: `Sports have long been the beating heart of weekend social life in Kahawa West. The newly inaugurated Inter-Estate Football Tournament has taken that community spirit to a whole new level.

Featuring 16 teams representing Jacaranda, Congo, Bima, Soweto, Mahiga, and Roundabout, the tournament is organized independently by estate captains with match logistics and jerseys sponsored by local pharmacies, barbershops, and transport operators.

Beyond football, the league offers mentorship sessions on financial literacy, drug abuse awareness, and vocational trade enrollment for players aged 16 to 25.

"When our young people are on the pitch or cheering from the touchline, our estate stands as one family," notes Coach Baba Brian. "Merchants selling sugarcane, boiled maize, and water also report their highest weekend sales during match days."`,
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Mahiga grounds during an intense weekend inter-estate league derby.',
    isRealPhotoConfirmed: true,
    authorName: 'Coach Baba Brian',
    authorEmail: 'sports.kwest@gmail.com',
    authorPhone: '+254712998877',
    authorRole: 'Head Youth Coach & Mahiga Sports Mentor',
    date: '2026-08-18',
    readTimeMinutes: 4,
    featured: false,
    status: 'published',
    likes: 29,
  },
  {
    id: 'story-03',
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
    return parsed.length > 0 ? parsed : INITIAL_COMMUNITY_STORIES;
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
