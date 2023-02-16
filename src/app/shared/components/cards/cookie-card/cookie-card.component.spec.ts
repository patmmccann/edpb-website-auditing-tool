import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CookieCardComponent } from './cookie-card.component';

describe('CookieCardComponent', () => {
  let component: CookieCardComponent;
  let fixture: ComponentFixture<CookieCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CookieCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CookieCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
