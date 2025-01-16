import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareComponent } from './compare.component';
import { MaterialAllModule } from 'src/app/material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from 'src/app/shared/shared.module';

describe('CompareComponent', () => {
  let component: CompareComponent;
  let fixture: ComponentFixture<CompareComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [MaterialAllModule, RouterTestingModule, SharedModule, CompareComponent]
});
    fixture = TestBed.createComponent(CompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
