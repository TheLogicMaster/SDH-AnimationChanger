import { useEffect, FC } from "react";
import { useAnimationContext } from "../state";
import { Focusable } from "decky-frontend-lib";

import RepoResultCard from '../components/RepoResultCard';
import RepoResultModal from '../components/RepoResultModal';

export const InstalledAnimationsPage: FC = () => {
  
  const { downloadedAnimations } = useAnimationContext();

  return (
    <div>

      {downloadedAnimations.length > 0 && <>
        <h2 style={{ fontWeight: "bold", fontSize: "1.5em", marginBottom: "0px" }}>
          Downloaded Animations
        </h2>

        <Focusable style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridAutoRows: '1fr', columnGap: '15px' }}>

          {downloadedAnimations.map((result, index) => <RepoResultCard
          key={`${result.id}-${index}`}
          result={result}
          onActivate={() => {
          }} />)}

        </Focusable>
      </>}

    </div>
  );
};