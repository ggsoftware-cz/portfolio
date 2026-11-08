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

export function smoothProgress(progress: number) {
  const p = heroProgress(progress, 0, 1);
  return p * p * (3 - 2 * p);
}

/** A full turn ends at the poster's original angle, so the handoff is seamless. */
export function heroPose(progress: number, transfer = 0) {
  const {retreat} = heroScene(progress);
  const handoff = smoothProgress(transfer);
  const arc = Math.sin(handoff * Math.PI);
  return {yaw: -.3 * retreat * (1 - handoff) + Math.PI * 2 * handoff,
    pitch: -.04 * retreat * (1 - handoff) + .16 * arc,
    roll: .06 * retreat * (1 - handoff) - .12 * arc, lift: 0, scale: 1};
}
