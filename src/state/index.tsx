import {
  createContext,
  FC,
  useState
} from 'react';

import {
  AnimationContextType,
  AnimationProviderType,
  Animation,
  AnimationSet
} from '../types/animation';

const AnimationContext = createContext<AnimationContextType | null>(null);

export const AnimationProvider: FC<AnimationProviderType> = ({ serverAPI, children }) => {

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

  return (
    <AnimationContext.Provider value={{
      animations,
      animationSets,
      loadSets
    }}>
      {children}
    </AnimationContext.Provider>
  );

}