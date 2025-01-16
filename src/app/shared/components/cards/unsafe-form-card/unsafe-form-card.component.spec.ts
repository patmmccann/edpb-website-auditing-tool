/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnsafeFormCardComponent } from './unsafe-form-card.component';

describe('UnsafeFormCardComponent', () => {
  let component: UnsafeFormCardComponent;
  let fixture: ComponentFixture<UnsafeFormCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [UnsafeFormCardComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(UnsafeFormCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
