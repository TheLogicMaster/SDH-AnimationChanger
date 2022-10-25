import { FC } from 'react';
import { Focusable, findModule } from 'decky-frontend-lib';
import { IRepoResult } from '../types/animation';
import { FaDownload, FaThumbsUp } from "react-icons/fa";
import ExtractedClasses from '../utils/ExtractedClasses';

const RepoResultCard: FC<{ result: IRepoResult, onActivate: () => void }> = ({ result, onActivate }) => {

  const {
    EventType,
    EventType28,
    OuterWrapper,
    EventPreviewContainer,
    EventImageWrapper,
    EventImage,
    Darkener,
    EventSummary,
    EventInfo,
    GameIconAndName,
    GameName,
    Title,
    RightSideTitles,
    ShortDateAndTime,
    EventDetailTimeInfo,
    InLibraryView
  } = ExtractedClasses.getInstance().found;

  return (      

    <div className='Panel' style={{
      margin: 0,
      minWidth: 0,
      overflow: 'hidden'
    }}>

      <div
      className={OuterWrapper}
      style={{
        height: '317px'
      }}>
        
        <div className={`${EventType} ${EventType28}`}>
          {result.target === 'boot' ? 'Boot' : 'Suspend'}
        </div>

        <Focusable
        focusWithinClassName='gpfocuswithin'
        className={`${EventPreviewContainer} Panel`}
        onActivate={onActivate}
        style={{
          margin: 0,
          marginBottom: '15px'
        }}>
          
          <div className={EventImageWrapper}>
            <img
            src={result.preview_image}
            style={{ width: '100%', height: '160px', objectFit: 'cover' }}
            className={EventImage}
            />
            <div className={Darkener}></div>
            <div
            className={EventSummary}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              
              <FaDownload style={{marginRight: '5px'}} /> {result.downloads}
              <FaThumbsUp style={{marginLeft: '10px', marginRight: '5px'}} /> {result.likes}

            </div>
          </div>

          <div className={`${EventInfo} ${InLibraryView}`}>
            <div className={EventDetailTimeInfo}>
              <Focusable>
                <div className={RightSideTitles}>Updated</div>
                <div className={ShortDateAndTime}>{result.relative_date}</div>
              </Focusable>
            </div>
            <div className={Title} style={{overflowWrap: 'break-word', wordWrap: 'break-word', width: '100%'}}>{result.name}</div>
            <div className={GameIconAndName}>
              <div className={GameName} style={{overflowWrap: 'break-word', wordWrap: 'break-word', width: '100%'}}>{result.author}</div>
            </div>
          </div>

        </Focusable>

      </div>

    </div>
  );

  }

  export default RepoResultCard;