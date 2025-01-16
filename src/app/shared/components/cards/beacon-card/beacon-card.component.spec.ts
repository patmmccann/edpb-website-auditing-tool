/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeaconCardComponent } from './beacon-card.component';

describe('BeaconCardComponent', () => {
  let component: BeaconCardComponent;
  let fixture: ComponentFixture<BeaconCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [BeaconCardComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(BeaconCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
