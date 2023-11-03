import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateComponent } from './template.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterTestingModule } from '@angular/router/testing';

describe('TemplateComponent', () => {
  let component: TemplateComponent;
  let fixture: ComponentFixture<TemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TemplateComponent ],
      imports:      [RouterTestingModule, SharedModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
