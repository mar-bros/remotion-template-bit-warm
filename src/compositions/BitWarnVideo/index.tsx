import React from "react";
import { Audio, Sequence, useVideoConfig, staticFile, useCurrentFrame, interpolate } from "remotion";
import type { BitWarnConfig, ResolvedSubtitle } from "../../types/config";
import { Background } from "../../components/Background";
import { SubtitleCard } from "../../components/SubtitleCard";
import { BottomBar } from "../../components/BottomBar";
import { EndCredits } from "../../components/EndCredits";
import { buildTimeline, getTotalFrames } from "../../utils/timing";

interface BitWarnVideoProps extends BitWarnConfig {
  /** Pre-computed audio durations: { [audioSrc]: durationSeconds } */
  audioDurations: Record<string, number>;
}

export const BitWarnVideo: React.FC<BitWarnVideoProps> = (props) => {
  const { fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();

  const {
    background,
    bgMusic,
    narration,
    subtitleStyle,
    subtitles,
    branding,
    endCredits,
    audioDurations,
  } = props;

  // ── Build subtitle timeline ──────────────────────────────────────────────────
  const resolved: ResolvedSubtitle[] = buildTimeline(
    subtitles,
    audioDurations,
    fps
  );

  const totalFrames = getTotalFrames(resolved, endCredits.duration, fps);
  const creditsStartFrame = totalFrames - Math.round(endCredits.duration * fps);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      {/* ── Global background ──────────────────────────────────────────── */}
      <Background config={background} />

      {/* ── Background music tracks ─────────────────────────────────────── */}
      {bgMusic.map((track, i) => {
        const fadeOutFrames = Math.round(track.fadeOutDuration * fps);
        const volume = interpolate(
          frame,
          [durationInFrames - fadeOutFrames, durationInFrames],
          [track.volume, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );

        return (
          <Audio
            key={`bgmusic-${i}`}
            src={track.src.startsWith('http') ? track.src : staticFile(track.src)}
            volume={volume}
            loop={track.loop}
          />
        );
      })}

      {/* ── Global narration (plays from start throughout) ───────────────── */}
      {narration && (
        <Audio
          src={narration.src.startsWith('http') ? narration.src : staticFile(narration.src)}
          volume={narration.volume}
        />
      )}

      {/* ── Subtitle sequences ───────────────────────────────────────────── */}
      {resolved.map((subtitle) => {
        const mergedStyle = { ...subtitleStyle, ...(subtitle.style ?? {}) };

        return (
          <Sequence
            key={subtitle.id}
            from={subtitle.from}
            durationInFrames={subtitle.durationInFrames}
            layout="none"
          >
            {/* Per-subtitle background override */}
            {subtitle.background && (
              <Background config={subtitle.background} />
            )}

            {/* Per-subtitle TTS audio */}
            {subtitle.audio && (
              <Audio src={subtitle.audio.startsWith('http') ? subtitle.audio : staticFile(subtitle.audio)} volume={1} />
            )}

            {/* Subtitle card */}
            <SubtitleCard
              zh={subtitle.zh}
              en={subtitle.en}
              style={mergedStyle}
            />
          </Sequence>
        );
      })}

      {/* ── Bottom bar (always on top) ───────────────────────────────────── */}
      <BottomBar branding={branding} />

      {/* ── End credits ─────────────────────────────────────────────────── */}
      {endCredits.items.length > 0 && (
        <EndCredits config={endCredits} startFrame={creditsStartFrame} />
      )}
    </div>
  );
};
