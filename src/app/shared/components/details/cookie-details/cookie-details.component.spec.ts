import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CookieDetailsComponent } from './cookie-details.component';

describe('CookieDetailsComponent', () => {
  let component: CookieDetailsComponent;
  let fixture: ComponentFixture<CookieDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CookieDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CookieDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
