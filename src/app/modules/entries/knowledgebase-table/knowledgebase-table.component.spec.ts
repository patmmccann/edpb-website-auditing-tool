/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgebaseTableComponent } from './knowledgebase-table.component';
import { MaterialAllModule } from 'src/app/material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from 'src/app/shared/shared.module';

describe('KnowledgebaseTableComponent', () => {
  let component: KnowledgebaseTableComponent;
  let fixture: ComponentFixture<KnowledgebaseTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [MaterialAllModule, RouterTestingModule, SharedModule, KnowledgebaseTableComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(KnowledgebaseTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
