import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationsComponent } from './evaluations.component';
import { MaterialAllModule } from 'src/app/material.module';
import { SharedModule } from '../../shared.module';

describe('EvaluationsComponent', () => {
  let component: EvaluationsComponent;
  let fixture: ComponentFixture<EvaluationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EvaluationsComponent ],
      imports:      [ MaterialAllModule, SharedModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
