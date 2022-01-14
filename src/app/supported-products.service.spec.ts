import { TestBed } from '@angular/core/testing';

import { SupportedProductsService } from './supported-products.service';

describe('SupportedProductsService', () => {
  let service: SupportedProductsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupportedProductsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
