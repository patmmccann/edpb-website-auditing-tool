/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalCardComponent } from './global-card.component';
import { MaterialAllModule } from 'src/app/material.module';
import { SharedModule } from 'src/app/shared/shared.module';

describe('GlobalCardComponent', () => {
  let component: GlobalCardComponent;
  let fixture: ComponentFixture<GlobalCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [MaterialAllModule, SharedModule, GlobalCardComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(GlobalCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
