import {
  useEffect,
  useState,
  FC,
  FormEvent,
  useRef
} from 'react';

import {
  Focusable,
  PanelSectionRow,
  Dropdown,
  showModal,
  Spinner,
  TextField,
  DialogButton
} from 'decky-frontend-lib';

import RepoResultCard from '../components/RepoResultCard';
import RepoResultModal from '../components/RepoResultModal';

import { useAnimationContext } from '../state';

export const AnimationBrowserPage: FC = () => {
  
  const { searchRepo, repoResults, searchTotal } = useAnimationContext();
  
  const [ query, setQuery ] = useState<string>('');
  const [ loading, setLoading ] = useState(repoResults.length === 0);
  const [ filteredResults, setFilteredResults ] = useState(repoResults);
  const searchField = useRef<any>();

  const loadResults = async () => {
    await searchRepo();
    setLoading(false);
  };

  const reload = async () => {
    if(loading) return;
    setLoading(true);
    setQuery('');
    await searchRepo(true);
    setLoading(false);
  }

  const search = (e: FormEvent) => {
    searchField.current?.element?.blur();
    e.preventDefault();
  }

  useEffect(() => {
    if(repoResults.length === 0) {
      loadResults();
    }
  }, []);

  useEffect(() => {
    
    if(!repoResults || loading) return;

    let filtered = repoResults;

    if(query && query.length > 0) {
      filtered = filtered.filter((result) => {
        return result.name.toLowerCase().includes(query.toLowerCase());
      });
    }

    setFilteredResults(filtered);
    
  }, [query, loading]);

  if(loading) {
    return (
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
        <Spinner width={32} height={32} />
      </div>
    );
  }

  return (
    <>
      <Focusable style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        margin: '15px 0 30px'
      }}>

        <form style={{flex: 1, marginRight: '30px'}} onSubmit={search}>
          <TextField
          onChange={({ target }) => { setQuery(target.value) }}
          placeholder='Search Animations…'
          // @ts-ignore
          ref={searchField}
          bShowClearAction={true}  />
        </form>

        {/* Hacky hack… for some reason onClick isn't working here?? */}
        <DialogButton
        style={{flex: 0}}
        onButtonUp={(e) => { if(e.detail.button === 1) reload(); }}
        onMouseUp={reload}>
          Reload
        </DialogButton>

      </Focusable>
      
      <Focusable style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridAutoRows: '1fr', columnGap: '15px' }}>

        {filteredResults.map((result) => <RepoResultCard
        key={result.id}
        result={result}
        onActivate={() => {
          showModal(<RepoResultModal result={result} />);
        }} />)}

      </Focusable>
        
    </>
  );
};
  