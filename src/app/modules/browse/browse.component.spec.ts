/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseComponent } from './browse.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialAllModule } from 'src/app/material.module';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { AngularSplitModule } from 'angular-split';
import { SharedModule } from 'src/app/shared/shared.module';

describe('BrowseComponent', () => {
  let component: BrowseComponent;
  let fixture: ComponentFixture<BrowseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrowseComponent,ToolbarComponent ],
      imports:      [MaterialAllModule, RouterTestingModule, SharedModule, AngularSplitModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrowseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
