/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportRendererComponent } from './report-renderer.component';
import { SharedModule } from 'src/app/shared/shared.module';

describe('ReportRendererComponent', () => {
  let component: ReportRendererComponent;
  let fixture: ComponentFixture<ReportRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [SharedModule, ReportRendererComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(ReportRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
