import { DialogButton, Router, Focusable } from "decky-frontend-lib";
import { FC } from "react";

export const AboutPage: FC = () => {
  return (
    <Focusable>
      <h2
        style={{ fontWeight: "bold", fontSize: "1.5em", marginBottom: "0px" }}
      >
        Animation Changer
      </h2>
      <p>
        For more information about Animation Changer including how to manually install animations, please see the README.
      </p>
      <DialogButton
      style={{width: 300}}
      onClick={() => {
        Router.NavigateToExternalWeb('https://github.com/TheLogicMaster/SDH-AnimationChanger/blob/main/README.md');
      }}
      >
        View README
      </DialogButton>
      <h2
        style={{ fontWeight: "bold", fontSize: "1.5em", marginBottom: "0px" }}
      >
        Developers
      </h2>
      <ul style={{ marginTop: "0px", marginBottom: "0px" }}>
        <li>
          <span>TheLogicMaster - github.com/TheLogicMaster</span>
        </li>
        <li>
          <span>steve228uk - github.com/steve228uk</span>
        </li>
      </ul>
      <h2
        style={{ fontWeight: "bold", fontSize: "1.5em", marginBottom: "0px" }}
      >
        Credits
      </h2>
      <ul style={{ marginTop: "0px", marginBottom: "0px" }}>
        <li>
          <span>Beebles: UI Elements - github.com/beebls</span>
        </li>
        <li>
          <span>Animations from steamdeckrepo.com</span>
        </li>
      </ul>
      <h2
        style={{ fontWeight: "bold", fontSize: "1.5em", marginBottom: "0px" }}
      >
        Support
      </h2>
      <span>
        See the Steam Deck Homebrew Discord server for support.
        <br />
        discord.gg/ZU74G2NJzk
      </span>
    </Focusable>
  );
};
