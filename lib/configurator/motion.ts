/** One deterministic pose per scroll position; no elapsed-time animation. */
export function heroProgress(scroll: number, start: number, distance: number): number {
  if (!Number.isFinite(scroll) || !Number.isFinite(start) || !Number.isFinite(distance) || distance <= 0) return 0;
  return Math.min(1, Math.max(0, (scroll - start) / distance));
}

export function heroPose(progress: number) {
  const p = heroProgress(progress, 0, 1);
  // Smooth at both ends, and exactly reversible when scrolling back up.
  const eased = p * p * (3 - 2 * p);
  return {yaw: eased * 2.15, pitch: -.12 * eased, roll: .28 * eased, lift: .08 * eased, scale: 1 + .08 * eased};
}
