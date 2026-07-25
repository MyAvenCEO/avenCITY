/**
 * Turns HexWorld data into a clay Three.js island.
 *
 * The board is FLAT and reads as ONE CONTINUOUS LANDSCAPE: every tile's top
 * is a finely tessellated disc whose vertex colors come from a smooth
 * CROSS-TILE COLOR FIELD — each vertex blends its own tile's biome color
 * with the neighbouring tiles' colors (inverse-distance weighting), so
 * terrain melts across hex borders instead of stopping at them. Water
 * contributes "wetness" to the same field, and a sandy shore band emerges
 * automatically wherever wetness crosses ~50% — shorelines flow around the
 * lake and along the entire coast, ignoring tile boundaries.
 */
import * as THREE from 'three';
import { AXIAL_DIRS, key, type BiomeId, type HexTile, type HexWorld } from '../hexmap';
import { makeRng, type Rng } from '../rng';
import { blobTree, cactus, flower, pebble, peak, pine, puffTree, rock, tuft } from './decorations';

const HEX_RADIUS = 1.0; // flush — tiles form one continuous ground
const HEX_HEIGHT = 0.5; // uniform — the board is flat
const SEA_HEIGHT = 0.38; // sea sits a step lower
const BEVEL = 0.05; // soft crease between tiles
const CLAY_SIDE = '#f5edda';
const SEA_SIDE = '#c9dfda'; // sea prisms blend with the water, no hard grid
const SHORE = '#ecdcae';
const SEA_TOP = '#7ec4d2';

interface BiomeSpec {
	top: string;
	/** decorations per full hex (halved on split hexes) */
	density: [number, number];
	deco: (rng: Rng) => THREE.Group;
}

const BIOMES: Record<BiomeId, BiomeSpec> = {
	MEADOW: {
		top: '#9fd67f',
		density: [3, 7],
		deco: (rng) => (rng.chance(0.2) ? flower(rng) : rng.chance(0.12) ? blobTree(rng) : tuft(rng))
	},
	FOREST: {
		top: '#77bd62',
		density: [4, 8],
		deco: (rng) => (rng.chance(0.55) ? pine(rng) : blobTree(rng))
	},
	MOUNTAIN: {
		top: '#b3ac9f',
		density: [1, 2],
		deco: (rng) => (rng.chance(0.7) ? peak(rng) : rock(rng, 1.4))
	},
	DUNES: {
		top: '#f0d99e',
		density: [1, 3],
		deco: (rng) => (rng.chance(0.45) ? puffTree(rng) : rng.chance(0.5) ? cactus(rng) : pebble(rng))
	},
	RIVER: {
		top: '#54c6dc',
		density: [0, 2],
		deco: (rng) => pebble(rng)
	}
};

function hexShape(radius: number): THREE.Shape {
	const shape = new THREE.Shape();
	for (let i = 0; i < 6; i++) {
		const a = (Math.PI / 3) * i;
		const x = Math.cos(a) * radius;
		const y = Math.sin(a) * radius;
		if (i === 0) shape.moveTo(x, y);
		else shape.lineTo(x, y);
	}
	shape.closePath();
	return shape;
}

/** Rounded clay prism — extruded hex with multi-segment bevel, depth -> +Y. */
function hexPrism(radius: number, height: number): THREE.ExtrudeGeometry {
	const geo = new THREE.ExtrudeGeometry(hexShape(radius - BEVEL), {
		depth: height - BEVEL,
		bevelEnabled: true,
		bevelThickness: BEVEL,
		bevelSize: BEVEL,
		bevelSegments: 3
	});
	geo.rotateX(-Math.PI / 2);
	return geo;
}

/** Per-hex tiny hue drift — subtle, so neighbouring tiles stay continuous. */
function driftedColor(hex: string, rng: Rng): THREE.Color {
	const c = new THREE.Color(hex);
	c.offsetHSL(rng.jitter(0, 0.004), rng.jitter(0, 0.015), rng.jitter(0, 0.01));
	return c;
}

const smoothstep = (e0: number, e1: number, x: number): number => {
	const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
	return t * t * (3 - 2 * t);
};

/* ---------------------------------------------------------------------------
 * The cross-tile color field
 * ------------------------------------------------------------------------ */

interface TileStyle {
	tile: HexTile;
	colorA: THREE.Color;
	colorB: THREE.Color;
	waterA: number;
	waterB: number;
	dirX: number;
	dirZ: number;
}

/** Sample a single tile's intra-tile blend at a world position. */
function sampleTile(s: TileStyle, wx: number, wz: number, out: THREE.Color): number {
	const lx = wx - s.tile.x;
	const lz = wz - s.tile.z;
	const t = smoothstep(-0.38, 0.38, lx * s.dirX + lz * s.dirZ);
	out.copy(s.colorA).lerp(s.colorB, t);
	return s.waterA + (s.waterB - s.waterA) * t;
}

