import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Img, Video, staticFile } from "remotion";
import type { BackgroundConfig } from "../types/config";

// ── Animated gradient background ─────────────────────────────────────────────

const GradientBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slow colour shift over ~30 seconds
  const t = (frame / fps) % 30;
  const hue1 = interpolate(t, [0, 30], [220, 260]);
  const hue2 = interpolate(t, [0, 30], [260, 300]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `
          radial-gradient(ellipse at 30% 50%, hsl(${hue1},30%,8%) 0%, transparent 60%),
          radial-gradient(ellipse at 70% 50%, hsl(${hue2},25%,6%) 0%, transparent 60%),
          linear-gradient(160deg, hsl(230,20%,5%) 0%, hsl(250,15%,3%) 100%)
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
  const frame = useCurrentFrame();

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
          src={staticFile(config.src)}
          style={{
            width,
            height,
            objectFit: "cover",
            opacity: interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" }),
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
          src={staticFile(config.src)}
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
