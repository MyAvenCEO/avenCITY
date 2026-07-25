/**
 * Scene shell: renderer, camera, lights, sea, and world mounting.
 *
 * Client-only — import dynamically from onMount. The sky color here must
 * match --color-sky in tokens.css so canvas and page blend seamlessly.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { generateMap } from '../hexmap';
import { buildWorld } from './buildWorld';

const SKY = '#cde9ec';
const SEA = '#8fc9cd';

export interface SceneApi {
	setWorld(seed: number): void;
	dispose(): void;
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

export function createScene(canvas: HTMLCanvasElement): SceneApi {
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
	controls.maxDistance = 48;
	controls.maxPolarAngle = Math.PI * 0.46;

	// soft sky/ground fill + warm sun with shadows
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

	// the sea the island floats in
	const sea = new THREE.Mesh(
		new THREE.CylinderGeometry(70, 70, 0.6, 64),
		new THREE.MeshStandardMaterial({ color: SEA, roughness: 0.6, metalness: 0 })
	);
	sea.position.y = -0.31;
	sea.receiveShadow = true;
	scene.add(sea);

	let world: THREE.Group | null = null;

	function setWorld(seed: number): void {
		if (world) {
			scene.remove(world);
			disposeObject(world);
		}
		world = buildWorld(generateMap(seed));
		// center the island on the origin
		const box = new THREE.Box3().setFromObject(world);
		const center = box.getCenter(new THREE.Vector3());
		world.position.x = -center.x;
		world.position.z = -center.z;
		scene.add(world);
	}

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
			controls.dispose();
			if (world) disposeObject(world);
			disposeObject(scene);
			renderer.dispose();
		}
	};
}
