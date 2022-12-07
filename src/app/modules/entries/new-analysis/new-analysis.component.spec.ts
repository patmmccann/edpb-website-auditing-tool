import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAnalysisComponent } from './new-analysis.component';

describe('NewAnalysisComponent', () => {
  let component: NewAnalysisComponent;
  let fixture: ComponentFixture<NewAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewAnalysisComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
