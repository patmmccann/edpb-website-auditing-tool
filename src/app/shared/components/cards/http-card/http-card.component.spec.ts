import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpCardComponent } from './http-card.component';

describe('HttpCardComponent', () => {
  let component: HttpCardComponent;
  let fixture: ComponentFixture<HttpCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HttpCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HttpCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
