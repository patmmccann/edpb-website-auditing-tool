/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, OnInit, Input } from '@angular/core';
import { BeaconLine } from 'src/app/models/cards/beacon-card.model';
import { KeyValuePipe } from '@angular/common';

@Component({
    selector: 'app-beacon-details',
    templateUrl: './beacon-details.component.html',
    styleUrls: ['./beacon-details.component.scss'],
    imports: [KeyValuePipe]
})
export class BeaconDetailsComponent implements OnInit {

  @Input() line : BeaconLine | null = null;
  JSON : any = null;

  constructor() { 
    this.JSON = JSON
  }

  ngOnInit(): void {
  }

}
