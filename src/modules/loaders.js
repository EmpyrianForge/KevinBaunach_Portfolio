import * as THREE from "three";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { state } from "./state.js";
import { TEXTURE_MAP } from "./config.js";
import {
  glassMaterial,
  blueMaterial,
  orangeMaterial,
  glassGreenMaterial,
  whiteMaterial,
  environmentMap,
} from "./materials.js";
import { bannerMaterial } from "./banner.js";
import { scene } from "./scene.js";

export const textureLoader = new THREE.TextureLoader();
export const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

export const manager = new THREE.LoadingManager();
export const gltfLoader = new GLTFLoader(manager);
gltfLoader.setDRACOLoader(dracoLoader);

const loadingScreen = document.querySelector(".loading-screen");
const loadingScreenButton = document.querySelector(".loading-screen-button");

export const loadedTextures = {
  day: {},
};

export const initLoaders = () => {
  // Load Baked Textures
  Object.entries(TEXTURE_MAP).forEach(([key, paths]) => {
    const dayTexture = textureLoader.load(paths.day);
    dayTexture.flipY = false;
    dayTexture.colorSpace = THREE.SRGBColorSpace;
    loadedTextures.day[key] = dayTexture;
  });

  manager.onLoad = () => {
    setupLoadingScreen();
  };

  loadMainModel();
};

const setupLoadingScreen = () => {
  loadingScreenButton.style.border = "8px solid #55293A";
  loadingScreenButton.style.backgroundColor = "#A6754A";
  loadingScreenButton.style.color = "#e5dee6";
  loadingScreenButton.style.boxShadow = "rgba(0, 0, 0, 0.24) 0px 3px 8px ";
  loadingScreenButton.textContent = "Click to Enter";
  loadingScreenButton.style.cursor = "pointer";
  loadingScreenButton.style.transition =
    "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)";

  document.body.style.visibility = "visible";

  let isDisabled = false;

  const handleEnter = () => {
    if (isDisabled) return;
    loadingScreenButton.textContent = "Entering...";
    loadingScreen.style.background = "#51182c";
    isDisabled = true;
    import("./animations.js").then((m) => m.playReveal());
  };

  loadingScreenButton.addEventListener("mouseenter", () => {
    loadingScreenButton.style.transform = "scale(1.3)";
  });

  loadingScreenButton.addEventListener("touchend", (e) => {
    state.touchHappend = true;
    e.preventDefault();
    handleEnter();
  });

  loadingScreenButton.addEventListener("click", (e) => {
    if (state.touchHappend) return;
    handleEnter();
  });

  loadingScreenButton.addEventListener("mouseleave", () => {
    loadingScreenButton.style.transform = "none";
  });
};

const loadMainModel = () => {
  gltfLoader.load(
    "/models/Roomi-v1.glb",
    (glb) => {
      const createdMaterials = {};

      glb.scene.traverse((child) => {
        if (child.isMesh) {
          // Hover setup
          if (child.name.includes("_Hover")) {
            child.userData.initialScale = new THREE.Vector3().copy(child.scale);
            child.userData.initialPosition = new THREE.Vector3().copy(
              child.position,
            );
            child.userData.initialRotation = new THREE.Euler().copy(
              child.rotation,
            );
            child.userData.hoverScale = new THREE.Vector3()
              .copy(child.scale)
              .multiplyScalar(1.5);
          }

          // Register animated objects
          Object.keys(state.animatedObjects).forEach((key) => {
            if (child.name.includes(key)) {
              state.animatedObjects[key] = child;
              // Special case for initial hide
              if (
                !child.name.includes("ResinFormlabs") &&
                key !== "H2C" &&
                key !== "H2C_Green"
              ) {
                child.scale.set(0, 0, 0);
              } else if (key === "H2C" || key === "H2C_Green") {
                child.userData.originalScale = child.scale.clone();
                child.scale.set(0, 0, 0);
              }
            }
          });

          // Raycaster objects
          if (child.name.includes("__Raycaster")) {
            state.raycasterObjects.push(child);
          }

          // Banner material
          if (child.name.includes("Icon__Banner")) {
            child.material = bannerMaterial;
          }

          // Materials assignment
          if (child.name.includes("Water")) {
            if (!createdMaterials.water) {
              createdMaterials.water = new THREE.MeshPhysicalMaterial({
                color: 0x55b8c8,
                metalness: 0,
                roughness: 0,
                transparent: true,
                opacity: 0.6,
                ior: 1.33,
                depthWrite: false,
              });
            }
            child.material = createdMaterials.water;
          } else if (child.name.includes("Glass")) {
            child.material = glassMaterial;
          } else if (child.name.includes("Blue")) {
            child.material = blueMaterial;
          } else if (child.name.includes("Orange")) {
            child.material = orangeMaterial;
          } else if (child.name.includes("Green")) {
            child.material = glassGreenMaterial;
          } else if (child.name.includes("White")) {
            child.material = whiteMaterial;
          } else if (child.name.includes("Screen")) {
            if (!createdMaterials.screen) {
              createdMaterials.screen = new THREE.MeshPhysicalMaterial({});
            }
            child.material = createdMaterials.screen;
          } else {
            // Baked textures
            Object.keys(TEXTURE_MAP).forEach((key) => {
              if (child.name.includes(key)) {
                if (!createdMaterials[key]) {
                  createdMaterials[key] = new THREE.MeshBasicMaterial({
                    map: loadedTextures.day[key],
                  });
                  if (createdMaterials[key].map) {
                    createdMaterials[key].map.minFilter = THREE.LinearFilter;
                  }
                }
                child.material = createdMaterials[key];

                // Fans
                if (child.name.includes("Fan")) {
                  if (
                    child.name.includes("Fan_2") ||
                    child.name.includes("Fan_4")
                  ) {
                    state.yAxisFans.push(child);
                  } else {
                    state.zAxisFans.push(child);
                  }
                }
              }
            });
          }
        }
      });

      scene.add(glb.scene);
      glb.scene.scale.setScalar(0.01);
    },
    undefined,
    (error) => {
      console.error("An error happened loading the GLB:", error);
      loadingScreenButton.textContent = "Error Loading";
      loadingScreenButton.style.color = "red";
    },
  );
};
