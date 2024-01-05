/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgeCookieItemComponent } from './knowledge-cookie-item.component';

describe('KnowledgeCookieItemComponent', () => {
  let component: KnowledgeCookieItemComponent;
  let fixture: ComponentFixture<KnowledgeCookieItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KnowledgeCookieItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnowledgeCookieItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
