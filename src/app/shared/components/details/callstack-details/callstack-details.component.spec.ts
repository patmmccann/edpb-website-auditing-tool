import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallstackDetailsComponent } from './callstack-details.component';
import { MaterialAllModule } from 'src/app/material.module';

describe('CallstackDetailsComponent', () => {
  let component: CallstackDetailsComponent;
  let fixture: ComponentFixture<CallstackDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CallstackDetailsComponent ],
      imports:      [ MaterialAllModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CallstackDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
