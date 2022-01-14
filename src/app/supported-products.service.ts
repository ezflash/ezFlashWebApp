import { Injectable } from '@angular/core';

export interface product {
  name      : string;
  prettyName: string;
}

@Injectable({
  providedIn: 'root'
})

export class SupportedProductsService {

  productList : product[] = [
    {
      name       : "DA1469X",
      prettyName : "DA1469X",
    },
    {
      name       : "DA14585",
      prettyName : "DA14585/DA14586",
    },
    {
      name       : "DA14531",
      prettyName : "DA14530/DA14531",
    },
  ];

  constructor() { }


  getProducList() : product[] {
    return this.productList;
  }

}
