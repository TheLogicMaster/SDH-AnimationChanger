import { ReactNode } from 'react';
import { ServerAPI } from 'decky-frontend-lib';

export interface RepoResult {
  id: string;
  slug: string;
  title: string;
  content: string;
  user: RepoUser;
  thumbnail: string;
  video: string;
  video_preview: string;
  created_at: string;
  updated_at: string;
  url: string;
  likes: number;
  downloads: number;
}

export interface RepoUser {
  id: number;
  steam_name: string;
  steam_avatar: string;
}

export interface Animation {
  id: string;
  title: string;
  author: string;
}

export interface AnimationSet {
  id: string;
  boot: string | null;
  suspend: string | null;
  throbber: string | null;
  enabled: boolean;
}

export type AnimationContextType = {
  animations: Animation[];
  animationSets: AnimationSet[];
  repoResults: RepoResult[];
  searchTotal: number;
  page: number;
  loadSets: () => void;
  searchRepo: (sort?: string, query?: string, page?: number) => void;
}

export interface AnimationProviderType extends ReactNode {
  serverAPI: ServerAPI
}