function buildStyles(world: HexWorld): Map<string, TileStyle> {
	const styles = new Map<string, TileStyle>();
	for (const tile of world.tiles) {
		const rng = makeRng(tile.seed ^ 0xc01);
		if (tile.kind === 'SEA') {
			const c = driftedColor(SEA_TOP, rng);
			styles.set(key(tile.q, tile.r), {
				tile,
				colorA: c,
				colorB: c,
				waterA: 1,
				waterB: 1,
				dirX: 1,
				dirZ: 0
			});
			continue;
		}
		const a = tile.biomes[0];
		const b = tile.biomes[1] ?? a;
		styles.set(key(tile.q, tile.r), {
			tile,
			colorA: driftedColor(BIOMES[a].top, rng),
			colorB: driftedColor(BIOMES[b].top, rng),
			waterA: a === 'RIVER' ? 1 : 0,
			waterB: b === 'RIVER' ? 1 : 0,
			dirX: Math.cos(tile.splitDir),
			dirZ: Math.sin(tile.splitDir)
		});
	}
	return styles;
}

/**
 * Field color at a world position: inverse-distance blend of this tile and
 * its 6 neighbours. At a border midpoint the two tiles weigh 50/50 —
 * perfectly continuous terrain. Wetness rides the same blend; the sandy
 * shore appears wherever it passes through ~0.5.
 */
function makeFieldSampler(styles: Map<string, TileStyle>, shoreColor: THREE.Color) {
	const scratch = new THREE.Color();
	return (tile: HexTile, wx: number, wz: number, out: THREE.Color): void => {
		let sumW = 0;
		let water = 0;
		out.setRGB(0, 0, 0);
		const consider = (s: TileStyle | undefined): void => {
			if (!s) return;
			const dx = wx - s.tile.x;
			const dz = wz - s.tile.z;
			const d = Math.sqrt(dx * dx + dz * dz);
			const w = 1 / Math.pow(d + 0.12, 3);
			const wet = sampleTile(s, wx, wz, scratch);
			out.r += scratch.r * w;
			out.g += scratch.g * w;
			out.b += scratch.b * w;
			water += wet * w;
			sumW += w;
		};
		consider(styles.get(key(tile.q, tile.r)));
		for (const [dq, dr] of AXIAL_DIRS) consider(styles.get(key(tile.q + dq, tile.r + dr)));
		out.multiplyScalar(1 / sumW);
		water /= sumW;

		// the shore: a soft sandy band where land turns to water
		const shoreW = Math.exp(-(((water - 0.5) / 0.16) ** 2));
		out.lerp(shoreColor, shoreW * 0.85);
	};
}

/* ---------------------------------------------------------------------------
 * Meshes
 * ------------------------------------------------------------------------ */

type FieldSampler = ReturnType<typeof makeFieldSampler>;

/** Finely tessellated top disc, vertex-colored by the cross-tile field. */
function buildTopDisc(tile: HexTile, rng: Rng, field: FieldSampler): THREE.Mesh {
	// meet the bevel exactly — the disc covers the flat top, the colored
	// bevel carries the terrain over the edge
	const radius = HEX_RADIUS - BEVEL + 0.005;
	const N = 8; // subdivisions per sector edge
	const positions: number[] = [];
	const colors: number[] = [];
	const scratch = new THREE.Color();

	const corner = (i: number): [number, number] => [
		Math.cos((Math.PI / 3) * i) * radius,
		Math.sin((Math.PI / 3) * i) * radius
	];

	const pushTri = (a: [number, number], b: [number, number], c: [number, number]): void => {
		// per-triangle micro lightness jitter: the hand-glazed clay patchiness
		const dl = rng.jitter(0, 0.004);
		// counter-clockwise in xz so normals face +Y
		for (const [px, pz] of [a, c, b]) {
			positions.push(px, 0, pz);
			field(tile, tile.x + px, tile.z + pz, scratch);
			scratch.offsetHSL(0, 0, dl);
			colors.push(scratch.r, scratch.g, scratch.b);
		}
	};

	for (let s = 0; s < 6; s++) {
		const A = corner(s);
		const B = corner((s + 1) % 6);
		const point = (i: number, j: number): [number, number] => {
			const u = i / N;
			const v = i === 0 ? 0 : j / i;
			return [u * (A[0] + v * (B[0] - A[0])), u * (A[1] + v * (B[1] - A[1]))];
		};
		for (let i = 0; i < N; i++) {
			for (let j = 0; j <= i; j++) {
				pushTri(point(i, j), point(i + 1, j), point(i + 1, j + 1));
				if (j < i) pushTri(point(i, j), point(i + 1, j + 1), point(i, j + 1));
			}
		}
	}

	const geo = new THREE.BufferGeometry();
	geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
	geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
	geo.computeVertexNormals();

	const isWet = tile.kind === 'SEA' || tile.biomes.includes('RIVER');
	const mesh = new THREE.Mesh(
		geo,
		new THREE.MeshStandardMaterial({
			vertexColors: true,
			roughness: isWet ? 0.5 : 0.88,
			metalness: 0
		})
	);
	mesh.position.y = (tile.kind === 'SEA' ? SEA_HEIGHT : HEX_HEIGHT) + 0.004;
	mesh.receiveShadow = true;
	return mesh;
}

