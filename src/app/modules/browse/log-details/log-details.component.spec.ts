/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogDetailsComponent } from './log-details.component';
import { MaterialAllModule } from 'src/app/material.module';

describe('LogDetailsComponent', () => {
  let component: LogDetailsComponent;
  let fixture: ComponentFixture<LogDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [MaterialAllModule, LogDetailsComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(LogDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
