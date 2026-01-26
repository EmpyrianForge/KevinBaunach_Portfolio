import "./style.scss";
import * as THREE from "three";
import { OrbitControls } from "./utils/OrbitControls.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import gsap from "gsap";

const canvas = document.querySelector("#experience-canvas");
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const modals = {
  work: document.querySelector(".modal.work"),
  about: document.querySelector(".modal.about"),
  contact: document.querySelector(".modal.contact"),
};

let touchHappend = false;
document.querySelectorAll(".modal-exit-button").forEach((button) => {
  button.addEventListener(
    "touchend",
    (e) => {
      touchHappend = true;
      e.preventDefault();
      const modal = e.target.closest(".modal");
      hideModal(modal);
    },
    { passive: false },
  );

  button.addEventListener("click", (e) => {
    if (touchHappend) return;
    e.preventDefault();
    const modal = e.target.closest(".modal");
    hideModal(modal);
  });
});

const showModal = (modal) => {
  modal.style.display = "block";

  disableBackgroundInteractions(); // Deaktiviere alle Hintergrundinteraktionen

  gsap.set(modal, { opacity: 0 });
  gsap.to(modal, {
    opacity: 1,
    duration: 0.5,
  });
};

// Icon banner
const bannerCanvas = document.createElement("canvas");
bannerCanvas.width = 1024;
bannerCanvas.height = 576;
const bannerCtx = bannerCanvas.getContext("2d");

const bannerTexture = new THREE.CanvasTexture(bannerCanvas);
bannerTexture.minFilter = THREE.LinearFilter;

const bannerMaterial = new THREE.MeshBasicMaterial({
  map: bannerTexture,
  transparent: true,
  alphaTest: 0.01,
  toneMapped: false,
});

// Icon loader
const iconImages = [];
const iconLoadStates = [];
[
  "nodejs",
  "c",
  "git",
  "html",
  "vite",
  "css",
  "java",
  "py",
  "ts",
  "threejs",
  "",
].forEach((lang) => {
  const img = new Image(240, 240);
  const index = iconImages.length;
  iconLoadStates.push(false);
  img.onload = () => {
    iconLoadStates[index] = true;
  };
  img.onerror = () => {
    iconLoadStates[index] = true; // Always loaded, prevent broken error
  };
  img.src = `./icons/${lang}.png`;
  iconImages.push(img);
});

let bannerTime = 0;
let bannerIcons = [];
const iconSize = 256;

const gap = 40;
const totalWidthPerIcon = iconSize + gap;
let marqueeOffset = 0;

// Icons Init
const initBannerIcons = () => {
  bannerIcons = [];
  const total = iconImages.length;
  for (let i = 0; i < total; i++) {
    bannerIcons.push({
      index: i,
    });
  }
};

initBannerIcons();

const hideModal = (modal) => {
  gsap.to(modal, {
    opacity: 0,
    duration: 0.5,
    onComplete: () => {
      modal.style.display = "none";
      enableBackgroundInteractions(); // Reaktiviere alle Hintergrundinteraktionen
    },
  });
};

const zAxisFans = [];
const yAxisFans = [];

const animatedObjects = {
  Shield_MyWork: null,
  Shield_About: null,
  Shield_Contact: null,
  H2C: null,
  H2C_Green: null,
  GitHubFront: null,
  InstaButton: null,
  MakerWorldButton: null,
  ResinFormlabs_Glass: null,
  ResinFormlabs: null,
  Dixiclock: null,
  Gandalf: null,
  Name_A1: null,
  Name_A2: null,
  Name_B: null,
  Name_C: null,
  Name_E: null,
  Name_H: null,
  Name_I: null,
  Name_K: null,
  Name_N1: null,
  Name_N2: null,
  Name_U: null,
  Name_V: null,
};

const raycasterObjects = [];
//Main try
let currentIntersects = [];
//______________
let previousHover = null;
//My Fix
let hoveredObjects = [];
let activeHoverObjects = new Set();
//______________

