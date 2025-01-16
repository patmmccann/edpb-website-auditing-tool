/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewBaseComponent } from './new-base.component';
import { MaterialAllModule } from 'src/app/material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from 'src/app/shared/shared.module';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

describe('NewBaseComponent', () => {
  let component: NewBaseComponent;
  let fixture: ComponentFixture<NewBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [MaterialAllModule, RouterTestingModule, SharedModule, MatDialogModule, NewBaseComponent],
    providers: [
        {
            provide: MatDialogRef,
            useValue: {}
        },
        {
            provide: MAT_DIALOG_DATA,
            useValue: {}
        }
    ],
})
    .compileComponents();

    fixture = TestBed.createComponent(NewBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
