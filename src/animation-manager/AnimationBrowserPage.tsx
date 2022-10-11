import { useEffect, FC } from 'react';
import { useAnimationContext } from '../state';

export const AnimationBrowserPage: FC = () => {
  
  const { searchRepo, repoResults, searchTotal } = useAnimationContext();

  // Runs upon opening the page
  useEffect(() => {
    
    searchRepo();
    
  }, []);

  return (
    <div>
      <h2
        style={{ fontWeight: "bold", fontSize: "1.5em", marginBottom: "0px" }}
      >
        
        TOTAL: {searchTotal}

      </h2>

      {repoResults.map((result) => (
          <div key={result.id}>
            <img src={result.thumbnail} width={300} />
            {result.title}
            <hr />
          </div>
        ))}
    </div>
  );
};
  