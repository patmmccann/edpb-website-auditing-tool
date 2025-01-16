/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, OnInit,Input } from '@angular/core';
import { LocalStorageLine } from 'src/app/models/cards/local-storage-card.model';
import { Details } from 'src/app/models/details.model';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-localstorage-details',
    templateUrl: './localstorage-details.component.html',
    styleUrls: ['./localstorage-details.component.scss'],
    imports: [NgIf]
})
export class LocalstorageDetailsComponent implements OnInit {
  @Input() line : LocalStorageLine | null = null;
  public JSON : any;
  
  constructor() {
    this.JSON = JSON;

   }

  ngOnInit(): void {
   }

}
