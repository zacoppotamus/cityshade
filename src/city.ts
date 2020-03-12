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
let tile: Promise<HTMLImageElement>;
let particlesPos: Float32Array;
let mapTexture: THREE.DataTexture;
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
  tile = new Tile().getTileImg(COORDINATES.NYC);
  console.time("gen texture");
  tile.then((tileImg: HTMLImageElement) => {
    offscreenCanvas.drawImage(tileImg);
    const { data: grayscale } = offscreenCanvas.grayscaleValues();
    mapTexture = new THREE.DataTexture(
      offscreenCanvas.generateDataTexture(),
      TEXTURE_DIMS,
      TEXTURE_DIMS
    );
    mapTexture.minFilter = THREE.NearestFilter;
    mapTexture.magFilter = THREE.NearestFilter;
    mapTexture.format = THREE.RGBAFormat;
    mapTexture.type = THREE.FloatType;
    mapTexture.needsUpdate = true;
    // console.log(particlesPos);
    console.timeEnd("gen texture");
    initMaterials();
    initParticlesGeometry();
    animate();
  });
}

function animate() {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

let renderMesh;
let renderShaderMaterial: THREE.ShaderMaterial;
function initMaterials() {
  renderShaderMaterial = new THREE.ShaderMaterial({
    uniforms: { positions: { type: "t", value: mapTexture } },
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
function initParticlesTexture() {}

function createDoubleFBO(
  w: number,
  h: number,
  filtering: THREE.TextureFilter
): IDoubleFBO {
  let rt1 = new THREE.WebGLRenderTarget(w, h, {
    type: THREE.FloatType,
    minFilter: filtering || THREE.NearestFilter,
    magFilter: filtering || THREE.NearestFilter,
    wrapS: THREE.RepeatWrapping,
    wrapT: THREE.RepeatWrapping,
    format: THREE.RGBAFormat,
    depthBuffer: false,
    stencilBuffer: false,
    anisotropy: 1
  });

  let rt2 = new THREE.WebGLRenderTarget(w, h, {
    type: THREE.FloatType,
    minFilter: filtering || THREE.NearestFilter,
    magFilter: filtering || THREE.NearestFilter,
    wrapS: THREE.RepeatWrapping,
    wrapT: THREE.RepeatWrapping,
    format: THREE.RGBAFormat,
    depthBuffer: false,
    stencilBuffer: false,
    anisotropy: 1
  });

  return {
    read: rt1,
    write: rt2,
    swap: function() {
      let temp = this.read;
      this.read = this.write;
      this.write = temp;
    }
  };
}
