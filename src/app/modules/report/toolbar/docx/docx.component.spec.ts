import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocxComponent } from './docx.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MaterialAllModule } from 'src/app/material.module';

describe('DocxComponent', () => {
  let component: DocxComponent;
  let fixture: ComponentFixture<DocxComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DocxComponent],
      imports:      [MaterialAllModule, SharedModule ]
    });
    fixture = TestBed.createComponent(DocxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
