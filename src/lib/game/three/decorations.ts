/**
 * Low-poly clay decorations — trees, rocks, tufts, pebbles.
 *
 * Everything is built from primitive geometry with flat shading and small
 * seeded jitter in scale, rotation and hue, so each instance reads as
 * hand-modelled clay rather than a stamped asset.
 */
import * as THREE from 'three';
import type { Rng } from '../rng';

function clay(color: string | THREE.Color): THREE.MeshStandardMaterial {
	return new THREE.MeshStandardMaterial({
		color,
		roughness: 0.92,
		metalness: 0,
		flatShading: false
	});
}

/** Small random hue/lightness shift so no two pieces share an exact color. */
function jitterColor(rng: Rng, hex: string, h = 0.015, s = 0.08, l = 0.05): THREE.Color {
	const c = new THREE.Color(hex);
	c.offsetHSL(rng.jitter(0, h), rng.jitter(0, s), rng.jitter(0, l));
	return c;
}

function shadow(m: THREE.Mesh): THREE.Mesh {
	m.castShadow = true;
	m.receiveShadow = true;
	return m;
}

const TRUNK = '#b08155';

export function pine(rng: Rng): THREE.Group {
	const g = new THREE.Group();
	const s = rng.range(0.75, 1.25);
	const trunk = shadow(
		new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.22, 8), clay(jitterColor(rng, TRUNK)))
	);
	trunk.position.y = 0.11;
	g.add(trunk);
	const tiers = rng.int(2, 3);
	const green = jitterColor(rng, '#3f8a63');
	for (let i = 0; i < tiers; i++) {
		const radius = 0.3 - i * 0.075;
		const cone = shadow(
			new THREE.Mesh(new THREE.ConeGeometry(radius, 0.34, 10), clay(green.clone().offsetHSL(0, 0, i * 0.03)))
		);
		cone.position.y = 0.3 + i * 0.22;
		g.add(cone);
	}
	g.scale.setScalar(s);
	g.rotation.y = rng.range(0, Math.PI * 2);
	return g;
}

export function blobTree(rng: Rng, color = '#7fbf77'): THREE.Group {
	const g = new THREE.Group();
	const s = rng.range(0.7, 1.2);
	const trunk = shadow(
		new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.075, 0.3, 8), clay(jitterColor(rng, TRUNK)))
	);
	trunk.position.y = 0.15;
	g.add(trunk);
	const crown = shadow(
		new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 1), clay(jitterColor(rng, color)))
	);
	crown.position.y = 0.5;
	crown.scale.set(1, rng.range(0.85, 1.1), 1);
	crown.rotation.set(rng.next(), rng.next(), rng.next());
	g.add(crown);
	if (rng.chance(0.4)) {
		const side = shadow(
			new THREE.Mesh(new THREE.IcosahedronGeometry(0.18, 1), clay(jitterColor(rng, color)))
		);
		const a = rng.range(0, Math.PI * 2);
		side.position.set(Math.cos(a) * 0.22, 0.38, Math.sin(a) * 0.22);
		g.add(side);
	}
	g.scale.setScalar(s);
	g.rotation.y = rng.range(0, Math.PI * 2);
	return g;
}

/** The pink puff trees from the reference islands — DUNES signature. */
export function puffTree(rng: Rng): THREE.Group {
	return blobTree(rng, rng.chance(0.5) ? '#f2b8c6' : '#f4c9a8');
}

/** Low bush — a trunkless crown hugging the ground. Forest filler. */
export function bush(rng: Rng): THREE.Group {
	const g = new THREE.Group();
	const green = jitterColor(rng, rng.chance(0.5) ? '#6fb468' : '#8cc97f');
	const main = shadow(new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 1), clay(green)));
	main.position.y = 0.1;
	main.scale.set(1, 0.75, 1);
	main.rotation.y = rng.range(0, Math.PI * 2);
	g.add(main);
	if (rng.chance(0.5)) {
		const side = shadow(
			new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 1), clay(jitterColor(rng, '#7fbf77')))
		);
		const a = rng.range(0, Math.PI * 2);
		side.position.set(Math.cos(a) * 0.16, 0.07, Math.sin(a) * 0.16);
		side.scale.y = 0.7;
		g.add(side);
	}
	g.scale.setScalar(rng.range(0.8, 1.3));
	return g;
}

export function rock(rng: Rng, scale = 1): THREE.Group {
	const g = new THREE.Group();
	const n = rng.int(1, 2);
	for (let i = 0; i < n; i++) {
		const r = shadow(
			new THREE.Mesh(
				new THREE.DodecahedronGeometry(rng.range(0.12, 0.24) * scale, 1),
				clay(jitterColor(rng, '#a8a094', 0.005, 0.02, 0.06))
			)
		);
		r.position.set(rng.jitter(0, 0.12), 0.06 * scale, rng.jitter(0, 0.12));
		r.rotation.set(rng.next() * 3, rng.next() * 3, rng.next() * 3);
		r.scale.y = rng.range(0.6, 0.9);
		g.add(r);
	}
	return g;
}

/** Big mountain formation — 1-2 faceted peaks. */
export function peak(rng: Rng): THREE.Group {
	const g = new THREE.Group();
	const main = shadow(
		new THREE.Mesh(
			new THREE.ConeGeometry(rng.range(0.34, 0.46), rng.range(0.7, 1.05), 8),
			clay(jitterColor(rng, '#989184', 0.004, 0.02, 0.05))
		)
	);
	main.position.y = 0.32;
	main.rotation.y = rng.range(0, Math.PI * 2);
	g.add(main);
	if (rng.chance(0.7)) {
		const side = shadow(
			new THREE.Mesh(
				new THREE.ConeGeometry(rng.range(0.2, 0.3), rng.range(0.4, 0.6), 8),
				clay(jitterColor(rng, '#a49c8f', 0.004, 0.02, 0.05))
			)
		);
		const a = rng.range(0, Math.PI * 2);
		side.position.set(Math.cos(a) * 0.34, 0.2, Math.sin(a) * 0.34);
		side.rotation.y = rng.range(0, Math.PI * 2);
		g.add(side);
	}
	return g;
}

