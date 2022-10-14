import { FC } from 'react';
import { Focusable } from 'decky-frontend-lib';
import { IRepoResult } from '../types/animation';
import { FaDownload, FaThumbsUp } from "react-icons/fa";

const RepoResultCard: FC<{ result: IRepoResult, onActivate: () => void }> = ({ result, onActivate }) => {

  return (      

    <div className='Panel' style={{
      margin: 0,
    }}>

      <div
      className="gamepadhomewhatsnew_OuterWrapper_3DpEz"
      style={{
        height: '317px'
      }}>
        
        <div className="gamepadhomewhatsnew_EventType_1f0dZ gamepadhomewhatsnew_EventType28_39b83">
          {result.target === 'boot' ? 'Boot' : 'Suspend'}
        </div>

        <Focusable
        focusWithinClassName='gpfocuswithin'
        className="gamepadhomewhatsnew_EventPreviewContainer_1ltOY Panel"
        onActivate={onActivate}
        style={{
          margin: 0,
          marginBottom: '15px'
        }}>
          
          <div className="gamepadhomewhatsnew_EventImageWrapper_XLJ9p">
            <img
              src={result.preview_image}
              style={{ width: '100%', height: '160px', objectFit: 'cover' }}
              className="gamepadhomewhatsnew_EventImage_116GS"/>
            <div className="gamepadhomewhatsnew_Darkener_1n_1X"></div>
            <div
            className="gamepadhomewhatsnew_EventSummary_UE_Ms"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              
              <FaDownload style={{marginRight: '5px'}} /> {result.downloads}
              <FaThumbsUp style={{marginLeft: '10px', marginRight: '5px'}} /> {result.likes}

            </div>
          </div>

          <div className="gamepadhomewhatsnew_EventInfo_6TGe7 partnereventdisplay_InLibraryView_3X6U9">
            <div className="partnereventdisplay_EventDetailTimeInfo_3Z41s">
              <Focusable>
                <div className="localdateandtime_RightSideTitles_3sPON">Updated</div>
                <div className="localdateandtime_ShortDateAndTime_4K3Bl">{result.relative_date}</div>
              </Focusable>
            </div>
            <div className="gamepadhomewhatsnew_Title_1QLHG">{result.name}</div>
            <div className="gamepadhomewhatsnew_GameIconAndName_1jXSh">
              <div className="gamepadhomewhatsnew_GameName_3H9W-">{result.author}</div>
            </div>
          </div>

        </Focusable>

      </div>

    </div>
  );

  }

  export default RepoResultCard;