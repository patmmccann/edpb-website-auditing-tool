import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntriesComponent } from './entries.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MaterialAllModule } from 'src/app/material.module';

describe('EntriesComponent', () => {
  let component: EntriesComponent;
  let fixture: ComponentFixture<EntriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntriesComponent ],
      imports:      [MaterialAllModule, SharedModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
