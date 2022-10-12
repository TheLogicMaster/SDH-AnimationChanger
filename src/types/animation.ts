import { ServerAPI } from 'decky-frontend-lib';
import { Moment } from 'moment';

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
  moment_date: Moment;
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

export enum RepoSort {
  Alpha,
  Likes,
  Downloads,
  Newest,
  Oldest
}

export type AnimationContextType = {
  animations: Animation[];
  animationSets: AnimationSet[];
  repoResults: IRepoResult[];
  loadSets: () => void;
  searchRepo: (reload?: boolean) => void;
  repoSort: RepoSort;
  setRepoSort: (arg0: RepoSort) => void;
  downloadAnimation: (id: String) => Promise<boolean>;
}

export interface AnimationProviderType {
  serverAPI: ServerAPI;
}