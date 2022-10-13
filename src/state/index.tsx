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
  
  const [ lastSync, setLastSync ] = useState(new Date().getTime());

  const [ allAnimations, setAllAnimations ] = useState<Animation[]>([]);
  const [ localAnimations, setLocalAnimations ] = useState<Animation[]>([]);
  const [ customAnimations, setCustomAnimations ] = useState<Animation[]>([]);
  const [ downloadedAnimations, setDownloadedAnimations ] = useState<IRepoResult[]>([]);
  const [ localSets, setLocalSets ] = useState<AnimationSet[]>([]);
  const [ customSets, setCustomSets ] = useState<AnimationSet[]>([]);
  const [ settings, setSettings ] = useState<PluginSettings>({
    randomize: '',
    current_set: '',
    boot: '',
    suspend: '',
    throbber: '',
  });

  // When the context is mounted we load the current config.
  useEffect(() => {
    loadBackendState();
  }, []);

  const loadBackendState = async () => {
    const { result } = await serverAPI.callPluginMethod<any, any>('getState', {});

    setDownloadedAnimations(result.downloaded_animations.map((json: any) => new RepoResult(json)));
    setLocalAnimations(result.local_animations);
    setCustomAnimations(result.custom_animations);
    const allAnim: Animation[] = []
    allAnim.push(...downloadedAnimations)
    allAnim.push(...localAnimations)
    allAnim.push(...customAnimations)
    setAllAnimations(allAnim)
    setSettings(result.settings);
    setLastSync(new Date().getTime());
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
    await serverAPI.callPluginMethod('downloadAnimation', { anim_id: id });
    // Reload the backend state.
    loadBackendState();
    return true;
  }

  const saveSettings = async (settings: PluginSettings) => {
    await serverAPI.callPluginMethod('saveSettings', { settings });
    loadBackendState();
  }

  const reloadConfig = async () => {
    await serverAPI.callPluginMethod('reloadConfiguration', {});
    loadBackendState();
  }

  return (
    <AnimationContext.Provider value={{
      repoResults,
      searchRepo,
      repoSort,
      setRepoSort,
      downloadAnimation,
      downloadedAnimations,
      customAnimations,
      localAnimations,
      allAnimations,
      settings,
      saveSettings,
      lastSync,
      loadBackendState,
      reloadConfig
    }}>
      {children}
    </AnimationContext.Provider>
  );

}

export const useAnimationContext = () => useContext(AnimationContext) as AnimationContextType;