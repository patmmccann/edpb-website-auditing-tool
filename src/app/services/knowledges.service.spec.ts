/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { TestBed } from '@angular/core/testing';

import { KnowledgesService } from './knowledges.service';

describe('KnowledgesService', () => {
 
  it('should be created', () => {
    expect(new KnowledgesService("test", [])).toBeTruthy();
  });
});
