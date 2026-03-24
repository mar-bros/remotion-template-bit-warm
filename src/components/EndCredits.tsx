import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { EndCreditsSchema } from "../types/config";
import { z } from "zod";

type EndCreditsConfig = z.infer<typeof EndCreditsSchema>;

interface EndCreditsProps {
  config: EndCreditsConfig;
  startFrame: number; // frame at which end credits begin
}

export const EndCredits: React.FC<EndCreditsProps> = ({ config, startFrame }) => {
  const frame = useCurrentFrame();

  // localFrame = how many frames into the end-credits segment we are
  const localFrame = frame - startFrame;
  if (localFrame < 0) return null;

  const backdropOpacity = interpolate(localFrame, [0, 20], [0, 0.85], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: `rgba(0,0,0,${backdropOpacity})`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        {config.items.map((item, i) => {
          // Each item staggers in 15 frames after the previous
          const staggerStart = i * 15;
          const itemOpacity = interpolate(
            localFrame,
            [staggerStart, staggerStart + 12],
            [0, 1],
            { extrapolateRight: "clamp" }
          );
          const itemY = interpolate(
            localFrame,
            [staggerStart, staggerStart + 12],
            [12, 0],
            { extrapolateRight: "clamp" }
          );

          return (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 16,
                opacity: itemOpacity,
                transform: `translateY(${itemY}px)`,
              }}
            >
              <span
                style={{
                  fontSize: 22,
                  color: "rgba(255,255,255,0.5)",
                  fontFamily: "sans-serif",
                  fontWeight: 400,
                  minWidth: 120,
                  textAlign: "right",
                }}
              >
                {item.label}
              </span>
              <span
                style={{
                  fontSize: 22,
                  color: "rgba(255,255,255,0.85)",
                  fontFamily: "sans-serif",
                  fontWeight: 500,
                }}
              >
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
