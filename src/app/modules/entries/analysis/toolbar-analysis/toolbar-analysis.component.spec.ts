import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarAnalysisComponent } from './toolbar-analysis.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MaterialAllModule } from 'src/app/material.module';

describe('ToolbarAnalysisComponent', () => {
  let component: ToolbarAnalysisComponent;
  let fixture: ComponentFixture<ToolbarAnalysisComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ToolbarAnalysisComponent],
      imports:      [MaterialAllModule, SharedModule]
    });
    fixture = TestBed.createComponent(ToolbarAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
