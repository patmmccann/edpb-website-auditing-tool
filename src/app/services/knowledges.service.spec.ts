import { TestBed } from '@angular/core/testing';

import { KnowledgesService } from './knowledges.service';

describe('KnowledgesService', () => {
  let service: KnowledgesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KnowledgesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