let currentHoverObject = null;

const socialLinks = {
  InstaButton: "https://www.instagram.com/empyrian_forge/",
  GitHubFront: "https://github.com/EmpyrianForge",
  MakerWorldButton: "https://www.makerworld.com",
};

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// Performance Optimierung: Raycaster nur bei Mausbewegung ausführen
let isDragging = false;
let lastPointerPos = { x: 0, y: 0 };
let raycasterNeedsUpdate = true;
let isModalOpen = false;

// Funktionen zum Deaktivieren/Aktivieren von Hintergrundinteraktionen
const disableBackgroundInteractions = () => {
  isModalOpen = true;

  // Deaktiviere OrbitControls
  if (controls) {
    controls.enabled = false;
  }

  // Deaktiviere Raycaster
  raycasterNeedsUpdate = false;

  // Setze alle Hover-Objekte zurück
  // activeHoverObjects.clear(); // REMOVE THIS: Cleared objects cannot animate back!
  // hoveredObjects = []; // Unused variable?

  // Clear current intersections to prevent stale clicks
  currentIntersects = [];

  // Setze Cursor zurück
  document.body.style.cursor = "default";
};

const enableBackgroundInteractions = () => {
  isModalOpen = false;

  // Reaktiviere OrbitControls
  if (controls) {
    controls.enabled = true;
  }

  // Reaktiviere Raycaster
  raycasterNeedsUpdate = true;
};

// Loaders
const textureLoader = new THREE.TextureLoader();

// Model Loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const manager = new THREE.LoadingManager();

const loadingScreen = document.querySelector(".loading-screen");
const loadingScreenButton = document.querySelector(".loading-screen-button");

manager.onLoad = function () {
  loadingScreenButton.style.border = "8px solid #55293A";
  loadingScreenButton.style.backgroundColor = "#A6754A";
  loadingScreenButton.style.color = "#e6dede";
  loadingScreenButton.style.boxShadow = "rgba(0, 0, 0, 0.24) 0px 3px 8px ";
  loadingScreenButton.textContent = "Click to Enter";
  loadingScreenButton.style.cursor = "pointer";
  loadingScreenButton.style.transition =
    "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)";

  gsap.set(".loading-screen-hint", { y: 15, opacity: 0 });
  
  gsap.timeline({ repeat: 1, repeatDelay: 1.5 })
    .to(".loading-screen-hint", { 
      y: 0, 
      opacity: 0.9, 
      duration: 0.6, 
      ease: "power2.out" 
    })
    .to(".loading-screen-hint", { 
      scale: 1.2, 
      duration: 0.3, 
      yoyo: true, 
      repeat: 1 
    });

  document.body.style.visibility = "visible";

  let isDisabled = false;

  function handleEnter() {
    if (isDisabled) return;

    loadingScreenButton.style.border = "8px solid #6e5e9c";
    loadingScreenButton.style.background = "#ead7ef";
    loadingScreenButton.style.color = "#6e5e9c";
    loadingScreenButton.style.boxShadow = "none";
    loadingScreenButton.textContent = "Entering...";
    loadingScreen.style.background = "#ead7ef";
    isDisabled = true;
    playReaveal();
  }

  loadingScreenButton.addEventListener("mouseenter", () => {
    loadingScreenButton.style.transform = "scale(1.3)";
  });

  loadingScreenButton.addEventListener("touchend", (e) => {
    touchHappend = true;
    e.preventDefault();
    handleEnter();
  });

  loadingScreenButton.addEventListener("click", (e) => {
    if (touchHappend) return;
    handleEnter();
  });

  loadingScreenButton.addEventListener("mouseleave", () => {
    loadingScreenButton.style.transform = "none";
  });
};

