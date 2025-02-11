/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { CookieLine } from 'src/app/models/cards/cookie-card.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-cookie-details',
    templateUrl: './cookie-details.component.html',
    styleUrls: ['./cookie-details.component.scss'],
    imports: [TranslateModule]
})
export class CookieDetailsComponent implements OnInit{
  @Input() line : CookieLine | null = null;
    
  constructor(
  ) {
  }

  ngOnInit(): void {
    
  }

}
