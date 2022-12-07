import { TestBed } from '@angular/core/testing';

import { InspectionService } from './inspection.service';

describe('InspectionService', () => {
  let service: InspectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InspectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