function playReaveal() {
  const tl = gsap.timeline({});
  tl.to(".loading-screen", {
    scale: 0.5,
    duration: 1.2,
    delay: 0.25,
    ease: "back.in(1.7)",
  }).to(
    ".loading-screen",
    {
      y: "200vh",
      transform: " perspective(1000px) rotateX(45deg) rotateY(-35deg)",
      duration: 1.5,
      ease: "back.in(1.7)",
      onComplete: () => {
        playIntroAnimation();
        loadingScreen.remove();
      },
    },
    "-=0.1",
  );
}

const loader = new GLTFLoader(manager);
loader.setDRACOLoader(dracoLoader);

const enviromentMap = new THREE.CubeTextureLoader()
  .setPath("/textures/skybox/")
  .load(["px.webp", "nx.webp", "py.webp", "ny.webp", "pz.webp", "nz.webp"]);

const textureMap = {
  First: {
    day: "/images/1bake.webp",
  },
  Second: {
    day: "/images/2bake.webp",
  },
  Third: {
    day: "/images/3bake.webp",
  },
  Fourth: {
    day: "/images/4bake.webp",
  },
  Fifth: {
    day: "/images/5bakeverbesserungen.webp",
  },
  Six: {
    day: "/images/6bake.webp",
  },
  Seven: {
    day: "/images/7-bake.webp",
  },
  Eight: {
    day: "/images/8bake.webp",
  },
};

const loadedTextures = {
  day: {},
};

Object.entries(textureMap).forEach(([key, paths]) => {
  const dayTexture = textureLoader.load(paths.day);
  dayTexture.flipY = false;
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  loadedTextures.day[key] = dayTexture;
});

const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  metalness: 0,
  roughness: 0,
  transparent: true,
  opacity: 0.25,
  ior: 1.5,
  envMap: enviromentMap,
  transmission: 1,
  thickness: 0.1,
  depthWrite: false,
});

const blueMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x000080,
  metalness: 0,
  roughness: 0,
  transparent: true,
  opacity: 0.3,
  ior: 1.5,
  envMap: enviromentMap,
  transmission: 0.8,
  thickness: 0.1,
  depthWrite: false,
});

// Orange Glass Material für ResinFormlabs_Glass
const orangeMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xff8c00,
  metalness: 0,
  roughness: 0,
  transparent: true,
  opacity: 0.5,
  ior: 1.5,
  envMap: enviromentMap,
  transmission: 0.8,
  thickness: 0.1,
  depthWrite: false,
});

// Green Glass Material für H2C_Green
const Glass_Green = new THREE.MeshPhysicalMaterial({
  color: 0x2d9114,
  metalness: 0,
  roughness: 0,
  transparent: true,
  opacity: 0.8,
  ior: 1.5,
  envMap: enviromentMap,
  transmission: 1,
  thickness: 0.1,
  depthWrite: false,
});
const whiteMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
});

//const videoElement = document.createElement("video");
//videoElement.src = "/textures/video";
//videoElement.crossOrigin = "anonymous";
//videoElement.loop = true;
//videoElement.playsInline = true;
//videoElement.muted = true;
//videoElement.autoplay = true;
//videoElement.play();
//
//const videoTexture = new THREE.VideoTexture(videoElement);
//videoTexture.colorSpace = THREE.SRGBColorSpace;
//videoTexture.flipY = false;

window.addEventListener("mousemove", (e) => {
  touchHappend = false;
  const newPointerX = (e.clientX / window.innerWidth) * 2 - 1;
  const newPointerY = -(e.clientY / window.innerHeight) * 2 + 1;

  // Nur Raycaster updaten wenn sich Maus wirklich bewegt hat und kein Modal offen ist
  if (
    !isModalOpen &&
    (Math.abs(newPointerX - pointer.x) > 0.001 ||
      Math.abs(newPointerY - pointer.y) > 0.001)
  ) {
    pointer.x = newPointerX;
    pointer.y = newPointerY;
    raycasterNeedsUpdate = true;
  }
});

