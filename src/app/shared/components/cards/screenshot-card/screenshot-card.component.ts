/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, OnInit, Input } from '@angular/core';
import { Card, viewContext } from 'src/app/models/card.model';
import { ScreenshotCard } from 'src/app/models/cards/screenshot-card.model';

@Component({
  selector: 'app-screenshot-card',
  templateUrl: './screenshot-card.component.html',
  styleUrls: ['./screenshot-card.component.scss']
})
export class ScreenshotCardComponent implements OnInit {
  screenshotCard: ScreenshotCard = new ScreenshotCard("");
  @Input() context: viewContext = 'evaluate';
  
  @Input() card: Card | null = null;
  
  constructor() { }

  ngOnInit(): void {
    if (this.card){
      this.screenshotCard = <ScreenshotCard>this.card;
    }
  }

}
