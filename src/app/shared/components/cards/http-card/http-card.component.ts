/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, OnInit, Input } from '@angular/core';
import { viewContext } from 'src/app/models/card.model';
import { HTTPCard } from 'src/app/models/cards/http-card.model';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-http-card',
    templateUrl: './http-card.component.html',
    styleUrls: ['./http-card.component.scss'],
    imports: [NgIf, TranslateModule]
})
export class HttpCardComponent implements OnInit {
  @Input() card: HTTPCard = new HTTPCard(null);;
  @Input() context: viewContext = 'evaluate';

  constructor() { }

  ngOnInit(): void {
  }

}