/** Grass tuft — a few tiny cones. */
export function tuft(rng: Rng): THREE.Group {
	const g = new THREE.Group();
	const n = rng.int(2, 4);
	const green = jitterColor(rng, '#9ccc70', 0.02, 0.1, 0.06);
	for (let i = 0; i < n; i++) {
		const blade = shadow(
			new THREE.Mesh(new THREE.ConeGeometry(0.035, rng.range(0.1, 0.18), 7), clay(green))
		);
		blade.position.set(rng.jitter(0, 0.07), 0.06, rng.jitter(0, 0.07));
		blade.rotation.z = rng.jitter(0, 0.25);
		g.add(blade);
	}
	return g;
}

/** Tiny flower — stem + colored head. */
export function flower(rng: Rng): THREE.Group {
	const g = new THREE.Group();
	const head = shadow(
		new THREE.Mesh(
			new THREE.IcosahedronGeometry(0.045, 1),
			clay(rng.pick(['#f2b8c6', '#f5d76e', '#ffffff', '#f09a8b']))
		)
	);
	head.position.y = 0.12;
	g.add(head);
	const stem = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.1, 4), clay('#7fae62')));
	stem.position.y = 0.05;
	g.add(stem);
	return g;
}

export function pebble(rng: Rng): THREE.Group {
	const g = new THREE.Group();
	const p = shadow(
		new THREE.Mesh(
			new THREE.IcosahedronGeometry(rng.range(0.05, 0.1), 1),
			clay(jitterColor(rng, '#b9b2a6', 0.004, 0.02, 0.06))
		)
	);
	p.scale.y = 0.55;
	p.rotation.y = rng.range(0, Math.PI * 2);
	p.position.y = 0.03;
	g.add(p);
	return g;
}

/** Clay sheep — MEADOW signature. A woolly capsule with a dark head. */
export function sheep(rng: Rng): THREE.Group {
	const g = new THREE.Group();
	const body = shadow(
		new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.12, 4, 10), clay(jitterColor(rng, '#f7f3ea', 0.002, 0.01, 0.03)))
	);
	body.rotation.z = Math.PI / 2;
	body.position.y = 0.11;
	g.add(body);
	const head = shadow(
		new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), clay('#4a423b'))
	);
	head.position.set(0.13, 0.13, 0);
	g.add(head);
	g.rotation.y = rng.range(0, Math.PI * 2);
	g.scale.setScalar(rng.range(0.85, 1.15));
	return g;
}

/** Berry bush — GROVE signature: a bush studded with bright berries. */
export function berryBush(rng: Rng): THREE.Group {
	const g = bush(rng);
	const berryColor = rng.pick(['#e05e4a', '#f09a8b', '#f5d76e']);
	const n = rng.int(3, 5);
	for (let i = 0; i < n; i++) {
		const b = shadow(new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 5), clay(berryColor)));
		const a = rng.range(0, Math.PI * 2);
		const el = rng.range(0.2, 1.1);
		b.position.set(Math.cos(a) * 0.13 * Math.cos(el), 0.1 + 0.1 * Math.sin(el), Math.sin(a) * 0.13 * Math.cos(el));
		g.add(b);
	}
	return g;
}

/** Cairn — MOUNTAIN signature: hand-stacked stones. */
export function cairn(rng: Rng): THREE.Group {
	const g = new THREE.Group();
	const n = rng.int(3, 4);
	let y = 0.03;
	for (let i = 0; i < n; i++) {
		const r = 0.11 - i * 0.024;
		const stone = shadow(
			new THREE.Mesh(new THREE.SphereGeometry(r, 7, 5), clay(jitterColor(rng, '#a8a094', 0.004, 0.02, 0.05)))
		);
		stone.scale.y = 0.55;
		stone.position.set(rng.jitter(0, 0.012), y, rng.jitter(0, 0.012));
		stone.rotation.y = rng.range(0, Math.PI);
		g.add(stone);
		y += r * 0.9;
	}
	return g;
}

/** Ore rock — ORECLIFF signature: dark stone with gold nuggets. */
export function oreRock(rng: Rng): THREE.Group {
	const g = new THREE.Group();
	const base = shadow(
		new THREE.Mesh(
			new THREE.DodecahedronGeometry(rng.range(0.14, 0.22), 1),
			clay(jitterColor(rng, '#6e675e', 0.004, 0.02, 0.04))
		)
	);
	base.position.y = 0.08;
	base.scale.y = 0.75;
	base.rotation.set(rng.next(), rng.next() * 3, rng.next());
	g.add(base);
	const n = rng.int(2, 4);
	for (let i = 0; i < n; i++) {
		const nug = shadow(new THREE.Mesh(new THREE.IcosahedronGeometry(0.03, 0), clay('#e3b34e')));
		const a = rng.range(0, Math.PI * 2);
		nug.position.set(Math.cos(a) * 0.12, rng.range(0.05, 0.16), Math.sin(a) * 0.12);
		g.add(nug);
	}
	return g;
}

/** Amber crystal shards — ORECLIFF accent. */
export function crystal(rng: Rng): THREE.Group {
	const g = new THREE.Group();
	const n = rng.int(2, 3);
	for (let i = 0; i < n; i++) {
		const h = rng.range(0.12, 0.24);
		const c = shadow(
			new THREE.Mesh(
				new THREE.OctahedronGeometry(0.05, 0),
				clay(rng.pick(['#f2cd74', '#f5b85c', '#e8d9a0']))
			)
		);
		c.scale.set(0.7, h / 0.05, 0.7);
		c.position.set(rng.jitter(0, 0.09), h * 0.5, rng.jitter(0, 0.09));
		c.rotation.y = rng.range(0, Math.PI);
		c.rotation.z = rng.jitter(0, 0.2);
		g.add(c);
	}
	return g;
}

