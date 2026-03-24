import type { Subtitle, ResolvedSubtitle } from "../types/config";

/**
 * Build a frame-accurate timeline for each subtitle.
 *
 * Resolution order per subtitle:
 *  1. If `startSec` + `endSec` are both set → use them directly.
 *  2. If `startSec` + `audio` → start at startSec, duration from audioDurations map.
 *  3. If only `audio` → auto-chain from previous end, duration from audioDurations map.
 *  4. If only `startSec` + `endSec` without audio → manual timing.
 *
 * @param subtitles  Raw subtitle list from config
 * @param audioDurations  Map of audio src → duration in seconds (from calculateMetadata)
 * @param fps  Frames per second
 */
export function buildTimeline(
  subtitles: Subtitle[],
  audioDurations: Record<string, number>,
  fps: number
): ResolvedSubtitle[] {
  let cursor = 0; // running frame cursor (auto-chain)

  return subtitles.map((subtitle) => {
    let fromFrame: number;
    let durationFrames: number;

    const hasAudio = !!subtitle.audio;
    const hasExplicitStart = subtitle.startSec != null;
    const hasExplicitEnd = subtitle.endSec != null;

    // ── Determine start frame ────────────────────────────────────────────────
    if (hasExplicitStart) {
      fromFrame = Math.round(subtitle.startSec! * fps);
    } else {
      fromFrame = cursor;
    }

    // ── Determine duration ───────────────────────────────────────────────────
    if (hasExplicitStart && hasExplicitEnd) {
      // Fully manual timing takes highest priority
      durationFrames = Math.round((subtitle.endSec! - subtitle.startSec!) * fps);
    } else if (hasAudio && subtitle.audio && audioDurations[subtitle.audio] != null) {
      durationFrames = Math.round(audioDurations[subtitle.audio] * fps);
    } else if (hasExplicitEnd && hasExplicitStart) {
      durationFrames = Math.round((subtitle.endSec! - subtitle.startSec!) * fps);
    } else {
      // Fallback: 3 second display if we have no other information
      durationFrames = Math.round(3 * fps);
      console.warn(
        `[BitWarm] Subtitle id=${subtitle.id} has no audio and no explicit timing. Defaulting to 3s.`
      );
    }

    const gapFrames = Math.round((subtitle.gapAfter ?? 0) * fps);

    // Advance cursor to the END of this subtitle + gap
    cursor = fromFrame + durationFrames + gapFrames;

    return {
      ...subtitle,
      from: fromFrame,
      durationInFrames: Math.max(1, durationFrames),
    };
  });
}

/**
 * Total composition duration in frames.
 * = last subtitle end + end credits duration
 */
export function getTotalFrames(
  resolvedSubtitles: ResolvedSubtitle[],
  endCreditsDuration: number,
  fps: number
): number {
  if (resolvedSubtitles.length === 0) return Math.round(endCreditsDuration * fps);

  const last = resolvedSubtitles[resolvedSubtitles.length - 1];
  const subtitleEnd = last.from + last.durationInFrames;
  return subtitleEnd + Math.round(endCreditsDuration * fps);
}
