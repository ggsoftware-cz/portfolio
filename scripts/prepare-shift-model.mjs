/**
 * Prepare one shoe from makoto's CC-BY-4.0 Air Jordan 1 model.
 * Original: https://sketchfab.com/3d-models/air-jordan-1-a4b434181fbb48008ad460722fd53725
 * Public licensed mirror: https://sceneview.github.io/models/platforms/air_jordan_1.glb
 * Usage: node scripts/prepare-shift-model.mjs source.glb [output.glb] [positive|negative]
 * Extracts complete triangles on one side of x=0, compacts every vertex
 * attribute and indices, preserves original materials/textures/attribution,
 * and centers the remaining shoe. No new geometry or texture alterations.
 */
import fs from "node:fs";
const [
  source,
  destination = "public/templates/shift/air-jordan-1.glb",
  side = "positive",
] = process.argv.slice(2);
if (!source || !["positive", "negative"].includes(side))
  throw new Error(
    "Usage: node scripts/prepare-shift-model.mjs source.glb [output.glb] [positive|negative]",
  );
const file = fs.readFileSync(source);
if (file.readUInt32LE(0) !== 0x46546c67 || file.readUInt32LE(4) !== 2)
  throw new Error("Expected GLB 2.0");
const jl = file.readUInt32LE(12),
  doc = JSON.parse(file.subarray(20, 20 + jl));
const originalBinary = file.subarray(
  28 + jl,
  28 + jl + file.readUInt32LE(20 + jl),
);
const oldViews = doc.bufferViews,
  oldAccessors = doc.accessors;
const dimensions = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16,
};
const byteSizes = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 };
const readers = {
  5120: "readInt8",
  5121: "readUInt8",
  5122: "readInt16LE",
  5123: "readUInt16LE",
  5125: "readUInt32LE",
  5126: "readFloatLE",
};
const chunks = [],
  views = [],
  accessors = [];
let byteOffset = 0,
  totalTriangles = 0;
function append(bytes, target) {
  const view = { buffer: 0, byteOffset, byteLength: bytes.length };
  if (target) view.target = target;
  views.push(view);
  chunks.push(bytes);
  byteOffset += bytes.length;
  const padding = (4 - (byteOffset % 4)) % 4;
  if (padding) {
    chunks.push(Buffer.alloc(padding));
    byteOffset += padding;
  }
  return views.length - 1;
}
function readAccessor(index) {
  const a = oldAccessors[index],
    v = oldViews[a.bufferView],
    size = byteSizes[a.componentType],
    components = dimensions[a.type];
  const stride = v.byteStride || components * size,
    start = (v.byteOffset || 0) + (a.byteOffset || 0);
  return {
    a,
    v,
    size,
    components,
    stride,
    start,
    at(i, c = 0) {
      return originalBinary[readers[a.componentType]](
        start + i * stride + c * size,
      );
    },
    bytes(i) {
      return originalBinary.subarray(
        start + i * stride,
        start + i * stride + components * size,
      );
    },
  };
}
for (const image of doc.images) {
  if (image.bufferView === undefined)
    throw new Error("Expected embedded texture");
  const v = oldViews[image.bufferView];
  image.bufferView = append(
    originalBinary.subarray(
      v.byteOffset || 0,
      (v.byteOffset || 0) + v.byteLength,
    ),
  );
}
const localPositions = new Map();
for (let mi = 0; mi < doc.meshes.length; mi++)
  for (const p of doc.meshes[mi].primitives) {
    if (p.mode !== undefined && p.mode !== 4)
      throw new Error("Expected triangles");
    const pos = readAccessor(p.attributes.POSITION),
      index = readAccessor(p.indices),
      retained = [],
      vertexMap = new Map(),
      oldIds = [];
    for (let i = 0; i < index.a.count; i += 3) {
      const triangle = [index.at(i), index.at(i + 1), index.at(i + 2)];
      const signs = triangle.map((v) => pos.at(v, 0) > 0);
      if (signs.some(Boolean) && !signs.every(Boolean))
        throw new Error(
          "A triangle crosses the extraction plane; cannot extract without cutting geometry",
        );
      const keep = side === "negative" ? !signs[0] : signs[0];
      if (!keep) continue;
      for (const old of triangle) {
        if (!vertexMap.has(old)) {
          vertexMap.set(old, oldIds.length);
          oldIds.push(old);
        }
        retained.push(vertexMap.get(old));
      }
    }
    const attributes = {};
    for (const [semantic, ai] of Object.entries(p.attributes)) {
      const old = readAccessor(ai),
        data = Buffer.concat(oldIds.map((i) => old.bytes(i)));
      const a = {
        ...old.a,
        bufferView: append(data, 34962),
        byteOffset: 0,
        count: oldIds.length,
      };
      delete a.sparse;
      delete a.min;
      delete a.max;
      if (semantic === "POSITION") {
        a.min = Array(3).fill(Infinity);
        a.max = Array(3).fill(-Infinity);
        const coords = [];
        for (const id of oldIds) {
          const q = [0, 1, 2].map((k) => old.at(id, k));
          coords.push(q);
          for (let k = 0; k < 3; k++) {
            a.min[k] = Math.min(a.min[k], q[k]);
            a.max[k] = Math.max(a.max[k], q[k]);
          }
        }
        localPositions.set(mi, coords);
      }
      attributes[semantic] = accessors.length;
      accessors.push(a);
    }
    const uint16 = oldIds.length <= 65535,
      data = Buffer.alloc(retained.length * (uint16 ? 2 : 4));
    for (let i = 0; i < retained.length; i++)
      data[uint16 ? "writeUInt16LE" : "writeUInt32LE"](
        retained[i],
        i * (uint16 ? 2 : 4),
      );
    const ai = accessors.length;
    accessors.push({
      bufferView: append(data, 34963),
      byteOffset: 0,
      componentType: uint16 ? 5123 : 5125,
      count: retained.length,
      type: "SCALAR",
      min: [0],
      max: [oldIds.length - 1],
    });
    p.attributes = attributes;
    p.indices = ai;
    totalTriangles += retained.length / 3;
  }