/** Palm — DUNES signature: curved trunk, fan of leaves, coconuts. */
export function palm(rng: Rng): THREE.Group {
	const g = new THREE.Group();
	const lean = rng.jitter(0, 0.22);
	const segs = 3;
	let x = 0;
	let y = 0;
	for (let i = 0; i < segs; i++) {
		const seg = shadow(
			new THREE.Mesh(new THREE.CylinderGeometry(0.035 - i * 0.005, 0.045 - i * 0.005, 0.18, 7), clay(jitterColor(rng, '#b08a5e')))
		);
		seg.position.set(x, y + 0.09, 0);
		seg.rotation.z = lean * (i + 1) * 0.6;
		g.add(seg);
		x += Math.sin(lean * (i + 1) * 0.6) * 0.16;
		y += Math.cos(lean * (i + 1) * 0.6) * 0.165;
	}
	const crown = new THREE.Group();
	crown.position.set(x, y + 0.02, 0);
	const leaves = rng.int(5, 7);
	const leafColor = jitterColor(rng, '#5aa86e');
	for (let i = 0; i < leaves; i++) {
		const leaf = shadow(new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.2, 3, 6), clay(leafColor)));
		leaf.scale.set(1, 1, 0.4);
		const a = (i / leaves) * Math.PI * 2 + rng.jitter(0, 0.2);
		leaf.position.set(Math.cos(a) * 0.11, 0.02, Math.sin(a) * 0.11);
		leaf.rotation.y = -a;
		leaf.rotation.z = Math.PI / 2 - 0.55 + rng.jitter(0, 0.12);
		crown.add(leaf);
	}
	for (let i = 0; i < 2; i++) {
		const nut = shadow(new THREE.Mesh(new THREE.SphereGeometry(0.032, 7, 5), clay('#8a6844')));
		const a = rng.range(0, Math.PI * 2);
		nut.position.set(Math.cos(a) * 0.05, -0.02, Math.sin(a) * 0.05);
		crown.add(nut);
	}
	g.add(crown);
	g.rotation.y = rng.range(0, Math.PI * 2);
	g.scale.setScalar(rng.range(0.9, 1.35));
	return g;
}

/** Sunflower — SUNPLAINS signature: golden disc chasing the sun. */
export function sunflower(rng: Rng): THREE.Group {
	const g = new THREE.Group();
	const h = rng.range(0.22, 0.34);
	const stem = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.018, h, 5), clay('#7fae62')));
	stem.position.y = h / 2;
	g.add(stem);
	const head = new THREE.Group();
	head.position.y = h;
	const petals = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.018, 12), clay(jitterColor(rng, '#f5c95c', 0.008, 0.05, 0.03))));
	head.add(petals);
	const core = shadow(new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), clay('#8a6432')));
	core.scale.y = 0.4;
	core.position.y = 0.012;
	head.add(core);
	head.rotation.x = rng.range(0.25, 0.5);
	head.rotation.y = rng.range(0, Math.PI * 2);
	g.add(head);
	g.scale.setScalar(rng.range(0.85, 1.2));
	return g;
}

/** Cattail reeds — LAKE / wet edges: tall stems with brown heads. */
export function reeds(rng: Rng): THREE.Group {
	const g = new THREE.Group();
	const n = rng.int(4, 7);
	for (let i = 0; i < n; i++) {
		const h = rng.range(0.24, 0.42);
		const stem = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.014, h, 4), facet(jitterColor(rng, '#6fae53', 0.012, 0.06, 0.05))));
		const px = rng.jitter(0, 0.09);
		const pz = rng.jitter(0, 0.09);
		stem.position.set(px, h / 2, pz);
		stem.rotation.z = rng.jitter(0, 0.12);
		g.add(stem);
		if (rng.chance(0.7)) {
			const head = shadow(new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.07, 2, 5), facet('#8a5a2e')));
			head.position.set(px + stem.rotation.z * -h * 0.5, h + 0.03, pz);
			g.add(head);
		}
	}
	return g;
}

/** Lily pad — LAKE surface: floating disc, sometimes flowering. */
export function lilyPad(rng: Rng): THREE.Group {
	const g = new THREE.Group();
	const n = rng.int(1, 3);
	for (let i = 0; i < n; i++) {
		const pr = rng.range(0.09, 0.16);
		const pad = shadow(
			new THREE.Mesh(new THREE.CylinderGeometry(pr, pr, 0.014, 7), facet(jitterColor(rng, '#4f9c50', 0.012, 0.06, 0.05)))
		);
		pad.position.set(rng.jitter(0, 0.14), 0.008, rng.jitter(0, 0.14));
		g.add(pad);
		if (rng.chance(0.35)) {
			const bloom = shadow(new THREE.Mesh(new THREE.IcosahedronGeometry(0.04, 0), facet(rng.chance(0.6) ? '#f5f0e6' : '#f2b8c6')));
			bloom.position.copy(pad.position).setY(0.04);
			g.add(bloom);
		}
	}
	return g;
}

/** Wheat/flax sheaf — FIBERFIELD signature: a leaning golden bundle. */
export function sheaf(rng: Rng): THREE.Group {
	const g = new THREE.Group();
	const n = rng.int(5, 8);
	for (let i = 0; i < n; i++) {
		const h = rng.range(0.2, 0.3);
		const straw = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.01, h, 5), clay(jitterColor(rng, '#dcb84f', 0.01, 0.06, 0.05))));
		const a = (i / n) * Math.PI * 2;
		straw.position.set(Math.cos(a) * 0.045, h / 2, Math.sin(a) * 0.045);
		straw.rotation.z = Math.cos(a) * 0.22;
		straw.rotation.x = -Math.sin(a) * 0.22;
		g.add(straw);
	}
	g.rotation.y = rng.range(0, Math.PI * 2);
	return g;
}

