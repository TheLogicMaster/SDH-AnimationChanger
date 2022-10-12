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

    let data = await serverAPI.callPluginMethod('getCachedAnimations', {});
  
    // @ts-ignore
    if(reload || !data.result || data.result.animations.length === 0) {
      await serverAPI.callPluginMethod('updateAnimationCache', {});
      data = await serverAPI.callPluginMethod('getCachedAnimations', {});
    }

    // @ts-ignore
    setRepoResults(data.result.animations.map((json) => new RepoResult(json)));

  }

  const downloadAnimation = async (id: String) => {

    const response = await serverAPI.callPluginMethod('downloadAnimation', { anim_id: id });
    console.log(response);

    return true;
  }

  return (
    <AnimationContext.Provider value={{
      animations,
      animationSets,
      loadSets,
      repoResults,
      searchRepo,
      repoSort,
      setRepoSort,
      downloadAnimation
    }}>
      {children}
    </AnimationContext.Provider>
  );

}

export const useAnimationContext = () => useContext(AnimationContext) as AnimationContextType;