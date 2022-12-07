import { TestBed } from '@angular/core/testing';

import { CookieKnowledgesService } from './cookie-knowledges.service';

describe('CookieKnowledgesService', () => {
  let service: CookieKnowledgesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CookieKnowledgesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
