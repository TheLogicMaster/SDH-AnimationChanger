import { ServerAPI } from 'decky-frontend-lib';
import { Moment } from 'moment';

export interface IRepoResult extends Animation  {
  preview_image: string;
  preview_video: string;
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

export interface PluginSettings {
  randomize: boolean;
  current_set?: AnimationSet;
  boot?: Animation;
  suspend?: Animation;
  throbber?: Animation;
}

export interface Animation {
  id: string;
  name: string;
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
  repoResults: IRepoResult[];
  searchRepo: (reload?: boolean) => void;
  repoSort: RepoSort;
  setRepoSort: (arg0: RepoSort) => void;
  downloadAnimation: (id: String) => void;
  downloadedAnimations: IRepoResult[];
  settings: PluginSettings;
}

export interface AnimationProviderType {
  serverAPI: ServerAPI;
}