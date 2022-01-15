import { Injectable } from '@angular/core';

export interface product {
  name: string;
  prettyName: string;
  imageHeaderMagic?: number[]
}

@Injectable({
  providedIn: 'root',
})
export class SupportedProductsService {
  productList: product[] = [
    {
      name: 'DA1469X',
      prettyName: 'DA1469X',
      imageHeaderMagic: [0x51,71],
    },
    {
      name: 'DA14585',
      prettyName: 'DA14585/DA14586',
    },
    {
      name: 'DA14531',
      prettyName: 'DA14530/DA14531',
      imageHeaderMagic: [0x70,51],
    },
  ];

  constructor() {}

  getProducList(): product[] {
    return this.productList;
  }

  getProduct(name: string): product {
    for (let p of this.productList) {
      if (p.name == name) {
        return p;
      }
    }
    throw 'Product not found';
  }

  getProductByImageMagic(magic: Blob): product {

    for (let p of this.productList) {
      if ((p.imageHeaderMagic[0] == magic[0]) && (p.imageHeaderMagic[1] == magic[1])) {
        return p;
      }
    }
    throw 'Product not found';
  }
}
