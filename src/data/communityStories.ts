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
    id: 'story-1788342289836',
    slug: 'kahawa-pride-fc',
    title: 'From a grassroots soccer academy to a club with big ambitions, Kahawa Pride FC is putting Kahawa West on the national map',
    subtitle: 'If you have ever been around Kahawa Station Road or Mahiga Primary School on matchday, you have probably seen the colours, heard the cheers and felt the energy.',
    category: 'Youth & Sports',
    zone: 'Kamiti Road',
    excerpt: 'If you have ever been around Kahawa Station Road or Mahiga Primary School on matchday, you have probably seen the colours, heard the cheers and felt the energy. What started as a simple desire to keep estate youth engaged has evolved into a structured academy.',
    content: `If you have ever been around Kahawa Station Road or Mahiga Primary School on matchday, you have probably seen the colours, heard the cheers and felt the energy. What started as a grassroots soccer academy has grown into a club with big ambitions, putting Kahawa West on the national football map.

Coach Baba Brian and the dedicated technical bench have turned our local dirt grounds into a structured arena for athletic excellence, discipline, and community pride.

### Building Discipline On and Off the Pitch
Kahawa Pride FC is more than just ninety minutes of football on the weekend:

1. **Mandatory Academic Study Hall:** Before weekend training sessions, players attend a 90-minute homework clinic and mentorship circle led by volunteer university scholars.
2. **Community Kit & Equipment Sponsorship:** Local pharmacies, hardware stores, and neighborhood businesses across Kamiti Road, Mahiga, and Station Road have sponsored match jerseys, boots, and first aid kits.
3. **High School & College Bursaries:** Over the past two seasons, several talented academy graduates have earned academic and sports scholarships at top national secondary institutions.

### Estate Unity on Match Days
"When Kahawa Pride FC steps onto the pitch, our entire community stands united," says Coach Baba Brian. "Mothers cheering on the touchlines, local shopkeepers closing briefly to catch the second half, and our youth channeling their energy into positive sportsmanship."

The club represents the relentless grit, community solidarity, and rising talent of Kahawa West.`,
    imageUrl: '/kahawa-pride-real.jpg',
    imageCaption: 'Kahawa Pride FC coaching staff and youth squad celebrating at Mahiga grounds along Kamiti Road (Photo by Mfalme Ukweli).',
    isRealPhotoConfirmed: true,
    authorName: 'Mfalme Ukweli',
    authorEmail: 'ukweliproducts@gmail.com',
    authorPhone: '+254712998877',
    authorRole: 'Founder & Community Chronicler',
    date: '2026-08-28',
    readTimeMinutes: 4,
    featured: true,
    status: 'published',
    likes: 58,
    dislikes: 0,
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
const DELETED_STORIES_STORAGE_KEY = 'kwest_deleted_story_ids_v1';

export function getDeletedStoryIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_STORIES_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function markStoryAsDeleted(storyId: string): void {
  try {
    const deletedSet = getDeletedStoryIds();
    deletedSet.add(storyId);
    // If deleting the old generic story ID, mark it permanently
    if (storyId === 'story-02') {
      deletedSet.add('story-02');
    }
    localStorage.setItem(DELETED_STORIES_STORAGE_KEY, JSON.stringify(Array.from(deletedSet)));
  } catch (err) {
    console.warn('Error marking story as deleted:', err);
  }
}

export function getStoredCommunityStories(): CommunityStory[] {
  try {
    const deletedIds = getDeletedStoryIds();
    const raw = localStorage.getItem(LOCAL_STORAGE_STORIES_KEY);
    
    // If no local storage exists yet, filter INITIAL_COMMUNITY_STORIES against any deletedIds
    if (!raw) {
      return INITIAL_COMMUNITY_STORIES.filter((s) => !deletedIds.has(s.id) && s.id !== 'story-02');
    }

    const parsed = JSON.parse(raw) as CommunityStory[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return INITIAL_COMMUNITY_STORIES.filter((s) => !deletedIds.has(s.id) && s.id !== 'story-02');
    }

    // Merge updated initial stories (like Kahawa Pride FC) with any locally added stories
    const initialMap = new Map(INITIAL_COMMUNITY_STORIES.map((s) => [s.id, s]));
    const result: CommunityStory[] = [];
    const seenIds = new Set<string>();

    // First process parsed stories (skipping any deleted or old generic story-02)
    for (const p of parsed) {
      // If deleted by user, skip completely
      if (deletedIds.has(p.id)) continue;
      
      // If it's the old generic story-02, upgrade it to story-1788342289836 or drop if already present
      if (p.id === 'story-02') {
        if (deletedIds.has('story-02')) continue;
        // Upgrade to the authentic story-1788342289836
        const realSeed = initialMap.get('story-1788342289836')!;
        result.push(realSeed);
        seenIds.add('story-1788342289836');
        seenIds.add('story-02');
        continue;
      }

      if (initialMap.has(p.id)) {
        const seed = initialMap.get(p.id)!;
        result.push({
          ...p,
          ...seed,
          title: seed.title,
          subtitle: seed.subtitle,
          slug: seed.slug || p.slug,
          category: seed.category,
          content: seed.content,
          featured: seed.featured,
          authorName: seed.authorName,
          authorEmail: seed.authorEmail,
          authorRole: seed.authorRole,
          imageUrl: seed.imageUrl || p.imageUrl,
          imageCaption: seed.imageCaption || p.imageCaption,
          isRealPhotoConfirmed: seed.isRealPhotoConfirmed,
          status: 'published',
          likes: Math.max(seed.likes || 0, p.likes || 0),
          dislikes: Math.max(seed.dislikes || 0, p.dislikes || 0),
        });
      } else {
        result.push(p);
      }
      seenIds.add(p.id);
    }

    // Ensure all seed stories exist UNLESS they were deleted by the user or are obsolete
    for (const init of INITIAL_COMMUNITY_STORIES) {
      if (init.id === 'story-02') continue; // obsolete generic
      if (!seenIds.has(init.id) && !deletedIds.has(init.id)) {
        result.push(init);
      }
    }

    // Make sure story-1788342289836 is present and featured if not deleted
    if (!deletedIds.has('story-1788342289836') && !result.some((s) => s.id === 'story-1788342289836')) {
      const realStory = INITIAL_COMMUNITY_STORIES.find((s) => s.id === 'story-1788342289836');
      if (realStory) result.unshift(realStory);
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
      if (s.id === storyId || (storyId === 'story-02' && s.id === 'story-1788342289836')) {
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
    // Permanently record deletion so seed stories never resurrect
    markStoryAsDeleted(storyId);
    if (storyId === 'story-02') {
      markStoryAsDeleted('story-1788342289836');
    }
    const current = getStoredCommunityStories();
    const updated = current.filter((s) => s.id !== storyId && (storyId !== 'story-02' || s.id !== 'story-02'));
    localStorage.setItem(LOCAL_STORAGE_STORIES_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Error deleting community story:', err);
    return getStoredCommunityStories();
  }
}
