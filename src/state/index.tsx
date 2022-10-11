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
  RepoResult,
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

  const searchRepo = async (sort?: string, query?: string, page?: number) => {

    // TODO: make sort an enum
    // TODO: pull query through
    // TODO: setup pagination

    const response = await serverAPI.fetchNoCors<{ body: string }>('https://steamdeckrepo.com/?sort=likes-desc', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Inertia': 'true',
        'X-Inertia-Version': 'f182274c1534a5980b2777586ce52800'
      }
    });

    if(response.success) {
      const data = JSON.parse(response.result.body);
      setRepoResults(data.props.posts.data);
      setSearchTotal(data.props.posts.meta.total);
    }

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