/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallstackDetailsComponent } from './callstack-details.component';
import { MaterialAllModule } from 'src/app/material.module';

describe('CallstackDetailsComponent', () => {
  let component: CallstackDetailsComponent;
  let fixture: ComponentFixture<CallstackDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [MaterialAllModule, CallstackDetailsComponent]
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