/** Golden grass — tall dry tuft for FIBERFIELD / SUNPLAINS. */
export function goldTuft(rng: Rng): THREE.Group {
	const g = new THREE.Group();
	const n = rng.int(3, 5);
	const gold = jitterColor(rng, '#d9c27f', 0.015, 0.08, 0.05);
	for (let i = 0; i < n; i++) {
		const blade = shadow(
			new THREE.Mesh(new THREE.ConeGeometry(0.028, rng.range(0.16, 0.28), 6), clay(gold))
		);
		blade.position.set(rng.jitter(0, 0.07), 0.09, rng.jitter(0, 0.07));
		blade.rotation.z = rng.jitter(0, 0.3);
		g.add(blade);
	}
	return g;
}

/* ---------------------------------------------------------------------------
 * FACETED LOW-POLY toolkit — the stylised art direction (visible triangles,
 * flat shading, organically displaced silhouettes). Rolled out biome by
 * biome, starting with CLAYPIT.
 * ------------------------------------------------------------------------ */

/** Flat-shaded material — the faceted look lives or dies by this. */
function facet(color: string | THREE.Color): THREE.MeshStandardMaterial {
	return new THREE.MeshStandardMaterial({
		color,
		roughness: 0.95,
		metalness: 0,
		flatShading: true
	});
}

/**
 * Organic displacement: joggle vertices by a hash of their POSITION, so
 * coincident vertices (shared face corners of non-indexed polyhedra) move
 * identically — the shape stays watertight while the silhouette crumples
 * into believable low-poly rock.
 */
function displaceGeo(geo: THREE.BufferGeometry, rng: Rng, amount: number): THREE.BufferGeometry {
	const pos = geo.getAttribute('position');
	const ox = rng.range(0, 100);
	const oz = rng.range(0, 100);
	for (let i = 0; i < pos.count; i++) {
		const x = pos.getX(i);
		const y = pos.getY(i);
		const z = pos.getZ(i);
		const h1 = Math.sin((x + ox) * 12.9898 + (y - oz) * 78.233 + z * 37.719) * 43758.5453;
		const h2 = Math.sin((z + ox) * 26.651 + (x + oz) * 15.731 + y * 94.673) * 24634.6345;
		const h3 = Math.sin((y - ox) * 61.313 + (z - oz) * 11.135 + x * 53.989) * 56445.2345;
		pos.setXYZ(
			i,
			x + (h1 - Math.floor(h1) - 0.5) * amount,
			y + (h2 - Math.floor(h2) - 0.5) * amount,
			z + (h3 - Math.floor(h3) - 0.5) * amount
		);
	}
	geo.computeVertexNormals();
	return geo;
}

const CLAY_TONES = ['#d99862', '#c97f4d', '#c27b45', '#b06a3e', '#a95f36'];

/** Faceted terracotta boulder — CLAYPIT terrain anchor. */
export function clayBoulder(rng: Rng): THREE.Group {
	const g = new THREE.Group();
	const r = rng.range(0.55, 0.95);
	const geo = displaceGeo(new THREE.IcosahedronGeometry(r, 1), rng, r * 0.42);
	const b = shadow(new THREE.Mesh(geo, facet(jitterColor(rng, rng.pick(CLAY_TONES), 0.006, 0.04, 0.05))));
	b.scale.y = rng.range(0.65, 0.9);
	b.position.y = r * 0.55;
	b.rotation.y = rng.range(0, Math.PI * 2);
	g.add(b);
	if (rng.chance(0.5)) {
		const r2 = r * rng.range(0.4, 0.6);
		const s = shadow(
			new THREE.Mesh(
				displaceGeo(new THREE.IcosahedronGeometry(r2, 1), rng, r2 * 0.4),
				facet(jitterColor(rng, rng.pick(CLAY_TONES), 0.006, 0.04, 0.05))
			)
		);
		const a = rng.range(0, Math.PI * 2);
		s.position.set(Math.cos(a) * r * 1.1, r2 * 0.5, Math.sin(a) * r * 1.1);
		s.scale.y = 0.7;
		g.add(s);
	}
	return g;
}

/** Terraced clay mound — stacked faceted steps, like a dig site. */
export function clayTerrace(rng: Rng): THREE.Group {
	const g = new THREE.Group();
	const tiers = rng.int(2, 3);
	let y = 0;
	let r = rng.range(0.7, 1.05);
	for (let i = 0; i < tiers; i++) {
		const geo = displaceGeo(new THREE.CylinderGeometry(r * 0.82, r, 0.28, 7), rng, 0.12);
		const tier = shadow(
			new THREE.Mesh(geo, facet(jitterColor(rng, CLAY_TONES[Math.min(i + 1, 4)], 0.006, 0.04, 0.04)))
		);
		tier.position.y = y + 0.14;
		tier.rotation.y = rng.range(0, Math.PI * 2);
		g.add(tier);
		y += 0.26;
		r *= rng.range(0.62, 0.74);
	}
	return g;
}

/** Raw CLAY chunks — the biome's harvestable resource, unmistakably. */
export function clayChunks(rng: Rng): THREE.Group {
	const g = new THREE.Group();
	const n = rng.int(3, 5);
	for (let i = 0; i < n; i++) {
		const r = rng.range(0.16, 0.3);
		const geo = displaceGeo(new THREE.IcosahedronGeometry(r, 0), rng, r * 0.35);
		const chunk = shadow(
			new THREE.Mesh(geo, facet(jitterColor(rng, rng.chance(0.3) ? '#8f4a2c' : '#b35c33', 0.008, 0.05, 0.05)))
		);
		const a = rng.range(0, Math.PI * 2);
		const d = rng.range(0, 0.45);
		chunk.position.set(Math.cos(a) * d, r * 0.7, Math.sin(a) * d);
		chunk.rotation.set(rng.next() * 3, rng.next() * 3, rng.next() * 3);
		g.add(chunk);
	}
	return g;
}