window.addEventListener(
  "touchstart",
  (e) => {
    if (!isModalOpen && e.touches.length > 0) {
      pointer.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
    }
  },
  { passive: true }, 
);

window.addEventListener("touchend", () => {}, { passive: true });

function handleRaycasterInteraction() {}

window.addEventListener("click", (e) => {
  if (!isModalOpen && currentIntersects.length > 0) {
    const object = currentIntersects[0].object;

    Object.entries(socialLinks).forEach(([key, url]) => {
      if (object.name.includes(key)) {
        const newWindow = window.open();
        newWindow.opener = null;
        newWindow.location = url;
        newWindow.target = "_blank";
        newWindow.rel = "noopener noreferrer";
      }
    });

    if (object.name.includes("Shield_MyWork")) {
      showModal(modals.work);
    } else if (object.name.includes("Shield_About")) {
      showModal(modals.about);
    } else if (object.name.includes("Shield_Contact")) {
      showModal(modals.contact);
    }
  }
});

loader.load("/models/Roomi-v1.glb", (glb) => {
  const createdMaterials = {};

  glb.scene.traverse((child) => {
    if (child.isMesh) {
      if (child.name.includes("_Hover")) {
        child.userData.initialScale = new THREE.Vector3().copy(child.scale);
        child.userData.initialPosition = new THREE.Vector3().copy(
          child.position,
        );
        child.userData.initialRotation = new THREE.Euler().copy(child.rotation);
        child.userData.isAnimating = false;

        // Hover-Zielwerte RELATIV berechnen
        child.userData.hoverScale = new THREE.Vector3()
          .copy(child.scale)
          .multiplyScalar(1.5); 

        console.log("Hover transformiert:", child.name);
      }
      if (child.name.includes("Shield_MyWork")) {
        animatedObjects.Shield_MyWork = child;
        child.scale.set(0, 0, 0);
      }
      if (child.name.includes("Shield_About")) {
        animatedObjects.Shield_About = child;
        child.scale.set(0, 0, 0);
      }
      if (child.name.includes("Shield_Contact")) {
        animatedObjects.Shield_Contact = child;
        child.scale.set(0, 0, 0);
      }
      if (child.name.includes("H2C")) {
        animatedObjects.H2C = child;
        child.userData.originalScale = child.scale.clone();
        child.scale.set(0, 0, 0);
      }
      if (child.name.includes("H2C_Green")) {
        animatedObjects.H2C_Green = child;
        child.userData.originalScale = child.scale.clone();
        child.scale.set(0, 0, 0);
      }
      if (child.name.includes("GitHubFront")) {
        animatedObjects.GitHubFront = child;
        child.scale.set(0, 0, 0);
      }

      if (child.name.includes("InstaButton")) {
        animatedObjects.InstaButton = child;
        child.scale.set(0, 0, 0);
      }

      if (child.name.includes("MakerWorldButton")) {
        animatedObjects.MakerWorldButton = child;
        child.scale.set(0, 0, 0);
      }

      if (child.name.includes("Dixiclock")) {
        animatedObjects.Dixiclock = child;
        child.scale.set(0, 0, 0);
      }

      if (child.name.includes("Gandalf")) {
        animatedObjects.Gandalf = child;
        child.scale.set(0, 0, 0);
      }

      if (child.name.includes("Name_A1")) {
        animatedObjects.Name_A1 = child;
        child.scale.set(0, 0, 0);
      }

      if (child.name.includes("Name_A2")) {
        animatedObjects.Name_A2 = child;
        child.scale.set(0, 0, 0);
      }

      if (child.name.includes("Name_B")) {
        animatedObjects.Name_B = child;
        child.scale.set(0, 0, 0);
      }

      if (child.name.includes("Name_C")) {
        animatedObjects.Name_C = child;
        child.scale.set(0, 0, 0);
      }

      if (child.name.includes("Name_E")) {
        animatedObjects.Name_E = child;
        child.scale.set(0, 0, 0);
      }

      if (child.name.includes("Name_H")) {
        animatedObjects.Name_H = child;
        child.scale.set(0, 0, 0);
      }

      if (child.name.includes("Name_I")) {
        animatedObjects.Name_I = child;
        child.scale.set(0, 0, 0);
      }

      if (child.name.includes("Name_K")) {
        animatedObjects.Name_K = child;
        child.scale.set(0, 0, 0);
      }

      if (child.name.includes("Name_N1")) {
        animatedObjects.Name_N1 = child;
        child.scale.set(0, 0, 0);
      }

      if (child.name.includes("Name_N2")) {
        animatedObjects.Name_N2 = child;
        child.scale.set(0, 0, 0);
      }

      if (child.name.includes("Name_U")) {
        animatedObjects.Name_U = child;
        child.scale.set(0, 0, 0);
      }

      if (child.name.includes("Name_V")) {
        animatedObjects.Name_V = child;
        child.scale.set(0, 0, 0);
      }

      if (child.name.includes("__Raycaster")) {
        raycasterObjects.push(child);
      }
      if (child.isMesh && child.name.includes("Icon__Banner")) {
        child.material = bannerMaterial;
        console.log("✅ Icon__Banner CanvasTexture gesetzt!");
      }

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
        //________________________H2C Test_________________________
      } else if (child.name.includes("Green")) {
        child.material = Glass_Green;
        //________________________H2C Test_________________________
      } else if (child.name.includes("White")) {
        child.material = whiteMaterial;
      } else if (child.name.includes("Screen")) {
        if (!createdMaterials.screen) {
          createdMaterials.screen = new THREE.MeshPhysicalMaterial({});
        }
        child.material = createdMaterials.screen;
      } else {
        Object.keys(textureMap).forEach((key) => {
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

            if (child.name.includes("Fan")) {
              if (
                child.name.includes("Fan_2") ||
                child.name.includes("Fan_4")
              ) {
                yAxisFans.push(child);
              } else {
                zAxisFans.push(child);
              }
            }
          }
        });
      }
    }
  });

  scene.add(glb.scene);
  glb.scene.scale.set(0.01, 0.01, 0.01);
  glb.scene.scale.setScalar(0.01);
}, (xhr) => {
}, (error) => {
    console.error('An error happened loading the GLB:', error);
    document.querySelector(".loading-screen-button").textContent = "Error Loading";
    document.querySelector(".loading-screen-button").style.color = "red";
});

