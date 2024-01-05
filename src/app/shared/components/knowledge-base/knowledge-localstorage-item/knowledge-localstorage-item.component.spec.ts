/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgeLocalstorageItemComponent } from './knowledge-localstorage-item.component';

describe('KnowledgeLocalstorageItemComponent', () => {
  let component: KnowledgeLocalstorageItemComponent;
  let fixture: ComponentFixture<KnowledgeLocalstorageItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KnowledgeLocalstorageItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnowledgeLocalstorageItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
