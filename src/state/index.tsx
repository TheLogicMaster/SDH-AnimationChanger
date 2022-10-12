import {
  createContext,
  FC,
  useState,
  useContext,
  useEffect
} from 'react';

import { ToastData } from 'decky-frontend-lib';

import {
  AnimationContextType,
  AnimationProviderType,
  Animation,
  AnimationSet,
  PluginSettings,
  IRepoResult,
  RepoSort
} from '../types/animation';

import RepoResult from '../models/RepoResult';

const AnimationContext = createContext<AnimationContextType | null>(null);

export const AnimationProvider: FC<AnimationProviderType> = ({ serverAPI, children }) => {

  const [ repoSort, setRepoSort ] = useState<RepoSort>(RepoSort.Newest);
  const [ repoResults, setRepoResults ] = useState<IRepoResult[]>([]);

  const [ localAnimations, setLocalAnimations ] = useState<Animation[]>([]);
  const [ downloadedAnimations, setDownloadedAnimations ] = useState<IRepoResult[]>([]);
  const [ localSets, setLocalSets ] = useState<AnimationSet[]>([]);
  const [ customSets, setCustomSets ] = useState<AnimationSet[]>([]);
  const [ settings, setSettings ] = useState<PluginSettings>({
    randomize: false,
    current_set: undefined,
    boot: undefined,
    suspend: undefined,
    throbber: undefined,
  });

  // When the context is mounted we load the current config.
  useEffect(() => {
    loadBackendState();
  }, []);

  const loadBackendState = async () => {
    const { result } = await serverAPI.callPluginMethod<any, any>('getState', {});

    setDownloadedAnimations(result.downloaded_animations.map((json: any) => new RepoResult(json)));
    setLocalAnimations(result.local_animations);
    setSettings(result.settings);
  };
  
  const searchRepo = async (reload: Boolean = false) => {

    let data = await serverAPI.callPluginMethod('getCachedAnimations', {});
  
    // @ts-ignore
    if(reload || !data.result || data.result.animations.length === 0) {
      await serverAPI.callPluginMethod('updateAnimationCache', {});
      data = await serverAPI.callPluginMethod('getCachedAnimations', {});
    }

    // @ts-ignore
    setRepoResults(data.result.animations.map((json: any) => new RepoResult(json)));

  }

  const downloadAnimation = async (id: String) => {
    const response = await serverAPI.callPluginMethod('downloadAnimation', { anim_id: id });
    // Reload the backend state.
    loadBackendState();
    return true;
  }

  return (
    <AnimationContext.Provider value={{
      repoResults,
      searchRepo,
      repoSort,
      setRepoSort,
      downloadAnimation,
      downloadedAnimations,
      settings
    }}>
      {children}
    </AnimationContext.Provider>
  );

}

export const useAnimationContext = () => useContext(AnimationContext) as AnimationContextType;