// Column-major transform math solely to center the existing hierarchy.
const identity = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
function multiply(a, b) {
  const r = Array(16).fill(0);
  for (let c = 0; c < 4; c++)
    for (let row = 0; row < 4; row++)
      for (let k = 0; k < 4; k++)
        r[c * 4 + row] += a[k * 4 + row] * b[c * 4 + k];
  return r;
}
function matrix(node) {
  if (node.matrix) return node.matrix;
  const [x, y, z, w] = node.rotation || [0, 0, 0, 1],
    [sx, sy, sz] = node.scale || [1, 1, 1],
    [tx, ty, tz] = node.translation || [0, 0, 0];
  return [
    (1 - 2 * (y * y + z * z)) * sx,
    2 * (x * y + z * w) * sx,
    2 * (x * z - y * w) * sx,
    0,
    2 * (x * y - z * w) * sy,
    (1 - 2 * (x * x + z * z)) * sy,
    2 * (y * z + x * w) * sy,
    0,
    2 * (x * z + y * w) * sz,
    2 * (y * z - x * w) * sz,
    (1 - 2 * (x * x + y * y)) * sz,
    0,
    tx,
    ty,
    tz,
    1,
  ];
}
const min = [Infinity, Infinity, Infinity],
  max = [-Infinity, -Infinity, -Infinity];
function walk(index, parent) {
  const node = doc.nodes[index],
    world = multiply(parent, matrix(node));
  if (node.mesh !== undefined)
    for (const p of localPositions.get(node.mesh)) {
      const q = [0, 1, 2].map(
        (i) =>
          world[i] * p[0] +
          world[4 + i] * p[1] +
          world[8 + i] * p[2] +
          world[12 + i],
      );
      for (let i = 0; i < 3; i++) {
        min[i] = Math.min(min[i], q[i]);
        max[i] = Math.max(max[i], q[i]);
      }
    }
  for (const child of node.children || []) walk(child, world);
}
const scene = doc.scenes[doc.scene || 0];
for (const root of scene.nodes) walk(root, identity());
const center = min.map((n, i) => (n + max[i]) / 2);
doc.nodes.push({
  name: "Single_shoe_centered",
  translation: center.map((x) => -x),
  children: scene.nodes,
});
scene.nodes = [doc.nodes.length - 1];
doc.bufferViews = views;
doc.accessors = accessors;
doc.buffers = [{ byteLength: byteOffset }];
doc.asset.extras = {
  ...doc.asset.extras,
  modifications:
    "Extracted one complete shoe from the original pair, compacted unchanged vertex attributes/indices and centered. Original materials and embedded JPEG textures preserved.",
  preparationScript: "scripts/prepare-shift-model.mjs",
};
const binary = Buffer.concat(chunks);
let json = Buffer.from(JSON.stringify(doc));
json = Buffer.concat([json, Buffer.alloc((4 - (json.length % 4)) % 4, 32)]);
const header = Buffer.alloc(20);
header.writeUInt32LE(0x46546c67);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(28 + json.length + binary.length, 8);
header.writeUInt32LE(json.length, 12);
header.writeUInt32LE(0x4e4f534a, 16);
const bh = Buffer.alloc(8);
bh.writeUInt32LE(binary.length);
bh.writeUInt32LE(0x004e4942, 4);
const output = Buffer.concat([header, json, bh, binary]);
fs.writeFileSync(destination, output);
const report = {
  source,
  destination,
  side,
  bytes: output.length,
  triangles: totalTriangles,
  materials: doc.materials.map((m) => m.name),
  originalBounds: { min, max },
  center,
  size: min.map((n, i) => max[i] - n),
  asset: doc.asset,
};
console.log(JSON.stringify(report, null, 2));
