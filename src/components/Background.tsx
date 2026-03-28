import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Img, Video, staticFile } from "remotion";
import type { BackgroundConfig } from "../types/config";

// ── Animated gradient background ─────────────────────────────────────────────

const GradientBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slow color shift and movement over 20 seconds loop
  const duration = 20 * fps;
  const loopFrame = frame % duration;
  const t = loopFrame / fps;

  // Animate hues to shift back and forth (Cool tech feel: Blue, Cyan, Emerald)
  const hue1 = interpolate(t, [0, 10, 20], [200, 220, 200]);
  const hue2 = interpolate(t, [0, 10, 20], [170, 190, 170]);
  const hue3 = interpolate(t, [0, 10, 20], [140, 160, 140]);

  // Animate positions for subtle drifting
  const posX1 = interpolate(t, [0, 10, 20], [20, 80, 20]);
  const posY1 = interpolate(t, [0, 10, 20], [30, 70, 30]);

  const posX2 = interpolate(t, [0, 10, 20], [80, 20, 80]);
  const posY2 = interpolate(t, [0, 10, 20], [70, 30, 70]);

  const posX3 = interpolate(t, [0, 10, 20], [50, 50, 50]);
  const posY3 = interpolate(t, [0, 10, 20], [10, 90, 10]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `
          radial-gradient(circle at ${posX1}% ${posY1}%, hsl(${hue1}, 50%, 15%) 0%, transparent 60%),
          radial-gradient(circle at ${posX2}% ${posY2}%, hsl(${hue2}, 40%, 12%) 0%, transparent 70%),
          radial-gradient(circle at ${posX3}% ${posY3}%, hsl(${hue3}, 50%, 10%) 0%, transparent 80%),
          linear-gradient(160deg, hsl(210, 30%, 5%) 0%, hsl(230, 30%, 3%) 100%)
        `,
      }}
    />
  );
};

// ── Main component ────────────────────────────────────────────────────────────

interface BackgroundProps {
  config: BackgroundConfig;
}

export const Background: React.FC<BackgroundProps> = ({ config }) => {
  const { width, height } = useVideoConfig();

  const overlayOpacity = config.overlay ?? 0;

  const overlayStyle: React.CSSProperties = overlayOpacity > 0
    ? {
      position: "absolute",
      inset: 0,
      background: `rgba(0,0,0,${overlayOpacity})`,
    }
    : {};

  if (config.type === "gradient" || !config.src) {
    return (
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <GradientBackground />
      </div>
    );
  }

  if (config.type === "image" && config.src) {
    return (
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <Img
          src={config.src.startsWith('http') ? config.src : staticFile(config.src)}
          style={{
            width,
            height,
            objectFit: "cover"
          }}
        />
        {overlayOpacity > 0 && <div style={overlayStyle} />}
      </div>
    );
  }

  if (config.type === "video" && config.src) {
    return (
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <Video
          src={config.src.startsWith('http') ? config.src : staticFile(config.src)}
          style={{ width, height, objectFit: "cover" }}
          loop
        />
        {overlayOpacity > 0 && <div style={overlayStyle} />}
      </div>
    );
  }

  // Fallback
  return (
    <div style={{ position: "absolute", inset: 0, background: "#050507" }} />
  );
};
