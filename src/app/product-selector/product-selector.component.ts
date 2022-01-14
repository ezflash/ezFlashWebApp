import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { product,SupportedProductsService } from '../supported-products.service';

@Component({
  selector: 'app-product-selector',
  templateUrl: './product-selector.component.html',
  styleUrls: ['./product-selector.component.scss'],
})
export class ProductSelectorComponent implements OnInit {
  @Output() selectedProduct = new EventEmitter<product>();

  productList : product[];

  constructor(private pl: SupportedProductsService) {}

  ngOnInit(): void {
    this.productList = this.pl.getProducList();
  }

  selectProduct(index: number) : void {
    this.selectedProduct.emit(this.productList[index]);
  }
}
