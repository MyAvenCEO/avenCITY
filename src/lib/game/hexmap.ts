/**
 * Procedural hex island generation — pure data, no rendering.
 *
 * Shape: an organic blob grown from the center hex.
 * Biomes: Voronoi over seeded region centers, so biomes form coherent
 * patches. Hexes near a region border become TWO-biome hexes, split along
 * the direction to the neighbouring region — borders read as natural
 * transitions, exactly where you'd expect mixed terrain.
 * Diversity: every hex carries its own 32-bit seed (hash of coords + world
 * seed) — decoration counts, positions, scales and hue jitter all derive
 * from it, so no two FOREST hexes are the same forest.
 */
import { hash2, makeRng } from './rng';

export const BIOME_IDS = ['RIVER', 'FOREST', 'MOUNTAIN', 'MEADOW', 'DUNES'] as const;
export type BiomeId = (typeof BIOME_IDS)[number];

export interface HexTile {
	q: number;
	r: number;
	/** world-space center (flat-top layout, unit hex radius = 1) */
	x: number;
	z: number;
	/** 1 or 2 biomes; [primary] or [primary, secondary] */
	biomes: [BiomeId] | [BiomeId, BiomeId];
	/** split direction (radians, world xz) — secondary biome lies on +side */
	splitDir: number;
	/** per-hex seed for all visual variation */
	seed: number;
}

export interface HexWorld {
	seed: number;
	tiles: HexTile[];
}

const AXIAL_DIRS: ReadonlyArray<[number, number]> = [
	[1, 0],
	[1, -1],
	[0, -1],
	[-1, 0],
	[-1, 1],
	[0, 1]
];

function axialToWorld(q: number, r: number): { x: number; z: number } {
	// flat-top layout, hex radius 1
	return { x: 1.5 * q, z: Math.sqrt(3) * (r + q / 2) };
}

function axialDistance(aq: number, ar: number, bq: number, br: number): number {
	const dq = aq - bq;
	const dr = ar - br;
	return (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) / 2;
}

/** Grow an organic blob of hexes from the origin. */
function growBlob(seed: number, target: number): Array<[number, number]> {
	const rng = makeRng(seed ^ 0x51ab);
	const taken = new Map<string, [number, number]>();
	const key = (q: number, r: number) => `${q},${r}`;
	const frontier: Array<[number, number]> = [[0, 0]];
	taken.set(key(0, 0), [0, 0]);

	while (taken.size < target && frontier.length > 0) {
		// pick a random frontier hex, biased toward earlier (inner) entries so
		// the blob stays compact instead of snaking
		const idx = Math.floor(Math.pow(rng.next(), 1.6) * frontier.length);
		const [q, r] = frontier[idx];
		const dirs = [...AXIAL_DIRS].sort(() => rng.next() - 0.5);
		let placed = false;
		for (const [dq, dr] of dirs) {
			const nq = q + dq;
			const nr = r + dr;
			if (!taken.has(key(nq, nr))) {
				taken.set(key(nq, nr), [nq, nr]);
				frontier.push([nq, nr]);
				placed = true;
				break;
			}
		}
		if (!placed) frontier.splice(idx, 1);
	}
	return [...taken.values()];
}

export function generateMap(seed: number, size = 40): HexWorld {
	const rng = makeRng(seed);
	const cells = growBlob(seed, size);

	// --- biome regions: 6-8 centers scattered over the blob -----------------
	const regionCount = rng.int(6, 8);
	// guarantee all five biomes appear, then pad with random repeats
	const regionBiomes: BiomeId[] = [...BIOME_IDS];
	while (regionBiomes.length < regionCount) regionBiomes.push(rng.pick(BIOME_IDS));
	// shuffle
	for (let i = regionBiomes.length - 1; i > 0; i--) {
		const j = rng.int(0, i);
		[regionBiomes[i], regionBiomes[j]] = [regionBiomes[j], regionBiomes[i]];
	}
	const centers = regionBiomes.map((biome) => {
		const [q, r] = rng.pick(cells);
		return { q, r, biome };
	});

	const tiles: HexTile[] = cells.map(([q, r]) => {
		const { x, z } = axialToWorld(q, r);
		const hexSeed = hash2(q, r, seed);
		const tileRng = makeRng(hexSeed);

		// nearest two region centers (jittered distances so borders wobble)
		const ranked = centers
			.map((c) => ({
				c,
				d: axialDistance(q, r, c.q, c.r) + tileRng.range(-0.35, 0.35)
			}))
			.sort((a, b) => a.d - b.d);
		const first = ranked[0];
		const second = ranked.find((e) => e.c.biome !== first.c.biome);

		let biomes: HexTile['biomes'] = [first.c.biome];
		let splitDir = tileRng.range(0, Math.PI * 2);
		if (second && second.d - first.d < 1.2) {
			biomes = [first.c.biome, second.c.biome];
			const sw = axialToWorld(second.c.q, second.c.r);
			splitDir = Math.atan2(sw.z - z, sw.x - x);
		}

		return { q, r, x, z, biomes, splitDir, seed: hexSeed };
	});

	return { seed, tiles };
}
