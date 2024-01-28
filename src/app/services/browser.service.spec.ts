/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { TestBed } from '@angular/core/testing';

import { BrowserService } from './browser.service';

describe('BrowserService', () => {
  let service: BrowserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrowserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
