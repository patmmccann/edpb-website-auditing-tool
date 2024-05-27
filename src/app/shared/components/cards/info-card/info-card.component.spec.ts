import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoCardComponent } from './info-card.component';
import { MaterialAllModule } from 'src/app/material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from 'src/app/shared/shared.module';

describe('InfoCardComponent', () => {
  let component: InfoCardComponent;
  let fixture: ComponentFixture<InfoCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InfoCardComponent],
      imports:      [MaterialAllModule, RouterTestingModule, SharedModule ]
    });
    fixture = TestBed.createComponent(InfoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
