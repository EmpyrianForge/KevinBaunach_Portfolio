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
    { passive: false }
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

  gsap.set(modal, { opacity: 0 });
  gsap.to(modal, {
    opacity: 1,
    duration: 0.5,
  });
};

const hideModal = (modal) => {
  gsap.to(modal, {
    opacity: 0,
    duration: 0.5,
    onComplete: () => {
      modal.style.display = "none";
    },
  });
};

const zAxisFans = [];
const yAxisFans = [];

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
  InstaButton: "https://www.instagram.com",
  GitHubFront: "https://github.com",
  MakerWorldButton: "https://www.makerworld.com",
};

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// Loaders
const textureLoader = new THREE.TextureLoader();

// Model Loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

////________________H2C Test_______________________
//const h2cBake = textureLoader.load("/textures/Test.webp"); // Pfad anpassen
//h2cBake.flipY = false;
//h2cBake.encoding = THREE.sRGBEncoding;
//
//const h2cBakedMaterial = new THREE.MeshBasicMaterial({
//  map: h2cBake,
//});
////________________H2C Test_______________________

const enviromentMap = new THREE.CubeTextureLoader()
  .setPath("/textures/skybox/")
  .load(["px.webp", "nx.webp", "py.webp", "ny.webp", "pz.webp", "nz.webp"]);

const textureMap = {
  First: {
    day: "/textures/1bakeake.webp",
  },
  Second: {
    day: "/textures/2bake.webp",
  },
  Third: {
    day: "/textures/3bake.webp",
  },
  Fourth: {
    day: "/textures/4bake.webp",
  },
  Fifth: {
    day: "/textures/5bake.webp",
  },
  Six: {
    day: "/textures/6bake.webp",
  },
  Seven: {
    day: "/textures/7-bake.webp",
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

//________________________H2C Test_________________________
const Glass_Green = new THREE.MeshPhysicalMaterial({
  color: 0x2d9114,
  metalness: 0,
  roughness: 0,
  transparent: true,
  opacity: 1,
  ior: 1.5,
  envMap: enviromentMap,
  transmission: 1,
  thickness: 0.1,
  depthWrite: false,
});
//________________________H2C Test_________________________
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
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    pointer.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
  },
  { passive: false }
);

window.addEventListener(
  "touchend",
  (e) => {
    e.preventDefault();
    handleRaycasterInteraction();
  },
  { passive: false }
);

function handleRaycasterInteraction() {}

