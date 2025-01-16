import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestTrackingDetailsComponent } from './request-tracking-details.component';
import { MaterialAllModule } from 'src/app/material.module';
import { SharedModule } from 'src/app/shared/shared.module';

describe('RequestTrackingDetailsComponent', () => {
  let component: RequestTrackingDetailsComponent;
  let fixture: ComponentFixture<RequestTrackingDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [MaterialAllModule, SharedModule, RequestTrackingDetailsComponent]
});
    fixture = TestBed.createComponent(RequestTrackingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
