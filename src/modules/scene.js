import * as THREE from "three";
import { OrbitControls } from "../utils/OrbitControls.js";
import { SIZES } from "./config.js";
import { state } from "./state.js";

import { environmentMap } from "./materials.js";

export const scene = new THREE.Scene();
scene.environment = environmentMap;
scene.background = environmentMap;

export const camera = new THREE.PerspectiveCamera(
  45,
  SIZES.width / SIZES.height,
  0.1,
  1000,
);
camera.position.set(109.35682075158908, 35.704396522969226, -77.44092573698502);

export const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#experience-canvas"),
  antialias: true,
});
renderer.setSize(SIZES.width, SIZES.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x222222);

export const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 20;
controls.maxDistance = 140;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;
controls.minAzimuthAngle = Math.PI / 2;
controls.maxAzimuthAngle = Math.PI;
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(
  -15.032524979835078,
  13.056863836526139,
  -11.60751480655244,
);

controls.addEventListener("start", () => {
  state.isDragging = true;
});

controls.addEventListener("end", () => {
  state.isDragging = false;
  state.raycasterNeedsUpdate = true;
});

window.addEventListener("resize", () => {
  SIZES.width = window.innerWidth;
  SIZES.height = window.innerHeight;

  camera.aspect = SIZES.width / SIZES.height;
  camera.updateProjectionMatrix();

  renderer.setSize(SIZES.width, SIZES.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
