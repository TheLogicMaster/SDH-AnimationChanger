import {
  useEffect,
  useState,
  FC,
  FormEvent,
  useRef,
  useReducer
} from 'react';

import {
  Focusable,
  PanelSectionRow,
  Dropdown,
  DropdownOption,
  showModal,
  Spinner,
  TextField,
  DialogButton
} from 'decky-frontend-lib';

import RepoResultCard from '../components/RepoResultCard';
import RepoResultModal from '../components/RepoResultModal';

import { RepoSort } from '../types/animation';

import { useAnimationContext } from '../state';

export const AnimationBrowserPage: FC = () => {
  
  const { searchRepo, repoResults, repoSort, setRepoSort, downloadAnimation } = useAnimationContext();
  
  const [ query, setQuery ] = useState<string>('');
  const [ loading, setLoading ] = useState(repoResults.length === 0);
  const [ filteredResults, setFilteredResults ] = useState(repoResults);
  const [ ignored, forceUpdate ] = useReducer(x => x + 1, 0);
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

    // Filter the results based on the query
    if(query && query.length > 0) {
      filtered = filtered.filter((result) => {
        return result.name.toLowerCase().includes(query.toLowerCase());
      });
    }

    // Sort based on the dropdown
    switch(repoSort){
      case RepoSort.Newest:
        filtered = filtered.sort((a, b) => b.moment_date.diff(a.moment_date));
        break;
      case RepoSort.Oldest:
        filtered = filtered.sort((a, b) => a.moment_date.diff(b.moment_date));
        break;
      case RepoSort.Alpha:
        filtered = filtered.sort((a, b) => {
          if(a.name < b.name) return -1;
          if(a.name > b.name) return 1;
          return 0;
        });
        break;
      case RepoSort.Likes:
        filtered = filtered.sort((a, b) => b.likes - a.likes);
        break;
      case RepoSort.Downloads:
        filtered = filtered.sort((a, b) => b.downloads - a.downloads);
        break;
    }

    setFilteredResults(filtered);
    forceUpdate();
    
  }, [query, loading, repoSort]);

  const sortOptions: DropdownOption[] = [
    {
      label: 'Newest',
      data: RepoSort.Newest
    },
    {
      label: 'Oldest',
      data: RepoSort.Oldest
    },
    {
      label: 'Alphbetical',
      data: RepoSort.Alpha
    },
    {
      label: 'Most Popular',
      data: RepoSort.Downloads
    },
    {
      label: 'Most Liked',
      data: RepoSort.Likes
    }
  ];

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

        <div style={{marginRight: '15px'}}>
          <Dropdown
          rgOptions={sortOptions}
          selectedOption={repoSort}
          onChange={(data) => {
            setRepoSort(data.data);
          }}
          />
        </div>

        {/* Hacky hack… for some reason onClick isn't working here?? */}
        <DialogButton
        style={{flex: 0}}
        onButtonUp={(e) => { if(e.detail.button === 1) reload(); }}
        onMouseUp={reload}>
          Reload
        </DialogButton>

      </Focusable>
      
      <Focusable style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridAutoRows: '1fr', columnGap: '15px' }}>

        {filteredResults.map((result, index) => <RepoResultCard
        key={`${result.id}-${index}`}
        result={result}
        onActivate={() => {
          showModal(
            <RepoResultModal
            onDownloadClick={async () => { return downloadAnimation(result.id) }}
            result={result} />
          );
        }} />)}

      </Focusable>
        
    </>
  );
};
  