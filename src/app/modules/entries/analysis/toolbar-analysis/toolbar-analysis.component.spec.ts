import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarAnalysisComponent } from './toolbar-analysis.component';

describe('ToolbarAnalysisComponent', () => {
  let component: ToolbarAnalysisComponent;
  let fixture: ComponentFixture<ToolbarAnalysisComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ToolbarAnalysisComponent]
    });
    fixture = TestBed.createComponent(ToolbarAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
