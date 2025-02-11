import { Component, Input } from '@angular/core';
import { Analysis } from 'src/app/models/analysis.model';
import { Card, viewContext } from 'src/app/models/card.model';
import { InfoCard } from 'src/app/models/cards/info-card.model';
import { Tag } from 'src/app/models/tag.model';
import {DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-info-card',
    templateUrl: './info-card.component.html',
    styleUrls: ['./info-card.component.scss'],
    imports: [DatePipe, TranslateModule]
})
export class InfoCardComponent {
  @Input() context: viewContext = 'evaluate';
  @Input() card: InfoCard  = new InfoCard(null);
  @Input() analysis: Analysis | null = null;
  @Input() tag: Tag | null = null;
}
