/**
 * Turns HexWorld data into a clay Three.js island.
 *
 * The board is FLAT and reads as ONE CONTINUOUS LANDSCAPE: every tile's top
 * is a finely tessellated disc whose vertex colors come from a smooth
 * CROSS-TILE COLOR FIELD — each vertex blends its own tile's biome color
 * with the neighbouring tiles' colors (inverse-distance weighting), so
 * terrain melts across hex borders instead of stopping at them. Water
 * contributes "wetness" to the same field, and a sandy shore band emerges
 * automatically wherever wetness crosses ~50%.
 *
 * COASTS ARE BEACHES, NOT CLIFFS: every sea-facing hex edge grows a sloping
 * sand skirt from the tile rim down under the waterline, so the island eases
 * into the (semi-transparent, shallow) water instead of ending in a cut
 * hexagon wall.
 *
 * PERFORMANCE: everything a tile owns — base prism, top disc, coast skirt,
 * all decorations — is merged into ONE vertex-colored mesh per tile. At
 * 1440 land tiles that is the difference between ~1.5k draw calls and ~40k.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { AXIAL_DIRS, key, WATER_BIOME, type BiomeId, type HexTile, type HexWorld } from '../hexmap';
import { hash2, makeRng, type Rng } from '../rng';
import {
	berryBush,
	blobTree,
	bush,
	cactus,
	cairn,
	birchTree,
	broadleafTree,
	clayBoulder,
	fallenLog,
	fern,
	mountainPeaks,
	mushrooms,
	twigSticks,
	grassBlades,
	pineTall,
	slabRock,
	stonePile,
	clayChunks,
	clayTerrace,
	crystal,
	deadTree,
	flower,
	goldTuft,
	lilyPad,
	mudMound,
	oreRock,
	palm,
	peak,
	pebble,
	pine,
	puffTree,
	reeds,
	rock,
	sheaf,
	sheep,
	sunflower,
	tuft
} from './decorations';

const HEX_RADIUS = 1.0; // flush — tiles form one continuous ground
const HEX_HEIGHT = 0.5; // uniform — the board is flat
const BEVEL = 0.042; // soft crease between tiles
const CLAY_SIDE = '#f5edda';
const SHORE = '#ecdcae';
const WET_SAND = '#dcc79b';
const SUBMERGED = '#a9c9bd';
/** The open water tone. SEA tiles are never rendered as hexes — they exist
 * only as data so the coastal shore band computes; the visible sea is the
 * simulated water plane in water.ts. */
const SEA_TOP = '#5fa9bc';

interface BiomeSpec {
	top: string;
	/** decorations per full hex (halved on split hexes) */
	density: [number, number];
	deco: (rng: Rng) => THREE.Group;
}

