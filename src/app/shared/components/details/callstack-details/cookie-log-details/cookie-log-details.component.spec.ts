import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CookieLogDetailsComponent } from './cookie-log-details.component';
import { MaterialAllModule } from 'src/app/material.module';
import { SharedModule } from 'src/app/shared/shared.module';

describe('CookieLogDetailsComponent', () => {
  let component: CookieLogDetailsComponent;
  let fixture: ComponentFixture<CookieLogDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CookieLogDetailsComponent],
      imports:      [MaterialAllModule,  SharedModule ]
    });
    fixture = TestBed.createComponent(CookieLogDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
