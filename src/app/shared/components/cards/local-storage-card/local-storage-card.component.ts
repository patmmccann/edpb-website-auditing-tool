/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { viewContext } from 'src/app/models/card.model';
import { LocalStorageCard} from 'src/app/models/cards/local-storage-card.model';
import { LocalStorageLine } from 'src/app/models/cards/local-storage-card.model';
import { DetailsService } from 'src/app/services/details.service';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';
import { MatSort,Sort } from '@angular/material/sort';
import { Status } from 'src/app/models/evaluation.model';
import { CardService } from 'src/app/services/card.service';

@Component({
  selector: 'app-local-storage-card',
  templateUrl: './local-storage-card.component.html',
  styleUrls: ['./local-storage-card.component.scss']
})
export class LocalStorageCardComponent implements OnInit {
  @ViewChild('tableContent') tableContent: ElementRef = new ElementRef({});
  
  @Input() card: LocalStorageCard = new LocalStorageCard("");
  @Input() context: viewContext = 'evaluate';
  @Input() searchStatus :Status[]= [];
  @Input() searchLocalStorage = {};

  constructor(
    private cardService:CardService,
    private knowledgeBaseService: KnowledgeBaseService,
    private detailsService:DetailsService
  ) { }

  ngOnInit(): void {
    
  }

  selected(line : LocalStorageLine):void{
    this.knowledgeBaseService.search(line,'localstorage');
    this.detailsService.detailsData = line;
    this.detailsService.eventDetails.emit();
  }

  sortData(sort: Sort) {
    let category : string[] = [];
    if(sort.active == 'category'){
      const row_contents = this.tableContent.nativeElement.rows;
      const category_idx = 2;
      for (var r = 0, n = row_contents.length; r < n; r++) {
        category.push(row_contents[r].cells[category_idx].innerHTML);
      }
    }

    this.card.localStorageLines = this.card.localStorageLines.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'host':
          return compare(a.host, b.host, isAsc);
        case 'key':
          return compare(a.key, b.key, isAsc);
        case 'evaluation':
            return compare(a.status, b.status, isAsc);
        case 'category':
            const a_idx = this.card.localStorageLines.indexOf(a);
            const b_idx = this.card.localStorageLines.indexOf(b);
            return compare(category[a_idx], category[b_idx], isAsc);
        default:
          return 0;
      }
    });
  }

  setEvaluation(line:LocalStorageLine, status:Status){
    line.status = status;
    this.cardService.update(this.card);
  }

}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}