/** Bare dead tree — sun-scorched claypit accent (faceted, leafless). */
export function deadTree(rng: Rng): THREE.Group {
	const g = new THREE.Group();
	const col = jitterColor(rng, '#7d4630', 0.006, 0.04, 0.05);
	const h = rng.range(1.0, 1.5);
	const trunk = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.13, h, 5), facet(col)));
	trunk.position.y = h / 2;
	trunk.rotation.z = rng.jitter(0, 0.1);
	g.add(trunk);
	const branches = rng.int(2, 3);
	for (let i = 0; i < branches; i++) {
		const bh = h * rng.range(0.35, 0.55);
		const br = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.06, bh, 4), facet(col)));
		const a = rng.range(0, Math.PI * 2);
		br.position.set(Math.cos(a) * 0.1, h * rng.range(0.55, 0.85), Math.sin(a) * 0.1);
		br.rotation.z = Math.cos(a) * rng.range(0.5, 0.9);
		br.rotation.x = Math.sin(a) * rng.range(0.5, 0.9);
		g.add(br);
	}
	g.scale.setScalar(rng.range(0.8, 1.2));
	return g;
}

/* --- FOREST v2 (faceted) -------------------------------------------------- */

const PINE_GREENS = ['#2e6b45', '#3f8a58', '#4f9c63', '#57a86b'];
const BARK = '#a8734a';

/** Tall tiered pine — the POLYGON-forest silhouette: long stub-branched
 * trunk, 5-7 jagged foliage skirts in alternating greens, a spired top. */
export function pineTall(rng: Rng): THREE.Group {
	const g = new THREE.Group();
	const h = rng.range(2.2, 3.3);
	const barkCol = jitterColor(rng, BARK, 0.008, 0.05, 0.05);

	const trunk = shadow(
		new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.1, h * 0.92, 6), facet(barkCol))
	);
	trunk.position.y = h * 0.46;
	g.add(trunk);

	// stub branches poking through the canopy
	const stubs = rng.int(2, 4);
	for (let i = 0; i < stubs; i++) {
		const stub = shadow(
			new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.02, rng.range(0.12, 0.24), 4), facet(barkCol))
		);
		const a = rng.range(0, Math.PI * 2);
		const sy = h * rng.range(0.25, 0.85);
		stub.position.set(Math.cos(a) * 0.09, sy, Math.sin(a) * 0.09);
		stub.rotation.z = Math.cos(a) * (1.2 + rng.jitter(0, 0.3));
		stub.rotation.x = -Math.sin(a) * (1.2 + rng.jitter(0, 0.3));
		g.add(stub);
	}

	// jagged foliage skirts
	const tiers = rng.int(5, 7);
	const y0 = h * 0.34;
	for (let i = 0; i < tiers; i++) {
		const t = i / (tiers - 1);
		const R = (0.72 - 0.5 * t) * rng.range(0.85, 1.15);
		const tierH = h * 0.15;
		const geo = displaceGeo(new THREE.ConeGeometry(R, tierH, 7), rng, R * 0.22);
		const cone = shadow(
			new THREE.Mesh(geo, facet(jitterColor(rng, PINE_GREENS[i % PINE_GREENS.length], 0.008, 0.05, 0.04)))
		);
		cone.position.y = y0 + (h * 0.62 * i) / tiers + tierH * 0.4;
		cone.rotation.y = rng.range(0, Math.PI * 2);
		g.add(cone);
	}
	const top = shadow(
		new THREE.Mesh(
			displaceGeo(new THREE.ConeGeometry(0.14, h * 0.16, 6), rng, 0.03),
			facet(jitterColor(rng, PINE_GREENS[3], 0.008, 0.05, 0.04))
		)
	);
	top.position.y = h * 0.98;
	g.add(top);

	g.rotation.y = rng.range(0, Math.PI * 2);
	g.scale.setScalar(rng.range(0.85, 1.2));
	return g;
}

/** Mossy fallen log with snapped stub branches. */
export function fallenLog(rng: Rng): THREE.Group {
	const g = new THREE.Group();
	const r = rng.range(0.13, 0.2);
	const len = rng.range(0.9, 1.5);
	const barkCol = jitterColor(rng, BARK, 0.008, 0.05, 0.05);

	const log = shadow(
		new THREE.Mesh(displaceGeo(new THREE.CylinderGeometry(r * 0.85, r, len, 7), rng, r * 0.18), facet(barkCol))
	);
	log.rotation.z = Math.PI / 2 + rng.jitter(0, 0.08);
	log.rotation.y = rng.range(0, Math.PI * 2);
	log.position.y = r * 0.85;
	g.add(log);

	// moss blanket
	const moss = shadow(
		new THREE.Mesh(
			displaceGeo(new THREE.IcosahedronGeometry(r * 1.05, 1), rng, r * 0.3),
			facet(jitterColor(rng, '#5da24f', 0.01, 0.06, 0.05))
		)
	);
	moss.scale.set(len * 0.32, 0.35, 1);
	moss.rotation.y = log.rotation.y;
	moss.position.y = r * 1.5;
	g.add(moss);

	const stubs = rng.int(2, 4);
	for (let i = 0; i < stubs; i++) {
		const stub = shadow(
			new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.025, rng.range(0.12, 0.22), 4), facet(barkCol))
		);
		const along = rng.range(-len * 0.35, len * 0.35);
		const dir = log.rotation.y;
		stub.position.set(Math.cos(dir) * along, r * rng.range(1.2, 1.7), -Math.sin(dir) * along);
		stub.rotation.set(rng.jitter(0, 1), rng.next() * 3, rng.jitter(0, 1));
		g.add(stub);
	}
	return g;
}

