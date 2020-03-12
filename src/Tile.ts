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

function getLayerURLs({ lat, lon, zoom }: IPointOfInterest): IMapboxURLs {
  const mapStyle: string = `${process.env.MAPBOX_USER}/ck50z5b163hk61cp6spor8074`;

  return {
    satellite: `https://api.mapbox.com/v4/mapbox.satellite/${zoom}/${lon}/${lat}.pngraw?access_token=${process.env.MAPBOX_ACCESS_TOKEN}`,
    elevation: `https://api.mapbox.com/v4/mapbox.terrain-rgb/${zoom}/${lon}/${lat}.pngraw?access_token=${process.env.MAPBOX_ACCESS_TOKEN}`,
    streets: `https://api.mapbox.com/styles/v1/${mapStyle}/static/${lon},${lat},${zoom}/${TEXTURE_DIMS}x${TEXTURE_DIMS}@2x?attribution=false&logo=false&access_token=${process.env.MAPBOX_ACCESS_TOKEN}`
  };
}
