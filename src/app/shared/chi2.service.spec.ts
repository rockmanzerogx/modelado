import { TestBed } from '@angular/core/testing';

import { Chi2Service } from './chi2.service';

describe('Chi2Service', () => {
  let service: Chi2Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Chi2Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
