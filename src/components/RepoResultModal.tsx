import { FC, useState } from 'react';
import { Focusable, ModalRootProps, DialogButton, FocusRing } from 'decky-frontend-lib';
import EmptyModal from "./EmptyModal";
import RepoResult from '../models/RepoResult';

import { useAnimationContext } from '../state';

const RepoResultModal: FC<ModalRootProps & { result: RepoResult, onDownloadClick: () => void, isDownloaded: boolean }> = ({ result, onDownloadClick, isDownloaded, ...props }) => {

  const [ downloading, setDownloading ] = useState(false);
  const [ downloaded, setDownloaded ] = useState(isDownloaded);

  const download = async () => {
    setDownloading(true);
    await onDownloadClick();
    setDownloaded(true);
    setDownloading(false);
  }


  return (
    <EmptyModal {...props}>
      <div style={{display: 'flex', flexDirection: 'row'}}>
        <div style={{flex: 1}}>
          <video style={{width: '100%', height: 'auto'}} poster={result.preview_image} autoPlay={true} controls={true}>
            <source src={result.preview_video} />
          </video>
        </div>

        <div style={{display: 'flex', flex: 1, flexDirection: 'column', paddingLeft: '15px'}}>
          <div style={{flex: 1}}>
            <h3 style={{margin: 0}}>{result.name}</h3>
            <p>Uploaded by {result.author}</p>
          </div>
          
          <DialogButton
          disabled={downloaded || downloading}
          onClick={download}
          >
            {(downloaded) ? 'Downloaded' : (downloading) ? 'Downloading…' : 'Download Animation'}
          </DialogButton>
        </div>
      </div>
    </EmptyModal>
  )

}

export default RepoResultModal;