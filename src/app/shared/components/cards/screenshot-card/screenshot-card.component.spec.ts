/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenshotCardComponent } from './screenshot-card.component';
import { SharedModule } from 'src/app/shared/shared.module';

describe('ScreenshotCardComponent', () => {
  let component: ScreenshotCardComponent;
  let fixture: ComponentFixture<ScreenshotCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScreenshotCardComponent ],
      imports:      [ SharedModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenshotCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
