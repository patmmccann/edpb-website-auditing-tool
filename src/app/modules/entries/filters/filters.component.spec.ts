import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltersComponent } from './filters.component';
import { MaterialAllModule } from 'src/app/material.module';
import { SharedModule } from 'src/app/shared/shared.module';

describe('FiltersComponent', () => {
  let component: FiltersComponent;
  let fixture: ComponentFixture<FiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FiltersComponent ],
      imports:      [ MaterialAllModule, SharedModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
