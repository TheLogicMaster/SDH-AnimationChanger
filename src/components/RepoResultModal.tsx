import { FC } from 'react';
import { Focusable, ModalRootProps, DialogButton, FocusRing } from 'decky-frontend-lib';
import EmptyModal from "./EmptyModal";
import RepoResult from '../models/RepoResult';

const RepoResultModal: FC<ModalRootProps & { result: RepoResult }> = ({ result, ...props }) => {

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
          disabled={result.downloaded}
          onClick={() => {
            // 
          }}
          >
            {(result.downloaded) ? 'Downloaded' : 'Download Animation'}
          </DialogButton>
        </div>
      </div>
    </EmptyModal>
  )

}

export default RepoResultModal;