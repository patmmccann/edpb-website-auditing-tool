import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguagesComponent } from './languages.component';
import { MaterialAllModule } from 'src/app/material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '../../shared.module';

describe('LanguagesComponent', () => {
  let component: LanguagesComponent;
  let fixture: ComponentFixture<LanguagesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LanguagesComponent],
      imports:      [MaterialAllModule, RouterTestingModule, SharedModule ]
    });
    fixture = TestBed.createComponent(LanguagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