/** Stratified slab boulder — wide stacked layers, mossy cap chance. */
export function slabRock(rng: Rng): THREE.Group {
	const g = new THREE.Group();
	const tones = ['#6b7565', '#78826f', '#8a937f'];
	const layers = rng.int(2, 4);
	let y = 0;
	let R = rng.range(0.45, 0.75);
	for (let i = 0; i < layers; i++) {
		const lh = R * rng.range(0.28, 0.4);
		const geo = displaceGeo(new THREE.IcosahedronGeometry(R, 1), rng, R * 0.3);
		const slab = shadow(new THREE.Mesh(geo, facet(jitterColor(rng, rng.pick(tones), 0.005, 0.03, 0.05))));
		slab.scale.y = lh / R;
		slab.position.set(rng.jitter(0, R * 0.12), y + lh * 0.5, rng.jitter(0, R * 0.12));
		slab.rotation.y = rng.range(0, Math.PI * 2);
		g.add(slab);
		y += lh * 0.85;
		R *= rng.range(0.78, 0.92);
	}
	if (rng.chance(0.45)) {
		const moss = shadow(
			new THREE.Mesh(
				displaceGeo(new THREE.IcosahedronGeometry(R * 0.9, 1), rng, R * 0.25),
				facet(jitterColor(rng, '#5da24f', 0.01, 0.06, 0.05))
			)
		);
		moss.scale.y = 0.3;
		moss.position.y = y + R * 0.12;
		g.add(moss);
	}
	return g;
}

/** Scattered faceted stone pile. */
export function stonePile(rng: Rng): THREE.Group {
	const g = new THREE.Group();
	const n = rng.int(4, 7);
	for (let i = 0; i < n; i++) {
		const r = rng.range(0.07, 0.16);
		const s = shadow(
			new THREE.Mesh(
				displaceGeo(new THREE.IcosahedronGeometry(r, 0), rng, r * 0.3),
				facet(jitterColor(rng, rng.pick(['#6b7565', '#78826f', '#8a937f']), 0.005, 0.03, 0.06))
			)
		);
		const a = rng.range(0, Math.PI * 2);
		const d = rng.range(0, 0.3);
		s.position.set(Math.cos(a) * d, r * 0.6, Math.sin(a) * d);
		s.rotation.set(rng.next() * 3, rng.next() * 3, rng.next() * 3);
		g.add(s);
	}
	return g;
}

/** Chunky paddle-blade grass cluster — bright, faceted. */
export function grassBlades(rng: Rng): THREE.Group {
	const g = new THREE.Group();
	const n = rng.int(4, 6);
	for (let i = 0; i < n; i++) {
		const bh = rng.range(0.25, 0.5);
		const blade = shadow(
			new THREE.Mesh(
				new THREE.ConeGeometry(0.045, bh, 4),
				facet(jitterColor(rng, rng.chance(0.5) ? '#5fae3f' : '#7cc94e', 0.015, 0.08, 0.05))
			)
		);
		blade.scale.z = 0.45;
		const a = rng.range(0, Math.PI * 2);
		const d = rng.range(0, 0.16);
		blade.position.set(Math.cos(a) * d, bh * 0.45, Math.sin(a) * d);
		blade.rotation.y = rng.range(0, Math.PI * 2);
		blade.rotation.z = rng.jitter(0, 0.28);
		g.add(blade);
	}
	return g;
}

/** Birch — pale slender trunk, stacked light-green canopy lobes. */
export function birchTree(rng: Rng): THREE.Group {
	const g = new THREE.Group();
	const h = rng.range(1.7, 2.3);
	const trunk = shadow(
		new THREE.Mesh(
			new THREE.CylinderGeometry(0.035, 0.055, h * 0.85, 6),
			facet(jitterColor(rng, '#e3dbc9', 0.004, 0.02, 0.04))
		)
	);
	trunk.position.y = h * 0.42;
	g.add(trunk);
	const lobes = rng.int(2, 3);
	for (let i = 0; i < lobes; i++) {
		const r = (0.34 - i * 0.07) * rng.range(0.85, 1.15);
		const lobe = shadow(
			new THREE.Mesh(
				displaceGeo(new THREE.IcosahedronGeometry(r, 1), rng, r * 0.3),
				facet(jitterColor(rng, rng.chance(0.5) ? '#8cc763' : '#a5d67a', 0.012, 0.06, 0.04))
			)
		);
		lobe.position.set(rng.jitter(0, 0.08), h * 0.62 + i * r * 1.2, rng.jitter(0, 0.08));
		lobe.scale.y = 0.85;
		g.add(lobe);
	}
	g.rotation.y = rng.range(0, Math.PI * 2);
	g.scale.setScalar(rng.range(0.85, 1.15));
	return g;
}

/** Broadleaf — thick trunk, wide clustered dark canopy. */
export function broadleafTree(rng: Rng): THREE.Group {
	const g = new THREE.Group();
	const h = rng.range(1.3, 1.8);
	const trunk = shadow(
		new THREE.Mesh(
			new THREE.CylinderGeometry(0.07, 0.12, h * 0.6, 6),
			facet(jitterColor(rng, '#8a5f3c', 0.008, 0.05, 0.05))
		)
	);
	trunk.position.y = h * 0.3;
	g.add(trunk);
	const lumps = rng.int(3, 4);
	for (let i = 0; i < lumps; i++) {
		const r = rng.range(0.28, 0.42);
		const lump = shadow(
			new THREE.Mesh(
				displaceGeo(new THREE.IcosahedronGeometry(r, 1), rng, r * 0.32),
				facet(jitterColor(rng, rng.chance(0.5) ? '#3f8a45' : '#57a24f', 0.01, 0.05, 0.04))
			)
		);
		const a = (i / lumps) * Math.PI * 2 + rng.jitter(0, 0.5);
		lump.position.set(Math.cos(a) * 0.2, h * 0.68 + rng.jitter(0, 0.1), Math.sin(a) * 0.2);
		lump.scale.y = 0.8;
		g.add(lump);
	}
	g.rotation.y = rng.range(0, Math.PI * 2);
	g.scale.setScalar(rng.range(0.85, 1.2));
	return g;
}

