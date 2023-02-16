import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnsafeFormCardComponent } from './unsafe-form-card.component';

describe('UnsafeFormCardComponent', () => {
  let component: UnsafeFormCardComponent;
  let fixture: ComponentFixture<UnsafeFormCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnsafeFormCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnsafeFormCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