//Intro Animation
//Objekte müssen in den load via child.name.includes eingebunden werden und dann child.scale.set
function playIntroAnimation() {
  if (!animatedObjects.Shield_MyWork) {
    console.warn("Objekte noch nicht geladen!");
    setTimeout(() => playIntroAnimation(), 100);
    return;
  }

  const t1 = gsap.timeline({
    defaults: {
      duration: 1,
      ease: "power2.out",
    },
  });

  //WICHTIG: item.scale, = der vorherdefinierte childname von blender
  //GSAP TO funktion
  t1.to(animatedObjects.Shield_MyWork.scale, {
    x: 1,
    z: 1,
    y: 1,
  })
    .to(
      animatedObjects.Shield_About.scale,
      {
        x: 1,
        y: 1,
        z: 1,
      },
      "-=0.7",
    )
    .to(
      animatedObjects.Shield_Contact.scale,
      {
        x: 1,
        y: 1,
        z: 1,
      },
      "-=0.7",
    )
    .to(
      animatedObjects.H2C.scale,
      {
        x: 0.3,
        y: 0.4,
        z: 0.4,
      },
      "-=0.7",
    )
    .to(
      animatedObjects.H2C_Green.scale,
      {
        x: 1,
        y: 1,
        z: 1,
      },
      "-=0.7",
    );

  //T2 = zweiter animationsdurchlauf, falls benötigt
  const t2 = gsap.timeline({
    defaults: {
      duration: 0.8,
      ease: "back.out(1.7)",
    },
  });
  //WICHTIG: item.scale, = der vorherdefinierte childname von blender
  t2.to(animatedObjects.GitHubFront.scale, {
    x: 1,
    y: 1,
    z: 1,
  })
    .to(
      animatedObjects.InstaButton.scale,
      {
        x: 1,
        y: 1,
        z: 1,
      },
      "-=0.5",
    )
    .to(
      animatedObjects.MakerWorldButton.scale,
      {
        x: 0.3,
        y: 0.3,
        z: 0.3,
      },
      "-=0.5",
    )

    .to(
      animatedObjects.Dixiclock.scale,
      {
        x: 1,
        y: 1,
        z: 1,
      },
      "-=0.5",
    )
    .to(
      animatedObjects.Gandalf.scale,
      {
        x: 1,
        y: 1,
        z: 1,
      },
      "-=0.3",
    )
    .to(
      animatedObjects.Name_K.scale,
      {
        x: 1,
        y: 1,
        z: 1,
      },
      "-=0.7",
    )
    .to(
      animatedObjects.Name_E.scale,
      {
        x: 1,
        y: 1,
        z: 1,
      },
      "-=0.7",
    )
    .to(
      animatedObjects.Name_V.scale,
      {
        x: 1,
        y: 1,
        z: 1,
      },
      "-=0.7",
    )
    .to(
      animatedObjects.Name_I.scale,
      {
        x: 1,
        y: 1,
        z: 1,
      },
      "-=0.7",
    )
    .to(
      animatedObjects.Name_N1.scale,
      {
        x: 1,
        y: 1,
        z: 1,
      },
      "-=0.7",
    )
    .to(
      animatedObjects.Name_B.scale,
      {
        x: 1,
        y: 1,
        z: 1,
      },
      "-=0.7",
    )
    .to(
      animatedObjects.Name_A1.scale,
      {
        x: 1,
        y: 1,
        z: 1,
      },
      "-=0.7",
    )
    .to(
      animatedObjects.Name_U.scale,
      {
        x: 1,
        y: 1,
        z: 1,
      },
      "-=0.3",
    )
    .to(
      animatedObjects.Name_N2.scale,
      {
        x: 1,
        y: 1,
        z: 1,
      },
      "-=0.7",
    )
    .to(
      animatedObjects.Name_A2.scale,
      {
        x: 1,
        y: 1,
        z: 1,
      },
      "-=0.7",
    )
    .to(
      animatedObjects.Name_C.scale,
      {
        x: 1,
        y: 1,
        z: 1,
      },
      "-=0.7",
    )
    .to(
      animatedObjects.Name_H.scale,
      {
        x: 1,
        y: 1,
        z: 1,
      },
      "-=0.7",
    );
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  1000,
);