/** Fern — arched dark blades fanning from the forest floor. */
export function fern(rng: Rng): THREE.Group {
	const g = new THREE.Group();
	const n = rng.int(4, 6);
	for (let i = 0; i < n; i++) {
		const bh = rng.range(0.3, 0.5);
		const blade = shadow(
			new THREE.Mesh(
				new THREE.ConeGeometry(0.05, bh, 4),
				facet(jitterColor(rng, '#3f7a3a', 0.012, 0.06, 0.04))
			)
		);
		blade.scale.z = 0.35;
		const a = (i / n) * Math.PI * 2 + rng.jitter(0, 0.3);
		blade.position.set(Math.cos(a) * 0.08, bh * 0.38, Math.sin(a) * 0.08);
		blade.rotation.y = -a;
		blade.rotation.z = rng.range(0.5, 0.85) * (Math.cos(a) >= 0 ? 1 : -1);
		blade.rotation.x = rng.jitter(0, 0.2);
		g.add(blade);
	}
	return g;
}

/** Mushroom cluster — red or brown caps on cream stems. */
export function mushrooms(rng: Rng): THREE.Group {
	const g = new THREE.Group();
	const n = rng.int(2, 4);
	const capColor = rng.chance(0.55) ? '#c4452f' : '#a5713f';
	for (let i = 0; i < n; i++) {
		const sh = rng.range(0.06, 0.13);
		const stem = shadow(
			new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.028, sh, 5), facet('#ede3cf'))
		);
		const px = rng.jitter(0, 0.1);
		const pz = rng.jitter(0, 0.1);
		stem.position.set(px, sh / 2, pz);
		g.add(stem);
		const cap = shadow(
			new THREE.Mesh(
				displaceGeo(new THREE.ConeGeometry(rng.range(0.05, 0.09), 0.07, 6), rng, 0.012),
				facet(jitterColor(rng, capColor, 0.008, 0.05, 0.04))
			)
		);
		cap.position.set(px, sh + 0.025, pz);
		g.add(cap);
	}
	return g;
}

/** Fallen twigs — thin sticks scattered on the ground. */
export function twigSticks(rng: Rng): THREE.Group {
	const g = new THREE.Group();
	const n = rng.int(2, 4);
	for (let i = 0; i < n; i++) {
		const len = rng.range(0.3, 0.6);
		const twig = shadow(
			new THREE.Mesh(
				new THREE.CylinderGeometry(0.012, 0.018, len, 4),
				facet(jitterColor(rng, '#9a6d45', 0.008, 0.04, 0.05))
			)
		);
		twig.rotation.z = Math.PI / 2 + rng.jitter(0, 0.15);
		twig.rotation.y = rng.range(0, Math.PI * 2);
		twig.position.set(rng.jitter(0, 0.2), 0.02, rng.jitter(0, 0.2));
		g.add(twig);
	}
	return g;
}

/**
 * MOUNTAIN v3 — four formation families with big variety in height and
 * steepness, per the low-poly references:
 *   RIDGE  — 1-3 great asymmetric peaks (elongated, leaning), green ledge
 *            shelves on the flanks, snow above the treeline
 *   MESA   — stratified stacked terraces in warm cliff beige
 *   SPIRES — a cluster of tall narrow rock needles
 *   FIELD  — chunky boulder scatter
 */
