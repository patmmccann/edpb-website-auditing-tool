import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportRendererComponent } from './report-renderer.component';
import { SharedModule } from 'src/app/shared/shared.module';

describe('ReportRendererComponent', () => {
  let component: ReportRendererComponent;
  let fixture: ComponentFixture<ReportRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportRendererComponent ],
      imports:      [ SharedModule]
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
