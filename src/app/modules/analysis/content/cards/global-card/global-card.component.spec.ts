import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalCardComponent } from './global-card.component';
import { MaterialAllModule } from 'src/app/material.module';
import { SharedModule } from 'src/app/shared/shared.module';

describe('GlobalCardComponent', () => {
  let component: GlobalCardComponent;
  let fixture: ComponentFixture<GlobalCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GlobalCardComponent ],
      imports:      [ MaterialAllModule,SharedModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
