import "./index.css";
import { Composition } from "remotion";
import type { CalculateMetadataFunction } from "remotion";
import { BitWarnVideo } from "./compositions/BitWarnVideo";
import { BitWarnConfigSchema, type BitWarnConfig } from "./types/config";
import { buildTimeline, getTotalFrames } from "./utils/timing";
import ep01 from "./data/ep01.json";

type BitWarnVideoProps = BitWarnConfig & { audioDurations: Record<string, number> };

const calculateMetadata: CalculateMetadataFunction<BitWarnVideoProps> = async ({
  props,
}) => {
  const config = BitWarnConfigSchema.parse(props);

  // Collect all audio srcs that need duration lookup
  const audioSrcs = config.subtitles
    .map((s) => s.audio)
    .filter((src): src is string => !!src);

  // Dynamically import getAudioDurationInSeconds
  const { getAudioDurationInSeconds } = await import("@remotion/media-utils");

  // Fetch durations in parallel
  const durations = await Promise.all(
    audioSrcs.map(async (src) => {
      try {
        const dur = await getAudioDurationInSeconds(src);
        return [src, dur] as const;
      } catch {
        console.warn(`[BitWarm] Could not read audio duration for: ${src}`);
        return [src, 3] as const;
      }
    })
  );

  const audioDurations = Object.fromEntries(durations);

  const resolved = buildTimeline(config.subtitles, audioDurations, config.meta.fps);
  const totalFrames = getTotalFrames(resolved, config.endCredits.duration, config.meta.fps);

  return {
    durationInFrames: Math.max(totalFrames, 1),
    fps: config.meta.fps,
    width: config.meta.width,
    height: config.meta.height,
    props: {
      ...config,
      audioDurations,
    } as BitWarnVideoProps,
  };
};

const defaultProps: BitWarnVideoProps = {
  ...(ep01 as unknown as BitWarnConfig),
  audioDurations: {},
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Composition
        id="BitWarnVideo"
        component={BitWarnVideo as any}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultProps as any}
        calculateMetadata={calculateMetadata as any}
      />
    </>
  );
};
