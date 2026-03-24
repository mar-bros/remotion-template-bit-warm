import React from "react";
import { useCurrentFrame, interpolate, Img, staticFile } from "remotion";
import type { BrandingSchema } from "../types/config";
import { z } from "zod";

type BrandingConfig = z.infer<typeof BrandingSchema>;

interface BottomBarProps {
  branding: BrandingConfig;
}

export const BottomBar: React.FC<BottomBarProps> = ({ branding }) => {
  const frame = useCurrentFrame();

  if (!branding.show) return null;

  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 48px",
        opacity,
        background:
          "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.0) 100%)",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {branding.logo ? (
          <Img
            src={staticFile(branding.logo)}
            style={{ height: 36, objectFit: "contain" }}
          />
        ) : (
          // Text fallback when no logo file
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "rgba(255,255,255,0.9)",
              letterSpacing: "0.08em",
              fontFamily: "sans-serif",
              textTransform: "uppercase",
            }}
          >
            Bit Warm
          </span>
        )}
      </div>

      {/* Copyright */}
      {branding.copyright && (
        <span
          style={{
            fontSize: 18,
            color: "rgba(255,255,255,0.5)",
            fontFamily: "sans-serif",
            letterSpacing: "0.03em",
          }}
        >
          {branding.copyright}
        </span>
      )}
    </div>
  );
};
