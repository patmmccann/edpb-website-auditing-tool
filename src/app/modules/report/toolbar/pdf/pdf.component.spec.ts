import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfComponent } from './pdf.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MaterialAllModule } from 'src/app/material.module';

describe('PdfComponent', () => {
  let component: PdfComponent;
  let fixture: ComponentFixture<PdfComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PdfComponent],
      imports:      [MaterialAllModule, SharedModule ]
    });
    fixture = TestBed.createComponent(PdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
