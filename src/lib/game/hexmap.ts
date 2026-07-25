/**
 * Procedural hex island generation — pure data, no rendering.
 *
 * Shape: an organic land blob grown from the center, wrapped in a >=5-hex
 * thick ring of SEA tiles — the world is always an island (Catan rule).
 * Biomes: Voronoi over seeded region centers with low jitter, so biomes
 * form large coherent clusters. Water is special-cased: exactly ONE
 * connected RIVER body survives generation (one lake/river/sea arm) —
 * stray water hexes are reassigned to their nearest dry biome.
 * Diversity: every hex carries its own 32-bit seed (hash of coords + world
 * seed) — decoration counts, positions, scales and hue jitter all derive
 * from it, so no two FOREST hexes are the same forest.
 */
import { hash2, makeRng } from './rng';
import biomesConfig from '../../../game/config/biomes.json';

export const BIOME_IDS = ['RIVER', 'FOREST', 'MOUNTAIN', 'MEADOW', 'DUNES'] as const;
export type BiomeId = (typeof BIOME_IDS)[number];

/** biome -> natural resources, straight from game/config/biomes.json. */
export const BIOME_RESOURCES: Record<BiomeId, string[]> = Object.fromEntries(
	biomesConfig.biomes.map((b) => [b.id, Object.keys(b.resources)])
) as Record<BiomeId, string[]>;

/** All resources a tile's biomes can (potentially) output. */
export function tileResources(tile: Pick<HexTile, 'biomes'>): string[] {
	return [...new Set(tile.biomes.flatMap((b) => BIOME_RESOURCES[b]))];
}

export interface HexTile {
	q: number;
	r: number;
	/** world-space center (flat-top layout, unit hex radius = 1) */
	x: number;
	z: number;
	kind: 'LAND' | 'SEA';
	/** 1-2 biomes for land, empty for sea */
	biomes: BiomeId[];
	/** split direction (radians, world xz) — secondary biome lies on +side */
	splitDir: number;
	/** per-hex seed for all visual variation */
	seed: number;
}

export interface HexWorld {
	seed: number;
	tiles: HexTile[];
}

export const AXIAL_DIRS: ReadonlyArray<[number, number]> = [
	[1, 0],
	[1, -1],
	[0, -1],
	[-1, 0],
	[-1, 1],
	[0, 1]
];