function placeDecorations(tile: HexTile, rng: Rng, group: THREE.Group): void {
	const halves: Array<{ biome: BiomeId; sign: -1 | 1 | 0 }> =
		tile.biomes.length === 2
			? [
					{ biome: tile.biomes[0], sign: -1 },
					{ biome: tile.biomes[1], sign: 1 }
				]
			: [{ biome: tile.biomes[0], sign: 0 }];

	const dirX = Math.cos(tile.splitDir);
	const dirZ = Math.sin(tile.splitDir);

	for (const half of halves) {
		const spec = BIOMES[half.biome];
		let count = rng.int(spec.density[0], spec.density[1]);
		if (tile.biomes.length === 2) count = Math.max(1, Math.round(count / 2));

		for (let i = 0; i < count; i++) {
			let px = 0;
			let pz = 0;
			let ok = false;
			for (let tries = 0; tries < 14 && !ok; tries++) {
				const a = rng.range(0, Math.PI * 2);
				const d = Math.sqrt(rng.next()) * HEX_RADIUS * 0.66;
				px = Math.cos(a) * d;
				pz = Math.sin(a) * d;
				const side = px * dirX + pz * dirZ;
				// keep decorations clear of the transition band
				ok = half.sign === 0 || (half.sign === 1 ? side > 0.3 : side < -0.3);
			}
			if (!ok) continue;
			const deco = spec.deco(rng);
			// quarter-scale furniture: hexes read spacious, resources stay legible
			deco.scale.multiplyScalar(0.25);
			deco.position.set(tile.x + px, HEX_HEIGHT, tile.z + pz);
			group.add(deco);
		}
	}
}

/**
 * The tile prism, vertex-colored so hex edges integrate into the terrain:
 * the bevel ring (and top) take the FIELD color, gently darkened toward the
 * rim — borders read as soft furrows pressed into the clay, not cut lines.
 * Only the vertical walls keep the clay/sea side color, blended softly
 * where the bevel meets them.
 */
function buildTileBase(
	tile: HexTile,
	rng: Rng,
	field: FieldSampler,
	isSea: boolean
): THREE.Mesh {
	const height = isSea ? SEA_HEIGHT : HEX_HEIGHT;
	const geo = hexPrism(HEX_RADIUS, height).toNonIndexed();
	const sideColor = driftedColor(isSea ? SEA_SIDE : CLAY_SIDE, rng);
	const pos = geo.getAttribute('position');
	const colors = new Float32Array(pos.count * 3);
	const scratch = new THREE.Color();
	const bevelBottom = height - BEVEL;

	for (let i = 0; i < pos.count; i++) {
		const x = pos.getX(i);
		const y = pos.getY(i);
		const z = pos.getZ(i);
		let c: THREE.Color;
		if (y > bevelBottom - 0.001) {
			// bevel + top: terrain color, darkened toward the rim -> the crease
			const t = Math.min(1, Math.max(0, (y - bevelBottom) / BEVEL)); // 0 rim-bottom, 1 top
			field(tile, tile.x + x, tile.z + z, scratch);
			scratch.multiplyScalar(0.9 + 0.09 * t);
			// soften the junction where the bevel meets the clay wall
			if (t < 0.3) scratch.lerp(sideColor, 1 - t / 0.3);
			c = scratch;
		} else {
			c = sideColor;
		}
		colors[i * 3] = c.r;
		colors[i * 3 + 1] = c.g;
		colors[i * 3 + 2] = c.b;
	}
	geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

	const mesh = new THREE.Mesh(
		geo,
		new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.93, metalness: 0 })
	);
	mesh.position.set(tile.x, 0, tile.z);
	mesh.castShadow = !isSea;
	mesh.receiveShadow = true;
	return mesh;
}

export function buildWorld(world: HexWorld): THREE.Group {
	const group = new THREE.Group();
	const styles = buildStyles(world);
	const shore = new THREE.Color(SHORE);
	const field = makeFieldSampler(styles, shore);

	for (const tile of world.tiles) {
		const rng = makeRng(tile.seed);
		const isSea = tile.kind === 'SEA';

		const tileGroup = new THREE.Group();
		// sea is scenery — only land tiles are selectable
		if (!isSea) tileGroup.userData.tile = tile;

		tileGroup.add(buildTileBase(tile, rng, field, isSea));

		const disc = buildTopDisc(tile, rng, field);
		disc.position.x = tile.x;
		disc.position.z = tile.z;
		tileGroup.add(disc);

		if (!isSea) placeDecorations(tile, rng, tileGroup);
		group.add(tileGroup);
	}

	return group;
}
