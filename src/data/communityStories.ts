import { CommunityStory } from '../types';
import { deleteStoryFromSupabase } from '../lib/supabase';

export const INITIAL_COMMUNITY_STORIES: CommunityStory[] = [
  {
    id: 'story-1788508956440',
    slug: 'kahawa-pride-fc-grassroots-success',
    title: 'Kahawa Pride FC Is More Than A Football Club. It Is A Grassroots Success Story',
    subtitle: '⚽ Kahawa Pride FC: Football with Kahawa West at Heart',
    category: 'Youth & Sports',
    zone: 'Roundabout',
    excerpt: 'Originally founded as Kahawa Sportive Soccer Academy, the club started with a simple mission: to give young people in the community an opportunity to develop their football skills while building discipline, confidence and a sense of belonging.',
    content: `Originally founded as Kahawa Sportive Soccer Academy, the club started with a simple mission: to give young people in the community an opportunity to develop their football skills while building discipline, confidence and a sense of belonging.

In 2022, the academy took a major step forward, rebranding as Kahawa Pride FC and adopting its now-recognisable lion identity. Since then, the club has continued to grow both on and off the pitch, with ambitions that reach far beyond local football.

### 🦁 More Than the Alphas
Kahawa Pride has grown into a football family with several teams:
- **Alphas** — the men's first team competing in the FKF Nairobi East Regional League.
- **Lionesses** — the women's team creating more opportunities for female footballers.
- **Cubs** — the youth academy developing the next generation of players.
- **Mapogo** — another team within the growing Kahawa Pride family.

The club has also expanded its footprint with **Kakuma Pride**, taking the spirit of Kahawa Pride beyond its original home.

### 🏟️ Matchday in Kahawa West
Home matches are played at **Mahiga Primary School Grounds**, where football becomes a community affair. Players, families, friends and supporters come together to cheer, celebrate and experience local football right on their doorstep.

But Kahawa Pride's impact doesn't end when the referee blows the final whistle. The club has been involved in community initiatives including health and education activities, environmental clean-ups and food drives.

Behind the scenes, the club has also invested in player welfare, including accommodation, meals and gym facilities—ambitious steps for a grassroots club working its way up the Kenyan football pyramid.

### 📈 From Grassroots to Greater Ambitions
Kahawa Pride's journey shows what can happen when local talent meets serious ambition. The club has attracted partnerships and support from organisations including JerseyBird, AVA by CR7 and Betway Scores, while remaining firmly connected to its community roots.

The long-term dream? To keep climbing the Kenyan football pyramid and ultimately compete at the highest level.

### 📍 Proudly Kahawa
For residents of Kahawa West, Kahawa Pride FC is something worth paying attention to—not simply because of the results, but because it represents something bigger:

**Local people. Local talent. Local ambition.**

Whether you're a lifelong football fan, a parent looking for opportunities for your child, or simply someone who loves seeing Kahawa businesses, organisations and people doing great things, Kahawa Pride is part of the story of this community.

Follow the journey. Support the teams. Show up for Kahawa. 🦁⚽

**Home Ground:** Mahiga Primary School Grounds, Kahawa West  
**Based:** Kahawa Station Road, Githurai, Nairobi

**Follow Kahawa Pride FC:**  
- **Website:** kahawapridefc.com  
- **Facebook:** @kahawapridefc  
- **Instagram:** @kahawapridefc  
- **YouTube:** @kahawapridefc`,
    imageUrl: '/Kahawa -pride_fc.jpg',
    imageCaption: 'Photo courtesy of kahawapridefc.com - Kahawa West Community Spotlight',
    isRealPhotoConfirmed: true,
    authorName: 'Mfalme Ukweli',
    authorEmail: 'info@mfalmeukweli.co.ke',
    authorPhone: '+254727405842',
    authorRole: 'Podcast Host-ArtTheworkshop',
    date: '2026-09-04',
    readTimeMinutes: 3,
    featured: true,
    status: 'published',
    likes: 1,
    dislikes: 0,
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
      
      // If it's an older generic/obsolete ID, skip or upgrade
      if (p.id === 'story-01' || p.id === 'story-03') {
        continue;
      }
      if (p.id === 'story-02' || p.id === 'story-1788342289836' || p.id === 'story-1788450086647') {
        if (deletedIds.has('story-1788508956440') || deletedIds.has('story-02')) continue;
        const realSeed = initialMap.get('story-1788508956440')!;
        if (realSeed) {
          result.push(realSeed);
          seenIds.add('story-1788508956440');
        }
        seenIds.add('story-1788450086647');
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

    // Make sure story-1788508956440 is present and featured if not deleted
    if (!deletedIds.has('story-1788508956440') && !result.some((s) => s.id === 'story-1788508956440')) {
      const realStory = INITIAL_COMMUNITY_STORIES.find((s) => s.id === 'story-1788508956440');
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
    // Also delete from Supabase if connected
    deleteStoryFromSupabase(storyId).catch(() => {});
    if (storyId === 'story-02' || storyId === 'story-1788342289836') {
      deleteStoryFromSupabase('story-1788450086647').catch(() => {});
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
