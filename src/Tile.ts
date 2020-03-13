// This class loads and saves a map image tile
import { TEXTURE_DIMS } from "./utils/constants";

interface IMapboxURLs {
  elevation: string;
  satellite: string;
  streets: string;
}

interface ILayersImg {
  elevation: HTMLImageElement;
  satellite: HTMLImageElement;
  streets: HTMLImageElement;
}

export default class Tile implements ITile {
  private img: HTMLImageElement;
  private urls: IMapboxURLs = {} as IMapboxURLs;
  private layers: ILayersImg = {} as ILayersImg;

  constructor(coordinates: IPointOfInterest) {
    this.img = document.body.appendChild(document.createElement("img"));
    this.img.style.display = "none";
    this.coordinates(coordinates);

    this.layers = ["elevation", "satellite", "streets"].reduce((acc, val) => {
      acc[val] = document.body.appendChild(document.createElement("img"));
      acc[val].style.display = "none";
      return acc;
    }, {} as any);

    console.log(this.layers);
    return this;
  }

  coordinates(point: IPointOfInterest) {
    this.urls = getLayerURLs(point);
  }

  async elevation(): Promise<HTMLImageElement> {
    return this.getTileImg(this.urls.elevation, this.layers.elevation);
  }

  async satellite(): Promise<HTMLImageElement> {
    return this.getTileImg(this.urls.satellite, this.layers.satellite);
  }

  async streets(): Promise<HTMLImageElement> {
    return this.getTileImg(this.urls.streets, this.layers.streets);
  }

  async getTileImg(
    url: string,
    img: HTMLImageElement
  ): Promise<HTMLImageElement> {
    // const { streets: streetURL } = this.urls;
    return new Promise((resolve, reject) => {
      img.addEventListener("load", () => resolve(img));
      img.addEventListener("error", (err: ErrorEvent) => reject(err));
      img.crossOrigin = "";
      img.src = url;
    });
  }
}

function long2tile(l: number, zoom: number): number {
  return Math.floor(((l + 180) / 360) * Math.pow(2, zoom));
}

function lat2tile(l: number, zoom: number): number {
  return Math.floor(
    ((1 -
      Math.log(
        Math.tan((l * Math.PI) / 180) + 1 / Math.cos((l * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
      Math.pow(2, zoom)
  );
}

function getLayerURLs({ lat, lon, zoom }: IPointOfInterest): IMapboxURLs {
  zoom = zoom | 1;
  const mapStyle: string = `${process.env.MAPBOX_USER}/ck50z5b163hk61cp6spor8074`;

  return {
    // or try the https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/
    // endpoint if you find corresponding elevation
    satellite: `https://api.mapbox.com/v4/mapbox.satellite/${zoom |
      1}/${long2tile(lon, zoom)}/${lat2tile(
      lat,
      zoom
    )}@2x.pngraw?access_token=${process.env.MAPBOX_ACCESS_TOKEN}`,
    elevation: `https://api.mapbox.com/v4/mapbox.terrain-rgb/${zoom |
      1}/${long2tile(lon, zoom)}/${lat2tile(
      lat,
      zoom
    )}@2x.pngraw?access_token=${process.env.MAPBOX_ACCESS_TOKEN}`,
    streets: `https://api.mapbox.com/styles/v1/${mapStyle}/static/${lon},${lat},${zoom}/${TEXTURE_DIMS}x${TEXTURE_DIMS}@2x?attribution=false&logo=false&access_token=${process.env.MAPBOX_ACCESS_TOKEN}`
  };
}
