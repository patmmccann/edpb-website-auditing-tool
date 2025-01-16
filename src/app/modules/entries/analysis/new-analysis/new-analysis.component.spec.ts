/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAnalysisComponent } from './new-analysis.component';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from 'src/app/shared/shared.module';
import { MaterialAllModule } from 'src/app/material.module';

describe('NewAnalysisComponent', () => {
  let component: NewAnalysisComponent;
  let fixture: ComponentFixture<NewAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [MaterialAllModule, RouterTestingModule, SharedModule, NewAnalysisComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(NewAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
