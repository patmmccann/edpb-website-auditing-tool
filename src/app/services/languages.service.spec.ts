import { TestBed } from '@angular/core/testing';

import { LanguagesService } from './languages.service';
import { SharedModule } from '../shared/shared.module';

describe('LanguagesService', () => {
  let service: LanguagesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:      [SharedModule ]
    });
    service = TestBed.inject(LanguagesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
