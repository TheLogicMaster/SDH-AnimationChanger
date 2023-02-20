import { ServerAPI, DropdownOption } from 'decky-frontend-lib';
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
}

export interface PluginSettings {
  randomize: String;
  current_set: String;
  boot: String;
  suspend: String;
  throbber: String;
  force_ipv4: boolean;
}

export interface Animation {
  id: string;
  name: string;
  author: string;
  target: string;
}

export interface AnimationSet {
  id: string;
  name: string;
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

export enum TargetType {
  All,
  Boot,
  Suspend
}

export type AnimationContextType = {
  repoResults: IRepoResult[];
  searchRepo: (reload?: boolean) => void;
  repoSort: RepoSort;
  setRepoSort: (arg0: RepoSort) => void;
  targetType: TargetType;
  setTargetType: (arg0: TargetType) => void;
  downloadAnimation: (id: String) => void;
  allAnimations: Animation[];
  customAnimations: Animation[];
  localAnimations: Animation[];
  downloadedAnimations: IRepoResult[];
  settings: PluginSettings;
  saveSettings: (settings: PluginSettings) => void;
  lastSync: Number;
  loadBackendState: () => void;
  reloadConfig: () => void;
  deleteAnimation: (id: String) => void;
  shuffle: () => void;
}

export interface AnimationProviderType {
  serverAPI: ServerAPI;
}

export const sortOptions: DropdownOption[] = [
  {
    label: 'Newest',
    data: RepoSort.Newest
  },
  {
    label: 'Oldest',
    data: RepoSort.Oldest
  },
  {
    label: 'Alphabetical',
    data: RepoSort.Alpha
  },
  {
    label: 'Most Popular',
    data: RepoSort.Downloads
  },
  {
    label: 'Most Liked',
    data: RepoSort.Likes
  }
];

export const targetOptions: DropdownOption[] = [
  {
    label: 'All',
    data: TargetType.All
  },
  {
    label: 'Boot',
    data: TargetType.Boot
  },
  {
    label: 'Suspend',
    data: TargetType.Suspend
  }
];
