import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadNotoSans } from "@remotion/google-fonts/NotoSansSC";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import type { SubtitleStyle } from "../types/config";

// Load fonts at module level — Remotion will wait until ready before rendering
const { fontFamily: zhFont } = loadNotoSans("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});

const { fontFamily: enFont } = loadInter("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
});

interface SubtitleCardProps {
  zh: string;
  en: string;
  style: SubtitleStyle;
}

export const SubtitleCard: React.FC<SubtitleCardProps> = ({ zh, en, style }) => {
  const frame = useCurrentFrame();

  // ── Fade animation (in only — let Sequence handle cut-off) ──────────────────
  const fadeInFrames = 8;
  const opacity = interpolate(frame, [0, fadeInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });

  // ── Slide animation (optional) ───────────────────────────────────────────────
  const translateY =
    style.animation === "slide"
      ? interpolate(frame, [0, fadeInFrames], [20, 0], {
          extrapolateRight: "clamp",
        })
      : 0;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        transform: `translateY(${translateY}px)`,
        // Padding to avoid overlap with BottomBar
        paddingBottom: "96px",
      }}
    >
      {/* Chinese line */}
      <p
        style={{
          fontFamily: zhFont,
          fontSize: style.zhFontSize,
          fontWeight: 700,
          color: style.color,
          margin: 0,
          lineHeight: 1.3,
          textAlign: "center",
          textShadow: "0 2px 24px rgba(0,0,0,0.8)",
          maxWidth: "80%",
          letterSpacing: "0.04em",
        }}
      >
        {zh}
      </p>

      {/* English line */}
      <p
        style={{
          fontFamily: enFont,
          fontSize: style.enFontSize,
          fontWeight: 400,
          color: `${style.color}cc`,
          margin: "12px 0 0",
          lineHeight: 1.5,
          textAlign: "center",
          textShadow: "0 2px 16px rgba(0,0,0,0.7)",
          maxWidth: "75%",
          letterSpacing: "0.02em",
        }}
      >
        {en}
      </p>
    </div>
  );
};
