/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowserComponent } from './browser.component';
import { MaterialAllModule } from 'src/app/material.module';
import { SharedModule } from 'src/app/shared/shared.module';

describe('BrowserComponent', () => {
  let component: BrowserComponent;
  let fixture: ComponentFixture<BrowserComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [MaterialAllModule, SharedModule, BrowserComponent]
});
    fixture = TestBed.createComponent(BrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
