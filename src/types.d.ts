interface IDoubleFBO {
  read: THREE.WebGLRenderTarget;
  write: THREE.WebGLRenderTarget;
  swap(): any;
}

interface IGrayscaleIndices {
  data: Float32Array;
  indices: number[];
}

interface ICanvas {
  drawImage(img: HTMLImageElement): void;
  generateDataTexture(indices?: number[]): Float32Array;
  grayscaleValues(): IGrayscaleIndices;
}

interface ITile {
  getTileImg(coordinates: IPointOfInterest): Promise<HTMLImageElement>;
}

interface IPointOfInterest {
  lat: number;
  lon: number;
  zoom: number;
}
