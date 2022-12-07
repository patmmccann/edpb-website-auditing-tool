import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportRendererComponent } from './report-renderer.component';

describe('ReportRendererComponent', () => {
  let component: ReportRendererComponent;
  let fixture: ComponentFixture<ReportRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportRendererComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
