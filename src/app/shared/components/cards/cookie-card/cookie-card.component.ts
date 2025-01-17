/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { viewContext } from 'src/app/models/card.model';
import { CookieCard } from 'src/app/models/cards/cookie-card.model';
import { CookieLine } from 'src/app/models/cards/cookie-card.model';
import { DetailsService } from 'src/app/services/details.service';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';
import { MatSort, Sort, MatSortHeader } from '@angular/material/sort';
import { Status } from 'src/app/models/evaluation.model';
import { CardService } from 'src/app/services/card.service';
import { NgIf, NgFor, NgClass, AsyncPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FilterForStatus, FilterForCookie, FilterForCookieKnowledge } from '../../../../pipes/filters.pipe';
import { SafeHtmlPipe } from '../../../../pipes/tools.pipe';
import { FindPurpose } from '../../../../pipes/knowledges.pipe';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-cookie-card',
    templateUrl: './cookie-card.component.html',
    styleUrls: ['./cookie-card.component.scss'],
    imports: [MatButtonModule, NgIf, MatSort, MatSortHeader, NgFor, MatIconModule, NgClass, AsyncPipe, TranslateModule, FilterForStatus, FilterForCookie, FilterForCookieKnowledge, SafeHtmlPipe, FindPurpose]
})
export class CookieCardComponent implements OnInit {
  @ViewChild('tableContent') tableContent: ElementRef = new ElementRef({});
  
  @Input() card: CookieCard = new CookieCard("");
  @Input() context: viewContext = 'evaluate';
  @Input() searchStatus :Status[]= [];
  @Input() searchCookie = {};
  @Input() searchKnowledge = {
    searchKnowledge : [],
    searchCategory : []
  };
  category:string[]= [];

  constructor(
    private cardService : CardService,
    private knowledgeBaseService: KnowledgeBaseService,
    private detailsService:DetailsService
  ) { 
    
  }
  
  ngOnInit(): void {

  }

  selected(line : CookieLine):void{
    this.knowledgeBaseService.search(line,'cookie');
    this.detailsService.detailsData = line;
    this.detailsService.eventDetails.emit();
  }

  sortData(sort: Sort) {
    let category : string[] = [];
    if(sort.active == 'category'){
      const row_contents = this.tableContent.nativeElement.rows;
      const category_idx = 2;
      for (var r = 0, n = row_contents.length; r < n; r++) {
        const test = row_contents[r].cells[category_idx].innerHTML;
        category.push(row_contents[r].cells[category_idx].innerHTML);
      }
    }

    this.card.cookieLines = this.card.cookieLines.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'domain':
          return compare(a.domain, b.domain, isAsc);
        case 'name':
          return compare(a.name, b.name, isAsc);
        case 'expiresDays':
          return compare(a.expiresDays, b.expiresDays, isAsc);
        case 'evaluation':
            return compare(a.status, b.status, isAsc);
        case 'category':
            const a_idx = this.card.cookieLines.indexOf(a);
            const b_idx = this.card.cookieLines.indexOf(b);
            return compare(category[a_idx], category[b_idx], isAsc);
        default:
          return 0;
      }
    });
  }
  setEvaluation(line:CookieLine, status:Status){
    line.status = status;
    this.cardService.update(this.card);
  }

}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}