const BIOMES: Record<BiomeId, BiomeSpec> = {
	LAKE: {
		// v2 — sweet water from the low-poly refs: pale calm blue, faceted
		// lily pads with pale blossoms, chunky cattails.
		top: '#6fb9c9',
		density: [2, 4],
		deco: (rng) =>
			rng.chance(0.5) ? lilyPad(rng) : rng.chance(0.55) ? reeds(rng) : pebble(rng)
	},
	CLAYPIT: {
		// v2 — faceted low-poly: terraced dig mounds, crumpled terracotta
		// boulders, raw clay chunks, scorched dead trees. Sparse (a pit is
		// mostly open ground) and at half scale so the hexagon reads large.
		top: '#d69c66',
		density: [1, 3],
		deco: (rng) => {
			const d =
				rng.chance(0.32)
					? clayTerrace(rng)
					: rng.chance(0.38)
						? clayBoulder(rng)
						: rng.chance(0.55)
							? clayChunks(rng)
							: deadTree(rng);
			d.scale.multiplyScalar(0.5);
			return d;
		}
	},
	FOREST: {
		// v3 — dense mixed woods at half piece scale. Trees dominate (~2/3 of
		// pieces: pines with birch and broadleaf accents); logs and stones
		// keep their old absolute density; the floor gets ferns, mushrooms,
		// twigs and grass for undergrowth fidelity.
		top: '#6cb254',
		density: [46, 75],
		deco: (rng) => {
			const d = rng.chance(0.78)
				? // the canopy: three species
					rng.chance(0.7)
					? pineTall(rng)
					: rng.chance(0.5)
						? birchTree(rng)
						: broadleafTree(rng)
				: // the floor + debris layer
					rng.chance(0.3)
					? grassBlades(rng)
					: rng.chance(0.22)
						? fern(rng)
						: rng.chance(0.18)
							? mushrooms(rng)
							: rng.chance(0.2)
								? twigSticks(rng)
								: rng.chance(0.35)
									? fallenLog(rng)
									: rng.chance(0.55)
										? slabRock(rng)
										: stonePile(rng);
			d.scale.multiplyScalar(0.5);
			return d;
		}
	},
	GROVE: {
		top: '#8ecb84',
		density: [6, 10],
		deco: (rng) =>
			rng.chance(0.4)
				? berryBush(rng)
				: rng.chance(0.35)
					? bush(rng)
					: rng.chance(0.4)
						? flower(rng)
						: blobTree(rng)
	},
	MOUNTAIN: {
		// v2 — faceted low-poly: peak clusters, mesas and spires of varied
		// steepness with snow-cap chance, stratified slabs, stone piles and
		// cairns. Peaks stay full-size on purpose — the skyline anchors.
		top: '#9aa3ad',
		density: [4, 8],
		deco: (rng) =>
			rng.chance(0.5)
				? mountainPeaks(rng)
				: rng.chance(0.4)
					? slabRock(rng)
					: rng.chance(0.5)
						? stonePile(rng)
						: cairn(rng)
	},
	ORECLIFF: {
		top: '#9c9184',
		density: [3, 5],
		deco: (rng) =>
			rng.chance(0.45) ? oreRock(rng) : rng.chance(0.5) ? crystal(rng) : rock(rng, 1.2)
	},
	MEADOW: {
		top: '#a8da85',
		density: [4, 8],
		deco: (rng) =>
			rng.chance(0.14)
				? sheep(rng)
				: rng.chance(0.25)
					? flower(rng)
					: rng.chance(0.18)
						? bush(rng)
						: rng.chance(0.1)
							? blobTree(rng)
							: tuft(rng)
	},
	FIBERFIELD: {
		top: '#c9d789',
		density: [7, 12],
		deco: (rng) =>
			rng.chance(0.3) ? sheaf(rng) : rng.chance(0.65) ? goldTuft(rng) : flower(rng)
	},
	DUNES: {
		top: '#f0d99e',
		density: [2, 4],
		deco: (rng) =>
			rng.chance(0.42)
				? palm(rng)
				: rng.chance(0.35)
					? cactus(rng)
					: rng.chance(0.4)
						? puffTree(rng)
						: pebble(rng)
	},
	SUNPLAINS: {
		top: '#f2e2a4',
		density: [3, 6],
		deco: (rng) =>
			rng.chance(0.5) ? sunflower(rng) : rng.chance(0.5) ? goldTuft(rng) : pebble(rng)
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
			waterA: a === WATER_BIOME ? 1 : 0,
			waterB: b === WATER_BIOME ? 1 : 0,
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
	const waterColor = new THREE.Color('#5fb7c9');
	/** Writes the blended color to `out`; returns the wetness (0 dry..1 water). */
	return (tile: HexTile, wx: number, wz: number, out: THREE.Color): number => {
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

		// water is WATER: wherever wetness wins, snap to solid stream blue so
		// rivers and lake narrows stay one continuous body with blue-on-blue
		// edges — never muddy land-tinted blends between water tiles
		out.lerp(waterColor, smoothstep(0.5, 0.68, water) * 0.9);

		return water;
	};
}

/* ---------------------------------------------------------------------------
 * Ground relief — world-continuous value noise for polygonized tile tops.
 * Sampled by WORLD position, so vertices on a shared hex border displace
 * identically on both tiles: the terrain bumps flow across borders while
 * the flat furrow ring still marks each hexagon.
 * ------------------------------------------------------------------------ */


const latticeH = (ix: number, iz: number): number => hash2(ix, iz, 0x6e01) / 4294967296;

function valueNoise(x: number, z: number): number {
	const ix = Math.floor(x);
	const iz = Math.floor(z);
	const fx = x - ix;
	const fz = z - iz;
	const ux = fx * fx * (3 - 2 * fx);
	const uz = fz * fz * (3 - 2 * fz);
	const a = latticeH(ix, iz);
	const b = latticeH(ix + 1, iz);
	const c = latticeH(ix, iz + 1);
	const d = latticeH(ix + 1, iz + 1);
	return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}

/** 0..1 rolling ground relief, two octaves. */
function groundRelief(wx: number, wz: number): number {
	return valueNoise(wx * 1.15, wz * 1.15) * 0.65 + valueNoise(wx * 2.7 + 37.2, wz * 2.7 - 11.8) * 0.35;
}

/** Upward-only bump height at a world position; water flattens to level. */
function reliefHeight(wx: number, wz: number, wetness: number): number {
	const dry = Math.max(0, 1 - wetness * 1.6);
	return groundRelief(wx, wz) * 0.07 * dry;
}

/* ---------------------------------------------------------------------------
 * Geometry builders — everything returns world-space, vertex-colored,
 * non-indexed BufferGeometry with position/normal/color, ready to merge.
 * ------------------------------------------------------------------------ */

type FieldSampler = ReturnType<typeof makeFieldSampler>;

function setUniformColor(geo: THREE.BufferGeometry, colorOf: (x: number, y: number, z: number) => THREE.Color): void {
	const pos = geo.getAttribute('position');
	const arr = new Float32Array(pos.count * 3);
	for (let i = 0; i < pos.count; i++) {
		const c = colorOf(pos.getX(i), pos.getY(i), pos.getZ(i));
		arr[i * 3] = c.r;
		arr[i * 3 + 1] = c.g;
		arr[i * 3 + 2] = c.b;
	}
	geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
}

/** The tile prism: bevel + top wear the field color (darkened toward the rim
 * so borders read as pressed furrows); walls stay clay. */
function buildBaseGeo(tile: HexTile, rng: Rng, field: FieldSampler): THREE.BufferGeometry {
	const geo = hexPrism(HEX_RADIUS, HEX_HEIGHT).toNonIndexed();
	geo.deleteAttribute('uv');
	const sideColor = driftedColor(CLAY_SIDE, rng);
	const scratch = new THREE.Color();
	const bevelBottom = HEX_HEIGHT - BEVEL;
	setUniformColor(geo, (x, y, z) => {
		if (y > bevelBottom - 0.001) {
			const t = Math.min(1, Math.max(0, (y - bevelBottom) / BEVEL));
			field(tile, tile.x + x, tile.z + z, scratch);
			scratch.multiplyScalar(0.955 + 0.04 * t);
			if (t < 0.3) scratch.lerp(sideColor, 1 - t / 0.3);
			return scratch;
		}
		return sideColor;
	});
	geo.translate(tile.x, 0, tile.z);
	return geo;
}

/** Finely tessellated top disc, vertex-colored by the cross-tile field. */
function buildTopDiscGeo(tile: HexTile, rng: Rng, field: FieldSampler): THREE.BufferGeometry {
	const radius = HEX_RADIUS - BEVEL + 0.005;
	const N = 6; // subdivisions per sector edge
	const positions: number[] = [];
	const colors: number[] = [];
	const scratch = new THREE.Color();

	const corner = (i: number): [number, number] => [
		Math.cos((Math.PI / 3) * i) * radius,
		Math.sin((Math.PI / 3) * i) * radius
	];

	const pushTri = (a: [number, number], b: [number, number], c: [number, number]): void => {
		const dl = rng.jitter(0, 0.004);
		for (const [px, pz] of [a, c, b]) {
			const wx = tile.x + px;
			const wz = tile.z + pz;
			const wet = field(tile, wx, wz, scratch);
			// polygonized ground: world-continuous relief, flat near water
			positions.push(px, reliefHeight(wx, wz, wet), pz);
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
	geo.translate(tile.x, HEX_HEIGHT + 0.004, tile.z);
	return geo;
}

/* --- the beach skirt ------------------------------------------------------ */

/** Edge k runs corner k -> corner k+1; its outward neighbour is EDGE_DIRS[k]
 * (world angle 30° + 60°·k in the flat-top axial layout). */
const EDGE_DIRS: ReadonlyArray<[number, number]> = [
	[1, 0],
	[0, 1],
	[-1, 1],
	[-1, 0],
	[0, -1],
	[1, -1]
];

/** Skirt profile: from the prism rim, ease outward and down under the water.
 * offsets are along the edge normal; heights are absolute Y. */
const SKIRT_RINGS = [
	{ out: 0, y: HEX_HEIGHT - BEVEL },
	{ out: 0.3, y: 0.38 },
	{ out: 0.7, y: 0.26 },
	{ out: 1.25, y: 0.1 }
];

/**
 * Sloping sand apron on every sea-facing edge (plus rounded corner fans
 * where two sea edges meet) — the island eases into the water as a beach
 * instead of ending in a cut hexagon wall.
 */
function buildSkirtGeo(
	tile: HexTile,
	rng: Rng,
	field: FieldSampler,
	isSea: (q: number, r: number) => boolean
): THREE.BufferGeometry | null {
	const seaEdge = EDGE_DIRS.map(([dq, dr]) => isSea(tile.q + dq, tile.r + dr));
	if (!seaEdge.some(Boolean)) return null;

	const positions: number[] = [];
	const colors: number[] = [];
	const scratch = new THREE.Color();
	const wetSand = driftedColor(WET_SAND, rng);
	const submerged = driftedColor(SUBMERGED, rng);

	const ringColor = (ringIdx: number, wx: number, wz: number): THREE.Color => {
		if (ringIdx === 0) {
			field(tile, wx, wz, scratch);
			return scratch.clone().multiplyScalar(0.97);
		}
		if (ringIdx === 1) {
			field(tile, wx, wz, scratch);
			return scratch.clone().lerp(wetSand, 0.75).multiplyScalar(0.97);
		}
		if (ringIdx === 2) return wetSand.clone().lerp(submerged, 0.45);
		return submerged.clone();
	};

	const pushQuad = (
		a: THREE.Vector3,
		b: THREE.Vector3,
		c: THREE.Vector3,
		d: THREE.Vector3,
		ca: THREE.Color,
		cb: THREE.Color,
		cc: THREE.Color,
		cd: THREE.Color
	): void => {
		// two triangles: a-b-c, a-c-d (wound upward/outward)
		for (const [p, col] of [
			[a, ca],
			[b, cb],
			[c, cc],
			[a, ca],
			[c, cc],
			[d, cd]
		] as const) {
			positions.push(p.x, p.y, p.z);
			colors.push(col.r, col.g, col.b);
		}
	};

	const corner = (i: number): THREE.Vector2 =>
		new THREE.Vector2(
			tile.x + Math.cos((Math.PI / 3) * i) * HEX_RADIUS,
			tile.z + Math.sin((Math.PI / 3) * i) * HEX_RADIUS
		);

	const SEGS = 3;
	for (let k = 0; k < 6; k++) {
		if (!seaEdge[k]) continue;
		const A = corner(k);
		const B = corner(k + 1);
		const normalAngle = Math.PI / 6 + (Math.PI / 3) * k;
		const nx = Math.cos(normalAngle);
		const nz = Math.sin(normalAngle);

		for (let s = 0; s < SEGS; s++) {
			const t0 = s / SEGS;
			const t1 = (s + 1) / SEGS;
			for (let r = 0; r < SKIRT_RINGS.length - 1; r++) {
				const R0 = SKIRT_RINGS[r];
				const R1 = SKIRT_RINGS[r + 1];
				const wobble = 1 + rng.jitter(0, 0.06);
				const p = (t: number, ring: typeof R0): THREE.Vector3 =>
					new THREE.Vector3(
						A.x + (B.x - A.x) * t + nx * ring.out * wobble,
						ring.y,
						A.y + (B.y - A.y) * t + nz * ring.out * wobble
					);
				const a = p(t0, R0);
				const b = p(t1, R0);
				const c = p(t1, R1);
				const d = p(t0, R1);
				pushQuad(
					a,
					b,
					c,
					d,
					ringColor(r, a.x, a.z),
					ringColor(r, b.x, b.z),
					ringColor(r + 1, c.x, c.z),
					ringColor(r + 1, d.x, d.z)
				);
			}
		}

		// rounded corner fan where the NEXT edge is also sea-facing
		const kn = (k + 1) % 6;
		if (seaEdge[kn]) {
			const C = corner(k + 1);
			const angA = normalAngle;
			const angB = Math.PI / 6 + (Math.PI / 3) * kn;
			const FAN = 3;
			for (let f = 0; f < FAN; f++) {
				const a0 = angA + ((angB - angA) * f) / FAN;
				const a1 = angA + ((angB - angA) * (f + 1)) / FAN;
				for (let r = 0; r < SKIRT_RINGS.length - 1; r++) {
					const R0 = SKIRT_RINGS[r];
					const R1 = SKIRT_RINGS[r + 1];
					const p = (ang: number, ring: typeof R0): THREE.Vector3 =>
						new THREE.Vector3(
							C.x + Math.cos(ang) * ring.out,
							ring.y,
							C.y + Math.sin(ang) * ring.out
						);
					const a = p(a0, R0);
					const b = p(a1, R0);
					const c = p(a1, R1);
					const d = p(a0, R1);
					pushQuad(
						a,
						b,
						c,
						d,
						ringColor(r, a.x, a.z),
						ringColor(r, b.x, b.z),
						ringColor(r + 1, c.x, c.z),
						ringColor(r + 1, d.x, d.z)
					);
				}
			}
		}
	}

	if (positions.length === 0) return null;
	const geo = new THREE.BufferGeometry();
	geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
	geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
	geo.computeVertexNormals();
	return geo;
}

/* --- decorations ---------------------------------------------------------- */

/** Flatten a tile's decoration groups into one world-space geometry with the
 * material colors baked into vertex colors. */
function buildDecoGeo(tile: HexTile, rng: Rng): THREE.BufferGeometry | null {
	const halves: Array<{ biome: BiomeId; sign: -1 | 1 | 0 }> =
		tile.biomes.length === 2
			? [
					{ biome: tile.biomes[0], sign: -1 },
					{ biome: tile.biomes[1], sign: 1 }
				]
			: [{ biome: tile.biomes[0], sign: 0 }];

	const dirX = Math.cos(tile.splitDir);
	const dirZ = Math.sin(tile.splitDir);
	const decos: THREE.Group[] = [];

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
				ok = half.sign === 0 || (half.sign === 1 ? side > 0.3 : side < -0.3);
			}
			if (!ok) continue;
			const deco = spec.deco(rng);
			// global piece scale (-25% from quarter): hexes read even more spacious
			deco.scale.multiplyScalar(0.1875);
			deco.position.set(tile.x + px, HEX_HEIGHT, tile.z + pz);
			decos.push(deco);
		}
	}

	const geos: THREE.BufferGeometry[] = [];
	for (const g of decos) {
		g.updateMatrixWorld(true);
		g.traverse((obj) => {
			if (obj instanceof THREE.Mesh) {
				const geo = (obj.geometry as THREE.BufferGeometry).clone().toNonIndexed();
				geo.applyMatrix4(obj.matrixWorld);
				geo.deleteAttribute('uv');
				const count = geo.getAttribute('position').count;
				const col = (obj.material as THREE.MeshStandardMaterial).color;
				const arr = new Float32Array(count * 3);
				for (let i = 0; i < count; i++) {
					arr[i * 3] = col.r;
					arr[i * 3 + 1] = col.g;
					arr[i * 3 + 2] = col.b;
				}
				geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
				geos.push(geo);
				obj.geometry.dispose();
				(obj.material as THREE.Material).dispose();
			}
		});
	}
	if (geos.length === 0) return null;
	const merged = mergeGeometries(geos, false);
	for (const g of geos) g.dispose();
	return merged;
}

