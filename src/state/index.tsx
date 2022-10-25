import {
  createContext,
  FC,
  useState,
  useContext,
  useEffect
} from 'react';

import {
  AnimationContextType,
  AnimationProviderType,
  Animation,
  TargetType,
  PluginSettings,
  IRepoResult,
  RepoSort
} from '../types/animation';

import RepoResult from '../models/RepoResult';

const AnimationContext = createContext<AnimationContextType | null>(null);

export const AnimationProvider: FC<AnimationProviderType> = ({ serverAPI, children }) => {

  const [ repoSort, setRepoSort ] = useState<RepoSort>(RepoSort.Newest);
  const [ repoResults, setRepoResults ] = useState<IRepoResult[]>([]);
  const [ targetType, setTargetType ] = useState<TargetType>(TargetType.All);
  
  const [ lastSync, setLastSync ] = useState(new Date().getTime());

  const [ localAnimations, setLocalAnimations ] = useState<Animation[]>([]);
  const [ customAnimations, setCustomAnimations ] = useState<Animation[]>([]);
  const [ downloadedAnimations, setDownloadedAnimations ] = useState<IRepoResult[]>([]);
  

  const [ settings, setSettings ] = useState<PluginSettings>({
    randomize: '',
    current_set: '',
    boot: '',
    suspend: '',
    throbber: '',
    force_ipv4: false
  });

  // When the context is mounted we load the current config.
  useEffect(() => {
    loadBackendState();
  }, []);

  const sortByName = (a: any, b: any) => {
    if(a.name < b.name) return -1;
    if(a.name > b.name) return 1;
    return 0;
  };

  const loadBackendState = async () => {
    const { result } = await serverAPI.callPluginMethod<any, any>('getState', {});
    setDownloadedAnimations(
      result.
      downloaded_animations
      .map((json: any) => new RepoResult(json))
      .sort(sortByName));
    setLocalAnimations(result.local_animations.sort(sortByName));
    setCustomAnimations(result.custom_animations.sort(sortByName));
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

  const deleteAnimation = async (id: String) => {
    await serverAPI.callPluginMethod('deleteAnimation', { anim_id: id });
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

  const shuffle = async () => {
    await serverAPI.callPluginMethod('randomize', { shuffle: true });
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
      allAnimations: (downloadedAnimations as Animation[]).concat(customAnimations, localAnimations).sort(sortByName),
      settings,
      saveSettings,
      lastSync,
      loadBackendState,
      reloadConfig,
      deleteAnimation,
      shuffle,
      targetType,
      setTargetType
    }}>
      {children}
    </AnimationContext.Provider>
  );

}

export const useAnimationContext = () => useContext(AnimationContext) as AnimationContextType;