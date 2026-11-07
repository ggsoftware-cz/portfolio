// Repack Shopify's CC BY 4.0 sample with 1024px JPEG textures. Geometry and
// material variants remain unchanged. Usage: node scripts/prepare-shift-model.mjs source.glb
import fs from 'node:fs/promises';
import sharp from 'sharp';
const source = await fs.readFile(process.argv[2]);
const jsonLength = source.readUInt32LE(12);
const gltf = JSON.parse(source.subarray(20, 20 + jsonLength).toString());
const binary = source.subarray(28 + jsonLength);
const chunks = [];
let offset = 0;
for (let i = 0; i < gltf.bufferViews.length; i++) {
  const view = gltf.bufferViews[i];
  let chunk = binary.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength);
  if (gltf.images.some(image => image.bufferView === i)) chunk = await sharp(chunk).resize({width:1024, height:1024, fit:'inside', withoutEnlargement:true}).jpeg({quality:85}).toBuffer();
  view.byteOffset = offset;
  view.byteLength = chunk.length;
  const padded = Buffer.alloc(Math.ceil(chunk.length / 4) * 4);
  chunk.copy(padded);
  chunks.push(padded);
  offset += padded.length;
}
gltf.buffers[0].byteLength = offset;
gltf.asset.extras = {...gltf.asset.extras, attribution:'Materials Variants Shoe © 2021 Shopify. CC BY 4.0. Textures resized and recompressed for the Shift demo.'};
const json = Buffer.from(JSON.stringify(gltf));
const paddedJson = Buffer.alloc(Math.ceil(json.length / 4) * 4, 0x20);
json.copy(paddedJson);
const header = Buffer.alloc(20);
header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4);
header.writeUInt32LE(28 + paddedJson.length + offset, 8);
header.writeUInt32LE(paddedJson.length, 12); header.writeUInt32LE(0x4e4f534a, 16);
const binaryHeader = Buffer.alloc(8);
binaryHeader.writeUInt32LE(offset, 0); binaryHeader.writeUInt32LE(0x004e4942, 4);
await fs.writeFile('public/templates/shift/sneaker.glb', Buffer.concat([header,paddedJson,binaryHeader,...chunks]));
console.log(`${source.length} → ${28 + paddedJson.length + offset} bytes`);