/* --- assembly ------------------------------------------------------------- */

/**
 * A single isolated tile of one biome — the sandbox specimen. Same builders
 * as the real world (base, disc, decorations; no coast skirt), so what the
 * sandbox shows is exactly what the island renders. `seed` varies the
 * decoration layout; a future `level` parameter will select the biome's
 * upgrade-level styling variants.
 */
export function buildBiomeTile(biome: BiomeId, seed: number): THREE.Mesh {
	const tile: HexTile = {
		q: 0,
		r: 0,
		x: 0,
		z: 0,
		kind: 'LAND',
		biomes: [biome],
		splitDir: 0,
		seed
	};
	const world: HexWorld = { seed, tiles: [tile] };
	const styles = buildStyles(world);
	const field = makeFieldSampler(styles, new THREE.Color(SHORE));
	const rng = makeRng(seed);

	const parts: THREE.BufferGeometry[] = [
		buildBaseGeo(tile, rng, field),
		buildTopDiscGeo(tile, rng, field)
	];
	const deco = buildDecoGeo(tile, rng);
	if (deco) parts.push(deco);
	const merged = mergeGeometries(parts, false);
	for (const p of parts) p.dispose();

	const mesh = new THREE.Mesh(
		merged ?? new THREE.BufferGeometry(),
		new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, metalness: 0 })
	);
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	return mesh;
}

