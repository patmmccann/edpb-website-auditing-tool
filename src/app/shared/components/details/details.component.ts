/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, Input, OnInit } from '@angular/core';
import { BeaconLine } from 'src/app/models/cards/beacon-card.model';
import { CookieLine } from 'src/app/models/cards/cookie-card.model';
import { LocalStorageLine } from 'src/app/models/cards/local-storage-card.model';
import { Details } from 'src/app/models/details.model';
import { NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { CookieDetailsComponent } from './cookie-details/cookie-details.component';
import { LocalstorageDetailsComponent } from './localstorage-details/localstorage-details.component';
import { BeaconDetailsComponent } from './beacon-details/beacon-details.component';

@Component({
    selector: 'app-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
    imports: [NgIf, NgSwitch, NgSwitchCase, CookieDetailsComponent, LocalstorageDetailsComponent, BeaconDetailsComponent]
})
export class DetailsComponent implements OnInit {
  @Input() detailsData: BeaconLine | LocalStorageLine| CookieLine | null = null;

  constructor() { }

  ngOnInit(): void {
  }

  castToCookieLine(line:Details):CookieLine{
    return line as CookieLine;
  }

  castToLocalStorageLine(line:Details):LocalStorageLine{
    return line as LocalStorageLine;
  }

  castToBeaconLine(line:Details):BeaconLine{
    return line as BeaconLine;
  }
}
