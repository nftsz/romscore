export interface User {
  id: number;
  username: string;
  email: string;
}

export interface HackRating {
  id: number;
  user: number;
  username: string;
  score: number;
  review: string | null;
  created_at: string;
}

export interface RomHack {
  id: number;
  game: number;
  title: string;
  author_name: string;
  category: 'translation' | 'improvement' | 'complete_hack' | 'difficulty';
  category_display: string;
  description: string;
  patch_url: string | null;
  submitted_by: string;
  avg_score: number;
  total_ratings: number;
  user_rating: number | null;
  ratings?: HackRating[];
  created_at: string;
}

export interface Game {
  id: number;
  rawg_id: number;
  slug: string;
  title: string;
  cover_url: string | null;
  total_hacks: number;
  hacks?: RomHack[];
  created_at: string;
}