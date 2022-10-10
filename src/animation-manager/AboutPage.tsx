import { FC } from "react";

export const AboutPage: FC = () => {
  return (
    // The outermost div is to push the content down into the visible area
    <div>
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
    </div>
  );
};
