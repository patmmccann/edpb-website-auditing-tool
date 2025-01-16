/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalStorageCardComponent } from './local-storage-card.component';

describe('LocalStorageCardComponent', () => {
  let component: LocalStorageCardComponent;
  let fixture: ComponentFixture<LocalStorageCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [LocalStorageCardComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(LocalStorageCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
