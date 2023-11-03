import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardsComponent } from './cards.component';
import { MaterialAllModule } from 'src/app/material.module';
import { SharedModule } from '../../shared.module';

describe('CardsComponent', () => {
  let component: CardsComponent;
  let fixture: ComponentFixture<CardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardsComponent ],
      imports:      [ MaterialAllModule, SharedModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
