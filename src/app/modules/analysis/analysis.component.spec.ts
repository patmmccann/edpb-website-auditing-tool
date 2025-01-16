/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AnalysisComponent } from './analysis.component';
import { MaterialAllModule } from 'src/app/material.module';
import { ContentComponent } from './content/content.component';
import { GlobalCardComponent } from './content/cards/global-card/global-card.component';
import { SharedModule } from 'src/app/shared/shared.module';

describe('AnalysisComponent', () => {
  let component: AnalysisComponent;
  let fixture: ComponentFixture<AnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [MaterialAllModule, RouterTestingModule, SharedModule, AnalysisComponent, ContentComponent, GlobalCardComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(AnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
