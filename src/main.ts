import "./style.css";

import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { DirectionalLight, HemisphereLight } from "three";
// import HdrFile from "./models/dikhololo_night_1k.hdr";
import Stats from "three/examples/jsm/libs/stats.module"
import HdrFile from "./models/alps_field_1k.hdr";
// import CycleModel from "./models/cycle-without-roof.glb";
import CycleModel from "./models/cycle-with-texture.glb";
// import WolfModel from "./models/wolf.glb";
import { degToRad } from "three/src/math/MathUtils";

let camera: THREE.PerspectiveCamera,
  scene: THREE.Scene,
  renderer: any,
  controls: OrbitControls,
  cycle: THREE.Group;

const stats = Stats()
stats.setMode(2)
document.body.appendChild(stats.dom)
const container = document.createElement("div");
document.body.appendChild(container);

// function init() {

//   camera = new THREE.PerspectiveCamera(
//     45,
//     window.innerWidth / window.innerHeight,
//     0.25,
//     20
//   );
//   camera.position.set(0, 0.2, 2.8);
//   scene = new THREE.Scene();

//   new RGBELoader().load(HdrFile, function (texture) {
//     texture.mapping = THREE.EquirectangularReflectionMapping;
//     scene.background = texture;
//     scene.environment = texture;
//     texture.dispose();

//     {
//       const skyColor = 0xb1e1ff;
//       const groundColor = 0xb97a20;
//       const intensity = 20;
//       const light = new HemisphereLight(skyColor, groundColor, intensity);
//       scene.add(light);
//     }

//     {
//       const color = 0xffffff;
//       const intensity = 2;
//       const light = new DirectionalLight(color, intensity);
//       light.position.set(5, 10, 2);
//       scene.add(light);
//       scene.add(light.target);
//     }

//     const loader = new GLTFLoader();
//     const dracoLoader = new DRACOLoader();
//     dracoLoader.setDecoderPath(
//       "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/"
//     );

//     loader.setDRACOLoader(dracoLoader);
//     loader.load(
//       CycleModel,
//       function (gltf) {
//         console.log(gltf.scene.children)
//         gltf.scene.traverse(function (child) {
//           if ((child as THREE.Mesh).isMesh) {
//             if (child.name === "Circle") {
//               child.removeFromParent();
//             }
//             const m = child as THREE.Mesh;
//             m.receiveShadow = true;
//             m.castShadow = true;
//           }
//           if ((child as THREE.Light).isLight) {
//             const l = child as THREE.Light;
//             l.castShadow = true;
//             l.shadow.bias = -0.003;
//             l.shadow.mapSize.width = 2048;
//             l.shadow.mapSize.height = 2048;
//           }
//         });
//         scene.add(gltf.scene);
//       },
//       (xhr) => { },
//       (e) => console.error(e)
//     );
//   });

//   renderer = new THREE.WebGLRenderer({ antialias: true });
//   renderer.setPixelRatio(window.devicePixelRatio);
//   renderer.setSize(window.innerWidth, window.innerHeight);
//   renderer.toneMapping = THREE.ACESFilmicToneMapping;
//   renderer.toneMappingExposure = 1;
//   renderer.outputEncoding = THREE.sRGBEncoding;
//   renderer.physicallyCorrectLights = true;
//   controls = new OrbitControls(camera, renderer.domElement);
//   controls.addEventListener("change", render);
//   controls.minDistance = 0.1;
//   controls.maxDistance = 10;
//   controls.target.set(0, 0, -0.2);
//   container.appendChild(renderer.domElement)

// }

// window.addEventListener("resize", onWindowResize);
// function onWindowResize() {
//   camera.aspect = window.innerWidth / window.innerHeight;
//   camera.updateProjectionMatrix();

//   renderer.setSize(window.innerWidth, window.innerHeight);

//   console.log("window resized")
//   render();
// }

function render() {
  requestAnimationFrame(render);
  controls.update();
  stats.update()
  renderer.render(scene, camera)
}

init()
render()

function init() {
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.25,
    20
  );
  camera.position.set(0, 0.2, 2.8);
  scene = new THREE.Scene();

  new RGBELoader().load(HdrFile, function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
    texture.dispose();

    {
      const skyColor = 0xb1e1ff;
      const groundColor = 0xb97a20;
      const intensity = 20;
      const light = new HemisphereLight(skyColor, groundColor, intensity);
      scene.add(light);
    }

    {
      const color = 0xffffff;
      const intensity = 2;
      const light = new DirectionalLight(color, intensity);
      light.position.set(5, 10, 2);
      scene.add(light);
      scene.add(light.target);
    }
  }
  )
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(
    "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/"
  );

  loader.setDRACOLoader(dracoLoader);
  loader.load(
    CycleModel,
    function (gltf) {
      cycle = gltf.scene
      cycle.scale.multiplyScalar(1.4)
      cycle.position.y = -0.2
      console.log(cycle.children)
      gltf.scene.traverse(function (child) {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh;
          m.receiveShadow = true;
          m.castShadow = true;
        }
        if ((child as THREE.Light).isLight) {
          const l = child as THREE.Light;
          l.castShadow = true;
          l.shadow.bias = -0.003;
          l.shadow.mapSize.width = 2048;
          l.shadow.mapSize.height = 2048;
        }
      });
      cycle.children.find((c) => c.name === "Plane")?.removeFromParent()
      cycle.children.find((c) => c.name === "Plane003")?.removeFromParent()
      scene.add(cycle);
    },
    (xhr) => { },
    (e) => console.error(e)
  );

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.toneMappng = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.physicallyCorrectLights = true;
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.enableZoom = true;
  // controls.autoRotate = true;

  document.body.appendChild(renderer.domElement);

}