camera.position.set(109.35682075158908, 35.704396522969226, -77.44092573698502);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Einstellungen Startansicht
const controls = new OrbitControls(camera, renderer.domElement);
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
  isDragging = true;
});
controls.addEventListener("end", () => {
  isDragging = false;
  raycasterNeedsUpdate = true;
});
controls.update();

//Event Listener
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  //Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const render = () => {
  controls.update();
  zAxisFans.forEach((fan) => {
    fan.rotation.z -= 0.1;
  });
  yAxisFans.forEach((fan) => {
    fan.rotation.y -= 0.1;
  });

  // ICON BANNER ANIMATION
  bannerTime += 0.018;
  bannerCtx.clearRect(0, 0, bannerCanvas.width, bannerCanvas.height); // Transparenz!

  const scrollSpeed = 1.5;
  marqueeOffset += scrollSpeed;

  const totalIcons = iconImages.length;
  const loopWidth = totalWidthPerIcon * totalIcons;
  marqueeOffset = marqueeOffset % loopWidth;

  for (let i = 0; i < totalIcons; i++) {
    const imgIndex = i;
    let x = i * totalWidthPerIcon - marqueeOffset;

    if (x < -iconSize) {
      x += loopWidth;
    }

    const y = bannerCanvas.height / 2 - iconSize / 2;

    if (
      iconLoadStates[imgIndex] &&
      iconImages[imgIndex].complete &&
      iconImages[imgIndex].naturalWidth > 0
    ) {
      bannerCtx.shadowColor = "#00ffff";
      bannerCtx.shadowBlur = 20;

      // Fade-Effekt berechnen
      const fadeWidth = 150;
      let alpha = 1;

      if (x < fadeWidth) {
        alpha = x / fadeWidth;
      } else if (x > bannerCanvas.width - fadeWidth - iconSize) {
        alpha = (bannerCanvas.width - x - iconSize) / fadeWidth;
      }

      alpha = Math.max(0, Math.min(1, alpha));
      bannerCtx.globalAlpha = alpha;

      bannerCtx.save();
      bannerCtx.translate(x + iconSize / 2, y + iconSize / 2);
      bannerCtx.rotate(Math.PI);
      bannerCtx.drawImage(
        iconImages[imgIndex],
        -iconSize / 2,
        -iconSize / 2,
        iconSize,
        iconSize,
      );
      bannerCtx.restore();

      bannerCtx.globalAlpha = 1;
    }
  }

  bannerCtx.shadowBlur = 0;

  bannerTexture.needsUpdate = true;

  // Performance: Raycaster nur ausführen wenn nicht dragging, kein Modal offen und Update benötigt
  if (!isDragging && !isModalOpen && raycasterNeedsUpdate) {
    raycaster.setFromCamera(pointer, camera);
    currentIntersects = raycaster.intersectObjects(raycasterObjects, false); // Nur relevante Objekte checken
    raycasterNeedsUpdate = false;
  }

  // Aktuell gehoverte ermitteln (nur wenn nicht dragging und kein Modal offen)
  const currentHovered = new Set();
  if (!isDragging && !isModalOpen) {
    currentIntersects.forEach((intersect) => {
      const obj = intersect.object;
      if (obj.name.includes("_Hover")) {
        currentHovered.add(obj);
        activeHoverObjects.add(obj);
      }
    });
  }

  // 1. ALLE aktiven Hover-Objekte resetten/animieren
  activeHoverObjects.forEach((obj) => {
    const isHovered = currentHovered.has(obj);
    if (obj.userData.initialScale) {
      const targetScale =
        isHovered && obj.userData.hoverScale
          ? obj.userData.hoverScale
          : obj.userData.initialScale;

      obj.scale.lerp(targetScale, 0.12);
      obj.position.lerp(obj.userData.initialPosition, 0.12);
      obj.rotation.x = THREE.MathUtils.lerp(
        obj.rotation.x,
        obj.userData.initialRotation.x,
        0.12,
      );
      obj.rotation.y = THREE.MathUtils.lerp(
        obj.rotation.y,
        obj.userData.initialRotation.y,
        0.12,
      );
      obj.rotation.z = THREE.MathUtils.lerp(
        obj.rotation.z,
        obj.userData.initialRotation.z,
        0.12,
      );

      // Entfernen wenn vollständig zurückgesetzt (Distanz < 0.01)
      if (
        !isHovered &&
        obj.scale.distanceTo(obj.userData.initialScale) < 0.01
      ) {
        activeHoverObjects.delete(obj);
      }
    }
  });

  // Cursor (nur ändern wenn kein Modal offen)
  if (!isModalOpen) {
    document.body.style.cursor =
      currentHovered.size > 0 ? "pointer" : "default";
  }

  renderer.render(scene, camera);
  renderer.setClearColor(0x222222);
  window.requestAnimationFrame(render);
};

render();
