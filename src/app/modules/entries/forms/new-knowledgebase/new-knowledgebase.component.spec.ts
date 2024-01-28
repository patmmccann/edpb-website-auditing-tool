/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewKnowledgebaseComponent } from './new-knowledgebase.component';

describe('NewKnowledgebaseComponent', () => {
  let component: NewKnowledgebaseComponent;
  let fixture: ComponentFixture<NewKnowledgebaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewKnowledgebaseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewKnowledgebaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
