import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestTrackingDetailsComponent } from './request-tracking-details.component';

describe('RequestTrackingDetailsComponent', () => {
  let component: RequestTrackingDetailsComponent;
  let fixture: ComponentFixture<RequestTrackingDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RequestTrackingDetailsComponent]
    });
    fixture = TestBed.createComponent(RequestTrackingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
