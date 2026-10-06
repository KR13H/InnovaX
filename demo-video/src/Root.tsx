import React from "react";
import { AbsoluteFill, Composition, Sequence, Still } from "remotion";
import { Background, SceneFade } from "./components/ui";
import { FPS, SCENES, TOTAL_FRAMES, sec } from "./config";
import { Closing } from "./scenes/Closing";
import { Hook } from "./scenes/Hook";
import { Intro } from "./scenes/Intro";
import { Model } from "./scenes/Model";
import { Progress } from "./scenes/Progress";
import { Results } from "./scenes/Results";
import { Tech } from "./scenes/Tech";
import { Upload } from "./scenes/Upload";
import { Thumbnail } from "./Thumbnail";

const ORDER: [keyof typeof SCENES, React.FC][] = [
  ["hook", Hook],
  ["intro", Intro],
  ["upload", Upload],
  ["model", Model],
  ["results", Results],
  ["progress", Progress],
  ["tech", Tech],
  ["closing", Closing],
];

export const Demo: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{ background: "#0a0e14" }}>
      <Background />
      {ORDER.map(([key, Scene], i) => {
        const duration = sec(SCENES[key]);
        const start = from;
        from += duration;
        return (
          <Sequence key={key} from={start} durationInFrames={duration} name={key}>
            <SceneFade fadeIn={i === 0 ? 0 : 12} fadeOut={i === ORDER.length - 1 ? 24 : 12}>
              <Scene />
            </SceneFade>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ShadowAthleteDemo" component={Demo} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} />
    <Still id="Thumbnail" component={Thumbnail} width={1920} height={1080} />
  </>
);
