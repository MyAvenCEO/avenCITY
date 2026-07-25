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

const SKY = '#cde9ec';
const SEA = '#8fc9cd';
const HEX_HEIGHT = 0.5; // keep in sync with buildWorld

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

/** White clay ring that floats around the selected hex. */
function makeSelectionRing(): THREE.Mesh {
	const shape = new THREE.Shape();
	const hole = new THREE.Path();
	for (let i = 0; i < 6; i++) {
		const a = (Math.PI / 3) * i;
		const target = i === 0 ? 'moveTo' : 'lineTo';
		shape[target](Math.cos(a) * 1.04, Math.sin(a) * 1.04);
		hole[target](Math.cos(a) * 0.88, Math.sin(a) * 0.88);
	}
	shape.closePath();
	hole.closePath();
	shape.holes.push(hole);
	const geo = new THREE.ExtrudeGeometry(shape, {
		depth: 0.03,
		bevelEnabled: true,
		bevelThickness: 0.02,
		bevelSize: 0.02,
		bevelSegments: 2
	});
	geo.rotateX(-Math.PI / 2);
	const mesh = new THREE.Mesh(
		geo,
		new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.55, metalness: 0 })
	);
	mesh.castShadow = true;
	mesh.visible = false;
	return mesh;
}

export function createScene(canvas: HTMLCanvasElement, options: SceneOptions = {}): SceneApi {
	const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.05;

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(SKY);
	scene.fog = new THREE.Fog(SKY, 55, 110);

	const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 220);
	camera.position.set(14, 16, 20);

	const controls = new OrbitControls(camera, canvas);
	controls.enableDamping = true;
	controls.dampingFactor = 0.08;
	controls.minDistance = 8;
	controls.maxDistance = 60;
	controls.maxPolarAngle = Math.PI * 0.46;

	scene.add(new THREE.HemisphereLight('#eaf6ff', '#d8c9a8', 0.95));
	const sun = new THREE.DirectionalLight('#fff2dd', 2.1);
	sun.position.set(16, 24, 10);
	sun.castShadow = true;
	sun.shadow.mapSize.set(2048, 2048);
	sun.shadow.camera.left = -22;
	sun.shadow.camera.right = 22;
	sun.shadow.camera.top = 22;
	sun.shadow.camera.bottom = -22;
	sun.shadow.camera.far = 70;
	sun.shadow.bias = -0.0004;
	scene.add(sun);

	const sea = new THREE.Mesh(
		new THREE.CylinderGeometry(70, 70, 0.6, 64),
		new THREE.MeshStandardMaterial({ color: SEA, roughness: 0.6, metalness: 0 })
	);
	sea.position.y = -0.31;
	sea.receiveShadow = true;
	scene.add(sea);

	const ring = makeSelectionRing();
	scene.add(ring);

	let world: THREE.Group | null = null;

	function setWorld(seed: number): void {
		if (world) {
			scene.remove(world);
			disposeObject(world);
		}
		world = buildWorld(generateMap(seed));
		const box = new THREE.Box3().setFromObject(world);
		const center = box.getCenter(new THREE.Vector3());
		world.position.x = -center.x;
		world.position.z = -center.z;
		scene.add(world);
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

	let raf = 0;
	function animate(): void {
		raf = requestAnimationFrame(animate);
		resize();
		controls.update();
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
			if (world) disposeObject(world);
			disposeObject(scene);
			renderer.dispose();
		}
	};
}
