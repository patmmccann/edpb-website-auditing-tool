import { Component, OnInit,Input } from '@angular/core';
import { viewContext } from 'src/app/models/card.model';
import { UnsafeForm, UnsafeFormsCard } from 'src/app/models/cards/unsafe-forms-card.model';
import { Status } from 'src/app/models/evaluation.model';
import { CardService } from 'src/app/services/card.service';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'app-unsafe-form-card',
  templateUrl: './unsafe-form-card.component.html',
  styleUrls: ['./unsafe-form-card.component.scss']
})
export class UnsafeFormCardComponent implements OnInit {
  @Input() card: UnsafeFormsCard = new UnsafeFormsCard([]);
  @Input() context: viewContext = 'evaluate';

  constructor(
    private cardService : CardService
  ) { }

  ngOnInit(): void {
  }

  sortData(sort: Sort) {
    this.card.unsafeForms = this.card.unsafeForms.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id':
          return compare(a.id, b.id, isAsc);
        case 'method':
          return compare(a.method, b.method, isAsc);
        case 'action':
          return compare(a.action, b.action, isAsc);
        case 'evaluation':
            return compare(a.status, b.status, isAsc);
        default:
          return 0;
      }
    });
  }
  setEvaluation(line:UnsafeForm, status:Status){
    line.status = status;
    this.cardService.update(this.card);
  }

}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}