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
  RepoResult
} from '../types/animation';

const AnimationContext = createContext<AnimationContextType | null>(null);

export const AnimationProvider: FC<AnimationProviderType> = ({ serverAPI, children }) => {

  const [ page, setPage ] = useState(0);
  const [ searchTotal, setSearchTotal ] = useState(0);
  const [ repoResults, setRepoResults ] = useState<RepoResult[]>([]);

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

    // TODO: make sort an enum
    // TODO: pull query through
    // TODO: setup pagination

    let data = await serverAPI.callPluginMethod<{}, {}>('getCachedAnimations', {offset: 0, count: 200, anim_type: ''});
  
    // @ts-ignore
    if(reload || !data.result || data.result.animations.length === 0) {
      await serverAPI.callPluginMethod<{}, {}>('updateAnimationCache', {});
      data = await serverAPI.callPluginMethod<{}, {}>('getCachedAnimations', {offset: 0, count: 200, anim_type: ''});
    }

    // @ts-ignore
    setRepoResults(data.result.animations);
    // @ts-ignore
    setSearchTotal(data.result.animations.length);

  }

  return (
    <AnimationContext.Provider value={{
      animations,
      animationSets,
      loadSets,
      page,
      searchTotal,
      repoResults,
      searchRepo
    }}>
      {children}
    </AnimationContext.Provider>
  );

}

export const useAnimationContext = () => useContext(AnimationContext) as AnimationContextType;