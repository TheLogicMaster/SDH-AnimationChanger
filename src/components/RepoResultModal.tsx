import { FC } from 'react';
import { RepoResult } from '../types/animation';
import { Focusable, ModalRootProps } from 'decky-frontend-lib';
import EmptyModal from "./EmptyModal";

const RepoResultModal: FC<ModalRootProps & { result: RepoResult }> = ({ result, ...props }) => {

  return (
    <EmptyModal {...props}>
      <video style={{width: '100%', height: 'auto'}} poster={result.preview_image} autoPlay={true} controls={true}>
        <source src={result.preview_video} />
      </video>
      <h1>{result.name}</h1>
    </EmptyModal>
  )

}

export default RepoResultModal;