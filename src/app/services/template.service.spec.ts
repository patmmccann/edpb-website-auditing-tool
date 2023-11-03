import { TestBed } from '@angular/core/testing';

import { TemplateService } from './template.service';
import { SharedModule } from '../shared/shared.module';

describe('TemplateService', () => {
  let service: TemplateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:      [SharedModule]
    });
    service = TestBed.inject(TemplateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
