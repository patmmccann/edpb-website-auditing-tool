import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeaconDetailsComponent } from './beacon-details.component';

describe('BeaconDetailsComponent', () => {
  let component: BeaconDetailsComponent;
  let fixture: ComponentFixture<BeaconDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BeaconDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BeaconDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
