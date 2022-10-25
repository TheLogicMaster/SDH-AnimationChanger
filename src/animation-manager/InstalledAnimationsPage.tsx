import { useState, useEffect, useRef, FC, FormEvent } from "react";
import { useAnimationContext } from "../state";
import { Focusable, showModal, TextField, Dropdown } from "decky-frontend-lib";
import { RepoSort, TargetType, sortOptions, targetOptions } from '../types/animation';

import RepoResultCard from '../components/RepoResultCard';
import RepoResultModal from '../components/RepoResultModal';

export const InstalledAnimationsPage: FC = () => {
  
  const searchField = useRef<any>();

  const { downloadedAnimations, deleteAnimation } = useAnimationContext();
  const [ query, setQuery ] = useState<string>('');
  const [ targetType, setTargetType ] = useState(TargetType.All);
  const [ sort, setSort ] = useState(RepoSort.Alpha);
  const [ filteredAnimations, setFilteredAnimations ] = useState(downloadedAnimations);

  const search = (e: FormEvent) => {
    searchField.current?.element?.blur();
    e.preventDefault();
  }

  useEffect(() => {

    let filtered = downloadedAnimations;

    // Filter based on the target type

    switch(targetType) {
      case TargetType.Boot:
        filtered = filtered.filter((result) => result.target == 'boot');
        break;
      case TargetType.Suspend:
        filtered = filtered.filter((result) => result.target == 'suspend');
        break;
    }

    // Filter the results based on the query
    if(query && query.length > 0) {
      filtered = filtered.filter((result) => {
        return result.name.toLowerCase().includes(query.toLowerCase());
      });
    }

    // Sort based on the dropdown
    switch(sort){
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

    setFilteredAnimations(filtered);

  }, [downloadedAnimations, query, sort, targetType]);


  if(downloadedAnimations.length === 0) {
    return (
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
        <h2>
          No Animations Downloaded
        </h2>
      </div>
    );
  }

  return (
    <div>

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
          menuLabel='Sort'
          rgOptions={sortOptions}
          selectedOption={sort}
          onChange={(data) => {
            setSort(data.data);
          }}
          />
        </div>

        <div style={{marginRight: '15px'}}>
          <Dropdown
          menuLabel='Animation Type'
          rgOptions={targetOptions}
          selectedOption={targetType}
          onChange={(data) => {
            setTargetType(data.data);
          }}
          />
        </div>
      
      </Focusable>

      <Focusable style={{ minWidth: 0, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gridAutoRows: '1fr', columnGap: '15px' }}>

        {filteredAnimations.map((result, index) => <RepoResultCard
        key={`${result.id}-${index}`}
        result={result}
        onActivate={async () => {
          showModal(
            <RepoResultModal
            result={result}
            isDownloaded={true}
            onDeleteClick={async () => {
              await deleteAnimation(result.id);
            }} />,
            window
          );
        }} />)}

      </Focusable>

    </div>
  );
};