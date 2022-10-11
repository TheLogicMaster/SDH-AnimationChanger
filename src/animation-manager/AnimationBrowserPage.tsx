import { useEffect, FC } from 'react';
import { Focusable, PanelSectionRow, Dropdown } from 'decky-frontend-lib';
import RepoResultCard from './RepoResultCard';

import { useAnimationContext } from '../state';

export const AnimationBrowserPage: FC = () => {
  
  const { searchRepo, repoResults, searchTotal } = useAnimationContext();

  // Runs upon opening the page
  useEffect(() => {
    
    searchRepo();
    
  }, []);

  return (
    <>
      <Focusable>
        <PanelSectionRow>
            {searchTotal} results found
        </PanelSectionRow>
      </Focusable>
      
      <Focusable style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', columnGap: '15px' }}>

        {repoResults.map((result) => <RepoResultCard key={result.id} result={result} />)}

      </Focusable>
        
    </>
  );
};
  