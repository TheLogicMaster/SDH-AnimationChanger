import { FC, useState } from 'react';
import { ModalRoot, ModalRootProps, DialogButton } from 'decky-frontend-lib';
import RepoResult from '../models/RepoResult';
import ExtractedClasses from '../utils/ExtractedClasses';

const RepoResultModal: FC<ModalRootProps & {
  result: RepoResult,
  onDownloadClick?: () => void,
  isDownloaded: boolean,
  onDeleteClick?: () => void
}> = ({ result, onDownloadClick, isDownloaded, onDeleteClick, ...props }) => {

  const [ downloading, setDownloading ] = useState(false);
  const [ downloaded, setDownloaded ] = useState(isDownloaded);

  const download = async () => {
    setDownloading(true);
    await onDownloadClick?.();
    setDownloaded(true);
    setDownloading(false);
  }

  const deleteAnimation = async () => {
    await onDeleteClick?.();
    props.closeModal?.();
  }

  const {
    GameIconAndName,
    GameName
  } = ExtractedClasses.getInstance().found;

  return (
    <ModalRoot {...props}>
      <div style={{display: 'flex', flexDirection: 'row'}}>

        <div style={{width: '50%'}}>
          <video style={{width: '100%', height: 'auto'}} poster={result.preview_image} autoPlay={true} controls={true}>
            <source src={result.preview_video} type="video/webm" />
            <source src={result.download_url} type="video/webm" />
          </video>
        </div>

        <div style={{display: 'flex', width: '50%', flexDirection: 'column', paddingLeft: '15px'}}>
          <div style={{flex: 1}}>
            <h3 style={{margin: 0}}>{result.name}</h3>
            <div className={GameIconAndName}>
              <div className={GameName}>Uploaded by {result.author}</div>
            </div>
            <p style={{overflowWrap: 'break-word', wordWrap: 'break-word', fontSize: '0.8em'}}>
              {result.description}
            </p>
          </div>

          {!onDeleteClick && <DialogButton
          disabled={downloaded || downloading}
          onClick={download}
          >
            {(downloaded) ? 'Downloaded' : (downloading) ? 'Downloading…' : 'Download Animation'}
          </DialogButton>}
          
          {onDeleteClick && <DialogButton
          style={{background: 'var(--gpColor-Red)', color: '#fff'}}
          onClick={deleteAnimation}
          >
            Delete Animation
          </DialogButton>}
        </div>
      </div>
    </ModalRoot>
  )

}

export default RepoResultModal;