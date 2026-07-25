/**
 * The biome sandbox: one specimen tile on a display pedestal.
 * Used to iterate on per-biome clay styling in isolation — and, later, to
 * preview per-biome upgrade-level styling variants.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { BiomeId } from '../hexmap';
import { buildBiomeTile } from './buildWorld';

const SKY = '#cde9ec';

export interface SandboxApi {
	show(biome: BiomeId, seed: number): void;
	dispose(): void;
}

export function createSandbox(canvas: HTMLCanvasElement): SandboxApi {
	const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.05;

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(SKY);

	const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
	camera.position.set(2.1, 1.9, 2.8);

	const controls = new OrbitControls(camera, canvas);
	controls.enableDamping = true;
	controls.dampingFactor = 0.08;
	controls.minDistance = 1.4;
	controls.maxDistance = 8;
	controls.maxPolarAngle = Math.PI * 0.49;
	controls.target.set(0, 0.35, 0);

	scene.add(new THREE.HemisphereLight('#eaf6ff', '#d8c9a8', 0.95));
	const sun = new THREE.DirectionalLight('#fff2dd', 2.1);
	sun.position.set(4, 6, 2.5);
	sun.castShadow = true;
	sun.shadow.mapSize.set(2048, 2048);
	sun.shadow.camera.left = -3;
	sun.shadow.camera.right = 3;
	sun.shadow.camera.top = 3;
	sun.shadow.camera.bottom = -3;
	sun.shadow.camera.far = 20;
	sun.shadow.bias = -0.0004;
	scene.add(sun);

	// soft display pedestal catching the tile's shadow
	const pedestal = new THREE.Mesh(
		new THREE.CylinderGeometry(2.4, 2.6, 0.18, 48),
		new THREE.MeshStandardMaterial({ color: '#bcdfe3', roughness: 0.95, metalness: 0 })
	);
	pedestal.position.y = -0.1;
	pedestal.receiveShadow = true;
	scene.add(pedestal);

	let specimen: THREE.Mesh | null = null;

	function show(biome: BiomeId, seed: number): void {
		if (specimen) {
			scene.remove(specimen);
			specimen.geometry.dispose();
			(specimen.material as THREE.Material).dispose();
		}
		specimen = buildBiomeTile(biome, seed);
		scene.add(specimen);
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
		show,
		dispose(): void {
			cancelAnimationFrame(raf);
			controls.dispose();
			if (specimen) {
				specimen.geometry.dispose();
				(specimen.material as THREE.Material).dispose();
			}
			pedestal.geometry.dispose();
			(pedestal.material as THREE.Material).dispose();
			renderer.dispose();
		}
	};
}
