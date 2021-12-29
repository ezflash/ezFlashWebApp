import { TestBed } from '@angular/core/testing';

import { FileFetcherService } from './file-fetcher.service';

describe('FileFetcherService', () => {
  let service: FileFetcherService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileFetcherService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
