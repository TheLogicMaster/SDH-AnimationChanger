import { ReactNode } from 'react';
import { ServerAPI } from 'decky-frontend-lib';

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
  loadSets: () => void;
}

export interface AnimationProviderType extends ReactNode {
  serverAPI: ServerAPI
}