export type CategoryChoice = 'translation' | 'improvement' | 'complete_hack' | 'difficulty';

export interface HackScreenshot {
  id: number;
  image_url: string;
  caption?: string;
  created_at: string;
}

export interface HackRating {
  id: number;
  username: string;
  score: number;
  review?: string;
  created_at: string;
  updated_at: string;
}

export interface RomHack {
  id: number;
  game: number;
  title: string;
  author_name: string;
  category: CategoryChoice;
  category_display: string;
  description: string;
  patch_url?: string;
  cover_url?: string;
  submitted_by?: string;
  avg_score: number;
  total_ratings: number;
  user_rating?: number | null;
  screenshots: HackScreenshot[];
  ratings: HackRating[];
  created_at: string;
}

export interface Game {
  id: number;
  ra_id: number;
  slug: string;
  title: string;
  console_id?: number;
  platform: string;
  released_date?: string;
  publisher?: string;
  developer?: string;
  genre?: string;
  cover_url?: string;
  title_screen_url?: string;
  ingame_screen_url?: string;
  total_players: number;
  total_hacks: number;
  hacks: RomHack[];
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  email?: string;
}

export interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Game[];
}