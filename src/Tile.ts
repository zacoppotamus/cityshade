// This class loads and saves a map image tile
import { TEXTURE_DIMS } from "./utils/constants";

interface IMapboxURLs {
  elevation: string;
  satellite: string;
  streets: string;
}

export default class Tile implements ITile {
  private img: HTMLImageElement;
  constructor() {
    this.img = document.body.appendChild(document.createElement("img"));
    this.img.style.display = "none";
    return this;
  }

  async getTileImg(coordinates: IPointOfInterest): Promise<HTMLImageElement> {
    const { streets: streetURL } = getLayerURLs(coordinates);
    return new Promise((resolve, reject) => {
      this.img.addEventListener("load", () => resolve(this.img));
      this.img.addEventListener("error", (err: ErrorEvent) => reject(err));
      this.img.crossOrigin = "";
      this.img.src = streetURL;
    });
    // await fetch(getTileUrl(coordinates))
    //   .then(res => res.blob())
    //   .then(blob => {
    //     return new Promise((resolve, reject) => {
    //       this.img.addEventListener("load", () => {
    //         console.log("resolving");
    //         resolve(this.img);
    //       });
    //       this.img.addEventListener("error", err => reject(err));
    //       this.img.src = URL.createObjectURL(blob);
    //     });
    //   });
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

// function getTileUrl({ lat, lon, zoom }: IPointOfInterest): string {
//   const dim = TEXTURE_DIMS;
//   const mapStyle: string = `${process.env.MAPBOX_USER}/ck50z5b163hk61cp6spor8074`;
//   return `
//     https://api.mapbox.com/styles/v1/${mapStyle}/static/${lon},${lat},${zoom}/${dim}x${dim}@2x?attribution=false&logo=false&access_token=${process.env.MAPBOX_ACCESS_TOKEN}
//   `;
// }
