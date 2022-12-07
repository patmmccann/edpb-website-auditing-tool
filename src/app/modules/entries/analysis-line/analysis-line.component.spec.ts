import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalysisLineComponent } from './analysis-line.component';

describe('AnalysisLineComponent', () => {
  let component: AnalysisLineComponent;
  let fixture: ComponentFixture<AnalysisLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnalysisLineComponent ]
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