export const key = (q: number, r: number) => `${q},${r}`;

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
	const frontier: Array<[number, number]> = [[0, 0]];
	taken.set(key(0, 0), [0, 0]);

	while (taken.size < target && frontier.length > 0) {
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

interface RegionCenter {
	q: number;
	r: number;
	biome: BiomeId;
	/** weighted Voronoi: larger weight -> larger patch. Many sizes per biome. */
	weight: number;
}

/**
 * Scatter region centers over the blob. Every land biome appears at least
 * twice and up to several times, each with a random weight — so the same
 * biome recurs across the island in patches of very different sizes.
 * Water gets 1-2 centers (the largest-component pass keeps one body), and
 * its centers prefer INTERIOR cells so lakes form away from the coast.
 */
function placeRegions(
	rng: ReturnType<typeof makeRng>,
	cells: Array<[number, number]>,
	interior: Array<[number, number]>
): RegionCenter[] {
	const count = rng.int(10, 13);
	const land: BiomeId[] = ['FOREST', 'MOUNTAIN', 'MEADOW', 'DUNES'];
	// every land biome twice, water once or twice, random repeats fill up
	const biomes: BiomeId[] = [...land, ...land, 'RIVER'];
	if (rng.chance(0.5)) biomes.push('RIVER');
	while (biomes.length < count) biomes.push(land[rng.int(0, land.length - 1)]);
	for (let i = biomes.length - 1; i > 0; i--) {
		const j = rng.int(0, i);
		[biomes[i], biomes[j]] = [biomes[j], biomes[i]];
	}

	const centers: RegionCenter[] = [];
	for (const biome of biomes.slice(0, count)) {
		const pool = biome === 'RIVER' && interior.length > 0 ? interior : cells;
		let best: [number, number] = rng.pick(pool);
		for (let attempt = 0; attempt < 16; attempt++) {
			const candidate = rng.pick(pool);
			const minDist = Math.min(
				Infinity,
				...centers.map((c) => axialDistance(candidate[0], candidate[1], c.q, c.r))
			);
			best = candidate;
			if (minDist >= 3) break;
		}
		centers.push({ q: best[0], r: best[1], biome, weight: rng.range(0.7, 1.6) });
	}
	return centers;
}

export function generateMap(seed: number, size = 120): HexWorld {
	const rng = makeRng(seed);
	const cells = growBlob(seed, size);
	const landSet = new Set(cells.map(([q, r]) => key(q, r)));
	// interior = all 6 neighbours are land (not on the coast)
	const isInterior = ([q, r]: [number, number]) =>
		AXIAL_DIRS.every(([dq, dr]) => landSet.has(key(q + dq, r + dr)));
	const interior = cells.filter(isInterior);
	const centers = placeRegions(rng, cells, interior);

	// --- assign biomes via weighted low-jitter Voronoi (coherent clusters
	//     of many different sizes) -------------------------------------------
	const assignments = new Map<string, { primary: RegionCenter; secondary?: RegionCenter }>();
	for (const [q, r] of cells) {
		const tileRng = makeRng(hash2(q, r, seed ^ 0x77));
		const ranked = centers
			.map((c) => ({
				c,
				d: (axialDistance(q, r, c.q, c.r) + tileRng.range(-0.15, 0.15)) / c.weight
			}))
			.sort((a, b) => a.d - b.d);
		const first = ranked[0];
		const second = ranked.find((e) => e.c.biome !== first.c.biome);
		assignments.set(key(q, r), {
			primary: first.c,
			secondary: second && second.d - first.d < 0.7 ? second.c : undefined
		});
	}

	// --- lakes never touch the sea: strip water (primary AND secondary)
	//     from coastal tiles, so every lake keeps a ring of land around it --
	const coastal = (q: number, r: number) => !isInterior([q, r]);
	for (const [q, r] of cells) {
		const a = assignments.get(key(q, r))!;
		if (!coastal(q, r)) continue;
		if (a.secondary?.biome === 'RIVER') a.secondary = undefined;
		if (a.primary.biome === 'RIVER') {
			const dry = centers
				.filter((c) => c.biome !== 'RIVER')
				.sort(
					(x, y) =>
						axialDistance(q, r, x.q, x.r) / x.weight -
						axialDistance(q, r, y.q, y.r) / y.weight
				)[0];
			assignments.set(key(q, r), { primary: dry });
		}
	}

	// --- water must be ONE body: keep the largest connected RIVER component -
	const isWater = (q: number, r: number) =>
		assignments.get(key(q, r))?.primary.biome === 'RIVER';
	const waterCells = cells.filter(([q, r]) => isWater(q, r));
	const seen = new Set<string>();
	const components: Array<Array<[number, number]>> = [];
	for (const [q, r] of waterCells) {
		if (seen.has(key(q, r))) continue;
		const comp: Array<[number, number]> = [];
		const queue: Array<[number, number]> = [[q, r]];
		seen.add(key(q, r));
		while (queue.length) {
			const [cq, cr] = queue.pop()!;
			comp.push([cq, cr]);
			for (const [dq, dr] of AXIAL_DIRS) {
				const nq = cq + dq;
				const nr = cr + dr;
				if (landSet.has(key(nq, nr)) && isWater(nq, nr) && !seen.has(key(nq, nr))) {
					seen.add(key(nq, nr));
					queue.push([nq, nr]);
				}
			}
		}
		components.push(comp);
	}
	components.sort((a, b) => b.length - a.length);
	for (const comp of components.slice(1)) {
		for (const [q, r] of comp) {
			// reassign stray water to the nearest dry region
			const dry = centers
				.filter((c) => c.biome !== 'RIVER')
				.sort(
					(a, b) => axialDistance(q, r, a.q, a.r) - axialDistance(q, r, b.q, b.r)
				)[0];
			assignments.set(key(q, r), { primary: dry });
		}
	}

	// --- guarantee a lake: if coastal stripping ate all water, carve a small
	//     one at an interior spot near a river center -------------------------
	if (components.length === 0 || components[0].every(([q, r]) => !isWater(q, r))) {
		const riverCenter = centers.find((c) => c.biome === 'RIVER');
		if (riverCenter && interior.length > 0) {
			const spot = [...interior].sort(
				(a, b) =>
					axialDistance(a[0], a[1], riverCenter.q, riverCenter.r) -
					axialDistance(b[0], b[1], riverCenter.q, riverCenter.r)
			)[0];
			const lake: Array<[number, number]> = [spot];
			for (const [dq, dr] of AXIAL_DIRS) {
				const n: [number, number] = [spot[0] + dq, spot[1] + dr];
				if (interior.some(([q, r]) => q === n[0] && r === n[1]) && lake.length < 3) lake.push(n);
			}
			for (const [q, r] of lake) assignments.set(key(q, r), { primary: riverCenter });
		}
	}

	// --- land tiles ----------------------------------------------------------
	const tiles: HexTile[] = cells.map(([q, r]) => {
		const { x, z } = axialToWorld(q, r);
		const hexSeed = hash2(q, r, seed);
		const a = assignments.get(key(q, r))!;
		const biomes: BiomeId[] =
			a.secondary && a.secondary.biome !== a.primary.biome
				? [a.primary.biome, a.secondary.biome]
				: [a.primary.biome];
		let splitDir = makeRng(hexSeed).range(0, Math.PI * 2);
		if (a.secondary) {
			const sw = axialToWorld(a.secondary.q, a.secondary.r);
			splitDir = Math.atan2(sw.z - z, sw.x - x);
		}
		return { q, r, x, z, kind: 'LAND' as const, biomes, splitDir, seed: hexSeed };
	});

	// --- the sea ring: >=5 hexes of open water around every land tile --------
	const SEA_RING = 5;
	const seaKeys = new Set<string>();
	let frontier = cells;
	for (let ring = 0; ring < SEA_RING; ring++) {
		const next: Array<[number, number]> = [];
		for (const [q, r] of frontier) {
			for (const [dq, dr] of AXIAL_DIRS) {
				const nq = q + dq;
				const nr = r + dr;
				const k = key(nq, nr);
				if (!landSet.has(k) && !seaKeys.has(k)) {
					seaKeys.add(k);
					next.push([nq, nr]);
				}
			}
		}
		frontier = next;
	}
	for (const k of seaKeys) {
		const [q, r] = k.split(',').map(Number);
		const { x, z } = axialToWorld(q, r);
		tiles.push({
			q,
			r,
			x,
			z,
			kind: 'SEA',
			biomes: [],
			splitDir: 0,
			seed: hash2(q, r, seed ^ 0x5ea)
		});
	}

	return { seed, tiles };
}
