import { useEffect } from 'react';
import { useNuiEvent } from '../../hooks/useNuiEvent';
import { fetchNui } from '../../utils/fetchNui';
import { isEnvBrowser } from '../../utils/misc';

const OFFSET_VAR = '--ox-progress-bottom';

/**
 * ox_inventory hotbar geometry (web/src/index.scss):
 * `.hotbar-container` is `bottom: 2vh`, slots are `$gridSize` (9.6vh),
 * and `.hotbar-row` scales from `center bottom`.
 */
export const HOTBAR_BOTTOM_VH = 2;
export const HOTBAR_SLOT_VH = 9.6;
export const HOTBAR_GAP_VH = 0.6;
const MIN_SCALE = 0.75;
const MAX_SCALE = 1.35;

export type HotbarLayout = {
  scale?: number;
  /** Pixels from the bottom of the screen to just above the hotbar. */
  bottom?: number | null;
  /** Inventory highlight as an "r, g, b" triplet. */
  highlight?: string | null;
  /** Slot background opacity (0.25–0.85). */
  opacity?: number | null;
};

/** Fallback clearance when the inventory has not measured the hotbar yet. */
export const hotbarClearance = (scale = 1) => {
  const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number(scale) || 1));
  return `${HOTBAR_BOTTOM_VH + HOTBAR_SLOT_VH * clamped + HOTBAR_GAP_VH}vh`;
};

export const resolveHotbarOffset = (data?: HotbarLayout | null) => {
  if (data && typeof data.bottom === 'number' && data.bottom > 0) {
    return `${Math.round(data.bottom)}px`;
  }

  return hotbarClearance(data?.scale);
};

let layoutRequested = false;

const applyHotbarOffset = (data?: HotbarLayout | null) => {
  const root = document.documentElement.style;
  // CSS variables so a scale or colour change does not re-render the bar and restart its animation.
  root.setProperty(OFFSET_VAR, resolveHotbarOffset(data));

  if (typeof data?.scale === 'number') {
    const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, data.scale));
    root.setProperty('--ox-hotbar-scale', String(scale));
  }

  if (typeof data?.highlight === 'string' && data.highlight) {
    root.setProperty('--ox-progress-highlight', data.highlight);
  }

  if (typeof data?.opacity === 'number') {
    root.setProperty('--ox-progress-alpha', String(data.opacity));
  }
};

/** Keep the progress UI parked just above the ox_inventory hotbar. */
export const useHotbarOffset = () => {
  useNuiEvent<HotbarLayout>('hotbarLayout', (data) => {
    applyHotbarOffset(data);
  });

  useEffect(() => {
    if (layoutRequested || isEnvBrowser()) return;

    layoutRequested = true;
    // Ask Lua for the last scale the inventory reported, in case this UI loaded late.
    fetchNui('progressReady').catch(() => undefined);
  }, []);
};
