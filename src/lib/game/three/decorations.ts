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
		flatShading: true
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
		new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.22, 6), clay(jitterColor(rng, TRUNK)))
	);
	trunk.position.y = 0.11;
	g.add(trunk);
	const tiers = rng.int(2, 3);
	const green = jitterColor(rng, '#3f8a63');
	for (let i = 0; i < tiers; i++) {
		const radius = 0.3 - i * 0.075;
		const cone = shadow(
			new THREE.Mesh(new THREE.ConeGeometry(radius, 0.34, 7), clay(green.clone().offsetHSL(0, 0, i * 0.03)))
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
		new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.075, 0.3, 6), clay(jitterColor(rng, TRUNK)))
	);
	trunk.position.y = 0.15;
	g.add(trunk);
	const crown = shadow(
		new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 0), clay(jitterColor(rng, color)))
	);
	crown.position.y = 0.5;
	crown.scale.set(1, rng.range(0.85, 1.1), 1);
	crown.rotation.set(rng.next(), rng.next(), rng.next());
	g.add(crown);
	if (rng.chance(0.4)) {
		const side = shadow(
			new THREE.Mesh(new THREE.IcosahedronGeometry(0.18, 0), clay(jitterColor(rng, color)))
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

export function rock(rng: Rng, scale = 1): THREE.Group {
	const g = new THREE.Group();
	const n = rng.int(1, 2);
	for (let i = 0; i < n; i++) {
		const r = shadow(
			new THREE.Mesh(
				new THREE.DodecahedronGeometry(rng.range(0.12, 0.24) * scale, 0),
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
			new THREE.ConeGeometry(rng.range(0.34, 0.46), rng.range(0.7, 1.05), 5),
			clay(jitterColor(rng, '#989184', 0.004, 0.02, 0.05))
		)
	);
	main.position.y = 0.32;
	main.rotation.y = rng.range(0, Math.PI * 2);
	g.add(main);
	if (rng.chance(0.7)) {
		const side = shadow(
			new THREE.Mesh(
				new THREE.ConeGeometry(rng.range(0.2, 0.3), rng.range(0.4, 0.6), 5),
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
			new THREE.Mesh(new THREE.ConeGeometry(0.035, rng.range(0.1, 0.18), 5), clay(green))
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
			new THREE.IcosahedronGeometry(0.045, 0),
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
			new THREE.IcosahedronGeometry(rng.range(0.05, 0.1), 0),
			clay(jitterColor(rng, '#b9b2a6', 0.004, 0.02, 0.06))
		)
	);
	p.scale.y = 0.55;
	p.rotation.y = rng.range(0, Math.PI * 2);
	p.position.y = 0.03;
	g.add(p);
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
