import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalysisLineComponent } from './analysis-line.component';
import { MaterialAllModule } from 'src/app/material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from 'src/app/shared/shared.module';

describe('AnalysisLineComponent', () => {
  let component: AnalysisLineComponent;
  let fixture: ComponentFixture<AnalysisLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnalysisLineComponent ],
      imports:      [MaterialAllModule, RouterTestingModule, SharedModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalysisLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
