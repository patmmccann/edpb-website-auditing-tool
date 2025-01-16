/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { viewContext } from 'src/app/models/card.model';
import { CookieLine } from 'src/app/models/cards/cookie-card.model';
import { Details } from 'src/app/models/details.model';
import { Status } from 'src/app/models/evaluation.model';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-cookie-details',
    templateUrl: './cookie-details.component.html',
    styleUrls: ['./cookie-details.component.scss'],
    imports: [NgIf, TranslateModule]
})
export class CookieDetailsComponent implements OnInit{
  @Input() line : CookieLine | null = null;
    
  constructor(
  ) {
  }

  ngOnInit(): void {
    
  }

}
