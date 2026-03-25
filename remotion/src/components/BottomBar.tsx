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
        height: 120, // Increased height for larger logo
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 48px",
        opacity,
        background:
          "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.0) 100%)",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {branding.logo ? (
          <Img
            src={staticFile(branding.logo)}
            style={{
              height: 128,
              width: 128,
              objectFit: "cover",
              borderRadius: 36, // 圆角
              boxShadow: "0 8px 32px rgba(0,0,0,0.6), inset 0 2px 0 rgba(255,255,255,0.2)", // 质感阴影与高光
              border: "1px solid rgba(255,255,255,0.15)", // 边缘纹理
              background: "#111" // 防止透明 PNG 出问题
            }}
          />
        ) : (
          // Text fallback when no logo file
          <span
            style={{
              fontSize: 22,
              color: "rgba(255,255,255,0.5)",
              fontFamily: "sans-serif",
              letterSpacing: "0.03em"
            }}
          >
            Mar Bro ™
          </span>
        )}
      </div>

      {/* Copyright */}
      {branding.copyright && (
        <span
          style={{
            fontSize: 22,
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
