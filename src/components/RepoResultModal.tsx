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

        <div style={{flex: 1, paddingLeft: '15px'}}>
          <h2>{result.name}</h2>
          <DialogButton
          onClick={() => {
            // 
          }}
          >
            Download Animation
          </DialogButton>
        </div>
      </div>
    </EmptyModal>
  )

}

export default RepoResultModal;