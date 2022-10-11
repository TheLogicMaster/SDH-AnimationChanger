import { createContext } from 'react';

export interface AnimationChangerContextInterface {
  name: string;
  author: string;
  url: string;
}

export const AnimationChangerContext = createContext<AnimationChangerContextInterface | null>(null);