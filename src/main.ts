import "./style.css";

import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { DirectionalLight, HemisphereLight } from "three";
import HdrFile from "./models/dikhololo_night_1k.hdr";
// import HdrFile from "./models/alps_field_1k.hdr";
// import CycleModel from "./models/cycle-without-roof.glb";
import WolfModel from "./models/wolf.glb";
import { degToRad } from "three/src/math/MathUtils";

let camera: THREE.PerspectiveCamera,
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  mixer: THREE.AnimationMixer,
  animations: THREE.AnimationClip[],
  wolf;

const clock = new THREE.Clock();

init();
render();

function init() {
  const container = document.createElement("div");
  document.body.appendChild(container);

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

    render();

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

    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/"
    );

    loader.setDRACOLoader(dracoLoader);
    loader.load(
      WolfModel,
      function (gltf) {
        gltf.scene.rotateY(degToRad(45));
        const wolf = gltf.scene;
        gltf.scene.traverse(function (child) {
          if ((child as THREE.Mesh).isMesh) {
            if (child.name === "Circle") {
              child.removeFromParent();
            }
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
        mixer = new THREE.AnimationMixer(gltf.scene);
        animations = gltf.animations;
        const clip = THREE.AnimationClip.findByName(
          animations,
          "01_Run_Armature_0"
        );
        const action = mixer.clipAction(clip);
        console.log(animations);
        scene.add(gltf.scene);
        render();
      },
      (xhr) => console.log((xhr.loaded / xhr.total) * 100),
      (e) => console.error(e)
    );
  });

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.physicallyCorrectLights = true;
  container.appendChild(renderer.domElement);

  // const controls = new OrbitControls(camera, renderer.domElement);
  // controls.addEventListener("change", render);
  // controls.minDistance = 0.1;
  // controls.maxDistance = 10;
  // controls.target.set(0, 0, -0.2);
  // controls.update();

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();
}

function render() {
  var delta = clock.getDelta();

  mixer && mixer.update(delta);
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

requestAnimationFrame(render);

function lerp(x: number, y: number, a: number): number {
  return (1 - a) * x + a * y;
}

function scalePercent(start: number, end: number): number {
  return (scrollPercent - start) / (end - start);
}

let scrollPercent = 0;
document.body.onscroll = () => {
  scrollPercent =
    ((document.documentElement.scrollTop || document.body.scrollTop) /
      ((document.documentElement.scrollHeight || document.body.scrollHeight) -
        document.documentElement.clientHeight)) *
    100;
  mixer && mixer.setTime(lerp(6.66, 0, scalePercent(0, 100)));
};
