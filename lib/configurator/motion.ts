/** Normalized progress is shared by the frame and its 3D contents. */
export function heroProgress(scroll: number, start: number, distance: number): number {
  if (!Number.isFinite(scroll) || !Number.isFinite(start) || !Number.isFinite(distance) || distance <= 0) return 0;
  return Math.min(1, Math.max(0, (scroll - start) / distance));
}

export function heroScene(progress: number) {
  // Recede as a single composition, then hold the inset before native scrolling
  // carries the complete scene out. There is no independent heading flight.
  const p = heroProgress(progress, 0, .82);
  const retreat = p * p * (3 - 2 * p);
  return {retreat, frameScale: 1 - .46 * retreat, typeTravel: retreat * 14};
}

export function heroPose(progress: number) {
  const {retreat} = heroScene(progress);
  return {yaw: -.3 * retreat, pitch: -.04 * retreat, roll: .06 * retreat, lift: 0, scale: 1};
}
