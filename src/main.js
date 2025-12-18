import './style.scss'
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { texture } from 'three/tsl';


const canvas = document.querySelector("#experience-canvas");
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}



// Loaders
const textureLoader = new THREE.TextureLoader();

// Model Loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

//________________H2C Test_______________________
const h2cBake = textureLoader.load("/textures/Test.webp"); // Pfad anpassen
h2cBake.flipY = false;
h2cBake.encoding = THREE.sRGBEncoding;

const h2cBakedMaterial = new THREE.MeshBasicMaterial({
  map: h2cBake,
});
//________________H2C Test_______________________


const enviromentMap = new THREE.CubeTextureLoader()
    .setPath("/textures/skybox/")
    .load([
        "px.webp",
        "nx.webp",
        "py.webp",
        "ny.webp",
        "pz.webp",
        "nz.webp",
    ]);


const textureMap = {
    First: {
        day:"/textures/1RoomBake.webp"
    },
    Second: {
        day:"/textures/2Shelfs.webp"
    },
    Third: {
        day:"/textures/3Machines.webp"
    },
    Fourth: {
        day:"/textures/4LittleShit.webp"
    },
    Fifth: {
        day:"/textures/Test.webp"
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
const glassGreen = new THREE.MeshPhysicalMaterial({
    color: 0x088223FF,
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
const whiteMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
});

const videoElement = document.createElement("video");
videoElement.src = "/textures/video";
videoElement.crossOrigin = "anonymous";
videoElement.loop = true;
videoElement.playsInline = true;
videoElement.muted = true;
videoElement.autoplay = true;
videoElement.play();

const videoTexture = new THREE.VideoTexture(videoElement);
videoTexture.colorSpace = THREE.SRGBColorSpace;
videoTexture.flipY = false;

loader.load("/models/Roomtest-v1.glb", (glb) => {
  glb.scene.traverse((child) => {
    if (child.isMesh) {
            if (child.name.includes("Water")) {
      child.material = new THREE.MeshPhysicalMaterial({
        color: 0x55B8C8,
        metalness: 0,
        roughness: 0,
        transparent: true,
        opacity: 0.6,
        ior: 1.33,
        depthWrite: false,
      });
    }else if (child.name.includes("Glass")) {
      child.material = glassMaterial;
      //________________________H2C Test_________________________
    }else if (child.name.includes("GlassGreen")) {
      child.material = glassGreen; 
      //________________________H2C Test_________________________ 
    }else if (child.name.includes("White")) {
      child.material = whiteMaterial;
    }else if (child.name.includes("Screen")) {
      child.material = new THREE.MeshPhysicalMaterial({
        map: VideoTexture,
      });
    } else{
    Object.keys(textureMap).forEach((key) => {
        if (child.name.includes(key)) {
          const material = new THREE.MeshBasicMaterial({
            map: loadedTextures.day[key],
          });

          child.material = material;

          if (child.material.map) {
            child.material.map.minFilter = THREE.LinearFilter;
          }
        }
      });
    }
    }
  });

  scene.add(glb.scene);
  glb.scene.scale.set(1, 1, 1);   // 50% Größe // oder
  glb.scene.scale.setScalar(3.3);        // Gleichmäßig auf 3.3 passt perfekt mir import H2C
  //camera.position.z = 45;                // Kamera weiter weg
});



//______________H2C Test_________________________
//EXPERIMENTAL H2C LOADING WITH SCALING AND CENTERING

loader.load("/models/Test.glb", (glb) => {
  const h2c = glb.scene;
  

  // 1. Bounding Box auslesen
  const box = new THREE.Box3().setFromObject(h2c);
  const size = new THREE.Vector3();
  box.getSize(size);
  console.log("H2c size BEFORE:", size);

  // 2. Zielgröße festlegen, z.B. 1 Einheit in der größten Dimension
  const maxDimension = Math.max(size.x, size.y, size.z);
  const scaleFactor = 50 / maxDimension;   // passt größte Kante auf 1

  h2c.scale.setScalar(scaleFactor);

  // 3. Nach dem Skalieren noch einmal Box3 berechnen
  const box2 = new THREE.Box3().setFromObject(h2c);
  const size2 = new THREE.Vector3();
  box2.getSize(size2);
  console.log("H2c size AFTER:", size2);

  // 4. Mittelpunkt auf (0,0,0) setzen
  const center = new THREE.Vector3();
  box2.getCenter(center);
  h2c.position.sub(center);

  // nach dem Skalieren und Center-Shift
h2c.position.set(0, 0, 0);      // erstmal Ursprung
scene.add(h2c);

// Kamera so setzen, dass du ihn sicher siehst:
//camera.position.set(0, 2, 5);
//camera.lookAt(0, 0, 0);

h2c.traverse((child) => {
  if (!child.isMesh) return;
  child.material = h2cBakedMaterial;
});

  scene.add(h2c);
});



//______________H2C Test_________________________
//EXPERIMENT ENDE





const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    sizes.width / sizes.height,
    0.1,
    1000 
);

camera.position.set(109.35682075158908,35.704396522969226,-77.44092573698502)

const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( Math.min(window.devicePixelRatio, 2) );


//const geometry = new THREE.BoxGeometry( 1, 1, 1 );
//const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
//const cube = new THREE.Mesh( geometry, material );
//scene.add( cube );


const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(-15.032524979835078,13.056863836526139,-11.60751480655244)
controls.update();

//Event Listener
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    //Update camera
    //camera.aspect = sizes.width / sizes.height;
    //camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
});

const render = () => {
    controls.update();

    //console.log(camera.position);
    //console.log("00000000000000");
    //console.log(controls.target);
    
    renderer.render( scene, camera );
    renderer.setClearColor(0x222222);


    window.requestAnimationFrame( render );
}

render()