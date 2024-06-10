import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CookieLogDetailsComponent } from './cookie-log-details.component';

describe('CookieLogDetailsComponent', () => {
  let component: CookieLogDetailsComponent;
  let fixture: ComponentFixture<CookieLogDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CookieLogDetailsComponent]
    });
    fixture = TestBed.createComponent(CookieLogDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
