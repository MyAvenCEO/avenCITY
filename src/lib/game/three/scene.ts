/**
 * Scene shell: renderer, camera, lights, sea, world mounting and picking.
 *
 * Client-only — import dynamically from onMount. The sky color here must
 * match --color-sky in tokens.css so canvas and page blend seamlessly.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { generateMap, type HexTile } from '../hexmap';
import { buildWorld } from './buildWorld';
import { createWater } from './water';

const SKY = '#cde9ec';
const HEX_HEIGHT = 0.5; // keep in sync with buildWorld
const WATER_LEVEL = 0.3; // sea surface laps against the island walls

export interface SceneApi {
	setWorld(seed: number): void;
	dispose(): void;
}

export interface SceneOptions {
	/** Fires with the clicked tile, or null when clicking sea/empty space. */
	onSelect?(tile: HexTile | null): void;
}

function disposeObject(root: THREE.Object3D): void {
	root.traverse((obj) => {
		if (obj instanceof THREE.Mesh) {
			obj.geometry.dispose();
			const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
			for (const m of mats) m.dispose();
		}
	});
}

/** Slim, semi-transparent ring around the selected hex — present, not loud. */
function makeSelectionRing(): THREE.Mesh {
	const shape = new THREE.Shape();
	const hole = new THREE.Path();
	for (let i = 0; i < 6; i++) {
		const a = (Math.PI / 3) * i;
		const target = i === 0 ? 'moveTo' : 'lineTo';
		shape[target](Math.cos(a) * 0.99, Math.sin(a) * 0.99);
		hole[target](Math.cos(a) * 0.93, Math.sin(a) * 0.93);
	}
	shape.closePath();
	hole.closePath();
	shape.holes.push(hole);
	const geo = new THREE.ExtrudeGeometry(shape, {
		depth: 0.012,
		bevelEnabled: true,
		bevelThickness: 0.008,
		bevelSize: 0.008,
		bevelSegments: 2
	});
	geo.rotateX(-Math.PI / 2);
	const mesh = new THREE.Mesh(
		geo,
		new THREE.MeshStandardMaterial({
			color: '#fffdf6',
			roughness: 0.6,
			metalness: 0,
			transparent: true,
			opacity: 0.75
		})
	);
	mesh.visible = false;
	return mesh;
}

export function createScene(canvas: HTMLCanvasElement, options: SceneOptions = {}): SceneApi {
	const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.05;

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(SKY);
	scene.fog = new THREE.Fog(SKY, 160, 340);

	const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 600);
	camera.position.set(48, 46, 64);

	const controls = new OrbitControls(camera, canvas);
	controls.enableDamping = true;
	controls.dampingFactor = 0.08;
	controls.minDistance = 8;
	controls.maxDistance = 190;
	controls.maxPolarAngle = Math.PI * 0.46;

	scene.add(new THREE.HemisphereLight('#eaf6ff', '#d8c9a8', 0.95));
	const sun = new THREE.DirectionalLight('#fff2dd', 2.1);
	sun.position.set(60, 84, 36);
	sun.castShadow = true;
	sun.shadow.mapSize.set(4096, 4096);
	sun.shadow.camera.left = -90;
	sun.shadow.camera.right = 90;
	sun.shadow.camera.top = 90;
	sun.shadow.camera.bottom = -90;
	sun.shadow.camera.far = 280;
	sun.shadow.bias = -0.0004;
	scene.add(sun);

	// the living sea (Gerstner waves + shore foam, see water.ts)
	const water = createWater(560, WATER_LEVEL);
	(water.mesh.material as THREE.ShaderMaterial).uniforms.uSunDir.value
		.copy(sun.position)
		.normalize();
	scene.add(water.mesh);

	const ring = makeSelectionRing();
	scene.add(ring);

	let world: THREE.Group | null = null;

	function setWorld(seed: number): void {
		if (world) {
			scene.remove(world);
			disposeObject(world);
		}
		const map = generateMap(seed);
		world = buildWorld(map);
		const box = new THREE.Box3().setFromObject(world);
		const center = box.getCenter(new THREE.Vector3());
		world.position.x = -center.x;
		world.position.z = -center.z;
		scene.add(world);
		water.setWorld(map.tiles, world.position.x, world.position.z);
		ring.visible = false;
		options.onSelect?.(null);
	}

	// --- picking: click (not drag) selects a tile ---------------------------
	const raycaster = new THREE.Raycaster();
	const pointer = new THREE.Vector2();
	let downX = 0;
	let downY = 0;

	function onPointerDown(e: PointerEvent): void {
		downX = e.clientX;
		downY = e.clientY;
	}

	function onPointerUp(e: PointerEvent): void {
		if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return; // was a drag
		if (!world) return;
		const rect = canvas.getBoundingClientRect();
		pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
		pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
		raycaster.setFromCamera(pointer, camera);
		const hits = raycaster.intersectObjects(world.children, true);

		let tile: HexTile | null = null;
		for (const hit of hits) {
			let obj: THREE.Object3D | null = hit.object;
			while (obj && !obj.userData.tile) obj = obj.parent;
			if (obj?.userData.tile) {
				tile = obj.userData.tile as HexTile;
				break;
			}
		}

		if (tile) {
			ring.visible = true;
			ring.position.set(tile.x + world.position.x, HEX_HEIGHT + 0.01, tile.z + world.position.z);
		} else {
			ring.visible = false;
		}
		options.onSelect?.(tile);
	}

	canvas.addEventListener('pointerdown', onPointerDown);
	canvas.addEventListener('pointerup', onPointerUp);

	function resize(): void {
		const w = canvas.clientWidth;
		const h = canvas.clientHeight;
		if (canvas.width !== w * renderer.getPixelRatio() || canvas.height !== h * renderer.getPixelRatio()) {
			renderer.setSize(w, h, false);
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
		}
	}

	// dev diagnostics handle (harmless in prod; enables live inspection)
	(window as unknown as Record<string, unknown>).__scene = { renderer, scene, camera, water, sun };

	const clock = new THREE.Clock();
	let raf = 0;
	function animate(): void {
		raf = requestAnimationFrame(animate);
		resize();
		controls.update();
		water.update(clock.getElapsedTime());
		renderer.render(scene, camera);
	}
	animate();

	return {
		setWorld,
		dispose(): void {
			cancelAnimationFrame(raf);
			canvas.removeEventListener('pointerdown', onPointerDown);
			canvas.removeEventListener('pointerup', onPointerUp);
			controls.dispose();
			water.dispose();
			if (world) disposeObject(world);
			disposeObject(scene);
			renderer.dispose();
		}
	};
}
