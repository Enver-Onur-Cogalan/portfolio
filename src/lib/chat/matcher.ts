import Fuse, { IFuseOptions } from 'fuse.js';
import { directResponses, quickReplies } from './responses';

interface SearchableItem {
  id: string;
  keywords: string[];
  response: string;
  showOptions?: boolean;
  autoScrollDelay?: number;
  type: 'direct' | 'quickReply';
}

// Prepare searchable items from directResponses
const searchableItems: SearchableItem[] = directResponses.map((item, index) => ({
  id: `direct-${index}`,
  keywords: item.keywords,
  response: item.response,
  showOptions: item.showOptions,
  autoScrollDelay: item.autoScrollDelay,
  type: 'direct',
}));

// Prepare quickReplies for fallback matching
const quickReplyItems: SearchableItem[] = quickReplies.map((item) => ({
  id: item.id,
  keywords: [item.label.toLowerCase(), item.id],
  response: item.response,
  autoScrollDelay: (item as any).autoScrollDelay,
  type: 'quickReply',
}));

// Fuse.js options for keyword matching
const fuseOptions: IFuseOptions<SearchableItem> = {
  keys: ['keywords'],
  threshold: 0.4, // 0 = exact match, 1 = match anything
  distance: 100,
  includeScore: true,
  minMatchCharLength: 2,
};

const fuse = new Fuse(searchableItems, fuseOptions);
const quickReplyFuse = new Fuse(quickReplyItems, {
  ...fuseOptions,
  threshold: 0.3,
});

export interface MatchResult {
  response: string;
  showOptions: boolean;
  autoScrollDelay?: number;
}

export function findBestMatch(userMessage: string): MatchResult {
  const normalizedMessage = userMessage.toLowerCase().trim();

  if (normalizedMessage.length === 0) {
    return {
      response: 'Lütfen bir mesaj yazın.',
      showOptions: false,
    };
  }

  // First, check if user is clicking on a quick reply option
  const quickReplyResults = quickReplyFuse.search(normalizedMessage);
  if (quickReplyResults.length > 0 && quickReplyResults[0].score! < 0.2) {
    return {
      response: quickReplyResults[0].item.response,
      showOptions: false,
      autoScrollDelay: quickReplyResults[0].item.autoScrollDelay,
    };
  }

  // Search in direct responses using Fuse.js
  const results = fuse.search(normalizedMessage);

  // If we found a good match (score threshold)
  if (results.length > 0 && results[0].score! < 0.4) {
    const bestMatch = results[0].item;
    return {
      response: bestMatch.response,
      showOptions: bestMatch.showOptions || false,
      autoScrollDelay: bestMatch.autoScrollDelay,
    };
  }

  // Check for partial keyword matches in original keywords
  for (const item of searchableItems) {
    const hasKeyword = item.keywords.some((keyword) =>
      normalizedMessage.includes(keyword.toLowerCase())
    );
    if (hasKeyword) {
      return {
        response: item.response,
        showOptions: item.showOptions || false,
        autoScrollDelay: item.autoScrollDelay,
      };
    }
  }

  // No match found - show options
  const fallbackResponse = 'Hmm, tam olarak anlayamadım ama olsun! Belki şunlardan biri sana yardımcı olabilir:';

  return {
    response: fallbackResponse,
    showOptions: true,
  };
}
