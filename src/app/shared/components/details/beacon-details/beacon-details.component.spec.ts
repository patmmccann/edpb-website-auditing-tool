/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeaconDetailsComponent } from './beacon-details.component';

describe('BeaconDetailsComponent', () => {
  let component: BeaconDetailsComponent;
  let fixture: ComponentFixture<BeaconDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [BeaconDetailsComponent]
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
