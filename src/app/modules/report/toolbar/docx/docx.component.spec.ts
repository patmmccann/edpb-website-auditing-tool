import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocxComponent } from './docx.component';

describe('DocxComponent', () => {
  let component: DocxComponent;
  let fixture: ComponentFixture<DocxComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DocxComponent]
    });
    fixture = TestBed.createComponent(DocxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
