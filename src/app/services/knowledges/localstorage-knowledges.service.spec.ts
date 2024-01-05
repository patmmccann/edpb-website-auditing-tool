/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { TestBed } from '@angular/core/testing';

import { LocalstorageKnowledgesService } from './localstorage-knowledges.service';

describe('LocalstorageKnowledgesService', () => {
  let service: LocalstorageKnowledgesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalstorageKnowledgesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
