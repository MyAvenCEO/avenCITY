/**
 * Turns HexWorld data into a clay Three.js island.
 *
 * Each hex = a cream clay base prism + a thin colored cap slab (the biome
 * surface), both extruded with bevels for the soft clay edge. Two-biome
 * hexes get a vertex-colored cap split along the tile's splitDir, and their
 * decorations are placed on the matching side of the line.
 */
import * as THREE from 'three';
import type { BiomeId, HexTile, HexWorld } from '../hexmap';
import { makeRng, type Rng } from '../rng';
import { blobTree, cactus, flower, pebble, peak, pine, puffTree, rock, tuft } from './decorations';

const HEX_RADIUS = 0.96; // < 1 so grooves show between tiles
const CAP_DEPTH = 0.1;
const CLAY_SIDE = '#f5edda';

interface BiomeSpec {
	top: string;
	height: number;
	/** decorations per full hex (halved on split hexes) */
	density: [number, number];
	deco: (rng: Rng) => THREE.Group;
}

const BIOMES: Record<BiomeId, BiomeSpec> = {
	MEADOW: {
		top: '#9fd67f',
		height: 0.52,
		density: [3, 7],
		deco: (rng) => (rng.chance(0.2) ? flower(rng) : rng.chance(0.12) ? blobTree(rng) : tuft(rng))
	},
	FOREST: {
		top: '#77bd62',
		height: 0.58,
		density: [4, 8],
		deco: (rng) => (rng.chance(0.55) ? pine(rng) : blobTree(rng))
	},
	MOUNTAIN: {
		top: '#b3ac9f',
		height: 0.8,
		density: [1, 2],
		deco: (rng) => (rng.chance(0.7) ? peak(rng) : rock(rng, 1.4))
	},
	DUNES: {
		top: '#f0d99e',
		height: 0.48,
		density: [1, 3],
		deco: (rng) => (rng.chance(0.45) ? puffTree(rng) : rng.chance(0.5) ? cactus(rng) : pebble(rng))
	},
	RIVER: {
		top: '#54c6dc',
		height: 0.3,
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

/** Extruded hex, rotated so extrusion depth becomes +Y. */
function hexGeometry(radius: number, depth: number, bevel: number): THREE.ExtrudeGeometry {
	const geo = new THREE.ExtrudeGeometry(hexShape(radius - bevel), {
		depth: depth - bevel,
		bevelEnabled: true,
		bevelThickness: bevel,
		bevelSize: bevel,
		bevelSegments: 1
	});
	geo.rotateX(-Math.PI / 2);
	return geo;
}

/** Per-hex tiny hue drift so a field of same-biome hexes still shimmers. */
function driftedColor(hex: string, rng: Rng): THREE.Color {
	const c = new THREE.Color(hex);
	c.offsetHSL(rng.jitter(0, 0.008), rng.jitter(0, 0.03), rng.jitter(0, 0.025));
	return c;
}

function buildCap(tile: HexTile, rng: Rng, baseHeight: number): THREE.Mesh {
	const geo = hexGeometry(HEX_RADIUS, CAP_DEPTH, 0.045);
	const colorA = driftedColor(BIOMES[tile.biomes[0]].top, rng);
	const colorB = tile.biomes[1] ? driftedColor(BIOMES[tile.biomes[1]].top, rng) : colorA;

	const pos = geo.getAttribute('position');
	const colors = new Float32Array(pos.count * 3);
	const dirX = Math.cos(tile.splitDir);
	const dirZ = Math.sin(tile.splitDir);
	for (let i = 0; i < pos.count; i++) {
		// side test in local hex space: secondary biome owns the +dir half
		const side = pos.getX(i) * dirX + pos.getZ(i) * dirZ;
		const c = side > 0 ? colorB : colorA;
		colors[i * 3] = c.r;
		colors[i * 3 + 1] = c.g;
		colors[i * 3 + 2] = c.b;
	}
	geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

	const isWater = tile.biomes.includes('RIVER');
	const mesh = new THREE.Mesh(
		geo,
		new THREE.MeshStandardMaterial({
			vertexColors: true,
			roughness: isWater ? 0.35 : 0.9,
			metalness: 0,
			flatShading: false
		})
	);
	mesh.position.y = baseHeight;
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	return mesh;
}

function placeDecorations(
	tile: HexTile,
	rng: Rng,
	topY: number,
	group: THREE.Group
): void {
	const halves: Array<{ biome: BiomeId; sign: -1 | 1 | 0 }> =
		tile.biomes.length === 2
			? [
					{ biome: tile.biomes[0], sign: -1 },
					{ biome: tile.biomes[1]!, sign: 1 }
				]
			: [{ biome: tile.biomes[0], sign: 0 }];

	const dirX = Math.cos(tile.splitDir);
	const dirZ = Math.sin(tile.splitDir);

	for (const half of halves) {
		const spec = BIOMES[half.biome];
		let count = rng.int(spec.density[0], spec.density[1]);
		if (tile.biomes.length === 2) count = Math.max(1, Math.round(count / 2));
		if (half.biome === 'RIVER') count = rng.int(spec.density[0], spec.density[1]);

		for (let i = 0; i < count; i++) {
			// rejection-sample a point in the hex, on the correct side
			let px = 0;
			let pz = 0;
			let ok = false;
			for (let tries = 0; tries < 14 && !ok; tries++) {
				const a = rng.range(0, Math.PI * 2);
				const d = Math.sqrt(rng.next()) * HEX_RADIUS * 0.68;
				px = Math.cos(a) * d;
				pz = Math.sin(a) * d;
				const side = px * dirX + pz * dirZ;
				ok = half.sign === 0 || (half.sign === 1 ? side > 0.12 : side < -0.12);
			}
			if (!ok) continue;
			const deco = spec.deco(rng);
			deco.position.set(tile.x + px, topY, tile.z + pz);
			group.add(deco);
		}
	}
}

export function buildWorld(world: HexWorld): THREE.Group {
	const group = new THREE.Group();

	for (const tile of world.tiles) {
		const rng = makeRng(tile.seed);

		// base height: dominant biome, softened toward secondary
		const hA = BIOMES[tile.biomes[0]].height;
		const hB = tile.biomes[1] ? BIOMES[tile.biomes[1]].height : hA;
		const height = (hA + hB) / 2 + rng.jitter(0, 0.02);

		const base = new THREE.Mesh(
			hexGeometry(HEX_RADIUS, height, 0.05),
			new THREE.MeshStandardMaterial({
				color: driftedColor(CLAY_SIDE, rng),
				roughness: 0.95,
				metalness: 0
			})
		);
		base.position.set(tile.x, 0, tile.z);
		base.castShadow = true;
		base.receiveShadow = true;
		group.add(base);

		const cap = buildCap(tile, rng, height);
		cap.position.x = tile.x;
		cap.position.z = tile.z;
		group.add(cap);

		placeDecorations(tile, rng, height + CAP_DEPTH, group);
	}

	return group;
}