window.addEventListener("click", (e) => {
  if (currentIntersects.length > 0) {
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

loader.load("/models/Portfolio_Room.glb", (glb) => {
  glb.scene.traverse((child) => {
    if (child.isMesh) {
      if (child.name.includes("__Raycaster")) {
        raycasterObjects.push(child);
      }
      if (child.name.includes("_Hover")) {
        child.userData.initialScale = new THREE.Vector3().copy(child.scale);
        child.userData.initialPosition = new THREE.Vector3().copy(
          child.position
        );
        child.userData.initialRotation = new THREE.Euler().copy(child.rotation);
        child.userData.isAnimating = false;

        // ✅ NEU: Hover-Zielwerte RELATIV berechnen
        child.userData.hoverScale = new THREE.Vector3()
          .copy(child.scale)
          .multiplyScalar(1.5); // 1.5x der Original-Größe

        console.log("Hover transformiert:", child.name);
      }

      if (child.name.includes("Water")) {
        child.material = new THREE.MeshPhysicalMaterial({
          color: 0x55b8c8,
          metalness: 0,
          roughness: 0,
          transparent: true,
          opacity: 0.6,
          ior: 1.33,
          depthWrite: false,
        });
      } else if (child.name.includes("Glass")) {
        child.material = glassMaterial;
        //________________________H2C Test_________________________
      } else if (child.name.includes("Green")) {
        child.material = Glass_Green;
        //________________________H2C Test_________________________
      } else if (child.name.includes("White")) {
        child.material = whiteMaterial;
      } else if (child.name.includes("Screen")) {
        child.material = new THREE.MeshPhysicalMaterial({
          //map: VideoTexture,
        });
      } else {
        Object.keys(textureMap).forEach((key) => {
          if (child.name.includes(key)) {
            const material = new THREE.MeshBasicMaterial({
              map: loadedTextures.day[key],
            });

            child.material = material;

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

            if (child.material.map) {
              child.material.map.minFilter = THREE.LinearFilter;
            }
          }
        });
      }
    }
  });

  scene.add(glb.scene);
  glb.scene.scale.set(0.01, 0.01, 0.01); // 50% Größe // oder
  glb.scene.scale.setScalar(0.01); // Gleichmäßig auf 3.3 passt perfekt mir import H2C
  playIntroAnimation();
});

// Intro Animation
// Objekte müssen in den load via child.name.includes eingebunden werden und dann child.scale.set
//function playIntroAnimation() {
//  const t1 = gsap.timeline({
//    defaults: {
//      duration: 0.8,
//      ease: "back.out(1.7)",
//    },
//  });
//
//  //WICHTIG: item.scale, = der vorherdefinierte childname von blender
//  t1.to(
//    Shield_MYWork.scale,
//    {
//      x: 1,
//      z: 1,
//    },
//    "-=0.5"
//  )
//    .to(
//      Shield_About.scale,
//      {
//        x: 1,
//        y: 1,
//        z: 1,
//      },
//      "-=0.5"
//    )
//    .to(
//      Shield_Contact.scale,
//      {
//        x: 1,
//        y: 1,
//        z: 1,
//      },
//      "-=0.5"
//    );
//    //T2 = zweiter animationsdurchlauf, falls benötigt
//  const t2 = gsap.timeline({
//    defaults: {
//      duration: 0.8,
//      ease: "back.out(1.7)",
//    },
//  });
//
//  //WICHTIG: item.scale, = der vorherdefinierte childname von blender
//  //t2 = maschinenanimation
//  t2.to(
//    H2C.scale,
//    {
//      x: 1,
//      z: 1,
//    },
//    "-=0.5"
//  )
//    .to(
//      ***.scale,
//      {
//        x: 1,
//        y: 1,
//        z: 1,
//      },
//      "-=0.5"
//    )
//    .to(
//      ***.scale,
//      {
//        x: 1,
//        y: 1,
//        z: 1,
//      },
//      "-=0.5"
//    );
//}
//______________H2C Test_________________________
//EXPERIMENTAL H2C LOADING WITH SCALING AND CENTERING

//loader.load("/models/Test.glb", (glb) => {
//  const h2c = glb.scene;
//
//
//  // 1. Bounding Box auslesen
//  const box = new THREE.Box3().setFromObject(h2c);
//  const size = new THREE.Vector3();
//  box.getSize(size);
//  console.log("H2c size BEFORE:", size);
//
//  // 2. Zielgröße festlegen, z.B. 1 Einheit in der größten Dimension
//  const maxDimension = Math.max(size.x, size.y, size.z);
//  const scaleFactor = 50 / maxDimension;   // passt größte Kante auf 1
//
//  h2c.scale.setScalar(scaleFactor);
//
//  // 3. Nach dem Skalieren noch einmal Box3 berechnen
//  const box2 = new THREE.Box3().setFromObject(h2c);
//  const size2 = new THREE.Vector3();
//  box2.getSize(size2);
//  console.log("H2c size AFTER:", size2);
//
//  // 4. Mittelpunkt auf (0,0,0) setzen
//  const center = new THREE.Vector3();
//  box2.getCenter(center);
//  h2c.position.sub(center);
//
//  // nach dem Skalieren und Center-Shift
//h2c.position.set(0, 0, 0);      // erstmal Ursprung
//scene.add(h2c);
//
//// Kamera so setzen, dass du ihn sicher siehst:
////camera.position.set(0, 2, 5);
////camera.lookAt(0, 0, 0);
//
//h2c.traverse((child) => {
//  if (!child.isMesh) return;
//  child.material = h2cBakedMaterial;
//});
//
//  scene.add(h2c);
//});

//______________H2C Test_________________________
//EXPERIMENT ENDE

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  1000
);

camera.position.set(109.35682075158908, 35.704396522969226, -77.44092573698502);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//const geometry = new THREE.BoxGeometry( 1, 1, 1 );
//const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
//const cube = new THREE.Mesh( geometry, material );
//scene.add( cube );

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
  -11.60751480655244
);
controls.update();

//Event Listener
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  //Update camera
  //camera.aspect = sizes.width / sizes.height;
  //camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
//////////_____________________________________________

const render = () => {
  controls.update();
  zAxisFans.forEach((fan) => {
    fan.rotation.z -= 0.1;
  });
  yAxisFans.forEach((fan) => {
    fan.rotation.y -= 0.1;
  });

  raycaster.setFromCamera(pointer, camera);
  currentIntersects = raycaster.intersectObjects(scene.children, true);

  // Aktuell gehoverte ermitteln
  const currentHovered = new Set();
  currentIntersects.forEach((intersect) => {
    const obj = intersect.object;
    if (raycasterObjects.includes(obj) || obj.name.includes("_Hover")) {
      currentHovered.add(obj);
      activeHoverObjects.add(obj); // Zum Tracking hinzufügen
    }
  });

  // 1. ALLE aktiven Hover-Objekte resetten/animieren
  activeHoverObjects.forEach((obj) => {
    const isHovered = currentHovered.has(obj);

    // Material
    if (isHovered) {
      if (!obj.userData.originalMaterial) {
        obj.userData.originalMaterial = obj.material.clone();
      }
      const hoverMaterial = obj.userData.originalMaterial.clone();
      hoverMaterial.color.set(
        obj.name.includes("_Hover") ? 0xffffff00 : 0xffffff00
      );
      obj.material = hoverMaterial;
    } else {
      if (obj.userData.originalMaterial) {
        obj.material = obj.userData.originalMaterial;
      }
    }

    // Transform
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
        0.12
      );
      obj.rotation.y = THREE.MathUtils.lerp(
        obj.rotation.y,
        obj.userData.initialRotation.y,
        0.12
      );
      obj.rotation.z = THREE.MathUtils.lerp(
        obj.rotation.z,
        obj.userData.initialRotation.z,
        0.12
      );

      // ✅ Entfernen wenn vollständig zurückgesetzt (Distanz < 0.01)
      if (
        !isHovered &&
        obj.scale.distanceTo(obj.userData.initialScale) < 0.01
      ) {
        activeHoverObjects.delete(obj);
      }
    }
  });

  // Cursor
  document.body.style.cursor = currentHovered.size > 0 ? "pointer" : "default";

  renderer.render(scene, camera);
  renderer.setClearColor(0x222222);
  window.requestAnimationFrame(render);
};

render();
