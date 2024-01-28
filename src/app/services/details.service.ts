/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import {EventEmitter, Injectable } from '@angular/core';
import { LocalStorageLine } from '../models/cards/local-storage-card.model';
import { CookieLine } from '../models/cards/cookie-card.model';
import { BeaconLine } from '../models/cards/beacon-card.model';

@Injectable({
  providedIn: 'root'
})
export class DetailsService {
  eventDetails : EventEmitter<any> = new EventEmitter<any>();
  detailsData: LocalStorageLine| CookieLine | BeaconLine | null = null;

  constructor() {
  }
}
