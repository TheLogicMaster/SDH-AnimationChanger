import { ReactNode } from 'react';
import { ServerAPI } from 'decky-frontend-lib';

export interface IRepoResult {
  id: string;
  name: string;
  preview_image: string;
  preview_video: string;
  author: string;
  description: string;
  last_changed: string;
  source: string;
  download_url: string;
  likes: number;
  downloads: number;
  version: string;
  target: string;
  manifest_version: number;
  readonly relative_date: string;
  readonly downloaded: boolean;
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
  repoResults: IRepoResult[];
  searchTotal: number;
  page: number;
  loadSets: () => void;
  searchRepo: (reload: boolean = false) => void;
}

export interface AnimationProviderType extends ReactNode {
  serverAPI: ServerAPI
}