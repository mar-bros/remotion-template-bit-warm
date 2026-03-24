import { z } from "zod";

// ─── Background ──────────────────────────────────────────────────────────────

export const BackgroundConfigSchema = z.object({
  type: z.enum(["gradient", "image", "video"]).default("gradient"),
  src: z.string().nullable().optional(),
  overlay: z.number().min(0).max(1).default(0),
});

export type BackgroundConfig = z.infer<typeof BackgroundConfigSchema>;

// ─── Audio ───────────────────────────────────────────────────────────────────

export const BgMusicSchema = z.object({
  src: z.string(),
  volume: z.number().min(0).max(1).default(0.15),
  loop: z.boolean().default(true),
});

export const NarrationSchema = z.object({
  src: z.string(),
  volume: z.number().min(0).max(1).default(1),
});

// ─── Subtitle Style ───────────────────────────────────────────────────────────

export const SubtitleStyleSchema = z.object({
  animation: z.enum(["fade", "slide"]).default("fade"),
  zhFontSize: z.number().default(56),
  enFontSize: z.number().default(32),
  color: z.string().default("#ffffff"),
});

export type SubtitleStyle = z.infer<typeof SubtitleStyleSchema>;

// ─── Subtitles ────────────────────────────────────────────────────────────────

export const SubtitleSchema = z.object({
  id: z.number(),
  zh: z.string(),
  en: z.string(),
  audio: z.string().nullable().optional(),
  /** Explicit start time in seconds. Auto-chained if omitted. */
  startSec: z.number().nullable().optional(),
  /** Explicit end time in seconds. Required when audio is null. */
  endSec: z.number().nullable().optional(),
  /** Pause (seconds) after this subtitle before the next begins */
  gapAfter: z.number().default(0),
  background: BackgroundConfigSchema.nullable().optional(),
  style: SubtitleStyleSchema.partial().optional(),
});

export type Subtitle = z.infer<typeof SubtitleSchema>;

// ─── Branding ────────────────────────────────────────────────────────────────

export const BrandingSchema = z.object({
  show: z.boolean().default(true),
  logo: z.string().nullable().optional(),
  copyright: z.string().default(""),
});

// ─── End Credits ──────────────────────────────────────────────────────────────

export const EndCreditsSchema = z.object({
  duration: z.number().default(5),
  items: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
    })
  ),
});

// ─── Meta ─────────────────────────────────────────────────────────────────────

export const MetaSchema = z.object({
  title: z.string().default("Bit Warm"),
  fps: z.number().int().default(30),
  width: z.number().int().default(1920),
  height: z.number().int().default(1080),
});

// ─── Root Config ─────────────────────────────────────────────────────────────

export const BitWarnConfigSchema = z.object({
  version: z.string().default("1.0"),
  meta: MetaSchema,
  background: BackgroundConfigSchema,
  bgMusic: z.array(BgMusicSchema).default([]),
  narration: NarrationSchema.nullable().optional(),
  subtitleStyle: SubtitleStyleSchema,
  subtitles: z.array(SubtitleSchema),
  branding: BrandingSchema,
  endCredits: EndCreditsSchema,
});

export type BitWarnConfig = z.infer<typeof BitWarnConfigSchema>;

/**
 * Resolved subtitle — includes computed timeline position.
 * Produced by buildTimeline() and passed to rendering components.
 */
export type ResolvedSubtitle = Subtitle & {
  from: number; // start frame
  durationInFrames: number;
};
