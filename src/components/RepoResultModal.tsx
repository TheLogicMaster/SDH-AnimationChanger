import { FC } from 'react';
import { RepoResult } from '../types/animation';
import { Focusable, ModalRootProps, DialogButton, FocusRing } from 'decky-frontend-lib';
import EmptyModal from "./EmptyModal";

const RepoResultModal: FC<ModalRootProps & { result: RepoResult }> = ({ result, ...props }) => {

  return (
    <EmptyModal {...props}>
      <div style={{display: 'flex', flexDirection: 'row'}}>
        <div style={{flex: 1}}>
          <video style={{width: '100%', height: 'auto'}} poster={result.thumbnail} autoPlay={true} controls={true}>
            <source src={result.video} />
          </video>
        </div>

        <div style={{flex: 1, paddingLeft: '15px'}}>
          <h2>{result.title}</h2>
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