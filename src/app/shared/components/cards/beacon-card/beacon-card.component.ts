/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, OnInit,Input } from '@angular/core';
import { Sort, MatSort, MatSortHeader } from '@angular/material/sort';
import { viewContext } from 'src/app/models/card.model';
import { BeaconCard } from 'src/app/models/cards/beacon-card.model';
import { BeaconLine } from 'src/app/models/cards/beacon-card.model';
import { CardService } from 'src/app/services/card.service';
import { DetailsService } from 'src/app/services/details.service';
import { Status } from 'src/app/models/evaluation.model';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { FilterForStatus, FilterForBeacon } from '../../../../pipes/filters.pipe';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-beacon-card',
    templateUrl: './beacon-card.component.html',
    styleUrls: ['./beacon-card.component.scss'],
    imports: [NgIf, MatSort, MatSortHeader, NgFor, MatIconModule, NgClass, FilterForStatus, FilterForBeacon, MatButtonModule]
})
export class BeaconCardComponent implements OnInit {

  @Input() card: BeaconCard = new BeaconCard();
  @Input() context: viewContext = 'evaluate';
  @Input() searchStatus :Status[]= [];
  @Input() searchBeacon = {};
  
  constructor(
    private cardService : CardService,
    private detailsService:DetailsService,
    private knowledgeBaseService: KnowledgeBaseService
  ) { 
  }

  ngOnInit(): void {
  }

  selected(line : BeaconLine):void{
    this.knowledgeBaseService.knowledgeBaseKind = null;
    this.knowledgeBaseService.knowledgeBaseData = null;
    this.detailsService.detailsData = line;
    this.detailsService.eventDetails.emit();
  }

  sortData(sort: Sort) {

    this.card.beaconLines = this.card.beaconLines.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'url':
          return compare(a.url, b.url, isAsc);
        case 'occurrances':
          return compare(a.occurrances, b.occurrances, isAsc);
        default:
          return 0;
      }
    });
  }
  setEvaluation(line:BeaconLine, status:Status){
    line.status = status;
    this.cardService.update(this.card);
  }

}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}