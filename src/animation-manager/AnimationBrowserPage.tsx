import { useEffect, FC } from 'react';
import { useAnimationContext } from '../state';

export const AnimationBrowserPage: FC = () => {
  
  const { loadSets, animationSets } = useAnimationContext();

  // Runs upon opening the page
  useEffect(() => {
    
    loadSets();
    
  }, []);

  return (
    <div>
      <h2
        style={{ fontWeight: "bold", fontSize: "1.5em", marginBottom: "0px" }}
      >
        
        {animationSets.map((set) => (
          <div key={set.id}>
            {set.boot}
          </div>
        ))}

      </h2>
    </div>
  );
};
  