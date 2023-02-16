import { Component, OnInit,Input } from '@angular/core';
import { TrafficCard } from 'src/app/models/cards/traffic-card.model';
import { viewContext } from 'src/app/models/card.model';
import { Sort } from '@angular/material/sort';
import { CardService } from 'src/app/services/card.service';

@Component({
  selector: 'app-traffic-card',
  templateUrl: './traffic-card.component.html',
  styleUrls: ['./traffic-card.component.scss']
})
export class TrafficCardComponent implements OnInit {

  @Input() card: TrafficCard = new TrafficCard(null);
  @Input() context: viewContext = 'evaluate';

  JSON:any = null;

  constructor(
    private cardService : CardService
  ) { }

  ngOnInit(): void {
    this.JSON = JSON;
  }


  sortData(sort: Sort) {
    this.card.requests['thirdParty'] = this.card.requests['thirdParty'].sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'domain':
          return compare(a, b, isAsc);
        default:
          return 0;
      }
    });
  }
/*
  setEvaluation(line:CookieLine, status:Status){
    line.status = status;
    this.cardService.update(this.card);
  }*/

}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}