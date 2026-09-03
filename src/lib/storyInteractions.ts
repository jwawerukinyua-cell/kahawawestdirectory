import { StoryComment } from '../types';

const COMMENTS_STORAGE_KEY = 'kwest_story_comments_v1';
const REACTIONS_STORAGE_KEY = 'kwest_story_reactions_v1';

export interface StoryReactionState {
  userReaction: 'like' | 'dislike' | null;
  likes: number;
  dislikes: number;
}

// Initial seed comments for the featured Kahawa Pride story
const SEED_COMMENTS: Record<string, StoryComment[]> = {
  'story-1788342289836': [
    {
      id: 'comm-01',
      storyId: 'story-1788342289836',
      authorName: 'Mama Brian',
      authorRole: 'Mahiga Resident & Parent',
      content: 'Coach Baba Brian and the technical team are doing remarkable work keeping our young boys disciplined, active and focused on school. Proud Kahawa West resident!',
      createdAt: '2 hours ago',
      likes: 12,
    },
    {
      id: 'comm-02',
      storyId: 'story-1788342289836',
      authorName: 'Otieno J.',
      authorRole: 'Station Road Sports Fan',
      content: 'Watched their under-17 squad play last weekend. Very disciplined teamwork and sharp tactical awareness. Big up to Mfalme Ukweli for highlighting real grassroots champions!',
      createdAt: 'Yesterday',
      likes: 8,
    },
  ],
  'story-02': [
    {
      id: 'comm-01-alias',
      storyId: 'story-02',
      authorName: 'Mama Brian',
      authorRole: 'Mahiga Resident & Parent',
      content: 'Coach Baba Brian and the technical team are doing remarkable work keeping our young boys disciplined, active and focused on school. Proud Kahawa West resident!',
      createdAt: '2 hours ago',
      likes: 12,
    },
    {
      id: 'comm-02-alias',
      storyId: 'story-02',
      authorName: 'Otieno J.',
      authorRole: 'Station Road Sports Fan',
      content: 'Watched their under-17 squad play last weekend. Very disciplined teamwork and sharp tactical awareness. Big up to Mfalme Ukweli for highlighting real grassroots champions!',
      createdAt: 'Yesterday',
      likes: 8,
    },
  ],
};

function getAllStoredComments(): Record<string, StoryComment[]> {
  try {
    const raw = localStorage.getItem(COMMENTS_STORAGE_KEY);
    if (!raw) {
      return { ...SEED_COMMENTS };
    }
    const parsed = JSON.parse(raw);
    return { ...SEED_COMMENTS, ...parsed };
  } catch {
    return { ...SEED_COMMENTS };
  }
}

export function getStoryComments(storyId: string): StoryComment[] {
  const all = getAllStoredComments();
  // Support lookup by storyId or alias
  const direct = all[storyId];
  if (direct && direct.length > 0) return direct;
  if (storyId === 'story-1788342289836' && all['story-02']) return all['story-02'];
  if (storyId === 'story-02' && all['story-1788342289836']) return all['story-1788342289836'];
  return [];
}

export function addStoryComment(
  storyId: string,
  authorName: string,
  content: string,
  authorRole = 'Reader / Resident'
): StoryComment {
  const all = getAllStoredComments();
  const currentList = getStoryComments(storyId);
  const newComment: StoryComment = {
    id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    storyId,
    authorName: authorName.trim() || 'Resident of Kahawa West',
    authorRole,
    content: content.trim(),
    createdAt: 'Just now',
    likes: 0,
  };

  const updatedList = [newComment, ...currentList];
  all[storyId] = updatedList;

  // Sync alias if it's the featured Kahawa Pride story
  if (storyId === 'story-1788342289836') {
    all['story-02'] = updatedList;
  } else if (storyId === 'story-02') {
    all['story-1788342289836'] = updatedList;
  }

  try {
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.warn('Failed to save story comment:', e);
  }

  return newComment;
}

export function deleteStoryComment(storyId: string, commentId: string): StoryComment[] {
  const all = getAllStoredComments();
  const currentList = getStoryComments(storyId);
  const updatedList = currentList.filter((c) => c.id !== commentId);
  all[storyId] = updatedList;

  if (storyId === 'story-1788342289836') {
    all['story-02'] = updatedList;
  } else if (storyId === 'story-02') {
    all['story-1788342289836'] = updatedList;
  }

  try {
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.warn('Failed to delete story comment:', e);
  }

  return updatedList;
}

// ---------------- Reactions (Like / Dislike) ----------------

function getAllStoredReactions(): Record<string, StoryReactionState> {
  try {
    const raw = localStorage.getItem(REACTIONS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function getStoryReactions(
  storyId: string,
  baseLikes = 0,
  baseDislikes = 0
): StoryReactionState {
  const all = getAllStoredReactions();
  const state = all[storyId] || (storyId === 'story-1788342289836' ? all['story-02'] : null) || (storyId === 'story-02' ? all['story-1788342289836'] : null);

  if (state) {
    return {
      userReaction: state.userReaction || null,
      likes: Math.max(baseLikes, state.likes ?? baseLikes),
      dislikes: Math.max(baseDislikes, state.dislikes ?? baseDislikes),
    };
  }

  return {
    userReaction: null,
    likes: baseLikes,
    dislikes: baseDislikes,
  };
}

export function toggleStoryReaction(
  storyId: string,
  type: 'like' | 'dislike',
  baseLikes = 0,
  baseDislikes = 0
): StoryReactionState {
  const all = getAllStoredReactions();
  const current = getStoryReactions(storyId, baseLikes, baseDislikes);

  let newReaction: 'like' | 'dislike' | null = null;
  let newLikes = current.likes;
  let newDislikes = current.dislikes;

  if (type === 'like') {
    if (current.userReaction === 'like') {
      // Toggle off
      newReaction = null;
      newLikes = Math.max(0, newLikes - 1);
    } else {
      // If was disliked, decrease dislike
      if (current.userReaction === 'dislike') {
        newDislikes = Math.max(0, newDislikes - 1);
      }
      newReaction = 'like';
      newLikes += 1;
    }
  } else if (type === 'dislike') {
    if (current.userReaction === 'dislike') {
      // Toggle off
      newReaction = null;
      newDislikes = Math.max(0, newDislikes - 1);
    } else {
      // If was liked, decrease like
      if (current.userReaction === 'like') {
        newLikes = Math.max(0, newLikes - 1);
      }
      newReaction = 'dislike';
      newDislikes += 1;
    }
  }

  const updatedState: StoryReactionState = {
    userReaction: newReaction,
    likes: newLikes,
    dislikes: newDislikes,
  };

  all[storyId] = updatedState;
  if (storyId === 'story-1788342289836') {
    all['story-02'] = updatedState;
  } else if (storyId === 'story-02') {
    all['story-1788342289836'] = updatedState;
  }

  try {
    localStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.warn('Failed to save reaction:', e);
  }

  return updatedState;
}
