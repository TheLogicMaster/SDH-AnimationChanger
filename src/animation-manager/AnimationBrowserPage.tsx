import {
  useEffect,
  useState,
  FC
} from 'react';

import {
  Focusable,
  PanelSectionRow,
  Dropdown,
  showModal,
  Spinner
} from 'decky-frontend-lib';

import RepoResultCard from '../components/RepoResultCard';
import RepoResultModal from '../components/RepoResultModal';

import { useAnimationContext } from '../state';

export const AnimationBrowserPage: FC = () => {
  
  const { searchRepo, repoResults, searchTotal } = useAnimationContext();
  
  const [ loading, setLoading ] = useState(true);

  const loadResults = async () => {
    await searchRepo();
    setLoading(false);
  };

  // Runs upon opening the page
  useEffect(() => {
    loadResults();
  }, []);


  if(loading) {
    return (
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
        <Spinner width={32} height={32} />
      </div>
    );
  }

  return (
    <>
      <Focusable>
        <PanelSectionRow>
            {searchTotal} results found
        </PanelSectionRow>
      </Focusable>

      
      <Focusable style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', columnGap: '15px' }}>

        {repoResults.map((result) => <RepoResultCard
        key={result.id}
        result={result}
        onActivate={() => {
          showModal(<RepoResultModal result={result} />);
        }} />)}

      </Focusable>
        
    </>
  );
};
  