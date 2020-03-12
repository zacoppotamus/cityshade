import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Tile from "./Tile";
import Canvas from "./Canvas";

import { COORDINATES, TEXTURE_DIMS } from "./utils/constants";
import { renderVert, renderFrag } from "./shaders/render";

window.addEventListener("load", init);

let canvas: HTMLCanvasElement;
let scene: THREE.Scene;
let camera: THREE.Camera;
let renderer: THREE.WebGLRenderer;
let tile: ITile;
// let particlesPos: Float32Array;
let texStreets: THREE.DataTexture;
let texElevation: THREE.Texture;

function init() {
  renderer = new THREE.WebGLRenderer({
    // depth: true
  });
  console.log(innerWidth);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(innerWidth, innerHeight);

  document.body.appendChild(renderer.domElement);
  canvas = renderer.domElement;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    45,
    canvas.width / canvas.height,
    0.1,
    1000
  );
  camera.position.z = 100;
  let controls = new OrbitControls(camera, canvas);
  controls.update();

  const offscreenCanvas: ICanvas = new Canvas();
  tile = new Tile(COORDINATES.NYC);
  console.time("gen textures");
  // make all HTTP requests and generate corresponding textures
  Promise.all([tile.streets(), tile.elevation(), tile.satellite()]).then(
    ([streets, elevation, satellite]) => {
      console.log(streets, elevation, satellite);
      texElevation = new THREE.Texture(elevation);
      // texElevation.minFilter = THREE.NearestFilter;
      // texElevation.magFilter = THREE.NearestFilter;
      texElevation.format = THREE.RGBAFormat;
      // texElevation.type = THREE.FloatType;
      texElevation.needsUpdate = true;

      offscreenCanvas.drawImage(streets);
      texStreets = new THREE.DataTexture(
        offscreenCanvas.generateDataTexture(),
        TEXTURE_DIMS,
        TEXTURE_DIMS
      );
      texStreets.minFilter = THREE.NearestFilter;
      texStreets.magFilter = THREE.NearestFilter;
      texStreets.format = THREE.RGBAFormat;
      texStreets.type = THREE.FloatType;
      texStreets.needsUpdate = true;
      // console.log(particlesPos);
      console.timeEnd("gen textures");
      initMaterials();
      initParticlesGeometry();
      animate();
    }
  );
  // tile.streets().then((tileImg: HTMLImageElement) => {});
}

function animate() {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

let renderMesh;
let renderShaderMaterial: THREE.ShaderMaterial;
function initMaterials() {
  renderShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      positions: { type: "t", value: texStreets },
      elevation: { type: "t", value: texElevation }
    },
    vertexShader: renderVert,
    fragmentShader: renderFrag
  });
}

function initParticlesGeometry() {
  const l = TEXTURE_DIMS ** 2;
  const vertices = new Float32Array(l * 3);
  for (let i = 0; i < l; i++) {
    let i3 = i * 3;

    // normalize
    vertices[i3] = (i % TEXTURE_DIMS) / TEXTURE_DIMS;
    vertices[i3 + 1] = i / TEXTURE_DIMS / TEXTURE_DIMS;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(vertices, 3));
  renderMesh = new THREE.Points(geometry, renderShaderMaterial);
  // renderMesh = new THREE.Points(geometry, new THREE.PointsMaterial({size: 2, vertexColors: true}));
  scene.add(renderMesh);
}
