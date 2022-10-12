import {
  createContext,
  FC,
  useState,
  useContext
} from 'react';

import { ToastData } from 'decky-frontend-lib';

import {
  AnimationContextType,
  AnimationProviderType,
  Animation,
  AnimationSet,
  IRepoResult,
  RepoSort
} from '../types/animation';

import RepoResult from '../models/RepoResult';

const AnimationContext = createContext<AnimationContextType | null>(null);

export const AnimationProvider: FC<AnimationProviderType> = ({ serverAPI, children }) => {

  const [ repoSort, setRepoSort ] = useState<RepoSort>(RepoSort.Newest);
  const [ repoResults, setRepoResults ] = useState<IRepoResult[]>([]);

  const [ animations, setAnimations ] = useState<Animation[]>([]);
  const [ animationSets, setAnimationSets ] = useState<AnimationSet[]>([]);
  

  /**
   * Load the sets from the server API.
   */
  const loadSets = async () => {
    const response = await serverAPI.callPluginMethod('getSets', {});
    if(response.success) {
      setAnimationSets(response.result as AnimationSet[]);
    }
  };
  
  const searchRepo = async (reload: Boolean = false) => {

    let data = await serverAPI.callPluginMethod<{}, {}>('getCachedAnimations', {offset: 0, count: 200, anim_type: ''});
  
    // @ts-ignore
    if(reload || !data.result || data.result.animations.length === 0) {
      await serverAPI.callPluginMethod<{}, {}>('updateAnimationCache', {});
      data = await serverAPI.callPluginMethod<{}, {}>('getCachedAnimations', {offset: 0, count: 200, anim_type: ''});
    }

    // @ts-ignore
    setRepoResults(data.result.animations.map((json) => new RepoResult(json)));

  }

  return (
    <AnimationContext.Provider value={{
      animations,
      animationSets,
      loadSets,
      repoResults,
      searchRepo,
      repoSort,
      setRepoSort
    }}>
      {children}
    </AnimationContext.Provider>
  );

}

export const useAnimationContext = () => useContext(AnimationContext) as AnimationContextType;