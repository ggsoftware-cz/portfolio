// Illustrative catalogue. No inventory, payment or order service is connected.
export const colorways = ['beach', 'midnight', 'street'] as const;
export type Colorway = typeof colorways[number];
// Original licensed colour plus two explicitly labelled concept tints.
export const productTints: Record<Colorway, string> = {beach: '#ffffff', midnight: '#a6c8f5', street: '#dfb5ad'};
export const shoeSizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'] as const;
export type BagLine = {colorway: Colorway; size: string; quantity: number};
export const demoPrice = 2490;
export const MAX_QUANTITY = 9;
export function addToBag(lines: BagLine[], colorway: Colorway, size: string): BagLine[] {
  if (!colorways.includes(colorway) || !shoeSizes.includes(size as typeof shoeSizes[number])) return lines;
  const exists = lines.some(line => line.colorway === colorway && line.size === size);
  return exists ? lines.map(line => line.colorway === colorway && line.size === size ? {...line, quantity: Math.min(MAX_QUANTITY, line.quantity + 1)} : line)
    : [...lines, {colorway, size, quantity: 1}];
}
export function changeQuantity(lines: BagLine[], colorway: Colorway, size: string, quantity: number): BagLine[] {
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > MAX_QUANTITY) return lines;
  return lines.flatMap(line => line.colorway === colorway && line.size === size ? quantity === 0 ? [] : [{...line, quantity}] : [line]);
}
export const bagQuantity = (lines: BagLine[]) => lines.reduce((total, line) => total + line.quantity, 0);
export const bagTotal = (lines: BagLine[]) => bagQuantity(lines) * demoPrice;
