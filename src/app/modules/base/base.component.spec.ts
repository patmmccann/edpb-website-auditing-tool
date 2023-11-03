import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseComponent } from './base.component';
import { MaterialAllModule } from 'src/app/material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from 'src/app/shared/shared.module';

describe('BaseComponent', () => {
  let component: BaseComponent;
  let fixture: ComponentFixture<BaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BaseComponent ],
      imports:      [MaterialAllModule, RouterTestingModule, SharedModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
