import { TestBed } from '@angular/core/testing';

import { KnowledgesService } from './knowledges.service';

describe('KnowledgesService', () => {
 
  it('should be created', () => {
    expect(new KnowledgesService("test", [])).toBeTruthy();
  });
});