export function mountainPeaks(rng: Rng): THREE.Group {
	const g = new THREE.Group();
	const beige = rng.chance(0.4);
	const tones = beige
		? ['#cfc4b0', '#c0b29c', '#b3a48d']
		: ['#8a93a1', '#7e8894', '#99a2ae'];
	const kindRoll = rng.next();

	const greenLedge = (x: number, y: number, z: number, r: number): void => {
		const ledge = shadow(
			new THREE.Mesh(
				displaceGeo(new THREE.IcosahedronGeometry(r, 1), rng, r * 0.3),
				facet(jitterColor(rng, '#6cae53', 0.012, 0.06, 0.04))
			)
		);
		ledge.scale.y = 0.22;
		ledge.position.set(x, y, z);
		ledge.rotation.y = rng.range(0, Math.PI * 2);
		g.add(ledge);
	};

	if (kindRoll < 0.45) {
		// RIDGE — the skyline formation
		const peaks = rng.int(1, 3);
		for (let i = 0; i < peaks; i++) {
			const R = rng.range(0.7, 1.9) * (i === 0 ? 1 : rng.range(0.5, 0.75));
			const H = rng.range(2.2, 6.2) * (i === 0 ? 1 : rng.range(0.5, 0.8));
			const geo = displaceGeo(new THREE.ConeGeometry(R, H, rng.int(5, 7)), rng, R * 0.3);
			const peakMesh = shadow(
				new THREE.Mesh(geo, facet(jitterColor(rng, rng.pick(tones), 0.004, 0.02, 0.045)))
			);
			const a = rng.range(0, Math.PI * 2);
			const d = i === 0 ? 0 : rng.range(0.7, 1.3);
			peakMesh.position.set(Math.cos(a) * d, H * 0.38, Math.sin(a) * d);
			peakMesh.scale.set(1, 1, rng.range(0.6, 1)); // ridge elongation
			peakMesh.rotation.y = rng.range(0, Math.PI * 2);
			peakMesh.rotation.z = rng.jitter(0, 0.05); // subtle lean
			g.add(peakMesh);

			// green shelves clinging to the flanks
			if (rng.chance(0.65)) {
				const shelves = rng.int(1, 3);
				for (let s = 0; s < shelves; s++) {
					const sa = rng.range(0, Math.PI * 2);
					const sh = H * rng.range(0.18, 0.5);
					const sr = R * (1 - sh / H) * 1.05;
					greenLedge(
						peakMesh.position.x + Math.cos(sa) * sr,
						sh,
						peakMesh.position.z + Math.sin(sa) * sr,
						R * rng.range(0.25, 0.45)
					);
				}
			}
			// snow above the treeline
			if (H > 3.6 && rng.chance(0.85)) {
				const cap = shadow(
					new THREE.Mesh(
						displaceGeo(new THREE.ConeGeometry(R * 0.4, H * 0.28, 6), rng, R * 0.09),
						facet(jitterColor(rng, '#f2f3ee', 0.002, 0.01, 0.02))
					)
				);
				cap.position.set(peakMesh.position.x, H * 0.73, peakMesh.position.z);
				cap.scale.copy(peakMesh.scale);
				cap.rotation.y = peakMesh.rotation.y;
				g.add(cap);
			}
		}
	} else if (kindRoll < 0.7) {
		// MESA — stratified terraces (always warm cliff beige)
		const mesaTones = ['#cfc4b0', '#c0b29c', '#b3a48d'];
		const tiers = rng.int(3, 5);
		let y = 0;
		let R = rng.range(1.1, 1.9);
		for (let i = 0; i < tiers; i++) {
			const th = rng.range(0.45, 0.75);
			const geo = displaceGeo(new THREE.CylinderGeometry(R * 0.88, R, th, rng.int(6, 8)), rng, R * 0.16);
			const tier = shadow(
				new THREE.Mesh(geo, facet(jitterColor(rng, mesaTones[i % 3], 0.004, 0.02, 0.04)))
			);
			tier.position.set(rng.jitter(0, R * 0.08), y + th * 0.5, rng.jitter(0, R * 0.08));
			tier.rotation.y = rng.range(0, Math.PI * 2);
			g.add(tier);
			y += th * 0.92;
			R *= rng.range(0.72, 0.85);
		}
		if (rng.chance(0.6)) greenLedge(rng.jitter(0, 0.3), y + 0.06, rng.jitter(0, 0.3), R * 1.1);
	} else if (kindRoll < 0.85) {
		// SPIRES — narrow rock needles
		const spires = rng.int(3, 5);
		for (let i = 0; i < spires; i++) {
			const R = rng.range(0.16, 0.36);
			const H = rng.range(1.2, 3.4);
			const geo = displaceGeo(new THREE.ConeGeometry(R, H, 5), rng, R * 0.35);
			const spire = shadow(
				new THREE.Mesh(geo, facet(jitterColor(rng, rng.pick(tones), 0.004, 0.02, 0.05)))
			);
			const a = rng.range(0, Math.PI * 2);
			const d = rng.range(0.15, 1.0);
			spire.position.set(Math.cos(a) * d, H * 0.4, Math.sin(a) * d);
			spire.rotation.z = rng.jitter(0, 0.07);
			spire.rotation.y = rng.range(0, Math.PI * 2);
			g.add(spire);
		}
	} else {
		// FIELD — chunky boulders
		const n = rng.int(3, 5);
		for (let i = 0; i < n; i++) {
			const r = rng.range(0.4, 0.95);
			const b = shadow(
				new THREE.Mesh(
					displaceGeo(new THREE.IcosahedronGeometry(r, 1), rng, r * 0.34),
					facet(jitterColor(rng, rng.pick(tones), 0.004, 0.02, 0.05))
				)
			);
			const a = rng.range(0, Math.PI * 2);
			const d = rng.range(0, 1.1);
			b.position.set(Math.cos(a) * d, r * 0.55, Math.sin(a) * d);
			b.scale.y = rng.range(0.6, 0.85);
			b.rotation.set(rng.jitter(0, 0.4), rng.range(0, Math.PI * 2), rng.jitter(0, 0.4));
			g.add(b);
		}
	}
	return g;
}

/** Terracotta mud mound — CLAYPIT signature. */
export function mudMound(rng: Rng): THREE.Group {
	const g = new THREE.Group();
	const mound = shadow(
		new THREE.Mesh(new THREE.SphereGeometry(rng.range(0.12, 0.2), 9, 6), clay(jitterColor(rng, '#c08258', 0.008, 0.04, 0.05)))
	);
	mound.scale.y = rng.range(0.35, 0.5);
	mound.position.y = 0.04;
	g.add(mound);
	if (rng.chance(0.6)) {
		const top = shadow(new THREE.Mesh(new THREE.SphereGeometry(0.06, 7, 5), clay(jitterColor(rng, '#a9703f'))));
		top.scale.y = 0.4;
		top.position.y = 0.1;
		g.add(top);
	}
	return g;
}

/** Cactus — DUNES alternative to puff trees. */
export function cactus(rng: Rng): THREE.Group {
	const g = new THREE.Group();
	const green = jitterColor(rng, '#6fae7d');
	const body = shadow(new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.22, 3, 8), clay(green)));
	body.position.y = 0.18;
	g.add(body);
	if (rng.chance(0.6)) {
		const arm = shadow(new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.1, 3, 8), clay(green)));
		arm.position.set(0.1, 0.2, 0);
		arm.rotation.z = -0.5;
		g.add(arm);
	}
	g.rotation.y = rng.range(0, Math.PI * 2);
	g.scale.setScalar(rng.range(0.8, 1.2));
	return g;
}
