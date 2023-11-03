import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateTableComponent } from './template-table.component';
import { SharedModule } from 'src/app/shared/shared.module';

describe('TemplateTableComponent', () => {
  let component: TemplateTableComponent;
  let fixture: ComponentFixture<TemplateTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TemplateTableComponent ],
      imports:      [ SharedModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemplateTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
