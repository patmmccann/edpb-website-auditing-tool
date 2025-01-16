/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestsslCardComponent } from './testssl-card.component';

describe('TestsslCardComponent', () => {
  let component: TestsslCardComponent;
  let fixture: ComponentFixture<TestsslCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [TestsslCardComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(TestsslCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
