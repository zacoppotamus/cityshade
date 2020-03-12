import { TEXTURE_DIMS } from "./utils/constants";
import * as THREE from "three";

export default class Canvas implements ICanvas {
  private canvas: OffscreenCanvas;
  private ctx: OffscreenCanvasRenderingContext2D | null;

  constructor() {
    this.canvas = new OffscreenCanvas(TEXTURE_DIMS, TEXTURE_DIMS);

    this.ctx = this.canvas.getContext("2d");
    console.log(this.canvas.width, "x", this.canvas.height);
  }

  drawImage(img: HTMLImageElement) {
    this.ctx?.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
  }

  generateDataTexture(indices?: number[]): Float32Array {
    if (!indices) {
      indices = this.grayscaleValues().indices;
    }

    let count = TEXTURE_DIMS ** 2;
    let ptexdata = new Float32Array(count * 4);
    let id = 0;

    for (let i = 0; i < count; i++) {
      // get random index value
      const randIdx = indices[~~(Math.random() * indices.length)];
      //particle texture values (agents)
      id = i * 4;
      // ptexdata[id++] = 0; // normalized pos x
      ptexdata[id++] = (randIdx % TEXTURE_DIMS) / TEXTURE_DIMS;
      // ptexdata[id++] = Math.random(); // normalized pos y
      ptexdata[id++] = 1 - ~~(randIdx / TEXTURE_DIMS) / TEXTURE_DIMS;
      // ptexdata[id++] = 0.5;
      ptexdata[id++] = Math.random() * 0.01; // this should come from heightmap
      ptexdata[id++] = 1;
    }
    return ptexdata;
  }

  grayscaleValues() {
    if (!this.ctx) return {} as IGrayscaleIndices;
    const imgData = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    const iData = imgData.data;
    const l = this.canvas.width * this.canvas.height;

    const grayscale = new Float32Array(l);
    const indices: number[] = [];

    for (let i = 0; i < l; i++) {
      let i4 = i * 4;

      // the grayscale value
      let value =
        (iData[i4] / 0xff) * 0.299 +
        (iData[i4 + 1] / 0xff) * 0.587 +
        (iData[i4 + 2] / 0xff) * 0.114;

      grayscale[i] = value;

      // keep a record of non-white indices
      if (value !== 0) indices.push(i);
    }

    return {
      data: grayscale,
      indices: indices
    };
  }
}