export function buildWorld(world: HexWorld): THREE.Group {
	const group = new THREE.Group();
	const styles = buildStyles(world);
	const shore = new THREE.Color(SHORE);
	const field = makeFieldSampler(styles, shore);

	const landSet = new Set(
		world.tiles.filter((t) => t.kind === 'LAND').map((t) => key(t.q, t.r))
	);
	const isSea = (q: number, r: number) => !landSet.has(key(q, r));

	const material = new THREE.MeshStandardMaterial({
		vertexColors: true,
		roughness: 0.9,
		metalness: 0
	});

	for (const tile of world.tiles) {
		// SEA tiles are data-only; the visible sea is the water simulation
		if (tile.kind === 'SEA') continue;

		const rng = makeRng(tile.seed);

		// GROUND (base + disc + skirt): receives shadows but never casts —
		// keeping flat terrain out of the shadow pass is the difference
		// between 1fps and 60fps at this world size.
		const groundParts: THREE.BufferGeometry[] = [
			buildBaseGeo(tile, rng, field),
			buildTopDiscGeo(tile, rng, field)
		];
		const skirt = buildSkirtGeo(tile, rng, field, isSea);
		if (skirt) groundParts.push(skirt);
		const ground = mergeGeometries(groundParts, false);
		for (const p of groundParts) p.dispose();
		if (!ground) continue;

		const groundMesh = new THREE.Mesh(ground, material);
		groundMesh.castShadow = false;
		groundMesh.receiveShadow = true;
		groundMesh.userData.tile = tile;
		group.add(groundMesh);

		// DECORATIONS: the only shadow casters.
		const deco = buildDecoGeo(tile, rng);
		if (deco) {
			const decoMesh = new THREE.Mesh(deco, material);
			decoMesh.castShadow = true;
			decoMesh.receiveShadow = true;
			decoMesh.userData.tile = tile;
			group.add(decoMesh);
		}
	}

	return group;
}
