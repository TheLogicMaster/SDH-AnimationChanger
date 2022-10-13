import { useState, FC } from "react";
import { useAnimationContext } from "../state";
import { Focusable, showModal, ShowModalResult } from "decky-frontend-lib";

import RepoResultCard from '../components/RepoResultCard';
import RepoResultModal from '../components/RepoResultModal';

export const InstalledAnimationsPage: FC = () => {
  
  const { downloadedAnimations, deleteAnimation } = useAnimationContext();

  return (
    <div>

      {/* TODO: management of local animations? */}

      {downloadedAnimations.length > 0 && <>
        <h2>
          Downloaded Animations
        </h2>

        <Focusable style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridAutoRows: '1fr', columnGap: '15px' }}>

          {downloadedAnimations.map((result, index) => <RepoResultCard
          key={`${result.id}-${index}`}
          result={result}
          onActivate={async () => {

            const response = await showModal(
              <RepoResultModal
              result={result}
              isDownloaded={true}
              onDeleteClick={async () => {
                await deleteAnimation(result.id);
              }} />
            );
          }} />)}

        </Focusable>
      </>}

    </div>
  );
};