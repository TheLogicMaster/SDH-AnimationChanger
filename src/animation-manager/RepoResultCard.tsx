import { FC } from 'react';
import { RepoResult } from '../types/animation';
import { Focusable } from 'decky-frontend-lib';

const RepoResultCard: FC<{ result: RepoResult }> = ({ result }) => {

  return (      

    <div className='Panel' style={{
      margin: 0,
      marginBottom: '15px'
    }}>

      <div
      className="gamepadhomewhatsnew_OuterWrapper_3DpEz"
      style={{
        height: '317px'
      }}>
        
        <div className="gamepadhomewhatsnew_EventType_1f0dZ gamepadhomewhatsnew_EventType28_39b83">
          Animation
        </div>

        <Focusable
        focusWithinClassName='gpfocuswithin'
        className="gamepadhomewhatsnew_EventPreviewContainer_1ltOY Panel"
        onActivate={() => { console.log('clicked') }}
        style={{
          margin: 0,
          marginBottom: '15px'
        }}>
          
          <div className="gamepadhomewhatsnew_EventImageWrapper_XLJ9p">
            <img
              src={result.thumbnail}
              style={{ maxWidth: '100%', height: 'auto', width: 'auto' }}
              className="gamepadhomewhatsnew_EventImage_116GS"/>
            <div className="gamepadhomewhatsnew_Darkener_1n_1X"></div>
            <div className="gamepadhomewhatsnew_EventSummary_UE_Ms">This is a test</div>
          </div>

          <div className="gamepadhomewhatsnew_EventInfo_6TGe7 partnereventdisplay_InLibraryView_3X6U9">
            <div className="partnereventdisplay_EventDetailTimeInfo_3Z41s">
              <Focusable>
                <div className="localdateandtime_RightSideTitles_3sPON">Likes</div>
                <div className="localdateandtime_ShortDateAndTime_4K3Bl">{result.likes}</div>
              </Focusable>
            </div>
            <div className="gamepadhomewhatsnew_Title_1QLHG">{result.title}</div>
            <div className="gamepadhomewhatsnew_GameIconAndName_1jXSh">
              <div
                className="libraryassetimage_Container_1R9r2 libraryassetimage_GreyBackground_2E7G8 gamepadhomewhatsnew_GameIcon_2RrB8">
                <img src={result.user.steam_avatar}
                  className="libraryassetimage_Image_24_Au libraryassetimage_Visibility_3d_bT libraryassetimage_Visible_yDr03"
                  alt={result.user.steam_name} />
              </div>
              <div className="gamepadhomewhatsnew_GameName_3H9W-">{result.user.steam_name}</div>
            </div>
          </div>

        </Focusable>

      </div>

    </div>
  );

  }

  export default RepoResultCard;